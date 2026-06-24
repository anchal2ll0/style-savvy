// Image storage on Cloudinary (unsigned uploads).
// We store the full Cloudinary secure URL in Firestore (as `image_path`)
// so reads are just `<img src={url} />` — no signing, no extra API calls.

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

function ensureConfig() {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary config missing. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env",
    );
  }
}

export async function uploadImage(
  folder: "wardrobe" | "current-photos",
  uid: string,
  file: File,
): Promise<string> {
  ensureConfig();
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);
  form.append("folder", `atelier/${folder}/${uid}`);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: form },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary upload failed: ${text}`);
  }
  const json = (await res.json()) as { secure_url: string };
  return json.secure_url;
}

// Stored value IS the full URL — return as-is.
export async function getImageUrl(pathOrUrl: string): Promise<string> {
  return pathOrUrl;
}

// Deleting from Cloudinary requires a signed (server-side) API call.
// For the free unsigned flow we leave the asset in Cloudinary; the
// Firestore record is removed by the caller. No-op here.
export async function deleteImage(_pathOrUrl: string): Promise<void> {
  return;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
