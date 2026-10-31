import { createEffect, createSignal, onCleanup, onMount } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import * as round from './engine/round';
import type { Action, BlackjackPayout, GameState } from './engine/types';
import { loadProgress, saveProgress } from './persistence';

const [game, setGame] = createStore<GameState>(round.newGame(loadProgress()));

const update = (change: (game: GameState) => void) => setGame(produce(change));

export { game };

export const deal = () => update(round.deal);
export const playAction = (action: Action) => update((g) => round.playAction(g, action));
export const answerInsurance = (take: boolean) => update((g) => round.answerInsurance(g, take));
export const setBet = (bet: number) => update((g) => round.setBet(g, bet));
export const toggleHint = () => update(round.toggleHint);
export const setSurrender = (offered: boolean) => update((g) => round.setSurrender(g, offered));
export const setBlackjackPayout = (payout: BlackjackPayout) =>
  update((g) => round.setBlackjackPayout(g, payout));
export const setInsurance = (offered: boolean) => update((g) => round.setInsurance(g, offered));
export const rebuy = () => update(round.rebuy);
export const resetStats = () => update(round.resetStats);

export type DrawerId = 'chart' | 'stats';

const [openDrawer, setOpenDrawer] = createSignal<DrawerId | null>(null);

export { openDrawer };

export const toggleDrawer = (id: DrawerId) => setOpenDrawer((open) => (open === id ? null : id));
export const closeDrawer = () => setOpenDrawer(null);

/** Saves whenever the persisted fields change. Call once from inside a component. */
export function useAutoSave() {
  createEffect(() => saveProgress(game));
}

const ACTION_KEYS: Record<string, Action> = { h: 'H', s: 'S', d: 'D', p: 'P', r: 'R' };
const DRAWER_KEYS: Record<string, DrawerId> = { c: 'chart', m: 'stats' };

function handleKeydown(event: KeyboardEvent) {
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  const target = event.target as HTMLElement;
  if (target.closest?.('input,textarea,a')) return;

  const key = event.key.toLowerCase();
  if (key in DRAWER_KEYS) {
    toggleDrawer(DRAWER_KEYS[key]);
  } else if (key === 'escape') {
    closeDrawer();
  } else if (game.phase === 'play' && key in ACTION_KEYS) {
    playAction(ACTION_KEYS[key]);
  } else if (game.phase === 'insurance' && (key === 'y' || key === 'n')) {
    answerInsurance(key === 'y');
  } else if ((game.phase === 'done' || game.phase === 'idle') && (key === ' ' || key === 'enter')) {
    if (target.tagName === 'BUTTON' && key === 'enter') return;
    event.preventDefault();
    deal();
  }
}

export function useKeyboardShortcuts() {
  onMount(() => {
    document.addEventListener('keydown', handleKeydown);
    onCleanup(() => document.removeEventListener('keydown', handleKeydown));
  });
}
