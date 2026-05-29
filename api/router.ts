import { authRouter } from "./auth-router";
import { playerRouter } from "./player-router";
import { gameRouter } from "./game-router";
import { shopRouter } from "./shop-router";
import { leaderboardRouter } from "./leaderboard-router";
import { contactRouter } from "./contact-router";
import { helpRouter } from "./help-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  player: playerRouter,
  game: gameRouter,
  shop: shopRouter,
  leaderboard: leaderboardRouter,
  contact: contactRouter,
  help: helpRouter,
});

export type AppRouter = typeof appRouter;
