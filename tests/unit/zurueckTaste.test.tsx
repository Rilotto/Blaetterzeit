import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
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

  it('Verlaufseintrag einer früheren Modul-Instanz (Neuladen) mit gleichem Kennzeichen stört nicht: verspätetes popstate schließt das neue Fenster nicht', async () => {
    // Instanz A legt einen Eintrag an und bleibt im Verlauf liegen (z. B. Seite neu geladen, ohne zu schließen).
    vi.resetModules();
    const a = await import('@/plattform/zurueckTaste');
    function AltFenster() {
      a.useZurueckTaste(() => {});
      return null;
    }
    const alt = render(<AltFenster />);
    await warte(10);
    alt.unmount();
    // Instanz B: Fenster öffnen, über X schließen und sofort ein anderes öffnen (wie Barcode-Treffer → Manueller Eintrag).
    vi.resetModules();
    const bMod = await import('@/plattform/zurueckTaste');
    function B({ onZu }: { onZu: () => void }) {
      const verlassen = bMod.useZurueckTaste(() => onZu());
      return (
        <div role="dialog" aria-label="B">
          <button type="button" onClick={() => (verlassen(), onZu())}>
            schliessen
          </button>
        </div>
      );
    }
    function RahmenB() {
      const [n, setN] = useState(1);
      return n === 1 ? <B key="erstes" onZu={() => setN(2)} /> : n === 2 ? <B key="zweites" onZu={() => setN(3)} /> : null;
    }
    render(<RahmenB />);
    await warte(10);
    fireEvent.click(screen.getByText('schliessen'));
    expect(screen.getByRole('dialog', { name: 'B' })).toBeInTheDocument();
    await warte(80);
    expect(screen.getByRole('dialog', { name: 'B' })).toBeInTheDocument();
    await warte(bMod.ZURUECK_FRIST_MS + 50);
  });
});
