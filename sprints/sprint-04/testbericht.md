# Testbericht Sprint 04

## Anpassung REQ-009/AK-3 (Demodaten auf „ungelesen“)

Auf Wunsch des CEO stehen alle Testbücher in `demo/testbuecher.json` jetzt auf „ungelesen“ (IDs unverändert). Der Test „[REQ-009/AK-3] ohne Props …“ prüfte zusätzlich fest, dass „When The Moon Hatched“ fehlt. Damit prüfte er den Inhalt der Demodaten und nicht REQ-009. Die Ausschlussprüfung wird jetzt dynamisch aus den Demodaten abgeleitet: Genau die Bücher mit dem Status „ungelesen“ müssen erscheinen, alle anderen nicht. Die Filterprüfung bleibt unverändert. Die Ausschlussprüfung mit anderen Status bleibt in den übrigen AK-3-Tests mit expliziten Daten abgedeckt.

## Teil A: REQ-029 bis REQ-034, REQ-005 (geändert), REQ-008 AK-6 (Tester, 2026-11-10)

- **Ergebnis:** `npm run verify` grün: 56 Dateien, 876 Tests, Traceability OK. Alle AKs von REQ-029…034 und REQ-008 AK-6 bestanden. REQ-005 AK-10 wurde an den neuen Wortlaut angepasst und prüft nur noch die Filter-Schaltfläche, weil die Wirkung von Plus jetzt REQ-029 regelt. Der grobe Test REQ-005 erwartet jetzt das Menü statt „ohne Wirkung“.
- **Gegenprobe:** In einer Wegwerfkopie wurden 22 Fehler eingebaut, alle 22 wurden erkannt. Beispiele: Jahr/Titel-Prüfung, gespeicherter Platzhalter, Cover nicht gespeichert, Schließwege, Farbrubrik, Autor oder Datum geht verloren, kein Rückfall, Doppeltippen.
- **Einschränkung:** Von REQ-031 AK-8/AK-9 ist nur der Datenteil geprüft. Das Menü „Buchlänge“ kommt mit REQ-025 (Teil B) und muss dort nachgetestet werden.
- **Annahmen des Entwicklers, die nicht im REQ stehen** (an den Anforderungsmanager): „SEITEN“ nimmt höchstens 5 Ziffern an, 0 gilt als keine Angabe, Titel und Autor werden getrimmt.
- **Risiken:** Schlägt `repo.save` fehl, gibt es keine Rückmeldung (unbehandelte Ablehnung). Schlägt das Speichern des Covers fehl, wird das Buch ohne Cover angelegt und nur `console.warn` meldet es.
- **Manuelle Prüfliste (CEO/Gerät):** Optik von Menü und Blatt im Vergleich zu den Referenzbildern, bildschirmfüllend. Farben der Platzhalter (Tertiär) und Trennlinien (GhostFrame). Abdunklung wie bei REQ-024. Android-Zurück-Taste und Herunterziehen auf der APK. Bücher und Cover nach echtem Browser-Neuladen und nach einem APK-Neustart (SQLite). Artefakt mit gesperrtem Speicher bleibt bedienbar.

## Teil B: REQ-021 bis REQ-028 fein, Teil A grob (Tester, 2026-11-12)

- **Ergebnis:** `npm run verify` ist grün: 72 Dateien, 1185 Tests, Traceability OK. Alle AKs von REQ-021…028 sind bestanden (274 feine Tests). Neu sind grobe Tests für REQ-029…034, und REQ-008 GROB wurde um den Autor ergänzt. Der Nachtest von REQ-031 AK-8/AK-9 (Menü „Buchlänge“) ist bestanden.
- **Gegenprobe:** In einer Wegwerfkopie wurden 31 Fehler eingebaut, alle 31 wurden erkannt. Beispiele: Rundung, Grenzen 401/101/0, Sitzung bei Gleichstand, Vergleich nach Rohwert, Tag in UTC, Streak, Menülage und Reihenfolge, Schließwege speichern, Farben und Verlauf, Platzhalter für den Autor.
- **Offen (an den Scrum Master):** Die Demoautoren nach REQ-028 (Randbedingung) muss der Tester in `demo/testbuecher.json` eintragen. Dafür hat er hier keine Schreibfreigabe. Die Absprache nennt „42%“, REQ-026 nennt „11 %“. Die Tests akzeptieren beide Schreibweisen, die Entscheidung liegt beim Anforderungsmanager.
- **Risiken:** Schlägt das Speichern fehl, gibt es nur `console.warn`. Beim Sichern im anderen Modus wird der Wert des bisherigen Modus verworfen. Bleiben die Buchdetails über Mitternacht offen, wird der Streak erst beim nächsten Rendern neu berechnet. Die Android-Zurück-Taste ist bei offenem Blatt nicht geregelt.
- **Manuelle Prüfliste (CEO/Gerät):** Optik von Pille, Balken, Statistik und Flamme im Vergleich zu REF-01/03. Menü über bzw. unter der Pille auf dem echten Gerät. Blätter fahren von unten ein, Stärke der Abdunklung. Tastatur verdeckt das Eingabefeld nicht. Streak über einen echten Tageswechsel. Status, Fortschritt und Sitzungen nach Browser-Neuladen und APK-Neustart (SQLite-Migration).
