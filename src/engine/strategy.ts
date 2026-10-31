/* Basic strategy for 6 decks, dealer stands on soft 17, double after split, late surrender. */
import { cardValue, handTotal } from './cards';
import type { Action, AllowedActions, ChartCode, Decision, Hand } from './types';

const MAX_HANDS = 4;

export function hardCode(total: number, upcard: number, noSurrender = false): ChartCode {
  if (!noSurrender) {
    if (total === 16 && upcard >= 9) return 'R';
    if (total === 15 && upcard === 10) return 'R';
  }
  if (total <= 8) return 'H';
  if (total === 9) return upcard >= 3 && upcard <= 6 ? 'D' : 'H';
  if (total === 10) return upcard <= 9 ? 'D' : 'H';
  if (total === 11) return upcard <= 10 ? 'D' : 'H';
  if (total === 12) return upcard >= 4 && upcard <= 6 ? 'S' : 'H';
  if (total <= 16) return upcard <= 6 ? 'S' : 'H';
  return 'S';
}

export function softCode(total: number, upcard: number): ChartCode {
  if (total <= 12) return 'H';
  if (total <= 14) return upcard === 5 || upcard === 6 ? 'D' : 'H';
  if (total <= 16) return upcard >= 4 && upcard <= 6 ? 'D' : 'H';
  if (total === 17) return upcard >= 3 && upcard <= 6 ? 'D' : 'H';
  if (total === 18) {
    if (upcard >= 3 && upcard <= 6) return 'Ds';
    return upcard <= 8 ? 'S' : 'H';
  }
  return 'S';
}

export function pairCode(pairValue: number, upcard: number): ChartCode {
  switch (pairValue) {
    case 2:
    case 3:
    case 7:
      return upcard <= 7 ? 'P' : 'H';
    case 4:
      return upcard === 5 || upcard === 6 ? 'P' : 'H';
    case 5:
      return hardCode(10, upcard);
    case 6:
      return upcard <= 6 ? 'P' : 'H';
    case 8:
      return 'P';
    case 9:
      return upcard <= 9 && upcard !== 7 ? 'P' : 'S';
    case 10:
      return 'S';
    default:
      return 'P';
  }
}

export function allowedActions(
  hand: Hand | undefined,
  bankroll: number,
  handCount: number,
  surrenderOffered = true,
): AllowedActions {
  if (!hand || hand.done) return {};
  const twoCards = hand.cards.length === 2;
  const canAffordBet = bankroll >= hand.bet;
  const isPair = twoCards && cardValue(hand.cards[0]) === cardValue(hand.cards[1]);
  return {
    H: true,
    S: true,
    D: twoCards && canAffordBet,
    P: isPair && handCount < MAX_HANDS && canAffordBet,
    R: surrenderOffered && twoCards && handCount === 1 && !hand.split,
  };
}

/** Turns a chart cell into a legal move, using its fallback when the first choice isn't allowed. */
function legalAction(code: ChartCode, allowed: AllowedActions, total: number, upcard: number): Action {
  if (code === 'R') return allowed.R ? 'R' : (hardCode(total, upcard, true) as Action);
  if (code === 'D') return allowed.D ? 'D' : 'H';
  if (code === 'Ds') return allowed.D ? 'D' : 'S';
  return code;
}

export function bestAction(
  hand: Hand,
  upcard: number,
  allowed: AllowedActions,
): { best: Action; decision: Decision } {
  const { total, soft } = handTotal(hand.cards);
  const pairValue = cardValue(hand.cards[0]);
  const isPair = hand.cards.length === 2 && pairValue === cardValue(hand.cards[1]);

  if (isPair && allowed.P) {
    const best = legalAction(pairCode(pairValue, upcard), allowed, total, upcard);
    return { best, decision: { kind: 'pair', pairValue, total, upcard } };
  }
  const kind = soft ? 'soft' : 'hard';
  const code = soft ? softCode(total, upcard) : hardCode(total, upcard);
  return { best: legalAction(code, allowed, total, upcard), decision: { kind, total, upcard } };
}

/** Key of the strategy chart cell for a decision, if it has one. */
export function chartCell(decision: Decision): string | null {
  switch (decision.kind) {
    case 'pair':
      return `pair-${decision.pairValue}-${decision.upcard}`;
    case 'soft':
      return decision.total >= 13 && decision.total <= 20
        ? `soft-${decision.total}-${decision.upcard}`
        : null;
    case 'hard': {
      const row = Math.min(Math.max(decision.total, 8), 17);
      return `hard-${row}-${decision.upcard}`;
    }
    default:
      return null;
  }
}
