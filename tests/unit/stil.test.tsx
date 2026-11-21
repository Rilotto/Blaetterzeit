import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from '@/App';
import { InMemoryEinstellungRepository } from '@/storage';
import { feuilletonMasse, istStilId, standardStil, stile, stilRegeln, stilReihenfolge } from '@/theme';

afterEach(() => {
  cleanup();
  delete document.documentElement.dataset.stil;
});

const profilOeffnen = () => fireEvent.click(screen.getByRole('button', { name: /Profil/ }));
const designOeffnen = () => fireEvent.click(document.querySelector('[data-profil-zeile="design"]') as HTMLElement);
const stilReiter = () => fireEvent.click(document.querySelector('[data-design-reiter="stil"]') as HTMLElement);

describe('Stil-Definition (REQ-071)', () => {
  it('genau Klassisch und Feuilleton, Standard Klassisch', () => {
    expect(stilReihenfolge.map((id) => stile[id].name)).toEqual(['Klassisch', 'Feuilleton']);
    expect(stile.klassisch.satz).toBe('Karten, Pillen, weiche Schatten');
    expect(stile.feuilleton.satz).toBe('Linien statt Karten, wie gedruckt');
    expect(standardStil).toBe('klassisch');
    expect(istStilId('feuilleton')).toBe(true);
    expect(istStilId('format')).toBe(false);
  });

  it('Regeln nur für Feuilleton, an data-stil bzw. data-stil-skizze gebunden', () => {
    const css = stilRegeln();
    expect(css).not.toContain('[data-stil="klassisch"]');
    expect(css).toContain('[data-stil="feuilleton"] [data-stil-rolle~="karte"]');
    expect(css).toContain('[data-stil-skizze="feuilleton"] [data-skizze-rolle~="cover"]');
    expect(css).toContain(`height: ${feuilletonMasse.balken}px !important`);
  });
});

describe('Pille „Stil“ im Fenster Design (REQ-071)', () => {
  it('drei Pillen, Liste mit Skizze, Satz und Haken; Wechsel wirkt sofort und wird gespeichert', async () => {
    const repo = new InMemoryEinstellungRepository();
    const { container } = render(<App einstellungRepository={repo} />);
    profilOeffnen();
    designOeffnen();
    const pillen = [...container.querySelectorAll('[data-design-reiter]')].map((p) => p.textContent);
    expect(pillen).toEqual(['Farben', 'Schriftart', 'Stil']);
    stilReiter();
    const liste = container.querySelector('[data-design-liste="stil"]') as HTMLElement;
    const zeilen = liste.querySelectorAll('[data-stil-zeile]');
    expect([...zeilen].map((z) => z.getAttribute('data-stil-zeile'))).toEqual(['klassisch', 'feuilleton']);
    expect(zeilen[0].querySelector('[data-stil-skizze="klassisch"] [data-skizze-cover]')).not.toBeNull();
    expect(zeilen[1].querySelector('[data-stil-skizze="feuilleton"] [data-skizze-balken]')).not.toBeNull();
    expect((zeilen[1].querySelector('[data-stil-satz]') as HTMLElement).style.fontStyle).toBe('italic');
    expect(zeilen[0].querySelector('[data-haken]')).not.toBeNull();
    expect(zeilen[1].querySelector('[data-kreis]')).not.toBeNull();

    const wurzel = container.querySelector('[data-app-wurzel]') as HTMLElement;
    expect(wurzel.dataset.stil).toBe('klassisch');
    fireEvent.click(zeilen[1]);
    expect(wurzel.dataset.stil).toBe('feuilleton');
    await waitFor(() => expect(document.documentElement.dataset.stil).toBe('feuilleton'));
    expect(within(liste).getByRole('radio', { name: /Feuilleton/ }).getAttribute('aria-checked')).toBe('true');
    await waitFor(async () => expect(await repo.lesen('stil')).toBe('feuilleton'));
  });

  it('Feuilleton wirkt über zentrale Regeln: Karte ohne Fläche, Balken dünn, Unterstrich am aktiven Reiter', async () => {
    const repo = new InMemoryEinstellungRepository();
    await repo.speichern('stil', 'feuilleton');
    const { container } = render(<App einstellungRepository={repo} />);
    await waitFor(() => expect((container.querySelector('[data-app-wurzel]') as HTMLElement).dataset.stil).toBe('feuilleton'));
    profilOeffnen();
    const karte = container.querySelector('[data-profil-karte]') as HTMLElement;
    expect(getComputedStyle(karte).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(getComputedStyle(karte).borderRadius).toBe('0px');
    designOeffnen();
    const aktiv = container.querySelector('[data-design-reiter="farben"]') as HTMLElement;
    expect(getComputedStyle(aktiv).borderBottomWidth).toBe(`${feuilletonMasse.unterstrich}px`);
    expect(getComputedStyle(container.querySelector('[data-design-umschalter-pille]') as HTMLElement).display).toBe('none');
    stilReiter();
    // Skizze „Klassisch“ bleibt Klassisch, Skizze „Feuilleton“ wird umgeformt.
    const coverK = container.querySelector('[data-stil-skizze="klassisch"] [data-skizze-cover]') as HTMLElement;
    const balkenF = container.querySelector('[data-stil-skizze="feuilleton"] [data-skizze-balken]') as HTMLElement;
    expect(getComputedStyle(coverK).borderRadius).toBe('2px');
    expect(getComputedStyle(balkenF).height).toBe(`${feuilletonMasse.balken}px`);
  });

  it('Profilzeile zeigt Farbdesign · Schrift · Stil', async () => {
    const repo = new InMemoryEinstellungRepository();
    await repo.speichern('farbdesign', 'salbei');
    await repo.speichern('schrift', 'fraunces');
    await repo.speichern('stil', 'feuilleton');
    const { container } = render(<App einstellungRepository={repo} />);
    profilOeffnen();
    await waitFor(() =>
      expect((container.querySelector('[data-design-anzeige]') as HTMLElement).textContent).toContain('Salbei · Fraunces · Feuilleton'),
    );
  });
});
