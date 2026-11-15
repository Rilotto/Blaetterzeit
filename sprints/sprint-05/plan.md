# Sprint 05 – Buchdetails: Rezension und Details

Sprintziel: In den Buchdetails gibt es die Reiterleiste. Der Reiter „Rezension“ hat die Bewertung (14 Kriterien) und die eigene Rezension, der Reiter „Details“ hat Genres, Tropes, Inhaltswarnungen, Sammlungen/Bibliotheken und die Karte „Ausgabe“ mit den Blättern Seiten, Preis und Format.

Freigabe CEO 2026-11-15: „Signiert soll bitte nicht umgesetzt werden. Der Rest ist in Ordnung. Plane damit den nächsten Sprint …“
Branch: sprint-05/rezension-details (abgezweigt von sprint-04/buchdetails-fortschritt, da Sprint 04 noch nicht abgenommen/gemergt ist).

## REQs
- Teil A – Reiter und Rezension: REQ-043, 044, 045, 046, 047, 048, 049
- Teil B – Reiter Details: REQ-051, 052, 053, 055, 056, 057, 058, 059
- Nicht im Sprint (Could, Entwurf, To-do): REQ-050 Teilen, REQ-054 Auswahlfenster Genres/Tropes/Warnungen

## Machbarkeit (Entwickler, 2026-11-15)
- Datenmodell: neue Migration (SQLite + IndexedDB) für Bewertungen, Rezension, Format/Exemplar/Sonderausgabe, Preis – Muster wie REQ-041.
- Icons: benötigte Material Symbols einzeln lokal ablegen (kein CDN, keine neue Abhängigkeit); Chili selbst gezeichnet. 14 neue Farbrubriken in src/theme/farben.ts, blasse Töne berechnet.
- BuchDetails.tsx wird in Reiter-Komponenten aufgeteilt.
- Gefüllte Genre-/Tropes-Pillen sind ohne Auswahlfenster (REQ-054) nur über Daten befüllbar; im Prototyp ohne Testbücher daher nicht sichtbar.
- Größe: Teil A und Teil B je etwa wie Sprint 04 Teil C.

## Testvorgabe
Lokal nur Tests der Sprint-REQs + Typecheck/Lint; Gegenprobe minimal (3–5 Fehler, nur Kernfunktion: Speichern, Bewertung setzen/zurücksetzen, Format-Auswahl); Sicherheitsnetz CI.

## Risiken
- Eingriff in bestehende Logik: REQ-057 (Seitenzahl ändern wirkt auf Fortschritt; kleiner als aktuelle Seite → nicht sicherbar).
- Umfang: ca. 20–28 % Nutzungslimit gesamt (Schätzung auf Basis Teil C).
