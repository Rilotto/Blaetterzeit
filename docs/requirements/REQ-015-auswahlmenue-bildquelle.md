---
id: REQ-015
titel: Buchdetails – Auswahlmenü beim Antippen eines Bereichs der Buchdarstellung
status: Entwurf
prioritaet: offen
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **durch Antippen von Buchrücken, Cover oder Schnitt ein Auswahlmenü öffnen**, damit **ich für diesen Bereich jederzeit ein Bild aufnehmen oder auswählen kann**.

Vorgabe des CEO (wörtlich, Auszug, 2026-11-09): „Wenn man auf eines dieser drei Rechtecke klickt, öffnet sich ein kleines Auswahlmenü (siehe neuer Screenshot). Scannen ruft dabei die Kamera auf, Aus Galerie auswählen ruft die Galerie des Smartphones auf. Die dritte Funktion soll nicht umgesetzt werden.“ – „Die Cover sollen jederzeit mit einem Klick auf das Rechteck neu gestaltbar sein und das Untermenü mit Scannen etc. aufrufen.“

Referenzbild: [referenzen/REF-buchdetails-02-auswahlmenue.png](referenzen/REF-buchdetails-02-auswahlmenue.png). Die optische Übereinstimmung prüft der CEO im Prototyp; sie ist kein Akzeptanzkriterium.

## Anforderung (Satzschablone)

- Wenn der Nutzer in den Buchdetails einen der Bereiche „Buchrücken“, „Cover“ oder „Schnitt“ (REQ-014) antippt, muss das System ein Auswahlmenü für diesen Bereich anzeigen.
- Das System muss das Auswahlmenü auch dann anzeigen, wenn für den Bereich bereits ein Bild hinterlegt ist („jederzeit … neu gestaltbar“).
- Das System muss im Auswahlmenü die Option „Scannen“ anbieten.
- Das System muss im Auswahlmenü die Option zur Auswahl aus der Galerie anbieten (Wortlaut offen, siehe Offene Fragen).
- Das System darf die dritte Option des Referenzbilds („Cover online suchen“) nicht als Funktion anbieten.
- Wenn der Nutzer „Scannen“ wählt, muss das System die Bildaufnahme mit der Kamera starten (REQ-016) und das Auswahlmenü schließen.
- Wenn der Nutzer die Galerie-Option wählt, muss das System die Bildauswahl aus der Galerie starten (REQ-016) und das Auswahlmenü schließen.
- Das System muss sich merken, für welchen Bereich das Auswahlmenü geöffnet wurde, sodass das spätere Bild genau diesem Bereich zugeordnet wird.

## Akzeptanzkriterien

### AK-1 Menü öffnet sich für jeden der drei Bereiche
- **Gegeben** die Buchdetails werden angezeigt
- **Wenn** der Nutzer nacheinander „Buchrücken“, „Cover“ und „Schnitt“ antippt
- **Dann** erscheint jeweils das Auswahlmenü mit „Scannen“ und der Galerie-Option

### AK-2 Auch bei vorhandenem Bild
- **Gegeben** für einen Bereich ist bereits ein Bild hinterlegt
- **Wenn** der Nutzer diesen Bereich antippt
- **Dann** erscheint das Auswahlmenü

### AK-3 „Scannen“ startet die Kamera
- **Gegeben** das Auswahlmenü ist geöffnet
- **Wenn** der Nutzer „Scannen“ wählt
- **Dann** wird die Bildaufnahme mit der Kamera gestartet
- **Und** das Auswahlmenü ist geschlossen

### AK-4 Galerie-Option startet die Galerie
- **Gegeben** das Auswahlmenü ist geöffnet
- **Wenn** der Nutzer die Galerie-Option wählt
- **Dann** wird die Bildauswahl aus der Galerie gestartet
- **Und** das Auswahlmenü ist geschlossen

### AK-5 Keine Online-Suche
- **Gegeben** das Auswahlmenü ist geöffnet
- **Wenn** die angebotenen Funktionen geprüft werden
- **Dann** gibt es keine Funktion, die ein Cover online sucht

### AK-6 Bild landet im richtigen Bereich
- **Gegeben** das Auswahlmenü wurde über den Bereich „Schnitt“ geöffnet
- **Wenn** der Nutzer ein Bild aufnimmt oder auswählt und den Zuschnitt (REQ-017) bestätigt
- **Dann** ist das Bild im Bereich „Schnitt“ hinterlegt
- **Und** die Bereiche „Buchrücken“ und „Cover“ sind unverändert

## Abgrenzung (nicht Teil dieses REQ)

- Online-Suche nach Covern („Cover online suchen“).
- Technik der Kamera- und Galeriezugriffe (REQ-016), Zuschnitt (REQ-017).

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-014:** Bereiche der Buchdarstellung.
- **REQ-016, REQ-017:** Bildaufnahme/-auswahl und Zuschnitt.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

- Wortlaut der Galerie-Option: Im Referenzbild steht „Aus Galerie wählen“, in der Beschreibung „Aus Galerie auswählen“. Welcher gilt?
- Dritte Option „Cover online suchen“: Soll sie im Menü gar nicht erscheinen oder sichtbar, aber ohne Funktion?
- Wie schließt sich das Menü, wenn der Nutzer nichts auswählt?
- Icons neben den Optionen (Kamera, Galerie): Stellt der CEO sie bereit?
- Farben des Menüs (Hintergrund, Schrift, Icons).
- Priorität.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-09 | Erstellt (Entwurf aus der CEO-Beschreibung „Buchdetails“ Teil 1) | Anforderungsmanager |
