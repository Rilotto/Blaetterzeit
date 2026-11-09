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

Als **Nutzer** möchte ich **durch Antippen von Buchrücken, Cover oder Schnitt ein Auswahlmenü öffnen**, damit **ich für diesen Bereich jederzeit ein Bild aufnehmen, auswählen oder entfernen kann**.

Vorgabe des CEO (wörtlich, Auszug, 2026-11-09): „Wenn man auf eines dieser drei Rechtecke klickt, öffnet sich ein kleines Auswahlmenü (siehe neuer Screenshot). Scannen ruft dabei die Kamera auf, Aus Galerie auswählen ruft die Galerie des Smartphones auf. Die dritte Funktion soll nicht umgesetzt werden.“ – „Die Cover sollen jederzeit mit einem Klick auf das Rechteck neu gestaltbar sein und das Untermenü mit Scannen etc. aufrufen.“

Antworten des CEO (wörtlich, 2026-11-09):
- „Meine Beschreibung bitte: 'Aus Galerie auswählen'. Lass uns die Funktion 'Cover online suchen' umsetzen, aber ohne Funktion. Nimm das auf die To-Do-Liste bitte mit auf. Das Menü zum Einfügen eines Covers schließt sich durch einen Klick außerhalb des Menüfeldes. Stelle die Icons bitte wie im Screenshot selbst nach. Wenn ein Cover platziert ist, soll zusätzlich noch im Menü 'Foto entfernen' mit einem X-Icon erscheinen und löscht das hinterlegte Bild.“
- „[…] übernimm bitte das Auswahlfeld wie im Screenshot mit Farbe, Schrift und Icons.“

Referenzbild: [referenzen/REF-buchdetails-02-auswahlmenue.png](referenzen/REF-buchdetails-02-auswahlmenue.png). Die optische Übereinstimmung prüft der CEO im Prototyp; sie ist kein Akzeptanzkriterium.

## Anforderung (Satzschablone)

**Öffnen und Schließen**
- Wenn der Nutzer in den Buchdetails einen der Bereiche „Buchrücken“, „Cover“ oder „Schnitt“ (REQ-014) antippt, muss das System ein Auswahlmenü für diesen Bereich anzeigen.
- Das System muss das Auswahlmenü auch dann anzeigen, wenn für den Bereich bereits ein Bild hinterlegt ist („jederzeit … neu gestaltbar“).
- Wenn der Nutzer außerhalb des Auswahlmenüs tippt, muss das System das Auswahlmenü schließen, ohne den Bereich zu verändern.

**Optionen**
- Das System muss im Auswahlmenü die Option „Scannen“ anbieten.
- Das System muss im Auswahlmenü die Option „Aus Galerie auswählen“ anbieten.
- Das System muss im Auswahlmenü die Option „Cover online suchen“ darstellen.
- Wenn der Nutzer „Cover online suchen“ antippt, darf sich der Bereich nicht verändern; eine Online-Suche findet nicht statt (CEO: „umsetzen, aber ohne Funktion“; Funktion in der To-do-Liste).
- Wenn für den Bereich ein Bild hinterlegt ist, muss das System im Auswahlmenü zusätzlich die Option „Foto entfernen“ mit einem X-Icon anbieten.
- Wenn für den Bereich kein Bild hinterlegt ist, darf das System die Option „Foto entfernen“ nicht darstellen.

**Wirkung der Optionen**
- Wenn der Nutzer „Scannen“ wählt, muss das System die Kameraansicht starten (REQ-016) und das Auswahlmenü schließen.
- Wenn der Nutzer „Aus Galerie auswählen“ wählt, muss das System die Bildauswahl aus der Galerie starten (REQ-016) und das Auswahlmenü schließen.
- Wenn der Nutzer „Foto entfernen“ wählt, muss das System das hinterlegte Bild dieses Bereichs löschen, das Auswahlmenü schließen und den Bereich wieder ohne Bild darstellen (REQ-014).
- Das System muss sich merken, für welchen Bereich das Auswahlmenü geöffnet wurde, sodass ein späteres Bild bzw. das Entfernen genau diesen Bereich betrifft.

**Gestaltung**
- Das System muss neben den Optionen Icons darstellen, die den Icons im Referenzbild nachgebildet sind (CEO: „Stelle die Icons bitte wie im Screenshot selbst nach“), im gleichen technischen Stil wie die übrigen Icons der App (einfarbige Linien-Icons, von der App eingefärbt). Für „Foto entfernen“ ein X-Icon.
- Das System muss Farben und Schrift des Auswahlmenüs am Referenzbild ausrichten (CEO: „mit Farbe, Schrift und Icons“). Die Werte misst der Entwickler im Referenzbild; sie sind kein Akzeptanzkriterium.
- Das System muss alle Farben des Auswahlmenüs über Farbrollen aus zentralen Farbrubriken beziehen (REQ-002; „Farben auf Zuruf“). Weichen gemessene Werte von allen bestehenden Farbrubriken ab, werden dafür neue Farbrubriken angelegt und dem CEO zur Benennung vorgelegt (blockiert die Abstimmung nicht).

## Akzeptanzkriterien

### AK-1 Menü öffnet sich für jeden der drei Bereiche
- **Gegeben** die Buchdetails werden angezeigt und kein Bereich hat ein Bild
- **Wenn** der Nutzer nacheinander „Buchrücken“, „Cover“ und „Schnitt“ antippt
- **Dann** erscheint jeweils das Auswahlmenü mit den Optionen „Scannen“, „Aus Galerie auswählen“ und „Cover online suchen“
- **Und** ohne die Option „Foto entfernen“

### AK-2 Bei vorhandenem Bild zusätzlich „Foto entfernen“
- **Gegeben** für einen Bereich ist bereits ein Bild hinterlegt
- **Wenn** der Nutzer diesen Bereich antippt
- **Dann** erscheint das Auswahlmenü
- **Und** es enthält zusätzlich die Option „Foto entfernen“ mit einem X-Icon

### AK-3 „Scannen“ startet die Kameraansicht
- **Gegeben** das Auswahlmenü ist geöffnet
- **Wenn** der Nutzer „Scannen“ wählt
- **Dann** wird die Kameraansicht (REQ-016) gestartet
- **Und** das Auswahlmenü ist geschlossen

### AK-4 „Aus Galerie auswählen“ startet die Galerie
- **Gegeben** das Auswahlmenü ist geöffnet
- **Wenn** der Nutzer „Aus Galerie auswählen“ wählt
- **Dann** wird die Bildauswahl aus der Galerie gestartet
- **Und** das Auswahlmenü ist geschlossen

### AK-5 „Cover online suchen“ sichtbar, aber ohne Funktion
- **Gegeben** das Auswahlmenü ist geöffnet
- **Wenn** der Nutzer „Cover online suchen“ antippt
- **Dann** findet keine Online-Suche statt
- **Und** das Bild des Bereichs ist unverändert

### AK-6 „Foto entfernen“ löscht das Bild
- **Gegeben** für den Bereich „Cover“ ist ein Bild hinterlegt und das Auswahlmenü dieses Bereichs ist geöffnet
- **Wenn** der Nutzer „Foto entfernen“ wählt
- **Dann** ist das Auswahlmenü geschlossen
- **Und** der Bereich „Cover“ wird wieder ohne Bild dargestellt (REQ-014, AK-4)
- **Und** die Bilder der Bereiche „Buchrücken“ und „Schnitt“ sind unverändert

### AK-7 Schließen durch Tippen außerhalb
- **Gegeben** das Auswahlmenü ist geöffnet
- **Wenn** der Nutzer außerhalb des Auswahlmenüs tippt
- **Dann** ist das Auswahlmenü geschlossen
- **Und** der Bereich ist unverändert

### AK-8 Bild landet im richtigen Bereich
- **Gegeben** das Auswahlmenü wurde über den Bereich „Schnitt“ geöffnet
- **Wenn** der Nutzer ein Bild aufnimmt oder auswählt und den Zuschnitt (REQ-017) bestätigt
- **Dann** ist das Bild im Bereich „Schnitt“ hinterlegt
- **Und** die Bereiche „Buchrücken“ und „Cover“ sind unverändert

### AK-9 Icons nachgebildet, nicht aus einer Bibliothek
- **Gegeben** das Auswahlmenü ist geöffnet
- **Wenn** die Herkunft der Icons geprüft wird
- **Dann** sind es im Projekt abgelegte, nachgebildete Icon-Dateien und keine Icons aus einer externen Icon-Bibliothek

## Abgrenzung (nicht Teil dieses REQ)

- Funktion der Online-Suche nach Covern (To-do-Liste).
- Technik der Kamera- und Galeriezugriffe (REQ-016), Zuschnitt (REQ-017), dauerhafte Speicherung (REQ-019).

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-014:** Bereiche der Buchdarstellung.
- **REQ-016, REQ-017:** Bildaufnahme/-auswahl und Zuschnitt.
- **REQ-019:** Löschen eines Bildes betrifft auch den dauerhaften Speicher. **REQ-020:** Entfernen des Frontcovers lässt in den Buchlisten wieder den Cover-Platzhalter erscheinen.
- **REQ-005:** Stil nachgebildeter Icons.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

- Priorität.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-09 | Erstellt (Entwurf aus der CEO-Beschreibung „Buchdetails“ Teil 1) | Anforderungsmanager |
| 2026-11-09 | CEO-Antworten 3 und 7 eingearbeitet: Wortlaut „Aus Galerie auswählen“, „Cover online suchen“ sichtbar ohne Funktion (AK-5 geändert, Funktion in To-do), Schließen durch Tippen außerhalb (neu AK-7), „Foto entfernen“ mit X-Icon (neu AK-2/AK-6), Icons nachgebildet (neu AK-9), Farbe/Schrift wie Referenzbild. Offen: Priorität | Anforderungsmanager |
