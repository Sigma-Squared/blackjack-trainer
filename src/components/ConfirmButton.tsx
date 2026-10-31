import { createSignal, onCleanup } from 'solid-js';

const CONFIRM_WINDOW_MS = 3000;

/** A button that needs a second tap within a few seconds before it acts. */
export function ConfirmButton(props: { label: string; onConfirm: () => void }) {
  const [armed, setArmed] = createSignal(false);
  let timer: ReturnType<typeof setTimeout>;
  onCleanup(() => clearTimeout(timer));

  function handleClick() {
    clearTimeout(timer);
    if (armed()) {
      setArmed(false);
      props.onConfirm();
    } else {
      setArmed(true);
      timer = setTimeout(() => setArmed(false), CONFIRM_WINDOW_MS);
    }
  }

  return (
    <button class="ghost" classList={{ warn: armed() }} onClick={handleClick}>
      {armed() ? 'Tap again to confirm' : props.label}
    </button>
  );
}
