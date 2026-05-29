import { eq, desc, count, sql, and } from "drizzle-orm";
import type { InsertUser, Player, GameSession } from "@db/schema";
import {
  players,
  gameSessions,
  cardSkins,
  tableSkins,
  users,
  playerInventory,
} from "@db/schema";
import { getDb, isDevStore } from "./connection";
import * as dev from "../lib/dev-store";
import { env } from "../lib/env";

export { isDevStore };

export async function findUserByUnionId(unionId: string) {
  if (isDevStore()) return dev.findUserByUnionId(unionId);
  const rows = await getDb()
    .select()
    .from(users)
    .where(eq(users.unionId, unionId))
    .limit(1);
  return rows.at(0);
}

export async function upsertUser(data: InsertUser) {
  if (isDevStore()) {
    const values = { ...data };
    if (
      values.role === undefined &&
      values.unionId &&
      values.unionId === env.ownerUnionId
    ) {
      values.role = "admin";
    }
    dev.upsertUser(values);
    return;
  }

  const values = { ...data };
  const updateSet: Partial<InsertUser> = {
    lastSignInAt: new Date(),
    ...data,
  };

  if (
    values.role === undefined &&
    values.unionId &&
    values.unionId === env.ownerUnionId
  ) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  await getDb()
    .insert(users)
    .values(values)
    .onDuplicateKeyUpdate({ set: updateSet });
}

export async function findPlayerByUserId(userId: number) {
  if (isDevStore()) return dev.findPlayerByUserId(userId);
  return getDb().query.players.findFirst({
    where: eq(players.userId, userId),
  });
}

export async function findPlayerById(playerId: number) {
  if (isDevStore()) return dev.findPlayerById(playerId);
  return getDb().query.players.findFirst({
    where: eq(players.id, playerId),
  });
}

export async function getOrCreatePlayer(userId: number) {
  if (isDevStore()) return dev.getOrCreatePlayer(userId);
  const db = getDb();
  let player = await db.query.players.findFirst({
    where: eq(players.userId, userId),
  });
  if (player) return player;

  const defaultCardSkin = await db.query.cardSkins.findFirst({
    where: eq(cardSkins.isDefault, true),
  });
  const defaultTableSkin = await db.query.tableSkins.findFirst({
    where: eq(tableSkins.isDefault, true),
  });

  await db.insert(players).values({
    userId,
    cookies: 1000,
    level: 1,
    equippedCardSkin: defaultCardSkin?.id ?? 1,
    equippedTableSkin: defaultTableSkin?.id ?? 1,
  });

  player = await db.query.players.findFirst({
    where: eq(players.userId, userId),
  });
  if (!player) throw new Error("Failed to create player");
  return player;
}

export async function updatePlayer(
  playerId: number,
  updates: Partial<
    Pick<
      Player,
      | "cookies"
      | "level"
      | "totalWon"
      | "totalLost"
      | "handsPlayed"
      | "handsWon"
      | "handsLost"
      | "handsPushed"
      | "equippedCardSkin"
      | "equippedTableSkin"
    >
  >,
) {
  if (isDevStore()) return dev.updatePlayer(playerId, updates);
  await getDb().update(players).set(updates).where(eq(players.id, playerId));
  const player = await findPlayerById(playerId);
  if (!player) throw new Error("Player not found");
  return player;
}

export async function insertGameSession(
  data: Omit<GameSession, "id" | "createdAt">,
): Promise<number> {
  if (isDevStore()) return dev.insertGameSession(data);
  const result = await getDb().insert(gameSessions).values(data);
  return Number(result[0].insertId);
}

export async function updateGameSession(
  sessionId: number,
  data: Partial<Omit<GameSession, "id" | "createdAt">>,
) {
  if (isDevStore()) {
    dev.updateGameSession(sessionId, data);
    return;
  }
  await getDb()
    .update(gameSessions)
    .set(data)
    .where(eq(gameSessions.id, sessionId));
}

export async function listGameSessionsForPlayer(playerId: number, limit = 50) {
  if (isDevStore()) return dev.listGameSessionsForPlayer(playerId, limit);
  return getDb()
    .select()
    .from(gameSessions)
    .where(eq(gameSessions.playerId, playerId))
    .orderBy(gameSessions.createdAt)
    .limit(limit);
}

export async function listCardSkins() {
  if (isDevStore()) return dev.listCardSkins();
  return getDb().select().from(cardSkins).orderBy(cardSkins.price);
}

export async function listTableSkins() {
  if (isDevStore()) return dev.listTableSkins();
  return getDb().select().from(tableSkins).orderBy(tableSkins.price);
}

export async function getCardSkin(id: number) {
  if (isDevStore()) return dev.getCardSkin(id);
  return getDb().query.cardSkins.findFirst({ where: eq(cardSkins.id, id) });
}

export async function getTableSkin(id: number) {
  if (isDevStore()) return dev.getTableSkin(id);
  return getDb().query.tableSkins.findFirst({ where: eq(tableSkins.id, id) });
}

export async function getPlayerInventory(playerId: number) {
  if (isDevStore()) return dev.getPlayerInventory(playerId);
  const db = getDb();
  const inventory = await db.query.playerInventory.findMany({
    where: eq(playerInventory.playerId, playerId),
    with: { cardSkin: true, tableSkin: true },
  });
  return {
    cardSkins: inventory.filter((i) => i.cardSkin).map((i) => i.cardSkin!),
    tableSkins: inventory.filter((i) => i.tableSkin).map((i) => i.tableSkin!),
  };
}

export async function playerOwnsCardSkin(
  playerId: number,
  skinId: number,
): Promise<boolean> {
  if (isDevStore()) return dev.ownsCardSkin(playerId, skinId);
  const skin = await getCardSkin(skinId);
  if (!skin) return false;
  if (skin.isDefault || skin.price === 0) return true;
  const db = getDb();
  const row = await db.query.playerInventory.findFirst({
    where: and(
      eq(playerInventory.playerId, playerId),
      eq(playerInventory.cardSkinId, skinId),
    ),
  });
  return !!row;
}

export async function playerOwnsTableSkin(
  playerId: number,
  skinId: number,
): Promise<boolean> {
  if (isDevStore()) return dev.ownsTableSkin(playerId, skinId);
  const skin = await getTableSkin(skinId);
  if (!skin) return false;
  if (skin.isDefault || skin.price === 0) return true;
  const db = getDb();
  const row = await db.query.playerInventory.findFirst({
    where: and(
      eq(playerInventory.playerId, playerId),
      eq(playerInventory.tableSkinId, skinId),
    ),
  });
  return !!row;
}

export async function grantCardSkin(playerId: number, skinId: number) {
  if (isDevStore()) {
    dev.addCardSkinToInventory(playerId, skinId);
    return;
  }
  const db = getDb();
  await db.insert(playerInventory).values({ playerId, cardSkinId: skinId });
}

export async function grantTableSkin(playerId: number, skinId: number) {
  if (isDevStore()) {
    dev.addTableSkinToInventory(playerId, skinId);
    return;
  }
  const db = getDb();
  await db.insert(playerInventory).values({ playerId, tableSkinId: skinId });
}

export async function getPlayerProfile(userId: number) {
  const player = await getOrCreatePlayer(userId);
  const equippedCard = player.equippedCardSkin
    ? await getCardSkin(player.equippedCardSkin)
    : null;
  const equippedTable = player.equippedTableSkin
    ? await getTableSkin(player.equippedTableSkin)
    : null;

  return {
    ...player,
    inventory: [],
    equippedCardSkin: equippedCard,
    equippedTableSkin: equippedTable,
  };
}

export async function leaderboardByWealth(limit: number) {
  if (isDevStore()) return dev.leaderboardByWealth(limit);
  const results = await getDb()
    .select({
      id: players.id,
      cookies: players.cookies,
      level: players.level,
      handsPlayed: players.handsPlayed,
      handsWon: players.handsWon,
      name: users.name,
      avatar: users.avatar,
    })
    .from(players)
    .innerJoin(users, eq(players.userId, users.id))
    .orderBy(desc(players.cookies))
    .limit(limit);

  return results.map((r, i) => ({ rank: i + 1, ...r }));
}

export async function leaderboardByWins(limit: number) {
  if (isDevStore()) return dev.leaderboardByWins(limit);
  const results = await getDb()
    .select({
      id: players.id,
      cookies: players.cookies,
      level: players.level,
      handsPlayed: players.handsPlayed,
      handsWon: players.handsWon,
      name: users.name,
      avatar: users.avatar,
    })
    .from(players)
    .innerJoin(users, eq(players.userId, users.id))
    .orderBy(desc(players.handsWon))
    .limit(limit);

  return results.map((r, i) => ({
    rank: i + 1,
    winRate:
      r.handsPlayed > 0 ? Math.round((r.handsWon / r.handsPlayed) * 100) : 0,
    ...r,
  }));
}

export async function getMyRank(userId: number) {
  const player = await findPlayerByUserId(userId);
  if (!player) return null;

  if (isDevStore()) {
    return {
      rank: dev.countPlayersRicherThan(player.cookies) + 1,
      cookies: player.cookies,
      level: player.level,
      handsPlayed: player.handsPlayed,
      handsWon: player.handsWon,
    };
  }

  const higherCount = await getDb()
    .select({ count: sql<number>`count(*)` })
    .from(players)
    .where(sql`${players.cookies} > ${player.cookies}`);

  return {
    rank: (higherCount[0]?.count ?? 0) + 1,
    cookies: player.cookies,
    level: player.level,
    handsPlayed: player.handsPlayed,
    handsWon: player.handsWon,
  };
}

export async function countGameSessions(playerId: number) {
  if (isDevStore()) {
    return dev.listGameSessionsForPlayer(playerId, 10_000).length;
  }
  const totalHands = await getDb()
    .select({ count: count() })
    .from(gameSessions)
    .where(eq(gameSessions.playerId, playerId));
  return totalHands[0]?.count ?? 0;
}
