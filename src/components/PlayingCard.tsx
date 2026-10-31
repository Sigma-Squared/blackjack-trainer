import { createEffect, createSignal, on } from 'solid-js';
import {
  ANIMATION_LOOP_MS,
  animatedRowPosition,
  CARD_BACK_POSITION,
  cardName,
  cardPosition,
} from '../cardSprites';
import type { Card } from '../engine/types';
import './PlayingCard.css';

interface Props {
  card: Card;
  faceDown?: boolean;
  /** Milliseconds to wait before the deal animation. */
  delay?: number;
}

/** Runs the card's frames off the page clock, so every card on the table shows the same frame. */
function syncFrames(element: HTMLElement) {
  for (const animation of element.getAnimations({ subtree: true })) {
    if (animation instanceof CSSAnimation && animation.animationName === 'frames') {
      animation.startTime = 0;
    }
  }
}

export function PlayingCard(props: Props) {
  let element!: HTMLDivElement;
  const [flipped, setFlipped] = createSignal(false);
  const frameRow = () => animatedRowPosition(props.card);
  const animated = () => !props.faceDown && frameRow() !== null;

  createEffect(
    on(
      () => props.faceDown,
      (faceDown, wasFaceDown) => {
        if (wasFaceDown && !faceDown) setFlipped(true);
      },
    ),
  );
  createEffect(() => {
    if (animated()) syncFrames(element);
  });

  return (
    <div
      ref={element}
      class="card"
      classList={{ new: !flipped(), flip: flipped(), animated: animated() }}
      style={{
        'background-position': props.faceDown ? CARD_BACK_POSITION : cardPosition(props.card),
        'animation-delay': `${flipped() ? 0 : (props.delay ?? 0)}ms`,
        '--frame-row': frameRow() ?? undefined,
        '--frame-loop': `${ANIMATION_LOOP_MS}ms`,
      }}
      role="img"
      aria-label={props.faceDown ? 'Face-down card' : cardName(props.card)}
    />
  );
}
