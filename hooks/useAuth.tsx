"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { resolveAuthUser } from "@/lib/deso";
import { getCurrentIdentityPublicKey, launchLogin, logoutIdentity } from "@/lib/identity";
import { AuthUser } from "@/lib/types";

type AuthContextValue = {
  user: AuthUser | null;
  myProfileHref: string;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  isHydrated: boolean;
};

const KEY = "desotrends-auth";
const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as AuthUser;
  } catch {
    window.localStorage.removeItem(KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const hydrateAuth = async () => {
      try {
        const identityKey = await getCurrentIdentityPublicKey();
        if (identityKey) {
          const hydrated = await resolveAuthUser(identityKey);
          if (!cancelled) {
            setUser(hydrated);
            window.localStorage.setItem(KEY, JSON.stringify(hydrated));
          }
          return;
        }
      } catch {
        // fall back to localStorage when identity snapshot is unavailable
      }

      if (!cancelled) {
        setUser(readStoredUser());
      }
    };

    void hydrateAuth().finally(() => {
      if (!cancelled) setIsHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = async () => {
    const publicKey = await launchLogin();
    const hydrated = await resolveAuthUser(publicKey);
    setUser(hydrated);
    window.localStorage.setItem(KEY, JSON.stringify(hydrated));
  };

  const signOut = async () => {
    try {
      await logoutIdentity();
    } finally {
      setUser(null);
      window.localStorage.removeItem(KEY);
    }
  };

  const myProfileHref = user?.username ? `/profile/${user.username}` : "/me";
  const value = useMemo(() => ({ user, myProfileHref, signIn, signOut, isHydrated }), [isHydrated, myProfileHref, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used in AuthProvider");
  return context;
}
