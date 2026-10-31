/* @refresh reload */
import { render } from 'solid-js/web';
import '@fontsource/jersey-10/latin-400.css';
// Before App, so that component styles can override the base ones.
import './styles/base.css';
import { App } from './App';

render(() => <App />, document.getElementById('root') as HTMLElement);
