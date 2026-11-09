import type { CSSProperties } from 'react';

// Zentrale Textformate (ohne Farben). Wer ein Format teilt, bezieht es von hier,
// damit eine Änderung überall gleichzeitig wirkt.

/**
 * Format von „Alle ansehen ›“ (REQ-009). Dieselbe Definition nutzen die Platzhaltertexte
 * der Abschnitte „Sagas“/„Sammlungen“ (REQ-012, AK-11) und die Beschriftungen
 * „Buchrücken +“/„Schnitt +“ in den Buchdetails (REQ-014, AK-3).
 */
export const textformatAlleAnsehen: CSSProperties = {
  fontFamily: 'inherit',
  fontSize: '14px',
  fontStyle: 'italic',
  fontWeight: 400,
};
