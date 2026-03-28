"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "@/components/icons";
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
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Discover", href: "/discover", icon: Compass },
  { label: "Buy DESO", href: "https://portview.xyz", external: true, icon: WalletCards },
  { label: "Messages", href: "/messages", icon: Mail },
  { label: "My Profile", dynamic: true, icon: User },
  { label: "My Wallet", href: "/wallet", icon: Wallet },
  { label: "More", href: "/more", icon: MoreHorizontal },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();
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
          const active =
            item.label === "My Profile"
              ? pathname === "/me" || pathname.startsWith("/profile/") || pathname === myProfileHref
              : !item.external && isActivePath(pathname, href);

          const className = [
            "flex h-[52px] items-center gap-3 rounded-xl px-3 text-[17px] transition",
            active ? "bg-slate-900 text-white" : "text-slate-100 hover:bg-slate-900",
          ].join(" ");

          if (item.external) {
            return (
              <a key={item.label} href={href} target="_blank" rel="noreferrer" className={className}>
                <Icon size={20} className={active ? "text-white" : "text-muted"} />
                <span>{item.label}</span>
              </a>
            );
          }

          return (
            <Link key={item.label} href={href} className={className}>
              <Icon size={20} className={active ? "text-white" : "text-muted"} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <button className="mt-4 h-14 w-full rounded-xl bg-accent px-4 text-base font-semibold text-slate-950">Post</button>
    </aside>
  );
}
