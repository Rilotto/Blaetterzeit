---
id: REQ-014
titel: Buchdetails – Buchdarstellung mit Buchrücken, Cover und Schnitt
status: Entwurf
prioritaet: offen
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **in den Buchdetails mein Buch grafisch mit Buchrücken, Cover und Schnitt dargestellt sehen**, damit **das Buch so erscheint, wie es physisch aussieht**.

Vorgabe des CEO (wörtlich, Auszug, 2026-11-09): „Wir haben wie im Screenshot drei Bereiche, welche das Buch grafisch darstellen sollen. Ist kein Cover hinterlegt, erscheint erstmal nur der Buchtitel (in Hintergrundfarbe) auf dem bordeauxfarbenen Hintergrund. Die Anordnung der abgerundeten Rechtecke sollen wie auf dem Screenshot sein. Ebenso auch deren Beschriftung (Format wie "alle ansehen" bei "noch zu lesen" nur 90 Grad gedreht und mit dem "+").“

Antworten des CEO (wörtlich, 2026-11-09):
- „Das Verhältnis ist wie ein normales Buch eben. Schau dir das bitte im Screenshot ab. Die Beschriftung und der Titel der Rechtecke werden überschrieben. Normal geschrieben bitte, ein langer Titel bekommt seinen vollen Platz im Cover selbst, wenn kein Foto hinterlegt ist (aber bitte innerhalb des Rechteckes für das Cover), darunter wird der Titel maximal zweizeilig dargestellt.“
- „Die Primärfarbe, die Rechtecke haben Ghost (Fläche) und GhostFrame (Rahmen) […]“

Referenzbild: [referenzen/REF-buchdetails-01.png](referenzen/REF-buchdetails-01.png) (nur bis einschließlich Buchtitel). Die optische Übereinstimmung prüft der CEO im Prototyp; sie ist kein Akzeptanzkriterium.

## Anforderung (Satzschablone)

**Anordnung und Seitenverhältnis**
- Das System muss im Fenster „Buchdetails“ (REQ-013) die Buchdarstellung aus drei Bereichen in Form abgerundeter Rechtecke darstellen: links den Bereich „Buchrücken“, in der Mitte den Bereich „Cover“, rechts den Bereich „Schnitt“.
- Das System muss die drei Bereiche nebeneinander und gleich hoch darstellen; „Buchrücken“ und „Schnitt“ schmaler als „Cover“.
- Das System muss den Bereich „Cover“ im Seitenverhältnis eines normalen Buches hochformatig darstellen (CEO: „wie ein normales Buch eben“). Orientierung aus dem Referenzbild: Cover ca. 525 × 787 px (≈ 2:3), Buchrücken und Schnitt je ca. 98 × 787 px; kein Akzeptanzkriterium.

**Beschriftung der schmalen Bereiche**
- Solange im Bereich „Buchrücken“ kein Bild hinterlegt ist, muss das System darin die Beschriftung „Buchrücken +“ darstellen; für den Bereich „Schnitt“ entsprechend „Schnitt +“.
- Das System muss diese Beschriftungen in normaler Schreibweise darstellen, nicht in Großbuchstaben (CEO: „Normal geschrieben bitte“).
- Das System muss diese Beschriftungen um 90 Grad gedreht darstellen (Leserichtung wie im Referenzbild: von unten nach oben, „+“ am oberen Ende).
- Das System muss diese Beschriftungen im selben Format (Schriftgröße, Schriftstärke, Schriftstil, Farbe) wie den Text „Alle ansehen ›“ (REQ-009) darstellen.

**Cover ohne Bild**
- Solange im Bereich „Cover“ kein Bild hinterlegt ist, muss das System den Bereich als Fläche in der Farbrubrik „Primär“ mit dem Buchtitel darin darstellen (Lage des Titels: Orientierung Referenzbild, oben links).
- Das System muss diesen Buchtitel in der Farbrubrik „Hintergrund“ darstellen (CEO: „in Hintergrundfarbe“).
- Das System muss diesen Buchtitel vollständig, bei Bedarf umgebrochen, innerhalb des Rechtecks des Bereichs „Cover“ darstellen; er darf weder abgeschnitten werden noch über das Rechteck hinausragen.
- Das System darf im Bereich „Cover“ ohne Bild nichts außer dem Buchtitel darstellen (CEO: „nur der Buchtitel“).

**Schmale Bereiche ohne Bild**
- Solange in den Bereichen „Buchrücken“ bzw. „Schnitt“ kein Bild hinterlegt ist, muss das System sie mit einer Fläche in der Farbrubrik „Ghost“ und einem gestrichelten Rahmen in der Farbrubrik „GhostFrame“ darstellen.

**Mit Bild**
- Wenn für einen Bereich ein Bild hinterlegt ist (REQ-016, REQ-017), muss das System dieses Bild in dem Bereich darstellen.
- Wenn für einen Bereich ein Bild hinterlegt ist, darf das System in diesem Bereich die Beschriftung („Buchrücken +“, „Schnitt +“) bzw. den Buchtitel auf der Coverfläche nicht mehr darstellen (CEO: „werden überschrieben“).

**Farben**
- Das System muss alle Farben dieses REQ über Farbrollen aus zentralen Farbrubriken beziehen (REQ-002; CLAUDE.md „Farben auf Zuruf“). Konkrete Farbwerte sind kein Akzeptanzkriterium.

| Farbrolle | Element | Farbrubrik | Aussage des CEO |
|---|---|---|---|
| Buchdetails-Coverfläche | Coverfläche ohne Bild | Primär | „Die Primärfarbe“ |
| Buchdetails-Covertitel | Buchtitel auf der Coverfläche ohne Bild | Hintergrund | „in Hintergrundfarbe“ |
| Bereichsfläche | Fläche „Buchrücken“, „Schnitt“ ohne Bild | Ghost | „Ghost (Fläche)“ |
| Bereichsrahmen | gestrichelter Rahmen „Buchrücken“, „Schnitt“ ohne Bild | GhostFrame | „GhostFrame (Rahmen)“ |
| Bereichsbeschriftung | „Buchrücken +“, „Schnitt +“ | Primär (wie „Alle ansehen ›“, REQ-009) | „Format wie "alle ansehen"“ |

## Akzeptanzkriterien

### AK-1 Drei Bereiche in fester Anordnung
- **Gegeben** das Fenster „Buchdetails“ wird angezeigt
- **Wenn** die Buchdarstellung betrachtet wird
- **Dann** stehen nebeneinander von links nach rechts die Bereiche „Buchrücken“, „Cover“ und „Schnitt“
- **Und** alle drei sind gleich hoch
- **Und** „Buchrücken“ und „Schnitt“ sind schmaler als „Cover“
- **Und** der Bereich „Cover“ ist höher als breit

### AK-2 Gedrehte Beschriftungen mit „+“ in normaler Schreibweise
- **Gegeben** ein Buch ohne Bilder für Buchrücken und Schnitt
- **Wenn** die Buchdetails angezeigt werden
- **Dann** steht im Bereich „Buchrücken“ die Beschriftung „Buchrücken +“ und im Bereich „Schnitt“ die Beschriftung „Schnitt +“, jeweils in dieser Schreibweise (nicht in Großbuchstaben)
- **Und** beide sind um 90 Grad gedreht

### AK-3 Format wie „Alle ansehen ›“
- **Gegeben** die Buchdetails zeigen die Beschriftungen „Buchrücken +“ und „Schnitt +“
- **Wenn** Schriftgröße, Schriftstärke, Schriftstil und Farbe mit „Alle ansehen ›“ (REQ-009) verglichen werden
- **Dann** stimmen sie überein

### AK-4 Cover ohne Bild: nur der Titel auf Primär-Fläche
- **Gegeben** ein Buch ohne Bild im Bereich „Cover“
- **Wenn** seine Buchdetails angezeigt werden
- **Dann** zeigt der Bereich „Cover“ eine Fläche in der Farbe der Farbrubrik „Primär“ mit dem Buchtitel
- **Und** der Buchtitel ist in der Farbe der Farbrubrik „Hintergrund“ dargestellt
- **Und** der Bereich zeigt kein Herz-Icon und kein anderes Bild

### AK-5 Langer Titel vollständig innerhalb der Coverfläche
- **Gegeben** ein Buch ohne Bild im Bereich „Cover“, dessen Titel nicht in eine Zeile passt
- **Wenn** seine Buchdetails angezeigt werden
- **Dann** ist der Titel auf der Coverfläche vollständig und ohne Auslassungspunkte dargestellt
- **Und** er liegt vollständig innerhalb des Rechtecks des Bereichs „Cover“

### AK-6 Schmale Bereiche ohne Bild: Ghost mit gestricheltem GhostFrame
- **Gegeben** ein Buch ohne Bilder für Buchrücken und Schnitt
- **Wenn** die Buchdetails angezeigt werden
- **Dann** sind die Flächen von „Buchrücken“ und „Schnitt“ in der Farbe der Farbrubrik „Ghost“ dargestellt
- **Und** ihre Rahmen gestrichelt in der Farbe der Farbrubrik „GhostFrame“

### AK-7 Hinterlegtes Bild ersetzt Beschriftung bzw. Titel
- **Gegeben** für einen der drei Bereiche ist ein Bild hinterlegt
- **Wenn** die Buchdetails angezeigt werden
- **Dann** zeigt dieser Bereich das hinterlegte Bild
- **Und** die Beschriftung bzw. der Buchtitel dieses Bereichs wird darin nicht mehr dargestellt
- **Und** die übrigen Bereiche ohne Bild sind unverändert

### AK-8 Farben aus zentralen Farbrubriken
- **Gegeben** der Wert der Farbrubrik einer Farbrolle dieses REQ wird an der zentralen Stelle geändert
- **Wenn** die Buchdetails angezeigt werden
- **Dann** sind alle Elemente mit dieser Farbrolle im geänderten Wert dargestellt

## Abgrenzung (nicht Teil dieses REQ)

- Auswahlmenü beim Antippen eines Bereichs (REQ-015), Bild aufnehmen/auswählen (REQ-016), Zuschnitt (REQ-017), dauerhafte Speicherung (REQ-019).
- Buchtitel unter der Buchdarstellung (REQ-018).
- Darstellung in den Buchlisten: Cover-Platzhalter (REQ-010) bzw. Frontcover (REQ-020). Die Primär-Fläche mit Titel gilt nur in den Buchdetails.

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-008:** Buchdaten; bisher genau ein optionales Buchcover je Buch. Bilder für Buchrücken und Schnitt sind eine Erweiterung der Buchdaten (laut REQ-008 vorgesehen).
- **REQ-009:** Format und Farbe von „Alle ansehen ›“.
- **REQ-006:** Farbrubriken „Ghost“ und „GhostFrame“.
- **REQ-013:** Fenster „Buchdetails“.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

- Priorität.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-09 | Erstellt (Entwurf aus der CEO-Beschreibung „Buchdetails“ Teil 1) | Anforderungsmanager |
| 2026-11-09 | CEO-Antworten 5 und 7 eingearbeitet: Seitenverhältnis wie ein Buch (Orientierung Referenzbild), normale Schreibweise, Bild ersetzt Beschriftung/Titel (AK-7), langer Titel vollständig im Cover-Rechteck (neu AK-5), Farben Primär / Ghost / GhostFrame (neu AK-6). Offen: Priorität | Anforderungsmanager |
