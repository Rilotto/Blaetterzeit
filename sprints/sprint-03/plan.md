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
