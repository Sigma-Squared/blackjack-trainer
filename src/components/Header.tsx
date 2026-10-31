import { money } from '../format';
import { game } from '../store';
import './Header.css';
import { Pop } from './Pop';

export function Header() {
  const accuracy = () =>
    game.stats.n ? `${Math.round((game.stats.ok / game.stats.n) * 100)}%` : '--';

  return (
    <header class="stats-header">
      <div class="title px-box">
        <h1>Blackjack Trainer</h1>
      </div>
      <div class="tallies">
        <div class="tally accuracy px-box">
          <span>Accuracy</span>
          <Pop value={game.stats.n}>
            <b>{accuracy()}</b>
          </Pop>
        </div>
        <div class="tally streak px-box">
          <span>Streak</span>
          <Pop value={game.stats.streak}>
            <b>{game.stats.streak}</b>
          </Pop>
        </div>
        <div class="tally bankroll px-box">
          <span>Bankroll</span>
          <Pop value={game.bankroll}>
            <b>{money(game.bankroll)}</b>
          </Pop>
        </div>
      </div>
    </header>
  );
}
