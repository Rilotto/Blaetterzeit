import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Bildquelle } from '@/bild/bildquelle';
import type { Buch } from '@/domain/buch';
import { auswahlAenderungen, buecherInListe, neueListe, type Zugehoerigkeit } from '@/domain/listen';
import ListenNavigation from '@/listen/ListenNavigation';
import { LISTENBILD_BEREICH, LISTENBILD_VERHAELTNIS, listenbildImBlatt, listenbildUebernehmen } from '@/listen/listenbild';
import { InMemoryAnsichtRepository } from '@/storage/InMemoryAnsichtRepository';
import { InMemoryBookRepository } from '@/storage/InMemoryBookRepository';
import { InMemoryImageStore } from '@/storage/InMemoryImageStore';
import { InMemoryListenRepository } from '@/storage/InMemoryListenRepository';
import BuecherAnsicht from '@/views/BuecherAnsicht';

afterEach(cleanup);

const b = (titel: string, extra: Partial<Buch> = {}): Buch => ({ id: crypto.randomUUID(), titel, status: 'ungelesen', ...extra });
const warte = () =>
  act(async () => {
    await new Promise((r) => setTimeout(r, 10));
  });
const tippe = async (el: Element | null) => {
  expect(el).not.toBeNull();
  fireEvent.click(el!);
  await warte();
};
const q = <T extends Element = HTMLElement>(sel: string) => document.querySelector<T>(sel);
const BILD = 'data:image/png;base64,QUJD';

describe('auswahlAenderungen (REQ-098)', () => {
  const saga = neueListe('saga', 'The Empyrean');
  const fw = b('Fourth Wing');
  const iron = b('Iron Flame', { bandnummer: 2 });
  const onyx = b('Onyx Storm');
  const zug: Zugehoerigkeit[] = [{ listeId: saga.id, buchId: fw.id }];

  it('vormarkiert sind die enthaltenen Bücher', () => {
    expect([...buecherInListe(zug, saga.id)]).toEqual([fw.id]);
  });

  it('neu markierte Bücher werden aufgenommen (Band bleibt beim Buch, REQ-112); entmarkierte herausgenommen', () => {
    const r = auswahlAenderungen(saga, zug, new Set([iron.id, onyx.id]), [fw, iron, onyx]);
    expect(r.aufnehmen).toEqual([
      { listeId: saga.id, buchId: iron.id },
      { listeId: saga.id, buchId: onyx.id },
    ]);
    expect(r.herausnehmen).toEqual([fw.id]);
  });

  it('enthaltene Bücher bleiben unverändert (Band bleibt), in Sammlungen kein Band', () => {
    const samm = neueListe('sammlung', 'Lieblinge');
    expect(auswahlAenderungen(saga, zug, new Set([fw.id]), [fw, iron])).toEqual({ aufnehmen: [], herausnehmen: [] });
    expect(auswahlAenderungen(samm, [], new Set([iron.id]), [iron]).aufnehmen).toEqual([{ listeId: samm.id, buchId: iron.id }]);
  });
});

describe('Listenbild-Hilfen (REQ-100)', () => {
  it('Entwurf: undefined = gespeichert, null = entfernt, Text = neu; Cover-Format 2:3', () => {
    expect(listenbildImBlatt('a', undefined)).toBe('a');
    expect(listenbildImBlatt('a', null)).toBeUndefined();
    expect(listenbildImBlatt(undefined, 'b')).toBe('b');
    expect(LISTENBILD_VERHAELTNIS).toBeCloseTo(2 / 3);
  });

  it('listenbildUebernehmen speichert, entfernt bzw. lässt unverändert', async () => {
    const s = new InMemoryImageStore();
    await listenbildUebernehmen(s, 'l1', BILD);
    expect(await s.get('l1', LISTENBILD_BEREICH)).toBe(BILD);
    await listenbildUebernehmen(s, 'l1', undefined);
    expect(await s.get('l1', LISTENBILD_BEREICH)).toBe(BILD);
    await listenbildUebernehmen(s, 'l1', null);
    expect(await s.get('l1', LISTENBILD_BEREICH)).toBeUndefined();
  });
});

async function aufbau(art: 'saga' | 'sammlung' = 'saga') {
  const fw = b('Fourth Wing');
  const iron = b('Iron Flame', { bandnummer: 2 });
  const onyx = b('Onyx Storm');
  const repo = new InMemoryBookRepository();
  for (const x of [onyx, fw, iron]) await repo.save(x);
  const listen = new InMemoryListenRepository();
  const l = neueListe(art, 'The Empyrean');
  await listen.listeSpeichern(l);
  await listen.zuordnen({ listeId: l.id, buchId: fw.id });
  const speicher = new InMemoryImageStore();
  const galerie = vi.fn(async () => BILD);
  const quelle: Bildquelle = { scannen: async () => null, galerie };
  const anzeigen = () =>
    render(
      <ListenNavigation
        start={{ art: 'liste', listeId: l.id }}
        repository={repo}
        listenRepository={listen}
        bildspeicher={speicher}
        bildquelle={quelle}
        ansichtRepository={new InMemoryAnsichtRepository()}
      />,
    );
  anzeigen();
  await warte();
  return { fw, iron, onyx, repo, listen, l, speicher, galerie, anzeigen };
}

const auswahl = (id: string) => q(`[data-buch-auswahl="${id}"]`);

describe('Blatt „Bücher auswählen“ (REQ-098, AK-6 bis AK-9)', () => {
  it('Plus zeigt alle Bücher A–Z, enthaltene markiert; legt nichts an', async () => {
    const { fw, listen } = await aufbau();
    await tippe(q('[data-liste-neu]'));
    const titel = [...document.querySelectorAll('[data-buch-auswahl-titel]')].map((e) => e.textContent);
    expect(titel).toEqual(['Fourth Wing', 'Iron Flame', 'Onyx Storm']);
    expect(auswahl(fw.id)).toHaveAttribute('aria-checked', 'true');
    expect((await listen.listen()).length).toBe(1);
  });

  it('Markieren/Entmarkieren und „Sichern“ übernimmt; Band bleibt beim Buch (REQ-112)', async () => {
    const { fw, iron, onyx, listen, l } = await aufbau();
    await tippe(q('[data-liste-neu]'));
    await tippe(auswahl(iron.id));
    await tippe(auswahl(onyx.id));
    await tippe(auswahl(onyx.id));
    await tippe(auswahl(fw.id));
    expect(auswahl(iron.id)).toHaveAttribute('data-markiert', 'true');
    expect(auswahl(onyx.id)).toHaveAttribute('data-markiert', 'false');
    await tippe(q('[data-blatt-sichern="buecher-waehlen"]'));
    const zug = (await listen.zugehoerigkeiten()).filter((z) => z.listeId === l.id);
    expect(zug).toEqual([{ listeId: l.id, buchId: iron.id }]);
    expect(q('[data-blatt-buecher-waehlen]')).toBeNull();
    expect(screen.getByText('1 Buch')).toBeInTheDocument();
  });

  it('Schließen ohne „Sichern“ verwirft', async () => {
    const { fw, iron, listen } = await aufbau('sammlung');
    await tippe(q('[data-liste-neu]'));
    await tippe(auswahl(iron.id));
    await tippe(screen.getByRole('button', { name: 'Schließen' }));
    expect((await listen.zugehoerigkeiten()).map((z) => z.buchId)).toEqual([fw.id]);
  });
});

describe('Listenbild im Blatt „Liste bearbeiten“ (REQ-100)', () => {
  const bildHinzufuegen = async () => {
    await tippe(q('[data-liste-stift]'));
    expect(q('[data-listenbild-feld]')).toHaveTextContent('Bild hinzufügen');
    await tippe(q('[data-listenbild-feld]'));
    const menue = screen.getByRole('menu', { name: 'Listenbild' });
    expect(within(menue).queryByText('Cover online suchen')).toBeNull();
    await tippe(within(menue).getByRole('menuitem', { name: 'Aus Galerie auswählen' }));
    const z = await screen.findByRole('region', { name: 'Zuschnitt' });
    await tippe(within(z).getByRole('button', { name: 'Bestätigen' }));
    expect(q('[data-listenbild-vorschau]')).not.toBeNull();
  };

  it('hinzufügen, Name bleibt über den Zuschnitt erhalten, „Sichern“ speichert Name und Bild', async () => {
    const { speicher, l, listen } = await aufbau();
    await tippe(q('[data-liste-stift]'));
    fireEvent.change(q('[data-blatt-feld="liste-umbenennen"]')!, { target: { value: 'Empyrean' } });
    await tippe(screen.getByRole('button', { name: 'Schließen' }));
    // Schließen verwirft: neuer Anlauf.
    await bildHinzufuegen();
    fireEvent.change(q('[data-blatt-feld="liste-umbenennen"]')!, { target: { value: 'Empyrean' } });
    await tippe(q('[data-listenbild-feld]'));
    await tippe(screen.getByRole('menuitem', { name: 'Ersetzen' }));
    await tippe(screen.getByRole('menuitem', { name: 'Aus Galerie auswählen' }));
    await tippe(within(await screen.findByRole('region', { name: 'Zuschnitt' })).getByRole('button', { name: 'Bestätigen' }));
    expect(q<HTMLInputElement>('[data-blatt-feld="liste-umbenennen"]')!.value).toBe('Empyrean');
    await tippe(q('[data-blatt-sichern="liste-umbenennen"]'));
    expect(await speicher.get(l.id, LISTENBILD_BEREICH)).toBe(BILD);
    expect((await listen.listen())[0].name).toBe('Empyrean');
    expect(q(`[data-listenbild="${l.id}"]`)).not.toBeNull();
  });

  it('Schließen ohne Sichern verwirft das Bild; Entfernen + Sichern löscht es; Liste löschen löscht es mit', async () => {
    const { speicher, l } = await aufbau();
    await bildHinzufuegen();
    await tippe(screen.getByRole('button', { name: 'Schließen' }));
    expect(await speicher.get(l.id, LISTENBILD_BEREICH)).toBeUndefined();
    expect(q(`[data-listenbild="${l.id}"]`)).toBeNull();

    cleanup();
    const nochmal = await aufbau();
    await nochmal.speicher.put(nochmal.l.id, LISTENBILD_BEREICH, BILD);
    cleanup();
    nochmal.anzeigen();
    await warte();
    expect(q(`[data-listenbild="${nochmal.l.id}"]`)).not.toBeNull();
    await tippe(q('[data-liste-stift]'));
    await tippe(q('[data-listenbild-feld]'));
    await tippe(screen.getByRole('menuitem', { name: 'Entfernen' }));
    expect(q('[data-listenbild-feld]')).toHaveTextContent('Bild hinzufügen');
    await tippe(q('[data-blatt-sichern="liste-umbenennen"]'));
    expect(await nochmal.speicher.get(nochmal.l.id, LISTENBILD_BEREICH)).toBeUndefined();

    await nochmal.speicher.put(nochmal.l.id, LISTENBILD_BEREICH, BILD);
    await tippe(q('[data-liste-stift]'));
    await tippe(q('[data-liste-loeschen]'));
    await tippe(q('[data-loeschen-bestaetigen]'));
    expect(await nochmal.speicher.get(nochmal.l.id, LISTENBILD_BEREICH)).toBeUndefined();
  });
});

describe('Listenbild in Listenübersicht und auf der Seite „Bücher“ (REQ-100)', () => {
  it('Übersicht: Bild bzw. Platzhalter; Seite „Bücher“: Bild statt Cover-Platzhalter', async () => {
    const listen = new InMemoryListenRepository();
    const mit = neueListe('saga', 'The Empyrean');
    const ohne = neueListe('saga', 'Crescent City');
    await listen.listeSpeichern(mit);
    await listen.listeSpeichern(ohne);
    const speicher = new InMemoryImageStore();
    await speicher.put(mit.id, LISTENBILD_BEREICH, BILD);
    render(
      <ListenNavigation
        start={{ art: 'uebersicht', listenArt: 'saga' }}
        repository={new InMemoryBookRepository()}
        listenRepository={listen}
        bildspeicher={speicher}
        ansichtRepository={new InMemoryAnsichtRepository()}
      />,
    );
    await warte();
    expect(q(`[data-liste-zeile="${mit.id}"] [data-listenbild="${mit.id}"]`)).not.toBeNull();
    expect(q(`[data-liste-zeile="${ohne.id}"] [data-listenbild-platzhalter="${ohne.id}"]`)).not.toBeNull();
    cleanup();

    render(
      <BuecherAnsicht
        repository={new InMemoryBookRepository()}
        listenRepository={listen}
        bildspeicher={speicher}
        ansichtRepository={new InMemoryAnsichtRepository()}
      />,
    );
    await warte();
    expect(q(`[data-listeneintrag="${mit.id}"] img[data-listenbild="${mit.id}"]`)).not.toBeNull();
    expect(q(`[data-listeneintrag="${ohne.id}"] [data-cover-platzhalter]`)).not.toBeNull();
  });
});
