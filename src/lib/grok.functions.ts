import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GROK_URL = "https://api.x.ai/v1/chat/completions";
const MODEL = "grok-2-vision-1212";

async function callGrok(body: Record<string, unknown>): Promise<string> {
  const key = process.env.GROK_API_KEY;
  if (!key) throw new Error("GROK_API_KEY is not set on the server. Add it to .env");
  const res = await fetch(GROK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: MODEL, ...body }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Grok API ${res.status}: ${text.slice(0, 300)}`);
  }
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return json.choices?.[0]?.message?.content ?? "";
}

function extractJson(s: string): unknown {
  const fenced = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : s;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Model did not return JSON");
  return JSON.parse(raw.slice(start, end + 1));
}

const CategorizeSchema = z.object({
  name: z.string(),
  category: z.enum(["shirt","top","tshirt","jeans","trousers","shorts","dress","skirt","outerwear","shoes","accessory","other"]),
  color: z.string(),
  description: z.string(),
});

export const categorizeItem = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ imageDataUrl: z.string().min(20) }).parse(d))
  .handler(async ({ data }) => {
    const content = await callGrok({
      response_format: { type: "json_object" },
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You identify clothing items. Reply with strict JSON: {\"name\":string (2-4 words),\"category\":one of shirt|top|tshirt|jeans|trousers|shorts|dress|skirt|outerwear|shoes|accessory|other,\"color\":string,\"description\":string}. No prose.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Identify this clothing item." },
            { type: "image_url", image_url: { url: data.imageDataUrl } },
          ],
        },
      ],
    });
    return CategorizeSchema.parse(extractJson(content));
  });

const OutfitSchema = z.object({
  analysis: z.string(),
  outfits: z.array(z.object({
    title: z.string(),
    item_ids: z.array(z.string()).min(2),
    reasoning: z.string(),
    score: z.number().int(),
    styling_tips: z.string(),
  })).min(1),
  missing_pieces: z.array(z.object({ piece: z.string(), why: z.string() })).default([]),
});

export const recommendOutfits = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      occasion: z.string().min(1),
      mood: z.string().optional(),
      weather: z.string().optional(),
      currentImageDataUrl: z.string().optional(),
      wardrobe: z.array(z.object({
        id: z.string(),
        name: z.string().nullable(),
        category: z.string(),
        color: z.string().nullable(),
        description: z.string().nullable(),
      })).min(2),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const wardrobeText = data.wardrobe
      .map((i) => `- [${i.id}] ${i.name ?? "item"} | ${i.category} | ${i.color ?? "n/a"} | ${i.description ?? ""}`)
      .join("\n");

    const sys = `You are an agentic AI personal stylist combining five specialist agents:
1) Wardrobe Agent — use only items provided (reference by id).
2) Image Agent — if a photo is given, infer skin tone, body shape cues, fit.
3) Styling Agent — build cohesive outfits (top + bottom + shoes minimum).
4) Trend Agent — apply tasteful current fashion sensibilities.
5) Shopping Agent — flag any key missing piece for the occasion.
Return exactly 3 distinct outfits ranked by fit for the occasion.
Reply with strict JSON ONLY in this shape:
{"analysis":string,"outfits":[{"title":string,"item_ids":[string,...],"reasoning":string,"score":1-100,"styling_tips":string}],"missing_pieces":[{"piece":string,"why":string}]}
Use ONLY ids that appear in the wardrobe list. No prose outside JSON.`;

    const userText = `Occasion: ${data.occasion}
Mood: ${data.mood ?? "neutral"}
Weather: ${data.weather ?? "moderate"}

Wardrobe (id | name | category | color | note):
${wardrobeText}`;

    const userContent: unknown[] = [{ type: "text", text: userText }];
    if (data.currentImageDataUrl) {
      userContent.push({ type: "image_url", image_url: { url: data.currentImageDataUrl } });
    }

    const content = await callGrok({
      response_format: { type: "json_object" },
      temperature: 0.7,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: userContent },
      ],
    });

    const parsed = OutfitSchema.parse(extractJson(content));
    const validIds = new Set(data.wardrobe.map((i) => i.id));
    parsed.outfits = parsed.outfits
      .map((o) => ({ ...o, item_ids: o.item_ids.filter((id) => validIds.has(id)) }))
      .filter((o) => o.item_ids.length >= 2);
    if (!parsed.outfits.length) throw new Error("Model returned no usable outfits — try again.");
    return parsed;
  });
