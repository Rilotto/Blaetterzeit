---
id: REQ-076
titel: 3D-Ansicht – Gestalt des Modells aus Maßen, Format und Bildern
status: In Umsetzung
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **dass das 3D-Modell mein Buch mit seinen Maßen und hinterlegten Bildern zeigt**, damit **es wie mein echtes Exemplar aussieht**.

CEO (2026-11-21, wörtlich): „Wenn Bilder von Cover oder Seitenansichten hinterlegt sind, sollen diese angezeigt werden. Für die Seiten im Buch gibts bei fehlendem Farbschnitt ein Standard Muster (senkrechte Linien, welche die Seiten imitieren). […] Das 3D Modell berücksichtigt ebenso im Maßstab und in der Ansicht die hinterlegten Maße des Buches. Sind keine hinterlegt, wird für das ausgewählte Format die Standardgröße hinterlegt. Gilt nicht für Hörbücher!“

Antworten des CEO (2026-11-21, über den Scrum Master): Rückseite, Rücken und Cover ohne Bild in der Farbrubrik „Primär“; fehlt das Coverbild, steht auf dem Cover der Titel. Ober- und Unterkante der Seiten imitieren ebenfalls Buchseiten (Linienmuster). Schnitt: Schnittbild, falls vorhanden, sonst das Muster. Hardcover sieht anders aus, mit überstehenden Deckeln, in den richtigen Proportionen. E-Books werden wie Taschenbücher behandelt.

## Anforderung (Satzschablone)

**Maße**
- Das System muss das Modell als Quader mit Breite, Höhe und Dicke des Buches in deren Verhältnis zueinander darstellen. Hinterlegte Maße (REQ-072) haben Vorrang; fehlende Einzelwerte ersetzt das System durch die Standardmaße des Formats (REQ-077).

**Flächen**
- Das System muss auf der Vorderseite das hinterlegte Coverbild (REQ-014, REQ-019) zeigen; ohne Coverbild eine Fläche in „Primär“ mit dem Buchtitel wie im Bereich „Cover“ der Buchdarstellung (REQ-014).
- Das System muss auf dem Buchrücken das hinterlegte Rückenbild zeigen; ohne Bild eine Fläche in „Primär“.
- Das System muss die Rückseite als Fläche in „Primär“ darstellen.
- Das System muss auf dem Schnitt (der dem Rücken gegenüberliegenden Seitenfläche) das hinterlegte Schnittbild zeigen; ohne Bild das Seitenmuster.
- Das System muss Ober- und Unterkante des Buchblocks mit dem Seitenmuster darstellen.
- Das System muss die Farbe „Primär“ aus der zentralen Farbrubrik beziehen, sodass ein anderes Farbdesign (REQ-068) sie mitändert.

**Format**
- Bei Format „Print · Hardcover“ muss das System Vorder- und Rückdeckel sowie Rücken als Deckel darstellen, die den Buchblock oben, unten und vorne um den Deckelüberstand (REQ-077) überragen.
- Bei allen anderen Formaten außer „Hörbuch“ muss das System das Modell als Taschenbuch darstellen, d. h. ohne Überstand; „E-Book“ wird wie „Taschenbuch“ behandelt.

## Akzeptanzkriterien

### AK-1 Proportionen aus hinterlegten Maßen
- **Gegeben** ein Taschenbuch mit Breite 12, Höhe 18, Dicke 4
- **Wenn** die 3D-Ansicht geöffnet ist
- **Dann** verhalten sich Breite, Höhe und Dicke des Modells wie 12 : 18 : 4

### AK-2 Standardmaße ohne hinterlegte Maße
- **Gegeben** ein Buch ohne Maße mit Format „Print · Kleinformat“ und 300 Seiten
- **Wenn** die 3D-Ansicht geöffnet ist
- **Dann** entsprechen die Proportionen den Standardmaßen für Kleinformat und 300 Seiten nach REQ-077

### AK-3 Bilder auf den Flächen
- **Gegeben** ein Buch mit Bildern für Cover, Buchrücken und Schnitt
- **Wenn** das Modell gedreht wird
- **Dann** zeigen Vorderseite, Rücken und Schnitt das jeweilige Bild
- **Und** Rückseite ist „Primär“, Ober- und Unterkante zeigen das Seitenmuster

### AK-4 Flächen ohne Bilder
- **Gegeben** ein Buch ohne Bilder mit Titel „Der Hobbit“
- **Wenn** das Modell gedreht wird
- **Dann** sind Vorderseite (mit „Der Hobbit“), Rücken und Rückseite in „Primär“
- **Und** Schnitt, Ober- und Unterkante zeigen das Seitenmuster

### AK-5 Hardcover mit überstehenden Deckeln
- **Gegeben** ein Buch mit Format „Print · Hardcover“
- **Wenn** das Modell betrachtet wird
- **Dann** überragen die Deckel den Buchblock oben, unten und vorne
- **Gegeben** dasselbe Buch mit Format „Print · Taschenbuch“
- **Dann** gibt es keinen Überstand

### AK-6 E-Book wie Taschenbuch
- **Gegeben** ein Buch mit Format „E-Book“ ohne Maße
- **Wenn** die 3D-Ansicht geöffnet ist
- **Dann** sieht das Modell aus wie bei demselben Buch mit „Print · Taschenbuch“

### AK-7 Farbdesign
- **Gegeben** ein Buch ohne Bilder
- **Wenn** der Nutzer ein anderes Farbdesign wählt und die 3D-Ansicht öffnet
- **Dann** haben Vorderseite, Rücken und Rückseite die Farbe „Primär“ des neuen Designs

## Abgrenzung (nicht Teil dieses REQ)

- Hörbücher (REQ-078, To-do-Liste).
- Bild der Rückseite (es gibt kein solches Bild).
- Konkrete Gestaltung des Seitenmusters über „Linien, welche die Seiten imitieren“ hinaus; der CEO prüft sie im Prototyp.

## Qualitätsanforderungen

- Keine.

## Abhängigkeiten

- REQ-014, REQ-019 (Bilder), REQ-058 (Format), REQ-068, REQ-072, REQ-074, REQ-075, REQ-077.

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-21 | Erstellt aus CEO-Beschreibung und CEO-Antworten (über den Scrum Master); Inhalt vom CEO bestätigt. Status „Abgestimmt“ | Anforderungsmanager |
