import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import {
  leaderboardByWealth,
  leaderboardByWins,
  getMyRank,
} from "./queries/store";

export const leaderboardRouter = createRouter({
  byWealth: publicQuery
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(50),
          period: z.enum(["all", "week", "today"]).default("all"),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const limit = input?.limit ?? 50;
      return leaderboardByWealth(limit);
    }),

  byWins: publicQuery
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(50),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const limit = input?.limit ?? 50;
      return leaderboardByWins(limit);
    }),

  myRank: authedQuery.query(async ({ ctx }) => {
    return getMyRank(ctx.user.id);
  }),
});
