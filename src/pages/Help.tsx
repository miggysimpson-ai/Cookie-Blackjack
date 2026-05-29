import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getHelpResponse } from "@/lib/help-responses";
import { ArrowLeft, Wand2, Send, User, Cookie, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "How do I play?",
  "What are the levels?",
  "How does the shop work?",
  "Tips to win cookies",
];

export default function Help() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Welcome to Cookie Blackjack! I'm your bakery dealer guide — ask about rules, strategy, levels, or the cookie shop.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage = text.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    await new Promise((r) => setTimeout(r, 280));
    const reply = getHelpResponse(userMessage);
    setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,200,66,0.1)_0%,_transparent_55%)]" />

      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/55 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
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
            <span className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-glow-sm">
              <Wand2 className="w-4 h-4 text-white" />
            </span>
            Cookie Oracle
          </h1>
          <div className="w-[4.5rem]" />
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-5 relative z-10"
      >
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <div
              key={`${i}-${msg.role}`}
              className={cn(
                "flex gap-3 opacity-0-start animate-fade-up",
                msg.role === "user" && "flex-row-reverse",
              )}
              style={{ animationDelay: `${Math.min(i * 0.04, 0.2)}s` }}
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-md",
                  msg.role === "assistant"
                    ? "bg-gradient-to-br from-amber-500 to-orange-600"
                    : "bg-gradient-to-br from-emerald-600 to-green-500",
                )}
              >
                {msg.role === "assistant" ? (
                  <Cookie className="w-4 h-4 text-white" strokeWidth={2.5} />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>

              <div
                className={cn(
                  "max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap border",
                  msg.role === "assistant"
                    ? "glass-panel text-white/90 border-white/10"
                    : "bg-amber-500/15 text-white border-amber-500/25",
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div className="glass-panel rounded-2xl px-5 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                <span className="text-white/50 text-sm">Crumbing wisdom…</span>
              </div>
            </div>
          )}

          {messages.length === 1 && !isLoading && (
            <div className="pt-2 flex flex-wrap gap-2 justify-center opacity-0-start animate-fade-up stagger-3">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => void sendMessage(q)}
                  className="text-xs px-3 py-2 rounded-full border border-white/15 bg-white/5 text-white/70 hover:text-white hover:border-amber-500/40 hover:bg-amber-500/10 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 z-20 border-t border-white/10 bg-black/55 backdrop-blur-xl px-4 py-3">
        <div className="max-w-2xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about rules, strategy, or the shop…"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/35 flex-1 focus-visible:ring-amber-500/50"
          />
          <Button
            onClick={() => void sendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="btn-casino bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white px-4 shadow-glow-sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-center text-white/25 text-xs mt-2 max-w-2xl mx-auto">
          Built-in game guide — no account required
        </p>
      </div>
    </div>
  );
}
