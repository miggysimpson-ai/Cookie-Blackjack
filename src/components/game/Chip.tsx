import { formatCookies } from "@/lib/levels";
import { cn } from "@/lib/utils";

const CHIP_COLORS: Record<number, string> = {
  1: "#F5F5F5",
  5: "#F44336",
  10: "#2196F3",
  50: "#4CAF50",
  100: "#212121",
  500: "#FF9800",
  1000: "#9C27B0",
};

export function Chip({
  value,
  onClick,
  selected,
  disabled,
}: {
  value: number;
  onClick: () => void;
  selected?: boolean;
  disabled?: boolean;
}) {
  const color = CHIP_COLORS[value] ?? "#757575";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative w-12 h-12 md:w-14 md:h-14 rounded-full font-bold text-xs md:text-sm",
        "border-4 border-dashed border-white/90 shadow-lg transition-all duration-200",
        "hover:scale-110 active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:scale-100",
        selected && "ring-4 ring-amber-400 scale-110 animate-chip-pop",
      )}
      style={{
        backgroundColor: color,
        color: value <= 1 ? "#333" : "#fff",
        boxShadow: selected
          ? "0 0 20px rgba(245, 200, 66, 0.5), inset 0 2px 4px rgba(255,255,255,0.3)"
          : "0 4px 12px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.25)",
      }}
    >
      <span className="relative z-10">{formatCookies(value)}</span>
      <span
        className="absolute inset-1 rounded-full border border-black/10 pointer-events-none"
        aria-hidden
      />
    </button>
  );
}
