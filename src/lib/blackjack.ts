export type {
  Card,
  GameOutcome,
  Hand,
  HandOutcome,
} from "@contracts/blackjack";

export {
  calculateScore,
  canSplit,
  createDeck,
  dealFromDeck,
  determineWinner,
  getSuitColor,
  getSuitSymbol,
  handPayout,
  isBlackjack,
  isSoft17,
  resolveBlackjackPayout,
  runDealer,
  shuffle,
} from "@contracts/blackjack";

import type { Card, HandOutcome } from "@contracts/blackjack";

export interface GameState {
  playerHand: Card[];
  dealerHand: Card[];
  splitHand?: Card[];
  currentHand: "main" | "split";
  playerScore: number;
  dealerScore: number;
  splitScore?: number;
  status: "betting" | "playing" | "dealer" | "finished";
  outcome?: HandOutcome | "blackjack";
  splitOutcome?: HandOutcome;
  betAmount: number;
  doubledDown: boolean;
  canDoubleDown: boolean;
  canSplit: boolean;
}
