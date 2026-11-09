---
id: REQ-016
titel: Buchdetails – Bild in der Kameraansicht aufnehmen oder aus der Galerie auswählen
status: Implementiert
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **ein Bild meines Buches mit der Kamera aufnehmen oder aus der Galerie meines Smartphones auswählen**, damit **ich es für Buchrücken, Cover oder Schnitt verwenden kann**.

Vorgabe des CEO (wörtlich, Auszug, 2026-11-09): „Scannen ruft dabei die Kamera auf, Aus Galerie auswählen ruft die Galerie des Smartphones auf.“ – „Nachdem ich ein Bild aufgenommen oder ausgewählt habe, möchte ich den Ausschnitt anpassen können.“

Antworten des CEO (wörtlich, 2026-11-09):
- „Im Kamera-Modus und im Zuschnitt-Fenster gibt es ebenfalls den Zurück-Pfeil wie in den Buchdetails. Setze dies bitte auch mit um.“
- „Wenn ich den Zugriff verweigere, kann ich später nur ein Bild online auswählen.“

## Anforderung (Satzschablone)

**Kameraansicht**
- Wenn der Nutzer im Auswahlmenü (REQ-015) „Scannen“ wählt, muss das System eine Kameraansicht innerhalb der App anzeigen, in der der Nutzer mit der Kamera des Smartphones ein Bild aufnehmen kann.
- Das System muss in der Kameraansicht oben links denselben Zurück-Pfeil wie in den Buchdetails (REQ-013) darstellen, in der Farbrubrik „Tertiär“ wie dort (CEO: „wie 'Deine Bücher'“).
- Wenn der Nutzer in der Kameraansicht den Zurück-Pfeil antippt, muss das System zu den Buchdetails zurückkehren, ohne das Bild des Bereichs zu verändern.

**Galerie**
- Wenn der Nutzer im Auswahlmenü „Aus Galerie auswählen“ wählt, muss das System die Galerie des Smartphones zur Auswahl eines Bildes aufrufen.
- Wenn der Nutzer die Galerie ohne Auswahl verlässt, muss das System zu den Buchdetails zurückkehren, ohne das Bild des Bereichs zu verändern.

**Weiter zum Zuschnitt**
- Nachdem der Nutzer ein Bild aufgenommen oder ausgewählt hat, muss das System den Zuschnitt (REQ-017) mit diesem Bild anzeigen.

**Verweigerter Zugriff**
- Wenn der Nutzer den Zugriff auf die Kamera verweigert hat, kann über „Scannen“ kein Bild aufgenommen werden; das System darf das Bild des Bereichs dann nicht verändern.
- Wenn der Nutzer den Zugriff auf die Galerie verweigert hat, kann über „Aus Galerie auswählen“ kein Bild ausgewählt werden; das System darf das Bild des Bereichs dann nicht verändern.
- Laut CEO bleibt in diesem Fall nur die Online-Auswahl („Cover online suchen“); diese ist derzeit ohne Funktion (REQ-015, To-do-Liste). Darüber hinausgehendes Verhalten der App bei verweigertem Zugriff hat der CEO nicht festgelegt und ist nicht Teil dieses REQ.

**Speicherzugriff**
- Das System muss Bilder ausschließlich über die Repository-Schnittstelle speichern (ADR-0002); dauerhafte Speicherung siehe REQ-019.

## Randbedingungen

- **Plattform:** Kameraansicht und Galerie sind nur in der Android-APK vollständig nutzbar und prüfbar. Im Web-Prototyp (Artefakt) ist der Kamerazugriff blockiert; dort ist höchstens die Bildauswahl über einen Dateidialog prüfbar (sprints/sprint-03/plan.md).
- Die Kameraansicht ist laut CEO ein Fenster der App mit Zurück-Pfeil, nicht nur der Aufruf der System-Kamera-App. Die technische Machbarkeit prüft der Entwickler; ist sie so nicht umsetzbar, geht der REQ zurück an den Anforderungsmanager.
- Für die APK sind Kamera- und Medienberechtigungen nötig; die technische Umsetzung legt der Entwickler bei der Machbarkeitsprüfung fest.

## Akzeptanzkriterien

### AK-1 Kameraansicht in der App
- **Gegeben** das Auswahlmenü eines Bereichs ist geöffnet (APK), der Kamerazugriff ist erlaubt
- **Wenn** der Nutzer „Scannen“ wählt
- **Dann** zeigt die App eine Kameraansicht mit dem Live-Bild der Kamera
- **Und** oben links den Zurück-Pfeil wie in den Buchdetails, in der Farbe der Farbrubrik „Tertiär“

### AK-2 Zurück aus der Kameraansicht ändert nichts
- **Gegeben** die Kameraansicht wird angezeigt, für den Bereich ist ein Bild oder noch kein Bild hinterlegt
- **Wenn** der Nutzer den Zurück-Pfeil antippt
- **Dann** werden wieder die Buchdetails angezeigt
- **Und** der Bereich ist unverändert

### AK-3 Galerie wird aufgerufen
- **Gegeben** das Auswahlmenü eines Bereichs ist geöffnet (APK), der Galeriezugriff ist erlaubt
- **Wenn** der Nutzer „Aus Galerie auswählen“ wählt
- **Dann** öffnet sich die Galerie des Smartphones

### AK-4 Abbruch der Galerie ändert nichts
- **Gegeben** die Galerie wurde über das Auswahlmenü geöffnet
- **Wenn** der Nutzer die Galerie ohne Bild verlässt
- **Dann** werden wieder die Buchdetails angezeigt
- **Und** der Bereich ist unverändert

### AK-5 Danach folgt der Zuschnitt
- **Gegeben** der Nutzer hat in der Kameraansicht ein Bild aufgenommen oder in der Galerie ein Bild ausgewählt
- **Wenn** die Aufnahme bzw. Auswahl abgeschlossen ist
- **Dann** wird der Zuschnitt (REQ-017) mit genau diesem Bild angezeigt

### AK-6 Verweigerter Zugriff ändert nichts
- **Gegeben** der Nutzer hat den Zugriff auf Kamera bzw. Galerie verweigert
- **Wenn** er im Auswahlmenü „Scannen“ bzw. „Aus Galerie auswählen“ wählt
- **Dann** wird kein Bild aufgenommen bzw. ausgewählt
- **Und** das Bild des Bereichs ist unverändert

## Abgrenzung (nicht Teil dieses REQ)

- Zuschnitt (REQ-017), dauerhafte Speicherung (REQ-019).
- Online-Suche nach Covern (To-do-Liste).
- Hinweise, Dialoge oder erneute Berechtigungsanfragen bei verweigertem Zugriff (vom CEO nicht festgelegt).

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-013:** Zurück-Pfeil. **REQ-015:** Auswahlmenü. **REQ-017:** Zuschnitt. **REQ-019:** dauerhafte Speicherung.
- **REQ-008, ADR-0002:** Buchdaten, Speicherzugriff über Repository.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-09 | Erstellt (Entwurf aus der CEO-Beschreibung „Buchdetails“ Teil 1) | Anforderungsmanager |
| 2026-11-09 | CEO-Antworten 3, 4 und 6 eingearbeitet: Kameraansicht in der App mit Zurück-Pfeil (AK-1, AK-2), Wortlaut „Aus Galerie auswählen“, verweigerter Zugriff (neu AK-6), dauerhafte Speicherung ausgelagert in REQ-019. Offen: Priorität | Anforderungsmanager |
| 2026-11-09 | Farbe des Zurück-Pfeils Tertiär wie in REQ-013 (AK-1 ergänzt), Priorität Must (CEO). Status „Abgestimmt“ (CEO 2026-11-09) | Anforderungsmanager |
