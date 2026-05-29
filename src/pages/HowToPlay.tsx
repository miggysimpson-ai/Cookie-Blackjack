import { useNavigate } from "react-router";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Target, Hand, Coins, Star, Sparkles, Play } from "lucide-react";

function RuleCard({
  icon,
  title,
  color,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-panel p-5 opacity-0-start animate-fade-up">
      <div className="flex items-center gap-2 mb-3">
        <span className={color}>{icon}</span>
        <h2 className={`text-lg font-bold font-display ${color}`}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function HowToPlay() {
  const navigate = useNavigate();

  return (
    <PageShell
      title="How to Play"
      icon={<Target className="w-5 h-5 text-amber-400" />}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        <RuleCard icon={<Target className="w-5 h-5" />} title="Objective" color="text-amber-400">
          <p className="text-white/70 leading-relaxed">
            Get as close to <strong className="text-white">21</strong> as possible
            without going over. Beat the dealer to win cookies!
          </p>
        </RuleCard>

        <RuleCard icon={<Hand className="w-5 h-5" />} title="Card Values" color="text-blue-400">
          <div className="space-y-2 text-white/70 text-sm">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span>2 – 10</span>
              <span className="text-white font-semibold">Face value</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span>J, Q, K</span>
              <span className="text-white font-semibold">10</span>
            </div>
            <div className="flex justify-between">
              <span>Ace</span>
              <span className="text-white font-semibold">11 or 1</span>
            </div>
          </div>
        </RuleCard>

        <RuleCard icon={<Coins className="w-5 h-5" />} title="Actions" color="text-emerald-400">
          <ul className="space-y-2 text-white/70 text-sm">
            <li>
              <strong className="text-orange-400">Hit</strong> — draw another card
            </li>
            <li>
              <strong className="text-blue-400">Stand</strong> — keep your hand
            </li>
            <li>
              <strong className="text-green-400">Double</strong> — double bet, one card
            </li>
            <li>
              <strong className="text-purple-400">Split</strong> — split matching cards
            </li>
          </ul>
        </RuleCard>

        <RuleCard icon={<Star className="w-5 h-5" />} title="Blackjack" color="text-yellow-400">
          <p className="text-white/70 text-sm">
            Ace + 10-value on your first two cards pays{" "}
            <strong className="text-amber-300">3:2</strong>.
          </p>
        </RuleCard>

        <RuleCard icon={<Sparkles className="w-5 h-5" />} title="Levels" color="text-violet-400">
          <p className="text-white/70 text-sm">
            Ten tables with higher minimum bets. Earn cookies to unlock new
            levels and shop skins.
          </p>
        </RuleCard>

        <Button
          onClick={() => navigate("/play")}
          className="btn-casino w-full bg-gradient-to-r from-emerald-600 to-green-500 text-white font-bold py-6 mt-4"
        >
          <Play className="w-5 h-5 mr-2 fill-current" />
          Deal me in
        </Button>
      </div>
    </PageShell>
  );
}
