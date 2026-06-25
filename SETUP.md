# Atelier — Setup Guide

AI Fashion Assistant • Frontend (TanStack Start + React) + Backend (Node.js + Express + MongoDB) + Cloudinary (images) + Grok (xAI) for the agentic stylist.

---

## 1. Prerequisites

- **Node.js 20+** and **npm** (or **bun**)
- **MongoDB Atlas** free cluster — https://www.mongodb.com/cloud/atlas (or local `mongod`)
- **Cloudinary** account — https://cloudinary.com (free tier, used for storing wardrobe photos)
- **xAI Grok API key** — https://console.x.ai (model: `grok-2-vision-1212`)

---

## 2. Get your keys

### MongoDB Atlas
1. Create a free cluster → **Database Access** → add a user (username + password).
2. **Network Access** → "Allow access from anywhere" (`0.0.0.0/0`) for dev.
3. **Connect → Drivers** → copy the connection string. Replace `<password>` and add a DB name, e.g.
   `mongodb+srv://atelier:YOURPASS@cluster0.xxxx.mongodb.net/atelier?retryWrites=true&w=majority`

### Cloudinary
1. Dashboard → copy your **Cloud name**.
2. **Settings → Upload → Upload presets → Add upload preset**.
3. Set **Signing Mode = Unsigned**, save, and copy the **preset name**.

### Grok (xAI)
1. Sign in at https://console.x.ai, create an **API key**.

### JWT secret
Any long random string (32+ chars). Generate one:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## 3. Backend (`backend/`)

```bash
cd backend
cp .env.example .env
```

Fill `backend/.env`:
```env
PORT=5000
CORS_ORIGIN=http://localhost:8080
MONGODB_URI=mongodb+srv://atelier:...mongodb.net/atelier?retryWrites=true&w=majority
JWT_SECRET=paste-your-long-random-string
GROK_API_KEY=xai-...
```

Install + run:
```bash
npm install
npm run dev    # http://localhost:5000  (try GET /api/health)
```

---

## 4. Frontend (root)

Fill the root `.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-unsigned-preset
```

Install + run (from project root):
```bash
npm install
npm run dev    # http://localhost:8080
```

Open http://localhost:8080 → **Get started** → create an account → add a few wardrobe photos → go to **Stylist**, pick an occasion (optionally upload a current selfie) and get recommendations.

---

## 5. Verify everything works

1. `GET http://localhost:5000/api/health` → `{ "ok": true }`
2. Sign up in the UI — refresh; you should stay logged in (JWT in `localStorage`).
3. Upload a wardrobe item — image lands in Cloudinary, the document is created in MongoDB (`wardrobeitems` collection).
4. Run Stylist — backend hits Grok, returns 3 outfits, you can save one.

---

## 6. Deploy

### Backend → Render (Web Service)
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment:** `MONGODB_URI`, `JWT_SECRET`, `GROK_API_KEY`, `CORS_ORIGIN=https://your-frontend.onrender.com`

### Frontend → Render (Static / Node — TanStack Start)
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Environment:** `VITE_API_URL=https://your-backend.onrender.com`, `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`

After backend deploys, update its `CORS_ORIGIN` env to the deployed frontend URL and redeploy.

---

## 7. Common issues

| Symptom | Fix |
|---|---|
| `VITE_API_URL is not set` warning | Add it to `.env` and restart `npm run dev`. |
| `CORS` error in browser | Set `CORS_ORIGIN` in `backend/.env` to your frontend origin (no trailing slash). |
| `Invalid token` after restart | Token persists in `localStorage`; click **Sign out** and log back in. |
| `Cloudinary upload failed` | Confirm the upload preset is set to **Unsigned**. |
| `Grok API 401` | Re-check `GROK_API_KEY` in `backend/.env`. |
| `MONGODB_URI is not set` | Backend `.env` missing or backend started without loading it. |
