---
id: REQ-062
titel: Barcode scannen – Treffer zur ISBN aus dem Internet zur Auswahl anzeigen und ins Blatt „Manueller Eintrag“ übernehmen
status: In Umsetzung
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **nach dem Scannen der ISBN die gefundenen Bücher zur Auswahl sehen und das gewählte mit allen Angaben samt Cover ins Blatt „Manueller Eintrag“ übernehmen**, damit **ich die Angaben nur noch prüfen und bei Bedarf ergänzen muss**.

Vorgabe des CEO (wörtlich, 2026-11-16): „Hier möchte ich den ISBN Code scannen können und du suchst alle Details aus dem Internet samt Coverfoto und füllst entsprechend die Felder aus. Wenn keine Info vorhanden ist, ist dies leer und man kann das Feld manuell bearbeiten.“

CEO-Antworten (wörtlich, 2026-11-16):
- Quelle: „nein, suche dir selbst bitte zuverlässige Quellen und vor allem, wenn ein Buch gefunden wurde, wird es in einem extra Fenster zur Auswahl angezeigt so nach dem Motto: "Schau mal, ich habe diese Bücher für diese ISBN Nummer gefunden, welches möchtest du übernehmen?", natürlich auch mit dem Pfeil zurück.“
- Kein Internet / nichts gefunden: „Dann erscheine ich wieder auf der Übersichtsseite "Bücher"“
- Ablauf: „erst bekomme ich die gefundenen Bücher vorgeschlagen, dann lande ich nach meiner Auswahl auf dem Blatt "Manueller Eintrag" und ich kann ggf. die Felder bearbeiten“

Vom CEO angenommener Vorschlag des Scrum Masters (Datenquellen): Deutsche Nationalbibliothek (SRU-Schnittstelle) und Open Library (inkl. Cover) parallel abfragen, Treffer zusammen im Auswahlfenster mit Quellenhinweis; Google Books später (To-do-Liste). An die Dienste geht nur die ISBN.

Bestätigung des CEO (2026-11-16): „passt alles für mich. bitte für den nächsten Sprint planen.“

## Anforderung (Satzschablone)

**Suche**
- Wenn ein ISBN-Barcode erkannt wurde (REQ-061), muss das System die Angaben zu dieser ISBN gleichzeitig bei der Deutschen Nationalbibliothek und bei Open Library suchen, einschließlich Coverfoto.
- Das System darf an diese Dienste ausschließlich die ISBN übermitteln.

**Auswahlfenster**
- Wenn mindestens ein Buch gefunden wurde, muss das System ein eigenes Auswahlfenster mit allen Treffern beider Quellen anzeigen, auch bei nur einem Treffer.
- Das System muss im Auswahlfenster sinngemäß mitteilen, dass zu dieser ISBN diese Bücher gefunden wurden, und fragen, welches übernommen werden soll (CEO: „so nach dem Motto“; genauer Wortlaut ist kein Akzeptanzkriterium).
- Das System muss zu jedem Treffer die Quelle angeben, aus der er stammt.
- Das System muss im Auswahlfenster einen Zurück-Pfeil anzeigen. Wenn der Nutzer ihn antippt oder die Android-Zurück-Taste betätigt, muss das System die Seite „Bücher“ anzeigen, ohne ein Buch anzulegen.

**Übernahme**
- Wenn der Nutzer einen Treffer antippt, muss das System das Blatt „Manueller Eintrag“ (REQ-030, REQ-060) öffnen und dessen Felder mit den Angaben dieses Treffers ausfüllen; ein vorhandenes Coverfoto wird als Cover übernommen (wie REQ-032).
- Wenn der Treffer einen Preis und/oder ein Format liefert, muss das System auch diese Angaben in den Manuellen Eintrag übernehmen.
- **Format zuordnen.** CEO (wörtlich, 2026-11-25): „Wenn online abrufbar ist, ob der gescannte Code ein Taschenbuch oder Hardcover ist, sollen jeweils dafür entsprechende Standardwerte hergenommen werden.“ Liefert der Treffer eine Formatangabe, muss das System sie dem Format der App zuordnen (**Auslegung**, z. B. Open Library „physical_format“):
  - Taschenbuch-Angaben (z. B. „Paperback“, „Mass Market Paperback“, „Taschenbuch“, „kartoniert“, „Broschur“) → „Print · Taschenbuch“
  - Hardcover-Angaben (z. B. „Hardcover“, „Hardback“, „gebunden“) → „Print · Hardcover“
  - Groß- und Kleinschreibung spielt keine Rolle. Die Liste der erkannten Angaben wird zentral geführt und darf ohne REQ-Änderung erweitert werden.
  - Eine nicht zuordenbare Angabe übernimmt das System nicht; das Format bleibt leer.
- Die Maße aus dem Treffer und die Standardmaße bei fehlenden Maßen regeln REQ-072 und REQ-077.
- Wenn zu einem Feld keine Angabe vorliegt, muss das System dieses Feld leer lassen.
- Das System übernimmt den Autor so, wie die Quelle ihn liefert, ohne die Schreibweise zu vereinheitlichen.
- Das System muss dem Nutzer die Möglichkeit bieten, alle Felder danach von Hand zu bearbeiten. Anlegen, Pflichtangaben und Schließen richten sich nach REQ-030, REQ-031 und REQ-060; das Buch wird erst mit „Hinzufügen“ angelegt.

**Kein Ergebnis**
- Wenn keine Internetverbindung besteht oder zu der ISBN bei keiner Quelle ein Buch gefunden wurde, muss das System die Seite „Bücher“ anzeigen, ohne ein Buch anzulegen.

## Akzeptanzkriterien

### AK-1 Beide Quellen werden abgefragt, nur mit der ISBN
- **Gegeben** die ISBN 9783551551672 wurde erkannt
- **Wenn** die Suche läuft
- **Dann** gehen Anfragen an die Deutsche Nationalbibliothek und an Open Library
- **Und** jede Anfrage enthält außer der ISBN keine Angaben des Nutzers oder seiner Bücher

### AK-2 Auswahlfenster mit allen Treffern und Quelle
- **Gegeben** die Deutsche Nationalbibliothek liefert einen Treffer und Open Library einen Treffer
- **Wenn** die Suche abgeschlossen ist
- **Dann** zeigt das Auswahlfenster beide Treffer, jeweils mit Angabe der Quelle

### AK-3 Auch ein einzelner Treffer wird zur Auswahl angezeigt
- **Gegeben** nur eine Quelle liefert genau einen Treffer
- **Wenn** die Suche abgeschlossen ist
- **Dann** wird das Auswahlfenster mit diesem Treffer angezeigt und das Blatt „Manueller Eintrag“ ist noch nicht geöffnet

### AK-4 Auswahl füllt das Blatt „Manueller Eintrag“
- **Gegeben** ein Treffer mit Titel, Autor, Seitenzahl, Verlag und Coverfoto wird angezeigt
- **Wenn** der Nutzer ihn antippt
- **Dann** ist das Blatt „Manueller Eintrag“ geöffnet, Titel, Autor, Seiten und Verlag sind mit diesen Angaben ausgefüllt und das Coverfoto ist als Cover eingetragen
- **Und** es wurde noch kein Buch angelegt

### AK-5 Fehlende Angaben bleiben leer und alles ist bearbeitbar
- **Gegeben** der gewählte Treffer enthält keinen Verlag
- **Wenn** das Blatt „Manueller Eintrag“ geöffnet ist
- **Dann** ist der Verlag leer
- **Und** der Nutzer kann jedes ausgefüllte und jedes leere Feld ändern

### AK-6 Zurück-Pfeil im Auswahlfenster
- **Gegeben** das Auswahlfenster ist geöffnet
- **Wenn** der Nutzer den Zurück-Pfeil antippt
- **Dann** wird die Seite „Bücher“ angezeigt und es wurde kein Buch angelegt

### AK-7 Nichts gefunden
- **Gegeben** keine Quelle liefert zur erkannten ISBN einen Treffer
- **Wenn** die Suche abgeschlossen ist
- **Dann** wird die Seite „Bücher“ angezeigt und es wurde kein Buch angelegt

### AK-8 Kein Internet
- **Gegeben** es besteht keine Internetverbindung
- **Wenn** eine ISBN erkannt wurde
- **Dann** wird die Seite „Bücher“ angezeigt und es wurde kein Buch angelegt

### AK-9 Preis und Format werden übernommen
- **Gegeben** ein Treffer liefert einen Preis und ein Format, ein zweiter Treffer liefert keines von beiden
- **Wenn** der Nutzer den ersten Treffer antippt
- **Dann** sind Preis und Format im Blatt „Manueller Eintrag“ mit diesen Angaben ausgefüllt
- **Und** wählt der Nutzer stattdessen den zweiten Treffer, bleiben Preis und Format leer

### AK-10 Formatangabe der Quelle wird zugeordnet
- **Gegeben** Treffer mit der Formatangabe „Paperback“, „Hardcover“, „hardcover“ bzw. „Audio CD“
- **Wenn** der Nutzer den jeweiligen Treffer antippt
- **Dann** zeigt die Zeile „Format“ im Manuellen Eintrag „Print · Taschenbuch“, „Print · Hardcover“, „Print · Hardcover“ bzw. bleibt leer

## Abgrenzung (nicht Teil dieses REQ)

- Option im Menü und Scan-Bildschirm (REQ-061).
- Google Books als weitere Quelle (To-do-Liste, Could).
- Gestaltung des Auswahlfensters über die oben genannten Inhalte hinaus; die Optik prüft der CEO im Prototyp.

## Qualitätsanforderungen

- Datenschutz: An externe Dienste wird ausschließlich die gescannte ISBN übermittelt (AK-1).

## Abhängigkeiten

- **REQ-061, REQ-060, REQ-030, REQ-031, REQ-032, REQ-019.**
- **REQ-092, REQ-099 (Entwurf):** Ein geliefertes Jahr geht künftig in „Erschienen“ statt in „JAHR“. Eine gelieferte Reihe führt nicht zu einer automatischen Saga-Zuordnung. Eine gelieferte Bandnummer wird gespeichert und bei der späteren Saga-Zuordnung im Feld „Band“ vorausgefüllt (REQ-099). Dieser REQ wird nach der Abstimmung angepasst.
- **Randbedingung:** erster Internetzugriff der App (Android-Berechtigung, Web-Prototyp). Ob dafür ein ADR nötig ist, entscheidet der Entwickler.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-16 | Erstellt (Entwurf aus der CEO-Antwort zum Änderungsantrag „Buch anlegen“) | Anforderungsmanager |
| 2026-11-16 | CEO-Antworten und angenommener Vorschlag eingearbeitet: Quellen DNB und Open Library, Auswahlfenster mit Quellenhinweis und Zurück-Pfeil, Übernahme ins Blatt „Manueller Eintrag“, kein Internet/nichts gefunden zur Seite „Bücher“. Status „Abgestimmt“ (CEO: „passt alles für mich. bitte für den nächsten Sprint planen.“) | Anforderungsmanager |
| 2026-11-18 | Preis und Format werden übernommen (neu AK-9). CEO auf die Frage „Preis und Format beim Scan nicht übernehmen?“: „doch, sollen auch übernommen werden“. Autor wie geliefert, CEO auf die Frage „Autor-Schreibweise beim Scan vereinheitlichen?“: „nein das ist egal“. Status unverändert | Anforderungsmanager |
| 2026-11-25 | Fehler: Maße nach dem Scan. Formatangabe der Quelle wird Taschenbuch bzw. Hardcover zugeordnet (Auslegung: Liste der Angaben, nicht zuordenbar = leer), damit die passenden Standardmaße greifen (REQ-077). CEO (wörtlich): „wenn die Maße eines Buches nicht online verfügbar sind, sollen bitte die Standardmaße eines Taschenbuches verwendet werden. Wenn online abrufbar ist, ob der gescannte Code ein Taschenbuch oder Hardcover ist, sollen jeweils dafür entsprechende Standardwerte hergenommen werden.“ Anforderung ergänzt, AK-10 neu. Beauftragt (wörtlich): „okay, setze bitte Sprint 11 um als Prototypen“. Status „Abgestimmt“ | Anforderungsmanager |
