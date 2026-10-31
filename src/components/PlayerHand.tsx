import { For, Show } from 'solid-js';
import { totalLabel } from '../engine/cards';
import type { Hand, HandResult } from '../engine/types';
import { money } from '../format';
import { PlayingCard } from './PlayingCard';

const RESULT_LABELS: Record<HandResult, string> = {
  win: 'Win',
  lose: 'Lose',
  push: 'Push',
  bust: 'Bust',
  bj: 'Blackjack',
  surrender: 'Surrender',
};

const SECOND_CARD_DELAY_MS = 300;

export function PlayerHand(props: { hand: Hand; active: boolean }) {
  return (
    <div class="hand" classList={{ active: props.active }}>
      <div class="cards">
        <For each={props.hand.cards}>
          {(card, index) => (
            <PlayingCard card={card} delay={index() === 1 ? SECOND_CARD_DELAY_MS : 0} />
          )}
        </For>
      </div>
      <div class="hand-foot">
        <span class="total">{totalLabel(props.hand.cards, props.hand.split)}</span>
        <span class="bet">{money(props.hand.bet)}</span>
        <Show when={props.hand.result}>
          {(result) => <span class={`res ${result()}`}>{RESULT_LABELS[result()]}</span>}
        </Show>
      </div>
    </div>
  );
}
