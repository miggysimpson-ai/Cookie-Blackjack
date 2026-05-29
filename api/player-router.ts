import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import {
  findPlayerByUserId,
  getPlayerProfile,
  updatePlayer,
  countGameSessions,
  listGameSessionsForPlayer,
} from "./queries/store";

export const playerRouter = createRouter({
  me: authedQuery.query(async ({ ctx }) => {
    return getPlayerProfile(ctx.user.id);
  }),

  update: authedQuery
    .input(
      z.object({
        equippedCardSkin: z.number().optional(),
        equippedTableSkin: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const player = await findPlayerByUserId(ctx.user.id);
      if (!player) throw new Error("Player not found");

      await updatePlayer(player.id, {
        ...(input.equippedCardSkin !== undefined && {
          equippedCardSkin: input.equippedCardSkin,
        }),
        ...(input.equippedTableSkin !== undefined && {
          equippedTableSkin: input.equippedTableSkin,
        }),
      });

      return { success: true };
    }),

  stats: authedQuery.query(async ({ ctx }) => {
    const player = await findPlayerByUserId(ctx.user.id);
    if (!player) return null;

    const recentSessions = await listGameSessionsForPlayer(player.id, 20);

    return {
      ...player,
      totalHandsPlayed: await countGameSessions(player.id),
      recentSessions,
    };
  }),

  addCookies: authedQuery
    .input(z.object({ amount: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const player = await findPlayerByUserId(ctx.user.id);
      if (!player) throw new Error("Player not found");

      const updated = await updatePlayer(player.id, {
        cookies: player.cookies + input.amount,
      });

      return { success: true, newBalance: updated.cookies };
    }),
});
