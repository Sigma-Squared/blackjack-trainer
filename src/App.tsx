/* Layout: a single card-table column. Felt table on top, action rail beneath, strategy chart and scorecard below. */
import { onMount } from 'solid-js';
import { ActionBar } from './components/ActionBar';
import { BetBar } from './components/BetBar';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { MistakeLog } from './components/MistakeLog';
import { Scorecard } from './components/Scorecard';
import { StrategyChart } from './components/StrategyChart';
import { Table } from './components/Table';
import { VerdictPanel } from './components/VerdictPanel';
import { deal, useAutoSave, useKeyboardShortcuts } from './store';

export function App() {
  useAutoSave();
  useKeyboardShortcuts();
  onMount(deal);

  return (
    <div class="wrap">
      <Header />
      <Table />
      <VerdictPanel />
      <ActionBar />
      <BetBar />
      <StrategyChart />
      <div class="grid2">
        <Scorecard />
        <MistakeLog />
      </div>
      <Footer />
    </div>
  );
}
