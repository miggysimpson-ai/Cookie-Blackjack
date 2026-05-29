import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import {
  listCardSkins,
  listTableSkins,
  findPlayerByUserId,
  getOrCreatePlayer,
  updatePlayer,
  getCardSkin,
  getTableSkin,
  getPlayerInventory,
  playerOwnsCardSkin,
  playerOwnsTableSkin,
  grantCardSkin,
  grantTableSkin,
} from "./queries/store";

export const shopRouter = createRouter({
  cardSkins: publicQuery.query(async () => listCardSkins()),

  tableSkins: publicQuery.query(async () => listTableSkins()),

  buyCardSkin: authedQuery
    .input(z.object({ cardSkinId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const player = await getOrCreatePlayer(ctx.user.id);
      const skin = await getCardSkin(input.cardSkinId);
      if (!skin) throw new Error("Card skin not found");

      if (await playerOwnsCardSkin(player.id, input.cardSkinId)) {
        throw new Error("Already owned");
      }
      if (player.cookies < skin.price) throw new Error("Insufficient cookies");

      const updated = await updatePlayer(player.id, {
        cookies: player.cookies - skin.price,
        equippedCardSkin: input.cardSkinId,
      });

      await grantCardSkin(player.id, input.cardSkinId);

      return { success: true, newBalance: updated.cookies };
    }),

  buyTableSkin: authedQuery
    .input(z.object({ tableSkinId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const player = await getOrCreatePlayer(ctx.user.id);
      const skin = await getTableSkin(input.tableSkinId);
      if (!skin) throw new Error("Table skin not found");

      if (await playerOwnsTableSkin(player.id, input.tableSkinId)) {
        throw new Error("Already owned");
      }
      if (player.cookies < skin.price) throw new Error("Insufficient cookies");

      const updated = await updatePlayer(player.id, {
        cookies: player.cookies - skin.price,
        equippedTableSkin: input.tableSkinId,
      });

      await grantTableSkin(player.id, input.tableSkinId);

      return { success: true, newBalance: updated.cookies };
    }),

  myInventory: authedQuery.query(async ({ ctx }) => {
    const player = await findPlayerByUserId(ctx.user.id);
    if (!player) return { cardSkins: [], tableSkins: [] };
    return getPlayerInventory(player.id);
  }),
});
