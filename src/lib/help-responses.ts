const RESPONSES: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["rule", "how to play", "how do i play"],
    answer:
      "In Cookie Blackjack, get closer to 21 than the dealer without busting. Number cards count as shown, face cards are 10, and aces are 11 or 1. Beat the dealer to win cookies!",
  },
  {
    keywords: ["strategy", "tip", "should i"],
    answer:
      "Stand on 17+, double down on 10 or 11 when the dealer shows 2–9, hit on 12–16 when the dealer shows 7+, and split aces and 8s when you can.",
  },
  {
    keywords: ["blackjack", "3:2", "natural"],
    answer:
      "Blackjack is an ace plus a ten-value card on your first two cards. It pays 3:2 (1.5× your bet)—the best natural win in the game!",
  },
  {
    keywords: ["split"],
    answer:
      "Split when your first two cards have the same value. You place another bet equal to the first and play two separate hands. Split aces and 8s when the rules allow it.",
  },
  {
    keywords: ["double"],
    answer:
      "Double down doubles your bet, deals exactly one more card, then stands. It works best on 10 or 11 against a weak dealer upcard (2–9).",
  },
  {
    keywords: ["cookie", "earn", "win"],
    answer:
      "You earn cookies by winning hands. Regular wins pay 1:1; blackjack pays 3:2. Spend cookies in the Shop on card backs and table themes.",
  },
  {
    keywords: ["shop", "skin", "theme"],
    answer:
      "The Shop sells card skins (card backs) and table themes (felt colors). Some items are free; rare themes cost more cookies.",
  },
  {
    keywords: ["level", "unlock"],
    answer:
      "There are 10 levels with higher minimum bets. Earn enough cookies to unlock the next table. Higher levels use more decks; from level 3 up the dealer hits soft 17.",
  },
];

const DEFAULT_ANSWER =
  "Ask me about rules, hit/stand/double/split, cookies, the shop, or level progression. I'm your in-game guide—no outside API needed!";

export function getHelpResponse(question: string): string {
  const lower = question.toLowerCase();
  for (const entry of RESPONSES) {
    if (entry.keywords.some((k) => lower.includes(k))) {
      return entry.answer;
    }
  }
  return DEFAULT_ANSWER;
}
