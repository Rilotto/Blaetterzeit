---
id: REQ-077
titel: Standardmaße je Format und geschätzte Dicke aus der Seitenzahl
status: In Umsetzung
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

**Nach dem Barcode-Scan**
- CEO (wörtlich, 2026-11-25): „wenn die Maße eines Buches nicht online verfügbar sind, sollen bitte die Standardmaße eines Taschenbuches verwendet werden. Wenn online abrufbar ist, ob der gescannte Code ein Taschenbuch oder Hardcover ist, sollen jeweils dafür entsprechende Standardwerte hergenommen werden.“
- Liefert die Online-Abfrage keine Maße, muss das System für das über den Scan angelegte Buch die Standardmaße des übernommenen Formats verwenden (REQ-062: Taschenbuch bzw. Hardcover), ohne Format die des Taschenbuchs. Das gilt schon im vorbefüllten Manuellen Eintrag und danach in den Buchdetails.
- Online gefundene Maße haben Vorrang (REQ-072). Fehlt nur ein Einzelwert, gilt dafür der Standardwert.
- Die Standardmaße werden wie bisher verwendet, aber nicht als hinterlegte Maße gespeichert (REQ-072: Schätzwerte nie selbsttätig speichern; **Auslegung**). Ändert der Nutzer später das Format, gelten die Standardmaße des neuen Formats (AK-5).

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

### AK-8 Scan ohne Maße, mit Format Hardcover
- **Gegeben** ein Scan-Treffer mit Formatangabe „Hardcover“, 400 Seiten und ohne Maße
- **Wenn** der Nutzer den Treffer antippt
- **Dann** zeigt der Manuelle Eintrag bei „Format“ „Print · Hardcover“ und bei „Maße“ den Vorschlag „ca. 14,8 × 21,0 × 2,8 cm“
- **Und** nach „Hinzufügen“ zeigt die Zeile „Maße“ der Buchdetails denselben Vorschlag, die Buchdarstellung verwendet diese Maße, und es sind keine Maße gespeichert

### AK-9 Scan ohne Maße, mit Format Taschenbuch bzw. ohne Format
- **Gegeben** ein Scan-Treffer mit Formatangabe „Paperback“ bzw. ohne Formatangabe, jeweils mit 400 Seiten und ohne Maße
- **Wenn** der Nutzer den Treffer antippt
- **Dann** zeigt der Manuelle Eintrag bei „Maße“ jeweils den Vorschlag „ca. 12,0 × 19,0 × 2,4 cm“

### AK-10 Online gefundene Maße haben Vorrang
- **Gegeben** ein Scan-Treffer mit Formatangabe „Hardcover“, 400 Seiten und der gelieferten Höhe 24,0 cm
- **Wenn** der Nutzer den Treffer antippt und das Buch anlegt
- **Dann** ist nur die Höhe 24,0 gespeichert, und für Breite und Dicke gelten die Hardcover-Standardwerte 14,8 und 2,8 (nicht gespeichert)
- **Und** die Zeile „Maße“ der Buchdetails zeigt abgeschwächt bzw. kursiv „ca. 14,8 × 24,0 × 2,8 cm“ (REQ-072 AK-2; **Auslegung**)

## Abgrenzung (nicht Teil dieses REQ)

- 3D-Modell für Hörbücher (REQ-078, To-do-Liste).

## Qualitätsanforderungen

- Keine.

## Abhängigkeiten

- REQ-025 (Seitenzahl), REQ-058 (Format), REQ-072, REQ-073, REQ-076.
- REQ-062 (Barcode-Scan, Zuordnung der Formatangabe, AK-10 dort).

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-21 | Erstellt aus vom CEO angenommenem Vorschlag des Scrum Masters. Status „Entwurf“, weil drei Lücken offen sind (siehe Offene Fragen) | Anforderungsmanager |
| 2026-11-21 | CEO-Antworten (wörtlich): 1. „Wie ein Taschenbuch, guter Vorschlag!“ (kein Format / Print ohne Unterformat → Taschenbuch); 2. „ja, lass uns auch ein Taschenbuchformat nehmen“ (Hörbuch → Taschenbuch für 2D und Vorschlag); 3. „dein Vorschlag klingt gut, machen wir so“ (Hardcover-Maße = Außenmaße der Deckel). Neu AK-6, AK-7. Offene Fragen leer. Status „Abgestimmt“ | Anforderungsmanager |
| 2026-11-25 | Fehler: Nach dem Barcode-Scan griffen die Standardmaße nicht. Standardmaße des übernommenen Formats (ohne Format Taschenbuch) schon im Manuellen Eintrag und danach, online gefundene Maße mit Vorrang, nicht gespeichert (Auslegung). CEO (wörtlich): „wenn die Maße eines Buches nicht online verfügbar sind, sollen bitte die Standardmaße eines Taschenbuches verwendet werden. Wenn online abrufbar ist, ob der gescannte Code ein Taschenbuch oder Hardcover ist, sollen jeweils dafür entsprechende Standardwerte hergenommen werden.“ Anforderung ergänzt, AK-8 bis AK-10 neu. Beauftragt (wörtlich): „okay, setze bitte Sprint 11 um als Prototypen“. Status „Abgestimmt“ | Anforderungsmanager |
| 2026-11-25 | Konflikt mit REQ-072 AK-2 („– × 24,0 × – cm“) zugunsten dieses neueren Wunsches gelöst. **Auslegung:** Ergänzung fehlender Einzelwerte gilt überall, wo Maße verwendet werden (Zeile, Buchdarstellung, 3D), aber nie gespeichert; in der Zeile mit „ca.“ und abgeschwächt bzw. kursiv wie der bisherige Vorschlag. AK-10 präzisiert (Anzeige ergänzt). Status unverändert | Anforderungsmanager |
