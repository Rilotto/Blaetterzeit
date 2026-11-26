---
id: REQ-116
titel: Menü „Buch hinzufügen“ – Option „Online suchen“ und Suchfenster
status: Implementiert
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **ein Buch über Titel, Autor oder ISBN online suchen**, damit **ich auch ohne Barcode schnell an die Angaben samt Cover komme**.

CEO (2026-11-25, im Chat festgelegt): „Online suchen“ öffnet von unten ein Fenster mit Suchfeld, Tastatur sofort offen; Eingabe Titel, Autor oder ISBN (auch kombiniert); Suche über die Such-Taste der Tastatur; Abfrage gleichzeitig bei Deutscher Nationalbibliothek und Open Library wie REQ-062; an die Dienste geht nur der Suchtext; ohne Internet oder ohne Treffer bleibt das Fenster offen mit kurzem Hinweis; Pfeil zurück jeweils eine Stufe zurück. Ergebnisse und Übernahme: REQ-117.

Referenzbild Menü: [referenzen/REF-buch-anlegen-01-menue.png](referenzen/REF-buch-anlegen-01-menue.png).

## Anforderung (Satzschablone)

**Option im Menü**
- Das System muss im Menü „Buch hinzufügen“ (REQ-029, REQ-061) zusätzlich die Option „Online suchen“ mit dem Untertitel „Finde fast jedes Buch“ und einem nachgebildeten Lupen-Icon anzeigen, im Stil der übrigen Optionen (**Auslegung**: Untertitel, Icon und Position an erster Stelle wie im Referenzbild).
- Wenn der Nutzer „Online suchen“ antippt, muss das System das Menü schließen und von unten das Suchfenster öffnen. Das gilt auch, wenn das Menü über den Leere-Liste-Platzhalter geöffnet wurde (REQ-011).

**Suchfenster**
- Das System muss im Suchfenster einen Zurück-Pfeil und ein Suchfeld anzeigen; beim Öffnen hat das Suchfeld den Fokus und die Tastatur ist sofort offen.
- Das System muss über dem Suchfeld den Sprachfilter „Sprache“ (REQ-119) anzeigen; die Suche ist auf die dort gewählte(n) Sprache(n) beschränkt (seit 2026-11-26).
- Das System muss als Suchtext Titel, Autor oder ISBN sowie Kombinationen daraus annehmen.
- Das System darf während der Eingabe nicht suchen. Wenn der Nutzer die Such-Taste der Tastatur betätigt und das Suchfeld nicht nur Leerzeichen enthält, muss das System die Suche starten; bei leerem Suchfeld geschieht nichts (**Auslegung**).
- Das System muss den Suchtext gleichzeitig bei der Deutschen Nationalbibliothek und bei Open Library suchen (wie REQ-062).
- Das System darf an diese Dienste ausschließlich den Suchtext und die Sprachauswahl (REQ-119) übermitteln.
- Während die Suche läuft, muss das System dies im Fenster erkennbar anzeigen (**Auslegung**).
- Eine neue Suche ersetzt die bisherigen Ergebnisse (**Auslegung**).

**Kein Ergebnis**
- Wenn keine Quelle einen Treffer liefert, muss das System das Suchfenster mit Suchtext geöffnet lassen und kurz den Hinweis „Keine Bücher gefunden“ anzeigen (**Auslegung**: Wortlaut).
- Wenn keine Internetverbindung besteht, muss das System das Suchfenster mit Suchtext geöffnet lassen und kurz den Hinweis „Keine Internetverbindung“ anzeigen (**Auslegung**: Wortlaut).
- Liefert nur eine Quelle wegen eines Fehlers nichts, zeigt das System die Treffer der anderen Quelle ohne Hinweis (**Auslegung**).

**Zurück**
- Wenn der Nutzer im Suchfenster den Zurück-Pfeil antippt, die Android-Zurück-Taste betätigt oder das Fenster am Ziehgriff herunterzieht, muss das System das Suchfenster schließen und das Menü „Buch hinzufügen“ wieder geöffnet anzeigen (eine Stufe zurück; Plus-Schaltfläche zeigt „×“), ohne ein Buch anzulegen (**Auslegung**: Stufe vor dem Suchfenster ist das Menü; Schließwege wie bei anderen Blättern).
- Ist die Tastatur offen, schließt die Android-Zurück-Taste zuerst nur die Tastatur (**Auslegung**, Android-Standard).

**Icons und Farben**
- Icon nachgebildet im Stil der übrigen Icons (REQ-005), ohne Icon-Bibliothek. Farben über Farbrollen aus zentralen Farbrubriken wie bei den übrigen Optionen (REQ-029, REQ-061); konkrete Farbwerte sind kein Akzeptanzkriterium.

## Akzeptanzkriterien

### AK-1 Option im Menü
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** der Nutzer die Plus-Schaltfläche antippt
- **Dann** enthält das Menü „Buch hinzufügen“ die Optionen „Online suchen“ (Untertitel „Finde fast jedes Buch“), „Barcode scannen“ und „Von Hand eintragen“, „Online suchen“ an erster Stelle
- **Und** „Deine Bücher importieren“ wird nicht angezeigt

### AK-2 Option öffnet das Suchfenster mit offener Tastatur
- **Gegeben** das Menü „Buch hinzufügen“ ist geöffnet
- **Wenn** der Nutzer „Online suchen“ antippt
- **Dann** ist das Menü geschlossen und das Suchfenster geöffnet
- **Und** das Suchfeld hat den Fokus (Tastatur offen)

### AK-3 Suche erst mit der Such-Taste
- **Gegeben** das Suchfenster ist geöffnet
- **Wenn** der Nutzer „Harry Potter Rowling“ eintippt
- **Dann** wurde noch keine Anfrage gesendet
- **Und** nach Betätigen der Such-Taste gehen Anfragen an die Deutsche Nationalbibliothek und an Open Library

### AK-4 Nur Suchtext und Sprachauswahl werden übermittelt
- **Gegeben** der Suchtext „9783551551672“
- **Wenn** die Suche läuft
- **Dann** enthält jede Anfrage außer dem Suchtext und der Sprachauswahl (REQ-119) keine Angaben des Nutzers oder seiner Bücher

### AK-5 Leeres Suchfeld
- **Gegeben** das Suchfeld ist leer oder enthält nur Leerzeichen
- **Wenn** der Nutzer die Such-Taste betätigt
- **Dann** wird keine Anfrage gesendet

### AK-6 Keine Treffer
- **Gegeben** keine Quelle liefert einen Treffer
- **Wenn** die Suche abgeschlossen ist
- **Dann** ist das Suchfenster weiterhin geöffnet, der Suchtext steht noch im Feld
- **Und** kurz erscheint „Keine Bücher gefunden“

### AK-7 Kein Internet
- **Gegeben** es besteht keine Internetverbindung
- **Wenn** der Nutzer eine Suche startet
- **Dann** ist das Suchfenster weiterhin geöffnet
- **Und** kurz erscheint „Keine Internetverbindung“
- **Und** es wurde kein Buch angelegt

### AK-8 Zurück führt eine Stufe zurück
- **Gegeben** das Suchfenster ist geöffnet (mit oder ohne Ergebnisse)
- **Wenn** der Nutzer den Zurück-Pfeil antippt
- **Dann** ist das Suchfenster geschlossen und das Menü „Buch hinzufügen“ geöffnet, die Plus-Schaltfläche zeigt „×“
- **Und** es wurde kein Buch angelegt

## Abgrenzung (nicht Teil dieses REQ)

- Darstellung der Treffer und Übernahme (REQ-117).
- Option „Deine Bücher importieren“ (To-do-Liste).
- Google Books als weitere Quelle (To-do-Liste).

## Qualitätsanforderungen

- Datenschutz: An externe Dienste werden ausschließlich Suchtext und Sprachauswahl übermittelt (AK-4).

## Abhängigkeiten

- REQ-029 (Menü; dessen AK-2 „genau eine Option“ ist wie bereits durch REQ-061 hinfällig), REQ-061, REQ-062 (Quellen), REQ-011 (Öffnen über den Platzhalter), REQ-117, REQ-119 (Sprachfilter).

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-25 | Erstellt. Inhalte vom CEO am 2026-11-25 im Chat festgelegt, Umsetzung beauftragt. Auslegungen markiert. Status „Abgestimmt“ | Anforderungsmanager |
| 2026-11-26 | Sprachfilter „Sprache“ über dem Suchfeld ergänzt (Verweis auf REQ-119); übermittelt werden Suchtext und Sprachauswahl (Anforderung, AK-4, Qualität angepasst). Trefferzahl 15 statt 9 siehe REQ-117. Inhalte vom CEO am 2026-11-26 im Chat festgelegt, Umsetzung beauftragt. Status „Abgestimmt“ (vorher „Implementiert“) | Anforderungsmanager |
