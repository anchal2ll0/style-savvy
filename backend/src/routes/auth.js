import { Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { requireAuth, signToken } from "../middleware/auth.js";

const r = Router();

function userDTO(u) {
  return { uid: String(u._id), email: u.email, displayName: u.display_name || "" };
}

r.post("/signup", async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body || {};
    if (!email || !password || password.length < 6) {
      return res.status(400).json({ error: "Email + password (min 6 chars) required" });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: "Email already registered" });
    const hash = await bcrypt.hash(password, 10);
    const u = await User.create({
      email: email.toLowerCase(),
      password_hash: hash,
      display_name: displayName || "",
    });
    res.json({ token: signToken(u._id), user: userDTO(u) });
  } catch (e) {
    next(e);
  }
});

r.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const u = await User.findOne({ email: (email || "").toLowerCase() });
    if (!u) return res.status(401).json({ error: "Invalid email or password" });
    const ok = await bcrypt.compare(password || "", u.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid email or password" });
    res.json({ token: signToken(u._id), user: userDTO(u) });
  } catch (e) {
    next(e);
  }
});

r.get("/me", requireAuth, async (req, res, next) => {
  try {
    const u = await User.findById(req.userId);
    if (!u) return res.status(401).json({ error: "User not found" });
    res.json({ user: userDTO(u) });
  } catch (e) {
    next(e);
  }
});

export default r;
