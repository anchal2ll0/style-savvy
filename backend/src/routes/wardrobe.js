import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { WardrobeItem } from "../models/WardrobeItem.js";
import { Recommendation } from "../models/Recommendation.js";

const r = Router();
r.use(requireAuth);

function toDTO(i) {
  return {
    id: String(i._id),
    user_id: String(i.user_id),
    image_path: i.image_path,
    name: i.name,
    category: i.category,
    color: i.color,
    description: i.description,
    use_count: i.use_count,
    created_at: i.created_at,
  };
}

r.get("/", async (req, res, next) => {
  try {
    const items = await WardrobeItem.find({ user_id: req.userId }).sort({ created_at: -1 });
    res.json(items.map(toDTO));
  } catch (e) { next(e); }
});

r.post("/", async (req, res, next) => {
  try {
    const { image_path, name, category, color, description } = req.body || {};
    if (!image_path || !category) return res.status(400).json({ error: "image_path + category required" });
    const item = await WardrobeItem.create({
      user_id: req.userId, image_path, name, category, color, description,
    });
    res.json(toDTO(item));
  } catch (e) { next(e); }
});

r.delete("/:id", async (req, res, next) => {
  try {
    await WardrobeItem.deleteOne({ _id: req.params.id, user_id: req.userId });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

r.post("/bump-use", async (req, res, next) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
    if (ids.length) {
      await WardrobeItem.updateMany(
        { _id: { $in: ids }, user_id: req.userId },
        { $inc: { use_count: 1 } },
      );
    }
    res.json({ ok: true });
  } catch (e) { next(e); }
});

r.get("/stats", async (req, res, next) => {
  try {
    const items = await WardrobeItem.find({ user_id: req.userId }, { category: 1 });
    const recs = await Recommendation.countDocuments({ user_id: req.userId });
    const cats = new Set(items.map((i) => i.category));
    res.json({ items: items.length, categories: cats.size, recs });
  } catch (e) { next(e); }
});

r.post("/recommendations", async (req, res, next) => {
  try {
    const { occasion, mood, weather, result } = req.body || {};
    await Recommendation.create({ user_id: req.userId, occasion, mood, weather, result });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default r;
