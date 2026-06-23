# AI Fashion Assistant — Build Plan

A professional, English-language, agentic AI personal stylist. Users upload wardrobe items + a current photo, pick an occasion, and receive curated outfit recommendations powered by Gemini.

## Stack (auto-provisioned, no setup from you)

- **Frontend:** TanStack Start + React + Tailwind v4 (already set up)
- **Auth + Database + Storage:** Lovable Cloud (Supabase under the hood — replaces Firebase)
- **AI:** Lovable AI Gateway with `google/gemini-3-flash-preview` (vision + text) — replaces direct Gemini API
- **No `.env` setup needed.** No secrets for you to add. Everything is automatic.

## Pages & Flow

```text
/                  Landing page (hero, features, CTA)
/auth              Sign up / Log in (email + password)
/_authenticated/
  dashboard        Overview + daily suggestion + quick actions
  wardrobe         Upload, view, categorize, delete clothing items
  stylist          Pick occasion + upload current photo → AI outfit recommendation
  saved            Saved favorite outfits
  insights         Most-used / rarely-used items
```

## Features

1. **Auth** — email/password via Lovable Cloud; protected app routes under `_authenticated`.
2. **Digital Wardrobe** — upload clothing photos to storage; auto-categorize using Gemini vision (shirt, top, jeans, dress, shoes, accessory, outerwear); grid view with category filters and delete.
3. **AI Stylist (agentic flow)** — single server function orchestrating 5 logical agents in one Gemini call with structured output:
   - Wardrobe Agent (reads user's items from DB)
   - Image Agent (analyzes uploaded current photo: skin tone, body type cues, current outfit)
   - Styling Agent (combines items into outfits)
   - Trend Agent (applies current trend guidance)
   - Shopping Agent (flags missing pieces)
   Returns 3 ranked outfit recommendations with reasoning, score, and missing-item suggestions.
4. **Occasion picker** — Office, Party, College, Wedding, Travel, Casual, Festival + mood + weather.
5. **Save outfits** — heart icon stores recommendation to `saved_outfits`.
6. **Insights** — usage counts per wardrobe item.

## Database (Lovable Cloud / Postgres)

- `profiles` (id, name, email, avatar_url)
- `wardrobe_items` (id, user_id, image_url, category, color, name, created_at, use_count)
- `outfit_recommendations` (id, user_id, occasion, mood, current_image_url, recommendations jsonb, created_at)
- `saved_outfits` (id, user_id, recommendation_id, item_ids[], title, created_at)

RLS: every table scoped to `auth.uid()`. Storage buckets: `wardrobe` (private) and `current-photos` (private), signed URLs for display.

## Design

Fashion-magazine aesthetic — soft cream background, deep charcoal text, single accent (warm terracotta/rose), elegant serif display font (Fraunces) + clean sans body (Inter). Generous spacing, large product imagery, no purple/generic-AI look.

## Build order

1. Enable Lovable Cloud → tables, RLS, storage buckets, auth.
2. Design system in `src/styles.css` (tokens, fonts via root `<link>`, button/card variants).
3. Auth page + `_authenticated` layout guard.
4. Landing page.
5. Wardrobe upload + grid + Gemini auto-categorization server function.
6. Stylist page + agentic recommendation server function (structured output).
7. Saved outfits + insights.
8. Polish, SEO meta per route, sitemap.

## What you'll see at the end

- Fully clickable app with working image uploads
- Real AI responses after you upload your photo + wardrobe items
- No secrets to add, no `.env` to edit
- I'll verify everything compiles and the build is green before handing back

After approval I'll build it end-to-end in one go.
