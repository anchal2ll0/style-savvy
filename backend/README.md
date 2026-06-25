# Atelier Backend (Node.js + Express + MongoDB)

```bash
cd backend
cp .env.example .env   # fill MONGODB_URI, JWT_SECRET, GROK_API_KEY
npm install            # or: bun install
npm run dev            # starts http://localhost:5000
```

Routes (all under `/api`):

- `POST /auth/signup` `{ email, password, displayName }` → `{ token, user }`
- `POST /auth/login`  `{ email, password }` → `{ token, user }`
- `GET  /auth/me`     (Bearer) → `{ user }`
- `GET  /wardrobe`            (Bearer)
- `POST /wardrobe`            (Bearer) `{ image_path, name, category, color, description }`
- `DELETE /wardrobe/:id`      (Bearer)
- `POST /wardrobe/bump-use`   (Bearer) `{ ids: string[] }`
- `GET  /wardrobe/stats`      (Bearer)
- `POST /wardrobe/recommendations` (Bearer)
- `GET  /saved` / `POST /saved` / `DELETE /saved/:id` / `GET /saved/count`
- `POST /grok/categorize`     (Bearer) `{ imageDataUrl }`
- `POST /grok/recommend`      (Bearer) `{ occasion, mood, weather, currentImageDataUrl?, wardrobe }`
