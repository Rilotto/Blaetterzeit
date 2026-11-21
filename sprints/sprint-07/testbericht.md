# Testbericht Sprint 07 (Teil A+B) – Tester, 2026-11-21

- **Lokal (Token-Sparregel):** neue Dateien REQ-070/071/072/073 und angepasste REQ-056/060/066 fein + grob: 9 Dateien, 143/143 grün; `tsc -b` und oxlint sauber. Volle Suite `npm run verify` lokal **nicht** gelaufen, Nachweis erst über die CI.
- **REQ-070** AK-1 bis AK-8 bestanden (26 Tests) · **REQ-071** AK-1 bis AK-10 bestanden (24) · **REQ-072** AK-1 bis AK-8 bestanden (35) · **REQ-073** AK-1 bis AK-6 bestanden (14).
- **Angepasst (bewusster Bruch durch die REQs):** REQ-056/AK-1 und grob (elf Zeilen mit „Maße“), REQ-060/AK-1 (Reihenfolge mit „masse“), REQ-066/AK-2 (3 Tests) und grob (Anzeige mit Stil). REQ-014 und REQ-017 laufen unverändert grün. Echte Regressionen: keine gefunden.
- **Gegenprobe (5/5 erkannt):** Lupe fehlt, Lupe auf falscher Seite, Maße nicht gespeichert, Rücken ignoriert die Dicke, Stil nicht gespeichert.
- **Fehler:** keine.
- **Risiko 1:** Wird der Manuelle Eintrag ausgehängt, solange er offen ist, bleibt ein Eintrag im Zurück-Verlauf liegen. Ein später geöffnetes Blatt schließt dann sofort (in Tests nachgestellt). Der Fehler liegt in schon vorhandenem Code (Zurück-Taste), ist nicht neu.
- **Annahmen Entwickler (an SM):** (a) Blätter behalten im Feuilleton ihre Fläche. Das steht in Spannung zu F1 („keine Ghost-Flächen … auch Blätter“). (b) „Maße“ hat keinen Pfeil, obwohl die Zeile wie „Preis“ ein Blatt öffnet. (c) Open Library nur bei drei Werten, größter Wert = Höhe. (d) Höchstens 4 Stellen vor dem Komma.
- **Empfehlung:** freigabefähig, sobald die CI (volle Suite) grün ist und (a)/(b) mit dem Anforderungsmanager geklärt sind.
