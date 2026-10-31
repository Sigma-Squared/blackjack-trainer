import { describe, expect, it } from 'vitest';
import { totalLabel } from './cards';
import { answerInsurance, deal, newGame, playAction, rebuy, resetStats } from './round';
import type { Card, GameState, Rank } from './types';

/** A game whose shoe deals these ranks in order: player, dealer, player, dealer, then draws. */
function stackedGame(...ranks: Rank[]): GameState {
  const game = newGame({ bankroll: 1000, bet: 100 });
  const filler: Card[] = Array.from({ length: 50 }, () => ({ rank: '2', suit: '♣' }));
  const stacked: Card[] = ranks.map((rank) => ({ rank, suit: '♠' }));
  game.shoe = [...filler, ...stacked.reverse()];
  game.cut = 0;
  return game;
}

describe('payouts', () => {
  it('pays a blackjack 3 to 2', () => {
    const game = stackedGame('A', '9', 'K', '7');
    deal(game);
    expect(game.phase).toBe('done');
    expect(game.hands[0].result).toBe('bj');
    expect(game.bankroll).toBe(1150);
    expect(game.message).toContain('Round: +$150.');
  });

  it('pushes a blackjack against a dealer blackjack', () => {
    const game = stackedGame('A', 'K', 'K', 'A');
    deal(game);
    expect(game.hands[0].result).toBe('push');
    expect(game.bankroll).toBe(1000);
  });

  it('returns half the bet on surrender without the dealer drawing', () => {
    const game = stackedGame('10', '10', '6', '6');
    deal(game);
    playAction(game, 'R');
    expect(game.hands[0].result).toBe('surrender');
    expect(game.bankroll).toBe(950);
    expect(game.dealer).toHaveLength(2);
  });

  it('doubles the bet and deals exactly one card', () => {
    const game = stackedGame('6', '6', '5', '10', '10', '10');
    deal(game);
    playAction(game, 'D');
    expect(game.hands[0].cards).toHaveLength(3);
    expect(game.hands[0].bet).toBe(200);
    expect(game.hands[0].result).toBe('win');
    expect(game.bankroll).toBe(1200);
  });
});

describe('dealer', () => {
  it('stands on soft 17', () => {
    const game = stackedGame('10', 'A', '9', '6');
    deal(game);
    answerInsurance(game, false);
    playAction(game, 'S');
    expect(game.dealer).toHaveLength(2);
    expect(game.hands[0].result).toBe('win');
  });

  it('does not draw once the player has busted', () => {
    const game = stackedGame('10', '6', '6', '5', '10');
    deal(game);
    playAction(game, 'H');
    expect(game.hands[0].result).toBe('bust');
    expect(game.dealer).toHaveLength(2);
    expect(game.bankroll).toBe(900);
  });
});

describe('insurance', () => {
  it('breaks even when the dealer has blackjack', () => {
    const game = stackedGame('10', 'A', '9', 'K');
    deal(game);
    expect(game.phase).toBe('insurance');
    answerInsurance(game, true);
    expect(game.bankroll).toBe(1000);
    expect(game.stats.cat.ins).toEqual([0, 1]);
  });

  it('loses the side bet when the dealer has no blackjack', () => {
    const game = stackedGame('10', 'A', '9', '6');
    deal(game);
    answerInsurance(game, true);
    expect(game.phase).toBe('play');
    expect(game.bankroll).toBe(850);
  });
});

describe('splitting', () => {
  it('plays each hand in turn and settles both', () => {
    const game = stackedGame('8', '6', '8', '10', '3', '2', 'K');
    deal(game);
    playAction(game, 'P');
    expect(game.hands).toHaveLength(2);
    expect(game.active).toBe(0);
    playAction(game, 'S');
    expect(game.active).toBe(1);
    playAction(game, 'S');
    expect(game.phase).toBe('done');
    expect(game.hands.map((hand) => hand.result)).toEqual(['win', 'win']);
    expect(game.bankroll).toBe(1200);
  });

  it('gives split aces one card each and ends the player turn', () => {
    const game = stackedGame('A', '6', 'A', '10', '5', '9', 'K');
    deal(game);
    playAction(game, 'P');
    expect(game.phase).toBe('done');
    expect(game.hands.map((hand) => hand.cards.length)).toEqual([2, 2]);
  });

  it('pays a split 21 even money and does not label it a blackjack', () => {
    const game = stackedGame('A', '6', 'A', '10', 'K', 'K', '10');
    deal(game);
    playAction(game, 'P');
    const [first] = game.hands;
    expect(first.result).toBe('win');
    expect(game.bankroll).toBe(1200);
    expect(totalLabel(first.cards, first.split)).toBe('21');
  });
});

describe('grading', () => {
  it('counts correct plays, breaks the streak on a mistake and logs it', () => {
    const game = stackedGame('10', '6', '7', '10', '10');
    deal(game);
    playAction(game, 'S');
    expect(game.stats).toMatchObject({ n: 1, ok: 1, streak: 1, best: 1 });

    const next = stackedGame('10', '6', '7', '10', '10');
    next.stats = game.stats;
    deal(next);
    playAction(next, 'H');
    expect(next.stats).toMatchObject({ n: 2, ok: 1, streak: 0, best: 1 });
    expect(next.stats.log).toEqual([{ label: 'Hard 17 vs 6', choice: 'H', best: 'S' }]);
    expect(next.verdict?.correct).toBe(false);
    expect(next.lastCell).toBe('hard-17-6');
  });

  it('resets the stats and verdict', () => {
    const game = stackedGame('10', '6', '7', '10', '10');
    deal(game);
    playAction(game, 'H');
    resetStats(game);
    expect(game.stats.n).toBe(0);
    expect(game.verdict).toBeNull();
    expect(game.lastCell).toBeNull();
  });
});

describe('table management', () => {
  it('refuses a bet the bankroll cannot cover', () => {
    const game = stackedGame('10', '6', '7', '10');
    game.bankroll = 50;
    deal(game);
    expect(game.hands).toHaveLength(0);
    expect(game.message).toContain('Not enough chips');
  });

  it('shuffles a new shoe at the cut card', () => {
    const game = stackedGame('10', '6', '7', '10');
    game.cut = game.shoe.length;
    deal(game);
    expect(game.shoe).toHaveLength(308);
    expect(game.cut).toBe(78);
    expect(game.message).toContain('Shuffled a fresh shoe.');
  });

  it('leaves a rebuy out of the round result', () => {
    const game = stackedGame('10', '10', '7', '9');
    deal(game);
    rebuy(game);
    playAction(game, 'S');
    expect(game.bankroll).toBe(1900);
    expect(game.message).toContain('Round: −$100.');
  });
});
