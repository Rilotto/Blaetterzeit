# Sprint 10 – Felder bearbeiten und Listen (Sagas, Sammlungen, Bibliotheken)

Freigabe durch den CEO am 2026-11-23: „okay, freigegeben. Starte mit dem nächsten Prototypen“. Der Prototyp ist damit beauftragt.
Branch: sprint-10/listen-und-felder, abgezweigt von main (nach dem Merge von Sprint 09).

## REQs (Abgestimmt → In Umsetzung)
- **Teil A – Felder:**
  - REQ-091 Pfeile an allen Zeilen der Ausgabe-Karte, auch im Manuellen Eintrag
  - REQ-092 „Erschienen“ als Datum oder Jahr; das Feld „Jahr“ entfällt
  - REQ-093 Felder leeren; Titel und Seitenzahl bleiben Pflicht; Bücher ohne Eintragungsdatum stehen oben, A–Z
  - REQ-094 Titel und Autor unter dem Cover ändern; Platzhalter „unbekannter Autor“
- **Teil B – Listen:**
  - REQ-095 Abschnitt „Sagas, Sammlungen und Bibliotheken“
  - REQ-096 Blatt „Zu einer … hinzufügen“
  - REQ-097 Listenübersicht, Seite „Bücher“ mit „Alle ansehen ›“, Menüpunkt „Bibliothek“
  - REQ-098 geöffnete Liste mit Suche, Sortierung (A–Z oder nach Bänden) und Stift zum Umbenennen oder Löschen
  - REQ-099 Band und Saga unter dem Autor; Band aus dem Barcode-Scan

## Testvorgabe
- Lokal laufen nur die Tests der Sprint-REQs und die direkt betroffenen alten Tests.
- Gegenprobe minimal, höchstens 5 Fehler:
  - Liste speichern bzw. Zugehörigkeit
  - Liste löschen, die Bücher bleiben
  - Sortierung nach Bänden
  - Leeren entfernt den Wert
  - Datum oder Jahr bei „Erschienen“
- Die CI ist das Sicherheitsnetz.

## Risiken
- Neue Datenhaltung für Listen und Zugehörigkeit mit Band: Migration für SQLite und IndexedDB.
- Viele alte REQs sind angepasst (Feld „Jahr“, Leeren, „Bibliothek“). Rote Alttests sind zu erwarten.
- Größerer Sprint. Geschätzter Aufwand: etwa wie Sprint 09.
