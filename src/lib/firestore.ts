// Replaces the old firestore.ts — same exports, MongoDB-backed via REST API.
import { api } from "./api";

export type WardrobeItem = {
  id: string;
  user_id: string;
  image_path: string;
  name: string | null;
  category: string;
  color: string | null;
  description: string | null;
  use_count: number;
  created_at: string | null;
};

export type OutfitRec = {
  analysis: string;
  outfits: { title: string; item_ids: string[]; reasoning: string; score: number; styling_tips: string }[];
  missing_pieces: { piece: string; why: string }[];
};

export type SavedOutfit = {
  id: string;
  user_id: string;
  title: string;
  item_ids: string[];
  reasoning: string | null;
  score: number | null;
  occasion: string | null;
  created_at: string | null;
};

export function listWardrobe(_uid: string) {
  return api<WardrobeItem[]>("/api/wardrobe");
}

export function addWardrobeItem(
  _uid: string,
  data: { image_path: string; name: string; category: string; color: string | null; description: string | null },
) {
  return api<WardrobeItem>("/api/wardrobe", { method: "POST", body: data });
}

export function deleteWardrobeItem(id: string) {
  return api(`/api/wardrobe/${id}`, { method: "DELETE" });
}

export function bumpUseCounts(ids: string[]) {
  return api("/api/wardrobe/bump-use", { method: "POST", body: { ids } });
}

export function recordRecommendation(
  _uid: string,
  payload: { occasion: string; mood: string | null; weather: string | null; result: OutfitRec },
) {
  return api("/api/wardrobe/recommendations", { method: "POST", body: payload });
}

export function listSaved(_uid: string) {
  return api<SavedOutfit[]>("/api/saved");
}

export function saveOutfit(
  _uid: string,
  data: { title: string; item_ids: string[]; reasoning: string | null; score: number | null; occasion: string | null },
) {
  return api<SavedOutfit>("/api/saved", { method: "POST", body: data });
}

export function deleteSaved(id: string) {
  return api(`/api/saved/${id}`, { method: "DELETE" });
}

export async function countDocs(name: string, _uid: string): Promise<number> {
  if (name === "saved_outfits") {
    const { count } = await api<{ count: number }>("/api/saved/count");
    return count;
  }
  if (name === "outfit_recommendations") {
    const { recs } = await api<{ items: number; categories: number; recs: number }>("/api/wardrobe/stats");
    return recs;
  }
  return 0;
}

export async function countWardrobe(_uid: string): Promise<{ items: number; categories: number }> {
  const { items, categories } = await api<{ items: number; categories: number; recs: number }>(
    "/api/wardrobe/stats",
  );
  return { items, categories };
}
