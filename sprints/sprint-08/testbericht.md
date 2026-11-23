# Testbericht Sprint 08 (Teil A+B) – Tester, 2026-11-21

- **Neu:** REQ-074 (19 Tests), REQ-075 (12), REQ-076 (22), REQ-077 (31), REQ-078 (5). Alle AKs abgedeckt, alle grün.
- **Angepasst:** REQ-072 (jetzt 49 Tests: AK-2/3/4/5/7/8 auf Vorschlag „ca. …“ und vorbefülltes Blatt, AK-9 neu), REQ-073 (AK-3/AK-4 auf Standardmaße je Format). REQ-015 unverändert, grün.
- **Lokal (dot):** REQ-014/015/017/072/073/074–078: 0 Fehler. Typecheck, Lint, `npm run trace` grün. Volle Suite nicht lokal gelaufen (Token-Vorgabe) – Nachweis allein über die CI.
- **Gegenprobe (5 Fehler, 5 erkannt):** Doppeltipp→Einfachtipp (52 rot), Einfachtipp öffnet 3D (5), Hardcover ohne Überstand (3), Rücken ohne Bild nicht Primär (5), Hörbuch öffnet 3D (3).
- **Fehler:** keine gefunden.
- **Entwickler-Annahmen (nicht festgeschrieben, CEO prüft im Prototyp):** Deckeldicke 2,5 mm (max. ¼ der Dicke); Mindestdicke 3 mm verzerrt bei Büchern unter 3 mm die Proportion aus REQ-076 AK-1 (Risiko gering); Hinweisdauer 2,5 s.
- **Risiken:** Unschärfe in jsdom nur über `filter`-Zweig prüfbar (backdrop-filter nicht); Schwung/Trägheit nur mit Fake-Uhr getestet, Gefühl am Gerät prüft der CEO; Android-Zurück-Taste nativ nur über das bestehende Muster (Web: popstate getestet).
- **Empfehlung:** freigabefähig für die Review, sobald die CI (`npm run verify`, volle Suite) grün ist.
- **Grobe Tests (2026-11-23, nach CEO-Abnahme):** `tests/grob/REQ-072…078-grob.test.tsx` neu (7 Dateien, 8 Tests, je Kern des REQ), lokal grün (dot); `tsc -b` und oxlint ohne Befund. Feine Tests unverändert. Keine Gegenprobe.
