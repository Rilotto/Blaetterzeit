import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { EinstellungRepository } from '@/storage';
import {
  farbVariablenAnwenden,
  istFarbdesignId,
  istSchriftId,
  schriftVariable,
  schriftVariablen,
  standardFarbdesign,
  standardSchrift,
  typografieVariablen,
  type FarbdesignId,
  type SchriftId,
} from '@/theme';

/** Aktuelle Wahl von Farbdesign (REQ-068) und Schrift (REQ-069). */
export interface Designwahl {
  farbdesign: FarbdesignId;
  schrift: SchriftId;
}

interface DesignKontext extends Designwahl {
  farbdesignWaehlen: (id: FarbdesignId) => void;
  schriftWaehlen: (id: SchriftId) => void;
}

const standardWahl: Designwahl = { farbdesign: standardFarbdesign, schrift: standardSchrift };

const Kontext = createContext<DesignKontext>({ ...standardWahl, farbdesignWaehlen: () => {}, schriftWaehlen: () => {} });

/** Zugriff auf die aktuelle Designwahl und die Wahlfunktionen. */
export const useDesign = (): DesignKontext => useContext(Kontext);

/**
 * Hält die Designwahl, lädt sie beim Start aus dem EinstellungRepository und speichert jede Änderung
 * dauerhaft (REQ-068 AK-4, REQ-069 AK-4). Ungültige gespeicherte Werte gelten als „nicht gewählt“.
 * Zusätzlich setzt er Farb-, Schrift- und Typografie-Variablen an <html>, damit auch html/body
 * (Hintergrund) und Bereiche außerhalb der App-Wurzel sofort dem Design folgen (REQ-068 AK-3).
 */
export function DesignAnbieter({ repository, children }: { repository: EinstellungRepository; children: ReactNode }) {
  const [wahl, setWahl] = useState<Designwahl>(standardWahl);

  useEffect(() => {
    let aktiv = true;
    void Promise.all([repository.lesen('farbdesign'), repository.lesen('schrift')])
      .then(([farbdesign, schrift]) => {
        if (!aktiv) return;
        setWahl((w) => ({
          farbdesign: istFarbdesignId(farbdesign) ? farbdesign : w.farbdesign,
          schrift: istSchriftId(schrift) ? schrift : w.schrift,
        }));
      })
      .catch((fehler: unknown) => console.warn('Designwahl nicht lesbar:', fehler));
    return () => {
      aktiv = false;
    };
  }, [repository]);

  useEffect(() => {
    const html = document.documentElement;
    farbVariablenAnwenden(html, wahl.farbdesign);
    html.style.setProperty(schriftVariable, schriftVariablen(wahl.schrift)[schriftVariable]);
    for (const [name, wert] of Object.entries(typografieVariablen())) html.style.setProperty(name, wert);
    html.dataset.farbdesign = wahl.farbdesign;
    html.dataset.schrift = wahl.schrift;
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

  const wert = useMemo(() => ({ ...wahl, farbdesignWaehlen, schriftWaehlen }), [wahl, farbdesignWaehlen, schriftWaehlen]);
  return <Kontext.Provider value={wert}>{children}</Kontext.Provider>;
}
