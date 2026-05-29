import { cn } from "@/lib/utils";

export function ResultBanner({
  text,
  colorClass,
}: {
  text: string;
  colorClass: string;
}) {
  return (
    <div className="animate-result-pop">
      <p
        className={cn(
          "text-3xl md:text-6xl font-black font-display tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]",
          colorClass,
        )}
      >
        {text}
      </p>
    </div>
  );
}
