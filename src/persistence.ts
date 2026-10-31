import { freshStats } from './engine/stats';
import { isRoundInProgress } from './engine/round';
import type { GameState, SavedProgress } from './engine/types';

const STORAGE_KEY = 'bs-trainer-v1';

export function loadProgress(): Partial<SavedProgress> | undefined {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (!saved) return undefined;
    return {
      stats: { ...freshStats(), ...saved.stats },
      bankroll: typeof saved.bankroll === 'number' ? saved.bankroll : undefined,
      bet: saved.bet || undefined,
      hint: Boolean(saved.hint),
      rules: {
        surrender: saved.rules?.surrender === true,
        blackjackPayout: saved.rules?.blackjackPayout === '6:5' ? '6:5' : '3:2',
        insurance: saved.rules?.insurance !== false,
      },
    };
  } catch {
    return undefined;
  }
}

/** An unfinished round isn't saved, so reloading mid-hand always returns its bets. */
export function saveProgress(game: GameState) {
  try {
    const { stats, bet, hint, rules } = game;
    const bankroll = isRoundInProgress(game) ? game.roundStart : game.bankroll;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ stats, bankroll, bet, hint, rules }));
  } catch {
    // Storage can be unavailable, as in a private window. The game still plays.
  }
}
