import fs from "node:fs";
import path from "node:path";
import {
  CARD_SKIN_CATALOG,
  TABLE_SKIN_CATALOG,
} from "@contracts/shop-catalog";
import type {
  CardSkin,
  GameSession,
  InsertUser,
  Player,
  TableSkin,
  User,
} from "@db/schema";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "dev-store.json");

export const STARTING_COOKIES = 1000;

type InventoryRow = {
  playerId: number;
  cardSkinId?: number;
  tableSkinId?: number;
};

type StoreFile = {
  users: User[];
  players: Player[];
  cardSkins: CardSkin[];
  tableSkins: TableSkin[];
  gameSessions: GameSession[];
  inventory: InventoryRow[];
  nextUserId: number;
  nextPlayerId: number;
  nextSessionId: number;
};

function now() {
  return new Date();
}

function buildCardSkins(): CardSkin[] {
  return CARD_SKIN_CATALOG.map((skin, index) => ({
    id: index + 1,
    name: skin.name,
    description: skin.description,
    imageUrl: skin.imageUrl,
    price: skin.price,
    themeColor: skin.themeColor,
    isDefault: skin.isDefault ?? false,
    createdAt: now(),
  }));
}

function buildTableSkins(): TableSkin[] {
  return TABLE_SKIN_CATALOG.map((skin, index) => ({
    id: index + 1,
    name: skin.name,
    description: skin.description,
    imageUrl: null,
    cssGradient: skin.cssGradient,
    price: skin.price,
    isDefault: skin.isDefault ?? false,
    createdAt: now(),
  }));
}

function defaultStore(): StoreFile {
  return {
    users: [],
    players: [],
    cardSkins: buildCardSkins(),
    tableSkins: buildTableSkins(),
    gameSessions: [],
    inventory: [],
    nextUserId: 1,
    nextPlayerId: 1,
    nextSessionId: 1,
  };
}

function reviveDates<T extends Record<string, unknown>>(row: T): T {
  const out = { ...row };
  for (const key of Object.keys(out)) {
    const val = out[key];
    if (
      typeof val === "string" &&
      /At$/.test(key) &&
      /^\d{4}-\d{2}-\d{2}T/.test(val)
    ) {
      (out as Record<string, unknown>)[key] = new Date(val);
    }
  }
  return out;
}

function migrateStore(raw: StoreFile): StoreFile {
  const catalog = defaultStore();
  return {
    ...raw,
    cardSkins:
      raw.cardSkins?.length >= catalog.cardSkins.length
        ? raw.cardSkins
        : catalog.cardSkins,
    tableSkins:
      raw.tableSkins?.length >= catalog.tableSkins.length
        ? raw.tableSkins
        : catalog.tableSkins,
    inventory: raw.inventory ?? [],
  };
}

function loadStore(): StoreFile {
  if (!fs.existsSync(STORE_FILE)) {
    const fresh = defaultStore();
    saveStore(fresh);
    return fresh;
  }
  const raw = migrateStore(
    JSON.parse(fs.readFileSync(STORE_FILE, "utf8")) as StoreFile,
  );
  return {
    ...raw,
    users: raw.users.map((u) => reviveDates(u) as User),
    players: raw.players.map((p) => reviveDates(p) as Player),
    cardSkins: raw.cardSkins.map((s) => reviveDates(s) as CardSkin),
    tableSkins: raw.tableSkins.map((s) => reviveDates(s) as TableSkin),
    gameSessions: raw.gameSessions.map((s) => reviveDates(s) as GameSession),
  };
}

function saveStore(store: StoreFile) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
}

function mutate(mutator: (store: StoreFile) => void) {
  const store = loadStore();
  mutator(store);
  saveStore(store);
  return store;
}

export function devStorePath() {
  return STORE_FILE;
}

export function resetDevStore(): void {
  if (fs.existsSync(STORE_FILE)) {
    fs.unlinkSync(STORE_FILE);
  }
  saveStore(defaultStore());
}

function grantFreeInventory(store: StoreFile, playerId: number) {
  for (const skin of store.cardSkins.filter((s) => s.isDefault || s.price === 0)) {
    if (
      !store.inventory.some(
        (i) => i.playerId === playerId && i.cardSkinId === skin.id,
      )
    ) {
      store.inventory.push({ playerId, cardSkinId: skin.id });
    }
  }
  for (const skin of store.tableSkins.filter((s) => s.isDefault || s.price === 0)) {
    if (
      !store.inventory.some(
        (i) => i.playerId === playerId && i.tableSkinId === skin.id,
      )
    ) {
      store.inventory.push({ playerId, tableSkinId: skin.id });
    }
  }
}

export function ownsCardSkin(playerId: number, skinId: number): boolean {
  const store = loadStore();
  const skin = store.cardSkins.find((s) => s.id === skinId);
  if (!skin) return false;
  if (skin.isDefault || skin.price === 0) return true;
  return store.inventory.some(
    (i) => i.playerId === playerId && i.cardSkinId === skinId,
  );
}

export function ownsTableSkin(playerId: number, skinId: number): boolean {
  const store = loadStore();
  const skin = store.tableSkins.find((s) => s.id === skinId);
  if (!skin) return false;
  if (skin.isDefault || skin.price === 0) return true;
  return store.inventory.some(
    (i) => i.playerId === playerId && i.tableSkinId === skinId,
  );
}

export function addCardSkinToInventory(playerId: number, skinId: number) {
  mutate((store) => {
    if (
      !store.inventory.some(
        (i) => i.playerId === playerId && i.cardSkinId === skinId,
      )
    ) {
      store.inventory.push({ playerId, cardSkinId: skinId });
    }
  });
}

export function addTableSkinToInventory(playerId: number, skinId: number) {
  mutate((store) => {
    if (
      !store.inventory.some(
        (i) => i.playerId === playerId && i.tableSkinId === skinId,
      )
    ) {
      store.inventory.push({ playerId, tableSkinId: skinId });
    }
  });
}

export function getPlayerInventory(playerId: number) {
  const store = loadStore();
  const cardIds = new Set(
    store.inventory
      .filter((i) => i.playerId === playerId && i.cardSkinId)
      .map((i) => i.cardSkinId!),
  );
  const tableIds = new Set(
    store.inventory
      .filter((i) => i.playerId === playerId && i.tableSkinId)
      .map((i) => i.tableSkinId!),
  );

  const cardSkins = store.cardSkins.filter(
    (s) => s.isDefault || s.price === 0 || cardIds.has(s.id),
  );
  const tableSkins = store.tableSkins.filter(
    (s) => s.isDefault || s.price === 0 || tableIds.has(s.id),
  );

  return { cardSkins, tableSkins };
}

export function findUserByUnionId(unionId: string): User | undefined {
  return loadStore().users.find((u) => u.unionId === unionId);
}

export function upsertUser(data: InsertUser): void {
  mutate((store) => {
    const existing = store.users.find((u) => u.unionId === data.unionId);
    const timestamp = now();

    if (existing) {
      existing.name = data.name ?? existing.name;
      if (data.avatar !== undefined) existing.avatar = data.avatar;
      existing.lastSignInAt = data.lastSignInAt ?? timestamp;
      existing.updatedAt = timestamp;
      if (data.role) existing.role = data.role;
      return;
    }

    store.users.push({
      id: store.nextUserId++,
      unionId: data.unionId,
      name: data.name ?? null,
      email: data.email ?? null,
      avatar: data.avatar ?? null,
      role: data.role ?? "user",
      createdAt: timestamp,
      updatedAt: timestamp,
      lastSignInAt: data.lastSignInAt ?? timestamp,
    });
  });
}

export function findPlayerByUserId(userId: number): Player | undefined {
  return loadStore().players.find((p) => p.userId === userId);
}

export function findPlayerById(playerId: number): Player | undefined {
  return loadStore().players.find((p) => p.id === playerId);
}

export function getOrCreatePlayer(userId: number): Player {
  const existing = findPlayerByUserId(userId);
  if (existing) return existing;

  let created!: Player;
  mutate((store) => {
    const defaultCard =
      store.cardSkins.find((s) => s.isDefault) ?? store.cardSkins[0];
    const defaultTable =
      store.tableSkins.find((s) => s.isDefault) ?? store.tableSkins[0];
    const timestamp = now();

    created = {
      id: store.nextPlayerId++,
      userId,
      cookies: STARTING_COOKIES,
      level: 1,
      totalWon: 0,
      totalLost: 0,
      handsPlayed: 0,
      handsWon: 0,
      handsLost: 0,
      handsPushed: 0,
      equippedCardSkin: defaultCard?.id ?? 1,
      equippedTableSkin: defaultTable?.id ?? 1,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    store.players.push(created);
    grantFreeInventory(store, created.id);
  });
  return created!;
}

export function updatePlayer(
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
): Player {
  let updated!: Player;
  mutate((store) => {
    const player = store.players.find((p) => p.id === playerId);
    if (!player) throw new Error("Player not found");
    Object.assign(player, updates, { updatedAt: now() });
    updated = player;
  });
  return updated!;
}

export function insertGameSession(
  data: Omit<GameSession, "id" | "createdAt">,
): number {
  let sessionId = 0;
  mutate((store) => {
    sessionId = store.nextSessionId++;
    store.gameSessions.push({
      ...data,
      id: sessionId,
      createdAt: now(),
    });
  });
  return sessionId;
}

export function updateGameSession(
  sessionId: number,
  data: Partial<Omit<GameSession, "id" | "createdAt">>,
): void {
  mutate((store) => {
    const session = store.gameSessions.find((s) => s.id === sessionId);
    if (!session) throw new Error("Game session not found");
    Object.assign(session, data);
  });
}

export function listGameSessionsForPlayer(
  playerId: number,
  limit = 50,
): GameSession[] {
  return loadStore()
    .gameSessions.filter((s) => s.playerId === playerId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
}

export function listCardSkins(): CardSkin[] {
  return [...loadStore().cardSkins].sort((a, b) => a.price - b.price);
}

export function listTableSkins(): TableSkin[] {
  return [...loadStore().tableSkins].sort((a, b) => a.price - b.price);
}

export function getCardSkin(id: number): CardSkin | undefined {
  return loadStore().cardSkins.find((s) => s.id === id);
}

export function getTableSkin(id: number): TableSkin | undefined {
  return loadStore().tableSkins.find((s) => s.id === id);
}

export function leaderboardByWealth(limit: number) {
  const store = loadStore();
  return store.players
    .map((p) => {
      const user = store.users.find((u) => u.id === p.userId);
      return {
        id: p.id,
        cookies: p.cookies,
        level: p.level,
        handsPlayed: p.handsPlayed,
        handsWon: p.handsWon,
        name: user?.name ?? "Player",
        avatar: user?.avatar ?? null,
      };
    })
    .sort((a, b) => b.cookies - a.cookies)
    .slice(0, limit)
    .map((row, i) => ({ rank: i + 1, ...row }));
}

export function leaderboardByWins(limit: number) {
  const store = loadStore();
  return store.players
    .map((p) => {
      const user = store.users.find((u) => u.id === p.userId);
      return {
        id: p.id,
        cookies: p.cookies,
        level: p.level,
        handsPlayed: p.handsPlayed,
        handsWon: p.handsWon,
        name: user?.name ?? "Player",
        avatar: user?.avatar ?? null,
        winRate:
          p.handsPlayed > 0
            ? Math.round((p.handsWon / p.handsPlayed) * 100)
            : 0,
      };
    })
    .sort((a, b) => b.handsWon - a.handsWon)
    .slice(0, limit)
    .map((row, i) => ({ rank: i + 1, ...row }));
}

export function countPlayersRicherThan(cookies: number): number {
  return loadStore().players.filter((p) => p.cookies > cookies).length;
}
