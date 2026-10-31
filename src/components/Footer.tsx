import { game, rebuy, resetStats } from '../store';
import { ConfirmButton } from './ConfirmButton';
import './Footer.css';

export function Footer() {
  return (
    <div class="foot">
      <span>
        Shoe: {game.shoe.length} cards left · reshuffles at {game.cut}
      </span>
      <span class="foot-buttons">
        <ConfirmButton label="Rebuy $1,000" onConfirm={rebuy} />
        <ConfirmButton label="Reset stats" onConfirm={resetStats} />
      </span>
    </div>
  );
}
