import { Link, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import {
  getKimiOAuthUrl,
  isKimiOAuthConfigured,
} from "@/lib/auth-config";
import { FloatingCookies } from "@/components/home/FloatingCookies";
import { Cookie, LogIn, Gamepad2, RotateCcw } from "lucide-react";

export default function Login() {
  const [searchParams] = useSearchParams();
  const resetDone = searchParams.get("reset") === "1";
  const kimiConfigured = isKimiOAuthConfigured();

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: "url(/assets/title-bg.jpg)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/90" />
      <FloatingCookies />

      <div className="relative z-10 w-full max-w-md opacity-0-start animate-scale-in">
        <div className="text-center mb-8">
          <Cookie className="w-12 h-12 text-amber-400 mx-auto mb-3 animate-float" />
          <h1 className="font-display text-3xl font-black text-white">
            Welcome Back
          </h1>
          <p className="text-white/60 text-sm mt-2">
            {resetDone
              ? "Progress reset — log in fresh with 1,000 cookies."
              : kimiConfigured
                ? "Sign in to save cookies and climb the board."
                : "Dev mode — jump in and play."}
          </p>
        </div>

        <div className="glass-panel-strong p-6 flex flex-col gap-3">
          {kimiConfigured ? (
            <Button
              className="btn-casino w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-6"
              size="lg"
              onClick={() => {
                const url = getKimiOAuthUrl();
                if (url) window.location.href = url;
              }}
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign in with Kimi
            </Button>
          ) : (
            <Button
              className="btn-casino w-full bg-gradient-to-r from-emerald-600 to-green-500 text-white font-bold py-6"
              size="lg"
              asChild
            >
              <a href="/api/dev/login">Dev login</a>
            </Button>
          )}

          <Button
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10 py-5"
            asChild
          >
            <Link to="/play">
              <Gamepad2 className="w-5 h-5 mr-2" />
              Play as guest
            </Link>
          </Button>

          {!kimiConfigured && (
            <Button
              variant="outline"
              className="w-full border-white/20 text-white/80 hover:bg-white/10"
              asChild
            >
              <a href="/api/dev/reset">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset dev progress
              </a>
            </Button>
          )}

          <Button variant="ghost" className="w-full text-white/50" asChild>
            <Link to="/">Back to title screen</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
