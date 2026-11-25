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

## Stand 2026-11-23, 14:50 (pausiert auf Wunsch des CEO)
- Entwickler: Teil A weitgehend umgesetzt. Teil B im Aufbau: Listen-Domain, ListenRepository (InMemory, IndexedDB, SQLite, Rückfall), BibliothekAnsicht, AbschnittListen. Noch nicht verifiziert.
- Tester: Akzeptanztests REQ-091 bis 094 geschrieben. REQ-095 bis 099 und die Anpassung der Alttests stehen noch aus.
- Weiter: Entwickler Teil B fertigstellen → Tester Tests 095–099 und Alttests → Gegenprobe → CI → Prototyp.
- Der WIP-Commit ist nicht CI-grün und darf nicht gemergt werden.

## Erweiterung 2026-11-24 (CEO bestätigt: „passt für mich :)“)
- REQ-098 geändert: Das Plus in einer geöffneten Liste (alle drei Arten) öffnet ein Blatt mit allen Büchern A–Z. Bücher, die schon in der Liste sind, sind vormarkiert. Übernommen wird erst mit „Sichern“.
- REQ-100 neu: Listenbild im Cover-Format. Es wird im Blatt „Liste bearbeiten“ gesetzt und erscheint in der geöffneten Liste, in der Listenübersicht und auf der Seite „Bücher“.
- Prototyp erst auf ausdrückliche Bitte. Bis dahin nur Commit und CI.

## Erweiterung 2026-11-24, Teil C (CEO: „b“ → in Sprint 10 aufnehmen)
- REQ-101 Startseite: Kopf mit Datum, Uhrzeit, Gruß nach Tageszeit mit Namen und Icon
- REQ-102 „Gerade am Lesen“: alle Bücher „am Lesen“, Fortschritt direkt eintragen; ohne Buch der Hinweis „Gerade kein Buch offen“
- REQ-103 „Diese Woche“ und Lesesträhne
- REQ-104 Jahresziel: Kachel und Blatt
- REQ-105 Zitate im Reiter „Notizbuch“
- REQ-106 Zitat des Tages
- REQ-107 Name im Profil, Abschnitt „Du“
- Angepasster Alt-REQ: REQ-043 (AK-3, AK-8)
- Gegenprobe minimal, höchstens 4 Fehler: Zitat speichern/löschen, Zitat des Tages stabil je Tag, Jahresziel-Zählung, Tageszeit-Grenzen
- Prototyp danach für den gesamten Sprint 10 (beauftragt)

## Erweiterung 2026-11-25, Teil D – auf CEO-Wunsch nach Sprint 11 verschoben (wieder herausgenommen) (CEO: „das soll in den nächsten Prototyp mit rein“)
- REQ-108 Gesamt-Streak: Flamme angezündet, ausgegraut oder 0 (Startseite und Statistik)
- REQ-109 Buch-Streak: „Längster Streak für dieses Buch“, gezählt als Rekord
- Angepasste Alt-REQs: REQ-026, 027, 087, 103
- Gegenprobe höchstens 2 Fehler: Zustand ausgegraut/angezündet, Rekordberechnung

## Gesammelte Mini-Änderungen – nach Sprint 11 verschoben (CEO 2026-11-25)
- 2026-11-25: Hauptleiste unten (Start, Bücher …) tiefer setzen, den Abstand von der Schriftunterkante zum Bildschirmrand halbieren. Wortlaut CEO: „Der Abstand zwischen der unteren Kante der Schrift und dem Ende des Bildschirmes müsste bitte halbiert werden.“
- 2026-11-25: Zitate in Anführungszeichen anzeigen. Wortlaut CEO: „Bei den Zitaten hätte ich gerne die Zitate in Anführungszeichen :)“. Gilt im Notizbuch und beim Zitat des Tages, im deutschen Stil „…“ wie in der Konzeptskizze.
- 2026-11-25: Karte „Gerade am Lesen“ (Startseite, REQ-102): Cover etwa 1,5-mal so groß. Seitenzahl bzw. Prozent rechts neben dem Fortschrittsbalken statt darunter. Der Balken nimmt die restliche Breite ein, linksbündig unter Titel und Autor. Konzeptskizze vom CEO bestätigt: „passt, danke“.
