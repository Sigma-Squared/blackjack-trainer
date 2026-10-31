import { Show } from 'solid-js';
import { CHOICE_NAMES } from '../engine/coaching';
import type { Verdict } from '../engine/types';
import { game } from '../store';
import { Pop } from './Pop';
import './VerdictPanel.css';

function verdictHeading(verdict: Verdict) {
  if (verdict.correct) return `Correct: ${CHOICE_NAMES[verdict.choice]}`;
  return `You chose ${CHOICE_NAMES[verdict.choice]}. Basic strategy: ${CHOICE_NAMES[verdict.best]}.`;
}

export function VerdictPanel() {
  return (
    <Pop value={game.stats.n} class="verdict-pop">
      <Show
        when={game.verdict}
        fallback={
          <div class="verdict idle px-box" aria-live="polite">
            <div class="mark">?</div>
            <h2>{game.idleHeading}</h2>
            <p>Each move is checked against basic strategy for these rules.</p>
          </div>
        }
      >
        {(verdict) => (
          <div
            class="verdict px-box"
            classList={{
              idle: game.verdictStale,
              ok: !game.verdictStale && verdict().correct,
              no: !game.verdictStale && !verdict().correct,
            }}
            aria-live="polite"
          >
            <div class="mark">{verdict().correct ? 'OK' : 'NO'}</div>
            <h2>{verdictHeading(verdict())}</h2>
            <p>
              <strong>{verdict().label}.</strong> {verdict().why}
            </p>
          </div>
        )}
      </Show>
    </Pop>
  );
}
