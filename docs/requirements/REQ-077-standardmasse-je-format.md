---
id: REQ-077
titel: Standardmaße je Format und geschätzte Dicke aus der Seitenzahl
status: Abgestimmt
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **dass für ein Buch ohne Maße zu seinem Format passende Standardmaße verwendet werden**, damit **Buchdarstellung, 3D-Modell und Maße-Vorschlag auch ohne Messen realistisch sind**.

CEO (2026-11-21, wörtlich): „Sind keine hinterlegt, wird für das ausgewählte Format die Standardgröße hinterlegt. Gilt nicht für Hörbücher!“ Die Werte sind ein Vorschlag des Scrum Masters, vom CEO angenommen, und auf Zuruf änderbar.

## Anforderung (Satzschablone)

- Das System muss die Standardmaße je Format an einer zentralen Stelle führen. Die Werte sind auf Zuruf des CEO änderbar; konkrete Zahlen sind kein eingefrorenes Akzeptanzkriterium, eingefroren wird nur die Zuordnung Format → Standardwert.
- Startwerte (Breite × Höhe):
  - „Print · Taschenbuch“, „E-Book“, „Hörbuch“, „Print · Weiß ich nicht“, „Print“ ohne Unterformat und kein Format: 12,0 × 19,0 cm
  - „Print · Hardcover“: 14,8 × 21,0 cm, Deckelüberstand oben, unten und vorne je 3 mm
- Bei Hardcover sind Breite und Höhe (Standard wie hinterlegt) die Außenmaße der Deckel; der Buchblock ist oben, unten und vorne um den Deckelüberstand kleiner.
- Für Hörbücher gelten die Standardmaße nur für die Buchdarstellung (REQ-073) und den Maße-Vorschlag (REQ-072); eine 3D-Ansicht gibt es für Hörbücher nicht (REQ-078).
  - „Print · Kleinformat“: 10,5 × 14,8 cm
- Das System muss die Dicke, wenn keine hinterlegt ist, aus der Seitenzahl (REQ-025) schätzen:
  - „Print · Hardcover“: Seitenzahl × 0,0574 mm + 4,75 mm
  - alle übrigen Formate nach diesem REQ: Seitenzahl × 0,0572 mm + 1,5 mm
  - ohne Seitenzahl: 2,5 cm
- Das System muss geschätzte Werte für die Anzeige auf eine Nachkommastelle in cm kaufmännisch runden.
- Das System muss diese Standardmaße verwenden in: Vorschlag der Zeile „Maße“ (REQ-072), Proportionen der Buchdarstellung (REQ-073), 3D-Modell (REQ-076). Hinterlegte Einzelwerte haben stets Vorrang.

## Akzeptanzkriterien

### AK-1 Breite und Höhe je Format
- **Gegeben** Bücher ohne Maße mit „Print · Taschenbuch“, „E-Book“, „Print · Weiß ich nicht“, „Print · Hardcover“ bzw. „Print · Kleinformat“
- **Wenn** ihre Standardmaße bestimmt werden
- **Dann** sind Breite × Höhe 12,0 × 19,0 / 12,0 × 19,0 / 12,0 × 19,0 / 14,8 × 21,0 / 10,5 × 14,8 cm (mit den jeweils aktuellen Standardwerten)

### AK-6 Ohne Format, Print ohne Unterformat, Hörbuch
- **Gegeben** Bücher ohne Maße und mit 400 Seiten: ohne Format, mit „Print“ ohne Unterformat bzw. mit „Hörbuch“
- **Dann** gelten jeweils die Taschenbuch-Standardmaße 12,0 × 19,0 × 2,4 cm

### AK-7 Hardcover-Maße sind Außenmaße
- **Gegeben** ein Hardcover ohne Maße
- **Dann** sind die Deckel 14,8 × 21,0 cm groß
- **Und** der Buchblock ist in der Höhe 6 mm und in der Breite 3 mm kleiner

### AK-2 Dicke aus der Seitenzahl
- **Gegeben** ein Taschenbuch mit 400 Seiten ohne Dicke
- **Dann** ist die geschätzte Dicke 2,4 cm (400 × 0,0572 mm + 1,5 mm = 24,38 mm)
- **Gegeben** ein Hardcover mit 400 Seiten ohne Dicke
- **Dann** ist die geschätzte Dicke 2,8 cm (400 × 0,0574 mm + 4,75 mm = 27,71 mm)

### AK-3 Ohne Seitenzahl
- **Gegeben** ein Buch ohne Seitenzahl und ohne Dicke
- **Dann** ist die geschätzte Dicke 2,5 cm

### AK-4 Hinterlegte Werte haben Vorrang
- **Gegeben** ein Hardcover mit hinterlegter Höhe 24,0 und sonst ohne Maße
- **Dann** gelten Breite 14,8, Höhe 24,0 und die geschätzte Dicke

### AK-5 Formatwechsel
- **Gegeben** ein Buch ohne Maße mit „Print · Taschenbuch“
- **Wenn** der Nutzer das Format auf „Print · Hardcover“ ändert und sichert (REQ-058)
- **Dann** gelten ab sofort die Standardmaße für Hardcover

## Abgrenzung (nicht Teil dieses REQ)

- 3D-Modell für Hörbücher (REQ-078, To-do-Liste).

## Qualitätsanforderungen

- Keine.

## Abhängigkeiten

- REQ-025 (Seitenzahl), REQ-058 (Format), REQ-072, REQ-073, REQ-076.

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-21 | Erstellt aus vom CEO angenommenem Vorschlag des Scrum Masters. Status „Entwurf“, weil drei Lücken offen sind (siehe Offene Fragen) | Anforderungsmanager |
| 2026-11-21 | CEO-Antworten (wörtlich): 1. „Wie ein Taschenbuch, guter Vorschlag!“ (kein Format / Print ohne Unterformat → Taschenbuch); 2. „ja, lass uns auch ein Taschenbuchformat nehmen“ (Hörbuch → Taschenbuch für 2D und Vorschlag); 3. „dein Vorschlag klingt gut, machen wir so“ (Hardcover-Maße = Außenmaße der Deckel). Neu AK-6, AK-7. Offene Fragen leer. Status „Abgestimmt“ | Anforderungsmanager |
