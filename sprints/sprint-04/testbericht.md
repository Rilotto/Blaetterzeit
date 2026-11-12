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

## Teil C: REQ-035 bis REQ-042 fein, REQ-006/007/009/013 an Fassung 2026-11-12 angepasst (Tester, 2026-11-12)
- Lokal nur betroffene Dateien (CEO-Vorgabe Token sparen): 19 Dateien acceptance + 5 grob: **467 Tests grün**, dazu Typecheck und Lint grün. Volle Suite nur in der CI.
- Neu: REQ-035 (26), REQ-036 (28), REQ-037 (35), REQ-038 (22), REQ-039 (8), REQ-040 (7), REQ-041 (6), REQ-042 (6); REQ-013 um AK-1/3/6 („Alle Bücher“) und AK-11 (Rückweg in die Übersicht) ergänzt. Alle AKs bestanden.
- Angepasst (nur wegen neuer, bestätigter Fassung): REQ-006 AK-2/AK-10, REQ-007 AK-1..5/7/8 („Alle“ an Position 1; Kommentare zählen in AK-7 nicht als eingebaute Filter), REQ-009 AK-14, REQ-011 AK-1 und REQ-034 AK-1/2/5 (auf Abschnitt bzw. neues Feld `eingetragenAm` eingeschränkt), grob REQ-006/007. Keine echte Regression.
- Gegenprobe (Wegwerfkopie, 20 Mutationen): 19 erkannt. Nicht erkannt: Buch „am lesen“ ohne Seitenanzahl zeigt Statuschip. Das ist REQ-konform (REQ-037 AK-8 verbietet nur Balken und Text). Die Mutation „Zuletzt schaltet Ansicht um“ war zunächst unerkannt, der Test ist jetzt verschärft und erkennt sie.
- Befunde: keine Fehler. Risiko (gering): `BuecherAnsicht.tsx` verdrahtet die Filter-IDs „alle“/„noch_zu_lesen“ fest für „Alle ansehen ›“. Wird ein Filter in der Konfiguration umbenannt oder entfernt, öffnet sich eine leere Übersicht.
- REQ-Hinweis: REQ-007 AK-8 nennt nur „Alle“ als Ausnahme, REQ-006 AK-10 und REQ-042 ergänzen „Gerade am Lesen“. Das sollte im AK-8-Text nachgezogen werden.
- Entwickler-Annahmen (Standardansicht Raster, Suche leeren beim Pillenwechsel) widersprechen keinem REQ und werden nicht getestet. „ungelesen“ als Statuschip steht so in REQ-037 AK-7.
- Empfehlung: freigabefähig, wenn die CI (`npm run verify`, volle Suite) grün ist.
