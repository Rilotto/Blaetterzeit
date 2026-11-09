---
id: REQ-016
titel: Buchdetails – Bild mit der Kamera aufnehmen oder aus der Galerie auswählen
status: Entwurf
prioritaet: offen
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **ein Bild meines Buches mit der Kamera aufnehmen oder aus der Galerie meines Smartphones auswählen**, damit **ich es für Buchrücken, Cover oder Schnitt verwenden kann**.

Vorgabe des CEO (wörtlich, Auszug, 2026-11-09): „Scannen ruft dabei die Kamera auf, Aus Galerie auswählen ruft die Galerie des Smartphones auf.“ – „Nachdem ich ein Bild aufgenommen oder ausgewählt habe, möchte ich den Ausschnitt anpassen können.“

## Anforderung (Satzschablone)

- Wenn der Nutzer im Auswahlmenü (REQ-015) „Scannen“ wählt, muss das System die Kamera des Smartphones zur Aufnahme eines Bildes aufrufen.
- Wenn der Nutzer im Auswahlmenü die Galerie-Option wählt, muss das System die Galerie des Smartphones zur Auswahl eines Bildes aufrufen.
- Nachdem der Nutzer ein Bild aufgenommen oder ausgewählt hat, muss das System den Zuschnitt (REQ-017) mit diesem Bild anzeigen.
- Wenn der Nutzer die Aufnahme bzw. Auswahl abbricht, muss das System zu den Buchdetails zurückkehren, ohne das Bild des Bereichs zu verändern.
- Das System muss Bilder ausschließlich über die Repository-Schnittstelle speichern (ADR-0002).

## Randbedingungen

- **Plattform:** Kamera und Galerie sind nur in der Android-APK vollständig nutzbar und prüfbar. Im Web-Prototyp (Artefakt) ist der Kamerazugriff blockiert; dort ist höchstens die Bildauswahl über einen Dateidialog prüfbar (sprints/sprint-03/plan.md).
- Für die APK sind Kamera- und Medienberechtigungen nötig; die technische Umsetzung legt der Entwickler bei der Machbarkeitsprüfung fest.

## Akzeptanzkriterien

### AK-1 Kamera wird aufgerufen
- **Gegeben** das Auswahlmenü eines Bereichs ist geöffnet (APK)
- **Wenn** der Nutzer „Scannen“ wählt
- **Dann** öffnet sich die Kamera des Smartphones

### AK-2 Galerie wird aufgerufen
- **Gegeben** das Auswahlmenü eines Bereichs ist geöffnet (APK)
- **Wenn** der Nutzer die Galerie-Option wählt
- **Dann** öffnet sich die Galerie des Smartphones

### AK-3 Danach folgt der Zuschnitt
- **Gegeben** der Nutzer hat mit der Kamera ein Bild aufgenommen oder in der Galerie ein Bild ausgewählt
- **Wenn** die Aufnahme bzw. Auswahl abgeschlossen ist
- **Dann** wird der Zuschnitt (REQ-017) mit genau diesem Bild angezeigt

### AK-4 Abbruch ändert nichts
- **Gegeben** für einen Bereich ist ein Bild oder noch kein Bild hinterlegt
- **Wenn** der Nutzer die Kamera bzw. Galerie ohne Bild verlässt
- **Dann** werden wieder die Buchdetails angezeigt
- **Und** der Bereich ist unverändert

## Abgrenzung (nicht Teil dieses REQ)

- Zuschnitt (REQ-017).
- Online-Suche nach Covern.

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-015:** Auswahlmenü. **REQ-017:** Zuschnitt.
- **REQ-008, ADR-0002:** Buchdaten, Speicherzugriff über Repository.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

- Sollen hinterlegte Bilder einen Neustart der App überstehen? (Bisher gibt es keine dauerhafte Speicherung, siehe Sprintplan.)
- Was soll passieren, wenn der Nutzer den Zugriff auf Kamera oder Galerie verweigert?
- Priorität.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-09 | Erstellt (Entwurf aus der CEO-Beschreibung „Buchdetails“ Teil 1) | Anforderungsmanager |
