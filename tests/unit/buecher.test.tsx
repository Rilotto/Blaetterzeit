import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buecherNochZuLesen } from '@/buecher/abschnittKonfiguration';
import { ladeBuecher } from '@/buecher/buchQuelle';
import { demoBuecher } from '@/buecher/demodaten';
import { filterKonfiguration, type FilterDefinition } from '@/buecher/filterKonfiguration';
import { neuesBuch, type Buch } from '@/domain/buch';
import BuecherAnsicht from '@/views/BuecherAnsicht';

afterEach(cleanup);

const buch = (titel: string, status: Buch['status'], cover?: string) => neuesBuch({ titel, status, cover });
const filterNamen = () =>
  within(screen.getByRole('group', { name: 'Filter' }))
    .getAllByRole('button')
    .map((b) => [b.textContent, b.getAttribute('aria-pressed')]);

describe('Filterkonfiguration', () => {
  it('enthält „Alle“, „Für dich“, „Gerade am Lesen“, „Noch zu lesen“, Standard „Für dich“, je mit Logik', () => {
    const sortiert = [...filterKonfiguration].sort((a, b) => a.reihenfolge - b.reihenfolge);
    expect(sortiert.map((f) => f.name)).toEqual(['Alle', 'Für dich', 'Gerade am Lesen', 'Noch zu lesen']);
    expect(sortiert.filter((f) => f.standard).map((f) => f.name)).toEqual(['Für dich']);
    for (const f of sortiert) expect(typeof f.logik).toBe('function');
  });
});

describe('Filterleiste', () => {
  it('sortiert nach reihenfolge und aktiviert den Standardfilter', () => {
    const filter: FilterDefinition[] = [
      { id: 'b', name: 'B', reihenfolge: 2, standard: true },
      { id: 'a', name: 'A', reihenfolge: 1 },
    ];
    render(<BuecherAnsicht filter={filter} buecher={[]} />);
    expect(filterNamen()).toEqual([
      ['A', 'false'],
      ['B', 'true'],
    ]);
  });

  it('Antippen aktiviert genau den Filter und löst seine Logik aus', () => {
    const logik = vi.fn((b: Buch[]) => b);
    const buecher = [buch('X', 'ungelesen')];
    render(
      <BuecherAnsicht
        filter={[
          { id: 'a', name: 'A', reihenfolge: 1, standard: true },
          { id: 'b', name: 'B', reihenfolge: 2, logik },
        ]}
        buecher={buecher}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'B' }));
    expect(filterNamen()).toEqual([
      ['A', 'false'],
      ['B', 'true'],
    ]);
    expect(logik).toHaveBeenCalledWith(buecher);
  });
});

describe('Abschnitt „Noch zu lesen“', () => {
  it('ordnet nur „ungelesen“ zu', () => {
    const alle = (['ungelesen', 'am_lesen', 'gelesen', 'abgebrochen', 'wunschliste'] as const).map((s) => buch(s, s));
    expect(buecherNochZuLesen(alle).map((b) => b.status)).toEqual(['ungelesen']);
  });

  it('zeigt Cover, Cover-Platzhalter und Titel; kein Leere-Liste-Platzhalter', () => {
    const { container } = render(
      <BuecherAnsicht buecher={[buch('Mit Cover', 'ungelesen', 'cover.png'), buch('Ohne Cover', 'ungelesen'), buch('Gelesen', 'gelesen')]} />,
    );
    const liste = screen.getByRole('list', { name: 'Noch zu lesen' });
    const eintraege = within(liste).getAllByRole('listitem');
    expect(eintraege).toHaveLength(2);
    expect(within(eintraege[0]).getByRole('img', { name: 'Mit Cover' }).getAttribute('src')).toBe('cover.png');
    expect(eintraege[1].querySelector('[data-cover-platzhalter] [data-icon="icon-herz.png"]')).not.toBeNull();
    expect([...liste.querySelectorAll('[data-buchtitel]')].map((t) => t.textContent)).toEqual(['Mit Cover', 'Ohne Cover']);
    expect(container.querySelector('[data-leere-liste]')).toBeNull();
  });

  it('zeigt bei leerer Zuordnung den Leere-Liste-Platzhalter statt der Liste', () => {
    const { container } = render(<BuecherAnsicht buecher={[buch('Gelesen', 'gelesen')]} />);
    expect(screen.queryByRole('list', { name: 'Noch zu lesen' })).toBeNull();
    const leer = container.querySelector('[data-leere-liste]')!;
    expect(leer.textContent).toBe('Wie wäre es mit einem neuen Buch?');
    expect(leer.querySelector('[data-icon="icon-herz.png"]')).not.toBeNull();
  });
});

describe('Seite „Bücher“', () => {
  it('Kopfbereich, Sagas und Sammlungen mit je einem Cover-Platzhalter', () => {
    render(<BuecherAnsicht buecher={[]} />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Deine Bücher');
    expect(screen.getByRole('button', { name: 'Filter und Einstellungen' }).querySelector('[data-icon="icon-regler.png"]')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Buch hinzufügen' }).querySelector('[data-icon="icon-plus.png"]')).not.toBeNull();
    for (const [name, text] of [
      ['Sagas', 'Deine nächste Saga wartet auf dich!'],
      ['Sammlungen', 'Wie wäre es mit einer neuen Sammlung?'],
    ]) {
      const abschnitt = screen.getByRole('region', { name });
      expect(abschnitt.querySelectorAll('[data-cover-platzhalter]')).toHaveLength(1);
      const texte = abschnitt.querySelectorAll<HTMLElement>('[data-platzhaltertext]');
      expect(texte).toHaveLength(1);
      expect(texte[0].textContent).toBe(text);
      expect(texte[0].style.color).toBe('var(--bz-farbe-primaer)');
      expect(abschnitt.textContent).toBe(name + text);
    }
  });

  it('lädt ohne Props die Demodaten über das Repository', async () => {
    expect(await ladeBuecher()).toEqual(demoBuecher);
    render(<BuecherAnsicht />);
    const erwartet = buecherNochZuLesen([...demoBuecher]).map((b) => b.titel);
    if (erwartet.length === 0) {
      expect(await screen.findByText('Wie wäre es mit einem neuen Buch?')).toBeTruthy();
    } else {
      const liste = await screen.findByRole('list', { name: 'Noch zu lesen' });
      expect([...liste.querySelectorAll('[data-buchtitel]')].map((t) => t.textContent)).toEqual(erwartet);
    }
  });
});
