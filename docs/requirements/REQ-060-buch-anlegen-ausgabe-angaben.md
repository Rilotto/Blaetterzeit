---
id: REQ-060
titel: Manueller Eintrag – Angaben der Karte „Ausgabe“ beim Anlegen eingeben, Seitenzahl Pflicht
status: Abgestimmt
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **beim Anlegen eines neuen Buches alles eingeben können, was später in den Buchdetails im Reiter „Details“ unter „Ausgabe“ steht**, damit **ich diese Angaben nicht erst nachträglich ergänzen muss**.

Vorgabe des CEO (wörtlich, 2026-11-16, Änderungsantrag): „Wenn ich ein neues Buch anlege, egal wie, soll ich nicht nur den Titel, Autor, Coverfoto etc eingeben können sondern alles ausfüllen können, was später auch bei einem Buch im Reiter Details - Ausgabe steht.“

CEO-Antworten (wörtlich, 2026-11-16):
- Wege: „ja aktuell bitte bei "Von Hand Eintragen".“ (Barcode scannen: REQ-061, REQ-062; das Ergebnis landet ebenfalls im Blatt „Manueller Eintrag“)
- Felder: „ja bis auf Fotos.“
- Hinzugefügt: „weiterhin automatisch, ich möchte es aber überschreiben können“
- Darstellung: „einfach das Layout von "Ausgabe" kopieren und zum bestehenden Menü ergänzen“
- Pflichtfelder: „Titel und Seitenzahl“
- Doppelte Angaben: „ändere bitte Erscheinungsdatum in Erschienen, um konsistent zu bleiben. Seiten == Seiten. Wenn die Seitenanzahl fehlt, erscheint es kurz Rot umrandet wie bisher eine Fehlermeldung auch schon umgesetzt wurde.“
- Priorität: „Should“

Bestätigung des CEO (2026-11-16): „passt alles für mich. bitte für den nächsten Sprint planen.“

## Anforderung (Satzschablone)

**Darstellung**
- Das System muss im Blatt „Manueller Eintrag“ (REQ-030) zusätzlich zum bestehenden Inhalt die Karte „Ausgabe“ im Layout des Reiters „Details“ (REQ-056) darstellen, ohne die Zeile „Fotos“.
- Jede Angabe darf im Blatt nur einmal vorkommen. „SEITEN“ und die Zeile „Seiten“ sind dieselbe Angabe (Seitenanzahl, REQ-025).
- Das System muss die bisherige Angabe „ERSCHEINUNGSDATUM“ im Blatt als „Erschienen“ bezeichnen; sie ist dieselbe Angabe wie die Zeile „Erschienen“ der Karte „Ausgabe“ (Erscheinungsdatum, REQ-033). Das Feld „JAHR“ bleibt unverändert.

**Eingabe**
- Das System muss dem Nutzer die Möglichkeit bieten, im Blatt „Manueller Eintrag“ vor dem Anlegen jede Angabe der Karte „Ausgabe“ außer „Fotos“ einzugeben: Seiten, Format, Exemplar, Sonderausgabe, Preis, Verlag, Erschienen, ISBN, Hinzugefügt.
- Die Eingabe erfolgt wie in der kopierten Karte „Ausgabe“: Seiten (REQ-057), Format/Exemplar/Sonderausgabe (REQ-058), Preis (REQ-059), Verlag und ISBN (REQ-063), Hinzugefügt (REQ-064).
- Das System muss dem Nutzer die Möglichkeit bieten, „Erschienen“ als Datum im Format TT.MM.JJJJ einzugeben (CEO 2026-11-10, To-do-Liste). Damit erhält „+ Erscheinungsdatum hinzufügen“ (REQ-030: ohne Funktion) eine Funktion.

**Hinzugefügt**
- Wenn der Nutzer beim Anlegen kein Datum für „Hinzugefügt“ einträgt, muss das System das Eintragungsdatum wie bisher automatisch speichern (REQ-041).
- Das System muss dem Nutzer die Möglichkeit bieten, das Datum für „Hinzugefügt“ beim Anlegen zu überschreiben (Eingabe wie REQ-064); dann wird das eingetragene Datum als Eintragungsdatum gespeichert.

**Pflichtangaben (Änderung gegenüber REQ-031)**
- Titel und Seitenzahl sind Pflichtangaben. Abweichend von REQ-031 („Der Titel ist die einzige Pflichtangabe“) darf das System ohne Seitenzahl kein Buch anlegen.
- Wenn der Nutzer „Hinzufügen“ antippt und keine Seitenzahl eingetragen ist, muss das System das Feld der Seitenzahl so hervorheben wie das ungültige Feld „JAHR“ (REQ-031: Hervorhebung in Primär, kein Hinweistext, Hervorhebung endet, sobald der Nutzer etwas im Feld ändert), kein Buch anlegen und das Blatt mit unveränderten Eingaben geöffnet lassen.
- Unverändert aus REQ-031 bleiben: Verhalten bei fehlendem Titel (Hinweis „Bitte gib einen Titel ein“), Titel nur aus Leerzeichen gilt als leer, Prüfung des Feldes „JAHR“, Standardstatus *ungelesen*, Buchdetails nach dem Anlegen.
- Das Menü „Buchlänge“ (REQ-025) bleibt unverändert für Bücher ohne Seitenzahl (z. B. vorher angelegte).

**Speichern**
- Wenn der Nutzer ein Buch mit „Hinzufügen“ anlegt, muss das System alle eingegebenen Angaben dauerhaft speichern (REQ-034), sodass sie danach im Reiter „Details“ unter „Ausgabe“ stehen.
- Leer gelassene optionale Angaben werden nicht gespeichert.

## Akzeptanzkriterien

### AK-1 Karte „Ausgabe“ im Blatt ohne „Fotos“
- **Gegeben** das Blatt „Manueller Eintrag“ ist geöffnet
- **Wenn** der Nutzer es betrachtet
- **Dann** enthält es zusätzlich zum bisherigen Inhalt die Zeilen Seiten, Format, Exemplar, Sonderausgabe, Preis, Verlag, Erschienen, ISBN, Hinzugefügt
- **Und** die Zeile „Fotos“ fehlt

### AK-2 Keine doppelten Angaben, „Erschienen“ statt „Erscheinungsdatum“
- **Gegeben** das Blatt ist geöffnet
- **Wenn** der Nutzer es betrachtet
- **Dann** gibt es genau eine Eingabe für die Seitenanzahl und genau eine für „Erschienen“
- **Und** die Bezeichnung „Erscheinungsdatum“ kommt im Blatt nicht vor

### AK-3 „Erschienen“ eingeben
- **Gegeben** das Blatt ist geöffnet
- **Wenn** der Nutzer bei „Erschienen“ 15.03.2021 einträgt und das Buch mit Titel und Seitenzahl anlegt
- **Dann** hat das Buch das Erscheinungsdatum 15.03.2021

### AK-4 Angaben werden mit dem Buch gespeichert
- **Gegeben** im Blatt sind Titel, Seitenzahl 320, Format, Exemplar, Preis 12,99 €, Verlag und ISBN eingetragen
- **Wenn** der Nutzer „Hinzufügen“ antippt und im neuen Buch den Reiter „Details“ öffnet
- **Dann** zeigt die Karte „Ausgabe“ genau diese Angaben
- **Und** nach einem Neustart der App sind sie unverändert vorhanden

### AK-5 Ohne Seitenzahl wird kein Buch angelegt
- **Gegeben** im Blatt ist nur der Titel eingetragen, keine Seitenzahl
- **Wenn** der Nutzer „Hinzufügen“ antippt
- **Dann** wird kein Buch angelegt
- **Und** das Feld der Seitenzahl ist in Primär hervorgehoben, ohne Hinweistext
- **Und** das Blatt bleibt geöffnet, die Eingaben bleiben unverändert

### AK-6 Hervorhebung endet bei Eingabe
- **Gegeben** das Feld der Seitenzahl ist nach „Hinzufügen“ hervorgehoben
- **Wenn** der Nutzer etwas in dieses Feld eingibt
- **Dann** ist es nicht mehr hervorgehoben

### AK-7 Titel und Seitenzahl genügen
- **Gegeben** im Blatt sind nur Titel und Seitenzahl eingetragen
- **Wenn** der Nutzer „Hinzufügen“ antippt
- **Dann** wird ein neues Buch mit diesem Titel und dieser Seitenzahl angelegt

### AK-8 „Hinzugefügt“ automatisch
- **Gegeben** im Blatt wurde „Hinzugefügt“ nicht geändert
- **Wenn** der Nutzer das Buch anlegt
- **Dann** ist als Eintragungsdatum das Datum des Anlegens gespeichert

### AK-9 „Hinzugefügt“ überschrieben
- **Gegeben** im Blatt ist für „Hinzugefügt“ der 01.02.2025 eingetragen
- **Wenn** der Nutzer das Buch anlegt
- **Dann** ist der 01.02.2025 als Eintragungsdatum gespeichert

### AK-10 Schließen ohne Speichern verwirft auch die Ausgabe-Angaben
- **Gegeben** im Blatt sind Titel, Seitenzahl und Verlag eingetragen
- **Wenn** der Nutzer das Blatt über X schließt
- **Dann** wurde kein Buch angelegt und keine der Angaben gespeichert

## Abgrenzung (nicht Teil dieses REQ)

- Zeile „Fotos“ (CEO: „bis auf Fotos“; To-do-Liste).
- Anlegen über „Barcode scannen“ (REQ-061, REQ-062).
- Eingabe von Verlag, ISBN, Hinzugefügt in den Buchdetails (REQ-063, REQ-064).
- Konkrete Anordnung im Blatt über „Layout kopieren“ hinaus; die Optik prüft der CEO im Prototyp.

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-030:** Blatt wird ergänzt; AK-2 (Feldliste mit „ERSCHEINUNGSDATUM“) und AK-6 („+ Erscheinungsdatum hinzufügen“ ohne Funktion) werden mit Umsetzung dieses REQ hinfällig.
- **REQ-031:** AK-2 (leere Seiten), AK-5 (nur Titel genügt), AK-9 (ohne Seiten angelegt) werden mit Umsetzung dieses REQ hinfällig.
- **REQ-041:** Eintragungsdatum ist dort „nicht änderbar“; hier beim Anlegen überschreibbar.
- **REQ-025, REQ-033, REQ-034, REQ-056 bis REQ-059, REQ-063, REQ-064.**

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-16 | Erstellt (Entwurf aus dem Änderungsantrag des CEO) | Anforderungsmanager |
| 2026-11-16 | CEO-Antworten eingearbeitet: nur „Von Hand eintragen“, alle Ausgabe-Angaben außer Fotos, „Hinzugefügt“ automatisch und überschreibbar, Layout „Ausgabe“ ins Blatt kopieren, Pflicht Titel und Seitenzahl, Priorität Should | Anforderungsmanager |
| 2026-11-16 | CEO-Antwort 5 eingearbeitet: „Erscheinungsdatum“ heißt „Erschienen“ (Eingabe TT.MM.JJJJ), Seiten nur einmal, fehlende Seitenzahl wie ungültiges „JAHR“ hervorgehoben (AK-2, AK-3, AK-5, AK-6). „Hinzugefügt“-Eingabe nach REQ-064. Status „Abgestimmt“ (CEO: „passt alles für mich. bitte für den nächsten Sprint planen.“) | Anforderungsmanager |
