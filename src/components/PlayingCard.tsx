import { createEffect, createSignal, on, Show } from 'solid-js';
import { isRed } from '../engine/cards';
import type { Card } from '../engine/types';
import './PlayingCard.css';

interface Props {
  card: Card;
  faceDown?: boolean;
  /** Milliseconds to wait before the deal animation. */
  delay?: number;
}

export function PlayingCard(props: Props) {
  const [flipped, setFlipped] = createSignal(false);
  createEffect(
    on(
      () => props.faceDown,
      (faceDown, wasFaceDown) => {
        if (wasFaceDown && !faceDown) setFlipped(true);
      },
    ),
  );

  const corner = (
    <>
      {props.card.rank}
      <i>{props.card.suit}</i>
    </>
  );

  return (
    <div
      class="card"
      classList={{
        back: props.faceDown,
        red: !props.faceDown && isRed(props.card),
        new: !flipped(),
        flip: flipped(),
      }}
      style={{ 'animation-delay': `${flipped() ? 0 : (props.delay ?? 0)}ms` }}
      aria-label={props.faceDown ? 'Face-down card' : `${props.card.rank} of ${props.card.suit}`}
    >
      <Show when={!props.faceDown}>
        <span class="cr">{corner}</span>
        <span class="cs">{props.card.suit}</span>
        <span class="cr br">{corner}</span>
      </Show>
    </div>
  );
}
