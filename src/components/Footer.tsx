import { game, rebuy } from '../store';
import { ConfirmButton } from './ConfirmButton';
import './Footer.css';
import { RuleSettings } from './RuleSettings';

export function Footer() {
  return (
    <div class="foot">
      <span>
        Shoe: {game.shoe.length} cards left · reshuffles at {game.cut}
      </span>
      <ConfirmButton label="Rebuy $1,000" onConfirm={rebuy} />
      <RuleSettings />
      <span class="credit">
        <a href="https://greebles.itch.io/pixel-plebes" target="_blank" rel="noopener noreferrer">
          Pixel Plebes
        </a>{' '}
        cards by Devlyn JD
      </span>
    </div>
  );
}
