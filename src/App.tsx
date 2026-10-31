/* Layout: HUD on the left, table and controls on the stage, chart and stats in pullout drawers. */
import { onMount } from 'solid-js';
import { ActionBar } from './components/ActionBar';
import { Background } from './components/Background';
import { BetBar } from './components/BetBar';
import { DrawerDock } from './components/DrawerDock';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Table } from './components/Table';
import { VerdictPanel } from './components/VerdictPanel';
import { deal, openDrawer, useAutoSave, useKeyboardShortcuts } from './store';

export function App() {
  useAutoSave();
  useKeyboardShortcuts();
  onMount(deal);

  return (
    <>
      <Background />
      <div class="layout" classList={{ 'drawer-open': openDrawer() !== null }}>
        <aside class="hud">
          <Header />
          <BetBar />
          <Footer />
        </aside>
        <main class="stage">
          <Table />
          <VerdictPanel />
          <ActionBar />
        </main>
      </div>
      <DrawerDock />
    </>
  );
}
