---
id: REQ-017
titel: Buchdetails – Bild mit vier Eckpunkten zuschneiden und geradeziehen
status: Abgestimmt
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **nach Aufnahme oder Auswahl eines Bildes den Ausschnitt über vier Eckpunkte anpassen und ein schräg fotografiertes Buch geradeziehen**, damit **nur mein Buch unverzerrt im jeweiligen Bereich erscheint**.

Vorgabe des CEO (wörtlich, Auszug, 2026-11-09): „Nachdem ich ein Bild aufgenommen oder ausgewählt habe, möchte ich den Ausschnitt anpassen können. Hier sollen mir 4 Punkte zur Verfügung stehen. Pro Buchecke einen.“

Antwort des CEO (wörtlich, 2026-11-09): „Durch das individuelle Ziehen der vier Punkte (Trapezfunktion) sollte ich ein schräg fotografiertes Cover ausgleichen können. Es wird sozusagen 'geradegezogen'. Die Ecken stehen zu Beginn in einem Rechteck wie ein Buch, die Ecken sind optisch rund und im Bordeauxton, damit man diese besser erkennt. Im Kamera-Modus und im Zuschnitt-Fenster gibt es ebenfalls den Zurück-Pfeil wie in den Buchdetails. Setze dies bitte auch mit um.“

Weitere Antworten des CEO (2026-11-09):
- Startrahmen (wörtlich): „Wenn ich einen Buchrücken oder einen Farbschnitt hochladen möchte, soll der Rahmen zum schmalen Rücken passen. Bei einem Frontcover soll es der breite Rahmen passend zu einem Cover-Format sein.“ („Farbschnitt“ = Bereich „Schnitt“, Glossar.)
- Der Zurück-Pfeil im Zuschnitt-Fenster führt zurück zu den Buchdetails.
- Farbe des Zurück-Pfeils: „wie 'Deine Bücher'“ = Farbrubrik „Tertiär“ (REQ-013).

## Anforderung (Satzschablone)

**Eckpunkte**
- Nachdem der Nutzer ein Bild aufgenommen oder ausgewählt hat (REQ-016), muss das System das Zuschnitt-Fenster mit dem Bild und genau vier Eckpunkten anzeigen, je einen pro Buchecke.
- Das System muss die vier Eckpunkte zu Beginn in Form eines Rechtecks anordnen (CEO: „in einem Rechteck wie ein Buch“), dessen Seitenverhältnis vom Zielbereich abhängt:
  - Zielbereich „Buchrücken“ oder „Schnitt“: schmales, hochformatiges Rechteck im Seitenverhältnis dieser schmalen Bereiche (REQ-014) (CEO: „soll der Rahmen zum schmalen Rücken passen“).
  - Zielbereich „Cover“: breites Rechteck im Seitenverhältnis des Bereichs „Cover“ (REQ-014) (CEO: „der breite Rahmen passend zu einem Cover-Format“).
- Das System muss die Eckpunkte als runde Markierungen in der Farbrubrik „Primär“ darstellen (CEO: „optisch rund und im Bordeauxton“).
- Das System muss dem Nutzer die Möglichkeit bieten, jeden der vier Eckpunkte einzeln und unabhängig von den anderen frei zu verschieben, sodass die Eckpunkte auch ein beliebiges Viereck (z. B. Trapez) bilden können.

**Bestätigen und Geradeziehen**
- Das System muss dem Nutzer die Möglichkeit bieten, den Ausschnitt zu bestätigen.
- Wenn der Nutzer den Ausschnitt bestätigt, muss das System den Bildinhalt innerhalb der vier Eckpunkte perspektivisch entzerren („geradeziehen“), sodass er die rechteckige Form des Zielbereichs (REQ-014) ausfüllt.
- Das System muss das Ergebnis als Bild des Bereichs hinterlegen, für den das Auswahlmenü geöffnet wurde (REQ-015), und die Buchdetails mit diesem Bild anzeigen (REQ-014).
- Das System muss ein zuvor hinterlegtes Bild dieses Bereichs dabei ersetzen.

**Zurück-Pfeil**
- Das System muss im Zuschnitt-Fenster oben links denselben Zurück-Pfeil wie in den Buchdetails (REQ-013) darstellen, in der Farbrubrik „Tertiär“ wie dort.
- Wenn der Nutzer im Zuschnitt-Fenster den Zurück-Pfeil antippt, muss das System die Buchdetails desselben Buches anzeigen.
- Wenn der Nutzer im Zuschnitt-Fenster den Zurück-Pfeil antippt, darf das System das aufgenommene bzw. ausgewählte Bild nicht übernehmen und das Bild des Bereichs nicht verändern.

**Farben**
- Das System muss die Farbe der Eckpunkte über eine Farbrolle aus einer zentralen Farbrubrik beziehen (Farbrolle „Zuschnitt-Eckpunkt“ → Farbrubrik „Primär“). Konkrete Farbwerte sind kein Akzeptanzkriterium.

## Randbedingungen

- Im Web-Prototyp ist der Zuschnitt nur mit einem über den Dateidialog gewählten Bild prüfbar (siehe REQ-016).

## Akzeptanzkriterien

### AK-1 Vier runde Eckpunkte in Primär
- **Gegeben** der Nutzer hat ein Bild aufgenommen oder ausgewählt
- **Wenn** das Zuschnitt-Fenster angezeigt wird
- **Dann** sind genau vier Eckpunkte auf dem Bild sichtbar
- **Und** sie sind rund und in der Farbe der Farbrubrik „Primär“ dargestellt

### AK-2 Startposition als Rechteck
- **Gegeben** der Nutzer hat ein Bild aufgenommen oder ausgewählt
- **Wenn** das Zuschnitt-Fenster erstmals angezeigt wird
- **Dann** bilden die vier Eckpunkte ein Rechteck

### AK-7 Schmaler Startrahmen für Buchrücken und Schnitt
- **Gegeben** der Nutzer hat über das Auswahlmenü des Bereichs „Buchrücken“ bzw. „Schnitt“ ein Bild aufgenommen oder ausgewählt
- **Wenn** das Zuschnitt-Fenster erstmals angezeigt wird
- **Dann** bilden die vier Eckpunkte ein hochformatiges Rechteck im Seitenverhältnis des Bereichs „Buchrücken“ bzw. „Schnitt“ (REQ-014)

### AK-8 Breiter Startrahmen für das Cover
- **Gegeben** der Nutzer hat über das Auswahlmenü des Bereichs „Cover“ ein Bild aufgenommen oder ausgewählt
- **Wenn** das Zuschnitt-Fenster erstmals angezeigt wird
- **Dann** bilden die vier Eckpunkte ein Rechteck im Seitenverhältnis des Bereichs „Cover“ (REQ-014)
- **Und** es ist breiter im Verhältnis zur Höhe als der Startrahmen für „Buchrücken“ und „Schnitt“

### AK-3 Eckpunkte einzeln frei verschiebbar
- **Gegeben** das Zuschnitt-Fenster wird angezeigt
- **Wenn** der Nutzer einen Eckpunkt verschiebt
- **Dann** ändert sich nur die Position dieses Eckpunkts
- **Und** die vier Eckpunkte können danach ein Viereck bilden, das kein Rechteck ist

### AK-4 Schräges Buch wird geradegezogen
- **Gegeben** ein Bild, auf dem ein Buch schräg (perspektivisch verzerrt) abgebildet ist, und die vier Eckpunkte liegen auf den vier Buchecken
- **Wenn** der Nutzer den Ausschnitt bestätigt
- **Dann** zeigt der zugehörige Bereich der Buchdetails den Bildinhalt zwischen den vier Eckpunkten als Rechteck, das den Bereich ausfüllt
- **Und** Bildteile außerhalb der vier Eckpunkte sind nicht zu sehen

### AK-5 Neues Bild ersetzt das alte
- **Gegeben** für einen Bereich ist bereits ein Bild hinterlegt
- **Wenn** der Nutzer über das Auswahlmenü ein neues Bild aufnimmt oder auswählt und den Ausschnitt bestätigt
- **Dann** zeigt der Bereich das neue Bild

### AK-6 Zurück-Pfeil im Zuschnitt ändert nichts
- **Gegeben** das Zuschnitt-Fenster wird angezeigt und für den Bereich ist ein Bild oder noch kein Bild hinterlegt
- **Wenn** der Nutzer den Zurück-Pfeil oben links antippt
- **Dann** ist das Zuschnitt-Fenster geschlossen
- **Und** die Buchdetails desselben Buches werden angezeigt
- **Und** das Bild des Bereichs ist unverändert (das aufgenommene bzw. ausgewählte Bild wurde nicht übernommen)

### AK-9 Zurück-Pfeil in Tertiär
- **Gegeben** das Zuschnitt-Fenster wird angezeigt
- **Wenn** der Zurück-Pfeil betrachtet wird
- **Dann** ist er in der Farbe der Farbrubrik „Tertiär“ dargestellt (wie in den Buchdetails, REQ-013)

## Abgrenzung (nicht Teil dieses REQ)

- Weitere Bildbearbeitung (Drehen, Filter, Helligkeit), da vom CEO nicht genannt.
- Automatisches Erkennen der Buchecken, da vom CEO nicht genannt.

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-013:** Zurück-Pfeil. **REQ-014:** Form der Bereiche. **REQ-015:** Zuordnung zum Bereich. **REQ-016:** Bildquelle. **REQ-019:** dauerhafte Speicherung.
- **REQ-009 AK-7:** Coverbilder dürfen in Buchlisten nicht verzerrt werden (relevant, da das Frontcover dort erscheint, REQ-020).

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-09 | Erstellt (Entwurf aus der CEO-Beschreibung „Buchdetails“ Teil 1) | Anforderungsmanager |
| 2026-11-09 | CEO-Antworten 4 und 5 eingearbeitet: Trapezfunktion/Geradeziehen (neu AK-4), Startposition Rechteck (neu AK-2), runde Eckpunkte in Primär (AK-1), Zurück-Pfeil (neu AK-6). Titel angepasst. Offen: Ziel des Zurück-Pfeils, Startrechteck bei Buchrücken/Schnitt, Priorität | Anforderungsmanager |
| 2026-11-09 | CEO-Antworten eingearbeitet: Startrahmen je Zielbereich schmal bzw. Cover-Format (neu AK-7, AK-8), Zurück-Pfeil führt zu den Buchdetails ohne Bildübernahme (AK-6 ergänzt), Farbe Tertiär (neu AK-9), Priorität Must. Status „Abgestimmt“ (CEO 2026-11-09) | Anforderungsmanager |
