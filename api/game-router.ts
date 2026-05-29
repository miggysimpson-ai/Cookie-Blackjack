import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import type { Player } from "@db/schema";
import type { Card, Hand, HandOutcome } from "@contracts/blackjack";
import {
  calculateScore,
  canSplit,
  createDeck,
  determineWinner,
  handPayout,
  isBlackjack,
  resolveBlackjackPayout,
  runDealer,
} from "@contracts/blackjack";
import {
  getGameLevelRules,
  nextLevelCookieTarget,
} from "@contracts/game-levels";
import {
  findPlayerById,
  findPlayerByUserId,
  getOrCreatePlayer,
  insertGameSession,
  listGameSessionsForPlayer,
  updateGameSession,
  updatePlayer,
} from "./queries/store";

type ActiveGame = {
  deck: Card[];
  playerHand: Hand;
  dealerHand: Hand;
  splitHand?: Hand;
  splitFinished?: boolean;
  currentHand: "main" | "split";
  betAmount: number;
  level: number;
  playerId: number;
  doubledDown: boolean;
};

const activeGames = new Map<number, ActiveGame>();

function popCard(game: ActiveGame): Card {
  const card = game.deck.pop();
  if (!card) throw new Error("Deck is empty");
  return card;
}

function activeHand(game: ActiveGame): Hand {
  return game.currentHand === "split" && game.splitHand
    ? game.splitHand
    : game.playerHand;
}

async function applyPlayerUpdates(
  playerId: number,
  updates: Record<string, number>,
  level: number,
  cookiesAfter: number,
  currentPlayerLevel: number,
) {
  const target = nextLevelCookieTarget(level);
  if (target && cookiesAfter >= target && currentPlayerLevel === level) {
    updates.level = level + 1;
  }
  return updatePlayer(playerId, updates);
}

async function finishGame(
  sessionId: number,
  game: ActiveGame,
  player: Player,
) {
  const config = getGameLevelRules(game.level);

  const { dealerHand, dealerScore } = runDealer(
    game.dealerHand,
    game.deck,
    config.hitSoft17,
  );
  game.dealerHand = dealerHand;

  const playerScore = calculateScore(game.playerHand);
  const splitScore = game.splitHand ? calculateScore(game.splitHand) : null;

  const mainOutcome: HandOutcome =
    playerScore > 21
      ? "loss"
      : determineWinner(playerScore, dealerScore);

  let splitOutcome: HandOutcome | null = null;
  let splitWinAmount = 0;

  if (game.splitHand && splitScore !== null) {
    splitOutcome =
      splitScore > 21
        ? "loss"
        : determineWinner(splitScore, dealerScore);
    splitWinAmount = handPayout(splitOutcome, game.betAmount);
  }

  const winAmount = handPayout(mainOutcome, game.betAmount);
  const totalWinAmount = winAmount + splitWinAmount;
  const handsInPlay = game.splitHand ? 2 : 1;
  const totalBet = game.betAmount * handsInPlay;

  const current = await findPlayerById(player.id);
  if (!current) throw new Error("Player not found");

  const updates: Record<string, number> = {
    handsPlayed: current.handsPlayed + 1,
    cookies: current.cookies + totalWinAmount,
  };

  const netWin = totalWinAmount - totalBet;
  if (netWin > 0) {
    updates.handsWon = current.handsWon + 1;
    updates.totalWon = current.totalWon + netWin;
  } else if (totalWinAmount === 0) {
    updates.handsLost = current.handsLost + 1;
    updates.totalLost = current.totalLost + totalBet;
  } else {
    updates.handsPushed = current.handsPushed + 1;
  }

  const updatedPlayer = await applyPlayerUpdates(
    player.id,
    updates,
    game.level,
    updates.cookies,
    current.level,
  );

  await updateGameSession(sessionId, {
    outcome:
      mainOutcome === "win"
        ? "win"
        : mainOutcome === "push"
          ? "push"
          : "loss",
    winAmount: totalWinAmount,
    playerScore,
    playerHand: game.playerHand,
    dealerScore,
    dealerHand: game.dealerHand,
  });

  activeGames.delete(sessionId);

  return {
    dealerHand: game.dealerHand,
    dealerScore,
    playerScore,
    splitScore,
    outcome: mainOutcome,
    splitOutcome,
    winAmount,
    splitWinAmount,
    totalWinAmount,
    newBalance: updatedPlayer.cookies,
  };
}

export const gameRouter = createRouter({
  deal: authedQuery
    .input(
      z.object({
        betAmount: z.number().min(1),
        level: z.number().min(1).max(10),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const config = getGameLevelRules(input.level);

      if (input.betAmount < config.minBet) {
        throw new Error(
          `Minimum bet for level ${input.level} is ${config.minBet}`,
        );
      }

      const player = await getOrCreatePlayer(ctx.user.id);
      if (player.cookies < input.betAmount) {
        throw new Error("Insufficient cookies");
      }

      let balance = player.cookies - input.betAmount;

      const deck = createDeck(config.deckCount);
      const playerHand = [deck.pop()!, deck.pop()!];
      const dealerHand = [deck.pop()!, deck.pop()!];

      const playerScore = calculateScore(playerHand);
      const playerBJ = isBlackjack(playerHand);
      const dealerBJ = isBlackjack(dealerHand);

      let outcome: HandOutcome | "blackjack" | null = null;
      let winAmount = 0;

      if (playerBJ || dealerBJ) {
        const resolved = resolveBlackjackPayout(
          playerBJ,
          dealerBJ,
          input.betAmount,
        );
        outcome = resolved.outcome;
        winAmount = resolved.winAmount;
      }

      const sessionId = await insertGameSession({
        playerId: player.id,
        level: input.level,
        betAmount: input.betAmount,
        winAmount,
        outcome: outcome ?? "win",
        playerScore,
        playerHand,
        dealerScore: dealerBJ
          ? calculateScore(dealerHand)
          : calculateScore([dealerHand[0]]),
        dealerHand: dealerBJ ? dealerHand : [dealerHand[0]],
      });

      if (!outcome) {
        await updatePlayer(player.id, { cookies: balance });
        activeGames.set(sessionId, {
          deck,
          playerHand,
          dealerHand,
          currentHand: "main",
          betAmount: input.betAmount,
          level: input.level,
          playerId: player.id,
          doubledDown: false,
        });
      } else {
        balance += winAmount;
        const updates: Record<string, number> = {
          handsPlayed: player.handsPlayed + 1,
          cookies: balance,
        };

        if (outcome === "blackjack") {
          updates.handsWon = player.handsWon + 1;
          updates.totalWon =
            player.totalWon + winAmount - input.betAmount;
        } else if (outcome === "push") {
          updates.handsPushed = player.handsPushed + 1;
        } else {
          updates.handsLost = player.handsLost + 1;
          updates.totalLost = player.totalLost + input.betAmount;
        }

        const updated = await applyPlayerUpdates(
          player.id,
          updates,
          input.level,
          balance,
          player.level,
        );
        balance = updated.cookies;

        await updateGameSession(sessionId, {
          outcome,
          winAmount,
          playerScore,
          playerHand,
          dealerScore: calculateScore(dealerHand),
          dealerHand,
        });
      }

      return {
        sessionId,
        playerHand,
        dealerHand: outcome ? dealerHand : [dealerHand[0]],
        playerScore,
        dealerVisibleScore: calculateScore([dealerHand[0]]),
        outcome,
        winAmount,
        newBalance: balance,
        isBlackjack: playerBJ,
        canDoubleDown: !outcome,
        canSplit: !outcome && canSplit(playerHand),
      };
    }),

  hit: authedQuery
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const game = activeGames.get(input.sessionId);
      if (!game) throw new Error("Game not found or already finished");

      const player = await findPlayerById(game.playerId);
      if (!player || player.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      const hand = activeHand(game);
      hand.push(popCard(game));
      const score = calculateScore(hand);
      const bust = score > 21;

      if (bust && game.currentHand === "split" && game.splitHand) {
        game.currentHand = "main";
        game.splitFinished = true;
        return {
          newCard: hand[hand.length - 1],
          score,
          isBust: true,
          hand: "split" as const,
          switchedToMain: true,
          gameFinished: false,
          canDoubleDown: false,
        };
      }

      if (bust) {
        const finished = await finishGame(input.sessionId, game, player);
        return {
          newCard: hand[hand.length - 1],
          score,
          isBust: true,
          hand: game.currentHand,
          switchedToMain: false,
          gameFinished: true,
          ...finished,
        };
      }

      return {
        newCard: hand[hand.length - 1],
        score,
        isBust: false,
        hand: game.currentHand,
        switchedToMain: false,
        gameFinished: false,
        canDoubleDown: false,
      };
    }),

  stand: authedQuery
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const game = activeGames.get(input.sessionId);
      if (!game) throw new Error("Game not found or already finished");

      const player = await findPlayerById(game.playerId);
      if (!player || player.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      if (game.currentHand === "split" && game.splitHand) {
        game.currentHand = "main";
        game.splitFinished = true;
        return {
          switchToMain: true,
          mainHand: game.playerHand,
          mainScore: calculateScore(game.playerHand),
          gameFinished: false,
        };
      }

      const finished = await finishGame(input.sessionId, game, player);
      return { switchToMain: false, gameFinished: true, ...finished };
    }),

  doubleDown: authedQuery
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const game = activeGames.get(input.sessionId);
      if (!game) throw new Error("Game not found");

      const player = await findPlayerById(game.playerId);
      if (!player || player.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }
      if (player.cookies < game.betAmount) {
        throw new Error("Insufficient cookies");
      }

      const deducted = await updatePlayer(player.id, {
        cookies: player.cookies - game.betAmount,
      });

      game.doubledDown = true;
      game.betAmount *= 2;
      game.playerHand.push(popCard(game));

      const finished = await finishGame(input.sessionId, game, deducted);
      return {
        ...finished,
        newCard: game.playerHand[game.playerHand.length - 1],
      };
    }),

  split: authedQuery
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const game = activeGames.get(input.sessionId);
      if (!game) throw new Error("Game not found");

      const player = await findPlayerById(game.playerId);
      if (!player || player.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }
      if (player.cookies < game.betAmount) {
        throw new Error("Insufficient cookies");
      }
      if (!canSplit(game.playerHand)) {
        throw new Error("Cannot split this hand");
      }

      const deducted = await updatePlayer(player.id, {
        cookies: player.cookies - game.betAmount,
      });

      const [card1, card2] = game.playerHand;
      game.playerHand = [card1, popCard(game)];
      game.splitHand = [card2, popCard(game)];
      game.currentHand = "split";
      game.splitFinished = false;

      return {
        mainHand: game.playerHand,
        splitHand: game.splitHand,
        mainScore: calculateScore(game.playerHand),
        splitScore: calculateScore(game.splitHand),
        newBalance: deducted.cookies,
      };
    }),

  history: authedQuery.query(async ({ ctx }) => {
    const player = await findPlayerByUserId(ctx.user.id);
    if (!player) return [];
    return listGameSessionsForPlayer(player.id, 50);
  }),
});
