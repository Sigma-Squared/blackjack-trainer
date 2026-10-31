import { createMemo, For, Match, Switch } from 'solid-js';
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
      <button class="act px-btn take" onClick={() => answerInsurance(true)}>
        Take insurance<kbd>Y</kbd>
      </button>
      <button
        class="act px-btn decline"
        classList={{ rec: game.hint }}
        onClick={() => answerInsurance(false)}
      >
        No insurance<kbd>N</kbd>
      </button>
    </div>
  );
}

function MoveButtons() {
  const allowed = createMemo(() => allowedForCurrentHand(game));
  const moves = () => ACTIONS.filter(({ action }) => action !== 'R' || game.rules.surrender);
  const recommended = createMemo(() => {
    const hand = currentHand(game);
    if (!game.hint || !hand) return null;
    return bestAction(hand, cardValue(game.dealer[0]), allowed()).best;
  });

  return (
    <div class="actions">
      <For each={moves()}>
        {({ action, label }) => (
          <button
            class="act px-btn"
            classList={{ rec: recommended() === action }}
            style={{ '--action': `var(--c-${action.toLowerCase()})` }}
            disabled={!allowed()[action]}
            onClick={() => playAction(action)}
          >
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
    <div class="controls">
      <Switch
        fallback={
          <button class="deal px-btn" onClick={deal}>
            Deal next hand <span class="deal-key">Space</span>
          </button>
        }
      >
        <Match when={game.phase === 'insurance'}>
          <InsuranceButtons />
        </Match>
        <Match when={game.phase === 'play'}>
          <MoveButtons />
        </Match>
      </Switch>
    </div>
  );
}
