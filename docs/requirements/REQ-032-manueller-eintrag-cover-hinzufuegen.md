---
id: REQ-032
titel: Manueller Eintrag – Cover über Kamera oder Galerie hinzufügen
status: In Umsetzung
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **beim manuellen Eintrag ein Cover per Kamera oder aus der Galerie hinzufügen**, damit **das neue Buch gleich mit Cover angelegt wird**.

Vorgabe des CEO (wörtlich, 2026-11-10): „Ein Klick auf 'Cover hinzufügen' öffnet wieder das Menü mit der Möglichkeit von Bildimporten per Kamera oder Galerie.“

Priorität: Must (vom CEO bestätigt, 2026-11-10).

## Anforderung (Satzschablone)

**Auswahlmenü**
- Wenn der Nutzer im Blatt „Manueller Eintrag“ das Feld „Cover hinzufügen“ antippt, muss das System dasselbe Auswahlmenü wie in den Buchdetails (REQ-015) anzeigen, mit „Scannen“, „Aus Galerie auswählen“ und „Cover online suchen“ (sichtbar, ohne Funktion wie in REQ-015) (CEO-bestätigter Vorschlag).
- Ist im Feld bereits ein Bild vorgemerkt, muss das Auswahlmenü zusätzlich „Foto entfernen“ anzeigen, wie in REQ-015.
- Wenn der Nutzer „Foto entfernen“ antippt, muss das System das vorgemerkte Bild verwerfen und im Feld wieder Kamera-Icon und „Cover hinzufügen“ anzeigen.

**Bild aufnehmen oder auswählen**
- Wenn der Nutzer „Scannen“ oder „Aus Galerie auswählen“ wählt, muss das System Kameraansicht bzw. Galerie (REQ-016) und danach den Zuschnitt (REQ-017) genauso wie in den Buchdetails anbieten.
- Das System muss den Zuschnitt im Cover-Format beginnen lassen (wie beim Bereich „Cover“ in REQ-017).
- Wenn der Nutzer den Zuschnitt bestätigt, muss das System das zugeschnittene Bild im Feld „Cover hinzufügen“ anzeigen und für das anzulegende Buch vormerken.
- Wenn der Nutzer Kameraansicht, Galerie oder Zuschnitt ohne Bestätigung verlässt, muss das System zum Blatt „Manueller Eintrag“ zurückkehren, ohne bereits eingetragene Angaben oder ein vorgemerktes Bild zu verändern.

**Nach dem Anlegen**
- Wird das Buch mit „Hinzufügen“ angelegt (REQ-031), muss das System das vorgemerkte Bild als Frontcover des Buches speichern (REQ-019). Es erscheint damit im Bereich „Cover“ der Buchdetails und als Buchcover in allen Buchlisten (REQ-020).
- Wird das Blatt ohne „Hinzufügen“ geschlossen (X, Android-Zurück-Taste oder Herunterziehen am Ziehgriff, REQ-030), darf das System das vorgemerkte Bild nicht speichern.

## Akzeptanzkriterien

### AK-1 Antippen öffnet das Auswahlmenü
- **Gegeben** das Blatt „Manueller Eintrag“ ist geöffnet und kein Bild vorgemerkt
- **Wenn** der Nutzer „Cover hinzufügen“ antippt
- **Dann** erscheint das Auswahlmenü mit „Scannen“, „Aus Galerie auswählen“ und „Cover online suchen“
- **Und** „Foto entfernen“ wird nicht angezeigt

### AK-2 Bild erscheint im Feld
- **Gegeben** der Nutzer hat über „Aus Galerie auswählen“ ein Bild gewählt
- **Wenn** er den Zuschnitt bestätigt
- **Dann** ist das Blatt „Manueller Eintrag“ wieder sichtbar
- **Und** im Feld „Cover hinzufügen“ wird das zugeschnittene Bild angezeigt

### AK-3 Eingaben bleiben erhalten
- **Gegeben** Titel und Autor sind eingetragen
- **Wenn** der Nutzer ein Cover hinzufügt oder den Vorgang ohne Bestätigung abbricht
- **Dann** sind Titel und Autor unverändert eingetragen

### AK-4 Zuschnitt beginnt im Cover-Format
- **Gegeben** der Nutzer hat über „Cover hinzufügen“ ein Bild aufgenommen oder ausgewählt
- **Wenn** der Zuschnitt erscheint
- **Dann** bilden die vier Eckpunkte zu Beginn ein Rechteck im Cover-Format, wie beim Bereich „Cover“ in den Buchdetails (REQ-017)

### AK-5 „Foto entfernen“ bei vorgemerktem Bild
- **Gegeben** im Feld „Cover hinzufügen“ ist ein Bild vorgemerkt
- **Wenn** der Nutzer das Feld antippt und „Foto entfernen“ wählt
- **Dann** zeigt das Feld wieder Kamera-Icon und „Cover hinzufügen“
- **Und** ein danach angelegtes Buch hat kein Frontcover

### AK-6 „Cover online suchen“ ohne Funktion
- **Gegeben** das Auswahlmenü ist über „Cover hinzufügen“ geöffnet
- **Wenn** der Nutzer „Cover online suchen“ antippt
- **Dann** verhält sich die App wie beim Antippen von „Cover online suchen“ in den Buchdetails (REQ-015)

### AK-7 Bild wird Frontcover
- **Gegeben** im Feld ist ein Bild vorgemerkt und ein Titel eingetragen
- **Wenn** der Nutzer „Hinzufügen“ antippt
- **Dann** zeigt der Bereich „Cover“ in den Buchdetails des neuen Buches dieses Bild
- **Und** im Abschnitt „Noch zu lesen“ erscheint dieses Bild statt des Cover-Platzhalters
- **Und** nach einem Neustart der App ist das Bild weiterhin vorhanden

### AK-8 Schließen ohne „Hinzufügen“ verwirft das Bild
- **Gegeben** im Feld ist ein Bild vorgemerkt
- **Wenn** der Nutzer das Blatt über X, die Android-Zurück-Taste oder Herunterziehen am Ziehgriff schließt
- **Dann** wird weder ein Buch noch das Bild gespeichert

## Abgrenzung (nicht Teil dieses REQ)

- Kamera-, Galerie- und Zuschnitt-Technik selbst (REQ-016, REQ-017).
- Funktion „Cover online suchen“ (To-do-Liste).
- Speichern des Buches (REQ-031).
- Bilder für Buchrücken und Schnitt beim manuellen Eintrag.

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-015, REQ-016, REQ-017** (wiederverwendet), **REQ-019** (Speicherung), **REQ-020** (Frontcover in Buchlisten), **REQ-030**, **REQ-031**.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-10 | Erstellt (Entwurf aus der CEO-Vorgabe „Cover hinzufügen“) | Anforderungsmanager |
| 2026-11-10 | CEO-Antworten eingearbeitet. F6: gleiches Auswahlmenü wie in den Buchdetails inkl. „Cover online suchen“ (ohne Funktion) und „Foto entfernen“; Bild wird Frontcover; Zuschnitt beginnt im Cover-Format (AK-1 präzisiert, neu AK-4 bis AK-8). F7: Farben des Felds in REQ-030. Priorität Must (Bestätigung ausstehend). Status „Abgestimmt“ auf Weisung des Scrum Masters nach den übermittelten CEO-Antworten | Anforderungsmanager |
| 2026-11-10 | Vom CEO mit „Ja“ bestätigt: „Foto entfernen“ verwirft das vorgemerkte Bild (AK-5). Folgeänderung aus REQ-030: Bild wird auch beim Schließen per Android-Zurück-Taste oder Herunterziehen nicht gespeichert (AK-8 erweitert). Priorität Must vom CEO bestätigt („ja“). Status bleibt „Abgestimmt“ | Anforderungsmanager |
