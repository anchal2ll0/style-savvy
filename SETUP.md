# Atelier — Setup Guide

AI Fashion Assistant. **Backend:** Firebase (Auth + Firestore + Storage). **AI:** xAI Grok (vision).

---

## 1. Firebase setup (5 minutes)

1. Go to **https://console.firebase.google.com** → **Add project** → name it (e.g. `atelier-fashion`).
2. In the new project, enable:
   - **Build → Authentication → Get started → Sign-in method → Email/Password** (toggle ON).
   - **Build → Firestore Database → Create database** → Start in **production mode** → pick a region.
   - **Build → Storage → Get started** → Start in **production mode** → same region.
3. Click the **gear icon → Project settings → General**. Scroll down to **Your apps** → click the **`</>`** (Web) icon → register app (any nickname). Copy the **6 config values** shown — you need them next.

### 1a. Paste Firebase config into `.env`

Open the project's `.env` file and fill in:

```env
VITE_FIREBASE_API_KEY="..."
VITE_FIREBASE_AUTH_DOMAIN="atelier-fashion.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="atelier-fashion"
VITE_FIREBASE_STORAGE_BUCKET="atelier-fashion.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="..."
VITE_FIREBASE_APP_ID="..."
```

> These `VITE_*` values are public (Firebase's standard pattern — security is enforced by rules, not by hiding the key).

### 1b. Deploy security rules

In Firebase Console:

- **Firestore → Rules** tab → paste contents of `firestore.rules` (in this repo) → **Publish**.
- **Storage → Rules** tab → paste contents of `storage.rules` → **Publish**.

Without these, the app cannot read/write data.

---

## 2. Grok (xAI) setup

1. Go to **https://console.x.ai** → sign up → **API Keys** → create a key.
2. In `.env`:

```env
GROK_API_KEY="xai-..."
```

> Server-only. Never exposed to the browser. Model used: `grok-2-vision-1212` (vision + text).

---

## 3. Run locally

```bash
bun install
bun run dev
```

Open **http://localhost:8080** → create an account → add wardrobe items → generate outfits.

---

## 4. Deploy to Render

1. Push to GitHub.
2. On Render: **New → Web Service** → connect repo.
3. Build command: `bun install && bun run build`
4. Start command: `bun run start` (already in `package.json`)
5. **Environment** tab → add all 7 keys from `.env` (the 6 `VITE_FIREBASE_*` + `GROK_API_KEY`).
6. **Add your Render URL to Firebase**: Console → Authentication → Settings → **Authorized domains** → add `your-app.onrender.com`.

---

## Project Structure

| Path | Purpose |
|---|---|
| `src/lib/firebase.ts` | Firebase init (client SDK) |
| `src/lib/auth-context.tsx` | Auth provider + `useAuth()` hook |
| `src/lib/firestore.ts` | All Firestore CRUD (wardrobe, outfits, saved) |
| `src/lib/storage.ts` | Firebase Storage uploads + download URLs |
| `src/lib/grok.functions.ts` | Server functions calling Grok API (categorize + recommend) |
| `src/routes/auth.tsx` | Email/password sign in/up |
| `src/routes/_authenticated/*` | Protected pages (dashboard, wardrobe, stylist, saved) |
| `firestore.rules` | Per-user data isolation |
| `storage.rules` | Per-user image isolation |

---

## Troubleshooting

- **"Firebase config missing"** → fill `VITE_FIREBASE_*` in `.env` and restart `bun run dev`.
- **"Missing or insufficient permissions"** → you didn't publish `firestore.rules` / `storage.rules`.
- **"GROK_API_KEY is not set"** → add it to `.env` and restart.
- **Grok returns invalid JSON occasionally** → click "Generate" again. Vision models sometimes need a retry.
- **Render: env vars not read** → in Render dashboard, every key including `VITE_*` must be added explicitly. Trigger a manual deploy after adding.
