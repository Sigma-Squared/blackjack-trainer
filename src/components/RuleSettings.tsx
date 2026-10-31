import { For } from 'solid-js';
import type { BlackjackPayout } from '../engine/types';
import { game, setBlackjackPayout, setInsurance, setSurrender } from '../store';
import './RuleSettings.css';

/** Shown as settings, but fixed for now: the strategy tables are written for these rules. */
const LOCKED_RULES = [
  { label: 'Decks', value: '6' },
  { label: 'Dealer on soft 17', value: 'Stands' },
];

const ON_OFF = [
  { value: false, text: 'Off' },
  { value: true, text: 'On' },
];
const INSURANCE_OPTIONS = [
  { value: true, text: '2:1' },
  { value: false, text: 'Off' },
];
const PAYOUT_OPTIONS: { value: BlackjackPayout; text: string }[] = [
  { value: '3:2', text: '3:2' },
  { value: '6:5', text: '6:5' },
];

interface PillProps<T> {
  label: string;
  options: { value: T; text: string }[];
  selected: T;
  /** Leave out to lock the setting. */
  onSelect?: (value: T) => void;
}

function Pill<T>(props: PillProps<T>) {
  return (
    <div class="rule">
      <span>{props.label}</span>
      <div class="pill" role="group" aria-label={props.label}>
        <For each={props.options}>
          {(option) => (
            <button
              class="rule-toggle px-btn"
              aria-pressed={option.value === props.selected}
              disabled={!props.onSelect}
              onClick={() => props.onSelect?.(option.value)}
            >
              {option.text}
            </button>
          )}
        </For>
      </div>
    </div>
  );
}

export function RuleSettings() {
  return (
    <div class="rule-settings">
      <span class="lbl">Settings</span>
      <For each={LOCKED_RULES}>
        {({ label, value }) => (
          <div class="rule">
            <span>{label}</span>
            <button class="rule-toggle px-btn" disabled aria-label={`${label}: ${value}`}>
              {value}
            </button>
          </div>
        )}
      </For>
      <Pill label="Double after split" options={ON_OFF} selected={true} />
      <Pill
        label="Surrender"
        options={ON_OFF}
        selected={game.rules.surrender}
        onSelect={setSurrender}
      />
      <Pill
        label="Insurance"
        options={INSURANCE_OPTIONS}
        selected={game.rules.insurance}
        onSelect={setInsurance}
      />
      <Pill
        label="Blackjack pays"
        options={PAYOUT_OPTIONS}
        selected={game.rules.blackjackPayout}
        onSelect={setBlackjackPayout}
      />
    </div>
  );
}
