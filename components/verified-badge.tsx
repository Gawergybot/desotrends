type VerifiedBadgeProps = {
  size?: number;
  className?: string;
};

export function VerifiedBadge({ size = 16, className = "" }: VerifiedBadgeProps) {
  return (
    <span
      aria-label="Verified core team account"
      title="Verified core team account"
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className="absolute inset-0 animate-spin"
        style={{ animationDuration: "7s" }}
      >
        <path
          fill="#49AFFF"
          d="M12 2.1c1.35 0 2.19 1.08 3.24 1.38 1.1.31 2.48-.18 3.39.48.89.64 1.07 2.07 1.76 2.97.68.88 2.11 1.19 2.41 2.28.29 1.03-.57 2.16-.57 3.38s.86 2.35.57 3.38c-.3 1.09-1.73 1.4-2.41 2.28-.69.9-.87 2.33-1.76 2.97-.91.66-2.29.17-3.39.48-1.05.3-1.89 1.38-3.24 1.38s-2.19-1.08-3.24-1.38c-1.1-.31-2.48.18-3.39-.48-.89-.64-1.07-2.07-1.76-2.97-.68-.88-2.11-1.19-2.41-2.28-.29-1.03.57-2.16.57-3.38s-.86-2.35-.57-3.38c.3-1.09 1.73-1.4 2.41-2.28.69-.9.87-2.33 1.76-2.97.91-.66 2.29-.17 3.39-.48 1.05-.3 1.89-1.38 3.24-1.38Z"
        />
      </svg>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className="relative z-[1]"
      >
        <path
          d="m7.7 12.3 2.5 2.5 6.1-6.1"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
