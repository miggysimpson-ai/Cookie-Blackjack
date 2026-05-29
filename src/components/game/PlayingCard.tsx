import { useEffect, useState } from "react";
import type { Card } from "@/lib/blackjack";
import { getSuitColor, getSuitSymbol } from "@/lib/blackjack";
import { cn } from "@/lib/utils";

export function PlayingCard({
  card,
  faceDown = false,
  index = 0,
  animate = false,
  cardBackUrl,
  cardBackColor,
}: {
  card: Card;
  faceDown?: boolean;
  index?: number;
  animate?: boolean;
  cardBackUrl?: string | null;
  cardBackColor?: string | null;
}) {
  const [revealed, setRevealed] = useState(!animate);

  useEffect(() => {
    if (animate) {
      const t = setTimeout(() => setRevealed(true), 80 + index * 120);
      return () => clearTimeout(t);
    }
    setRevealed(true);
  }, [animate, index]);

  const offset = index > 0 ? "-2.5rem" : "0";
  const dealDelay = `${index * 0.12}s`;

  if (faceDown) {
    const backStyle = cardBackColor
      ? {
          background: `linear-gradient(145deg, ${cardBackColor}, ${cardBackColor}88)`,
        }
      : { background: "linear-gradient(145deg, #1565C0, #0a3d91)" };

    return (
      <div
        className={cn(
          "perspective-card w-16 h-24 md:w-20 md:h-28 rounded-xl shadow-xl",
          animate && "opacity-0-start animate-deal-in",
        )}
        style={{
          marginLeft: offset,
          zIndex: index,
          animationDelay: dealDelay,
        }}
      >
        <div
          className="w-full h-full rounded-xl border-2 border-white/30 overflow-hidden flex items-center justify-center"
          style={backStyle}
        >
          {cardBackUrl ? (
            <img
              src={cardBackUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src="/assets/cookie-icon.png"
              alt=""
              className="w-9 h-9 md:w-11 md:h-11 opacity-70 drop-shadow"
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "perspective-card w-16 h-24 md:w-20 md:h-28",
        animate && !revealed && "opacity-0-start animate-deal-in",
      )}
      style={{
        marginLeft: offset,
        zIndex: index,
        animationDelay: dealDelay,
      }}
    >
      <div
        className={cn(
          "w-full h-full rounded-xl bg-white shadow-xl border border-gray-200/90 relative",
          revealed ? "animate-card-flip" : "opacity-0",
        )}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          className="absolute top-1 left-1.5 text-xs md:text-sm font-bold leading-none"
          style={{ color: getSuitColor(card.suit) }}
        >
          <div>{card.rank}</div>
          <div>{getSuitSymbol(card.suit)}</div>
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center text-2xl md:text-4xl"
          style={{ color: getSuitColor(card.suit) }}
        >
          {getSuitSymbol(card.suit)}
        </div>
        <div
          className="absolute bottom-1 right-1.5 text-xs md:text-sm font-bold leading-none rotate-180"
          style={{ color: getSuitColor(card.suit) }}
        >
          <div>{card.rank}</div>
          <div>{getSuitSymbol(card.suit)}</div>
        </div>
      </div>
    </div>
  );
}
