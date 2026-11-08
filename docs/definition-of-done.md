# Definition of Done

Ein REQ ist **fertig (Implementiert)**, wenn ALLE Punkte erfüllt sind. Der Scrum Master prüft das, bevor er dem CEO etwas zur Abnahme vorlegt.

## Anforderung
- [ ] REQ hat Status „Abgestimmt“ vom CEO erhalten, bevor die Umsetzung begann.
- [ ] Keine offenen Fragen im REQ.

## Umsetzung (Entwickler)
- [ ] Code nur in `src/`, UI/Logik sprechen nur über Repository-Schnittstellen mit dem Speicher.
- [ ] Unit-Tests für neue Logik unter `tests/unit/`.
- [ ] `npm run typecheck` und `npm run lint` ohne Fehler.

## Test (Tester)
- [ ] Für **jedes** Akzeptanzkriterium existiert mindestens ein Test mit Tag `[REQ-xxx/AK-n]` in `tests/acceptance/REQ-xxx-*.test.ts`.
- [ ] Tests wurden aus dem REQ-Text abgeleitet, nicht aus dem Code.
- [ ] **Alle** Tests grün, inklusive der kompletten Regressionssuite.
- [ ] Testbericht an den Scrum Master (bestanden / gefunden / Risiken).

## Gesamt (Scrum Master)
- [ ] `npm run verify` grün (Typecheck, Lint, Tests, Traceability).
- [ ] Unabhängiges Review: Der Tester hat den Code-Diff gesehen, der Entwickler den Test-Diff.
- [ ] Sprint-Review-Notiz unter `sprints/sprint-NN/review.md`.

## Release (nach CEO-Abnahme)
- [ ] CEO hat die REQs ausdrücklich freigegeben.
- [ ] `npm run release:freeze -- <version> <REQ-IDs>` erfolgreich.
- [ ] Commit + Tag `v<version>` gepusht → CI baut signierte APK.
