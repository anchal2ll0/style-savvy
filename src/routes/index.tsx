import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Shirt, Wand2, Calendar, Heart, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Atelier — AI Fashion Assistant" },
      { name: "description", content: "Look better. Decide faster. Dress smarter. An agentic AI personal stylist that curates outfits from your own wardrobe." },
      { property: "og:title", content: "Atelier — AI Fashion Assistant" },
      { property: "og:description", content: "Your wardrobe, styled by AI." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="font-display text-xl tracking-tight">
          Atelier<span className="text-primary">.</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">
            Sign in
          </Link>
          <Link
            to="/auth"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Get started <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-12 pb-24 md:pt-24">
        <div className="grid items-center gap-12 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" /> Agentic AI Stylist
            </span>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] text-balance md:text-7xl">
              Look better.<br/>
              Decide faster.<br/>
              <span className="italic text-primary">Dress smarter.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground text-balance">
              Atelier is your personal AI stylist. Upload your wardrobe, pick the occasion,
              and let five intelligent agents craft outfits that look unmistakably yours.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-90"
              >
                Build your wardrobe <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition hover:bg-accent"
              >
                See how it works
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 -top-6 h-72 w-56 rotate-[-6deg] rounded-3xl bg-accent shadow-[var(--shadow-soft)]" />
            <div className="absolute -right-4 top-10 h-80 w-60 rotate-[4deg] rounded-3xl bg-primary/15 shadow-[var(--shadow-soft)]" />
            <div className="relative mx-auto h-96 w-72 overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-elegant)] editorial-grain">
              <div className="flex h-full flex-col justify-between p-8">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Today · Office</p>
                  <p className="mt-4 font-display text-3xl leading-tight">The Quiet Confidence</p>
                </div>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <Row label="Top" value="Ivory silk blouse" />
                  <Row label="Bottom" value="Charcoal wide-leg" />
                  <Row label="Shoes" value="Tan loafers" />
                  <Row label="Accent" value="Gold hoops" />
                </div>
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">Style score</span>
                  <span className="font-display text-2xl text-primary">94</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="border-y border-border bg-card/50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">How it works</p>
          <h2 className="mt-2 max-w-2xl font-display text-4xl leading-tight md:text-5xl">
            Five agents. One unmistakably <em className="text-primary not-italic">you</em> outfit.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Card icon={Shirt} title="Wardrobe Agent">
              Photographs your clothes and organises them into a searchable digital closet.
            </Card>
            <Card icon={Wand2} title="Styling Agent">
              Combines pieces into balanced silhouettes, weighing colour, texture and proportion.
            </Card>
            <Card icon={Sparkles} title="Trend Agent">
              Brings a tasteful read on what's current — without losing your personal voice.
            </Card>
            <Card icon={Calendar} title="Planning Agent">
              Suggests daily looks and helps plan ahead for travel or a busy week.
            </Card>
            <Card icon={Heart} title="Shopping Agent">
              Flags only the pieces actually missing from your closet. No bloat.
            </Card>
            <Card icon={ArrowRight} title="Image Agent">
              Reads your current photo to align fit, colour and mood to the moment.
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="font-display text-4xl text-balance md:text-5xl">
          Your closet is already enough.
          <span className="block italic text-primary">Let's prove it.</span>
        </h2>
        <p className="mt-5 text-lg text-muted-foreground">
          Stop buying. Start styling. Atelier helps you rediscover what you own.
        </p>
        <Link
          to="/auth"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Create your account <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Atelier</span>
          <span>Powered by agentic AI</span>
        </div>
      </footer>
    </div>
  );
}

function Card({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-6 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-display text-xl">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="font-display text-base text-foreground">{value}</span>
    </div>
  );
}
