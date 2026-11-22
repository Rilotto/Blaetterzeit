---
id: REQ-081
titel: Seite „Statistik“ – Kacheln „Seiten“ und „Bücher“ mit großer Kennzahl
status: Abgestimmt
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **auf einen Blick sehen, wie viele Seiten ich im Zeitraum gelesen und wie viele Bücher ich beendet habe**, damit **ich meinen Lesefortschritt einschätzen kann**.

CEO (2026-11-22): Kacheln nur „Seiten“ und „Bücher“, „Zeit“ entfällt, die Kacheln verteilen sich auf die volle Breite. Die gewählte Kachel steuert das Diagramm (REF-statistik-07-buecher.png). „Seiten“: große Zahl + „Seiten“. „Bücher“: Zahl der beendeten Bücher + „beendet“.

## Anforderung (Satzschablone)

- Das System muss in einer Karte unter dem Zeitraum-Titel genau zwei Kacheln „Seiten“ und „Bücher“ nebeneinander anzeigen, die zusammen die volle Breite der Karte einnehmen; jede Kachel zeigt ihren Wert für den gezeigten Zeitraum und darunter ihre Bezeichnung.
- Das System muss genau eine Kachel als gewählt hervorheben (wie REF-statistik-01/07). Antippen einer Kachel wählt sie.
- Das System muss unter den Kacheln die Kennzahl der gewählten Kachel groß anzeigen: bei „Seiten“ die Seitenzahl mit „Seiten“, bei „Bücher“ die Zahl der beendeten Bücher mit „beendet“.
- Der Wert „Seiten“ ist die Summe aus „Seiten in Sessions“ und „Seiten aus beendeten Büchern“ des Zeitraums (REQ-084).
- Der Wert „Bücher“ ist die Anzahl der Bücher, deren „Beendet am“ (REQ-085) im Zeitraum liegt und deren Lesestatus *gelesen* ist (Auslegung des Anforderungsmanagers: ein Buch, das nicht mehr *gelesen* ist, gilt nicht als beendet).
- Beim Öffnen der Seite ist „Seiten“ gewählt (Auslegung nach REF-statistik-01).

## Akzeptanzkriterien

### AK-1 Zwei Kacheln, keine „Zeit“
- **Gegeben** die Seite „Statistik“ ist geöffnet
- **Wenn** die Karte betrachtet wird
- **Dann** gibt es genau die Kacheln „Seiten“ und „Bücher“, keine Kachel „Zeit“, und beide zusammen füllen die Kartenbreite

### AK-2 Kennzahl „Seiten“
- **Gegeben** im gezeigten Jahr wurden 608 Seiten gezählt (REQ-084) und „Seiten“ ist gewählt
- **Wenn** die Karte betrachtet wird
- **Dann** zeigt die Kachel „608“ und darunter steht groß „608“ mit „Seiten“

### AK-3 Kennzahl „Bücher“
- **Gegeben** im gezeigten Jahr hat genau ein Buch mit Status *gelesen* ein „Beendet am“ im Jahr
- **Wenn** der Nutzer die Kachel „Bücher“ antippt
- **Dann** ist „Bücher“ hervorgehoben und groß steht „1“ mit „beendet“

### AK-4 Buch außerhalb des Zeitraums zählt nicht
- **Gegeben** ein Buch mit Status *gelesen* und „Beendet am“ 31.10.2026
- **Wenn** „Monatlich“ mit „November“ / 2026 gezeigt wird
- **Dann** zeigt die Kachel „Bücher“ 0

## Abgrenzung (nicht Teil dieses REQ)

- Kachel und Messung „Zeit“ (entfällt laut CEO).
- Vergleichszeile (REQ-082), Diagramm (REQ-083, REQ-084).

## Qualitätsanforderungen

- Siehe REQ-090.

## Abhängigkeiten

- **REQ-080, REQ-084, REQ-085, REQ-008** (Lesestatus).

## Offene Fragen

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-22 | Erstellt aus CEO-Festlegungen; Status „Abgestimmt“. Bedingung Status *gelesen* und Startkachel „Seiten“ als Auslegung gekennzeichnet | Anforderungsmanager |
