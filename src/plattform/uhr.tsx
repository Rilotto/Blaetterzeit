// Injizierbare Uhr (REQ-101 bis REQ-106): Alle Ansichten, die Datum oder Uhrzeit brauchen, lesen die Zeit über
// `useUhr()`. Ohne Anbieter ist es die Systemzeit. Tests setzen eine feste Zeit mit <UhrAnbieter jetzt={...}>
// bzw. über die Prop `jetzt` von <App> oder der jeweiligen Ansicht.
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Uhr = () => Date;

/** Systemzeit des Geräts (lokale Zeitzone). */
export const systemUhr: Uhr = () => new Date();

const Kontext = createContext<Uhr>(systemUhr);

/** Stellt allen Ansichten darunter die Uhr bereit. */
export function UhrAnbieter({ jetzt, children }: { jetzt?: Uhr; children: ReactNode }) {
  return <Kontext.Provider value={jetzt ?? systemUhr}>{children}</Kontext.Provider>;
}

/** Aktuelle Uhr (Funktion, die bei jedem Aufruf die aktuelle Zeit liefert). */
export const useUhr = (): Uhr => useContext(Kontext);

/** Abstand, in dem `useMinutentakt` die Uhr abfragt (ms). Die Anzeige wechselt spätestens so viel nach der Minute. */
export const TAKT_MS = 5_000;

const minutenSchluessel = (d: Date): string => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}-${d.getMinutes()}`;

/**
 * Liefert die aktuelle Zeit und rendert neu, sobald sich die Minute der Uhr ändert (REQ-101: mindestens minütliche
 * Aktualisierung). Die Uhr wird alle TAKT_MS abgefragt; mit gefälschten Timern (vi.useFakeTimers) steuerbar.
 */
export function useMinutentakt(uhr: Uhr): Date {
  const [, setSchluessel] = useState(() => minutenSchluessel(uhr()));
  useEffect(() => {
    const t = setInterval(() => setSchluessel(minutenSchluessel(uhr())), TAKT_MS);
    return () => clearInterval(t);
  }, [uhr]);
  return uhr();
}
