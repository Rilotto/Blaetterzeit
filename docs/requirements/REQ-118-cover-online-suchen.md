---
id: REQ-118
titel: „Cover online suchen“ – Cover-Suchfenster mit Raster aus beiden Quellen und Übernahme als Buchcover
status: In Umsetzung
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **für ein Buch online nach einem Cover suchen und eines davon übernehmen**, damit **ich ein Cover bekomme, ohne es fotografieren zu müssen – auch wenn Kamera und Galerie gesperrt sind**.

CEO (2026-11-26, im Chat festgelegt): Die Option „Cover online suchen“ im Bild-Auswahlmenü (Buchdetails und Manueller Eintrag) öffnet von unten ein Fenster mit Sprachfilter (REQ-119) und Suchzeile. Suchzeile vorbelegt mit der ISBN, falls vorhanden, sonst Titel + Autor; die Suche startet beim Öffnen automatisch; der Text ist änderbar, neue Suche über die Such-Taste. Quellen DNB und Open Library gleichzeitig, nach Sprache gefiltert. Ergebnis: Raster mit 3 Spalten nur mit Covern, bis zu 15, abwechselnd aus beiden Quellen, die andere füllt auf; Treffer ohne Cover entfallen; unter jedem Cover klein die Quelle. Antippen übernimmt das Cover als Buchcover, automatisch auf das Buchformat zugeschnitten (REQ-115), gespeichert, Fenster schließt; sonst ändert sich nichts am Buch. Ein vorhandenes Cover wird ersetzt (wie bei Scannen/Galerie). Ohne Treffer bzw. ohne Internet bleibt das Fenster offen mit Hinweis „Kein Cover gefunden“ bzw. „Keine Internetverbindung“. Im Manuellen Eintrag Vorbelegung aus dem bisher Eingetippten; ist nichts eingetragen, ist die Suchzeile leer und es gibt keinen Autostart. Einziger Weg zu einem Cover, wenn Kamera und Galerie verweigert sind (REQ-016).

Löst die Vorgabe „Cover online suchen … ohne Funktion“ (REQ-015 AK-5, REQ-032 AK-6) und den gleichnamigen To-do-Eintrag ab.

## Anforderung (Satzschablone)

**Aufruf**
- Wenn der Nutzer im Auswahlmenü des Bereichs „Cover“ der Buchdetails (REQ-015) oder im Auswahlmenü des Felds „Cover hinzufügen“ im Blatt „Manueller Eintrag“ (REQ-032) „Cover online suchen“ antippt, muss das System das Auswahlmenü schließen und von unten das Fenster „Cover online suchen“ öffnen.
- Das System darf „Cover online suchen“ in den Auswahlmenüs der Bereiche „Buchrücken“ und „Schnitt“ nicht anbieten (**Auslegung**: der CEO spricht nur vom Buchcover; ein Frontcover als Rücken- oder Schnittbild ergibt keinen Sinn; Änderung in REQ-015 AK-1).

**Aufbau des Fensters**
- Das System muss im Fenster oben den Sprachfilter (REQ-119) und darunter eine Suchzeile anzeigen.
- Das System muss Ziehgriff und Zurück-Pfeil wie im Suchfenster „Online suchen“ (REQ-116) anzeigen (**Auslegung**).

**Vorbelegung und automatischer Start**
- Beim Öffnen aus den Buchdetails muss das System die Suchzeile mit der ISBN des Buches vorbelegen; hat das Buch keine ISBN, mit Titel und Autor, getrennt durch ein Leerzeichen (ohne Autor nur mit dem Titel) (**Auslegung**: Trennzeichen, Fall ohne Autor).
- Beim Öffnen aus dem Blatt „Manueller Eintrag“ muss das System die Suchzeile nach derselben Regel aus den bis dahin eingetippten, noch nicht gespeicherten Angaben (ISBN, Titel, Autor) vorbelegen. Ist keine dieser Angaben eingetragen, bleibt die Suchzeile leer.
- Ist die Suchzeile beim Öffnen nicht leer, muss das System die Suche sofort automatisch starten. Ist sie leer, darf das System nicht suchen.
- Die Tastatur öffnet sich beim Öffnen nur, wenn die Suchzeile leer ist (**Auslegung**).

**Erneut suchen**
- Das System muss dem Nutzer ermöglichen, den Text der Suchzeile zu ändern. Während der Eingabe darf das System nicht suchen.
- Wenn der Nutzer die Such-Taste der Tastatur betätigt und die Suchzeile nicht nur Leerzeichen enthält, muss das System eine neue Suche starten; sie ersetzt die bisherigen Ergebnisse. Bei leerer Suchzeile geschieht nichts (**Auslegung**, wie REQ-116).

**Suche**
- Das System muss gleichzeitig bei der Deutschen Nationalbibliothek (DNB) und bei Open Library suchen, beschränkt auf die im Sprachfilter gewählte(n) Sprache(n) (REQ-119).
- Das System darf an diese Dienste ausschließlich den Suchtext und die Sprachauswahl übermitteln (**Auslegung**, wie REQ-116).
- Während die Suche läuft, muss das System dies im Fenster erkennbar anzeigen (**Auslegung**, wie REQ-116).

**Ergebnis**
- Das System muss nur Treffer mit Coverbild berücksichtigen; Treffer ohne Coverbild entfallen ersatzlos.
- Das System muss höchstens 15 Cover anzeigen, abwechselnd aus beiden Quellen, beginnend mit der DNB (DNB, Open Library, DNB, …), jeweils in der von der Quelle gelieferten Reihenfolge (**Auslegung**: Beginn mit DNB und Reihenfolge wie REQ-117).
- Wenn eine Quelle weniger Cover liefert, muss das System die freien Plätze mit weiteren Covern der anderen Quelle auffüllen. Gibt es insgesamt weniger als 15, zeigt das System entsprechend weniger.
- Das System darf Treffer verschiedener Quellen nicht zusammenführen (**Auslegung**, wie REQ-117).
- Das System muss die Cover als Raster mit 3 Spalten anzeigen, zeilenweise von links nach rechts; das Raster ist scrollbar (**Auslegung**: Scrollen).
- Das System muss unter jedem Cover in kleiner Schrift die Quelle anzeigen, sonst nichts (keine Titel, kein Autor) (**Auslegung**: Quellenbezeichnung wie in REQ-117).

**Übernahme**
- Wenn der Nutzer in den Buchdetails ein Cover antippt, muss das System das Bild als Frontcover (Bereich „Cover“) des Buches übernehmen, automatisch nach REQ-115 auf das Cover-Seitenverhältnis des Buches zuschneiden, dauerhaft speichern (REQ-019) und das Fenster schließen. Die Buchdetails zeigen danach das neue Cover; es ersetzt auch den Cover-Platzhalter in den Buchlisten (REQ-020).
- Ist bereits ein Frontcover hinterlegt, muss das System es ersetzen, wie bei „Scannen“ und „Aus Galerie auswählen“.
- Außer dem Frontcover darf das System am Buch nichts verändern (keine Titel-, Autor-, ISBN- oder sonstigen Angaben aus dem Treffer, kein Rücken- oder Schnittbild).
- Wenn der Nutzer im Blatt „Manueller Eintrag“ ein Cover antippt, muss das System das Bild nach REQ-115 zugeschnitten im Feld „Cover hinzufügen“ anzeigen und für das anzulegende Buch vormerken; das Fenster schließt. Gespeichert wird es wie jedes vorgemerkte Bild erst mit „Hinzufügen“ (REQ-032) (**Auslegung**: im Manuellen Eintrag „vormerken“ statt „speichern“, wie REQ-032). Ein vorgemerktes Bild wird ersetzt; eingetragene Angaben bleiben unverändert.
- Ein manueller Zuschnitt (REQ-017) findet nicht statt (**Auslegung**: der CEO hat „automatisch zugeschnitten“ festgelegt).

**Kein Ergebnis**
- Wenn keine Quelle ein Cover liefert (auch wenn es Treffer ohne Cover gibt), muss das System das Fenster mit der Suchzeile geöffnet lassen und den Hinweis „Kein Cover gefunden“ anzeigen.
- Wenn keine Internetverbindung besteht, muss das System das Fenster mit der Suchzeile geöffnet lassen und den Hinweis „Keine Internetverbindung“ anzeigen.
- Liefert nur eine Quelle wegen eines Fehlers nichts, zeigt das System die Cover der anderen Quelle ohne Hinweis (**Auslegung**, wie REQ-116).

**Schließen ohne Auswahl**
- Wenn der Nutzer den Zurück-Pfeil antippt, die Android-Zurück-Taste betätigt oder das Fenster am Ziehgriff herunterzieht, muss das System das Fenster schließen und zur Ausgangsansicht (Buchdetails bzw. Blatt „Manueller Eintrag“) zurückkehren, ohne das Buch, ein vorgemerktes Bild oder eingetragene Angaben zu verändern (**Auslegung**: Schließwege wie bei den übrigen Blättern). Ist die Tastatur offen, schließt die Android-Zurück-Taste zuerst nur die Tastatur.

**Verweigerter Kamera-/Galeriezugriff**
- Das System muss „Cover online suchen“ unabhängig davon anbieten und ausführen, ob der Zugriff auf Kamera oder Galerie erlaubt ist (REQ-016).

**Icons und Farben**
- Farben über Farbrollen aus zentralen Farbrubriken; Darstellung in allen Farbdesigns und Stilen (REQ-068, REQ-071). Konkrete Farbwerte sind kein Akzeptanzkriterium.

## Akzeptanzkriterien

### AK-1 Option öffnet das Fenster
- **Gegeben** die Buchdetails eines Buches werden angezeigt und das Auswahlmenü des Bereichs „Cover“ ist geöffnet
- **Wenn** der Nutzer „Cover online suchen“ antippt
- **Dann** ist das Auswahlmenü geschlossen und das Fenster „Cover online suchen“ geöffnet
- **Und** es zeigt oben den Sprachfilter (REQ-119) und darunter die Suchzeile

### AK-2 Vorbelegung mit ISBN und automatischer Start
- **Gegeben** ein Buch mit ISBN „9783551551672“, Titel „Harry Potter und der Stein der Weisen“ und Autor „J. K. Rowling“
- **Wenn** der Nutzer in dessen Buchdetails „Cover online suchen“ wählt
- **Dann** steht in der Suchzeile „9783551551672“
- **Und** ohne weitere Eingabe gehen Anfragen an die DNB und an Open Library

### AK-3 Vorbelegung mit Titel und Autor
- **Gegeben** ein Buch ohne ISBN mit Titel „Fourth Wing“ und Autor „Rebecca Yarros“, und im zweiten Durchlauf ein Buch ohne ISBN und ohne Autor mit Titel „Fourth Wing“
- **Wenn** der Nutzer „Cover online suchen“ wählt
- **Dann** steht in der Suchzeile „Fourth Wing Rebecca Yarros“ bzw. „Fourth Wing“
- **Und** die Suche startet automatisch

### AK-4 Neue Suche über die Such-Taste
- **Gegeben** das Fenster zeigt Ergebnisse zur vorbelegten Suche
- **Wenn** der Nutzer den Text in „Onyx Storm“ ändert
- **Dann** wurde während der Eingabe keine Anfrage gesendet
- **Und** nach Betätigen der Such-Taste gehen neue Anfragen mit „Onyx Storm“ an beide Quellen, und das Raster zeigt nur noch deren Ergebnisse

### AK-5 Nur Treffer mit Cover, abwechselnd, höchstens 15
- **Gegeben** die DNB liefert D1–D10, wobei D2 kein Cover hat, und Open Library liefert O1–O10 mit Cover
- **Wenn** die Suche abgeschlossen ist
- **Dann** zeigt das Raster genau 15 Cover in der Reihenfolge D1, O1, D3, O2, D4, O3, D5, O4, D6, O5, D7, O6, D8, O7, D9
- **Und** D2 erscheint nicht

### AK-6 Auffüllen und weniger als 15
- **Gegeben** die DNB liefert D1–D2 mit Cover, Open Library liefert O1–O4 mit Cover
- **Wenn** die Suche abgeschlossen ist
- **Dann** zeigt das Raster genau D1, O1, D2, O2, O3, O4

### AK-7 Raster mit 3 Spalten und Quelle
- **Gegeben** 15 Cover werden angezeigt
- **Wenn** der Nutzer das Fenster betrachtet
- **Dann** stehen sie in 5 Zeilen zu je 3 Spalten
- **Und** unter jedem Cover steht seine Quelle, ohne Titel und ohne Autor

### AK-8 Antippen übernimmt das Cover in den Buchdetails
- **Gegeben** ein Buch mit hinterlegtem Frontcover A, Format „Print · Taschenbuch“ ohne Maße, das Fenster zeigt ein Cover B von 600 × 600 Pixel
- **Wenn** der Nutzer B antippt
- **Dann** ist das Fenster geschlossen und die Buchdetails zeigen im Bereich „Cover“ B statt A
- **Und** B hat das Cover-Seitenverhältnis des Buches (13,8 : 21,8, REQ-115)
- **Und** nach einem Neustart der App ist B weiterhin das Frontcover

### AK-9 Sonst ändert sich nichts am Buch
- **Gegeben** ein Buch mit Titel, Autor, ISBN, Seitenzahl, Rücken- und Schnittbild; der Treffer zu Cover B hat abweichende Angaben
- **Wenn** der Nutzer B übernimmt
- **Dann** sind Titel, Autor, ISBN, Seitenzahl, Lesestatus, Rücken- und Schnittbild unverändert

### AK-10 Kein Cover gefunden
- **Gegeben** keine Quelle liefert einen Treffer, und im zweiten Durchlauf liefern die Quellen nur Treffer ohne Cover
- **Wenn** die Suche abgeschlossen ist
- **Dann** ist das Fenster weiterhin geöffnet, der Suchtext steht noch in der Suchzeile
- **Und** es erscheint der Hinweis „Kein Cover gefunden“

### AK-11 Keine Internetverbindung
- **Gegeben** es besteht keine Internetverbindung
- **Wenn** die Suche startet
- **Dann** ist das Fenster weiterhin geöffnet
- **Und** es erscheint der Hinweis „Keine Internetverbindung“
- **Und** das Frontcover des Buches ist unverändert

### AK-12 Manueller Eintrag: Vorbelegung aus Eingetipptem
- **Gegeben** im Blatt „Manueller Eintrag“ sind Titel „Iron Flame“ und Autor „Rebecca Yarros“ eingetippt, keine ISBN
- **Wenn** der Nutzer über „Cover hinzufügen“ „Cover online suchen“ wählt
- **Dann** steht in der Suchzeile „Iron Flame Rebecca Yarros“ und die Suche startet automatisch

### AK-13 Manueller Eintrag: leer ohne Autostart
- **Gegeben** im Blatt „Manueller Eintrag“ sind weder ISBN noch Titel noch Autor eingetragen
- **Wenn** der Nutzer „Cover online suchen“ wählt
- **Dann** ist die Suchzeile leer
- **Und** es wird keine Anfrage gesendet

### AK-14 Manueller Eintrag: Cover wird vorgemerkt
- **Gegeben** das Fenster wurde aus dem Blatt „Manueller Eintrag“ geöffnet, Titel „Iron Flame“ ist eingetragen
- **Wenn** der Nutzer ein Cover antippt
- **Dann** ist das Fenster geschlossen, das Blatt „Manueller Eintrag“ zeigt im Feld „Cover hinzufügen“ das zugeschnittene Cover, und „Iron Flame“ steht weiterhin im Titelfeld
- **Und** es wurde noch kein Buch angelegt
- **Und** nach „Hinzufügen“ ist das Cover das Frontcover des neuen Buches

### AK-15 Schließen ohne Auswahl ändert nichts
- **Gegeben** das Fenster ist aus den Buchdetails geöffnet und zeigt Ergebnisse
- **Wenn** der Nutzer den Zurück-Pfeil antippt, im zweiten Durchlauf die Android-Zurück-Taste betätigt und im dritten Durchlauf das Fenster am Ziehgriff herunterzieht
- **Dann** sind jeweils wieder die Buchdetails sichtbar
- **Und** das Frontcover ist unverändert

### AK-16 Nur Suchtext und Sprachauswahl werden übermittelt
- **Gegeben** die Suchzeile enthält „9783551551672“
- **Wenn** die Suche läuft
- **Dann** enthält jede Anfrage außer dem Suchtext und der Sprachauswahl keine Angaben des Nutzers oder seiner Bücher

### AK-17 Funktioniert bei verweigertem Kamera- und Galeriezugriff
- **Gegeben** der Zugriff auf Kamera und Galerie ist verweigert
- **Wenn** der Nutzer im Auswahlmenü des Bereichs „Cover“ „Cover online suchen“ wählt und ein Cover antippt
- **Dann** ist das Cover als Frontcover übernommen

## Abgrenzung (nicht Teil dieses REQ)

- Sprachfilter selbst (REQ-119).
- Online-Bilder für Buchrücken und Schnitt.
- Übernahme weiterer Angaben aus dem Treffer (dafür „Online suchen“, REQ-116/REQ-117).
- Nachladen von mehr als 15 Covern.
- Google Books (To-do-Liste).

## Qualitätsanforderungen

- Datenschutz: An externe Dienste gehen ausschließlich Suchtext und Sprachauswahl (AK-16).
- Darstellung in allen Farbdesigns und Stilen (REQ-068, REQ-071).

## Abhängigkeiten

- **REQ-015** (Auswahlmenü Buchdetails; AK-1 und AK-5 angepasst), **REQ-032** (Auswahlmenü Manueller Eintrag; AK-6 angepasst), **REQ-016** (verweigerter Zugriff), **REQ-019, REQ-020** (Speicherung, Buchlisten), **REQ-115** (Zuschnitt), **REQ-116, REQ-117** (Muster Suchfenster und Raster), **REQ-119** (Sprachfilter), **REQ-060, REQ-063** (ISBN), ADR-0002.

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-26 | Erstellt. Inhalte vom CEO am 2026-11-26 im Chat festgelegt, Umsetzung beauftragt. Auslegungen markiert (u. a. Option nur im Bereich „Cover“, Vormerken im Manuellen Eintrag, Schließwege). Status „Abgestimmt“ | Anforderungsmanager |
