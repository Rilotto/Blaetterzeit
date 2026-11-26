# Sprint 12 – Review

**Stand:** 2026-11-25 · `npm run verify` lokal grün (256 Testdateien, 2964 Tests, Traceability OK). Kein Prototyp (CEO-Vorgabe).

## Umgesetzt (Status „Implementiert“)
| Thema | REQs | Ergebnis |
|---|---|---|
| S12-1 Platzhalter „Noch zu lesen“ öffnet Menü „Buch hinzufügen“ | REQ-011 (AK-3) | Mini-Änderung, identisch zum „+“ |
| S12-2 „„Für dich“ anpassen“ | REQ-114, REQ-005 (AK-10) | Tester grün, Gegenprobe 5/5 |
| S12-3 Standardmaße 13,8 × 21,8 cm | REQ-077, REQ-073, REQ-072 (Beispiel) | Mini-Änderung |
| S12-3 Zuschnitt auf Seitenverhältnis | REQ-115 | Tester grün, Gegenprobe 5/5 |
| S12-4 Online suchen | REQ-116, REQ-117 | Tester grün, Gegenprobe 5/5 |

## Behobene Befunde aus den Tests
- B1 (REQ-114): Speichern vor dem Laden der Auswahl konnte sie überschreiben → Speichern erst nach dem Laden wirksam.
- B2 (REQ-115): Neuzuschnitt lief auch bei fehlgeschlagenem Speichern → nur noch nach Erfolg.
- REQ-007 AK-7: Filtername „Für dich“ war fest eingebaut → kommt aus der Filterkonfiguration.

## Auf dem Gerät zu prüfen
- Online-Suche mit echten Antworten von DNB (Freitext-Abfrage `woe=…` ungetestet) und Open Library.
- Tastatur sofort offen; Android-Zurück schließt zuerst die Tastatur; Titelkürzung auf 2 Zeilen.
- Echter Canvas-Zuschnitt der Cover (in jsdom nicht prüfbar).

## Hinweise / Auslegungen
- Bestehende Cover werden erst bei der nächsten Änderung von Format, Maßen oder Seitenzahl zugeschnitten.
- Rücken und Schnitt werden bei Formatänderung ebenso neu zugeschnitten, auch eigene Fotos.
- Open-Library-Treffer sind Werke: Verlag, Seitenzahl und Jahr passen nicht immer zur eigenen Ausgabe.
- Die Ergebnisse erscheinen erst, wenn bis zu 9 Cover geladen sind.
