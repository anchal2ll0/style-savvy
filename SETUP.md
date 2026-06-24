# Atelier — Setup Guide

AI Fashion Assistant.

**Stack:**
- **Auth + Database** → Firebase (Authentication + Firestore)
- **Image storage** → Cloudinary (free tier, 25 GB)
- **AI** → xAI Grok (`grok-2-vision-1212`)

You only fill `.env`. Nothing else to change.

---

## 1. Firebase (Auth + Firestore) — 5 minutes

1. Go to **https://console.firebase.google.com** → **Add project** → name it (e.g. `atelier-fashion`). Disable Google Analytics if you want (not needed).
2. In the new project enable:
   - **Build → Authentication → Get started → Sign-in method → Email/Password** → toggle **ON** → Save.
   - **Build → Firestore Database → Create database** → **Production mode** → pick a region close to you.
3. Click the **gear icon → Project settings → General**. Scroll to **Your apps** → click **`</>`** (Web) → register an app (any nickname, skip hosting). Copy the 6 config values.

### 1a. Paste into `.env`

```env
VITE_FIREBASE_API_KEY="AIza..."
VITE_FIREBASE_AUTH_DOMAIN="atelier-fashion.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="atelier-fashion"
VITE_FIREBASE_STORAGE_BUCKET="atelier-fashion.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
VITE_FIREBASE_APP_ID="1:1234...:web:abcd..."
```

> These `VITE_*` values are public by design — security comes from Firestore rules below, not from hiding them.

### 1b. Publish Firestore rules

Open **Firestore → Rules** tab → replace whatever is there with the contents of `firestore.rules` (in this repo) → **Publish**.

Without this step every query fails with "Missing or insufficient permissions".

> **Storage rules are NOT needed.** We don't use Firebase Storage — images live in Cloudinary.

---

## 2. Cloudinary (image storage) — 3 minutes

1. Sign up free at **https://cloudinary.com/users/register_free**.
2. After login, the dashboard shows your **Cloud name** (e.g. `dxyz1234a`). Copy it.
3. Go to **Settings (gear icon) → Upload → Upload presets** tab → **Add upload preset**.
   - **Signing Mode:** **Unsigned** ← important
   - **Preset name:** anything, e.g. `atelier_unsigned`
   - (Optional) **Folder:** leave blank — the app sets folders per user.
   - Save.
4. Paste into `.env`:

```env
VITE_CLOUDINARY_CLOUD_NAME="dxyz1234a"
VITE_CLOUDINARY_UPLOAD_PRESET="atelier_unsigned"
```

> Free tier = 25 GB storage + 25 GB monthly bandwidth. Plenty for personal use. No credit card required.

---

## 3. Grok (xAI) — 1 minute

1. Go to **https://console.x.ai** → sign up → **API Keys** → **Create API Key**.
2. Paste into `.env`:

```env
GROK_API_KEY="xai-..."
```

> Server-only — never sent to the browser. Model: `grok-2-vision-1212` (vision + text).

---

## 4. Run locally

```bash
bun install
bun run dev
```

Open **http://localhost:8080** → create an account → upload clothes → generate outfits.

---

## 5. Deploy to Render

1. Push to GitHub.
2. Render → **New → Web Service** → connect the repo.
3. **Build command:** `bun install && bun run build`
4. **Start command:** `bun run start`
5. **Environment** tab → add all 9 keys from `.env`:
   - `GROK_API_KEY`
   - 6 × `VITE_FIREBASE_*`
   - `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`
6. After first deploy, copy the Render URL (e.g. `atelier.onrender.com`) → **Firebase Console → Authentication → Settings → Authorized domains → Add domain** → paste it.

---

## Project structure

| Path | Purpose |
|---|---|
| `src/lib/firebase.ts` | Firebase init (Auth + Firestore only) |
| `src/lib/auth-context.tsx` | `useAuth()` hook |
| `src/lib/firestore.ts` | All Firestore CRUD (wardrobe, outfits, saved) |
| `src/lib/storage.ts` | Cloudinary upload helpers |
| `src/lib/grok.functions.ts` | Server functions calling Grok (categorize + recommend) |
| `src/routes/auth.tsx` | Email/password sign in/up |
| `src/routes/_authenticated/*` | Protected pages |
| `firestore.rules` | Per-user data isolation (publish in Firebase console) |

---

## Troubleshooting

- **"Firebase config missing"** → fill the 6 `VITE_FIREBASE_*` values and restart `bun run dev`.
- **"Cloudinary config missing"** → fill `VITE_CLOUDINARY_*` and restart.
- **"Missing or insufficient permissions"** → you didn't publish `firestore.rules`. Do step 1b.
- **Cloudinary "Upload preset must be whitelisted for unsigned uploads"** → in Cloudinary settings, edit the preset and set **Signing Mode = Unsigned**.
- **"GROK_API_KEY is not set"** → add it to `.env`, restart dev server.
- **Grok returns invalid JSON sometimes** → just click "Generate" again. Vision models occasionally need a retry.
- **Render: env vars not picked up** → every `VITE_*` must be added explicitly in Render's Environment tab. Trigger a manual redeploy after adding.
- **Login works locally but fails on Render** → add the Render domain to Firebase Authorized domains (step 5.6).
