# Testbericht Sprint 10 – Felder und Listen (REQ-091 bis REQ-099)

Datum: 2026-11-23 · Tester · Branch `sprint-10/listen-und-felder`

## Lokaler Lauf (Vorgabe: nur Sprint-REQs und betroffene Alttests)
`npx vitest run` für REQ-091–099, REQ-002/012/024/028/030/031/033/049/055/056 (fein und grob) sowie den Listen-Vertragstest, `--reporter=dot`:
- Typecheck (`tsc -b`): grün. Lint (`oxlint --quiet`): grün.
- Ohne meinen neuen Test zu F1: 29 Dateien, 577 Tests grün. REQ-095–099: 108 Tests grün.
- Mit dem neuen Test zu F1: **REQ-093 1 rot** (24 Tests, 23 grün).
- Volle Suite (`npm run verify`) lokal nicht ausgeführt, wie vorgegeben. Das Sicherheitsnetz ist die CI.

## Ergebnis je REQ
| REQ | AKs | Ergebnis |
|---|---|---|
| REQ-091 | 1–3 | bestanden |
| REQ-092 | 1–13 | bestanden |
| REQ-093 | 1–12 | bestanden (F1 behoben, lokal 24/24 grün) |
| REQ-094 | 1–6 | bestanden |
| REQ-095 | 1–5 | bestanden |
| REQ-096 | 1–5 | bestanden |
| REQ-097 | 1–10 | bestanden |
| REQ-098 | 1–6 | bestanden |
| REQ-099 | 1–7 | bestanden |
| Alttests 012, 024, 028, 030, 031, 033, 049, 055, 056 (fein und grob) | angepasst im WIP-Commit, geprüft | bestanden. Keine weitere Anpassung nötig, die groben Tests widersprechen dem neuen Text nicht. |

Neu: `tests/acceptance/REQ-095…REQ-099-*.test.tsx`. Sie arbeiten über Rollen und Texte, und die Daten werden über das ListenRepository vorbelegt. Die data-Attribute des Entwicklers waren nicht nötig.

## Gefundene Fehler
**F1 (REQ-093/AK-7 und REQ-024): Leeren im Modus „%“ löscht den gespeicherten Modus. Status: behoben** (Korrektur des Entwicklers, CI danach grün laut Scrum Master, REQ-093 lokal am 2026-11-24 nachgeprüft: 24/24 grün).
- Schritte: Buch mit 400 Seiten, Modus „%“, 30 %. Menü „Aktuelle Seite“ öffnen, Feld leeren, „Sichern“ antippen. Danach das Menü erneut öffnen (auch nach einem Neustart).
- Erwartet: Das Menü öffnet in „%“. REQ-024: „Der gewählte Modus wird pro Buch gespeichert (Kindle-Buch öffnet direkt in „%“)“. REQ-093 entfernt nur den Fortschritt.
- Tatsächlich: `fortschrittsmodus` ist `undefined`, und das Menü öffnet in „Seite“.
- Test: `[REQ-093/AK-7] Modus „%“ geleert: der gespeicherte Modus „%“ bleibt …`

## Prüfung der Auslegungen des Entwicklers
- Leeren löscht den Modus „%“: widerspricht REQ-024, siehe F1.
- Zuordnungen gelöschter Bücher bleiben gespeichert, werden aber nicht mitgezählt: verträglich mit REQ-097/098, weil dort nur Bücher gezählt werden. Bücher löschen ist derzeit nicht Teil der App. Geringes Risiko: verwaiste Datensätze.

## Hinweis an den Scrum Master (REQ unklar)
- REQ-093/AK-8 verlangt nach dem Leeren „Noch nicht geschrieben“ (REQ-047). REQ-047 und REQ-049 verbieten diesen Text aber, ohne Rezension steht dort „Wie fandest du es?“. Der Test folgt REQ-047. Der Anforderungsmanager sollte AK-8 korrigieren.

## Gegenprobe
5 Fehler in einer Wegwerfkopie eingebaut, alle 5 erkannt: Band wird nicht gespeichert (12 rot), Löschen lässt Zugehörigkeiten stehen (2 rot), „nach Bänden“ sortiert A–Z (3 rot), Leeren behält den Verlag (2 rot), Jahr bei „Erschienen“ abgewiesen (5 rot).

## Risiken
- Die SQLite-Migration 10 wird nur durch den Vertragstest abgedeckt. Die Akzeptanztests laufen auf IndexedDB.
- Layout (untereinander, linksbündig, flächendeckend) ist in jsdom nicht prüfbar und gehört zur Sichtprüfung im Prototyp.

## Empfehlung
Stand 2026-11-23: nicht freigabefähig wegen F1. F1 ist inzwischen behoben, aktuelle Empfehlung siehe Nachtrag.

## Nachtrag 2026-11-24: REQ-098 (AK-6 bis AK-9 geändert) und REQ-100 (neu)
- Tests: In `REQ-098-geoeffnete-liste.test.tsx` ersetzen AK-6 bis AK-9 den alten AK-6 (Plus legt Liste an). `REQ-100-listenbild.test.tsx` ist neu (AK-1 bis AK-8, dazu Löschen der Liste löscht das Bild).
- Lokal: `tsc -b` grün, `oxlint --quiet` grün, REQ-098 und REQ-100 mit `--reporter=dot` dreimal hintereinander jeweils 62/62 grün, nicht sporadisch. Die frühen roten Tests zu REQ-100 AK-5/AK-8 kamen von meinen Hilfsfunktionen (Zeilen- und Platzhaltersuche) und sind korrigiert.
- Ergebnis: REQ-098 AK-1 bis AK-9 bestanden, REQ-100 AK-1 bis AK-8 bestanden. Volle Suite nur in der CI.
- Gegenprobe: 3/3 erkannt. Herausnehmen beim Sichern der Auswahl fehlt (2 rot), Listenbild wird nicht gespeichert (16 rot), Entfernen bzw. Mitlöschen wirkt nicht (3 rot).
- Risiko: Bündige Namen, echte Pixelgröße und Farbdesigns lassen sich in jsdom nicht prüfen, das gehört zur Sichtprüfung. Für den Zuschnitt prüft der Test einen hochkant liegenden Startrahmen zwischen 0,6 und 0,7, der Entwickler setzt 2:3 um.
- Empfehlung: freigabefähig, sobald die CI (`npm run verify`) für den Branch grün ist.
