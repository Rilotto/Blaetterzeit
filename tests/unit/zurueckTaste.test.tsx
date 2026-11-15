import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { ZURUECK_FRIST_MS, useZurueckTaste } from '@/plattform/zurueckTaste';

afterEach(cleanup);

function Fenster({ onZu }: { onZu: () => void }) {
  const verlassen = useZurueckTaste(() => {
    onZu();
  });
  return (
    <div role="dialog">
      <button
        type="button"
        onClick={() => {
          verlassen();
          onZu();
        }}
      >
        X
      </button>
    </div>
  );
}

function Rahmen() {
  const [offen, setOffen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOffen(true)}>
        Öffnen
      </button>
      {offen ? <Fenster onZu={() => setOffen(false)} /> : null}
    </>
  );
}

const warte = (ms: number) => act(() => new Promise<void>((r) => setTimeout(r, ms)));

describe('Zurück-Taste: verspätetes popstate (Befund H4)', () => {
  it('Schließen über X und sofortiges Wiederöffnen: das verspätete popstate schließt das neue Fenster nicht', async () => {
    render(<Rahmen />);
    fireEvent.click(screen.getByText('Öffnen'));
    await warte(20);
    fireEvent.click(screen.getByText('X'));
    expect(screen.queryByRole('dialog')).toBeNull();
    // Sofort wieder öffnen, bevor das popstate des history.back() eintrifft.
    fireEvent.click(screen.getByText('Öffnen'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    // Verspätetes popstate (echt aus jsdom bzw. simuliert, falls jsdom keines liefert).
    await warte(50);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await warte(ZURUECK_FRIST_MS + 50);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    // Eine echte Zurück-Taste schließt das neue Fenster weiterhin.
    act(() => {
      window.history.back();
    });
    await warte(50);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('Simuliertes popstate direkt nach dem Wiederöffnen (wie in den Akzeptanztests) schließt das neue Fenster', async () => {
    render(<Rahmen />);
    fireEvent.click(screen.getByText('Öffnen'));
    fireEvent.click(screen.getByText('X'));
    fireEvent.click(screen.getByText('Öffnen'));
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(screen.queryByRole('dialog')).toBeNull();
    await warte(ZURUECK_FRIST_MS + 50);
  });
});
