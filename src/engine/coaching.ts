import { upcardLabel } from './cards';
import type { Choice, Decision } from './types';

export const CHOICE_NAMES: Record<Choice, string> = {
  H: 'Hit',
  S: 'Stand',
  D: 'Double',
  P: 'Split',
  R: 'Surrender',
  I: 'Take insurance',
  N: 'Decline insurance',
};

function pairName(pairValue: number): string {
  if (pairValue === 11) return 'aces';
  if (pairValue === 10) return 'tens';
  return `${pairValue}s`;
}

export function decisionLabel(decision: Decision): string {
  if (decision.kind === 'ins') return 'Insurance against a dealer ace';
  const upcard = upcardLabel(decision.upcard);
  if (decision.kind === 'pair') return `Pair of ${pairName(decision.pairValue)} vs ${upcard}`;
  return `${decision.kind === 'soft' ? 'Soft' : 'Hard'} ${decision.total} vs ${upcard}`;
}

/** Explains why `best` is the right play for the decision. */
export function explain(best: Choice, decision: Decision): string {
  if (decision.kind === 'ins') {
    return 'Insurance is a side bet with a house edge around 7%. Skip it, even with a blackjack, unless you count cards.';
  }

  const { kind, total, upcard } = decision;
  const pairValue = kind === 'pair' ? decision.pairValue : undefined;

  if (best === 'P') {
    if (pairValue === 11) return 'Two aces as a soft 12 is weak. Split and start two hands with an 11.';
    if (pairValue === 8) return '16 is the worst total in the game. Two hands starting from 8 do much better.';
    if (pairValue === 9) return '18 is an underdog to this upcard. Two hands starting from 9 win more.';
    return 'The dealer is weak enough that putting more money out on two hands gains value.';
  }
  if (best === 'R') {
    return 'This hand loses well over half the time against that upcard. Giving up half your bet costs less than playing it out.';
  }
  if (best === 'D') {
    if (kind === 'soft') return "You can't bust with one card and the dealer is weak. Get more money on the table.";
    if (total === 11) return '11 is the best doubling hand: any 10 gives you 21.';
    return 'A 10-value card is likely, and the dealer is weak. Double while you have the edge.';
  }
  if (best === 'S') {
    if (pairValue === 10) return "20 wins most of the time. Don't break it up.";
    if (pairValue === 9) {
      return upcard === 7
        ? "18 beats the dealer's most likely 17."
        : 'Against 10 or ace, two 9s become two weak hands. Keep the 18.';
    }
    if (kind === 'soft' && total === 18) return 'Soft 18 already ties or beats what a 2, 7, or 8 usually makes.';
    if (total >= 17) return '17 or more is too strong to risk busting.';
    return `The dealer's ${upcardLabel(upcard)} is a bust card. Let the dealer take the risk of drawing.`;
  }
  if (kind === 'soft') {
    return total === 18
      ? 'Soft 18 is an underdog to 9, 10, or ace. You can draw without busting, so improve it.'
      : "A soft hand can't bust on one card. Improve it.";
  }
  if (total <= 11) return "You can't bust. Take a card.";
  if (total === 12 && upcard <= 3) return "A 2 or 3 isn't weak enough to stand on 12. Hitting busts only on a 10.";
  return `Against a ${upcardLabel(upcard)}, the dealer usually makes 17 or more. Standing on ${total} loses more often than hitting.`;
}
