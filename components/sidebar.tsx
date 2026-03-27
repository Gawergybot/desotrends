"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

const nav = [
  { label: "Home", href: "/" },
  { label: "Notifications", href: "#" },
  { label: "Discover", href: "#" },
  { label: "Buy DESO", href: "https://portview.xyz", external: true },
  { label: "Messages", href: "#" },
  { label: "My Wallet", href: "#" },
  { label: "More", href: "#" },
];

export function Sidebar() {
  const { myProfileHref } = useAuth();

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:gap-3 lg:pr-4">
      <div className="px-3 py-4 text-xl font-bold">DeSoTrends</div>
      <Link href={myProfileHref} className="rounded-lg px-3 py-2 text-slate-200 hover:bg-slate-900">
        My Profile
      </Link>
      {nav.map((item) =>
        item.external ? (
          <a
            key={item.label}
            href={item.href}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg px-3 py-2 text-slate-200 hover:bg-slate-900"
          >
            {item.label}
          </a>
        ) : (
          <Link key={item.label} href={item.href} className="rounded-lg px-3 py-2 text-slate-200 hover:bg-slate-900">
            {item.label}
          </Link>
        )
      )}
      <button className="mt-4 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-slate-950">Post</button>
    </aside>
  );
}
