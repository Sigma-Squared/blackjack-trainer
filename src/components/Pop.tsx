import { createEffect, on, type JSX } from 'solid-js';

const POP_FRAMES = [
  { transform: 'scale(1)' },
  { transform: 'scale(1.1) rotate(-1deg)' },
  { transform: 'scale(1)' },
];

/** Gives its content a quick bounce whenever `value` changes. */
export function Pop(props: { value: unknown; class?: string; children: JSX.Element }) {
  let element!: HTMLDivElement;

  createEffect(
    on(
      () => props.value,
      () => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        element.animate(POP_FRAMES, { duration: 180, easing: 'steps(4)' });
      },
      { defer: true },
    ),
  );

  return (
    <div ref={element} class={props.class}>
      {props.children}
    </div>
  );
}
