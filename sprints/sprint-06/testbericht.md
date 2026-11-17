# Testbericht Sprint 06 (Teil A+B) – Tester, 2026-11-17

**Lokal (Token sparen):** neue Tests REQ-060–064 und die angepassten alten Dateien laufen mit `npx vitest run … --reporter=dot` (24 Dateien, 400/400 grün). `tsc -b` und `oxlint` sind ohne Befund. Die volle Suite `npm run verify` lief nicht, dafür ist die CI zuständig.
**Ergebnis je AK:** REQ-060 AK-1–10, REQ-061 AK-1–7, REQ-062 AK-1–8, REQ-063 AK-1–7, REQ-064 AK-1–5: alle bestanden (80 Tests).
**Gegenprobe:** 4 Fehler eingebaut (Pflichtfeld Seiten, ISBN-Prüfziffer, Übernahme des Treffers, Speichern Verlag/ISBN). Alle 4 wurden erkannt (7/2/2/8 rote Tests).
**Angepasste alte Tests:** Abgelöste AKs wurden ins neue Verhalten überführt, nichts wurde gelöscht. Die Tags bleiben für die Traceability erhalten.
- REQ-029/AK-2: Menü mit zwei Optionen. REQ-030/AK-2 und AK-6: Seiten liegt jetzt in der Karte „Ausgabe“, „Erschienen“ öffnet eine Eingabe. REQ-031/AK-2, AK-5 und AK-9 sowie REQ-025 (Nachtest REQ-031/AK-9): Seitenzahl ist Pflicht.
- REQ-041 „nicht änderbar“: Das Datum lässt sich nur noch über „Hinzugefügt“ ändern, ohne Änderung wird der Zeitpunkt des Anlegens gespeichert. REQ-056/AK-7: Verlag, ISBN und Hinzugefügt öffnen jetzt ein Blatt, Fotos und Erschienen bleiben ohne Funktion. Grobe Tests: REQ-029 und REQ-030 angepasst.
- In den Hilfsabläufen wird jetzt eine Seitenzahl eingetragen und „Von Hand eintragen“ über den Namen gewählt: REQ-021, 028, 031, 032, 033, 034, 035, 041 sowie die groben Tests 029–034 und 041.
- Testfehler behoben: In REQ-030/AK-5 hielt die Farbliteral-Prüfung „white-space“ fälschlich für die Farbe „white“. Kein Produktfehler.
**Befunde, keine Produktfehler, zur Klärung:**
1. REQ-056 trägt keinen Hinweis, dass AK-7 durch REQ-063/064 abgelöst ist. Das geht an den Anforderungsmanager.
2. REQ-064/AK-2 verlangt: „Zeile zeigt dieses Datum“. Angezeigt wird aber „Feb. 2025“ (Format nach REQ-056). Der Test akzeptiert beides, das muss der CEO klären.
3. Entwickler-Annahmen (Preis und Format nicht aus der Quelle, Autor wie geliefert, „Erschienen“ in der Zukunft erlaubt) habe ich nicht festgeschrieben. Weitere Beobachtungen: Mehr als 13 eingefügte ISBN-Ziffern werden abgeschnitten (z. B. 14 Ziffern werden zu einer gültigen 13er-ISBN). Die Android-Zurück-Taste schließt die Blätter Verlag/ISBN nicht (wie bei Preis, der REQ verlangt das nicht). Eine einmal gesetzte ISBN lässt sich nicht leeren.
**Empfehlung:** freigabefähig, sobald die CI (`npm run verify`) grün ist und Befund 1 und 2 geklärt sind.
