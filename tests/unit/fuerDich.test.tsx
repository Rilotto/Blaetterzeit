import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ausgeblendeteLesen, buecherAbschnitte, sichtbareAbschnitte, type AbschnittDefinition } from '@/buecher/abschnitte';
import { FUER_DICH_HINWEIS_MS, MINDESTENS_EINER_HINWEIS } from '@/buecher/BlattFuerDich';
import { InMemoryEinstellungRepository } from '@/storage/InMemoryEinstellungRepository';
import BuecherAnsicht from '@/views/BuecherAnsicht';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const abschnittNamen = () =>
  Array.from(document.querySelectorAll<HTMLElement>('[data-seite="buecher"] > section')).map((s) => s.getAttribute('aria-label'));
const blatt = () => screen.queryByRole('dialog', { name: '„Für dich“ anpassen' });
const zeile = (name: string) => within(blatt()!).getByRole('checkbox', { name });
const oeffnen = () => fireEvent.click(screen.getByRole('button', { name: 'Filter und Einstellungen' }));

describe('Abschnitte „Für dich“ (REQ-114)', () => {
  it('zentrale Liste in Seitenreihenfolge', () => {
    expect(buecherAbschnitte.map((a) => a.titel)).toEqual(['Noch zu lesen', 'Sagas', 'Sammlungen', 'Alle Bücher']);
  });

  it('unbekannte IDs sichtbar; alle ausgeblendet gilt als alle sichtbar', () => {
    expect(sichtbareAbschnitte(buecherAbschnitte, ['sagas']).map((a) => a.id)).toEqual(['noch-zu-lesen', 'sammlungen', 'alle-buecher']);
    expect(sichtbareAbschnitte(buecherAbschnitte, buecherAbschnitte.map((a) => a.id))).toHaveLength(4);
  });

  it('beschädigte Auswahl gilt als keine', async () => {
    const repo = new InMemoryEinstellungRepository();
    await repo.speichern('fuerDichAusgeblendet', '{kaputt');
    expect(await ausgeblendeteLesen(repo)).toEqual([]);
  });

  it('Speichern blendet aus, Schließen ohne Speichern verwirft, Neustart wendet an', async () => {
    const repo = new InMemoryEinstellungRepository();
    render(<BuecherAnsicht buecher={[]} einstellungRepository={repo} />);
    expect(abschnittNamen()).toEqual(['Noch zu lesen', 'Sagas', 'Sammlungen', 'Alle Bücher']);
    await act(async () => {}); // Auswahl geladen
    oeffnen();
    expect(within(blatt()!).getAllByRole('checkbox').map((c) => [c.textContent, c.getAttribute('aria-checked')])).toEqual([
      ['Noch zu lesen', 'true'],
      ['Sagas', 'true'],
      ['Sammlungen', 'true'],
      ['Alle Bücher', 'true'],
    ]);
    fireEvent.click(zeile('Sagas'));
    expect(zeile('Sagas').getAttribute('aria-checked')).toBe('false');
    expect(abschnittNamen()).toContain('Sagas');
    fireEvent.click(within(blatt()!).getByRole('button', { name: 'Schließen' }));
    expect(blatt()).toBeNull();
    expect(abschnittNamen()).toContain('Sagas');
    expect(await repo.lesen('fuerDichAusgeblendet')).toBeUndefined();

    oeffnen();
    expect(zeile('Sagas').getAttribute('aria-checked')).toBe('true');
    fireEvent.click(zeile('Sagas'));
    fireEvent.click(zeile('Sammlungen'));
    fireEvent.click(within(blatt()!).getByRole('button', { name: 'Speichern' }));
    expect(blatt()).toBeNull();
    expect(abschnittNamen()).toEqual(['Noch zu lesen', 'Alle Bücher']);
    expect(JSON.parse((await repo.lesen('fuerDichAusgeblendet'))!)).toEqual(['sagas', 'sammlungen']);

    cleanup();
    render(<BuecherAnsicht buecher={[]} einstellungRepository={repo} />);
    await waitFor(() => expect(abschnittNamen()).toEqual(['Noch zu lesen', 'Alle Bücher']));
    oeffnen();
    expect(zeile('Sagas').getAttribute('aria-checked')).toBe('false');
  });

  it('letzter Haken bleibt gesetzt und zeigt kurz den Hinweis', () => {
    vi.useFakeTimers();
    render(<BuecherAnsicht buecher={[]} einstellungRepository={new InMemoryEinstellungRepository()} />);
    oeffnen();
    for (const n of ['Noch zu lesen', 'Sagas', 'Sammlungen']) fireEvent.click(zeile(n));
    fireEvent.click(zeile('Alle Bücher'));
    expect(zeile('Alle Bücher').getAttribute('aria-checked')).toBe('true');
    expect(within(blatt()!).getByRole('status').textContent).toBe(MINDESTENS_EINER_HINWEIS);
    act(() => vi.advanceTimersByTime(FUER_DICH_HINWEIS_MS));
    expect(within(blatt()!).queryByRole('status')).toBeNull();
  });

  it('neuer Abschnitt erscheint automatisch und sichtbar; Auswahl wirkt nur bei „Für dich“', async () => {
    const repo = new InMemoryEinstellungRepository();
    await repo.speichern('fuerDichAusgeblendet', '["sagas"]');
    const neu: AbschnittDefinition = { id: 'neu', titel: 'Neu', darstellen: () => <section aria-label="Neu" /> };
    render(<BuecherAnsicht buecher={[]} einstellungRepository={repo} abschnitte={[...buecherAbschnitte, neu]} />);
    await waitFor(() => expect(abschnittNamen()).toEqual(['Noch zu lesen', 'Sammlungen', 'Alle Bücher', 'Neu']));
    oeffnen();
    expect(zeile('Neu').getAttribute('aria-checked')).toBe('true');
    fireEvent.click(within(blatt()!).getByRole('button', { name: 'Schließen' }));
    fireEvent.click(within(screen.getByRole('group', { name: 'Filter' })).getByRole('button', { name: 'Noch zu lesen' }));
    expect(abschnittNamen()).toContain('Sagas');
  });

  it('Antippen des Ziehgriffs schließt nicht, Herunterziehen schließt ohne Speichern', async () => {
    const repo = new InMemoryEinstellungRepository();
    render(<BuecherAnsicht buecher={[]} einstellungRepository={repo} />);
    oeffnen();
    const griff = blatt()!.querySelector('[data-ziehgriff]')!;
    fireEvent.pointerDown(griff, { clientY: 100 });
    fireEvent.pointerUp(griff, { clientY: 100 });
    expect(blatt()).not.toBeNull();
    fireEvent.click(zeile('Sagas'));
    fireEvent.pointerDown(griff, { clientY: 100 });
    fireEvent.pointerMove(griff, { clientY: 400 });
    fireEvent.pointerUp(griff, { clientY: 400 });
    expect(blatt()).toBeNull();
    expect(abschnittNamen()).toContain('Sagas');
    expect(await repo.lesen('fuerDichAusgeblendet')).toBeUndefined();
  });

  it('Blatt vor dem Laden geöffnet: übernimmt die später geladene Auswahl, Speichern überschreibt nichts vorzeitig (B1)', async () => {
    const repo = new InMemoryEinstellungRepository();
    await repo.speichern('fuerDichAusgeblendet', '["sagas"]');
    let freigeben = () => {};
    const sperre = new Promise<void>((r) => (freigeben = r));
    const verzoegert = { lesen: async (k: Parameters<typeof repo.lesen>[0]) => (await sperre, repo.lesen(k)), speichern: repo.speichern.bind(repo) };
    render(<BuecherAnsicht buecher={[]} einstellungRepository={verzoegert} />);
    oeffnen();
    expect(zeile('Sagas').getAttribute('aria-checked')).toBe('true');
    fireEvent.click(within(blatt()!).getByRole('button', { name: 'Speichern' }));
    expect(blatt()).not.toBeNull();
    expect(await repo.lesen('fuerDichAusgeblendet')).toBe('["sagas"]');
    await act(async () => freigeben());
    await waitFor(() => expect(zeile('Sagas').getAttribute('aria-checked')).toBe('false'));
    fireEvent.click(within(blatt()!).getByRole('button', { name: 'Speichern' }));
    expect(blatt()).toBeNull();
    expect(await repo.lesen('fuerDichAusgeblendet')).toBe('["sagas"]');
    expect(abschnittNamen()).toEqual(['Noch zu lesen', 'Sammlungen', 'Alle Bücher']);
  });
});
