import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { listSaved, deleteSaved, listWardrobe } from "@/lib/firestore";
import { getImageUrl } from "@/lib/storage";
import { Heart, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/saved")({
  head: () => ({ meta: [{ title: "Saved looks — Atelier" }] }),
  component: Saved,
});

function Saved() {
  const { user } = useAuth();
  const uid = user!.uid;
  const qc = useQueryClient();

  const { data: outfits = [] } = useQuery({
    queryKey: ["saved-outfits", uid],
    queryFn: () => listSaved(uid),
  });

  const { data: items = [] } = useQuery({
    queryKey: ["wardrobe", uid],
    queryFn: () => listWardrobe(uid),
  });
  const itemMap = new Map(items.map((i) => [i.id, i]));

  const del = useMutation({
    mutationFn: (id: string) => deleteSaved(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["saved-outfits", uid] }); toast.success("Removed"); },
  });

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Bookmarked</p>
        <h1 className="mt-2 font-display text-5xl">Saved looks</h1>
      </header>

      {outfits.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 p-16 text-center">
          <Heart className="h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 font-display text-2xl">Nothing saved yet</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Generate outfits and tap the heart to bookmark your favourites.
          </p>
          <Link to="/stylist" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
            Open the stylist
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {outfits.map((o) => {
            const tiles = o.item_ids.map((id) => itemMap.get(id)).filter(Boolean) as { id: string; name: string | null; image_path: string }[];
            return (
              <div key={o.id} className="overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-soft)]">
                <div className="flex items-center justify-between border-b border-border bg-accent/40 px-5 py-3">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">{o.occasion ?? "Look"}</span>
                  {o.score && <span className="font-display text-xl text-primary">{o.score}</span>}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-2xl leading-tight">{o.title}</h3>
                    <button onClick={() => del.mutate(o.id)} className="text-muted-foreground hover:text-destructive" aria-label="Remove">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {tiles.map((t) => <Thumb key={t.id} path={t.image_path} name={t.name} />)}
                  </div>
                  {o.reasoning && <p className="mt-4 text-sm text-muted-foreground">{o.reasoning}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Thumb({ path, name }: { path: string; name: string | null }) {
  const { data: url } = useQuery({
    queryKey: ["img", path],
    queryFn: () => getImageUrl(path),
    staleTime: 60 * 60 * 1000,
  });
  return (
    <div className="aspect-square overflow-hidden rounded-xl bg-muted">
      {url && <img src={url} alt={name ?? ""} className="h-full w-full object-cover" loading="lazy" />}
    </div>
  );
}
