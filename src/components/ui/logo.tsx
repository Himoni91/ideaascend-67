
import { cn } from "@/lib/utils";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  variant?: 'full' | 'icon';
}

export function Logo({ variant = 'full', className, ...props }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      className={cn("h-6 w-6", className)}
      fill="none"
      {...props}
    >
      <path
        d="M32 8C18.7 8 8 18.7 8 32s10.7 24 24 24 24-10.7 24-24S45.3 8 32 8zm0 4c11 0 20 9 20 20s-9 20-20 20-20-9-20-20 9-20 20-20zm0 6c-7.7 0-14 6.3-14 14s6.3 14 14 14 14-6.3 14-14c0-1.4-.2-2.8-.6-4.1-5.4 5.2-14 5.2-14-5.5 0-4.3 2.6-8.1 6.3-9.8C35.8 18.2 33.9 18 32 18z"
        fill="url(#gradient)"
      />
      <defs>
        <linearGradient id="gradient" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#6366F1" />
        </linearGradient>
      </defs>
    </svg>
  );
}
