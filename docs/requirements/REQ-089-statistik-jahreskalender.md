---
id: REQ-089
titel: Seite „Statistik“ – Jahreskalender mit zwölf Mini-Kalendern
status: Abgestimmt
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **im Jahr auf einen Blick sehen, an welchen Tagen ich gelesen habe**, damit **ich meine Lesegewohnheiten über das Jahr erkenne**.

CEO (2026-11-22): Jahr: zwölf Mini-Kalender, je Monat 7 Spalten Mo–So, der 1. in der Spalte seines Wochentags, keine Wochentagsbeschriftung. Ein Tag mit Lesen bekommt einen Punkt in der Akzentfarbe (Primär), sonst ist er leer. Der heutige Tag ist umrandet. Kalenderpunkte zählen nur Tage mit Sessions.

## Anforderung (Satzschablone)

- Ist „Jährlich“ aktiv, muss das System unter der Zeile „Serie / Tage gelesen“ eine Karte mit zwölf Mini-Kalendern Januar bis Dezember anzeigen, je mit dem Monatskürzel (wie REF-statistik-07: „Jan“, „Feb“, „Mär“ …).
- Jeder Mini-Kalender muss je Tag des Monats ein Feld in 7 Spalten Montag bis Sonntag zeigen, der 1. in der Spalte seines Wochentags, ohne Wochentagsbeschriftung.
- Das System muss ein Feld an einem Lesetag (mindestens eine Sitzung, REQ-086) mit einem Punkt in Farbrubrik „Primär“ markieren; alle anderen Felder bleiben leer.
- Das System muss das Feld des heutigen Tages umranden.

## Akzeptanzkriterien

### AK-1 Zwölf Monate, Lage des 1.
- **Gegeben** „Jährlich“, gezeigt wird 2026
- **Wenn** die Karte betrachtet wird
- **Dann** gibt es zwölf Mini-Kalender Jan bis Dez ohne Wochentagsbeschriftung; im Januar (1.1.2026 ist Donnerstag) steht der 1. in der vierten Spalte

### AK-2 Punkt an Lesetagen
- **Gegeben** zwei Sitzungen am 03.02.2026 sowie eine am 10.10.2026
- **Wenn** 2026 gezeigt wird
- **Dann** haben genau die Felder 3. Februar und 10. Oktober einen Punkt in „Primär“

### AK-3 Nachgetragenes Buch ohne Punkt
- **Gegeben** ein Buch *gelesen* mit „Beendet am“ 05.03.2026 und ohne Sitzung an dem Tag
- **Wenn** 2026 gezeigt wird
- **Dann** hat der 5. März keinen Punkt

### AK-4 Heute umrandet
- **Gegeben** heute ist der 22.11.2026
- **Wenn** 2026 gezeigt wird
- **Dann** ist genau das Feld 22. November umrandet; in 2025 ist kein Feld umrandet

## Abgrenzung (nicht Teil dieses REQ)

- Kalenderkarte Woche/Monat (REQ-088).

## Qualitätsanforderungen

- Siehe REQ-090.

## Abhängigkeiten

- **REQ-024, REQ-080, REQ-086.**

## Offene Fragen

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-22 | Erstellt aus CEO-Festlegungen; Status „Abgestimmt“ | Anforderungsmanager |
