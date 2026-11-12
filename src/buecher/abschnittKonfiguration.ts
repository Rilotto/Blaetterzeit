// Zentrale Abschnittskonfiguration der Seite „Bücher“ (REQ-009, REQ-012, REQ-035).
// Hier stehen die Abschnittsüberschriften, die Platzhaltertexte und die Zuordnung
// „Lesestatus -> Abschnitt ‚Noch zu lesen‘“, getrennt von der Darstellung.
import type { Buch, LesestatusId } from '@/domain/buch';

export const abschnittKonfiguration: {
  nochZuLesen: { titel: string; lesestatus: LesestatusId[] };
  sagas: { titel: string; platzhaltertext: string };
  sammlungen: { titel: string; platzhaltertext: string };
  alleBuecher: { titel: string; platzhaltertext: string };
} = {
  // Vorbelegung laut CEO: nur „ungelesen“.
  nochZuLesen: { titel: 'Noch zu lesen', lesestatus: ['ungelesen'] },
  sagas: { titel: 'Sagas', platzhaltertext: 'Deine nächste Saga wartet auf dich!' },
  sammlungen: { titel: 'Sammlungen', platzhaltertext: 'Wie wäre es mit einer neuen Sammlung?' },
  // REQ-035: Text des Leere-Liste-Platzhalters, wenn kein Buch eingetragen ist.
  alleBuecher: { titel: 'Alle Bücher', platzhaltertext: 'Deine Bücher warten auf dich...' },
};

/** Bücher des Abschnitts „Noch zu lesen“ in unveränderter Reihenfolge, ohne Begrenzung der Anzahl. */
export function buecherNochZuLesen(buecher: Buch[]): Buch[] {
  const status = abschnittKonfiguration.nochZuLesen.lesestatus;
  return buecher.filter((b) => status.includes(b.status));
}
