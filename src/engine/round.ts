/*
 * The flow of a round. These functions mutate the GameState they are given, so
 * they run the same on a plain object (in tests) and inside a Solid `produce`.
 */
import { money } from '../format';
import { buildShoe, cardValue, cutPosition, handTotal, isBlackjack } from './cards';
import { freshStats, gradeChoice } from './stats';
import { allowedActions, bestAction } from './strategy';
import type { Action, Card, GameState, Hand, SavedProgress } from './types';

const DEALER_STANDS_ON = 17;
const REBUY_AMOUNT = 1000;
const DEFAULT_HEADING = 'Make your first decision';

export function newGame(saved?: Partial<SavedProgress>): GameState {
  const shoe = buildShoe();
  return {
    shoe,
    cut: cutPosition(shoe),
    bankroll: saved?.bankroll ?? REBUY_AMOUNT,
    roundStart: 0,
    bet: saved?.bet ?? 25,
    hands: [],
    active: 0,
    dealer: [],
    holeHidden: true,
    phase: 'idle',
    insured: false,
    hint: saved?.hint ?? false,
    message: '',
    stats: saved?.stats ?? freshStats(),
    verdict: null,
    idleHeading: DEFAULT_HEADING,
    lastCell: null,
  };
}

const draw = (game: GameState) => game.shoe.pop() as Card;
const upcardValue = (game: GameState) => cardValue(game.dealer[0]);

export const currentHand = (game: GameState): Hand | undefined => game.hands[game.active];

export const allowedForCurrentHand = (game: GameState) =>
  allowedActions(currentHand(game), game.bankroll, game.hands.length);

export const isRoundInProgress = (game: GameState) =>
  game.phase === 'play' || game.phase === 'insurance';

export function deal(game: GameState) {
  if (isRoundInProgress(game)) return;
  if (game.bankroll < game.bet) {
    game.message = 'Not enough chips for that bet. Lower it or rebuy.';
    return;
  }

  let shuffleNote = '';
  if (game.shoe.length <= game.cut) {
    game.shoe = buildShoe();
    game.cut = cutPosition(game.shoe);
    shuffleNote = 'Shuffled a fresh shoe. ';
  }

  game.roundStart = game.bankroll;
  game.bankroll -= game.bet;
  const playerCards = [draw(game)];
  const dealerCards = [draw(game)];
  playerCards.push(draw(game));
  dealerCards.push(draw(game));
  game.hands = [{ cards: playerCards, bet: game.bet, done: false, result: null }];
  game.dealer = dealerCards;
  game.holeHidden = true;
  game.active = 0;
  game.insured = false;
  game.message = shuffleNote;

  if (upcardValue(game) === 11) {
    game.phase = 'insurance';
    game.message = `${shuffleNote}Dealer shows an ace.`;
    return;
  }
  peekAndStartPlay(game);
}

export function answerInsurance(game: GameState, take: boolean) {
  if (game.phase !== 'insurance') return;
  gradeChoice(game, take ? 'I' : 'N', 'N', { kind: 'ins' });
  game.message = '';
  const cost = game.hands[0].bet / 2;
  if (take && game.bankroll >= cost) {
    game.bankroll -= cost;
    game.insured = true;
  }
  peekAndStartPlay(game);
}

/** The dealer checks for blackjack, then the player's hand is paid or play begins. */
function peekAndStartPlay(game: GameState) {
  const upcard = upcardValue(game);
  const dealerPeeks = upcard === 11 || upcard === 10;
  const hand = game.hands[0];
  const playerBlackjack = isBlackjack(hand.cards);

  if (dealerPeeks && isBlackjack(game.dealer)) {
    game.holeHidden = false;
    if (game.insured) game.bankroll += hand.bet * 1.5;
    if (playerBlackjack) {
      hand.result = 'push';
      game.bankroll += hand.bet;
    } else {
      hand.result = 'lose';
    }
    hand.done = true;
    endRound(game, `Dealer has blackjack.${game.insured ? ' Insurance paid 2 to 1.' : ''}`);
    return;
  }

  let peekNote = '';
  if (game.insured) peekNote = 'No dealer blackjack. Insurance lost. ';
  else if (dealerPeeks) peekNote = 'Dealer checked: no blackjack. ';

  if (playerBlackjack) {
    game.holeHidden = false;
    hand.result = 'bj';
    hand.done = true;
    game.bankroll += hand.bet * 2.5;
    endRound(game, `${peekNote}Blackjack! Paid 3 to 2.`);
    return;
  }

  game.message += peekNote;
  game.phase = 'play';
  finishHandOn21(game);
}

export function playAction(game: GameState, action: Action) {
  if (game.phase !== 'play') return;
  const hand = currentHand(game);
  if (!hand) return;
  const allowed = allowedForCurrentHand(game);
  if (!allowed[action]) return;

  const { best, decision } = bestAction(hand, upcardValue(game), allowed);
  gradeChoice(game, action, best, decision);

  switch (action) {
    case 'H':
      hand.cards.push(draw(game));
      if (handTotal(hand.cards).total >= 21) finishHand(game);
      break;
    case 'S':
      finishHand(game);
      break;
    case 'D':
      game.bankroll -= hand.bet;
      hand.bet *= 2;
      hand.cards.push(draw(game));
      finishHand(game);
      break;
    case 'R':
      hand.result = 'surrender';
      game.bankroll += hand.bet / 2;
      finishHand(game);
      break;
    case 'P':
      split(game, hand);
      break;
  }
}

function split(game: GameState, hand: Hand) {
  game.bankroll -= hand.bet;
  const movedCard = hand.cards.pop() as Card;
  const splitHand: Hand = {
    cards: [movedCard, draw(game)],
    bet: hand.bet,
    done: false,
    result: null,
    split: true,
  };
  hand.split = true;
  hand.cards.push(draw(game));
  game.hands.splice(game.active + 1, 0, splitHand);

  if (movedCard.rank === 'A') {
    hand.done = true;
    game.hands[game.active + 1].done = true;
    game.message = 'Split aces get one card each.';
    moveToNextHand(game);
  } else {
    finishHandOn21(game);
  }
}

function finishHand(game: GameState) {
  game.hands[game.active].done = true;
  moveToNextHand(game);
}

function moveToNextHand(game: GameState) {
  const next = game.hands.findIndex((hand) => !hand.done);
  if (next === -1) {
    playDealer(game);
    return;
  }
  game.active = next;
  finishHandOn21(game);
}

function finishHandOn21(game: GameState) {
  const hand = currentHand(game);
  if (hand && !hand.done && handTotal(hand.cards).total >= 21) finishHand(game);
}

function playDealer(game: GameState) {
  game.holeHidden = false;
  const anyHandLive = game.hands.some(
    (hand) => hand.result !== 'surrender' && handTotal(hand.cards).total <= 21,
  );
  if (anyHandLive) {
    while (handTotal(game.dealer).total < DEALER_STANDS_ON) game.dealer.push(draw(game));
  }

  const dealerTotal = handTotal(game.dealer).total;
  for (const hand of game.hands) {
    if (hand.result) continue;
    const playerTotal = handTotal(hand.cards).total;
    if (playerTotal > 21) {
      hand.result = 'bust';
    } else if (dealerTotal > 21 || playerTotal > dealerTotal) {
      hand.result = 'win';
      game.bankroll += hand.bet * 2;
    } else if (playerTotal === dealerTotal) {
      hand.result = 'push';
      game.bankroll += hand.bet;
    } else {
      hand.result = 'lose';
    }
  }

  let outcome = '';
  if (anyHandLive) {
    outcome = dealerTotal > 21 ? `Dealer busts with ${dealerTotal}.` : `Dealer stands on ${dealerTotal}.`;
  }
  endRound(game, outcome);
}

function endRound(game: GameState, outcome: string) {
  game.phase = 'done';
  const net = game.bankroll - game.roundStart;
  const roundLine = `Round: ${net === 0 ? 'even' : (net > 0 ? '+' : '') + money(net)}.`;
  game.message = [game.message.trim(), outcome, roundLine].filter(Boolean).join(' ');
}

export function setBet(game: GameState, bet: number) {
  game.bet = bet;
}

export function toggleHint(game: GameState) {
  game.hint = !game.hint;
}

export function rebuy(game: GameState) {
  const added = REBUY_AMOUNT - Math.min(game.bankroll, 0);
  game.bankroll += added;
  game.roundStart += added;
}

export function resetStats(game: GameState) {
  game.stats = freshStats();
  game.verdict = null;
  game.lastCell = null;
  game.idleHeading = 'Stats cleared';
}
