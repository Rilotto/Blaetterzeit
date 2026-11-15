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

## Teil B (REQ-051 bis REQ-053, REQ-055 bis REQ-059, Tester, 2026-11-15)
- Ergebnis: Alle AKs grün (8 Dateien, 78 Tests). REQ-043 und REQ-049 bleiben grün (zusammen 109 Tests, 2 Läufe). `tsc -b` und oxlint sind sauber. Die volle Suite lief lokal nicht (Token-Vorgabe), das Sicherheitsnetz ist die CI.
- Gegenprobe (4 Fehler): Exemplar nicht gespeichert, Sonderausgabe nicht abwählbar, Seitenzahl unter aktueller Seite gesichert, Preis nicht gespeichert. Alle 4 wurden erkannt (1, 2, 1 bzw. 3 rote Tests).
- B2 (Annahme Entwickler, nicht im REQ, nicht festgeschrieben): Bei E-Book/Hörbuch werden Unterformat und Sonderausgabe verworfen. Klärung durch AM/CEO.
- B3 (Annahme Entwickler, nicht im REQ, nicht festgeschrieben): Erneutes Antippen hebt Unterformat und Exemplar nicht auf. REQ-058 regelt das Abwählen nur für die Sonderausgabe.
- B4 (Annahme Entwickler, nicht im REQ, nicht festgeschrieben): Monatsabkürzungen außer „Okt.“ (z. B. „März“, „Juni“, „Sept.“).
- B5 (Hinweis): Der Preis nimmt auch „.“ als Dezimaltrennzeichen an, und „0,00 €“ lässt sich sichern. Die Zeile zeigt dann „0,00 €“ statt des Hinweistexts. Beides regelt der REQ nicht.
- Risiko R1: Bei REQ-057 AK-5 blockiert auch eine aktuelle Seite, die aus dem Modus „Seite“ übrig geblieben ist, wenn inzwischen der Modus „%“ aktiv ist. Das ist nicht geprüft.
