import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import type { EinstellungRepository } from '@/storage';
import {
  farbVariablenAnwenden,
  istFarbdesignId,
  istSchriftId,
  istStilId,
  schriftVariable,
  schriftVariablen,
  standardFarbdesign,
  standardSchrift,
  standardStil,
  stilRegeln,
  typografieVariablen,
  type FarbdesignId,
  type SchriftId,
  type StilId,
} from '@/theme';

/** Bindet das Stylesheet der Stile (REQ-071) einmal als <style data-stil-regeln> in <head> ein. */
function stilRegelnEinbinden(): void {
  if (document.head.querySelector('style[data-stil-regeln]')) return;
  const el = document.createElement('style');
  el.setAttribute('data-stil-regeln', '');
  el.textContent = stilRegeln();
  document.head.appendChild(el);
}

/** Aktuelle Wahl von Farbdesign (REQ-068), Schrift (REQ-069) und Stil (REQ-071). */
export interface Designwahl {
  farbdesign: FarbdesignId;
  schrift: SchriftId;
  stil: StilId;
}

interface DesignKontext extends Designwahl {
  /** Speicher der App-Einstellungen, auch für andere gemerkte Wahlen (z. B. Zeitraum der Statistik, REQ-079). */
  einstellungRepository?: EinstellungRepository;
  farbdesignWaehlen: (id: FarbdesignId) => void;
  schriftWaehlen: (id: SchriftId) => void;
  stilWaehlen: (id: StilId) => void;
}

const standardWahl: Designwahl = { farbdesign: standardFarbdesign, schrift: standardSchrift, stil: standardStil };

const Kontext = createContext<DesignKontext>({
  ...standardWahl,
  farbdesignWaehlen: () => {},
  schriftWaehlen: () => {},
  stilWaehlen: () => {},
});

/** Zugriff auf die aktuelle Designwahl und die Wahlfunktionen. */
export const useDesign = (): DesignKontext => useContext(Kontext);

/**
 * Hält die Designwahl, lädt sie beim Start aus dem EinstellungRepository und speichert jede Änderung
 * dauerhaft (REQ-068 AK-4, REQ-069 AK-4, REQ-071 AK-5). Ungültige gespeicherte Werte gelten als „nicht gewählt“.
 * Zusätzlich setzt er Farb-, Schrift- und Typografie-Variablen an <html>, damit auch html/body
 * (Hintergrund) und Bereiche außerhalb der App-Wurzel sofort dem Design folgen (REQ-068 AK-3).
 */
export function DesignAnbieter({ repository, children }: { repository: EinstellungRepository; children: ReactNode }) {
  const [wahl, setWahl] = useState<Designwahl>(standardWahl);

  useEffect(() => {
    let aktiv = true;
    void Promise.all([repository.lesen('farbdesign'), repository.lesen('schrift'), repository.lesen('stil')])
      .then(([farbdesign, schrift, stil]) => {
        if (!aktiv) return;
        setWahl((w) => ({
          farbdesign: istFarbdesignId(farbdesign) ? farbdesign : w.farbdesign,
          schrift: istSchriftId(schrift) ? schrift : w.schrift,
          stil: istStilId(stil) ? stil : w.stil,
        }));
      })
      .catch((fehler: unknown) => console.warn('Designwahl nicht lesbar:', fehler));
    return () => {
      aktiv = false;
    };
  }, [repository]);

  // Regeln aller Stile einmal in <head>; sie greifen nur unter [data-stil="…"] bzw. [data-stil-skizze="…"] (REQ-071).
  useLayoutEffect(() => stilRegelnEinbinden(), []);

  useEffect(() => {
    const html = document.documentElement;
    farbVariablenAnwenden(html, wahl.farbdesign);
    html.style.setProperty(schriftVariable, schriftVariablen(wahl.schrift)[schriftVariable]);
    for (const [name, wert] of Object.entries(typografieVariablen())) html.style.setProperty(name, wert);
    html.dataset.farbdesign = wahl.farbdesign;
    html.dataset.schrift = wahl.schrift;
    html.dataset.stil = wahl.stil;
  }, [wahl]);

  const farbdesignWaehlen = useCallback(
    (id: FarbdesignId) => {
      setWahl((w) => ({ ...w, farbdesign: id }));
      void repository.speichern('farbdesign', id).catch((f: unknown) => console.warn('Farbdesign nicht gespeichert:', f));
    },
    [repository],
  );
  const schriftWaehlen = useCallback(
    (id: SchriftId) => {
      setWahl((w) => ({ ...w, schrift: id }));
      void repository.speichern('schrift', id).catch((f: unknown) => console.warn('Schrift nicht gespeichert:', f));
    },
    [repository],
  );

  const stilWaehlen = useCallback(
    (id: StilId) => {
      setWahl((w) => ({ ...w, stil: id }));
      void repository.speichern('stil', id).catch((f: unknown) => console.warn('Stil nicht gespeichert:', f));
    },
    [repository],
  );

  const wert = useMemo(
    () => ({ ...wahl, einstellungRepository: repository, farbdesignWaehlen, schriftWaehlen, stilWaehlen }),
    [wahl, repository, farbdesignWaehlen, schriftWaehlen, stilWaehlen],
  );
  return <Kontext.Provider value={wert}>{children}</Kontext.Provider>;
}
