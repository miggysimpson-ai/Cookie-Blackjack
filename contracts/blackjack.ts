export interface Card {
  suit: string;
  rank: string;
  value: number;
}

export type Hand = Card[];

export type HandOutcome = "win" | "loss" | "push";
export type GameOutcome = HandOutcome | "blackjack";

const SUITS = ["hearts", "diamonds", "clubs", "spades"] as const;

const RANKS: { rank: string; value: number }[] = [
  { rank: "A", value: 11 },
  { rank: "2", value: 2 },
  { rank: "3", value: 3 },
  { rank: "4", value: 4 },
  { rank: "5", value: 5 },
  { rank: "6", value: 6 },
  { rank: "7", value: 7 },
  { rank: "8", value: 8 },
  { rank: "9", value: 9 },
  { rank: "10", value: 10 },
  { rank: "J", value: 10 },
  { rank: "Q", value: 10 },
  { rank: "K", value: 10 },
];

export function createDeck(deckCount: number = 1): Card[] {
  const deck: Card[] = [];
  for (let d = 0; d < deckCount; d++) {
    for (const suit of SUITS) {
      for (const r of RANKS) {
        deck.push({ suit, rank: r.rank, value: r.value });
      }
    }
  }
  return shuffle(deck);
}

export function shuffle(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function calculateScore(hand: Hand): number {
  let score = 0;
  let aces = 0;
  for (const card of hand) {
    score += card.value;
    if (card.rank === "A") aces++;
  }
  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }
  return score;
}

export function isBlackjack(hand: Hand): boolean {
  return hand.length === 2 && calculateScore(hand) === 21;
}

export function isSoft17(hand: Hand): boolean {
  let score = 0;
  let aces = 0;
  for (const card of hand) {
    score += card.value;
    if (card.rank === "A") aces++;
  }
  return score === 17 && aces > 0;
}

export function canSplit(hand: Hand): boolean {
  return hand.length === 2 && hand[0].value === hand[1].value;
}

export function determineWinner(
  playerScore: number,
  dealerScore: number,
): HandOutcome {
  if (playerScore > 21) return "loss";
  if (dealerScore > 21) return "win";
  if (playerScore > dealerScore) return "win";
  if (playerScore < dealerScore) return "loss";
  return "push";
}

export function getSuitSymbol(suit: string): string {
  switch (suit) {
    case "hearts":
      return "\u2665";
    case "diamonds":
      return "\u2666";
    case "clubs":
      return "\u2663";
    case "spades":
      return "\u2660";
    default:
      return "?";
  }
}

export function getSuitColor(suit: string): string {
  return suit === "hearts" || suit === "diamonds" ? "#D32F2F" : "#212121";
}

export function dealFromDeck(deck: Card[]): { card: Card; deck: Card[] } {
  const [card, ...rest] = deck;
  if (!card) throw new Error("Deck is empty");
  return { card, deck: rest };
}

export function runDealer(
  dealerHand: Hand,
  deck: Card[],
  hitSoft17: boolean,
): { dealerHand: Hand; deck: Card[]; dealerScore: number } {
  let hand = [...dealerHand];
  let remaining = [...deck];
  let dealerScore = calculateScore(hand);

  while (dealerScore < 17 || (hitSoft17 && isSoft17(hand))) {
    if (remaining.length === 0) break;
    const { card, deck: nextDeck } = dealFromDeck(remaining);
    hand.push(card);
    remaining = nextDeck;
    dealerScore = calculateScore(hand);
  }

  return { dealerHand: hand, deck: remaining, dealerScore };
}

export function handPayout(
  outcome: HandOutcome,
  betAmount: number,
): number {
  if (outcome === "win") return betAmount * 2;
  if (outcome === "push") return betAmount;
  return 0;
}

export function resolveBlackjackPayout(
  playerBJ: boolean,
  dealerBJ: boolean,
  betAmount: number,
): { outcome: GameOutcome; winAmount: number } {
  if (playerBJ && dealerBJ) {
    return { outcome: "push", winAmount: betAmount };
  }
  if (playerBJ) {
    return {
      outcome: "blackjack",
      winAmount: betAmount + Math.floor(betAmount * 1.5),
    };
  }
  if (dealerBJ) {
    return { outcome: "loss", winAmount: 0 };
  }
  throw new Error("No immediate blackjack outcome");
}
