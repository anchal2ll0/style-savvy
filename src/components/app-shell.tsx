import { Link, useRouter } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { Shirt, Sparkles, Heart, LayoutDashboard, LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/wardrobe", label: "Wardrobe", icon: Shirt },
  { to: "/stylist", label: "Stylist", icon: Sparkles },
  { to: "/saved", label: "Saved", icon: Heart },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { signOut } = useAuth();

  async function handleSignOut() {
    await qc.cancelQueries();
    qc.clear();
    signOut();
    router.navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/dashboard" className="font-display text-xl tracking-tight">
            Atelier<span className="text-primary">.</span>
          </Link>
          <nav className="hidden gap-1 md:flex">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                activeProps={{ className: "bg-accent text-accent-foreground" }}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent/60 hover:text-foreground"
              >
                <Icon className="h-4 w-4" /> {label}
              </Link>
            ))}
          </nav>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-full border border-input bg-background px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-6 pb-3 md:hidden">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeProps={{ className: "bg-accent text-accent-foreground" }}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent/60"
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
