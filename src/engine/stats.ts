import { decisionLabel, explain } from './coaching';
import { chartCell } from './strategy';
import type { Choice, Decision, GameState, Stats } from './types';

const MISTAKE_LOG_SIZE = 12;

export function freshStats(): Stats {
  return {
    n: 0,
    ok: 0,
    streak: 0,
    best: 0,
    cat: { hard: [0, 0], soft: [0, 0], pair: [0, 0], ins: [0, 0] },
    log: [],
  };
}

export function gradeChoice(game: GameState, choice: Choice, best: Choice, decision: Decision) {
  const { stats } = game;
  const correct = choice === best;

  stats.n++;
  if (correct) {
    stats.ok++;
    stats.streak++;
    stats.best = Math.max(stats.best, stats.streak);
  } else {
    stats.streak = 0;
  }

  const category = stats.cat[decision.kind];
  category[1]++;
  if (correct) category[0]++;

  const label = decisionLabel(decision);
  game.lastCell = chartCell(decision);
  game.verdict = { correct, choice, best, label, why: explain(best, decision) };
  game.verdictStale = false;
  if (!correct) {
    stats.log.unshift({ label, choice, best });
    stats.log = stats.log.slice(0, MISTAKE_LOG_SIZE);
  }
}
