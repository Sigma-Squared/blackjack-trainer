import type { Card, Rank, Suit } from './types';

const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const DECKS = 6;
/** Fraction of the shoe left behind the cut card. */
const PENETRATION_RESERVE = 0.25;

export function buildShoe(random = Math.random): Card[] {
  const shoe: Card[] = [];
  for (let deck = 0; deck < DECKS; deck++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) shoe.push({ rank, suit });
    }
  }
  for (let i = shoe.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
  }
  return shoe;
}

export const cutPosition = (shoe: Card[]) => Math.floor(shoe.length * PENETRATION_RESERVE);

/** Blackjack value, counting an ace as 11. */
export function cardValue(card: Card): number {
  if (card.rank === 'A') return 11;
  if (card.rank === 'J' || card.rank === 'Q' || card.rank === 'K') return 10;
  return Number(card.rank);
}

/** Best total for the cards. `soft` means an ace is still counted as 11. */
export function handTotal(cards: Card[]): { total: number; soft: boolean } {
  let total = 0;
  let aces = 0;
  for (const card of cards) {
    total += cardValue(card);
    if (card.rank === 'A') aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return { total, soft: aces > 0 };
}

export const isBlackjack = (cards: Card[]) => cards.length === 2 && handTotal(cards).total === 21;

/** The label for a dealer upcard value: 11 is shown as an ace. */
export const upcardLabel = (upcard: number) => (upcard === 11 ? 'A' : String(upcard));

/** A 21 made after a split is only a 21: it doesn't pay as a blackjack, so it isn't labelled as one. */
export function totalLabel(cards: Card[], fromSplit = false): string {
  const { total, soft } = handTotal(cards);
  if (total > 21) return `Bust ${total}`;
  if (isBlackjack(cards) && !fromSplit) return 'Blackjack';
  return soft && total < 21 ? `Soft ${total}` : String(total);
}
