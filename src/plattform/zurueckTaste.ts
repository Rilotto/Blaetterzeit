// Android-Zurück-Taste für Blätter und Fenster, die sich darüber schließen lassen (REQ-030).
//  - Android-APK: Ereignis „backButton“ von @capacitor/app. Der Listener ist nur registriert,
//    solange die Komponente angezeigt wird; sonst gilt das bisherige Standardverhalten.
//  - Web/Prototyp: eigener Verlaufseintrag; „Zurück“ im Browser (auch die Android-Taste im
//    Browser) löst `popstate` aus. Tests lösen die Taste per `popstate`-Ereignis aus.
//
// Verspätetes `popstate` (Befund H4, Sprint 05): Wird ein Fenster über X, Ziehen oder Außen geschlossen,
// entfernt `history.back()` den eigenen Verlaufseintrag – das zugehörige `popstate` kommt aber erst
// später (asynchron). Öffnet der Nutzer sofort ein neues Fenster, hätte dieses Ereignis das neue Fenster
// geschlossen, und das neue Fenster hätte keinen eigenen Eintrag angelegt (der alte stand noch oben).
// Abhilfe: Jeder Eintrag trägt ein eigenes Kennzeichen. Solange ein selbst ausgelöstes „Zurück“ noch
// aussteht, legt ein neues Fenster seinen Eintrag erst danach an, und das verspätete `popstate` wird
// abgefangen, bevor es ein Fenster erreicht. Ein `popstate`, bei dem der verlassene Eintrag noch oben
// steht, stammt nicht von diesem „Zurück“ und wird normal zugestellt.
import { Capacitor } from '@capacitor/core';
import { useEffect, useRef } from 'react';

const MARKE = 'bzZurueck';
/** Spätestens nach dieser Zeit gilt ein ausstehendes „Zurück“ als erledigt (Absicherung, falls kein popstate kommt). */
export const ZURUECK_FRIST_MS = 1000;

// Startwert zufällig: Nach einem Neuladen der Seite (bzw. erneutem Laden des Moduls) liegen im Verlauf noch
// Einträge mit Kennzeichen der vorherigen Instanz. Gleiche Kennzeichen würden ein verspätetes `popstate`
// fälschlich als echtes „Zurück“ zustellen und ein gerade geöffnetes Fenster schließen.
let naechstesKennzeichen = 1 + Math.floor(Math.random() * 1_000_000_000);
/** Kennzeichen der Einträge, deren Entfernen per history.back() ausgelöst wurde und noch aussteht. */
const ausstehend: number[] = [];
let warteschlange: (() => void)[] = [];
let frist: ReturnType<typeof setTimeout> | undefined;

const kennzeichenOben = (): unknown => (window.history.state as Record<string, unknown> | null)?.[MARKE];

function ausstehendErledigt() {
  ausstehend.length = 0;
  if (frist !== undefined) clearTimeout(frist);
  frist = undefined;
  const q = warteschlange;
  warteschlange = [];
  for (const f of q) f();
}

/** Führt `f` aus, sobald kein selbst ausgelöstes „Zurück“ mehr aussteht. */
function nachAusstehendem(f: () => void) {
  if (ausstehend.length === 0) f();
  else warteschlange.push(f);
}

function zurueckAusloesen(kennzeichen: number) {
  ausstehend.push(kennzeichen);
  if (frist !== undefined) clearTimeout(frist);
  frist = setTimeout(ausstehendErledigt, ZURUECK_FRIST_MS);
  window.history.back();
}

// Als erster popstate-Listener beim Laden des Moduls registriert, damit er vor allen Fenstern läuft.
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', (e) => {
    if (ausstehend.length === 0) return;
    // Steht ein verlassener Eintrag noch oben, ist dies nicht das erwartete Ereignis (z. B. echte Zurück-Taste).
    if (ausstehend.includes(kennzeichenOben() as number)) return;
    e.stopImmediatePropagation();
    ausstehend.shift();
    if (ausstehend.length === 0) ausstehendErledigt();
  });
}

/**
 * Ruft `beiZurueck` auf, wenn der Nutzer die Zurück-Taste betätigt. Gibt `beiZurueck` `true` zurück,
 * bleibt die Komponente offen (z. B. Rückkehr aus der Kamera ins Blatt) und die Taste bleibt belegt.
 * Liefert `verlassen`: vor dem Schließen auf anderem Weg (X, Hinzufügen, Herunterziehen) aufrufen,
 * damit im Web der eigene Verlaufseintrag entfernt wird.
 */
export function useZurueckTaste(beiZurueck: () => boolean | void): () => void {
  const handler = useRef(beiZurueck);
  const verlassen = useRef(false);
  const kennzeichen = useRef(0);
  useEffect(() => {
    handler.current = beiZurueck;
  });

  useEffect(() => {
    verlassen.current = false;
    if (Capacitor.isNativePlatform()) {
      let aktiv = true;
      let entfernen: (() => Promise<void>) | undefined;
      void import('@capacitor/app')
        .then(({ App }) => App.addListener('backButton', () => void handler.current()))
        .then((h) => {
          if (aktiv) entfernen = () => h.remove();
          else void h.remove();
        })
        .catch((fehler: unknown) => console.warn('Zurück-Taste nicht verfügbar:', fehler));
      return () => {
        aktiv = false;
        void entfernen?.();
      };
    }
    let beendet = false;
    const eintragAnlegen = () => {
      if (beendet || verlassen.current || kennzeichenOben() === kennzeichen.current) return;
      kennzeichen.current = naechstesKennzeichen++;
      window.history.pushState({ ...(window.history.state ?? {}), [MARKE]: kennzeichen.current }, '');
    };
    nachAusstehendem(eintragAnlegen);
    const beiPop = () => {
      if (verlassen.current) return;
      if (handler.current() === true) nachAusstehendem(eintragAnlegen);
    };
    window.addEventListener('popstate', beiPop);
    return () => {
      beendet = true;
      window.removeEventListener('popstate', beiPop);
    };
  }, []);

  return () => {
    if (verlassen.current) return;
    verlassen.current = true;
    if (!Capacitor.isNativePlatform() && kennzeichen.current !== 0 && kennzeichenOben() === kennzeichen.current) {
      zurueckAusloesen(kennzeichen.current);
    }
  };
}
