import {
  collection, doc, addDoc, deleteDoc, getDocs, query, where, orderBy,
  serverTimestamp, updateDoc, increment, Timestamp,
} from "firebase/firestore";
import { getDb } from "./firebase";

export type WardrobeItem = {
  id: string;
  user_id: string;
  image_path: string;
  name: string | null;
  category: string;
  color: string | null;
  description: string | null;
  use_count: number;
  created_at: Timestamp | null;
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
  created_at: Timestamp | null;
};

export async function listWardrobe(uid: string): Promise<WardrobeItem[]> {
  const q = query(
    collection(getDb(), "wardrobe_items"),
    where("user_id", "==", uid),
    orderBy("created_at", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WardrobeItem, "id">) }));
}

export async function addWardrobeItem(uid: string, data: {
  image_path: string; name: string; category: string; color: string | null; description: string | null;
}) {
  return addDoc(collection(getDb(), "wardrobe_items"), {
    user_id: uid,
    image_path: data.image_path,
    name: data.name,
    category: data.category,
    color: data.color,
    description: data.description,
    use_count: 0,
    created_at: serverTimestamp(),
  });
}

export async function deleteWardrobeItem(id: string) {
  await deleteDoc(doc(getDb(), "wardrobe_items", id));
}

export async function bumpUseCounts(ids: string[]) {
  await Promise.all(
    ids.map((id) => updateDoc(doc(getDb(), "wardrobe_items", id), { use_count: increment(1) })),
  );
}

export async function recordRecommendation(uid: string, payload: {
  occasion: string; mood: string | null; weather: string | null; result: OutfitRec;
}) {
  return addDoc(collection(getDb(), "outfit_recommendations"), {
    user_id: uid,
    occasion: payload.occasion,
    mood: payload.mood,
    weather: payload.weather,
    result: payload.result,
    created_at: serverTimestamp(),
  });
}

export async function listSaved(uid: string): Promise<SavedOutfit[]> {
  const q = query(
    collection(getDb(), "saved_outfits"),
    where("user_id", "==", uid),
    orderBy("created_at", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SavedOutfit, "id">) }));
}

export async function saveOutfit(uid: string, data: {
  title: string; item_ids: string[]; reasoning: string | null; score: number | null; occasion: string | null;
}) {
  return addDoc(collection(getDb(), "saved_outfits"), {
    user_id: uid,
    ...data,
    created_at: serverTimestamp(),
  });
}

export async function deleteSaved(id: string) {
  await deleteDoc(doc(getDb(), "saved_outfits", id));
}

export async function countDocs(name: string, uid: string): Promise<number> {
  const q = query(collection(getDb(), name), where("user_id", "==", uid));
  const snap = await getDocs(q);
  return snap.size;
}

export async function countWardrobe(uid: string): Promise<{ items: number; categories: number }> {
  const q = query(collection(getDb(), "wardrobe_items"), where("user_id", "==", uid));
  const snap = await getDocs(q);
  const cats = new Set(snap.docs.map((d) => (d.data() as { category: string }).category));
  return { items: snap.size, categories: cats.size };
}
