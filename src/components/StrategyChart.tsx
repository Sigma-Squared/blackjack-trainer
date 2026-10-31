import { createSelector, For } from 'solid-js';
import { upcardLabel } from '../engine/cards';
import { hardCode, pairCode, softCode } from '../engine/strategy';
import type { ChartCode } from '../engine/types';
import { game } from '../store';
import './StrategyChart.css';

const UPCARDS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

interface ChartRow {
  key: number;
  label: string;
}

interface ChartTable {
  caption: string;
  kind: string;
  rows: ChartRow[];
  code: (key: number, upcard: number) => ChartCode;
}

const totalRow = (total: number): ChartRow => ({ key: total, label: String(total) });

function pairLabel(value: number) {
  if (value === 11) return 'A,A';
  if (value === 10) return 'T,T';
  return `${value},${value}`;
}

const TABLES: ChartTable[] = [
  {
    caption: 'Hard totals',
    kind: 'hard',
    rows: [
      { key: 8, label: '≤8' },
      ...[9, 10, 11, 12, 13, 14, 15, 16].map(totalRow),
      { key: 17, label: '17+' },
    ],
    code: (total, upcard) => hardCode(total, upcard),
  },
  {
    caption: 'Soft totals',
    kind: 'soft',
    rows: [13, 14, 15, 16, 17, 18, 19, 20].map((total) => ({ key: total, label: `A,${total - 11}` })),
    code: softCode,
  },
  {
    caption: 'Pairs',
    kind: 'pair',
    rows: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((value) => ({ key: value, label: pairLabel(value) })),
    code: pairCode,
  },
];

const LEGEND: { swatch: string; text: string }[] = [
  { swatch: 'h', text: 'H Hit' },
  { swatch: 's', text: 'S Stand' },
  { swatch: 'd', text: 'D Double, else hit' },
  { swatch: 'ds', text: 'Ds Double, else stand' },
  { swatch: 'p', text: 'P Split' },
  { swatch: 'r', text: 'R Surrender, else hit' },
];

function Chart(props: { table: ChartTable; isHighlighted: (cell: string) => boolean }) {
  return (
    <div class="tw">
      <table class="chart">
        <caption>{props.table.caption}</caption>
        <tbody>
          <tr>
            <th />
            <For each={UPCARDS}>{(upcard) => <th scope="col">{upcardLabel(upcard)}</th>}</For>
          </tr>
          <For each={props.table.rows}>
            {(row) => (
              <tr>
                <th scope="row">{row.label}</th>
                <For each={UPCARDS}>
                  {(upcard) => {
                    const code = props.table.code(row.key, upcard);
                    const cell = `${props.table.kind}-${row.key}-${upcard}`;
                    return (
                      <td class={code} classList={{ hl: props.isHighlighted(cell) }}>
                        {code}
                      </td>
                    );
                  }}
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
}

export function StrategyChart() {
  const isHighlighted = createSelector(() => game.lastCell);

  return (
    <details class="panel" open>
      <summary>
        <h3>Strategy chart</h3>
      </summary>
      <p class="sub">Your last decision is outlined. Rows are your hand, columns the dealer's upcard.</p>
      <div class="legend">
        <For each={LEGEND}>
          {({ swatch, text }) => (
            <span>
              <i style={{ background: `var(--c-${swatch})` }} />
              {text}
            </span>
          )}
        </For>
      </div>
      <div class="charts">
        <For each={TABLES}>{(table) => <Chart table={table} isHighlighted={isHighlighted} />}</For>
      </div>
    </details>
  );
}
