import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  int,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

// ─── Users (auth system) ───────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Players (game profile) ────────────────────────────────────────────
export const players = mysqlTable("players", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().unique(),
  cookies: bigint("cookies", { mode: "number" }).default(1000).notNull(),
  level: int("level").default(1).notNull(),
  totalWon: bigint("totalWon", { mode: "number" }).default(0).notNull(),
  totalLost: bigint("totalLost", { mode: "number" }).default(0).notNull(),
  handsPlayed: int("handsPlayed").default(0).notNull(),
  handsWon: int("handsWon").default(0).notNull(),
  handsLost: int("handsLost").default(0).notNull(),
  handsPushed: int("handsPushed").default(0).notNull(),
  equippedCardSkin: bigint("equippedCardSkin", { mode: "number", unsigned: true }),
  equippedTableSkin: bigint("equippedTableSkin", { mode: "number", unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Player = typeof players.$inferSelect;

// ─── Card Skins (shop catalog) ─────────────────────────────────────────
export const cardSkins = mysqlTable("card_skins", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: varchar("description", { length: 255 }),
  imageUrl: varchar("imageUrl", { length: 500 }).notNull(),
  price: int("price").notNull(),
  themeColor: varchar("themeColor", { length: 20 }),
  isDefault: boolean("isDefault").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CardSkin = typeof cardSkins.$inferSelect;

// ─── Table Skins (shop catalog) ────────────────────────────────────────
export const tableSkins = mysqlTable("table_skins", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: varchar("description", { length: 255 }),
  imageUrl: varchar("imageUrl", { length: 500 }),
  cssGradient: varchar("cssGradient", { length: 500 }),
  price: int("price").notNull(),
  isDefault: boolean("isDefault").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TableSkin = typeof tableSkins.$inferSelect;

// ─── Player Inventory (owned items) ────────────────────────────────────
export const playerInventory = mysqlTable("player_inventory", {
  id: serial("id").primaryKey(),
  playerId: bigint("playerId", { mode: "number", unsigned: true }).notNull(),
  cardSkinId: bigint("cardSkinId", { mode: "number", unsigned: true }),
  tableSkinId: bigint("tableSkinId", { mode: "number", unsigned: true }),
  purchasedAt: timestamp("purchasedAt").defaultNow().notNull(),
});

// ─── Game Sessions (hand results) ──────────────────────────────────────
export const gameSessions = mysqlTable("game_sessions", {
  id: serial("id").primaryKey(),
  playerId: bigint("playerId", { mode: "number", unsigned: true }).notNull(),
  level: int("level").notNull(),
  betAmount: int("betAmount").notNull(),
  winAmount: int("winAmount").default(0).notNull(),
  outcome: mysqlEnum("outcome", ["win", "loss", "push", "blackjack"]).notNull(),
  playerScore: int("playerScore"),
  playerHand: json("playerHand").$type<{ suit: string; rank: string; value: number }[]>(),
  dealerScore: int("dealerScore"),
  dealerHand: json("dealerHand").$type<{ suit: string; rank: string; value: number }[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GameSession = typeof gameSessions.$inferSelect;

// ─── Contacts (Leave a Note) ───────────────────────────────────────────
export const contacts = mysqlTable("contacts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Conversations (AI Help Desk) ──────────────────────────────────────
export const conversations = mysqlTable("conversations", {
  id: serial("id").primaryKey(),
  playerId: bigint("playerId", { mode: "number", unsigned: true }),
  sessionId: varchar("sessionId", { length: 100 }).notNull(),
  title: varchar("title", { length: 200 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ─── Messages (AI Help Desk) ───────────────────────────────────────────
export const messages = mysqlTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: bigint("conversationId", { mode: "number", unsigned: true }).notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
