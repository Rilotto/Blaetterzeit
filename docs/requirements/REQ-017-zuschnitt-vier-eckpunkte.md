---
id: REQ-017
titel: Buchdetails – Bildausschnitt mit vier Eckpunkten anpassen
status: Entwurf
prioritaet: offen
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **nach Aufnahme oder Auswahl eines Bildes den Ausschnitt über vier Eckpunkte anpassen**, damit **nur mein Buch im jeweiligen Bereich erscheint**.

Vorgabe des CEO (wörtlich, Auszug, 2026-11-09): „Nachdem ich ein Bild aufgenommen oder ausgewählt habe, möchte ich den Ausschnitt anpassen können. Hier sollen mir 4 Punkte zur Verfügung stehen. Pro Buchecke einen.“

## Anforderung (Satzschablone)

- Nachdem der Nutzer ein Bild aufgenommen oder ausgewählt hat (REQ-016), muss das System das Bild mit genau vier Eckpunkten zur Anpassung des Ausschnitts anzeigen, je einen pro Buchecke.
- Das System muss dem Nutzer die Möglichkeit bieten, jeden der vier Eckpunkte einzeln zu verschieben.
- Das System muss dem Nutzer die Möglichkeit bieten, den Ausschnitt zu bestätigen.
- Wenn der Nutzer den Ausschnitt bestätigt, muss das System den durch die vier Eckpunkte festgelegten Ausschnitt als Bild des Bereichs hinterlegen, für den das Auswahlmenü geöffnet wurde (REQ-015), und die Buchdetails mit diesem Bild anzeigen (REQ-014).
- Das System muss ein zuvor hinterlegtes Bild dieses Bereichs dabei ersetzen.

## Randbedingungen

- Im Web-Prototyp ist der Zuschnitt nur mit einem über den Dateidialog gewählten Bild prüfbar (siehe REQ-016).

## Akzeptanzkriterien

### AK-1 Vier Eckpunkte
- **Gegeben** der Nutzer hat ein Bild aufgenommen oder ausgewählt
- **Wenn** der Zuschnitt angezeigt wird
- **Dann** sind genau vier Eckpunkte auf dem Bild sichtbar

### AK-2 Eckpunkte einzeln verschiebbar
- **Gegeben** der Zuschnitt wird angezeigt
- **Wenn** der Nutzer einen Eckpunkt verschiebt
- **Dann** ändert sich nur die Position dieses Eckpunkts

### AK-3 Bestätigter Ausschnitt wird hinterlegt
- **Gegeben** der Nutzer hat die Eckpunkte an die vier Buchecken verschoben
- **Wenn** er den Ausschnitt bestätigt
- **Dann** zeigen die Buchdetails im zugehörigen Bereich das Bild innerhalb der vier Eckpunkte
- **Und** Bildteile außerhalb der vier Eckpunkte sind nicht zu sehen

### AK-4 Neues Bild ersetzt das alte
- **Gegeben** für einen Bereich ist bereits ein Bild hinterlegt
- **Wenn** der Nutzer über das Auswahlmenü ein neues Bild aufnimmt oder auswählt und den Ausschnitt bestätigt
- **Dann** zeigt der Bereich das neue Bild

## Abgrenzung (nicht Teil dieses REQ)

- Weitere Bildbearbeitung (Drehen, Filter, Helligkeit), da vom CEO nicht genannt.

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-014:** Darstellung der Bereiche. **REQ-015:** Zuordnung zum Bereich. **REQ-016:** Bildquelle.
- **REQ-009 AK-7:** Coverbilder dürfen in Buchlisten nicht verzerrt werden (relevant, falls das Cover dort erscheint).

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

- Was soll mit einem schräg fotografierten Buch passieren: Wird das Bild zwischen den vier Eckpunkten gerade gezogen, oder bleiben die Eckpunkte an ein Rechteck gebunden?
- Welche Form bzw. welches Seitenverhältnis hat das Ergebnis für Buchrücken, Cover und Schnitt, und wie füllt es den jeweiligen Bereich?
- Wo stehen die vier Eckpunkte zu Beginn?
- Wie kann der Nutzer den Zuschnitt abbrechen, und was passiert dann?
- Priorität.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-09 | Erstellt (Entwurf aus der CEO-Beschreibung „Buchdetails“ Teil 1) | Anforderungsmanager |
