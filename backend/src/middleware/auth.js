import jwt from "jsonwebtoken";

export function requireAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next(Object.assign(new Error("Missing token"), { status: 401 }));
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not configured");
    const payload = jwt.verify(token, secret);
    req.userId = payload.sub;
    next();
  } catch {
    next(Object.assign(new Error("Invalid token"), { status: 401 }));
  }
}

export function signToken(userId) {
  return jwt.sign({ sub: String(userId) }, process.env.JWT_SECRET, { expiresIn: "30d" });
}
