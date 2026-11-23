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
| REQ-093 | 1–12 | **nicht bestanden** (F1, AK-7) |
| REQ-094 | 1–6 | bestanden |
| REQ-095 | 1–5 | bestanden |
| REQ-096 | 1–5 | bestanden |
| REQ-097 | 1–10 | bestanden |
| REQ-098 | 1–6 | bestanden |
| REQ-099 | 1–7 | bestanden |
| Alttests 012, 024, 028, 030, 031, 033, 049, 055, 056 (fein und grob) | angepasst im WIP-Commit, geprüft | bestanden. Keine weitere Anpassung nötig, die groben Tests widersprechen dem neuen Text nicht. |

Neu: `tests/acceptance/REQ-095…REQ-099-*.test.tsx`. Sie arbeiten über Rollen und Texte, und die Daten werden über das ListenRepository vorbelegt. Die data-Attribute des Entwicklers waren nicht nötig.

## Gefundene Fehler
**F1 (REQ-093/AK-7 und REQ-024): Leeren im Modus „%“ löscht den gespeicherten Modus.** Das ist die Auslegung des Entwicklers.
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
Nicht freigabefähig, bis F1 behoben und die CI (`npm run verify`) grün ist. Alles andere ist bereit.
