import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const variants = {
  play: "bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 shadow-[0_4px_24px_rgba(34,197,94,0.4)]",
  shop: "bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 shadow-[0_4px_24px_rgba(245,158,11,0.4)]",
  leaderboard:
    "bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 shadow-[0_4px_24px_rgba(59,130,246,0.35)]",
  outline:
    "bg-white/5 border border-white/20 hover:bg-white/15 hover:border-white/35 backdrop-blur-sm",
  admin: "bg-gradient-to-r from-red-700 to-rose-600 hover:from-red-600 hover:to-rose-500",
};

type Variant = keyof typeof variants;

export function MenuButton({
  children,
  icon,
  onClick,
  variant = "outline",
  className,
  delayClass = "",
}: {
  children: ReactNode;
  icon: ReactNode;
  onClick: () => void;
  variant?: Variant;
  className?: string;
  delayClass?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "btn-casino opacity-0-start animate-fade-up w-full flex items-center justify-center gap-2.5",
        "text-white rounded-xl py-5 px-4 text-base md:text-lg",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black/50",
        variants[variant],
        delayClass,
        className,
      )}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span>{children}</span>
    </button>
  );
}
