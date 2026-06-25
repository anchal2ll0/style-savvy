import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";

import { useAuth } from "@/lib/auth-context";
import { uploadImage, fileToDataUrl, getImageUrl, deleteImage } from "@/lib/storage";
import { listWardrobe, addWardrobeItem, deleteWardrobeItem, type WardrobeItem } from "@/lib/firestore";
import { categorizeItem } from "@/lib/grok.functions";
import { toast } from "sonner";
import { Plus, Trash2, Upload } from "lucide-react";

export const Route = createFileRoute("/_authenticated/wardrobe")({
  head: () => ({ meta: [{ title: "Wardrobe — Atelier" }] }),
  component: Wardrobe,
});

const CATEGORIES = ["all","shirt","top","tshirt","jeans","trousers","shorts","dress","skirt","outerwear","shoes","accessory","other"] as const;

function Wardrobe() {
  const { user } = useAuth();
  const uid = user!.uid;
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>("all");
  const [uploading, setUploading] = useState(false);
  const categorize = categorizeItem;

  const { data: items = [] } = useQuery({
    queryKey: ["wardrobe", uid],
    queryFn: () => listWardrobe(uid),
  });

  const del = useMutation({
    mutationFn: async (item: WardrobeItem) => {
      await deleteImage(item.image_path);
      await deleteWardrobeItem(item.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wardrobe", uid] });
      toast.success("Removed");
    },
  });

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        toast.loading(`Analyzing ${file.name}…`, { id: file.name });
        const [path, dataUrl] = await Promise.all([
          uploadImage("wardrobe", uid, file),
          fileToDataUrl(file),
        ]);
        let meta = { name: file.name.split(".")[0], category: "other", color: null as string | null, description: null as string | null };
        try {
          const ai = await categorize({ data: { imageDataUrl: dataUrl } });
          meta = { name: ai.name, category: ai.category, color: ai.color, description: ai.description };
        } catch (err) {
          console.warn("AI categorize failed", err);
        }
        await addWardrobeItem(uid, { image_path: path, ...meta });
        toast.success(`Added ${meta.name}`, { id: file.name });
      }
      qc.invalidateQueries({ queryKey: ["wardrobe", uid] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const filtered = filter === "all" ? items : items.filter((i) => i.category === filter);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Your closet</p>
          <h1 className="mt-2 font-display text-5xl">Wardrobe</h1>
          <p className="mt-2 text-muted-foreground">Upload clothes. The AI will name and categorize them.</p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {uploading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> : <Plus className="h-4 w-4" />}
          {uploading ? "Uploading…" : "Add items"}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onPick} />
      </header>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition ${
              filter === c ? "bg-foreground text-background" : "bg-card text-muted-foreground hover:bg-accent"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 p-16 text-center">
          <Upload className="h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 font-display text-2xl">Your closet is empty</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Add a few items — shirts, jeans, shoes — and the AI will start styling outfits for you.
          </p>
          <button
            onClick={() => fileRef.current?.click()}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Upload first item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item) => (
            <WardrobeCard key={item.id} item={item} onDelete={() => del.mutate(item)} />
          ))}
        </div>
      )}
    </div>
  );
}

function WardrobeCard({ item, onDelete }: { item: WardrobeItem; onDelete: () => void }) {
  const { data: url } = useQuery({
    queryKey: ["img", item.image_path],
    queryFn: () => getImageUrl(item.image_path),
    staleTime: 60 * 60 * 1000,
  });
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]">
      <div className="aspect-[3/4] w-full bg-muted">
        {url && <img src={url} alt={item.name ?? "Item"} className="h-full w-full object-cover" loading="lazy" />}
      </div>
      <div className="p-3">
        <p className="truncate font-display text-base">{item.name ?? "Unnamed"}</p>
        <p className="mt-0.5 text-xs uppercase tracking-widest text-muted-foreground">
          {item.category}{item.color ? ` · ${item.color}` : ""}
        </p>
      </div>
      <button
        onClick={onDelete}
        className="absolute right-2 top-2 hidden h-8 w-8 items-center justify-center rounded-full bg-background/90 text-destructive shadow-sm transition group-hover:flex"
        aria-label="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      {item.use_count > 0 && (
        <span className="absolute left-2 top-2 rounded-full bg-foreground/80 px-2 py-0.5 text-[10px] uppercase tracking-widest text-background">
          Worn {item.use_count}×
        </span>
      )}
    </div>
  );
}
