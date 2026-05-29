import { relations } from "drizzle-orm";
import {
  users,
  players,
  cardSkins,
  tableSkins,
  playerInventory,
  gameSessions,
  conversations,
  messages,
} from "./schema";

export const usersRelations = relations(users, ({ one }) => ({
  player: one(players, {
    fields: [users.id],
    references: [players.userId],
  }),
}));

export const playersRelations = relations(players, ({ one, many }) => ({
  user: one(users, {
    fields: [players.userId],
    references: [users.id],
  }),
  inventory: many(playerInventory),
  gameSessions: many(gameSessions),
  conversations: many(conversations),
}));

export const cardSkinsRelations = relations(cardSkins, ({ many }) => ({
  inventory: many(playerInventory),
}));

export const tableSkinsRelations = relations(tableSkins, ({ many }) => ({
  inventory: many(playerInventory),
}));

export const playerInventoryRelations = relations(playerInventory, ({ one }) => ({
  player: one(players, {
    fields: [playerInventory.playerId],
    references: [players.id],
  }),
  cardSkin: one(cardSkins, {
    fields: [playerInventory.cardSkinId],
    references: [cardSkins.id],
  }),
  tableSkin: one(tableSkins, {
    fields: [playerInventory.tableSkinId],
    references: [tableSkins.id],
  }),
}));

export const gameSessionsRelations = relations(gameSessions, ({ one }) => ({
  player: one(players, {
    fields: [gameSessions.playerId],
    references: [players.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  player: one(players, {
    fields: [conversations.playerId],
    references: [players.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));
