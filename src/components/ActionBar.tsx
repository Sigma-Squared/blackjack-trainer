import { createMemo, For, Show } from 'solid-js';
import { cardValue } from '../engine/cards';
import { allowedForCurrentHand, currentHand } from '../engine/round';
import { bestAction } from '../engine/strategy';
import type { Action } from '../engine/types';
import { answerInsurance, deal, game, playAction } from '../store';
import './ActionBar.css';

const ACTIONS: { action: Action; label: string }[] = [
  { action: 'H', label: 'Hit' },
  { action: 'S', label: 'Stand' },
  { action: 'D', label: 'Double' },
  { action: 'P', label: 'Split' },
  { action: 'R', label: 'Surrender' },
];

function InsuranceButtons() {
  return (
    <div class="ins">
      <button class="act" onClick={() => answerInsurance(true)}>
        Take insurance<kbd>Y</kbd>
      </button>
      <button class="act" classList={{ rec: game.hint }} onClick={() => answerInsurance(false)}>
        No insurance<kbd>N</kbd>
      </button>
    </div>
  );
}

function MoveButtons() {
  const allowed = createMemo(() => (game.phase === 'play' ? allowedForCurrentHand(game) : {}));
  const recommended = createMemo(() => {
    const hand = currentHand(game);
    if (game.phase !== 'play' || !game.hint || !hand) return null;
    return bestAction(hand, cardValue(game.dealer[0]), allowed()).best;
  });

  return (
    <div class="actions">
      <For each={ACTIONS}>
        {({ action, label }) => (
          <button
            class="act"
            classList={{ rec: recommended() === action }}
            disabled={!allowed()[action]}
            onClick={() => playAction(action)}
          >
            <span class="sw" style={{ background: `var(--c-${action.toLowerCase()})` }} />
            {label}
            <kbd>{action}</kbd>
          </button>
        )}
      </For>
    </div>
  );
}

export function ActionBar() {
  return (
    <>
      <Show when={game.phase === 'insurance'} fallback={<MoveButtons />}>
        <InsuranceButtons />
      </Show>
      <Show when={game.phase === 'done' || game.phase === 'idle'}>
        <button class="deal" onClick={deal}>
          Deal next hand <span class="deal-key">· Space</span>
        </button>
      </Show>
    </>
  );
}
