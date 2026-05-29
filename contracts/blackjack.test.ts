import { describe, expect, it } from "vitest";
import {
  calculateScore,
  createDeck,
  determineWinner,
  isBlackjack,
  resolveBlackjackPayout,
  runDealer,
} from "./blackjack";

describe("blackjack engine", () => {
  it("scores aces as soft then hard", () => {
    const hand = [
      { suit: "spades", rank: "A", value: 11 },
      { suit: "hearts", rank: "K", value: 10 },
      { suit: "clubs", rank: "6", value: 6 },
    ];
    expect(calculateScore(hand)).toBe(17);
  });

  it("detects blackjack", () => {
    const hand = [
      { suit: "spades", rank: "A", value: 11 },
      { suit: "hearts", rank: "Q", value: 10 },
    ];
    expect(isBlackjack(hand)).toBe(true);
  });

  it("resolves immediate blackjack payouts", () => {
    expect(resolveBlackjackPayout(true, false, 100)).toEqual({
      outcome: "blackjack",
      winAmount: 250,
    });
    expect(resolveBlackjackPayout(true, true, 100)).toEqual({
      outcome: "push",
      winAmount: 100,
    });
  });

  it("determines winner vs dealer", () => {
    expect(determineWinner(20, 18)).toBe("win");
    expect(determineWinner(22, 18)).toBe("loss");
    expect(determineWinner(18, 22)).toBe("win");
  });

  it("builds a full deck", () => {
    expect(createDeck(1)).toHaveLength(52);
    expect(createDeck(2)).toHaveLength(104);
  });

  it("dealer stands on 17", () => {
    const dealerHand = [
      { suit: "spades", rank: "10", value: 10 },
      { suit: "hearts", rank: "7", value: 7 },
    ];
    const { dealerScore } = runDealer(dealerHand, [], false);
    expect(dealerScore).toBe(17);
  });
});
