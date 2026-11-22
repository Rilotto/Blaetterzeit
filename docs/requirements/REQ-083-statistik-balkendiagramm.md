---
id: REQ-083
titel: Seite „Statistik“ – Balkendiagramm je Woche, Monat und Jahr
status: Abgestimmt
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **die Verteilung meines Lesens im Zeitraum als Balken sehen**, damit **ich erkenne, wann ich viel oder wenig gelesen habe**.

CEO (2026-11-22): Balkendiagramm – Woche: Mo–So; Monat: Tage, Achse 1/8/15/22/29; Jahr: J–D; Hilfslinien mit Skala rechts. Die gewählte Kachel steuert das Diagramm (REF-statistik-07-buecher.png).

## Anforderung (Satzschablone)

- Das System muss in der Karte unter der Vergleichszeile ein Balkendiagramm für den gezeigten Zeitraum anzeigen, das den Wert der gewählten Kachel (REQ-081) je Abschnitt darstellt.
- Abschnitte und Achsenbeschriftung:
  - Woche: 7 Balken Montag bis Sonntag, beschriftet „M D M D F S S“;
  - Monat: ein Balken je Kalendertag, beschriftet nur an den Tagen 1, 8, 15, 22, 29;
  - Jahr: 12 Balken Januar bis Dezember, beschriftet „J F M A M J J A S O N D“.
- Das System muss waagerechte Hilfslinien mit ihren Skalenwerten rechts neben dem Diagramm anzeigen; kein Balken ragt über die oberste Hilfslinie hinaus.
- Ist „Seiten“ gewählt, stellt jeder Balken die Seiten des Abschnitts zweifarbig gestapelt dar (REQ-084).
- Ist „Bücher“ gewählt, stellt jeder Balken die Zahl der Bücher dar, deren „Beendet am“ im Abschnitt liegt (Zählregel wie REQ-081), einfarbig in Farbrubrik „Primär“.
- Abschnitte mit Wert 0 erscheinen als leere Grundlinie (wie REF-statistik-01).

## Akzeptanzkriterien

### AK-1 Woche
- **Gegeben** „Wöchentlich“ ist aktiv
- **Wenn** das Diagramm betrachtet wird
- **Dann** gibt es 7 Balken mit den Beschriftungen „M D M D F S S“

### AK-2 Monat
- **Gegeben** „Monatlich“, gezeigt wird November 2026
- **Wenn** das Diagramm betrachtet wird
- **Dann** gibt es 30 Balken und Beschriftungen nur bei 1, 8, 15, 22, 29

### AK-3 Jahr
- **Gegeben** „Jährlich“ ist aktiv
- **Wenn** das Diagramm betrachtet wird
- **Dann** gibt es 12 Balken mit „J F M A M J J A S O N D“

### AK-4 Bücher je Monat
- **Gegeben** „Jährlich“ 2026, ein Buch *gelesen* mit „Beendet am“ 12.10.2026, „Bücher“ gewählt
- **Wenn** das Diagramm betrachtet wird
- **Dann** hat nur der Balken „O“ den Wert 1, in „Primär“

### AK-5 Hilfslinien mit Skala
- **Gegeben** der höchste Balken des Zeitraums hat den Wert 150
- **Wenn** das Diagramm betrachtet wird
- **Dann** gibt es Hilfslinien mit Skalenwerten rechts, und die oberste Hilfslinie hat einen Wert ≥ 150

## Abgrenzung (nicht Teil dieses REQ)

- Ermittlung der Seiten und Stapelung (REQ-084).
- Antippen eines Balkens (keine Festlegung des CEO).

## Qualitätsanforderungen

- Siehe REQ-090.

## Abhängigkeiten

- **REQ-080, REQ-081, REQ-084, REQ-085.**

## Offene Fragen

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-22 | Erstellt aus CEO-Festlegungen; Status „Abgestimmt“ | Anforderungsmanager |
