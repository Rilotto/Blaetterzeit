---
id: REQ-088
titel: Seite „Statistik“ – Kalenderkarte für Woche und Monat mit Covern
status: Implementiert
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **in einem Kalender sehen, an welchen Tagen ich welches Buch gelesen habe**, damit **mein Lesen anschaulich wird**.

CEO (2026-11-22): Woche und Monat: Kalenderkarte mit Wochentagszeile MO–SO, Kacheln je Tag mit Tageszahl, an Lesetagen das Cover des gelesenen Buches, der heutige Tag umrandet. Die Auswahl „Mehrere Bücher: Ein Cover ⌄“ entfällt; Antippen hat vorerst keine Funktion. Mehrere Bücher an einem Tag: ein Cover, Wahl legt der Anforderungsmanager fest (als Auslegung gekennzeichnet).

## Anforderung (Satzschablone)

- Ist „Wöchentlich“ oder „Monatlich“ aktiv, muss das System unter der Zeile „Serie / Tage gelesen“ eine Kalenderkarte mit der Wochentagszeile „MO DI MI DO FR SA SO“ anzeigen.
- Das System muss darunter je Tag des gezeigten Zeitraums eine Kachel mit der Tageszahl anzeigen, in 7 Spalten Montag bis Sonntag; im Monat steht der 1. in der Spalte seines Wochentags.
- An einem Lesetag (mindestens eine Sitzung, REQ-086) muss die Kachel das Buchcover des an diesem Tag gelesenen Buches zeigen; ohne Buchcover den Cover-Platzhalter (REQ-010).
- Auslegung des Anforderungsmanagers: Gibt es an einem Tag Sitzungen mehrerer Bücher, zeigt die Kachel das Buch mit der zeitlich letzten Sitzung des Tages.
- Tage ohne Sitzung zeigen nur die Tageszahl; ein „Beendet am“ ohne Sitzung zeigt kein Cover.
- Das System muss die Kachel des heutigen Tages umranden.
- Antippen einer Kachel darf vorerst nichts bewirken.

## Akzeptanzkriterien

### AK-1 Aufbau Woche
- **Gegeben** „Wöchentlich“, gezeigt wird 16 – 22 Nov 2026
- **Wenn** die Kalenderkarte betrachtet wird
- **Dann** steht oben „MO DI MI DO FR SA SO“ und darunter 7 Kacheln mit 16 bis 22

### AK-2 Aufbau Monat
- **Gegeben** „Monatlich“, gezeigt wird November 2026 (1. ist ein Sonntag)
- **Wenn** die Kalenderkarte betrachtet wird
- **Dann** gibt es 30 Kacheln, die Kachel „1“ steht in der Spalte „SO“

### AK-3 Cover am Lesetag
- **Gegeben** am 18.11.2026 gibt es eine Sitzung für ein Buch mit Frontcover
- **Wenn** die Woche 16 – 22 Nov gezeigt wird
- **Dann** zeigt die Kachel 18 dieses Cover, die übrigen Kacheln kein Cover

### AK-4 Mehrere Bücher am Tag
- **Gegeben** am 18.11.2026 Sitzung für Buch A um 09:00 und für Buch B um 21:00
- **Wenn** die Woche gezeigt wird
- **Dann** zeigt die Kachel 18 das Cover von Buch B

### AK-5 Heute umrandet, Antippen ohne Funktion
- **Gegeben** heute ist der 22.11.2026
- **Wenn** die laufende Woche gezeigt wird und der Nutzer eine Kachel antippt
- **Dann** ist nur die Kachel 22 umrandet und es geschieht nichts

### AK-6 Keine Auswahl „Mehrere Bücher“
- **Gegeben** die Kalenderkarte wird angezeigt
- **Wenn** sie betrachtet wird
- **Dann** gibt es kein Element „Mehrere Bücher: Ein Cover“

## Abgrenzung (nicht Teil dieses REQ)

- Auswahl „Mehrere Bücher: Ein Cover ⌄“ (entfällt laut CEO).
- Funktion beim Antippen eines Tages (vorerst keine).
- Jahreskalender (REQ-089).

## Qualitätsanforderungen

- Siehe REQ-090.

## Abhängigkeiten

- **REQ-024, REQ-010, REQ-020, REQ-080, REQ-086.**

## Offene Fragen

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-22 | Erstellt aus CEO-Festlegungen; Status „Abgestimmt“. Cover bei mehreren Büchern (letzte Sitzung des Tages) als Auslegung gekennzeichnet | Anforderungsmanager |
