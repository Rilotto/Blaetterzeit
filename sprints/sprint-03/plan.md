# Sprint 03 – Fenster „Buchdetails“ (Teil 1)

**Sprintziel (CEO, 2026-11-09):** Der Einstieg in das Fenster „Buchdetails“. Das Feature wird größer und stetig erweitert, wir setzen eine Funktion nach der anderen um. Teil 1 umfasst:
- das Aufrufen des Fensters,
- die Darstellung des Buches,
- den Aufruf der Kamera,
- den Import aus der Galerie,
- den Zuschnitt eines Bildes.

**Referenzbild:** `docs/requirements/referenzen/REF-buchdetails-01.png`. Relevant ist nur der obere Bereich bis einschließlich des Buchtitels.

**Basis:** Branch `sprint-03/buchdetails`, abgezweigt von `sprint-02/buecher-grundgeruest`.

**Übernommen aus Sprint 02:** REQ-012, AK-10 und AK-11 (Textformat unter den Platzhaltern bei Sagas und Sammlungen), noch nicht umgesetzt.

## Vorgehen
1. Der CEO beschreibt die Funktion und seine Anforderungen.
2. Der Anforderungsmanager dokumentiert sie und stellt offene Fragen. Er macht keine eigenen Vorschläge.
3. Erst nach der Abstimmung folgen Umsetzung, Tests und Prototyp.

## Technische Rahmenbedingungen (Scrum Master, ohne Vorentscheidung)
- **Kamera und Galerie in der APK:** Dafür ist ein Capacitor-Plugin für Kamera und Fotos nötig, außerdem Android-Berechtigungen für Kamera und Medienzugriff. Die Auswahl trifft der Entwickler bei der Machbarkeitsprüfung, sobald die Anforderungen abgestimmt sind.
- **Prototyp als Artefakt:** Die Artefakt-Umgebung blockiert den Kamerazugriff, eine Dateiauswahl funktioniert dagegen. Kamera und Galerie lassen sich deshalb vollständig nur in der APK prüfen. Im Artefakt ist höchstens die Bildauswahl über einen Dateidialog testbar.
- **Speicherung der Cover:** Bisher werden Bücher nur im Arbeitsspeicher gehalten (Demodaten), es gibt noch keine dauerhafte Speicherung. Ob Cover nach einem Neustart erhalten bleiben sollen, entscheidet der CEO. Dafür wäre die lokale Speicherung (SQLite bzw. Dateien) laut ADR-0002 Voraussetzung.
- **Debug-APK:** Für die Gerätetests auf dem S23 Ultra stellt die CI eine Debug-APK als Download bereit. Dafür muss die CI erweitert werden.

## REQs
_Folgen nach der Beschreibung durch den CEO._

## Stand 2026-11-09
REQ-013 bis REQ-020 sind abgestimmt, Priorität Must. Machbarkeitsprüfung des Entwicklers: machbar, Aufwand grob 4–5 Entwicklertage.
- **Kamera:** eigene Kameraansicht über `@capacitor-community/camera-preview` (Capacitor 8), mit Rückfall auf `getUserMedia`. Risiko: Während die Kamera läuft, muss der Hintergrund durchsichtig sein. Das ist nur auf dem Gerät prüfbar.
- **Galerie:** `@capacitor/camera` mit dem Android Photo Picker. Dafür ist keine Berechtigung nötig, also kann sie auch nicht verweigert werden.
- **Geradeziehen:** eigene 4-Punkt-Homographie auf einem Canvas, ohne OpenCV. Die Bildgröße wird auf ca. 2000 px begrenzt.
- **Speicherung:** Bilddateien über `@capacitor/filesystem`, die Zuordnung in SQLite (erstes SQLite-Grundgerüst mit Migrationen). Neue Schnittstelle `ImageStore` mit Vertragstest.
- **CI:** stellt eine Debug-APK als Download bereit. Die Signatur weicht von der späteren Release-APK ab, vor dem Wechsel muss die App deinstalliert werden (Datenverlust).

**Umsetzung:** startet erst nach Freigabe durch den CEO.

## Freigabe CEO 2026-11-09
„Ich gebe die Umsetzung in einem Prototypen frei. Erstelle mir diesen mit bisher allen beschlossenen Funktionen.“
Umfang: REQ-013 bis REQ-020 sowie REQ-012 AK-10 und AK-11.

## Schnittstellen-Absprache Entwickler ↔ Tester (Runde 1)
Verbindlich. Der Entwickler meldet jede Abweichung, statt sie still zu ändern.

**Aufruf (REQ-013)**
- In der Liste „Noch zu lesen“ öffnet ein Klick auf das Cover (`img` oder `data-cover-platzhalter`) oder auf `data-buchtitel` die Buchdetails dieses Buchs.
- Der Reiter „Bücher“ bleibt dabei aktiv.
- Ein Klick auf den Reiter „Bücher“ oder auf den Zurück-Pfeil führt zurück zu „Deine Bücher“.

**Buchdetails**
- Container: `<section aria-label="Buchdetails">`. Die Komponente liegt in `src/views/BuchDetails.tsx`. Sie nimmt die Props `{ buchId, bildquelle?, bildspeicher?, onZurueck }` entgegen, damit sich Bildquelle und Speicher in Tests ersetzen lassen.
- Kopfzeile:
  - `<button aria-label="Zurück">` mit `data-icon="icon-zurueck.png"`
  - `<button aria-label="Weitere Optionen">` mit `data-icon="icon-mehr.png"`, ohne Funktion
  - Farbe beider Icons: `var(--bz-farbe-tertiaer)`

**Buchdarstellung (REQ-014)**
- Drei `<button>` mit `data-bereich="ruecken"`, `"cover"` bzw. `"schnitt"` und den `aria-label`s „Buchrücken“, „Cover“ bzw. „Schnitt“.
- Ohne Bild:
  - Cover: Fläche `primaer`, darin der Titel mit `data-cover-titel` in `hintergrund`.
  - Rücken und Schnitt: Fläche `ghost`, gestrichelter Rahmen `ghostframe`. Die Beschriftung `data-bereich-beschriftung` lautet „Buchrücken +“ bzw. „Schnitt +“, ist um 90° gedreht und hat das Format von „Alle ansehen ›“.
- Mit Bild: `<img data-bereich-bild>` ersetzt Beschriftung bzw. Titel.

**Titel unter dem Buch (REQ-018)**
- `data-buchdetails-titel`, Farbe `tertiaer`, höchstens 2 Zeilen mit Ellipse.

**Auswahlmenü (REQ-015)**
- `role="menu"` mit `aria-label="Bild hinzufügen"`. Einträge mit `role="menuitem"`: „Scannen“, „Aus Galerie auswählen“ und „Cover online suchen“ (sichtbar, ohne Funktion).
- Ist ein Bild vorhanden, kommt zusätzlich „Foto entfernen“ dazu.
- Ein Klick auf `data-menue-hintergrund` schließt das Menü.
- Die Icons sind selbst nachgebildet und liegen in `src/assets/icons/`.

**Bildquelle (REQ-016)**
- `src/bild/bildquelle.ts` definiert die Schnittstelle `Bildquelle { scannen(): Promise<string|null>; galerie(): Promise<string|null> }`. Beide liefern eine Data-URL oder `null` bei Abbruch.
- Kameraansicht: `<section aria-label="Kamera">` mit `<button aria-label="Zurück">` und `<button aria-label="Foto aufnehmen">`.

**Zuschnitt (REQ-017)**
- `<section aria-label="Zuschnitt">` mit `<button aria-label="Zurück">` und vier Eckpunkten mit `data-eckpunkt="0"` bis `"3"`. Die Eckpunkte sind rund und haben die Farbe `primaer`.
- Das Startformat steht als `data-startformat="schmal"` (Rücken, Schnitt) bzw. `"cover"`.
- Die Bestätigung erfolgt laut REQ-Text.
- Die Entzerrung ist eine reine Funktion in `src/bild/entzerren.ts`.

**Speicherung (REQ-019)**
- `src/storage/ImageStore.ts` definiert die Schnittstelle `ImageStore` mit `{ get(buchId, bereich), put(buchId, bereich, dataUrl), remove(buchId, bereich) }`. Es gibt eine In-Memory-Implementierung und eine Implementierung für das Gerät. Im Web wird IndexedDB verwendet, mit Fallback auf den Speicher.
- Vertragstest in `tests/contract/`.

**Frontcover in Listen (REQ-020)**
- Hat ein Buch ein Cover im `ImageStore`, zeigt die Liste `img` statt `data-cover-platzhalter`.

**REQ-012 AK-10/11**
- `data-platzhaltertext` hat dieselbe zentrale Typografie wie „Alle ansehen ›“ und höchstens 2 Zeilen.

**CI**
- `ci.yml` lädt die Debug-APK als Artefakt hoch.
