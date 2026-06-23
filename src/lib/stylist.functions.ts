import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const MODEL = "google/gemini-3-flash-preview";

/** Categorize a clothing item from an uploaded image (data URL). */
export const categorizeWardrobeItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ imageDataUrl: z.string().min(20) }).parse(d),
  )
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);

    const { experimental_output } = await generateText({
      model: gateway(MODEL),
      experimental_output: Output.object({
        schema: z.object({
          name: z.string().describe("Short 2-4 word name, e.g. 'White linen shirt'"),
          category: z.enum([
            "shirt", "top", "tshirt", "jeans", "trousers", "shorts",
            "dress", "skirt", "outerwear", "shoes", "accessory", "other",
          ]),
          color: z.string().describe("Dominant color in plain English"),
          description: z.string().describe("One-sentence styling description"),
        }),
      }),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Identify this clothing item. Return name, category, dominant color, and a one-sentence stylist note." },
            { type: "image", image: data.imageDataUrl } as never,
          ],
        },
      ],
    });

    return experimental_output;
  });

/** Generate outfit recommendations from wardrobe + optional current photo. */
export const generateOutfitRecommendations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      occasion: z.string().min(1),
      mood: z.string().optional(),
      weather: z.string().optional(),
      currentImageDataUrl: z.string().optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const { supabase, userId } = context;
    const { data: items, error } = await supabase
      .from("wardrobe_items")
      .select("id,name,category,color,description")
      .eq("user_id", userId);
    if (error) throw error;
    if (!items || items.length < 2) {
      throw new Error("Add at least 2 wardrobe items before generating outfits.");
    }

    const wardrobeText = items
      .map((i) => `- [${i.id}] ${i.name ?? "item"} | ${i.category} | ${i.color ?? "n/a"} | ${i.description ?? ""}`)
      .join("\n");

    const gateway = createLovableAiGatewayProvider(key);

    const sys = `You are an agentic AI personal stylist combining five specialist agents:
1) Wardrobe Agent — only use the items provided (reference by id).
2) Image Agent — if a current photo is given, infer skin tone, body shape cues, current outfit fit.
3) Styling Agent — build cohesive outfits (top + bottom + shoes minimum; add outerwear/accessories when relevant).
4) Trend Agent — apply tasteful current fashion sensibilities.
5) Shopping Agent — if the wardrobe is missing a key piece for the occasion, flag it.
Return exactly 3 distinct outfit options, ranked by overall fit for the occasion. Be specific and confident.`;

    const userText = `Occasion: ${data.occasion}
Mood: ${data.mood ?? "neutral"}
Weather: ${data.weather ?? "moderate"}

Wardrobe (id | name | category | color | note):
${wardrobeText}

Use ONLY item ids that appear above. Score each outfit 1-100.`;

    type Content =
      | { type: "text"; text: string }
      | { type: "image"; image: string };
    const content: Content[] = [{ type: "text", text: userText }];
    if (data.currentImageDataUrl) {
      content.push({ type: "image", image: data.currentImageDataUrl });
    }

    const { experimental_output } = await generateText({
      model: gateway(MODEL),
      system: sys,
      experimental_output: Output.object({
        schema: z.object({
          analysis: z.string().describe("Brief 1-2 sentence reading of the user/occasion"),
          outfits: z.array(z.object({
            title: z.string(),
            item_ids: z.array(z.string()).min(2),
            reasoning: z.string(),
            score: z.number().int().min(1).max(100),
            styling_tips: z.string(),
          })).length(3),
          missing_pieces: z.array(z.object({
            piece: z.string(),
            why: z.string(),
          })),
        }),
      }),
      messages: [{ role: "user", content: content as never }],
    });

    // Persist
    const { data: rec, error: insertErr } = await supabase
      .from("outfit_recommendations")
      .insert({
        user_id: userId,
        occasion: data.occasion,
        mood: data.mood ?? null,
        weather: data.weather ?? null,
        recommendations: experimental_output as never,
      })
      .select("id")
      .single();
    if (insertErr) throw insertErr;

    // Bump use counts for referenced items
    const usedIds = Array.from(new Set(experimental_output.outfits.flatMap((o) => o.item_ids)));
    if (usedIds.length) {
      for (const id of usedIds) {
        await supabase.rpc("noop").catch(() => {});
      }
      // Use a single update — increment via select+update loop (small list)
      const { data: existing } = await supabase
        .from("wardrobe_items")
        .select("id,use_count")
        .in("id", usedIds);
      if (existing) {
        await Promise.all(
          existing.map((e) =>
            supabase
              .from("wardrobe_items")
              .update({ use_count: (e.use_count ?? 0) + 1 })
              .eq("id", e.id),
          ),
        );
      }
    }

    return { id: rec.id, ...experimental_output };
  });
