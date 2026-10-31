import { For } from 'solid-js';
import { game, setBet, toggleHint } from '../store';
import './BetBar.css';

const BET_SIZES = [10, 25, 50, 100];

export function BetBar() {
  return (
    <div class="betbar">
      <div class="betchips">
        <span class="lbl">Bet</span>
        <For each={BET_SIZES}>
          {(size) => (
            <button
              class={`pchip pchip-${size}`}
              classList={{ on: game.bet === size }}
              aria-label={`Bet ${size}`}
              onClick={() => setBet(size)}
            >
              {size}
            </button>
          )}
        </For>
      </div>
      <button class="toggle" aria-pressed={game.hint} onClick={toggleHint}>
        {game.hint ? 'Hints on' : 'Show hints'}
      </button>
    </div>
  );
}
