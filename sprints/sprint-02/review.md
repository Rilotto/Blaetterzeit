# Sprint 02 – Review (Prototyp-Lieferung)

**Prototyp:** Artefakt „Blätterzeit – Prototyp Sprint 02 (Entwurf)“, eine neue Version des Artefakts aus Sprint 01.
**Stand:** Branch `sprint-02/buecher-grundgeruest`. `npm run verify` ist grün mit 367 Tests, die CI-Checks „verify“ und „android-build“ sind grün.

## Neu
| REQ | Inhalt |
|---|---|
| REQ-004 | Platzhaltertext in Tertiär |
| REQ-005 | Kopfbereich „Deine Bücher“ mit zwei runden Schaltflächen ohne Funktion |
| REQ-006 und REQ-007 | Filterleiste aus der Konfiguration, „Für dich“ als Standard |
| REQ-008 | Buchdaten und die fünf Lesestatus. Demodaten: drei Fantasy-Bücher ohne Cover |
| REQ-009 | Abschnitt „Noch zu lesen“, gefiltert nach dem Status `ungelesen` |
| REQ-010 und REQ-011 | Herz-Platzhalter für Bücher ohne Cover und für eine leere Liste |
| REQ-012 | Abschnitte „Sagas“ und „Sammlungen“ mit Platzhalter |

## Vom Team gewählte Werte, die der CEO prüfen soll
- **Filterkapseln:** 30 dp hoch laut REQ, im Referenzbild sind es ca. 41 dp.
- **Abschnittsüberschriften:** 20 px fett.
- **„Alle ansehen ›“:** kursiv.
- **Cover:** 112 × 168 px.
- **Abstand zwischen den Büchern:** 16 px.
- **Herz:** 40 px.
- **Icons für Regler und Plus:** aus dem Referenzbild nachgebildet.

## Offen
- **F-1:** Der Text von REQ-006 sagt noch „Bereich unterhalb bleibt leer“. Das muss vor dem Einfrieren bereinigt werden (Anforderungsmanager).
- **F-4 und F-5:** Laden der Bücher ohne Fehlerbehandlung. Der Coverschatten auf älteren WebViews muss auf dem Gerät geprüft werden.
- **Manuelle Prüfliste:** M-B1 bis M-B14 in `testbericht.md`.

## Ergebnis der Abnahme durch den CEO (2026-11-09)
- Horizontale Filterleiste: geprüft, „wie gewünscht umgesetzt“.
- Punkte 1–4: abgenommen. Das betrifft Farben und Aufbau, die Icons für Regler und Plus, die Bücher unter „Noch zu lesen“ und die vom Team gewählten Werte.
- REQ-004 bis REQ-012 stehen auf „Implementiert“.
- **Neuer Wunsch:** Unter den Platzhaltern soll der Text „Wie wäre es mit einem neuen Buch?“ stehen. Welche Platzhalter gemeint sind, wird mit dem CEO geklärt, danach folgt ein neuer bzw. geänderter REQ.
