/* Where each card sits on the spritesheet: a 14 by 4 grid of 90 by 126 sprites. */
import type { Card, Rank, Suit } from './engine/types';

const LAST_COLUMN = 13;
const LAST_ROW = 3;

const RANK_COLUMNS: Rank[] = ['A', 'K', 'Q', 'J', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const SUIT_ROWS: Suit[] = ['♥', '♦', '♠', '♣'];
const FACE_CARD_RANKS: Partial<Record<Rank, string>> = { A: 'Ace', K: 'King', Q: 'Queen', J: 'Jack' };
const SUIT_NAMES: Record<Suit, string> = { '♥': 'hearts', '♦': 'diamonds', '♠': 'spades', '♣': 'clubs' };

const backgroundPosition = (column: number, row: number) =>
  `${(column / LAST_COLUMN) * 100}% ${(row / LAST_ROW) * 100}%`;

export const CARD_BACK_POSITION = backgroundPosition(LAST_COLUMN, 0);

export function cardPosition(card: Card): string {
  return backgroundPosition(RANK_COLUMNS.indexOf(card.rank), SUIT_ROWS.indexOf(card.suit));
}

/* The animated sheet has 8 frames per row, in four-row blocks of A, K, Q and J, one row per suit. */
const ANIMATED_RANKS: Rank[] = ['A', 'K', 'Q', 'J'];
const LAST_ANIMATED_ROW = 17;
const FRAMES_PER_LOOP = 8;
const FRAMES_PER_SECOND = 8.5;

export const ANIMATION_LOOP_MS = (FRAMES_PER_LOOP / FRAMES_PER_SECOND) * 1000;

/** Vertical position of the card's row on the animated sheet, or null if it doesn't animate. */
export function animatedRowPosition(card: Card): string | null {
  const block = ANIMATED_RANKS.indexOf(card.rank);
  if (block === -1) return null;
  const row = block * SUIT_ROWS.length + SUIT_ROWS.indexOf(card.suit);
  return `${(row / LAST_ANIMATED_ROW) * 100}%`;
}

export const cardName = (card: Card) =>
  `${FACE_CARD_RANKS[card.rank] ?? card.rank} of ${SUIT_NAMES[card.suit]}`;
