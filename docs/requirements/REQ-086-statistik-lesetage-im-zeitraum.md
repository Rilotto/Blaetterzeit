---
id: REQ-086
titel: Seite „Statistik“ – Zeile „X von N Tagen gelesen“
status: In Umsetzung
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **sehen, an wie vielen Tagen des Zeitraums ich gelesen habe**, damit **ich meine Regelmäßigkeit einschätze**.

CEO (2026-11-22): „X von N Tagen gelesen“ zählt im Zeitraum, N = Tage des Zeitraums. Lesetage zählen nur Tage mit Sessions, nicht nachgetragene Bücher.

## Anforderung (Satzschablone)

- Das System muss unter der Karte mit Kacheln und Diagramm rechts die Zeile „X von N Tagen gelesen“ anzeigen.
- X ist die Anzahl der Kalendertage (lokale Gerätezeit) im gezeigten Zeitraum, an denen für mindestens ein beliebiges Buch eine Sitzung (REQ-024) gespeichert wurde.
- N ist die Anzahl der Tage des gezeigten Zeitraums (Woche 7, Monat 28–31, Jahr 365 bzw. 366).
- Ein „Beendet am“ ohne Sitzung am selben Tag macht keinen Lesetag.

## Akzeptanzkriterien

### AK-1 Woche
- **Gegeben** Sitzungen am Montag (zwei Bücher) und Mittwoch der gezeigten Woche
- **Wenn** die Seite betrachtet wird
- **Dann** steht „2 von 7 Tagen gelesen“

### AK-2 N je Zeitraum
- **Gegeben** keine Sitzungen
- **Wenn** nacheinander Woche, Februar 2028 und Jahr 2026 gezeigt werden
- **Dann** steht „0 von 7“, „0 von 29“ bzw. „0 von 365 Tagen gelesen“

### AK-3 Nachgetragenes Buch zählt nicht
- **Gegeben** ein Buch *gelesen* mit „Beendet am“ heute und ohne Sitzung
- **Wenn** die laufende Woche gezeigt wird
- **Dann** steht „0 von 7 Tagen gelesen“

## Abgrenzung (nicht Teil dieses REQ)

- Serie (REQ-087).

## Qualitätsanforderungen

- Siehe REQ-090.

## Abhängigkeiten

- **REQ-024, REQ-027** (Tagesgrenze), **REQ-080.**

## Offene Fragen

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-22 | Erstellt aus CEO-Festlegungen; Status „Abgestimmt“ | Anforderungsmanager |
