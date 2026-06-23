import { supabase } from "@/integrations/supabase/client";

const signedUrlCache = new Map<string, { url: string; exp: number }>();

export async function getSignedUrl(bucket: string, path: string, expiresIn = 3600): Promise<string> {
  const cacheKey = `${bucket}/${path}`;
  const now = Date.now();
  const cached = signedUrlCache.get(cacheKey);
  if (cached && cached.exp > now + 60_000) return cached.url;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error || !data) throw error ?? new Error("Failed to sign URL");
  signedUrlCache.set(cacheKey, { url: data.signedUrl, exp: now + expiresIn * 1000 });
  return data.signedUrl;
}

export async function uploadToBucket(bucket: string, userId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "image/jpeg",
  });
  if (error) throw error;
  return path;
}

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = () => rej(r.error);
    r.readAsDataURL(file);
  });
}
