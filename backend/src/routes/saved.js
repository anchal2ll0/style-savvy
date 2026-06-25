import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { SavedOutfit } from "../models/SavedOutfit.js";

const r = Router();
r.use(requireAuth);

function toDTO(o) {
  return {
    id: String(o._id),
    user_id: String(o.user_id),
    title: o.title,
    item_ids: o.item_ids,
    reasoning: o.reasoning,
    score: o.score,
    occasion: o.occasion,
    created_at: o.created_at,
  };
}

r.get("/", async (req, res, next) => {
  try {
    const items = await SavedOutfit.find({ user_id: req.userId }).sort({ created_at: -1 });
    res.json(items.map(toDTO));
  } catch (e) { next(e); }
});

r.post("/", async (req, res, next) => {
  try {
    const { title, item_ids, reasoning, score, occasion } = req.body || {};
    if (!title) return res.status(400).json({ error: "title required" });
    const o = await SavedOutfit.create({
      user_id: req.userId, title, item_ids: item_ids || [], reasoning, score, occasion,
    });
    res.json(toDTO(o));
  } catch (e) { next(e); }
});

r.delete("/:id", async (req, res, next) => {
  try {
    await SavedOutfit.deleteOne({ _id: req.params.id, user_id: req.userId });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

r.get("/count", async (req, res, next) => {
  try {
    const n = await SavedOutfit.countDocuments({ user_id: req.userId });
    res.json({ count: n });
  } catch (e) { next(e); }
});

export default r;
