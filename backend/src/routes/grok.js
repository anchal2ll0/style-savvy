import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

const r = Router();
r.use(requireAuth);

const GROK_URL = "https://api.x.ai/v1/chat/completions";
const MODEL = "grok-2-vision-1212";

async function callGrok(body) {
  const key = process.env.GROK_API_KEY;
  if (!key) throw Object.assign(new Error("GROK_API_KEY not set on backend"), { status: 500 });
  const res = await fetch(GROK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: MODEL, ...body }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw Object.assign(new Error(`Grok API ${res.status}: ${text.slice(0, 300)}`), { status: 502 });
  }
  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? "";
}

function extractJson(s) {
  const fenced = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : s;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Model did not return JSON");
  return JSON.parse(raw.slice(start, end + 1));
}

r.post("/categorize", async (req, res, next) => {
  try {
    const { imageDataUrl } = req.body || {};
    if (!imageDataUrl) return res.status(400).json({ error: "imageDataUrl required" });
    const content = await callGrok({
      response_format: { type: "json_object" },
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            'You identify clothing items. Reply with strict JSON: {"name":string (2-4 words),"category":one of shirt|top|tshirt|jeans|trousers|shorts|dress|skirt|outerwear|shoes|accessory|other,"color":string,"description":string}. No prose.',
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Identify this clothing item." },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ],
        },
      ],
    });
    res.json(extractJson(content));
  } catch (e) { next(e); }
});

r.post("/recommend", async (req, res, next) => {
  try {
    const { occasion, mood, weather, currentImageDataUrl, wardrobe } = req.body || {};
    if (!occasion || !Array.isArray(wardrobe) || wardrobe.length < 2) {
      return res.status(400).json({ error: "occasion + wardrobe (min 2) required" });
    }
    const wardrobeText = wardrobe
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

    const userText = `Occasion: ${occasion}
Mood: ${mood ?? "neutral"}
Weather: ${weather ?? "moderate"}

Wardrobe (id | name | category | color | note):
${wardrobeText}`;

    const userContent = [{ type: "text", text: userText }];
    if (currentImageDataUrl) {
      userContent.push({ type: "image_url", image_url: { url: currentImageDataUrl } });
    }

    const content = await callGrok({
      response_format: { type: "json_object" },
      temperature: 0.7,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: userContent },
      ],
    });

    const parsed = extractJson(content);
    const validIds = new Set(wardrobe.map((i) => i.id));
    parsed.outfits = (parsed.outfits || [])
      .map((o) => ({ ...o, item_ids: (o.item_ids || []).filter((id) => validIds.has(id)) }))
      .filter((o) => o.item_ids.length >= 2);
    if (!parsed.outfits.length) return res.status(502).json({ error: "Model returned no usable outfits — try again." });
    parsed.missing_pieces = parsed.missing_pieces || [];
    res.json(parsed);
  } catch (e) { next(e); }
});

export default r;
