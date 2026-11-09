// Zentrale Abschnittskonfiguration der Seite „Bücher“ (REQ-009, REQ-012).
// Hier stehen die Abschnittsüberschriften und die Zuordnung
// „Lesestatus -> Abschnitt ‚Noch zu lesen‘“, getrennt von der Darstellung.
import type { Buch, LesestatusId } from '@/domain/buch';

export const abschnittKonfiguration: {
  nochZuLesen: { titel: string; lesestatus: LesestatusId[] };
  sagas: { titel: string };
  sammlungen: { titel: string };
} = {
  // Vorbelegung laut CEO: nur „ungelesen“.
  nochZuLesen: { titel: 'Noch zu lesen', lesestatus: ['ungelesen'] },
  sagas: { titel: 'Sagas' },
  sammlungen: { titel: 'Sammlungen' },
};

/** Bücher des Abschnitts „Noch zu lesen“ in unveränderter Reihenfolge, ohne Begrenzung der Anzahl. */
export function buecherNochZuLesen(buecher: Buch[]): Buch[] {
  const status = abschnittKonfiguration.nochZuLesen.lesestatus;
  return buecher.filter((b) => status.includes(b.status));
}
