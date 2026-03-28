import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 20, children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export type LucideIcon = (props: IconProps) => ReactNode;

export const Bell: LucideIcon = (props) => (
  <Svg {...props}>
    <path d="M10 5a2 2 0 1 1 4 0c0 2.1.8 3.6 1.6 4.8.8 1.2 1.4 2.4 1.4 4.2H7c0-1.8.6-3 1.4-4.2C9.2 8.6 10 7.1 10 5Z" />
    <path d="M9 18h6" />
    <path d="M10.5 18a1.5 1.5 0 0 0 3 0" />
  </Svg>
);

export const Compass: LucideIcon = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="m14.5 9.5-2.5 5-2.5-5 5 2.5-5 2.5" />
  </Svg>
);

export const Gem: LucideIcon = (props) => (
  <Svg {...props}>
    <path d="m3 8 4 10h10l4-10-4-4H7L3 8Z" />
    <path d="m3 8h18" />
    <path d="m9 4 3 14 3-14" />
  </Svg>
);

export const Home: LucideIcon = (props) => (
  <Svg {...props}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 10v10h14V10" />
  </Svg>
);

export const Mail: LucideIcon = (props) => (
  <Svg {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </Svg>
);

export const MoreHorizontal: LucideIcon = (props) => (
  <Svg {...props}>
    <circle cx="6" cy="12" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="18" cy="12" r="1.5" />
  </Svg>
);

export const User: LucideIcon = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20a8 8 0 0 1 16 0" />
  </Svg>
);

export const Wallet: LucideIcon = (props) => (
  <Svg {...props}>
    <rect x="2" y="6" width="20" height="14" rx="2" />
    <path d="M16 12h4" />
    <circle cx="16" cy="12" r="1" />
  </Svg>
);

export const WalletCards: LucideIcon = (props) => (
  <Svg {...props}>
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M7 16v4" />
    <path d="M11 16v4" />
    <path d="M15 16v4" />
  </Svg>
);

export const Diamond: LucideIcon = (props) => (
  <Svg {...props}>
    <path d="m3 8 4 10h10l4-10-4-4H7L3 8Z" />
    <path d="m3 8h18" />
    <path d="m9 4 3 14 3-14" />
  </Svg>
);

export const Heart: LucideIcon = (props) => (
  <Svg {...props}>
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
  </Svg>
);

export const MessageCircle: LucideIcon = (props) => (
  <Svg {...props}>
    <path d="M21 11a8 8 0 1 1-4-6.9" />
    <path d="M8 18l-4 3 1-5" />
  </Svg>
);

export const Repeat2: LucideIcon = (props) => (
  <Svg {...props}>
    <path d="M17 2l4 4-4 4" />
    <path d="M3 11V9a3 3 0 0 1 3-3h15" />
    <path d="M7 22l-4-4 4-4" />
    <path d="M21 13v2a3 3 0 0 1-3 3H3" />
  </Svg>
);

export const Share2: LucideIcon = (props) => (
  <Svg {...props}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="M8.6 10.7 15.4 6.3" />
    <path d="m8.6 13.3 6.8 4.4" />
  </Svg>
);

export const ImageIcon: LucideIcon = (props) => (
  <Svg {...props}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="1.5" />
    <path d="m21 16-5-5-7 7" />
  </Svg>
);

export const Video: LucideIcon = (props) => (
  <Svg {...props}>
    <rect x="3" y="6" width="13" height="12" rx="2" />
    <path d="m16 10 5-3v10l-5-3" />
  </Svg>
);

export const X: LucideIcon = (props) => (
  <Svg {...props}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </Svg>
);
