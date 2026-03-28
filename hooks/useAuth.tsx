"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { profilePicUrl, resolveAuthUser } from "@/lib/deso";
import { getCurrentIdentityPublicKey, launchLogin, logoutIdentity } from "@/lib/identity";
import { AuthUser } from "@/lib/types";

type AuthContextValue = {
  user: AuthUser | null;
  myProfileHref: string;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  isHydrated: boolean;
  isSigningIn: boolean;
  authError: string | null;
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

function buildFallbackUser(publicKey: string): AuthUser {
  return {
    publicKey,
    profilePic: profilePicUrl(publicKey),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const [isHydrated, setIsHydrated] = useState(typeof window !== "undefined");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const hydrateAuth = async () => {
      try {
        const identityKey = await getCurrentIdentityPublicKey();
        if (!identityKey) {
          if (!cancelled) setIsHydrated(true);
          return;
        }

        const fallback = buildFallbackUser(identityKey);
        if (!cancelled) {
          setUser(fallback);
          window.localStorage.setItem(KEY, JSON.stringify(fallback));
          setIsHydrated(true);
        }

        const hydrated = await resolveAuthUser(identityKey);
        if (!cancelled) {
          setUser(hydrated);
          window.localStorage.setItem(KEY, JSON.stringify(hydrated));
        }
      } catch {
        if (!cancelled) {
          setIsHydrated(true);
        }
      }
    };

    void hydrateAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);

    try {
      const publicKey = await launchLogin();

      const fallback = buildFallbackUser(publicKey);
      setUser(fallback);
      window.localStorage.setItem(KEY, JSON.stringify(fallback));
      setIsHydrated(true);

      const hydrated = await resolveAuthUser(publicKey);
      setUser(hydrated);
      window.localStorage.setItem(KEY, JSON.stringify(hydrated));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sign in with DeSo right now.";
      setAuthError(message);
    } finally {
      setIsSigningIn(false);
    }
  };

  const signOut = async () => {
    try {
      await logoutIdentity();
    } finally {
      setUser(null);
      setAuthError(null);
      setIsSigningIn(false);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(KEY);
      }
    }
  };

  const myProfileHref = user?.username ? `/profile/${user.username}` : "/me";

  const value = useMemo(
    () => ({ user, myProfileHref, signIn, signOut, isHydrated, isSigningIn, authError }),
    [authError, isHydrated, isSigningIn, myProfileHref, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used in AuthProvider");
  return context;
}
