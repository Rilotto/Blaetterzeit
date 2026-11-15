# Testbericht Sprint 05

## Teil A (REQ-043 bis REQ-049, Tester, 2026-11-15)
- Ergebnis: Alle AKs von REQ-043 bis REQ-049 grün (7 Dateien, 66 Tests). REQ-013 und REQ-024 sind ebenfalls grün und mussten nicht angepasst werden. Typecheck (`tsc -b`) und oxlint sind sauber. Die volle Suite lief lokal nicht (Token-Vorgabe), das Sicherheitsnetz ist die CI.
- Gegenprobe (4 Fehler): kein Zurücksetzen, Bewertung nicht gespeichert, Rezension nicht gespeichert, leerer Text gesichert. Alle 4 wurden erkannt (4, 7, 5 bzw. 3 rote Tests).
- Befund B1 (Hinweis, nicht im REQ): Der Entwickler wertet Text aus reinem Leerraum als „leer“ (`rezensionLeer` = `trim() === ''`). Ein solcher Text wird nicht gesichert, und `buchAusDaten` verwirft ihn beim Laden. Diese Regel ist nicht als Erwartung festgeschrieben. Klärung durch den Anforderungsmanager/CEO.
- Hinweis H1: Bei REQ-046 AK-3/AK-4 ist nur geprüft, dass das Symbol die CSS-Variable der Rubrik bzw. ein `color-mix` aus Rubrik und „Hintergrund“ nutzt. jsdom berechnet `color-mix` nicht. Die Optik prüft der CEO im Prototyp.
- Hinweis H2: Bei REQ-043 AK-1 hat die Leiste seitlich den Standardrand (RAND), sie läuft also nicht randlos über die volle Breite. Breite und „smooth“ prüft der CEO im Prototyp.
- CI-Nachbesserung: REQ-049 AK-9 wartet jetzt auf das Öffnen und Schließen sowie auf das asynchrone `popstate` nach `history.back()`. Bei REQ-026 AK-7 sind Reiterleiste und Reiterbereich (REQ-043, bestätigt) aus der Zitat-Prüfung ausgenommen. Lokal ist beides 3× grün.
- Risiko H4 (nicht reproduziert): Wird nach Schließen per X/Ziehen/Außen sofort wieder geöffnet, kann das verspätete `popstate` das neue Fenster schließen. Das ist die vermutete Ursache des CI-Fehlers. Der Entwickler sollte das prüfen.
- Hinweis H3: Der Reiter „Details“ zeigt derzeit „under construction :)“. Das ist laut REQ-043 kein AK-8-Fall, der Inhalt folgt mit REQ-051 ff. (Teil B).
