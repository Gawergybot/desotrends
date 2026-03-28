"use client";

import Link from "next/link";
import {
  Bell,
  Compass,
  Gem,
  Home,
  Mail,
  MoreHorizontal,
  User,
  Wallet,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type StaticNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  external?: boolean;
};

type DynamicNavItem = {
  label: string;
  dynamic: true;
  icon: LucideIcon;
  external?: false;
};

type NavItem = StaticNavItem | DynamicNavItem;

const nav: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Notifications", href: "#", icon: Bell },
  { label: "Discover", href: "#", icon: Compass },
  { label: "Buy DESO", href: "https://portview.xyz", external: true, icon: WalletCards },
  { label: "Messages", href: "#", icon: Mail },
  { label: "My Profile", dynamic: true, icon: User },
  { label: "My Wallet", href: "#", icon: Wallet },
  { label: "More", href: "#", icon: MoreHorizontal },
];

export function Sidebar() {
  const { myProfileHref } = useAuth();

  return (
    <aside className="hidden w-[300px] shrink-0 border-r border-border lg:flex lg:flex-col lg:px-4 lg:py-4">
      <div className="mb-4 flex items-center gap-2 px-2 py-2 text-xl font-bold">
        <Gem size={18} className="text-accent" />
        <span>DeSoTrends</span>
      </div>

      <nav className="space-y-1">
        {nav.map((item) => {
          const href = "href" in item ? item.href : myProfileHref;
          const Icon = item.icon;
          const className =
            "flex h-[52px] items-center gap-3 rounded-xl px-3 text-[17px] text-slate-100 transition hover:bg-slate-900";

          if (item.external) {
            return (
              <a key={item.label} href={href} target="_blank" rel="noreferrer" className={className}>
                <Icon size={20} className="text-muted" />
                <span>{item.label}</span>
              </a>
            );
          }

          return (
            <Link key={item.label} href={href || "#"} className={className}>
              <Icon size={20} className="text-muted" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <button className="mt-4 h-14 w-full rounded-xl bg-accent px-4 text-base font-semibold text-slate-950">Post</button>
    </aside>
  );
}
