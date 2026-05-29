import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PageShell({
  title,
  icon,
  children,
  maxWidth = "max-w-2xl",
  headerRight,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  maxWidth?: string;
  headerRight?: ReactNode;
}) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,200,66,0.1)_0%,_transparent_50%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(27,94,32,0.06)_0%,_transparent_40%)]" />

      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div
          className={cn(
            "mx-auto flex items-center justify-between px-4 py-3",
            maxWidth,
          )}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-white/80 hover:text-white hover:bg-white/10 -ml-2"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Menu
          </Button>
          <h1 className="font-display text-lg font-bold text-white flex items-center gap-2">
            {icon}
            {title}
          </h1>
          <div className="min-w-[4.5rem] flex justify-end">{headerRight}</div>
        </div>
      </header>

      <main
        className={cn(
          "mx-auto px-4 py-6 animate-fade-in opacity-0-start",
          maxWidth,
        )}
        style={{ animationDelay: "0.1s" }}
      >
        {children}
      </main>
    </div>
  );
}
