import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useBlackjackGame } from "@/hooks/useBlackjackGame";
import { formatCookies, LEVELS } from "@/lib/levels";
import { ArrowLeft, RotateCcw, Home, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlayingCard } from "@/components/game/PlayingCard";
import { Chip } from "@/components/game/Chip";
import { ResultBanner } from "@/components/game/ResultBanner";
import { cn } from "@/lib/utils";

const GUEST_START_COOKIES = 1000;

export default function Game() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [guestCookies, setGuestCookies] = useState(GUEST_START_COOKIES);
  const utils = trpc.useUtils();

  const { data: player } = trpc.player.me.useQuery(undefined, {
    enabled: !!user,
  });

  const onBalanceChange = useCallback(
    (balance: number) => {
      if (user) {
        utils.player.me.setData(undefined, (old) =>
          old ? { ...old, cookies: balance } : old,
        );
        void utils.player.me.invalidate();
      } else {
        setGuestCookies(balance);
      }
    },
    [user, utils],
  );

  const cookies = user ? (player?.cookies ?? 0) : guestCookies;
  const unlockedLevel = player?.level ?? 1;
  const cardBackUrl = player?.equippedCardSkin?.imageUrl;
  const cardBackColor = player?.equippedCardSkin?.themeColor;

  const game = useBlackjackGame({
    isLoggedIn: !!user,
    cookies,
    unlockedLevel,
    onBalanceChange,
  });

  const tableGradient =
    player?.equippedTableSkin?.cssGradient ||
    "radial-gradient(circle at center, #4CAF50 0%, #2E7D32 100%)";

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden felt-texture vignette"
      style={{ background: tableGradient }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.35)_100%)] pointer-events-none" />

      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 py-3 md:px-6 glass-panel-strong mx-2 mt-2 md:mx-4 rounded-xl border-white/10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="text-white/90 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Menu
        </Button>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="bg-black/50 rounded-full px-3 md:px-4 py-1.5 flex items-center gap-2 border border-amber-500/30 shadow-glow-sm">
            <img src="/assets/cookie-icon.png" alt="" className="w-5 h-5 animate-wiggle" />
            <span className="text-amber-300 font-bold text-sm md:text-base tabular-nums">
              {formatCookies(cookies)}
            </span>
          </div>
          <div
            className="rounded-full px-3 py-1 text-xs font-bold text-white shadow-md"
            style={{ backgroundColor: game.levelConfig.color }}
          >
            Lv.{game.level}
          </div>
          <button
            type="button"
            onClick={() => setSoundsEnabled(!soundsEnabled)}
            className="text-white/70 hover:text-white"
            aria-label={soundsEnabled ? "Mute sounds" : "Enable sounds"}
          >
            {soundsEnabled ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {!game.gameState && (
        <div className="absolute top-[4.5rem] left-0 right-0 z-10 flex justify-center animate-fade-in">
          <div className="glass-panel p-2 flex gap-1 overflow-x-auto max-w-[90vw]">
            {LEVELS.map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => game.selectLevel(lvl.id)}
                className={`w-9 h-9 md:w-10 md:h-10 rounded-lg text-xs md:text-sm font-bold transition-all ${
                  lvl.id === game.level
                    ? "ring-2 ring-white scale-110"
                    : "opacity-60 hover:opacity-90"
                } ${lvl.id > unlockedLevel ? "bg-gray-600 cursor-not-allowed" : ""}`}
                style={{
                  backgroundColor:
                    lvl.id <= unlockedLevel ? lvl.color : undefined,
                  color: lvl.id <= unlockedLevel ? "#fff" : "#999",
                }}
              >
                {lvl.id > unlockedLevel ? "\uD83D\uDD12" : lvl.id}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="absolute top-20 md:top-24 left-0 right-0 flex flex-col items-center">
        <div className="text-white/70 text-xs font-bold mb-1">DEALER</div>
        <div className="text-white text-sm font-bold">
          {game.gameState?.status === "playing" && !game.dealerRevealed
            ? game.gameState.dealerScore || "?"
            : (game.gameState?.dealerScore ?? "?")}
        </div>
        <div className="flex items-center mt-2">
          {game.gameState?.dealerHand.map((card, i) => (
            <PlayingCard
              key={`dealer-${i}-${card.rank}-${card.suit}`}
              card={card}
              faceDown={i === 1 && !game.dealerRevealed}
              index={i}
              animate={game.animatingCards}
              cardBackUrl={cardBackUrl}
              cardBackColor={cardBackColor}
            />
          ))}
          {!game.gameState && (
            <div className="w-16 h-24 md:w-20 md:h-28 rounded-lg border-2 border-dashed border-white/30 flex items-center justify-center text-white/30 text-xs">
              Deck
            </div>
          )}
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10 w-full max-w-md px-4">
        {game.showResult && (
          <div className="mb-3">
            <ResultBanner text={game.resultText} colorClass={game.resultColor} />
          </div>
        )}
        <p className="text-white/90 text-sm md:text-base font-semibold glass-panel inline-block px-5 py-2 rounded-full">
          {game.message}
        </p>
      </div>

      <div className="absolute bottom-36 md:bottom-40 left-0 right-0 flex flex-col items-center">
        {game.gameState?.splitHand && (
          <div className="mb-2">
            <div className="text-white/70 text-xs font-bold text-center">
              SPLIT HAND {game.gameState.splitScore}
            </div>
            <div className="flex items-center">
              {game.gameState.splitHand.map((card, i) => (
                <PlayingCard
                  key={`split-${i}-${card.rank}-${card.suit}`}
                  card={card}
                  index={i}
                  cardBackUrl={cardBackUrl}
                  cardBackColor={cardBackColor}
                />
              ))}
            </div>
          </div>
        )}

        <div className="text-white/70 text-xs font-bold mb-1">
          YOU{" "}
          {game.gameState?.splitHand && game.gameState.currentHand === "main"
            ? "(MAIN)"
            : ""}
        </div>
        <div className="text-white text-lg font-bold">
          {game.gameState?.playerScore ?? 0}
        </div>
        <div className="flex items-center mt-2">
          {game.gameState?.playerHand.map((card, i) => (
            <PlayingCard
              key={`player-${i}-${card.rank}-${card.suit}`}
              card={card}
              index={i}
              animate={game.animatingCards}
              cardBackUrl={cardBackUrl}
              cardBackColor={cardBackColor}
            />
          ))}
          {!game.gameState && (
            <div className="text-white/30 text-sm">Place bet to deal</div>
          )}
        </div>
      </div>

      <div className="absolute bottom-20 md:bottom-24 left-0 right-0 flex justify-center">
        {!game.gameState && (
          <div className="glass-panel-strong px-5 py-3 flex items-center gap-4 animate-scale-in">
            <div className="text-center">
              <div className="text-white/60 text-xs">BET</div>
              <div className="text-yellow-400 font-bold text-lg flex items-center gap-1">
                <img src="/assets/cookie-icon.png" alt="" className="w-4 h-4" />
                {game.betAmount}
              </div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="flex gap-2">
              {game.chipValues.map((v) => (
                <Chip
                  key={v}
                  value={v}
                  selected={game.selectedChip === v}
                  onClick={() => {
                    game.setSelectedChip(v);
                    game.addBet(v);
                  }}
                  disabled={cookies < game.betAmount + v}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => game.setBetAmount(game.levelConfig.minBet)}
              className="text-white/60 hover:text-white text-xs underline"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex justify-center gap-2 md:gap-3 px-4 flex-wrap">
        {!game.gameState ? (
          <Button
            onClick={game.startNewHand}
            disabled={
              game.betAmount < game.levelConfig.minBet ||
              cookies < game.betAmount ||
              game.isBusy
            }
            className={cn(
              "btn-casino bg-gradient-to-r from-emerald-600 to-green-500",
              "text-white font-bold text-lg px-10 py-6 rounded-xl shadow-[0_4px_24px_rgba(34,197,94,0.45)]",
              game.betAmount >= game.levelConfig.minBet &&
                cookies >= game.betAmount &&
                !game.isBusy &&
                "animate-pulse-glow ring-2 ring-emerald-300/40",
            )}
          >
            DEAL
          </Button>
        ) : game.gameState.status === "playing" ? (
          <>
            <Button
              onClick={game.handleHit}
              disabled={game.isBusy}
              className="btn-casino bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-6 py-5 rounded-xl"
            >
              HIT
            </Button>
            <Button
              onClick={game.handleStand}
              disabled={game.isBusy}
              className="btn-casino bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-bold px-6 py-5 rounded-xl"
            >
              STAND
            </Button>
            {game.gameState.canDoubleDown && (
              <Button
                onClick={game.handleDoubleDown}
                disabled={cookies < game.gameState.betAmount || game.isBusy}
                className="btn-casino bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold px-5 py-5 rounded-xl text-sm"
              >
                DOUBLE
              </Button>
            )}
            {game.gameState.canSplit && (
              <Button
                onClick={game.handleSplit}
                disabled={cookies < game.gameState.betAmount || game.isBusy}
                className="btn-casino bg-gradient-to-r from-purple-600 to-violet-500 text-white font-bold px-5 py-5 rounded-xl text-sm"
              >
                SPLIT
              </Button>
            )}
          </>
        ) : (
          <>
            <Button
              onClick={game.resetHand}
              className="btn-casino bg-gradient-to-r from-emerald-600 to-green-500 text-white font-bold px-6 py-5 rounded-xl"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              NEW HAND
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="btn-casino border-white/30 text-white hover:bg-white/15 px-4 py-5 rounded-xl"
            >
              <Home className="w-5 h-5 mr-1" />
              Menu
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
