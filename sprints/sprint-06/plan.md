# Sprint 06 – Buch anlegen mit allen Angaben, Barcode scannen

Sprintziel: Ein Buch lässt sich von Hand mit allen Angaben der Karte „Ausgabe“ anlegen, und per ISBN-Barcode samt Daten und Cover aus dem Internet. Verlag, ISBN und „Hinzugefügt“ sind in den Details bearbeitbar.
Planung beauftragt vom CEO 2026-11-16: „passt alles für mich. bitte für den nächsten Sprint planen.“ Branch: sprint-06/anlegen-barcode (von sprint-05, da Sprint 05 noch nicht abgenommen).

## REQs (alle Should, Abgestimmt)
- Teil A – ohne Netz: REQ-060 (Manueller Eintrag mit Ausgabe-Feldern, Pflicht Titel + Seiten, „Erschienen“ TT.MM.JJJJ, „Hinzugefügt“ überschreibbar), REQ-063 (Verlag/ISBN in Details), REQ-064 (Hinzugefügt in Details)
- Teil B – Barcode: REQ-061 (Option + Scan-Bildschirm), REQ-062 (Suche DNB + Open Library parallel, Auswahlfenster, vorbefüllter Manueller Eintrag)

## Machbarkeit (Entwickler, 2026-11-16)
- Scanner: @capacitor-mlkit/barcode-scanning mit eigener Oberfläche (startScan, Taschenlampe), gebündeltes Modell ohne Play-Dienste-Pflicht; Kompatibilität mit Capacitor 8 vorab prüfen; APK ca. 2–3 MB größer. Neue Abhängigkeit → ADR-Entwurf (Netzzugriff + Scanner).
- Netz: in der APK über CapacitorHttp (kein CORS-Problem). Im Web-Prototyp sind DNB-Abfragen voraussichtlich durch CORS blockiert; Scan und Suche sind daher nur in der APK verlässlich prüfbar.
- Cover: Download per CapacitorHttp, Ablage über ImageStore; ohne Cover Rückfall auf Platzhalter.
- Tests: Scanner und Suche hinter Schnittstellen (BarcodeScanner, IsbnSuche) mit Fakes; Parser per Unit-Test mit Beispieldaten; echte Kamera nur am Gerät.
- Größe: Teil A ≈ Sprint 04 Teil C (ca. 10–14 % Nutzungslimit); Teil B ≈ 1,5–2× davon (ca. 15–25 %).

## Hinweise / kleine Klärungen
- ISBN-10 kann als Prüfziffer „X“ haben → das ISBN-Feld akzeptiert „X“ an letzter Stelle (Korrektur des Scrum-Master-Vorschlags „nur Ziffern“).
- Fehlerhervorhebung Seitenzahl wie bestehend bei „JAHR“ (bleibt hervorgehoben, bis man das Feld ändert).
- Alte AKs, die durch REQ-060/061/064 abgelöst werden: REQ-029 AK-2, REQ-030 AK-2/AK-6, REQ-031 AK-2/AK-5/AK-9, REQ-041 („nicht änderbar“) – Tester passt Tests an bzw. legt sie still.

## Testvorgabe
Lokal nur Tests der Sprint-REQs + Typecheck/Lint; Gegenprobe minimal (3–5 Fehler: Pflichtfelder, ISBN-Prüfziffer, Übernahme der Treffer in den Manuellen Eintrag, Speichern); Sicherheitsnetz CI.

## Nachtrag 2026-11-18 – Teil C: Look & Feel „cozy“ (für den nächsten Prototyp)
CEO: „Plane die Änderung bitte für den nächsten Prototypen mir ein. Es soll Variante B - Fraunces werden.“
- REQ-065 (Should, Abgestimmt): Fraunces lokal (OFL), zentrale Schriftgrößenstufen (12/14/15/17/20/22–26), Abstandsraster, Pillen 36 px (Tippfläche ≥ 44 px), kursive Autoren/Stufentexte, gesperrte Labels, Papier-Körnung, warme Schatten, Zeilenabstand ~1,5.
- REQ-003 angepasst (Systemschrift entfällt).
- Aufwand geschätzt 5–8 % Nutzungslimit; Risiko: Tests mit fest geprüften Pixelwerten müssen angepasst werden.
