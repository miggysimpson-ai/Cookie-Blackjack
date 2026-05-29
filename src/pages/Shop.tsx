import { useState } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { formatCookies } from "@/lib/levels";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Check, ShoppingBag, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Shop() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: player } = trpc.player.me.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: inventory } = trpc.shop.myInventory.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: cardSkins } = trpc.shop.cardSkins.useQuery();
  const { data: tableSkins } = trpc.shop.tableSkins.useQuery();

  const buyCardSkin = trpc.shop.buyCardSkin.useMutation({
    onSuccess: (data) => {
      utils.player.me.setData(undefined, (old) =>
        old ? { ...old, cookies: data.newBalance } : old,
      );
      void utils.player.me.invalidate();
      void utils.shop.myInventory.invalidate();
      toast.success("Card skin purchased!");
    },
    onError: (err) => toast.error(err.message),
  });
  const buyTableSkin = trpc.shop.buyTableSkin.useMutation({
    onSuccess: (data) => {
      utils.player.me.setData(undefined, (old) =>
        old ? { ...old, cookies: data.newBalance } : old,
      );
      void utils.player.me.invalidate();
      void utils.shop.myInventory.invalidate();
      toast.success("Table skin purchased!");
    },
    onError: (err) => toast.error(err.message),
  });
  const equipMutation = trpc.player.update.useMutation({
    onSuccess: () => {
      void utils.player.me.invalidate();
      toast.success("Skin equipped!");
    },
    onError: (err) => toast.error(err.message),
  });

  const [activeTab, setActiveTab] = useState<"cards" | "tables">("cards");

  const ownedCardIds = new Set((inventory?.cardSkins ?? []).map((s) => s.id));
  const ownedTableIds = new Set((inventory?.tableSkins ?? []).map((s) => s.id));
  const cookies = player?.cookies ?? 0;
  const equippedCardId = player?.equippedCardSkin?.id;
  const equippedTableId = player?.equippedTableSkin?.id;

  return (
    <PageShell
      title="Cookie Shop"
      icon={<ShoppingBag className="w-5 h-5 text-amber-400" />}
      maxWidth="max-w-4xl"
      headerRight={
        <div className="flex items-center gap-1.5 bg-amber-500/20 rounded-full px-2.5 py-1 border border-amber-500/30">
          <img src="/assets/cookie-icon.png" alt="" className="w-4 h-4" />
          <span className="text-amber-300 font-bold text-sm">
            {formatCookies(cookies)}
          </span>
        </div>
      }
    >
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("cards")}
            className={cn(
              "flex-1 py-3 rounded-xl font-bold text-center transition-all btn-casino",
              activeTab === "cards"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-glow-sm"
                : "glass-panel text-white/60 hover:text-white",
            )}
          >
            Card Skins
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tables")}
            className={cn(
              "flex-1 py-3 rounded-xl font-bold text-center transition-all btn-casino",
              activeTab === "tables"
                ? "bg-gradient-to-r from-emerald-600 to-green-500 text-white"
                : "glass-panel text-white/60 hover:text-white",
            )}
          >
            Table Skins
          </button>
        </div>

        {activeTab === "cards" && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-8">
            {(cardSkins ?? []).map((skin) => {
              const owned = ownedCardIds.has(skin.id);
              const equipped = equippedCardId === skin.id;
              const canAfford = cookies >= skin.price;

              return (
                <div
                  key={skin.id}
                  className={cn(
                    "glass-panel overflow-hidden transition-all hover:scale-[1.02]",
                    equipped && "ring-2 ring-amber-400/50 border-amber-400/40",
                  )}
                >
                  <div
                    className="aspect-[2/3] relative flex items-center justify-center p-3"
                    style={{
                      background: skin.themeColor
                        ? `linear-gradient(160deg, ${skin.themeColor} 0%, #1a1a2e 100%)`
                        : "#1f2937",
                    }}
                  >
                    <img
                      src={skin.imageUrl}
                      alt={skin.name}
                      className="w-full h-full object-contain rounded-lg drop-shadow-lg"
                      onError={(e) => {
                        e.currentTarget.src = "/assets/cookie-icon.png";
                      }}
                    />
                    {equipped && (
                      <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        Equipped
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm">{skin.name}</h3>
                    <p className="text-white/50 text-xs mb-2 line-clamp-2">
                      {skin.description}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <img
                          src="/assets/cookie-icon.png"
                          alt=""
                          className="w-4 h-4"
                        />
                        <span
                          className={`text-sm font-bold ${owned ? "text-green-400" : canAfford ? "text-yellow-400" : "text-red-400"}`}
                        >
                          {skin.price === 0
                            ? "Free"
                            : formatCookies(skin.price)}
                        </span>
                      </div>
                      {owned ? (
                        equipped ? (
                          <Check className="w-5 h-5 text-green-400 shrink-0" />
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10 text-xs h-7 px-2"
                            onClick={() =>
                              equipMutation.mutate({
                                equippedCardSkin: skin.id,
                              })
                            }
                          >
                            Equip
                          </Button>
                        )
                      ) : (
                        <Button
                          size="sm"
                          disabled={
                            !canAfford ||
                            !isAuthenticated ||
                            buyCardSkin.isPending
                          }
                          className="bg-amber-500 hover:bg-amber-600 text-white text-xs h-7 px-2"
                          onClick={() =>
                            buyCardSkin.mutate({ cardSkinId: skin.id })
                          }
                        >
                          <ShoppingCart className="w-3 h-3 mr-1" />
                          Buy
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "tables" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
            {(tableSkins ?? []).map((skin) => {
              const owned = ownedTableIds.has(skin.id);
              const equipped = equippedTableId === skin.id;
              const canAfford = cookies >= skin.price;

              return (
                <div
                  key={skin.id}
                  className={cn(
                    "glass-panel overflow-hidden relative transition-all hover:scale-[1.01]",
                    equipped && "ring-2 ring-amber-400/50",
                  )}
                >
                  <div
                    className="h-36 flex flex-col items-center justify-center gap-2"
                    style={{
                      background:
                        skin.cssGradient ??
                        "radial-gradient(circle at center, #4CAF50 0%, #2E7D32 100%)",
                    }}
                  >
                    <span className="text-white/90 font-black text-lg drop-shadow">
                      {skin.name}
                    </span>
                    <span className="text-white/50 text-xs px-4 text-center">
                      Preview
                    </span>
                    {equipped && (
                      <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        Equipped
                      </div>
                    )}
                  </div>
                  <div className="p-3 border-t border-white/10">
                    <p className="text-white/50 text-xs mb-2">
                      {skin.description}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <img
                          src="/assets/cookie-icon.png"
                          alt=""
                          className="w-4 h-4"
                        />
                        <span
                          className={`text-sm font-bold ${owned ? "text-green-400" : canAfford ? "text-yellow-400" : "text-red-400"}`}
                        >
                          {skin.price === 0
                            ? "Free"
                            : formatCookies(skin.price)}
                        </span>
                      </div>
                      {owned ? (
                        equipped ? (
                          <div className="flex items-center gap-1 text-green-400 text-xs shrink-0">
                            <Check className="w-4 h-4" /> Equipped
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10 text-xs h-7 px-2"
                            onClick={() =>
                              equipMutation.mutate({
                                equippedTableSkin: skin.id,
                              })
                            }
                          >
                            Equip
                          </Button>
                        )
                      ) : (
                        <Button
                          size="sm"
                          disabled={
                            !canAfford ||
                            !isAuthenticated ||
                            buyTableSkin.isPending
                          }
                          className="bg-green-600 hover:bg-green-700 text-white text-xs h-7 px-2"
                          onClick={() =>
                            buyTableSkin.mutate({ tableSkinId: skin.id })
                          }
                        >
                          <ShoppingCart className="w-3 h-3 mr-1" />
                          Buy
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isAuthenticated && (
          <div className="text-center py-8">
            <p className="text-white/50 mb-4">
              Login to purchase and equip skins!
            </p>
            <Button
              onClick={() => navigate("/login")}
              className="bg-amber-500 hover:bg-amber-600"
            >
              Login
            </Button>
          </div>
        )}
    </PageShell>
  );
}
