import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { generateOutfitRecommendations } from "@/lib/stylist.functions";
import { fileToDataUrl, getSignedUrl } from "@/lib/storage";
import { toast } from "sonner";
import { Sparkles, Upload, Heart, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/stylist")({
  head: () => ({ meta: [{ title: "AI Stylist — Atelier" }] }),
  component: Stylist,
});

const OCCASIONS = ["Office", "Party", "College", "Wedding", "Travel", "Casual", "Festival", "Date"] as const;
const MOODS = ["Confident", "Playful", "Minimal", "Bold", "Cozy", "Romantic"] as const;
const WEATHER = ["Cool", "Mild", "Warm", "Hot", "Rainy"] as const;

type Outfit = {
  title: string;
  item_ids: string[];
  reasoning: string;
  score: number;
  styling_tips: string;
};
type Result = {
  id: string;
  analysis: string;
  outfits: Outfit[];
  missing_pieces: { piece: string; why: string }[];
};

function Stylist() {
  const generate = useServerFn(generateOutfitRecommendations);
  const fileRef = useRef<HTMLInputElement>(null);
  const [occasion, setOccasion] = useState<string>("Office");
  const [mood, setMood] = useState<string>("Confident");
  const [weather, setWeather] = useState<string>("Mild");
  const [photo, setPhoto] = useState<File | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const { data: items = [] } = useQuery({
    queryKey: ["wardrobe", "lite"],
    queryFn: async () => {
      const { data } = await supabase.from("wardrobe_items").select("id,name,category,image_path");
      return data ?? [];
    },
  });
  const itemMap = new Map(items.map((i) => [i.id, i]));

  const run = useMutation({
    mutationFn: async () => {
      const currentImageDataUrl = photo ? await fileToDataUrl(photo) : undefined;
      return (await generate({ data: { occasion, mood, weather, currentImageDataUrl } })) as Result;
    },
    onSuccess: (r) => { setResult(r); toast.success("Your outfits are ready"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Something went wrong"),
  });

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Agentic stylist</p>
        <h1 className="mt-2 font-display text-5xl">What's the occasion?</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Set the scene. Optionally add a current photo so the AI can read your fit and colour.
        </p>
      </header>

      <section className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] md:p-8">
        <Group label="Occasion" options={OCCASIONS} value={occasion} onChange={setOccasion} />
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Group label="Mood" options={MOODS} value={mood} onChange={setMood} />
          <Group label="Weather" options={WEATHER} value={weather} onChange={setWeather} />
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Current photo (optional)</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
              >
                <Upload className="h-4 w-4" /> {photo ? "Change photo" : "Upload photo"}
              </button>
              {photo && (
                <span className="text-sm text-muted-foreground truncate">{photo.name}</span>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
          <button
            onClick={() => run.mutate()}
            disabled={run.isPending || items.length < 2}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {run.isPending ? (
              <><span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> Styling…</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Generate outfits</>
            )}
          </button>
        </div>
        {items.length < 2 && (
          <p className="mt-4 text-sm text-muted-foreground">
            Add at least 2 items to your <Link to="/wardrobe" className="underline">wardrobe</Link> first.
          </p>
        )}
      </section>

      {result && (
        <section className="space-y-6">
          <div className="rounded-2xl border border-border bg-accent/40 p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Stylist's read</p>
            <p className="mt-2 font-display text-xl text-balance">{result.analysis}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {result.outfits.map((outfit, idx) => (
              <OutfitCard
                key={idx}
                outfit={outfit}
                rank={idx + 1}
                occasion={occasion}
                recommendationId={result.id}
                itemMap={itemMap}
              />
            ))}
          </div>

          {result.missing_pieces.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-display text-2xl">Worth adding to your closet</h3>
              <p className="mt-1 text-sm text-muted-foreground">The Shopping Agent's picks — only what's actually missing.</p>
              <ul className="mt-4 space-y-3">
                {result.missing_pieces.map((m, i) => (
                  <li key={i} className="flex gap-3">
                    <ArrowRight className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">{m.piece}</p>
                      <p className="text-sm text-muted-foreground">{m.why}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function Group({ label, options, value, onChange }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              value === o ? "bg-foreground text-background" : "bg-background text-muted-foreground border border-border hover:bg-accent"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function OutfitCard({
  outfit, rank, occasion, recommendationId, itemMap,
}: {
  outfit: Outfit; rank: number; occasion: string; recommendationId: string;
  itemMap: Map<string, { id: string; name: string | null; category: string; image_path: string }>;
}) {
  const validItems = outfit.item_ids.map((id) => itemMap.get(id)).filter((x): x is NonNullable<typeof x> => Boolean(x));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("saved_outfits").insert({
        user_id: user.id,
        title: outfit.title,
        occasion,
        item_ids: validItems.map((i) => i.id),
        reasoning: outfit.reasoning,
        notes: outfit.styling_tips,
        score: outfit.score,
      });
      if (error) throw error;
      setSaved(true);
      toast.success("Saved to your looks");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally { setSaving(false); }
    void recommendationId; // ref for future linking
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between border-b border-border bg-accent/40 px-5 py-3">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Look {rank}</span>
        <span className="font-display text-xl text-primary">{outfit.score}</span>
      </div>
      <div className="p-5">
        <h3 className="font-display text-2xl leading-tight">{outfit.title}</h3>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {validItems.slice(0, 6).map((item) => (
            <ItemThumb key={item.id} path={item.image_path} name={item.name} />
          ))}
        </div>

        <div className="mt-5 space-y-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Why it works</p>
            <p className="mt-1 text-sm text-foreground">{outfit.reasoning}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Styling tip</p>
            <p className="mt-1 text-sm text-muted-foreground">{outfit.styling_tips}</p>
          </div>
        </div>

        <button
          onClick={save}
          disabled={saving || saved}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-accent disabled:opacity-60"
        >
          <Heart className={`h-4 w-4 ${saved ? "fill-primary text-primary" : ""}`} />
          {saved ? "Saved" : "Save look"}
        </button>
      </div>
    </div>
  );
}

function ItemThumb({ path, name }: { path: string; name: string | null }) {
  const { data: url } = useQuery({
    queryKey: ["signed", "wardrobe", path],
    queryFn: () => getSignedUrl("wardrobe", path),
    staleTime: 50 * 60 * 1000,
  });
  return (
    <div className="aspect-square overflow-hidden rounded-xl bg-muted">
      {url && <img src={url} alt={name ?? ""} className="h-full w-full object-cover" loading="lazy" />}
    </div>
  );
}
