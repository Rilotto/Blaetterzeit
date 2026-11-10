// Android-Zurück-Taste für Blätter und Fenster, die sich darüber schließen lassen (REQ-030).
//  - Android-APK: Ereignis „backButton“ von @capacitor/app. Der Listener ist nur registriert,
//    solange die Komponente angezeigt wird; sonst gilt das bisherige Standardverhalten.
//  - Web/Prototyp: eigener Verlaufseintrag; „Zurück“ im Browser (auch die Android-Taste im
//    Browser) löst `popstate` aus. Tests lösen die Taste per `popstate`-Ereignis aus.
import { Capacitor } from '@capacitor/core';
import { useEffect, useRef } from 'react';

const MARKE = 'bzZurueck';

const eigenerEintrag = () => Boolean((window.history.state as Record<string, unknown> | null)?.[MARKE]);

function eintragAnlegen() {
  if (!eigenerEintrag()) window.history.pushState({ ...(window.history.state ?? {}), [MARKE]: true }, '');
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
    eintragAnlegen();
    const beiPop = () => {
      if (verlassen.current) return;
      if (handler.current() === true) eintragAnlegen();
    };
    window.addEventListener('popstate', beiPop);
    return () => window.removeEventListener('popstate', beiPop);
  }, []);

  return () => {
    if (verlassen.current) return;
    verlassen.current = true;
    if (!Capacitor.isNativePlatform() && eigenerEintrag()) window.history.back();
  };
}
