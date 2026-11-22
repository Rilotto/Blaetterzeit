# Sprint 09 – Seite „Statistik“

Auftrag CEO 2026-11-22: „alright, dann baue mir bitte den nächsten Prototypen“ (nach Abstimmung der Statistik-REQs).
Branch: sprint-09/statistik (von sprint-08/3d-ansicht; Sprint 07/08 noch nicht gemergt bzw. abgenommen).

## REQs (Should, In Umsetzung): REQ-079 bis REQ-090
- Teil A – Daten/Logik: REQ-085 „Beendet am“ (Buchfeld, automatisch bei Status Gelesen, Datumsblatt in Ausgabe), REQ-084 Seitenberechnung (Sessions speichern künftig die Seite; Stapel „in Sessions“ / „aus beendeten Büchern“), Kennzahlen/Vergleich/Lesetage/Serie (REQ-081, 082, 086, 087) als reine Funktionen.
- Teil B – Oberfläche: REQ-079 Kopf/Pillen, REQ-080 Zeitraum-Navigation, REQ-083 Balkendiagramm, REQ-088 Kalender Woche/Monat mit Covern, REQ-089 Jahreskalender mit Punkten, REQ-090.

## Testvorgabe
Lokal nur Sprint-REQs + betroffene alte Tests; Gegenprobe minimal (Seitenberechnung ohne Doppelzählung, Montag als Wochenstart, Vergleich ins Minus, Lesetage ohne nachgetragene Bücher). CI als Sicherheitsnetz. Prototyp am Ende (beauftragt).

## Risiken
Datumslogik (Wochenstart Montag, Monatsgrenzen, Zeitzonen); Migration Sitzungen mit Seite; Aufwand ca. 15–20 % Nutzungslimit.
