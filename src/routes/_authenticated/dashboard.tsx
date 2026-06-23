import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Shirt, Sparkles, Heart, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Atelier" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const [items, recs, saved] = await Promise.all([
        supabase.from("wardrobe_items").select("id,category", { count: "exact" }),
        supabase.from("outfit_recommendations").select("id", { count: "exact", head: true }),
        supabase.from("saved_outfits").select("id", { count: "exact", head: true }),
      ]);
      const categories = new Set((items.data ?? []).map((i) => i.category));
      return {
        items: items.count ?? 0,
        categories: categories.size,
        recs: recs.count ?? 0,
        saved: saved.count ?? 0,
      };
    },
  });

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Good to see you</p>
        <h1 className="mt-2 font-display text-5xl leading-tight">Your atelier</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Build your digital wardrobe, then ask the AI stylist for an outfit tailored to your day.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <Stat label="Wardrobe items" value={stats?.items ?? 0} />
        <Stat label="Categories" value={stats?.categories ?? 0} />
        <Stat label="Recommendations" value={stats?.recs ?? 0} />
        <Stat label="Saved outfits" value={stats?.saved ?? 0} />
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Action to="/wardrobe" title="Upload clothes" icon={Shirt} desc="Photograph items so the AI knows what you own.">
          Add items
        </Action>
        <Action to="/stylist" title="Get an outfit" icon={Sparkles} desc="Pick an occasion and (optionally) upload a current photo.">
          Style me
        </Action>
        <Action to="/saved" title="Saved looks" icon={Heart} desc="Your bookmarked outfits, ready to wear again.">
          View saved
        </Action>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-4xl">{value}</p>
    </div>
  );
}

function Action({
  to, title, desc, icon: Icon, children,
}: {
  to: "/wardrobe" | "/stylist" | "/saved";
  title: string; desc: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Link to={to} className="group rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-display text-2xl">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
        {children} <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
