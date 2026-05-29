import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { conversations, messages, players } from "@db/schema";
import { eq, desc } from "drizzle-orm";

// Help desk conversation storage (responses are built-in on the client)

export const helpRouter = createRouter({
  createConversation: publicQuery
    .input(
      z.object({
        title: z.string().min(1).max(200),
        sessionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      let playerId: number | undefined;
      if (ctx.user) {
        const player = await db.query.players.findFirst({
          where: eq(players.userId, ctx.user.id),
        });
        if (player) playerId = player.id;
      }

      const result = await db.insert(conversations).values({
        title: input.title,
        sessionId: input.sessionId,
        playerId,
      });

      return { success: true, id: Number(result[0].insertId) };
    }),

  getConversation: publicQuery
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();

      const conversation = await db.query.conversations.findFirst({
        where: eq(conversations.id, input.conversationId),
        with: {
          messages: {
            orderBy: messages.createdAt,
          },
        },
      });

      return conversation;
    }),

  sendMessage: publicQuery
    .input(
      z.object({
        conversationId: z.number(),
        content: z.string().min(1).max(4000),
        role: z.enum(["user", "assistant"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      await db.insert(messages).values({
        conversationId: input.conversationId,
        role: input.role,
        content: input.content,
      });

      // Update conversation updatedAt
      await db
        .update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, input.conversationId));

      return { success: true };
    }),

  listConversations: authedQuery.query(async ({ ctx }) => {
    const db = getDb();

    const player = await db.query.players.findFirst({
      where: eq(players.userId, ctx.user.id),
    });

    if (!player) return [];

    return db
      .select()
      .from(conversations)
      .where(eq(conversations.playerId, player.id))
      .orderBy(desc(conversations.updatedAt));
  }),
});
