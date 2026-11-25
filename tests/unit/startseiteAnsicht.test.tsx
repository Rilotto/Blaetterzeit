import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Buch } from '@/domain/buch';
import type { Zitat } from '@/domain/zitat';
import StartAnsicht from '@/start/StartAnsicht';
import { InMemoryEinstellungRepository, InMemoryListenRepository, InMemoryProfilRepository, InMemoryZitatRepository, type ImageStore } from '@/storage';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { TAKT_MS } from '@/plattform/uhr';
import ProfilAnsicht from '@/views/ProfilAnsicht';

vi.mock('@/buecher/demodaten', () => ({ demoBuecher: [] }));
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const bilder = { get: async () => undefined, put: async () => {}, remove: async () => {} } as unknown as ImageStore;
const buch = (f: Partial<Buch>): Buch => ({ id: crypto.randomUUID(), titel: 'T', status: 'ungelesen', ...f });
const warte = () => act(async () => void (await new Promise((r) => setTimeout(r, 20))));
async function tippe(el: Element) {
  await act(async () => {
    fireEvent.click(el);
    await new Promise((r) => setTimeout(r, 20));
  });
}
const q = <T extends Element = HTMLElement>(s: string) => document.querySelector<T>(s);

async function zeige(o: { buecher?: Buch[]; zitate?: Zitat[]; name?: string; jetzt?: () => Date; navigieren?: (id: string) => void } = {}) {
  const repo = new InMemoryBookRepository();
  for (const b of o.buecher ?? []) await repo.save(b);
  const zitate = new InMemoryZitatRepository();
  for (const z of o.zitate ?? []) await zitate.speichern(z);
  const profil = new InMemoryProfilRepository();
  if (o.name) await profil.nameSpeichern(o.name);
  const einstellungen = new InMemoryEinstellungRepository();
  render(
    <StartAnsicht
      repository={repo}
      bildspeicher={bilder}
      bildquelle={{ scannen: async () => null, galerie: async () => null }}
      listenRepository={new InMemoryListenRepository()}
      zitatRepository={zitate}
      profilRepository={profil}
      einstellungRepository={einstellungen}
      jetzt={o.jetzt ?? (() => new Date(2026, 10, 24, 14, 5))}
      navigieren={o.navigieren}
    />,
  );
  await warte();
  return { repo, zitate, profil, einstellungen };
}

describe('Startseite (REQ-101 bis REQ-104, REQ-106)', () => {
  it('Kopf: Datum, Uhrzeit, Gruß mit Namen, Icon in Primär; Reihenfolge der Bereiche', async () => {
    await zeige({ name: 'Christine', jetzt: () => new Date(2026, 10, 23, 7, 30) });
    expect(q('[data-start-datum]')!.textContent).toBe('Montag, 23. November · 07:30');
    expect(q('[data-start-gruss]')!.textContent).toBe('Guten Morgen, Christine');
    const icon = q('[data-tageszeit-icon]')!;
    expect(icon.getAttribute('data-tageszeit-icon')).toBe('sonnenaufgang');
    expect((icon as unknown as SVGElement).style.stroke).toBe('var(--bz-farbe-primaer)');
    const reihe = [...document.querySelectorAll('[data-start-abschnitt]')].map((e) => e.getAttribute('data-start-abschnitt'));
    expect(reihe).toEqual(['lesen', 'woche', 'jahresziel']);
    expect(document.body.textContent).not.toContain('under construction');
  });

  it('aktualisiert Uhrzeit und Gruß im Minutentakt', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    let zeit = new Date(2026, 10, 24, 16, 59);
    await zeige({ jetzt: () => zeit });
    expect(q('[data-start-gruss]')!.textContent).toBe('Hallo');
    zeit = new Date(2026, 10, 24, 17, 0);
    await act(async () => void vi.advanceTimersByTime(TAKT_MS));
    expect(q('[data-start-uhrzeit]')!.textContent).toBe('17:00');
    expect(q('[data-start-gruss]')!.textContent).toBe('Guten Abend');
    expect(q('[data-tageszeit-icon]')!.getAttribute('data-tageszeit-icon')).toBe('sonnenuntergang');
  });

  it('ohne Buch am lesen der Hinweis, ohne Zitat keine Kachel, ohne Ziel „Jahresziel festlegen“', async () => {
    await zeige({ buecher: [buch({ titel: 'Onyx Storm' })] });
    expect(q('[data-start-leer]')!.textContent).toBe('Gerade kein Buch offen');
    expect(q('[data-start-lesekarte]')).toBeNull();
    expect(q('[data-start-zitat]')).toBeNull();
    expect(q('[data-start-jahresziel]')!.textContent).toBe('Jahresziel festlegen');
  });

  it('Fortschritt direkt eintragen: Startseite bleibt, Karte zeigt 60 / 400, Sitzung kommt hinzu', async () => {
    const fw = buch({ titel: 'Fourth Wing', autor: 'Rebecca Yarros', status: 'am_lesen', seitenanzahl: 400, aktuelleSeite: 42 });
    const { repo } = await zeige({ buecher: [fw, buch({ titel: 'Iron Flame', status: 'am_lesen' })] });
    const karten = [...document.querySelectorAll('[data-start-lesekarte]')];
    expect(karten.map((k) => k.querySelector('[data-buchtitel]')!.textContent)).toEqual(['Fourth Wing', 'Iron Flame']);
    expect(karten[1].querySelector('[data-fortschritt-herz]')).not.toBeNull();
    await tippe(karten[0].querySelector('[role="progressbar"]')!);
    const feld = screen.getByRole('dialog', { name: 'Aktuelle Seite' }).querySelector('input')!;
    await act(async () => void fireEvent.change(feld, { target: { value: '60' } }));
    await tippe(screen.getByRole('button', { name: 'Sichern' }));
    await warte();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(q('[data-startseite]')).not.toBeNull();
    expect(karten[0].querySelector('[data-fortschritt-text]')!.textContent).toBe('60 / 400');
    const gespeichert = await repo.get(fw.id);
    expect(gespeichert?.aktuelleSeite).toBe(60);
    expect(gespeichert?.sitzungen).toHaveLength(1);
  });

  it('Herz ohne Seitenanzahl öffnet „Buchlänge“; Karte antippen öffnet die Buchdetails', async () => {
    const b = buch({ titel: 'Ohne Seiten', status: 'am_lesen' });
    await zeige({ buecher: [b] });
    await tippe(q('[data-fortschritt-herz]')!);
    expect(screen.getByRole('dialog', { name: 'Buchlänge' })).toBeInTheDocument();
    await tippe(screen.getByRole('button', { name: 'Schließen' }));
    await tippe(q('[data-start-lesekarte] [data-buchtitel]')!);
    await warte();
    expect(screen.getByRole('region', { name: 'Buchdetails' })).toBeInTheDocument();
    expect(q('[data-reiter="rezension"]')!.getAttribute('data-aktiv')).toBe('true');
  });

  it('„Diese Woche“: Cover-Kalender, Strähne, Antippen merkt „Wöchentlich“ und öffnet die Statistik', async () => {
    const navigieren = vi.fn();
    const heute = new Date(2026, 10, 25, 12);
    const fw = buch({ titel: 'FW', sitzungen: [{ zeitpunkt: new Date(2026, 10, 23, 20).toISOString() }, { zeitpunkt: new Date(2026, 10, 24, 20).toISOString() }, { zeitpunkt: new Date(2026, 10, 25, 8).toISOString() }] });
    const { einstellungen } = await zeige({ buecher: [fw], jetzt: () => heute, navigieren });
    const tage = [...document.querySelectorAll('[data-start-woche] [data-kalender-tag]')].map((t) => t.getAttribute('data-tag'));
    expect(tage).toEqual(['23', '24', '25', '26', '27', '28', '29']);
    expect(q('[data-start-woche] [data-heute="true"]')!.getAttribute('data-tag')).toBe('25');
    expect(q('[data-start-straehne]')!.getAttribute('data-start-straehne')).toBe('3');
    await einstellungen.speichern('statistikZeitraum', 'jahr');
    await tippe(q('[data-start-woche]')!);
    expect(await einstellungen.lesen('statistikZeitraum')).toBe('woche');
    expect(navigieren).toHaveBeenCalledWith('statistik');
  });

  it('Jahresziel: festlegen, ungültig, leeren, verwerfen; neues Jahr ohne Ziel', async () => {
    const { profil } = await zeige({ buecher: [buch({ status: 'gelesen', beendetAm: '2026-03-01' }), buch({ status: 'gelesen', beendetAm: '2025-03-01' })] });
    await tippe(q('[data-start-jahresziel]')!);
    const feld = () => q<HTMLInputElement>('[data-blatt-feld="jahresziel"]')!;
    await act(async () => void fireEvent.change(feld(), { target: { value: '20' } }));
    await tippe(q('[data-blatt-sichern="jahresziel"]')!);
    expect(q('[data-start-jahresziel]')!.textContent).toBe('1 von 20 Büchern 2026');
    expect(await profil.jahreszielLesen(2026)).toBe(20);
    await tippe(q('[data-start-jahresziel]')!);
    expect(feld().value).toBe('20');
    await act(async () => void fireEvent.change(feld(), { target: { value: '0' } }));
    await tippe(q('[data-blatt-sichern="jahresziel"]')!);
    expect(feld().getAttribute('data-fehler')).toBe('true');
    expect(await profil.jahreszielLesen(2026)).toBe(20);
    await tippe(screen.getByRole('button', { name: 'Schließen' }));
    expect(await profil.jahreszielLesen(2026)).toBe(20);
    await tippe(q('[data-start-jahresziel]')!);
    await act(async () => void fireEvent.change(feld(), { target: { value: '' } }));
    await tippe(q('[data-blatt-sichern="jahresziel"]')!);
    expect(q('[data-start-jahresziel]')!.textContent).toBe('Jahresziel festlegen');
    expect(await profil.jahreszielLesen(2026)).toBeUndefined();
    cleanup();
    const p2 = new InMemoryProfilRepository();
    await p2.jahreszielSpeichern(2026, 20);
    render(<StartAnsicht repository={new InMemoryBookRepository()} bildspeicher={bilder} zitatRepository={new InMemoryZitatRepository()} profilRepository={p2} jetzt={() => new Date(2027, 0, 1, 9)} />);
    await warte();
    expect(q('[data-start-jahresziel]')!.textContent).toBe('Jahresziel festlegen');
  });

  it('Zitat des Tages: Text, Buch, Seite; Antippen öffnet die Buchdetails im Reiter „Notizbuch“', async () => {
    const fw = buch({ titel: 'Fourth Wing' });
    const z: Zitat = { id: crypto.randomUUID(), buchId: fw.id, text: 'Ich bin nicht das Feuer.', seite: 312, angelegtAm: '2026-11-01T10:00:00.000Z' };
    await zeige({ buecher: [fw], zitate: [z] });
    const kachel = q(`[data-start-zitat="${z.id}"]`)!;
    expect(kachel.querySelector('[data-zitat-text]')!.textContent).toBe('Ich bin nicht das Feuer.');
    expect(kachel.querySelector('[data-zitat-buch]')!.textContent).toBe('Fourth Wing');
    expect(kachel.querySelector('[data-zitat-seite]')!.textContent).toBe('S. 312');
    await tippe(kachel);
    await warte();
    expect(q('[data-reiter="notizbuch"]')!.getAttribute('data-aktiv')).toBe('true');
    expect(q('[data-reiter-bereich="notizbuch"] [data-zitat]')).not.toBeNull();
  });
});

describe('Profil › Du › Name (REQ-107)', () => {
  it('Zeile ohne Namen leer; sichern, leeren, verwerfen', async () => {
    const profil = new InMemoryProfilRepository();
    render(<ProfilAnsicht profilRepository={profil} />);
    await warte();
    const anzeige = () => q('[data-profil-name-zeile] [data-name-anzeige]')!.textContent;
    expect(anzeige()).toBe('›');
    await tippe(q('[data-profil-name-zeile]')!);
    await act(async () => void fireEvent.change(q('[data-blatt-feld="name"]')!, { target: { value: '  Christine ' } }));
    await tippe(q('[data-blatt-sichern="name"]')!);
    expect(anzeige()).toBe('Christine›');
    expect(await profil.nameLesen()).toBe('Christine');
    await tippe(q('[data-profil-name-zeile]')!);
    await act(async () => void fireEvent.change(q('[data-blatt-feld="name"]')!, { target: { value: 'Anders' } }));
    await tippe(screen.getByRole('button', { name: 'Schließen' }));
    expect(await profil.nameLesen()).toBe('Christine');
    await tippe(q('[data-profil-name-zeile]')!);
    await act(async () => void fireEvent.change(q('[data-blatt-feld="name"]')!, { target: { value: '   ' } }));
    await tippe(q('[data-blatt-sichern="name"]')!);
    expect(await profil.nameLesen()).toBeUndefined();
    expect(anzeige()).toBe('›');
  });
});
