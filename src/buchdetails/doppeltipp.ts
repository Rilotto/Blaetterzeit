// Doppeltipp auf das Cover (REQ-074): Ein einfacher Tipp wirkt erst, wenn innerhalb der Wartezeit kein
// zweiter folgt; ein zweiter Tipp innerhalb der Wartezeit löst stattdessen den Doppeltipp aus.

/** Zentrale Wartezeit für den Doppeltipp (ms). Auf Zuruf des CEO änderbar, kein Akzeptanzkriterium. */
export const DOPPELTIPP_MS = 300;

export interface Doppeltipp {
  /** Meldet einen Tipp. */
  tipp(): void;
  /** Verwirft einen ausstehenden Einfachtipp (z. B. beim Verlassen der Ansicht). */
  abbrechen(): void;
}

/** Unterscheidet Einfach- und Doppeltipp über einen Timer (in Tests mit Fake-Timern steuerbar). */
export function doppeltippErkennen(
  einfach: () => void,
  doppelt: () => void,
  wartezeit: number = DOPPELTIPP_MS,
): Doppeltipp {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const abbrechen = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
  };
  return {
    tipp() {
      if (timer !== undefined) {
        abbrechen();
        doppelt();
        return;
      }
      timer = setTimeout(() => {
        timer = undefined;
        einfach();
      }, wartezeit);
    },
    abbrechen,
  };
}
