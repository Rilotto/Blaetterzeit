---
id: REQ-117
titel: „Online suchen“ – bis zu 15 Treffer im Raster mit 3 Spalten abwechselnd aus beiden Quellen und Übernahme wie beim Barcode-Scan
status: In Umsetzung
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **die Treffer der Online-Suche übersichtlich mit Cover sehen und einen davon übernehmen**, damit **ich das richtige Buch erkenne und seine Angaben nicht abtippen muss**.

CEO (2026-11-25, im Chat festgelegt): höchstens 9 Treffer insgesamt, abwechselnd aus beiden Quellen (DNB, Open Library, DNB, …); liefert eine Quelle weniger, füllt die andere auf. Raster mit 3 Spalten (3×3): je Treffer Cover (sonst Cover-Platzhalter), darunter Titel, Autor und Quelle. Dasselbe Buch aus beiden Quellen erscheint getrennt mit Quellenangabe. Antippen eines Treffers → weiter genau wie nach Auswahl eines Treffers beim Barcode-Scan. Pfeil zurück jeweils eine Stufe zurück.

CEO (2026-11-26, im Chat festgelegt): bis zu 15 statt 9 Treffer; Raster bleibt 3 Spalten (3 × 5), abwechselnd DNB/Open Library, die andere füllt auf; weniger Treffer → weniger angezeigt.

## Anforderung (Satzschablone)

**Auswahl und Reihenfolge**
- Das System muss nach einer Suche (REQ-116) höchstens 15 Treffer anzeigen; gibt es weniger, entsprechend weniger.
- Das System muss die Treffer abwechselnd aus beiden Quellen anordnen, beginnend mit der Deutschen Nationalbibliothek (DNB, Open Library, DNB, …), jeweils in der von der Quelle gelieferten Reihenfolge.
- Wenn eine Quelle weniger Treffer liefert, muss das System die freien Plätze mit den weiteren Treffern der anderen Quelle in deren Reihenfolge auffüllen.
- Das System darf Treffer verschiedener Quellen nicht zusammenführen; dasselbe Buch aus beiden Quellen erscheint als zwei Einträge.

**Darstellung**
- Das System muss die Treffer im Suchfenster unter dem Suchfeld als Raster mit 3 Spalten anzeigen, zeilenweise von links nach rechts (bei 15 Treffern 5 Zeilen). Passen nicht alle Zeilen auf den Bildschirm, ist das Raster scrollbar (**Auslegung**).
- Das System muss je Treffer das Cover anzeigen; liefert der Treffer kein Cover, den Cover-Platzhalter (REQ-010).
- Das System muss unter dem Cover Titel, Autor und Quelle anzeigen. Ohne Autor entfällt die Autorzeile (**Auslegung**). Liefert die Quelle ein Erscheinungsjahr, darf es zusätzlich angezeigt werden (**Auslegung**: optional, kein Akzeptanzkriterium).
- Lange Titel kürzt das System (**Auslegung**: höchstens zwei Zeilen); Optik prüft der CEO im Prototyp.

**Übernahme**
- Wenn der Nutzer einen Treffer antippt, muss das System genau so fortfahren wie nach Antippen eines Treffers im Auswahlfenster des Barcode-Scans (REQ-062, Abschnitt „Übernahme“): Blatt „Manueller Eintrag“ öffnen und mit den Angaben des Treffers ausfüllen, einschließlich Preis und Format, fehlende Angaben leer, alles bearbeitbar; das Coverfoto wird nach REQ-115 zugeschnitten übernommen. Das Buch wird erst mit „Hinzufügen“ angelegt.
- Das Schließen des Blatts „Manueller Eintrag“ richtet sich unverändert nach REQ-030 (**Auslegung**: wie beim Barcode-Scan; X, Android-Zurück-Taste und Herunterziehen führen zur Seite „Bücher“).
- Zurück aus dem Suchfenster: REQ-116.

## Akzeptanzkriterien

### AK-1 Abwechselnd, höchstens 15
- **Gegeben** die DNB liefert die Treffer D1–D10 und Open Library die Treffer O1–O10
- **Wenn** die Suche abgeschlossen ist
- **Dann** zeigt das Raster genau 15 Treffer in der Reihenfolge D1, O1, D2, O2, D3, O3, D4, O4, D5, O5, D6, O6, D7, O7, D8

### AK-2 Auffüllen durch die andere Quelle
- **Gegeben** die DNB liefert D1–D2 und Open Library O1–O20
- **Wenn** die Suche abgeschlossen ist
- **Dann** zeigt das Raster D1, O1, D2, O2, O3, O4, O5, O6, O7, O8, O9, O10, O11, O12, O13

### AK-3 Nur eine Quelle liefert
- **Gegeben** die DNB liefert nichts, Open Library liefert O1–O4
- **Wenn** die Suche abgeschlossen ist
- **Dann** zeigt das Raster O1, O2, O3, O4

### AK-4 Raster mit 3 Spalten und Angaben je Treffer
- **Gegeben** 15 Treffer werden angezeigt
- **Wenn** der Nutzer das Suchfenster betrachtet
- **Dann** stehen sie in 5 Zeilen zu je 3 Spalten
- **Und** jeder Treffer zeigt Cover, Titel, Autor und Quelle

### AK-5 Ohne Cover der Cover-Platzhalter
- **Gegeben** ein Treffer liefert kein Coverfoto
- **Wenn** er angezeigt wird
- **Dann** steht an Stelle des Covers der Cover-Platzhalter (REQ-010)

### AK-6 Gleiches Buch aus beiden Quellen getrennt
- **Gegeben** DNB und Open Library liefern dasselbe Buch
- **Wenn** die Suche abgeschlossen ist
- **Dann** erscheinen zwei Einträge, einer mit Quelle Deutsche Nationalbibliothek, einer mit Quelle Open Library

### AK-7 Antippen übernimmt wie beim Barcode-Scan
- **Gegeben** ein Treffer mit Titel, Autor, Seitenzahl, Verlag, Preis, Format und Coverfoto wird angezeigt
- **Wenn** der Nutzer ihn antippt
- **Dann** ist das Blatt „Manueller Eintrag“ geöffnet und Titel, Autor, Seiten, Verlag, Preis und Format sind mit diesen Angaben ausgefüllt
- **Und** das Coverfoto ist nach REQ-115 zugeschnitten als Cover eingetragen
- **Und** es wurde noch kein Buch angelegt

### AK-8 Fehlende Angaben bleiben leer
- **Gegeben** der gewählte Treffer enthält keinen Verlag
- **Wenn** das Blatt „Manueller Eintrag“ geöffnet ist
- **Dann** ist der Verlag leer und jedes Feld ist bearbeitbar

## Abgrenzung (nicht Teil dieses REQ)

- Suchfenster, Suche, Hinweise und Zurück (REQ-116).
- Weitere Treffer nachladen (mehr als 15) – nicht vorgesehen.
- Sprachfilter (REQ-119): Die Regeln dieses REQ gelten für die bereits nach Sprache gefilterten Treffer.
- Google Books (To-do-Liste).

## Qualitätsanforderungen

- Keine.

## Abhängigkeiten

- REQ-116, REQ-062 (Übernahme), REQ-115 (Cover-Zuschnitt), REQ-010, REQ-030, REQ-031, REQ-060.

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-25 | Erstellt. Inhalte vom CEO am 2026-11-25 im Chat festgelegt, Umsetzung beauftragt. Auslegungen markiert. Status „Abgestimmt“ | Anforderungsmanager |
| 2026-11-26 | Mini-Änderung: bis zu 15 statt 9 Treffer, Raster 3 × 5, scrollbar (**Auslegung**). Titel, Anforderung, AK-1, AK-2, AK-4 und Abgrenzung angepasst; Verweis auf Sprachfilter REQ-119. Inhalte vom CEO am 2026-11-26 im Chat festgelegt, Umsetzung beauftragt. Status „Abgestimmt“ (vorher „Implementiert“) | Anforderungsmanager |
