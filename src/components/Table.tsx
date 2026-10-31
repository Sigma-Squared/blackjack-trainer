import { For, Show } from 'solid-js';
import { cardValue, totalLabel, upcardLabel } from '../engine/cards';
import { game } from '../store';
import { PlayerHand } from './PlayerHand';
import { PlayingCard } from './PlayingCard';
import './Table.css';

const HOLE_CARD_DELAY_MS = 150;
const DEALER_DRAW_DELAY_MS = 260;

function dealerCardDelay(index: number) {
  if (index === 0) return 0;
  return index === 1 ? HOLE_CARD_DELAY_MS : (index - 1) * DEALER_DRAW_DELAY_MS;
}

function dealerLabel() {
  if (game.dealer.length === 0) return '';
  if (game.holeHidden) return `Shows ${upcardLabel(cardValue(game.dealer[0]))}`;
  return totalLabel(game.dealer);
}

export function Table() {
  return (
    <section class="table px-box" aria-label="Blackjack table">
      <div class="seat">
        <div class="zone-label">
          Dealer
          <Show when={dealerLabel()}>
            <span class="total">{dealerLabel()}</span>
          </Show>
        </div>
        <div class="cards">
          <For each={game.dealer}>
            {(card, index) => (
              <PlayingCard
                card={card}
                faceDown={index() === 1 && game.holeHidden}
                delay={dealerCardDelay(index())}
              />
            )}
          </For>
        </div>
      </div>
      <div class="seat-gap" />
      <div class="seat">
        <div class="hands">
          <For each={game.hands}>
            {(hand, index) => (
              <PlayerHand
                hand={hand}
                active={game.phase === 'play' && index() === game.active && game.hands.length > 1}
              />
            )}
          </For>
        </div>
      </div>
      <div class="msg" aria-live="polite">
        {game.message}
      </div>
    </section>
  );
}
