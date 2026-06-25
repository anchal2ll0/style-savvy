import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, getToken, setToken } from "./api";

export type AppUser = { uid: string; email: string; displayName: string };

type Ctx = {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => void;
};

const AuthCtx = createContext<Ctx>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!getToken()) { setLoading(false); return; }
      try {
        const { user } = await api<{ user: AppUser }>("/api/auth/me");
        if (alive) setUser(user);
      } catch {
        setToken(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  async function signIn(email: string, password: string) {
    const { token, user } = await api<{ token: string; user: AppUser }>(
      "/api/auth/login", { method: "POST", auth: false, body: { email, password } },
    );
    setToken(token);
    setUser(user);
  }

  async function signUp(email: string, password: string, displayName?: string) {
    const { token, user } = await api<{ token: string; user: AppUser }>(
      "/api/auth/signup", { method: "POST", auth: false, body: { email, password, displayName } },
    );
    setToken(token);
    setUser(user);
  }

  function signOut() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthCtx.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
