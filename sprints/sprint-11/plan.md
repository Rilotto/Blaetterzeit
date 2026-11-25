# Sprint 11 – Streak und Feinschliff

Grundlage: Der CEO hat am 2026-11-25 entschieden: „die Streak änderung soll erst für den nächsten Prototypen im Sprint 11 erfolgen“ und „auch diese Änderungen sollen erst im nächsten Prototypen eingebaut werden“.
Branch: sprint-11/streak-und-feinschliff, abgezweigt von sprint-10/abschluss. Der Code für REQ-108/109 kommt über Revert-of-Revert zurück.

## REQs
- REQ-108 Gesamt-Streak: Flamme angezündet, ausgegraut oder 0. Bereits umgesetzt und getestet (Sprint 10, Teil D).
- REQ-109 Buch-Streak „Längster Streak für dieses Buch“ als Rekord. Bereits umgesetzt und getestet.

## Mini-Änderungen (leichter Weg, CLAUDE.md Punkt 4)
1. Hauptleiste unten tiefer setzen: Abstand Schriftunterkante–Bildschirmrand halbieren (REQ-002).
2. Zitate in Anführungszeichen „…“, im Notizbuch und beim Zitat des Tages (REQ-105/106).
3. Karte „Gerade am Lesen“ (REQ-102): Cover ca. 1,5-mal so groß, Seitenzahl bzw. % rechts neben dem Balken, Balken linksbündig und volle Restbreite. Konzept vom CEO bestätigt.

## Ablauf
Start erst, wenn der CEO es sagt. Danach CI und Prototyp.

## Technische Aufgabe: Update-Test in der CI (CEO 2026-11-25: „ja bitte“)
Die CI baut die vorherige und die neue Version, signiert beide mit demselben Testschlüssel und installiert sie nacheinander im Android-Emulator. Dabei werden Daten angelegt, und es wird geprüft, dass Bücher, Sitzungen, Listen und Zitate nach dem Update erhalten sind. Ziel: Updates ohne Neuinstallation und ohne Datenverlust absichern (To-do vom 2026-11-10).

## Nachtrag 2026-11-25: Paletten und Hell/Dunkel (Wünsche vom 2026-11-23, waren nicht übergeben)
- REQ-068 erweitert: neue Designs „Minztraube“ (hell) und „Traubennacht“ (dunkel)
- REQ-110 neu: Pillen „Hell“ und „Dunkel“ in der Farbauswahl
- Gegenprobe höchstens 1 Fehler: Auswahl des Designs bleibt gespeichert

## Gesammelte Punkte für den nächsten Durchlauf
- BUG (High), 2026-11-25: Buchdetails, Kennzahlen-Box: Die Beschriftung „Längster Streak für dieses Buch“ läuft über die Box hinaus und überlappt „gelesen“.
  - Beschriftung ändern in „Längste Serie“ (REQ-109). Wortlaut CEO: „Ändern wir den Text bitte unter der Flamme zu Längste Serie. Wenn der Text nicht in die Boxen passt, sollen sinnvolle Zeilenumbrüche mit Silbentrennung entstehen.“
  - Auslegung: Der Umbruch mit Silbentrennung (lang="de", hyphens:auto) gilt für alle Beschriftungen in Kennzahlen-Boxen der App (Buchdetails, Statistik-Kacheln, Startseite). Text läuft nie über die Box hinaus.
- BUG (High), 2026-11-25: Geöffnete Liste (REQ-098), Rasteransicht: Es stehen nur 2 Bücher nebeneinander, dazwischen eine große Lücke.
  - Wortlaut CEO: „Es sollen immer drei Bücher nebeneinander passen in den Listen. Hier muss das aber dynamisch an das Handy anpassbar sein, falls jemand ein schmaleres Handy haben sollte.“
  - Auslegung: immer 3 Spalten. Cover, Abstände und Schrift skalieren mit der Bildschirmbreite (Cover-Seitenverhältnis 2:3 bleibt). Gilt für die Rasteransicht aller Listen (Sagas, Sammlungen, Bibliotheken) und für die Rasteransicht auf der Seite „Bücher“ (CEO: „auch für die Rasteransicht auf der Seite Bücher“).
- BUG (High), 2026-11-25: App-weite Silbentrennung und Textumbrüche. Wortlaut CEO: „Allgemein muss bitte eine Prüfung Appweit eingebaut werden, bezüglich der Silbentrennung und Textumbrüchen, wenn der Platz ausgeht.“
  - Beispiel: Rezension, Kriterium „Hauptfiguren“ bricht als „Hauptfigur / en“ um, ohne Trennstrich und an falscher Stelle. Richtig wäre „Haupt- / figuren“.
  - Auslegung:
    - Dokumentsprache Deutsch, also lang="de".
    - App-weit `hyphens: auto` für Fließtext und Beschriftungen.
    - Kein Umbruch mitten im Wort ohne Trennstrich (kein `word-break: break-all` und kein `overflow-wrap: anywhere` ohne Silbentrennung).
    - Text läuft nie über seine Box hinaus.
    - Zusätzlich eine automatische Prüfung (Test), die diese Regeln app-weit absichert, z. B. lang="de", eine globale Trennregel und keine verbotenen Umbruchregeln.
  - Schließt den Punkt „Längste Serie“ (Kennzahlen-Box) mit ein.
