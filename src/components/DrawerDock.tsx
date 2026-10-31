import type { JSX } from 'solid-js';
import { closeDrawer, openDrawer, resetStats, toggleDrawer, type DrawerId } from '../store';
import { ConfirmButton } from './ConfirmButton';
import './DrawerDock.css';
import { MistakeLog } from './MistakeLog';
import { Scorecard } from './Scorecard';
import { StrategyChart } from './StrategyChart';

function Drawer(props: { id: DrawerId; title: string; children: JSX.Element }) {
  const open = () => openDrawer() === props.id;

  return (
    <section
      id={`drawer-${props.id}`}
      class="drawer"
      classList={{ open: open() }}
      aria-label={props.title}
      inert={!open()}
    >
      <header class="drawer-head">
        <h2 class="section-title">{props.title}</h2>
        <button class="drawer-close px-btn" aria-label={`Close ${props.title}`} onClick={closeDrawer}>
          X
        </button>
      </header>
      <div class="drawer-body">{props.children}</div>
    </section>
  );
}

function DrawerTab(props: { id: DrawerId; label: string; shortcut: string }) {
  return (
    <button
      class="drawer-tab px-btn"
      aria-expanded={openDrawer() === props.id}
      aria-controls={`drawer-${props.id}`}
      onClick={() => toggleDrawer(props.id)}
    >
      {props.label}
      <kbd>{props.shortcut}</kbd>
    </button>
  );
}

export function DrawerDock() {
  return (
    <div class="dock" classList={{ 'has-open': openDrawer() !== null }}>
      <nav class="drawer-tabs" aria-label="Drawers">
        <DrawerTab id="chart" label="Chart" shortcut="C" />
        <DrawerTab id="stats" label="Stats" shortcut="M" />
      </nav>
      <Drawer id="chart" title="Strategy chart">
        <StrategyChart />
      </Drawer>
      <Drawer id="stats" title="Stats">
        <Scorecard />
        <MistakeLog />
        <ConfirmButton label="Reset stats" onConfirm={resetStats} />
      </Drawer>
    </div>
  );
}
