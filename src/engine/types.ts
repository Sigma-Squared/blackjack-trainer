export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
export type Suit = '♠' | '♥' | '♦' | '♣';

export interface Card {
  rank: Rank;
  suit: Suit;
}

/** A move on a hand: Hit, Stand, Double, sPlit, suRrender. */
export type Action = 'H' | 'S' | 'D' | 'P' | 'R';
/** The answer to the insurance offer: take It, or No. */
export type InsuranceChoice = 'I' | 'N';
export type Choice = Action | InsuranceChoice;
/** A strategy chart cell. `Ds` means double, or stand if doubling isn't allowed. */
export type ChartCode = Action | 'Ds';

export type AllowedActions = Partial<Record<Action, boolean>>;

export type HandResult = 'win' | 'lose' | 'push' | 'bust' | 'bj' | 'surrender';

export interface Hand {
  cards: Card[];
  bet: number;
  done: boolean;
  result: HandResult | null;
  split?: boolean;
}

export type Phase = 'idle' | 'insurance' | 'play' | 'done';

/** What a choice was about: the chart row and dealer upcard, or the insurance offer. */
export type Decision =
  | { kind: 'ins' }
  | { kind: 'pair'; pairValue: number; total: number; upcard: number }
  | { kind: 'soft' | 'hard'; total: number; upcard: number };

export type DecisionKind = Decision['kind'];

export interface Verdict {
  correct: boolean;
  choice: Choice;
  best: Choice;
  label: string;
  why: string;
}

export interface Mistake {
  label: string;
  choice: Choice;
  best: Choice;
}

/** Field names are the persisted `bs-trainer-v1` format: keep them stable. */
export interface Stats {
  /** Decisions graded. */
  n: number;
  /** Decisions correct. */
  ok: number;
  streak: number;
  best: number;
  /** `[correct, graded]` per decision kind. */
  cat: Record<DecisionKind, [number, number]>;
  log: Mistake[];
}

export interface SavedProgress {
  stats: Stats;
  bankroll: number;
  bet: number;
  hint: boolean;
}

export interface GameState {
  shoe: Card[];
  /** Reshuffle before the deal once the shoe is down to this many cards. */
  cut: number;
  bankroll: number;
  /** Bankroll before the current round's bet came off it. */
  roundStart: number;
  bet: number;
  hands: Hand[];
  active: number;
  dealer: Card[];
  holeHidden: boolean;
  phase: Phase;
  insured: boolean;
  hint: boolean;
  message: string;
  stats: Stats;
  verdict: Verdict | null;
  idleHeading: string;
  /** Strategy chart cell of the latest decision. */
  lastCell: string | null;
}
