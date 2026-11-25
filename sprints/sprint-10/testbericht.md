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

## Nachtrag 2026-11-24: Teil C – REQ-101 bis REQ-107, REQ-043 (AK-3, AK-8 angepasst)
- Tests: neu `REQ-101` … `REQ-107` (je AK mehrere Varianten, dazu Grenzfälle: Tageszeit auf Minute und Sekunde, Wechsel während der Anzeige, Wochen-, Monats- und Jahreswechsel, Jahresziel an den Jahresgrenzen und nur Status *gelesen*, numerische Sortierung der Zitate, Zitat des Tages über 10 Folgetage und stabil beim Hinzufügen bzw. Löschen anderer Zitate). In `REQ-043` sind AK-8 (Notizbuch zeigt „Zitate“) und AK-3 (Buch mit Zitaten öffnet mit „Rezension“) angepasst. Der grobe Test zu REQ-043 bleibt unverändert.
- Platzhalter auf „Start“: REQ-002 AK-12 und REQ-004 gelten nur für Menüpunkte ohne festgelegte Zielansicht und nennen „Start“ nicht. Seit REQ-101 hat kein Menüpunkt mehr eine undefinierte Zielansicht. In `REQ-002`, `REQ-004` (fein) und `tests/grob/REQ-004-grob` wird diese Bedingung deshalb simuliert: Per `vi.mock('@/views')` bekommt „Start“ die Platzhalteransicht der App. Die Prüfungen selbst sind unverändert.
- Lokal: `tsc -b` grün, Lint mit Exit 0 (2 Warnungen `react(refs)` in `BuchDetails.tsx`). REQ-10[1-7], REQ-043, REQ-002, REQ-004 und grob REQ-004/REQ-043 liefen zweimal hintereinander mit 230/230 grün.
- Ergebnis: REQ-101 AK-1–6, REQ-102 AK-1–7, REQ-103 AK-1–3, REQ-104 AK-1–5, REQ-105 AK-1–10, REQ-106 AK-1–5, REQ-107 AK-1–4 und REQ-043 AK-1–8 bestanden. Die volle Suite läuft nur in der CI.
- Gegenprobe: 4/4 erkannt. Tageszeit-Grenze 10:00 (2 rot), Zitat des Tages nicht gemerkt (2 rot), Jahresziel ohne Statusprüfung (1 rot), Zitat löschen nicht gespeichert (4 rot).
- Hinweis an den Scrum Master: REQ-101 AK-2 nennt „Montag, 24.11.2026“, der 24.11.2026 ist aber ein Dienstag. Getestet wird mit echtem Datum (Mo 23.11. und Di 24.11.). Der Anforderungsmanager sollte das AK berichtigen.
- Risiken: Linienstil der Icons, Lage der Bereiche und Umrandung von „heute“ sind nur über Kennzeichen bzw. Reihenfolge prüfbar, Sichtprüfung im Prototyp. Die Uhr wird laut Entwickler alle 5 s abgefragt, getestet ist der Wechsel innerhalb von 61 s.
- Empfehlung: freigabefähig, sobald die CI (`npm run verify`) für den Branch grün ist.
- Nachtrag CI (Commit 68ed60a): Dieselbe Simulation „Start = Platzhalter“ (`vi.mock('@/views')`) ist jetzt auch in `REQ-003`, `REQ-005` und `REQ-079` (fein) eingebaut. REQ-066, REQ-097 und die groben Tests zu REQ-003, REQ-005, REQ-066, REQ-079 und REQ-097 waren auch ohne Änderung grün. Lokal 102/102 grün. Offen ist REQ-007/AK-7, das behebt der Entwickler.

## Nachtrag 2026-11-25: Teil D – REQ-108, REQ-109; angepasst REQ-026 AK-1/2, REQ-027 AK-5/7, REQ-087 AK-4, REQ-103 AK-3
- Tests: Neu sind `REQ-108-gesamt-streak-zustaende` (Startseite und Statistik, drei Zustände, Anzünden durch Lesen, Sichern ohne Erhöhung, GhostFrame je Design) und `REQ-109-buch-streak-rekord` (Rekord über die Historie, Monats-/Jahresgrenze, lokaler Tageswechsel, Status und Pause, nur dieses Buch). Angepasst sind die feinen Tests zu REQ-026/027/087/103 und der grobe Test zu REQ-026 (neue Beschriftung). Die groben Tests zu REQ-027/087 bleiben gültig und unverändert. Den Zustand erkennen die Tests an der Füllung der Flamme, nicht am Kennzeichen.
- Lokal: `tsc -b` grün, Lint mit Exit 0, die genannten REQs mit 115/115 grün. Volle Suite nur in der CI.
- Ergebnis: REQ-108 AK-1–6 und REQ-109 AK-1–5 bestanden, ebenso die geänderten AKs von REQ-026, 027, 087 und 103.
- Gegenprobe: 2/2 erkannt. „Gestern gelesen“ wird angezündet statt ausgegraut (10 rot), Rekord nimmt die letzte statt der längsten Folge (2 rot).
- Empfehlung: freigabefähig, sobald die CI (`npm run verify`) für den Branch grün ist.
