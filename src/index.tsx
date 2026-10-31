/* @refresh reload */
import { render } from 'solid-js/web';
import { App } from './App';
import '@fontsource/limelight/latin-400.css';
import '@fontsource/figtree/latin-400.css';
import '@fontsource/figtree/latin-500.css';
import '@fontsource/figtree/latin-600.css';
import '@fontsource/figtree/latin-700.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import '@fontsource/jetbrains-mono/latin-700.css';
import './styles/base.css';

render(() => <App />, document.getElementById('root') as HTMLElement);
