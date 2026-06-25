// Client-side wrappers around backend Grok endpoints.
// Kept as { data } -> Promise shape so callers can stay the same.
import { api } from "./api";

export async function categorizeItem({ data }: { data: { imageDataUrl: string } }) {
  return api<{ name: string; category: string; color: string; description: string }>(
    "/api/grok/categorize",
    { method: "POST", body: data },
  );
}

export async function recommendOutfits({
  data,
}: {
  data: {
    occasion: string;
    mood?: string;
    weather?: string;
    currentImageDataUrl?: string;
    wardrobe: { id: string; name: string | null; category: string; color: string | null; description: string | null }[];
  };
}) {
  return api<import("./firestore").OutfitRec>("/api/grok/recommend", { method: "POST", body: data });
}
