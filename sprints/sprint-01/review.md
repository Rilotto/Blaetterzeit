# Sprint 01 – Review (Prototyp-Lieferung)

**Prototyp:** Artefakt „Blätterzeit – Prototyp Sprint 01 (Entwurf)“ (Web-Build, privat für den CEO)
**Stand:** Branch `sprint-01/prototyp-basis`. `npm run verify` ist grün (113 Tests), die CI-Checks „verify“ und „android-build“ sind grün.

## Neu
| REQ | Inhalt | Status |
|---|---|---|
| REQ-002 | Untere Hauptnavigation mit fünf Menüpunkten und den Icons des CEO, aktiver Menüpunkt, Platzhalter „under construction :)“, Seitenhintergrund | In Umsetzung, automatisch grün, manuelle Prüfung durch den CEO offen |
| REQ-003 | Zentral definierte App-Schrift, aktuell die Systemschrift als Ersatz | In Umsetzung, automatisch grün, Sichtprüfung offen |

## Bewusst nicht enthalten
- Die Inhalte aller fünf Ansichten. Sie zeigen nur den Platzhalter.
- Die endgültige Schrift. Sie legt der CEO später fest.
- Themes (REQ-001, Could, späterer Prototyp).
- Eine Gestaltung von Fokusrahmen und Tap-Hervorhebung. Beides bleibt laut CEO unverändert.

## Prüfauftrag an den CEO
Manuelle Prüfliste aus `testbericht.md`:
- **M-2:** Leiste unten, Hintergrund creme
- **M-3:** Alle fünf Punkte gleich breit
- **M-4:** Icon mittig über der Beschriftung
- **M-5:** Richtige Icons, scharf
- **M-6:** Aktiver Punkt mit beiger, länglicher Hervorhebung hinter dem Icon, Icon und Beschriftung bordeauxrot
- **M-7:** Inaktive Punkte braun, ohne Hervorhebung
- **M-9:** Leiste bleibt beim Scrollen
- **M-10:** Nichts wird vom Systembereich verdeckt (nur auf dem Gerät prüfbar)
- **M-12:** „under construction :)“ steht mittig
- **M-13:** Die Schrift ist lesbar
- **M-14:** Hintergrund auf der ganzen Fläche einheitlich
- **Oberer Abstand zur Statusleiste:** Ist er so in Ordnung?

## Danach
- Feedback des CEO → Anforderungsmanager
- Bei Abnahme: REQ-002 und REQ-003 auf „Implementiert“ setzen und einen Pull Request nach `main` anlegen. Ein Release (Einfrieren) gibt es nur nach ausdrücklicher Freigabe durch den CEO.

## Ergebnis der Abnahme durch den CEO (2026-11-09)
- **Punkte 1, 2, 3 und 5:** in Ordnung. Das betrifft Leiste, Icons, aktiven Menüpunkt, Schrift und oberen Abstand.
- **Punkt 4:** Der Text „under construction :)“ ist vorhanden, war aber nicht lesbar, weil er dieselbe Farbe hatte wie der Hintergrund. Vermutliche Ursache: Für den Inhaltsbereich ist keine Textfarbe definiert, deshalb greift die Standardfarbe des Browsers, die im Dunkelmodus hell ist. Der CEO wünscht für den nächsten Prototyp die Schriftfarbe der Navigationsleiste. Das geht als neue Anforderung an den Anforderungsmanager und blockiert die Abnahme nicht.
- **Gesamt:** vom CEO abgenommen („Damit ist alles meinerseits abgenommen.“). REQ-002 und REQ-003 stehen auf „Implementiert“. Das Einfrieren über ein Release erfolgt nur nach ausdrücklicher Freigabe.
