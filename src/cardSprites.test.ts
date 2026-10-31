import { describe, expect, it } from 'vitest';
import { animatedRowPosition, CARD_BACK_POSITION, cardName, cardPosition } from './cardSprites';
import { buildShoe } from './engine/cards';

const percent = (column: number, row: number) => `${(column / 13) * 100}% ${(row / 3) * 100}%`;

describe('cardPosition', () => {
  it('finds the corners of the deck', () => {
    expect(cardPosition({ rank: 'A', suit: '♥' })).toBe(percent(0, 0));
    expect(cardPosition({ rank: '10', suit: '♥' })).toBe(percent(12, 0));
    expect(cardPosition({ rank: 'A', suit: '♣' })).toBe(percent(0, 3));
    expect(cardPosition({ rank: '10', suit: '♣' })).toBe(percent(12, 3));
  });

  it('puts the face cards after the ace and the suits in sheet order', () => {
    expect(cardPosition({ rank: 'K', suit: '♦' })).toBe(percent(1, 1));
    expect(cardPosition({ rank: 'Q', suit: '♠' })).toBe(percent(2, 2));
    expect(cardPosition({ rank: 'J', suit: '♣' })).toBe(percent(3, 3));
    expect(cardPosition({ rank: '2', suit: '♠' })).toBe(percent(4, 2));
  });

  it('gives all 52 cards a different sprite, none of them the back', () => {
    const positions = new Set(buildShoe().map(cardPosition));
    expect(positions.size).toBe(52);
    expect(positions.has(CARD_BACK_POSITION)).toBe(false);
  });
});

describe('animatedRowPosition', () => {
  const row = (index: number) => `${(index / 17) * 100}%`;

  it('finds each rank block, with suits in sheet order', () => {
    expect(animatedRowPosition({ rank: 'A', suit: '♥' })).toBe(row(0));
    expect(animatedRowPosition({ rank: 'A', suit: '♣' })).toBe(row(3));
    expect(animatedRowPosition({ rank: 'K', suit: '♥' })).toBe(row(4));
    expect(animatedRowPosition({ rank: 'K', suit: '♦' })).toBe(row(5));
    expect(animatedRowPosition({ rank: 'Q', suit: '♠' })).toBe(row(10));
    expect(animatedRowPosition({ rank: 'J', suit: '♣' })).toBe(row(15));
  });

  it('gives each of the 16 animated cards its own row', () => {
    const rows = buildShoe().map(animatedRowPosition).filter(Boolean);
    expect(new Set(rows).size).toBe(16);
  });

  it('leaves the number cards static', () => {
    expect(animatedRowPosition({ rank: '2', suit: '♥' })).toBeNull();
    expect(animatedRowPosition({ rank: '10', suit: '♠' })).toBeNull();
  });
});

describe('cardName', () => {
  it('reads as words', () => {
    expect(cardName({ rank: 'A', suit: '♠' })).toBe('Ace of spades');
    expect(cardName({ rank: '10', suit: '♦' })).toBe('10 of diamonds');
  });
});
