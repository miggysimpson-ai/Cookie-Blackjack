import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { formatCookies } from "@/lib/levels";
import { FloatingCookies } from "@/components/home/FloatingCookies";
import { MenuButton } from "@/components/home/MenuButton";
import {
  Play,
  ShoppingBag,
  Trophy,
  Settings,
  HelpCircle,
  MessageSquare,
  LogIn,
  LogOut,
  User,
  Sparkles,
  Shield,
  Cookie,
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { data: player } = trpc.player.me.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center animate-ken-burns"
          style={{ backgroundImage: "url(/assets/title-bg.jpg)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/50 to-black/88" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_20%,rgba(245,200,66,0.12)_0%,transparent_55%)]" />
        <FloatingCookies />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-10">
        <div className="text-center mb-10 opacity-0-start animate-fade-up relative">
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 md:w-96 md:h-96 rounded-full bg-amber-500/10 blur-3xl animate-glow-pulse pointer-events-none"
            aria-hidden
          />
          <div className="inline-flex items-center justify-center gap-2 mb-4 animate-float relative">
            <Cookie className="w-8 h-8 text-amber-400" strokeWidth={2.5} />
            <span className="text-amber-400/90 text-sm font-semibold tracking-[0.25em] uppercase">
              High Stakes Bakery
            </span>
            <Cookie className="w-8 h-8 text-amber-400" strokeWidth={2.5} />
          </div>

          <h1 className="relative font-display text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tight drop-shadow-[0_4px_32px_rgba(0,0,0,0.9)]">
            COOKIE
          </h1>
          <h2 className="relative font-display text-5xl md:text-7xl font-extrabold text-shimmer -mt-1 md:-mt-2">
            BLACKJACK
          </h2>
          <div className="relative flex items-center justify-center gap-2 mt-5 mb-1">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500/50" />
            <Sparkles className="w-4 h-4 text-amber-400/80" />
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500/50" />
          </div>
          <p className="relative mt-2 text-white/70 text-sm md:text-base max-w-xs mx-auto">
            Bet your cookies. Beat the dealer. Stack chips like a legend.
          </p>
        </div>

        {isAuthenticated && player && (
          <div className="glass-panel-strong mb-8 px-6 py-4 flex items-center gap-5 opacity-0-start animate-scale-in stagger-2">
            <div className="relative">
              <img
                src="/assets/cookie-icon.png"
                alt=""
                className="w-12 h-12 drop-shadow-glow animate-pulse-glow rounded-full"
              />
            </div>
            <div>
              <p className="text-white/50 text-xs uppercase tracking-wider">
                Balance
              </p>
              <p className="text-2xl font-bold text-gradient-gold">
                {formatCookies(player.cookies ?? 0)}
              </p>
            </div>
            <div className="w-px h-12 bg-white/15" />
            <div>
              <p className="text-white/50 text-xs uppercase tracking-wider">
                Level
              </p>
              <p className="text-2xl font-bold text-white">{player.level}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 w-full max-w-sm">
          <MenuButton
            variant="play"
            icon={<Play className="w-6 h-6 fill-current" />}
            onClick={() => navigate("/play")}
            delayClass="stagger-3"
          >
            PLAY NOW
          </MenuButton>

          <MenuButton
            variant="shop"
            icon={<ShoppingBag className="w-6 h-6" />}
            onClick={() => navigate("/shop")}
            delayClass="stagger-4"
          >
            SHOP
          </MenuButton>

          <MenuButton
            variant="leaderboard"
            icon={<Trophy className="w-6 h-6" />}
            onClick={() => navigate("/leaderboard")}
            delayClass="stagger-5"
          >
            LEADERBOARD
          </MenuButton>

          <div className="grid grid-cols-2 gap-3">
            <MenuButton
              variant="outline"
              icon={<HelpCircle className="w-5 h-5" />}
              onClick={() => navigate("/how-to-play")}
              className="py-4 text-sm"
              delayClass="stagger-6"
            >
              Rules
            </MenuButton>
            <MenuButton
              variant="outline"
              icon={<Settings className="w-5 h-5" />}
              onClick={() => navigate("/settings")}
              className="py-4 text-sm"
              delayClass="stagger-6"
            >
              Settings
            </MenuButton>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MenuButton
              variant="outline"
              icon={<MessageSquare className="w-5 h-5" />}
              onClick={() => navigate("/contact")}
              className="py-4 text-sm"
              delayClass="stagger-7"
            >
              Contact
            </MenuButton>
            <MenuButton
              variant="outline"
              icon={<Sparkles className="w-5 h-5" />}
              onClick={() => navigate("/help")}
              className="py-4 text-sm"
              delayClass="stagger-7"
            >
              Help
            </MenuButton>
          </div>

          {isAdmin && (
            <MenuButton
              variant="admin"
              icon={<Shield className="w-5 h-5" />}
              onClick={() => navigate("/admin")}
              delayClass="stagger-8"
            >
              Admin
            </MenuButton>
          )}
        </div>

        <div className="mt-8 opacity-0-start animate-fade-up stagger-8">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="glass-panel px-4 py-2 flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400" />
                <span className="text-white text-sm font-medium">
                  {user?.name}
                </span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="text-white/50 hover:text-white text-sm flex items-center gap-1 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="btn-casino glass-panel px-6 py-3 flex items-center gap-2 text-white font-semibold hover:border-amber-400/40"
            >
              <LogIn className="w-5 h-5 text-amber-400" />
              Login to save progress
            </button>
          )}
        </div>

        <p className="mt-10 text-white/25 text-xs tracking-wide opacity-0-start animate-fade-in stagger-8">
          21 or bust — cookies on the line
        </p>
      </div>
    </div>
  );
}
