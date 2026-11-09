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

Referenzbild: [referenzen/REF-buchdetails-01.png](referenzen/REF-buchdetails-01.png) (nur bis einschließlich Buchtitel). Die optische Übereinstimmung prüft der CEO im Prototyp; sie ist kein Akzeptanzkriterium.

## Anforderung (Satzschablone)

**Anordnung**
- Das System muss im Fenster „Buchdetails“ (REQ-013) die Buchdarstellung aus drei Bereichen in Form abgerundeter Rechtecke darstellen: links den Bereich „Buchrücken“, in der Mitte den Bereich „Cover“, rechts den Bereich „Schnitt“.
- Das System muss die drei Bereiche nebeneinander und gleich hoch darstellen; „Buchrücken“ und „Schnitt“ schmaler als „Cover“ (Orientierung: Referenzbild).

**Beschriftung der schmalen Bereiche**
- Solange im Bereich „Buchrücken“ kein Bild hinterlegt ist, muss das System darin die Beschriftung „Buchrücken +“ darstellen; für den Bereich „Schnitt“ entsprechend „Schnitt +“.
- Das System muss diese Beschriftungen um 90 Grad gedreht darstellen (Leserichtung wie im Referenzbild: von unten nach oben, „+“ am oberen Ende).
- Das System muss diese Beschriftungen im selben Format wie den Text „Alle ansehen ›“ (REQ-009) darstellen.

**Cover ohne Bild**
- Solange im Bereich „Cover“ kein Bild hinterlegt ist, muss das System den Bereich als bordeauxfarbene Fläche mit dem Buchtitel darin darstellen (Lage des Titels: Orientierung Referenzbild, oben links).
- Das System muss diesen Buchtitel in der Farbe der Farbrubrik „Hintergrund“ darstellen (CEO: „in Hintergrundfarbe“).
- Das System darf im Bereich „Cover“ der Buchdetails dabei nichts außer dem Buchtitel darstellen (CEO: „nur der Buchtitel“).

**Mit Bild**
- Wenn für einen Bereich ein Bild hinterlegt ist (REQ-016, REQ-017), muss das System dieses Bild in dem Bereich darstellen.

**Farben**
- Das System muss alle Farben dieses REQ über Farbrollen aus zentralen Farbrubriken beziehen (REQ-002; CLAUDE.md „Farben auf Zuruf“). Konkrete Farbwerte sind kein Akzeptanzkriterium.

| Farbrolle | Element | Farbrubrik | Aussage des CEO |
|---|---|---|---|
| Buchdetails-Covertitel | Buchtitel auf der Coverfläche ohne Bild | Hintergrund | „in Hintergrundfarbe“ |
| Buchdetails-Coverfläche | Coverfläche ohne Bild | offen | „bordeauxfarbener Hintergrund“ |
| Bereichsbeschriftung | „Buchrücken +“, „Schnitt +“ | offen (Format wie „Alle ansehen ›“) | „Format wie "alle ansehen"“ |
| Fläche / Rahmen schmale Bereiche | „Buchrücken“, „Schnitt“ ohne Bild | offen | – |

## Akzeptanzkriterien

### AK-1 Drei Bereiche in fester Anordnung
- **Gegeben** das Fenster „Buchdetails“ wird angezeigt
- **Wenn** die Buchdarstellung betrachtet wird
- **Dann** stehen nebeneinander von links nach rechts die Bereiche „Buchrücken“, „Cover“ und „Schnitt“
- **Und** alle drei sind gleich hoch
- **Und** „Buchrücken“ und „Schnitt“ sind schmaler als „Cover“

### AK-2 Gedrehte Beschriftungen mit „+“
- **Gegeben** ein Buch ohne Bilder für Buchrücken und Schnitt
- **Wenn** die Buchdetails angezeigt werden
- **Dann** steht im Bereich „Buchrücken“ die Beschriftung „Buchrücken +“ und im Bereich „Schnitt“ die Beschriftung „Schnitt +“
- **Und** beide sind um 90 Grad gedreht

### AK-3 Format wie „Alle ansehen ›“
- **Gegeben** die Buchdetails zeigen die Beschriftungen „Buchrücken +“ und „Schnitt +“
- **Wenn** Schriftgröße, Schriftstärke und Farbe mit „Alle ansehen ›“ (REQ-009) verglichen werden
- **Dann** stimmen sie überein

### AK-4 Cover ohne Bild: nur der Titel auf bordeauxfarbener Fläche
- **Gegeben** ein Buch ohne Buchcover
- **Wenn** seine Buchdetails angezeigt werden
- **Dann** zeigt der Bereich „Cover“ eine Fläche in der Farbe der Farbrolle „Buchdetails-Coverfläche“ mit dem Buchtitel
- **Und** der Buchtitel ist in der Farbe der Farbrubrik „Hintergrund“ dargestellt
- **Und** der Bereich zeigt kein Herz-Icon und kein anderes Bild

### AK-5 Hinterlegtes Bild wird angezeigt
- **Gegeben** für einen der drei Bereiche ist ein Bild hinterlegt
- **Wenn** die Buchdetails angezeigt werden
- **Dann** zeigt dieser Bereich das hinterlegte Bild

### AK-6 Farben aus zentralen Farbrubriken
- **Gegeben** der Wert der Farbrubrik einer Farbrolle dieses REQ wird an der zentralen Stelle geändert
- **Wenn** die Buchdetails angezeigt werden
- **Dann** sind alle Elemente mit dieser Farbrolle im geänderten Wert dargestellt

## Abgrenzung (nicht Teil dieses REQ)

- Auswahlmenü beim Antippen eines Bereichs (REQ-015), Bild aufnehmen/auswählen (REQ-016), Zuschnitt (REQ-017).
- Buchtitel unter der Buchdarstellung (REQ-018).
- Cover-Platzhalter im Bucheintrag der Buchliste (REQ-010) bleibt unverändert.

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-008:** Buchdaten; bisher genau ein optionales Buchcover je Buch. Bilder für Buchrücken und Schnitt sind eine Erweiterung der Buchdaten (laut REQ-008 vorgesehen).
- **REQ-009:** Format von „Alle ansehen ›“.
- **REQ-010:** Abgrenzung zum Cover-Platzhalter (siehe Offene Fragen).
- **REQ-013:** Fenster „Buchdetails“.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

- Farben: Welche Farbe hat die bordeauxfarbene Coverfläche (Farbrubrik „Primär“ oder ein anderer Ton)? Welche Farben haben Fläche und Rahmen der schmalen Bereiche? Gilt für die Beschriftung die Farbe von „Alle ansehen ›“ (Primär)?
- Beschriftung: Im Referenzbild steht sie in Großbuchstaben („BUCHRÜCKEN“, „SCHNITT“), „Alle ansehen ›“ dagegen nicht. Wie soll sie geschrieben werden?
- Wie soll ein hinterlegtes Bild einen Bereich füllen, und bleibt die Beschriftung bzw. der Titel dann sichtbar?
- Wie soll ein langer Buchtitel auf der Coverfläche dargestellt werden?
- REQ-010 sagt allgemein: Buch ohne Buchcover → Cover-Platzhalter (Herz). Gilt die Darstellung „Titel auf bordeaux“ nur in den Buchdetails, während in den Listen das Herz bleibt?
- Priorität.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-09 | Erstellt (Entwurf aus der CEO-Beschreibung „Buchdetails“ Teil 1) | Anforderungsmanager |
