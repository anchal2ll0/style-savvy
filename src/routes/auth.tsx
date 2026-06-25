import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Atelier" },
      { name: "description", content: "Sign in or create your Atelier account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard", replace: true });
  }, [user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        await signUp(email, password, name);
        toast.success("Welcome to Atelier");
      } else {
        await signIn(email, password);
        toast.success("Welcome back");
      }
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen max-w-6xl gap-0 px-6 py-10 md:grid-cols-2 md:gap-12">
        <div className="hidden flex-col justify-between rounded-3xl bg-primary p-10 text-primary-foreground md:flex">
          <Link to="/" className="font-display text-xl">Atelier<span className="opacity-70">.</span></Link>
          <div>
            <Sparkles className="h-8 w-8 opacity-80" />
            <h2 className="mt-6 font-display text-4xl leading-tight text-balance">
              "The best outfit you'll wear this week is already in your closet."
            </h2>
            <p className="mt-4 text-sm opacity-80">Atelier · Agentic AI Personal Stylist</p>
          </div>
          <p className="text-xs opacity-70">Look better. Decide faster. Dress smarter.</p>
        </div>

        <div className="flex flex-col justify-center">
          <Link to="/" className="mb-6 font-display text-xl md:hidden">
            Atelier<span className="text-primary">.</span>
          </Link>
          <h1 className="font-display text-4xl">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin" ? "Sign in to your wardrobe." : "Start styling in under a minute."}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === "signup" && (
              <Field label="Name">
                <input required value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Aria" />
              </Field>
            )}
            <Field label="Email">
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" autoComplete="email" />
            </Field>
            <Field label="Password">
              <input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" autoComplete={mode === "signup" ? "new-password" : "current-password"} />
            </Field>
            <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
              {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> : null}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground">
            {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
            <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="font-medium text-primary hover:underline">
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
