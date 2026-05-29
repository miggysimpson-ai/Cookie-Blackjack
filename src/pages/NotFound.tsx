import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Home, Cookie } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <Cookie className="w-16 h-16 text-amber-400 mb-4 animate-float opacity-60" />
      <h1 className="font-display text-6xl font-black text-white/20">404</h1>
      <p className="text-white/60 mt-2 mb-8">This table doesn&apos;t exist.</p>
      <Button
        onClick={() => navigate("/")}
        className="btn-casino bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-8"
      >
        <Home className="w-5 h-5 mr-2" />
        Back to lobby
      </Button>
    </div>
  );
}
