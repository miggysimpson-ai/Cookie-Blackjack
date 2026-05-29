import { useCallback, useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { trpc } from "@/providers/trpc";
import type { Card, GameState } from "@/lib/blackjack";
import {
  calculateScore,
  canSplit,
  createDeck,
  determineWinner,
  handPayout,
  isBlackjack,
  resolveBlackjackPayout,
  runDealer,
} from "@/lib/blackjack";
import { getLevelConfig } from "@/lib/levels";

function showResultMessage(
  setters: {
    setShowResult: (v: boolean) => void;
    setResultText: (v: string) => void;
    setResultColor: (v: string) => void;
    setMessage: (v: string) => void;
  },
  outcome: string,
  betAmount: number,
  winAmount: number,
  onWin: () => void,
) {
  setters.setShowResult(true);
  setters.setMessage("Hand complete!");

  if (outcome === "blackjack") {
    setters.setResultText(`BLACKJACK! +${winAmount - betAmount}`);
    setters.setResultColor("text-yellow-400");
    onWin();
  } else if (outcome === "win") {
    setters.setResultText(`You Win! +${winAmount - betAmount}`);
    setters.setResultColor("text-green-400");
    onWin();
  } else if (outcome === "push") {
    setters.setResultText("Push - Bet Returned");
    setters.setResultColor("text-yellow-400");
  } else {
    setters.setResultText("Dealer Wins");
    setters.setResultColor("text-red-400");
  }
}

export function useBlackjackGame(options: {
  isLoggedIn: boolean;
  cookies: number;
  unlockedLevel: number;
  onBalanceChange?: (balance: number) => void;
}) {
  const { isLoggedIn, cookies, unlockedLevel, onBalanceChange } = options;
  const utils = trpc.useUtils();
  const balanceRef = useRef(cookies);

  useEffect(() => {
    balanceRef.current = cookies;
  }, [cookies]);

  const syncBalance = useCallback(
    (balance: number) => {
      balanceRef.current = balance;
      onBalanceChange?.(balance);
    },
    [onBalanceChange],
  );

  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [deck, setDeck] = useState<Card[]>([]);
  const [betAmount, setBetAmount] = useState(10);
  const [selectedChip, setSelectedChip] = useState(10);
  const [message, setMessage] = useState("Place your bet!");
  const [showResult, setShowResult] = useState(false);
  const [resultText, setResultText] = useState("");
  const [resultColor, setResultColor] = useState("");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [dealerRevealed, setDealerRevealed] = useState(false);
  const [animatingCards, setAnimatingCards] = useState(false);

  const levelConfig = getLevelConfig(level);

  const dealMutation = trpc.game.deal.useMutation({
    onSuccess: () => utils.player.me.invalidate(),
  });
  const hitMutation = trpc.game.hit.useMutation({
    onSuccess: () => utils.player.me.invalidate(),
  });
  const standMutation = trpc.game.stand.useMutation({
    onSuccess: () => utils.player.me.invalidate(),
  });
  const doubleMutation = trpc.game.doubleDown.useMutation({
    onSuccess: () => utils.player.me.invalidate(),
  });
  const splitMutation = trpc.game.split.useMutation({
    onSuccess: () => utils.player.me.invalidate(),
  });

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#FFD700", "#FF6B6B", "#4CAF50", "#2196F3"],
    });
  };

  const resultSetters = {
    setShowResult,
    setResultText,
    setResultColor,
    setMessage,
  };

  const applyFinishedResult = useCallback(
    (
      outcome: string,
      totalWin: number,
      totalBet: number,
      dealerHand: Card[],
      dealerScore: number,
      extra?: Partial<GameState>,
      newBalance?: number,
    ) => {
      if (newBalance !== undefined) {
        syncBalance(newBalance);
      } else if (!isLoggedIn) {
        syncBalance(balanceRef.current + totalWin);
      }
      setDealerRevealed(true);
      setGameState((prev) =>
        prev
          ? {
              ...prev,
              status: "finished",
              dealerHand,
              dealerScore,
              outcome: outcome as GameState["outcome"],
              ...extra,
            }
          : null,
      );

      const net = totalWin - totalBet;
      if (net > 0) {
        setResultText(`You Win! +${net}`);
        setResultColor("text-green-400");
        triggerConfetti();
      } else if (totalWin > 0 && net === 0) {
        setResultText("Push - Bet Returned");
        setResultColor("text-yellow-400");
      } else {
        setResultText("Dealer Wins");
        setResultColor("text-red-400");
      }
      setShowResult(true);
      setMessage("Hand complete!");
    },
    [isLoggedIn, syncBalance],
  );

  const startNewHand = useCallback(async () => {
    if (betAmount < levelConfig.minBet) {
      setMessage(`Minimum bet is ${levelConfig.minBet} cookies`);
      return;
    }
    if (cookies < betAmount) {
      setMessage("Not enough cookies!");
      return;
    }

    setAnimatingCards(true);
    setMessage("Dealing...");
    setShowResult(false);
    setDealerRevealed(false);

    try {
      if (isLoggedIn) {
        const result = await dealMutation.mutateAsync({ betAmount, level });
        setSessionId(result.sessionId);
        if (result.newBalance !== undefined) {
          syncBalance(result.newBalance);
        }

        if (result.outcome) {
          setDealerRevealed(true);
          setGameState({
            playerHand: result.playerHand,
            dealerHand: result.dealerHand,
            playerScore: result.playerScore,
            dealerScore: calculateScore(result.dealerHand),
            status: "finished",
            outcome: result.outcome,
            betAmount,
            doubledDown: false,
            canDoubleDown: false,
            canSplit: false,
            currentHand: "main",
          });
          showResultMessage(
            resultSetters,
            result.outcome,
            betAmount,
            result.winAmount,
            triggerConfetti,
          );
        } else {
          setGameState({
            playerHand: result.playerHand,
            dealerHand: result.dealerHand,
            playerScore: result.playerScore,
            dealerScore: result.dealerVisibleScore,
            status: "playing",
            betAmount,
            doubledDown: false,
            canDoubleDown: result.canDoubleDown,
            canSplit: result.canSplit,
            currentHand: "main",
          });
          setMessage("Your turn! Hit or Stand?");
        }
      } else {
        syncBalance(cookies - betAmount);

        const newDeck = createDeck(levelConfig.deckCount);
        const playerHand = [newDeck[0], newDeck[1]];
        const dealerHand = [newDeck[2], newDeck[3]];
        const remainingDeck = newDeck.slice(4);
        setDeck(remainingDeck);

        const playerScore = calculateScore(playerHand);
        const playerBJ = isBlackjack(playerHand);
        const dealerBJ = isBlackjack(dealerHand);

        if (playerBJ || dealerBJ) {
          const { outcome, winAmount } = resolveBlackjackPayout(
            playerBJ,
            dealerBJ,
            betAmount,
          );
          setDealerRevealed(true);
          setGameState({
            playerHand,
            dealerHand,
            playerScore,
            dealerScore: calculateScore(dealerHand),
            status: "finished",
            outcome,
            betAmount,
            doubledDown: false,
            canDoubleDown: false,
            canSplit: false,
            currentHand: "main",
          });
          syncBalance(balanceRef.current + winAmount);
          showResultMessage(
            resultSetters,
            outcome,
            betAmount,
            winAmount,
            triggerConfetti,
          );
        } else {
          setGameState({
            playerHand,
            dealerHand: [dealerHand[0]],
            playerScore,
            dealerScore: calculateScore([dealerHand[0]]),
            status: "playing",
            betAmount,
            doubledDown: false,
            canDoubleDown: true,
            canSplit: canSplit(playerHand),
            currentHand: "main",
          });
          setDeck([dealerHand[1], ...remainingDeck]);
          setMessage("Your turn! Hit or Stand?");
        }
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error dealing cards");
    } finally {
      setTimeout(() => setAnimatingCards(false), 800);
    }
  }, [
    betAmount,
    level,
    levelConfig,
    cookies,
    isLoggedIn,
    dealMutation,
    syncBalance,
    cookies,
  ]);

  const handleHit = useCallback(async () => {
    if (!gameState || gameState.status !== "playing") return;

    if (isLoggedIn && sessionId) {
      try {
        const result = await hitMutation.mutateAsync({ sessionId });
        const handKey =
          result.hand === "split" ? "splitHand" : "playerHand";
        const scoreKey =
          result.hand === "split" ? "splitScore" : "playerScore";

        if (result.gameFinished && "dealerHand" in result) {
          const totalBet =
            gameState.betAmount * (gameState.splitHand ? 2 : 1);
          applyFinishedResult(
            result.outcome ?? "loss",
            result.totalWinAmount ?? 0,
            totalBet,
            result.dealerHand,
            result.dealerScore,
            {
              playerScore: result.playerScore,
              splitScore: result.splitScore ?? undefined,
              splitOutcome: result.splitOutcome ?? undefined,
              outcome: result.outcome,
            },
            result.newBalance,
          );
          return;
        }

        setGameState((prev) => {
          if (!prev) return prev;
          const hand = [...(prev[handKey] as Card[]), result.newCard];
          return {
            ...prev,
            [handKey]: hand,
            [scoreKey]: result.score,
            canDoubleDown: false,
            currentHand:
              result.switchedToMain ? "main" : prev.currentHand,
          };
        });

        if (result.switchedToMain) {
          setMessage("Split hand busted! Playing main hand...");
        } else if (result.isBust) {
          setMessage("Bust!");
        }
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Hit failed");
      }
      return;
    }

    if (deck.length === 0) return;

    const isSplit = gameState.currentHand === "split" && gameState.splitHand;
    const hand = [...(isSplit ? gameState.splitHand! : gameState.playerHand)];
    const { card, deck: nextDeck } = { card: deck[0], deck: deck.slice(1) };
    hand.push(card);
    const score = calculateScore(hand);
    setDeck(nextDeck);

    const next: GameState = {
      ...gameState,
      canDoubleDown: false,
      ...(isSplit
        ? { splitHand: hand, splitScore: score }
        : { playerHand: hand, playerScore: score }),
    };

    if (score > 21) {
      if (isSplit) {
        next.currentHand = "main";
        setMessage("Split hand busted! Playing main hand...");
      } else if (gameState.splitHand) {
        next.currentHand = "split";
        setMessage("Main hand busted! Playing split hand...");
      } else {
        next.status = "finished";
        next.outcome = "loss";
        setDealerRevealed(true);
        showResultMessage(resultSetters, "loss", betAmount, 0, () => {});
      }
    }

    setGameState(next);
  }, [
    gameState,
    deck,
    isLoggedIn,
    sessionId,
    hitMutation,
    betAmount,
    applyFinishedResult,
    syncBalance,
  ]);

  const resolveGuestHand = useCallback(
    (state: GameState) => {
      const hidden = deck[0];
      const rest = deck.slice(1);
      let dealerHand = [...state.dealerHand];
      let workingDeck = rest;

      if (dealerHand.length === 1 && hidden) {
        dealerHand = [dealerHand[0], hidden];
        workingDeck = rest;
      }

      const dealerRun = runDealer(
        dealerHand,
        workingDeck,
        levelConfig.hitSoft17,
      );
      dealerHand = dealerRun.dealerHand;
      workingDeck = dealerRun.deck;
      const dealerScore = dealerRun.dealerScore;
      setDeck(workingDeck);

      const mainOutcome = determineWinner(state.playerScore, dealerScore);
      const splitOutcome =
        state.splitHand && state.splitScore !== undefined
          ? determineWinner(state.splitScore, dealerScore)
          : undefined;

      const hands = state.splitHand ? 2 : 1;
      const totalWin =
        handPayout(mainOutcome, state.betAmount) +
        (splitOutcome ? handPayout(splitOutcome, state.betAmount) : 0);
      const totalBet = state.betAmount * hands;

      applyFinishedResult(
        mainOutcome,
        totalWin,
        totalBet,
        dealerHand,
        dealerScore,
        { splitOutcome, outcome: mainOutcome },
      );
    },
    [deck, levelConfig.hitSoft17, applyFinishedResult],
  );

  const handleStand = useCallback(async () => {
    if (!gameState || gameState.status !== "playing") return;

    if (gameState.currentHand === "split" && gameState.splitHand) {
      if (isLoggedIn && sessionId) {
        try {
          const result = await standMutation.mutateAsync({ sessionId });
          if (result.switchToMain) {
            setGameState((prev) =>
              prev ? { ...prev, currentHand: "main" } : prev,
            );
            setMessage("Now playing main hand...");
          }
        } catch (err) {
          setMessage(err instanceof Error ? err.message : "Stand failed");
        }
        return;
      }
      setGameState({ ...gameState, currentHand: "main" });
      setMessage("Now playing main hand...");
      return;
    }

    if (isLoggedIn && sessionId) {
      try {
        const result = await standMutation.mutateAsync({ sessionId });
        if (result.gameFinished && "dealerHand" in result) {
          const totalBet =
            gameState.betAmount * (gameState.splitHand ? 2 : 1);
          applyFinishedResult(
            result.outcome ?? "loss",
            result.totalWinAmount ?? 0,
            totalBet,
            result.dealerHand,
            result.dealerScore,
            {
              playerScore: result.playerScore,
              splitScore: result.splitScore ?? undefined,
              splitOutcome: result.splitOutcome ?? undefined,
              outcome: result.outcome,
            },
            result.newBalance,
          );
        }
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Stand failed");
      }
      return;
    }

    setGameState({ ...gameState, status: "dealer" });
    setDealerRevealed(true);
    setMessage("Dealer's turn...");
    resolveGuestHand(gameState);
  }, [
    gameState,
    isLoggedIn,
    sessionId,
    standMutation,
    resolveGuestHand,
  ]);

  const handleDoubleDown = useCallback(async () => {
    if (!gameState || gameState.status !== "playing" || !gameState.canDoubleDown)
      return;
    if (cookies < gameState.betAmount) {
      setMessage("Not enough cookies to double down!");
      return;
    }

    if (isLoggedIn && sessionId) {
      try {
        const result = await doubleMutation.mutateAsync({ sessionId });
        applyFinishedResult(
          result.outcome ?? "loss",
          result.totalWinAmount ?? result.winAmount ?? 0,
          gameState.betAmount * 2,
          result.dealerHand,
          result.dealerScore,
          {
            playerHand: [
              ...gameState.playerHand,
              result.newCard,
            ],
            playerScore: result.playerScore,
            doubledDown: true,
            betAmount: gameState.betAmount * 2,
            outcome: result.outcome,
          },
          result.newBalance,
        );
      } catch (err) {
        setMessage(
          err instanceof Error ? err.message : "Double down failed",
        );
      }
      return;
    }

    syncBalance(cookies - gameState.betAmount);

    const newCard = deck[0];
    const newHand = [...gameState.playerHand, newCard];
    const newScore = calculateScore(newHand);
    let workingDeck = deck.slice(1);

    const hidden = workingDeck[0];
    let dealerHand = [...gameState.dealerHand];
    if (dealerHand.length === 1 && hidden) {
      dealerHand = [dealerHand[0], hidden];
      workingDeck = workingDeck.slice(1);
    }

    const dealerRun = runDealer(
      dealerHand,
      workingDeck,
      levelConfig.hitSoft17,
    );
    const outcome = determineWinner(newScore, dealerRun.dealerScore);
    const doubledBet = gameState.betAmount * 2;
    const totalWin = handPayout(outcome, doubledBet);

    setDeck(dealerRun.deck);
    applyFinishedResult(
      outcome,
      totalWin,
      doubledBet,
      dealerRun.dealerHand,
      dealerRun.dealerScore,
      {
        playerHand: newHand,
        playerScore: newScore,
        doubledDown: true,
        betAmount: doubledBet,
        outcome,
      },
    );
  }, [
    gameState,
    cookies,
    isLoggedIn,
    sessionId,
    doubleMutation,
    deck,
    levelConfig.hitSoft17,
    applyFinishedResult,
  ]);

  const handleSplit = useCallback(async () => {
    if (!gameState || !gameState.canSplit || cookies < gameState.betAmount)
      return;

    if (isLoggedIn && sessionId) {
      try {
        const result = await splitMutation.mutateAsync({ sessionId });
        if (result.newBalance !== undefined) {
          syncBalance(result.newBalance);
        }
        setGameState({
          ...gameState,
          playerHand: result.mainHand,
          splitHand: result.splitHand,
          playerScore: result.mainScore,
          splitScore: result.splitScore,
          currentHand: "split",
          canSplit: false,
          canDoubleDown: false,
        });
        setMessage("Playing split hand first...");
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Split failed");
      }
      return;
    }

    syncBalance(cookies - gameState.betAmount);

    const [card1, card2] = gameState.playerHand;
    const mainHand = [card1, deck[0]];
    const splitHand = [card2, deck[1]];
    setDeck((d) => d.slice(2));
    setGameState({
      ...gameState,
      playerHand: mainHand,
      splitHand,
      playerScore: calculateScore(mainHand),
      splitScore: calculateScore(splitHand),
      currentHand: "split",
      canSplit: false,
      canDoubleDown: false,
    });
    setMessage("Playing split hand first...");
  }, [gameState, cookies, isLoggedIn, sessionId, splitMutation, deck]);

  const resetHand = () => {
    setGameState(null);
    setSessionId(null);
    setShowResult(false);
    setDealerRevealed(false);
    setMessage("Place your bet!");
    setBetAmount(levelConfig.minBet);
  };

  const addBet = (amount: number) => {
    if (gameState) return;
    const newBet = betAmount + amount;
    if (newBet <= cookies) setBetAmount(newBet);
  };

  const selectLevel = (l: number) => {
    if (l <= unlockedLevel) {
      setLevel(l);
      setBetAmount(getLevelConfig(l).minBet);
    }
  };

  const chipValues =
    level <= 2 ? [1, 5, 10] : level <= 4 ? [10, 50, 100] : [50, 100, 500];

  const isBusy =
    animatingCards ||
    dealMutation.isPending ||
    hitMutation.isPending ||
    standMutation.isPending ||
    doubleMutation.isPending ||
    splitMutation.isPending;

  return {
    level,
    levelConfig,
    gameState,
    betAmount,
    selectedChip,
    setSelectedChip,
    message,
    showResult,
    resultText,
    resultColor,
    dealerRevealed,
    animatingCards,
    isBusy,
    chipValues,
    startNewHand,
    handleHit,
    handleStand,
    handleDoubleDown,
    handleSplit,
    resetHand,
    addBet,
    selectLevel,
    setBetAmount,
  };
}
