import { For } from 'solid-js';
import type { DecisionKind } from '../engine/types';
import { game } from '../store';
import './Scorecard.css';

const CATEGORIES: { kind: DecisionKind; name: string }[] = [
  { kind: 'hard', name: 'Hard totals' },
  { kind: 'soft', name: 'Soft totals' },
  { kind: 'pair', name: 'Pairs' },
  { kind: 'ins', name: 'Insurance' },
];

function CategoryBar(props: { kind: DecisionKind; name: string }) {
  const correct = () => game.stats.cat[props.kind][0];
  const graded = () => game.stats.cat[props.kind][1];
  const percent = () => (graded() ? Math.round((correct() / graded()) * 100) : 0);

  return (
    <div class="bar">
      <span>{props.name}</span>
      <div class="track">
        <div class="fill" style={{ width: `${percent()}%` }} />
      </div>
      <span class="v">
        {graded() ? `${percent()}%` : '--'}{' '}
        <span class="count">
          {correct()}/{graded()}
        </span>
      </span>
    </div>
  );
}

export function Scorecard() {
  const summary = () => {
    const { n, ok, best } = game.stats;
    return n ? `${ok} of ${n} decisions correct · best streak ${best}` : 'No decisions graded yet.';
  };

  return (
    <section class="drawer-section">
      <h3 class="section-title">Scorecard</h3>
      <p class="sub">{summary()}</p>
      <div class="bars">
        <For each={CATEGORIES}>{(category) => <CategoryBar {...category} />}</For>
      </div>
    </section>
  );
}
