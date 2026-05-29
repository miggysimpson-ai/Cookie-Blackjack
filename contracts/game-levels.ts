export interface GameLevelRules {
  minBet: number;
  deckCount: number;
  hitSoft17: boolean;
}

/** Table rules per level (shared by client UI and server game logic). */
export const GAME_LEVEL_RULES: GameLevelRules[] = [
  { minBet: 10, deckCount: 1, hitSoft17: false },
  { minBet: 50, deckCount: 2, hitSoft17: false },
  { minBet: 100, deckCount: 4, hitSoft17: true },
  { minBet: 500, deckCount: 6, hitSoft17: true },
  { minBet: 2000, deckCount: 8, hitSoft17: true },
  { minBet: 5000, deckCount: 8, hitSoft17: true },
  { minBet: 20000, deckCount: 8, hitSoft17: true },
  { minBet: 100000, deckCount: 8, hitSoft17: true },
  { minBet: 1000000, deckCount: 8, hitSoft17: true },
  { minBet: 10000000, deckCount: 8, hitSoft17: true },
];

export function getGameLevelRules(level: number): GameLevelRules {
  return GAME_LEVEL_RULES[level - 1] ?? GAME_LEVEL_RULES[0];
}

export function nextLevelCookieTarget(level: number): number | null {
  if (level >= GAME_LEVEL_RULES.length) return null;
  return GAME_LEVEL_RULES[level].minBet * 10;
}
