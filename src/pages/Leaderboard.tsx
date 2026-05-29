import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { formatCookies } from "@/lib/levels";
import { PageShell } from "@/components/layout/PageShell";
import { Trophy, Crown, Medal } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Leaderboard() {
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState<"wealth" | "wins">("wealth");
  const [period, setPeriod] = useState<"all" | "week" | "today">("all");

  const { data: wealthData } = trpc.leaderboard.byWealth.useQuery(
    { limit: 50, period },
    { staleTime: 30000 },
  );
  const { data: winsData } = trpc.leaderboard.byWins.useQuery(
    { limit: 50 },
    { staleTime: 30000 },
  );
  const { data: myRank } = trpc.leaderboard.myRank.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const data = tab === "wealth" ? wealthData : winsData;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return (
      <span className="text-white/50 text-sm font-mono w-5 text-center">
        {rank}
      </span>
    );
  };

  return (
    <PageShell
      title="Leaderboard"
      icon={<Trophy className="w-5 h-5 text-yellow-400" />}
    >
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setTab("wealth")}
          className={cn(
            "flex-1 py-2.5 rounded-xl font-bold transition-all",
            tab === "wealth"
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
              : "glass-panel text-white/60",
          )}
        >
          Richest Bakers
        </button>
        <button
          type="button"
          onClick={() => setTab("wins")}
          className={cn(
            "flex-1 py-2.5 rounded-xl font-bold transition-all",
            tab === "wins"
              ? "bg-gradient-to-r from-blue-600 to-indigo-500 text-white"
              : "glass-panel text-white/60",
          )}
        >
          Most Wins
        </button>
      </div>

      {tab === "wealth" && (
        <div className="flex gap-2 mb-4">
          {(["all", "week", "today"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                period === p
                  ? "bg-white/20 text-white"
                  : "glass-panel text-white/40",
              )}
            >
              {p === "all" ? "All Time" : p === "week" ? "This Week" : "Today"}
            </button>
          ))}
        </div>
      )}

      {myRank && (
        <div className="glass-panel-strong border-amber-500/30 p-4 mb-4 flex items-center gap-3 animate-pulse-glow">
          <div className="font-display text-2xl font-black text-amber-400">
            #{myRank.rank}
          </div>
          <div className="flex-1">
            <div className="text-white font-bold">Your Rank</div>
            <div className="text-white/60 text-sm">
              {formatCookies(myRank.cookies)} cookies
            </div>
          </div>
          <div className="text-right text-white/60 text-xs">
            <div>Level {myRank.level}</div>
            <div>{myRank.handsWon} wins</div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {(data ?? []).map((entry, i) => (
          <div
            key={entry.id}
            className={cn(
              "glass-panel flex items-center gap-3 px-4 py-3 transition-all hover:bg-white/10",
              "opacity-0-start animate-fade-up",
              entry.rank <= 3 && "border-amber-500/20",
            )}
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            <div className="w-8 flex justify-center">
              {getRankIcon(entry.rank)}
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-sm font-bold text-white shadow-md">
              {(entry.name ?? "?").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-bold text-sm truncate">
                {entry.name ?? "Anonymous"}
              </div>
              <div className="text-white/40 text-xs">
                Lv.{entry.level} · {entry.handsPlayed} hands
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-amber-300 font-bold text-sm justify-end">
                <img src="/assets/cookie-icon.png" alt="" className="w-4 h-4" />
                {formatCookies(entry.cookies)}
              </div>
              {tab === "wins" && (
                <div className="text-white/40 text-xs">
                  {"winRate" in entry ? `${entry.winRate}% win rate` : ""}
                </div>
              )}
            </div>
          </div>
        ))}

        {(!data || data.length === 0) && (
          <div className="text-center py-16 text-white/40 glass-panel">
            <Trophy className="w-14 h-14 mx-auto mb-3 opacity-30" />
            <p>No entries yet. Be the first!</p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
