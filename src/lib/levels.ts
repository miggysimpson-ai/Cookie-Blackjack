import {
  GAME_LEVEL_RULES,
  getGameLevelRules,
} from "@contracts/game-levels";

export interface LevelConfig {
  id: number;
  name: string;
  minBet: number;
  targetWinnings: number;
  startingBalance: number;
  deckCount: number;
  hitSoft17: boolean;
  newMechanic?: string;
  color: string;
}

const LEVEL_META: Omit<
  LevelConfig,
  "id" | "minBet" | "deckCount" | "hitSoft17"
>[] = [
  {
    name: "Cookie Jar",
    targetWinnings: 100,
    startingBalance: 50,
    newMechanic: "Basic Play",
    color: "#4CAF50",
  },
  {
    name: "The Bakery",
    targetWinnings: 500,
    startingBalance: 250,
    newMechanic: "Double Down",
    color: "#8BC34A",
  },
  {
    name: "The Cafeteria",
    targetWinnings: 2000,
    startingBalance: 1000,
    newMechanic: "Split",
    color: "#FFC107",
  },
  {
    name: "Casino Floor",
    targetWinnings: 10000,
    startingBalance: 5000,
    color: "#FF9800",
  },
  {
    name: "High Roller",
    targetWinnings: 50000,
    startingBalance: 20000,
    newMechanic: "Insurance",
    color: "#FF5722",
  },
  {
    name: "Cookie Empire",
    targetWinnings: 200000,
    startingBalance: 50000,
    color: "#E91E63",
  },
  {
    name: "Fortune Factory",
    targetWinnings: 1000000,
    startingBalance: 200000,
    color: "#9C27B0",
  },
  {
    name: "Millionaire's Table",
    targetWinnings: 5000000,
    startingBalance: 1000000,
    color: "#673AB7",
  },
  {
    name: "Billionaire's Club",
    targetWinnings: 50000000,
    startingBalance: 10000000,
    color: "#3F51B5",
  },
  {
    name: "Cookie God",
    targetWinnings: 1000000000,
    startingBalance: 100000000,
    color: "#FFD700",
  },
];

export const LEVELS: LevelConfig[] = GAME_LEVEL_RULES.map((rules, index) => ({
  id: index + 1,
  ...LEVEL_META[index],
  ...rules,
}));

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS[level - 1] ?? LEVELS[0];
}

export { getGameLevelRules };

export function formatCookies(amount: number): string {
  if (amount >= 1_000_000_000) return (amount / 1_000_000_000).toFixed(1) + "B";
  if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(1) + "M";
  if (amount >= 1_000) return (amount / 1_000).toFixed(1) + "K";
  return amount.toString();
}
