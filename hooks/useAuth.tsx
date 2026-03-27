"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { resolveAuthUser } from "@/lib/deso";
import { launchLogin } from "@/lib/identity";
import { AuthUser } from "@/lib/types";

type AuthContextValue = {
  user: AuthUser | null;
  myProfileHref: string;
  signIn: () => Promise<void>;
  signOut: () => void;
};

const KEY = "desotrends-auth";
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem(KEY);
    return stored ? (JSON.parse(stored) as AuthUser) : null;
  });

  const signIn = async () => {
    const publicKey = await launchLogin();
    const hydrated = await resolveAuthUser(publicKey);
    setUser(hydrated);
    window.localStorage.setItem(KEY, JSON.stringify(hydrated));
  };

  const signOut = () => {
    setUser(null);
    window.localStorage.removeItem(KEY);
  };

  const myProfileHref = user?.username ? `/profile/${user.username}` : "/me";
  const value = useMemo(() => ({ user, myProfileHref, signIn, signOut }), [myProfileHref, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used in AuthProvider");
  return context;
}
