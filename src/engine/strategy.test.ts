import { describe, expect, it } from 'vitest';
import { allowedActions, bestAction, chartCell, hardCode, pairCode, softCode } from './strategy';
import type { Card, Hand, Rank } from './types';

const cards = (...ranks: Rank[]): Card[] => ranks.map((rank) => ({ rank, suit: '♠' }));
const hand = (...ranks: Rank[]): Hand => ({ cards: cards(...ranks), bet: 25, done: false, result: null });
const ACE = 11;

describe('strategy charts', () => {
  it('surrenders only 16 vs 9, 10, A and 15 vs 10', () => {
    expect(hardCode(16, 9)).toBe('R');
    expect(hardCode(16, ACE)).toBe('R');
    expect(hardCode(15, 10)).toBe('R');
    expect(hardCode(15, 9)).toBe('H');
    expect(hardCode(15, ACE)).toBe('H');
  });

  it('hits 11 against an ace, as the dealer stands on soft 17', () => {
    expect(hardCode(11, 10)).toBe('D');
    expect(hardCode(11, ACE)).toBe('H');
  });

  it('plays soft 18 three ways', () => {
    expect(softCode(18, 2)).toBe('S');
    expect(softCode(18, 6)).toBe('Ds');
    expect(softCode(18, 9)).toBe('H');
  });

  it('never splits tens, always splits aces and 8s', () => {
    for (let upcard = 2; upcard <= ACE; upcard++) {
      expect(pairCode(10, upcard)).toBe('S');
      expect(pairCode(ACE, upcard)).toBe('P');
      expect(pairCode(8, upcard)).toBe('P');
    }
  });

  it('stands on 9s against a 7', () => {
    expect(pairCode(9, 7)).toBe('S');
    expect(pairCode(9, 8)).toBe('P');
  });
});

describe('allowedActions', () => {
  it('only allows surrender as the first move of an unsplit hand', () => {
    expect(allowedActions(hand('10', '6'), 100, 1).R).toBe(true);
    expect(allowedActions(hand('10', '3', '3'), 100, 1).R).toBe(false);
    expect(allowedActions({ ...hand('10', '6'), split: true }, 100, 2).R).toBe(false);
  });

  it('needs chips to double or split', () => {
    const allowed = allowedActions(hand('8', '8'), 10, 1);
    expect(allowed.D).toBe(false);
    expect(allowed.P).toBe(false);
  });

  it('caps a round at four hands', () => {
    expect(allowedActions(hand('8', '8'), 100, 4).P).toBe(false);
  });

  it('treats any two ten-value cards as a pair', () => {
    expect(allowedActions(hand('K', '10'), 100, 1).P).toBe(true);
  });
});

describe('bestAction', () => {
  const allowed = { H: true, S: true, D: true, P: true, R: true };

  it('falls back to hitting when surrender is unavailable', () => {
    expect(bestAction(hand('10', '6'), 10, allowed).best).toBe('R');
    expect(bestAction(hand('10', '3', '3'), 10, { H: true, S: true }).best).toBe('H');
  });

  it('falls back from Ds to standing and from D to hitting', () => {
    expect(bestAction(hand('A', '7'), 6, allowed).best).toBe('D');
    expect(bestAction(hand('A', '4', '3'), 6, { H: true, S: true }).best).toBe('S');
    expect(bestAction(hand('5', '3', '3'), 6, { H: true, S: true }).best).toBe('H');
  });

  it('reads an unsplittable pair as a total', () => {
    expect(bestAction(hand('8', '8'), 10, { ...allowed, P: false }).decision.kind).toBe('hard');
  });
});

describe('chartCell', () => {
  it('clamps hard totals to the chart rows', () => {
    expect(chartCell({ kind: 'hard', total: 5, upcard: 7 })).toBe('hard-8-7');
    expect(chartCell({ kind: 'hard', total: 19, upcard: 7 })).toBe('hard-17-7');
  });

  it('has no cell for soft totals outside the chart, or for insurance', () => {
    expect(chartCell({ kind: 'soft', total: 12, upcard: 7 })).toBeNull();
    expect(chartCell({ kind: 'ins' })).toBeNull();
  });
});
