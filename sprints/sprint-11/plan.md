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
- NEU (Funktion, voller Weg mit Tester), 2026-11-25: Karte „Ausgabe“ in den Buchdetails bekommt eine neue Zeile „Band“ direkt unter „Exemplar“. Wortlaut CEO: „Der Band soll aus dem ISBN Code auch ausgelesen werden, sofern er hinterlegt ist“.
  - Entscheidung CEO: „a“, also eine Bandnummer pro Buch. Zeile „Band“ und Saga zeigen immer denselben Wert; eine Änderung an einer Stelle ändert ihn auch an der anderen. Betrifft REQ-096, 097 und 099; die bisherige Zugehörigkeit.band je Saga wird damit abgelöst.
  - Auslegung, vom CEO ohne Gegenrede: Pfeil, Ändern und Leeren über ein Blatt wie bei „Verlag“; die Zeile erscheint auch im Manuellen Eintrag; Barcode-Scan füllt sie wie bisher Buch.bandnummer; ganze Zahl ab 1. Ein Buch in mehreren Sagas hat dort überall denselben Band.
- NEU (kleine Funktion), 2026-11-25: In Profil › App kommt eine neue Zeile „Versionsinfo“. Wortlaut CEO: „in dieser ist immer die jeweilige Appversion fest hinterlegt und kann auch nicht geändert werden manuell. Die App hat aktuell 0.11“.
  - Auslegung:
    - Die Zeile ist nur zur Anzeige da: kein Pfeil, keine Funktion beim Antippen.
    - Der Wert stammt aus einer einzigen Quelle im Build, nämlich package.json „version“. Daraus werden auch versionName der APK und das Release-Tag abgeleitet, damit beide nie auseinanderlaufen.
    - Aktueller Stand: 0.11.0. Angezeigt wird „0.11“, die Patch-Stelle nur, wenn sie größer als 0 ist.
- NEU (kleine Funktion), 2026-11-25: Standard-Zitat. Wortlaut CEO: „Füge bitte als Standard-Zitat folgendes ein: "Ein Drache ohne seinen Reiter ist tragisch. Ein Reiter ohne seinen Drachen ist tot." - Kodex des Drachenreiters / Fourth Wing“
  - Auslegung:
    - Die Kachel „Zitat des Tages“ auf der Startseite (REQ-106) zeigt dieses Zitat, solange keine eigenen Zitate gespeichert sind. Bisher entfiel die Kachel in diesem Fall.
    - Sprecher: „Kodex des Drachenreiters“. Buch: „Fourth Wing“.
    - Das Standard-Zitat ist nicht im Notizbuch eines Buches gespeichert. Antippen öffnet deshalb nichts.
    - Sobald es mindestens ein eigenes Zitat gibt, gilt wieder die normale Auswahl aus den eigenen Zitaten.
- BUG, 2026-11-25: Maße nach dem Barcode-Scan. Wortlaut CEO: „wenn die Maße eines Buches nicht online verfügbar sind, sollen bitte die Standardmaße eines Taschenbuches verwendet werden. Wenn online abrufbar ist, ob der gescannte Code ein Taschenbuch oder Hardcover ist, sollen jeweils dafür entsprechende Standardwerte hergenommen werden.“
  - Bezug: REQ-077 (Standardmaße je Format, ohne Format gilt Taschenbuch) und REQ-062 (Barcode-Scan).
  - Auslegung:
    - Liefert die Online-Abfrage ein Format (z. B. Open Library „physical_format“: Paperback oder Hardcover), setzt der Scan das Format entsprechend (Print › Taschenbuch bzw. Hardcover).
    - Liefert die Abfrage keine Maße, gelten die Standardmaße dieses Formats, ohne Format die des Taschenbuchs.
    - Online gefundene Maße haben Vorrang.
  - Der Entwickler prüft zuerst, warum es heute nicht greift: ob das Format beim Scan nicht gesetzt wird oder ob die Standardmaße nicht angezeigt bzw. verwendet werden.
