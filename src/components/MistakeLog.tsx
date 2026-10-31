import { For } from 'solid-js';
import { CHOICE_NAMES } from '../engine/coaching';
import { game } from '../store';
import './MistakeLog.css';

export function MistakeLog() {
  return (
    <section class="drawer-section">
      <h3 class="section-title">Recent mistakes</h3>
      <p class="sub">Your last 12 misplays, newest first.</p>
      <ul class="log">
        <For each={game.stats.log} fallback={<li class="empty">No mistakes yet.</li>}>
          {(mistake) => (
            <li>
              <b>{mistake.label}</b>
              <span>
                You: {CHOICE_NAMES[mistake.choice]} · Correct: {CHOICE_NAMES[mistake.best]}
              </span>
            </li>
          )}
        </For>
      </ul>
    </section>
  );
}
