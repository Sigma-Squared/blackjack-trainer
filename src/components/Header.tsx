import { money } from '../format';
import { game } from '../store';
import './Header.css';

export function Header() {
  const accuracy = () =>
    game.stats.n ? `${Math.round((game.stats.ok / game.stats.n) * 100)}%` : '—';

  return (
    <header>
      <div>
        <h1>Basic Strategy Trainer</h1>
        <p class="rules">6 decks · Dealer stands soft 17 · Double after split · Late surrender</p>
      </div>
      <div class="chips">
        <div class="chip">
          <b>{accuracy()}</b>
          <span>Accuracy</span>
        </div>
        <div class="chip">
          <b>{game.stats.streak}</b>
          <span>Streak</span>
        </div>
        <div class="chip">
          <b>{money(game.bankroll)}</b>
          <span>Bankroll</span>
        </div>
      </div>
    </header>
  );
}
