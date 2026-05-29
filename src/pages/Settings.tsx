import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Volume2, VolumeX, RotateCcw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const utils = trpc.useUtils();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const resetMutation = trpc.player.addCookies.useMutation({
    onSuccess: () => {
      utils.player.me.invalidate();
      toast.success("Progress reset!");
      setShowResetConfirm(false);
    },
  });

  const handleResetProgress = () => {
    if (!isAuthenticated) {
      toast.error("Login to reset progress");
      return;
    }
    resetMutation.mutate({ amount: 1000 });
  };

  return (
    <PageShell title="Settings" icon={<SettingsIcon className="w-5 h-5" />} maxWidth="max-w-lg">
      <div className="space-y-6">
        <div className="glass-panel p-4">
          <h2 className="text-white/60 text-xs font-bold uppercase mb-3">Account</h2>
          {isAuthenticated ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">
                  {(user?.name ?? "?").charAt(0)}
                </div>
                <div>
                  <div className="text-white font-bold">{user?.name}</div>
                  <div className="text-white/50 text-sm">{user?.email}</div>
                </div>
              </div>
              <Button onClick={logout} variant="outline" className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10">
                Logout
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-white/50 mb-3">Login to save your progress!</p>
              <Button onClick={() => navigate("/login")} className="bg-amber-500 hover:bg-amber-600">
                Login
              </Button>
            </div>
          )}
        </div>

        {/* Audio Section */}
        <div className="glass-panel p-4">
          <h2 className="text-white/60 text-xs font-bold uppercase mb-3">Audio</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {soundEnabled ? <Volume2 className="w-5 h-5 text-white/70" /> : <VolumeX className="w-5 h-5 text-white/70" />}
                <span>Sound Effects</span>
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-12 h-7 rounded-full transition-all ${soundEnabled ? "bg-green-500" : "bg-gray-600"}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-all ${soundEnabled ? "ml-6" : "ml-1"}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {musicEnabled ? <Volume2 className="w-5 h-5 text-white/70" /> : <VolumeX className="w-5 h-5 text-white/70" />}
                <span>Background Music</span>
              </div>
              <button
                onClick={() => setMusicEnabled(!musicEnabled)}
                className={`w-12 h-7 rounded-full transition-all ${musicEnabled ? "bg-green-500" : "bg-gray-600"}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-all ${musicEnabled ? "ml-6" : "ml-1"}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
          <h2 className="text-red-400 text-xs font-bold uppercase mb-3 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" /> Danger Zone
          </h2>
          {!showResetConfirm ? (
            <Button
              onClick={() => setShowResetConfirm(true)}
              variant="outline"
              className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Progress
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-red-400 text-sm">Are you sure? This cannot be undone!</p>
              <div className="flex gap-2">
                <Button onClick={handleResetProgress} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                  Yes, Reset
                </Button>
                <Button onClick={() => setShowResetConfirm(false)} variant="outline" className="flex-1 border-white/20 text-white">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* About */}
        <div className="text-center text-white/30 text-xs pt-4">
          <p>Cookie Blackjack v1.0</p>
          <p>Built with love and cookies</p>
        </div>
      </div>
    </PageShell>
  );
}
