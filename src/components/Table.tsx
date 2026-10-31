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

function FeltArc() {
  return (
    <svg class="arc" viewBox="0 0 420 74" aria-hidden="true">
      <path id="arc1" d="M 30 8 Q 210 70 390 8" fill="none" />
      <path id="arc2" d="M 56 28 Q 210 82 364 28" fill="none" />
      <text font-size="17">
        <textPath href="#arc1" startOffset="50%" text-anchor="middle">
          BLACKJACK PAYS 3 TO 2
        </textPath>
      </text>
      <text class="small">
        <textPath href="#arc2" startOffset="50%" text-anchor="middle">
          DEALER MUST STAND ON ALL 17s · INSURANCE PAYS 2 TO 1
        </textPath>
      </text>
    </svg>
  );
}

export function Table() {
  return (
    <section class="table" aria-label="Blackjack table">
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
      <FeltArc />
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
      <div class="msg" aria-live="polite">
        {game.message}
      </div>
    </section>
  );
}
