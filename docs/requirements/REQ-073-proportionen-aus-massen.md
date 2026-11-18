---
id: REQ-073
titel: Buchdarstellung – Proportionen von Cover, Rücken und Schnitt aus den Maßen
status: Abgestimmt
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **dass die Buchdarstellung die echten Maße meines Buches widerspiegelt, ein dickes Buch also einen dicken Rücken hat**, damit **das Buch realistisch aussieht und später ein 3D-Modell darauf aufbauen kann**.

CEO (2026-11-18, wörtlich): „Kannst du dies auch bitte bei den Proportionen bei der Cover und Seitendarstellung des Buches berücksichtigen? Dass dickere Bücher auch deren Buchrücken dicker dargestellt wird. Ist mir wichtig, ich möchte später noch ein 3D Modell als Funktionalität einfügen.“ Bestätigung: „B passt für mich. Konzept 1 auch.“

Erweitert REQ-014 (Buchdarstellung). Anordnung, Beschriftungen, Farben und Bildanzeige aus REQ-014 bleiben erhalten; es ändert sich nur, dass die Proportionen nicht mehr fest sind, sondern aus den Maßen (REQ-072) folgen.

## Anforderung (Satzschablone)

- Das System muss Cover, Buchrücken und Schnitt in den Buchdetails (REQ-013, REQ-014) im selben Maßstab darstellen:
  - Cover: Seitenverhältnis Breite : Höhe des Buches.
  - Buchrücken und Schnitt: Breite entsprechend der Dicke, Höhe gleich der Coverhöhe.
- Das System muss für fehlende Maße Standardwerte verwenden: Breite 13,5 cm, Höhe 21 cm, Dicke 2,5 cm. Fehlt nur ein Einzelwert, ersetzt das System nur diesen durch seinen Standardwert.
- Das System muss die Standardwerte an einer zentralen Stelle führen. Sie sind auf Zuruf des CEO änderbar und kein Akzeptanzkriterium.
- Das System muss hinterlegte Bilder von Cover, Buchrücken und Schnitt in die jeweils aktuelle Form einpassen.
- Wenn sich die Maße ändern (REQ-072), muss das System die Darstellung beim nächsten Anzeigen der Buchdetails mit den neuen Proportionen zeigen.
- Das System muss beim Zuschnitt (REQ-017) als Startrahmen das Seitenverhältnis des jeweiligen Zielbereichs nach diesem REQ verwenden.

## Akzeptanzkriterien

### AK-1 Proportionen aus vollständigen Maßen
- **Gegeben** ein Buch mit Breite 12, Höhe 18, Dicke 4
- **Wenn** seine Buchdetails angezeigt werden
- **Dann** verhält sich die Coverbreite zur Coverhöhe wie 12 : 18
- **Und** Buchrücken und Schnitt sind so hoch wie das Cover und verhalten sich in der Breite zur Coverbreite wie 4 : 12

### AK-2 Dickeres Buch, dickerer Rücken
- **Gegeben** zwei Bücher mit gleicher Breite und Höhe, Dicke 2 bzw. 5
- **Wenn** ihre Buchdetails nacheinander angezeigt werden
- **Dann** sind Buchrücken und Schnitt beim Buch mit Dicke 5 im Verhältnis zur Coverbreite breiter

### AK-3 Standardproportion ohne Maße
- **Gegeben** ein Buch ohne Maße
- **Wenn** seine Buchdetails angezeigt werden
- **Dann** entsprechen die Proportionen 13,5 × 21 × 2,5

### AK-4 Fehlender Einzelwert
- **Gegeben** ein Buch nur mit Dicke 5
- **Wenn** seine Buchdetails angezeigt werden
- **Dann** entsprechen die Proportionen 13,5 × 21 × 5

### AK-5 Bilder eingepasst
- **Gegeben** ein Buch mit hinterlegten Bildern für Cover, Rücken und Schnitt
- **Wenn** seine Maße geändert werden und die Buchdetails erneut angezeigt werden
- **Dann** füllen die Bilder die neuen Formen aus

### AK-6 Startrahmen im Zuschnitt
- **Gegeben** ein Buch mit Maßen
- **Wenn** der Nutzer über einen Bereich ein Bild aufnimmt oder auswählt
- **Dann** hat der Startrahmen im Zuschnitt das Seitenverhältnis dieses Bereichs nach AK-1

## Abgrenzung (nicht Teil dieses REQ)

- 3D-Modell des Buches (To-do-Liste, Could).
- Proportionen in Buchlisten und Cover-Platzhaltern (REQ-009, REQ-010, REQ-020) bleiben einheitlich.

## Qualitätsanforderungen

- Keine.

## Abhängigkeiten

- REQ-014 (wird erweitert; die dortige Orientierung „Cover ≈ 2:3, Rücken/Schnitt ca. 98 px“ wird durch die Proportionen aus Maßen bzw. Standardwerten abgelöst; AK-1 von REQ-014 bleibt bei üblichen Buchmaßen erfüllt).
- REQ-017 (Startrahmen), REQ-072 (Maße).

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-18 | Erstellt aus CEO-Wunsch und vom CEO bestätigtem Konzept. Status „Abgestimmt“ | Anforderungsmanager |
