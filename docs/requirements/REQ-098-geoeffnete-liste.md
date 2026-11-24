---
id: REQ-098
titel: Geöffnete Liste – Übersicht wie „Gerade am Lesen“, Sortierung (Sagas auch nach Band), Umbenennen und Löschen über den Stift
status: In Umsetzung
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **die Bücher einer Saga, Sammlung oder Bibliothek sehen, sortieren und die Liste umbenennen oder löschen**, damit **ich meine Listen pflegen kann**.

CEO (wörtlich, 2026-11-23): „5. Wenn ich dann auf eine Liste klicke, öffnet sich das Übersichtsmenü wie bereits in "Bücher" in der Pille "gerade am Lesen" etc. umgesetzt.“

CEO-Antworten (wörtlich, 2026-11-23):
- „Die Reihenfolge würde ich daher als Filteroption gerne geben. Entweder von A-Z oder nach Bänden (erster zuerst).“
- „wenn ich in einer Liste drin bin, möchte ich rechts nebendran ein Stift symbol haben, um den Titel zu ändern.“
- „Ich brauche alles davon“ (Elemente der Übersicht).

Vom CEO am 2026-11-23 bestätigtes Konzept, Punkt 5: Filter, Suche, Sortierung und Plus wie in der Übersicht. Sortierung bei Sagas A–Z oder nach Bänden, sonst A–Z. In der Bücherliste einer Saga steht nur der Buchtitel, ohne „Band X“ (CEO, Antwort b). Der Stift öffnet ein Blatt zum Umbenennen mit „Sichern“, darunter „Liste löschen“. Vor dem Löschen kommt eine Rückfrage, die Bücher bleiben erhalten.

## Anforderung (Satzschablone)

**Aufbau**
- Wenn der Nutzer eine Liste öffnet (REQ-097), muss das System ihre Bücher in einer Übersicht nach dem Muster der Übersichten im Reiter „Bücher“ (REQ-036 bis REQ-038) anzeigen: Raster- und Listenansicht, Suchfeld, Anzahlzeile, Plus-Schaltfläche und Sortierknopf.
- Das System darf in einer geöffneten Liste keine Filterleiste darstellen. CEO (wörtlich, 2026-11-23) auf die Frage, ob die Filterpillen wegfallen: „ja fallen weg“.
- Die Plus-Schaltfläche legt in einer geöffneten Liste nie ein Buch an (CEO, wörtlich, 2026-11-23: „Ein neues Buch soll nur über das "+" bei Bücher angelegt werden können.“).
- **Plus in einer geöffneten Saga: Bücher hinzufügen.** CEO (wörtlich, 2026-11-23, Änderung): „wenn ich in einer Saga drin bin in der Listenansicht und die Bücher darin sehe, soll das "+" nicht zum anlegen einer neuen Saga sein. Stattdessen sollen mir alle Bücher von A-Z als Scrollbare Liste angezeigt werden. Wenn ich diese dann antippe, werden diese gehighlightet und die Auswahl der Bücher wird der Liste hinzugefügt. Ein erneutes Tippen auf ein ausgewähltes Buch entmarkiert es.“
  - Gilt für alle Listenarten: Saga, Sammlung und Bibliothek. CEO (2026-11-24) auf die Frage, ob das auch für Sammlungen und Bibliotheken gilt: „ja“. Das Plus legt in keiner Listenart eine neue Liste an. Neue Listen entstehen über „+“ in der Listenübersicht (REQ-097) oder im Blatt aus REQ-096.
  - Wenn der Nutzer in einer geöffneten Liste das Plus antippt, muss das System eine scrollbare Liste aller gespeicherten Bücher A–Z nach Titel als Blatt von unten nach dem Muster von REQ-096 anzeigen, je Buch mit Cover bzw. Cover-Platzhalter und Titel, ohne Suche. Diese Auslegungen hat der CEO nicht beanstandet.
  - Bücher, die schon in der Liste sind, sind beim Öffnen vormarkiert. CEO (2026-11-24): „ja zu allem“.
  - Antippen eines Buches markiert es sichtbar hervorgehoben. Erneutes Antippen hebt die Markierung auf. Mehrere Bücher können markiert sein.
  - Mit „Sichern“ (CEO, 2026-11-24: „b“) muss das System die Zugehörigkeit dauerhaft übernehmen: Markierte Bücher sind danach in der Liste, entmarkierte vorher enthaltene Bücher sind herausgenommen. Danach schließt das Blatt, und die geöffnete Liste zeigt den neuen Stand mit angepasster Anzahl.
  - Schließt der Nutzer das Blatt ohne „Sichern“, muss das System die Auswahl verwerfen.
  - Bandnummer bei Sagas: Ein neu hinzugefügtes Buch erhält die beim Barcode-Scan gespeicherte Bandnummer, falls vorhanden (REQ-099), sonst keine. Ein bereits enthaltenes Buch behält seine Bandnummer. Ändern lässt sie sich über die Listenübersicht (REQ-097).
- An Stelle der Überschrift „Deine Bücher“ steht der Name der Liste und rechts daneben ein Stift-Symbol (**Auslegung**: Listenname als Überschrift, weil der Stift „rechts nebendran“ den Titel ändert).
- Die Buchtitel stehen ohne Bandnummer.
- Antippen eines Buches öffnet dessen Buchdetails. Deren Zurück-Pfeil führt zurück zur Liste (wie REQ-036 F7).

**Sortierung**
- In Sammlungen und Bibliotheken muss das System die Bücher A–Z nach Titel anordnen.
- In Sagas muss der Sortierknopf zwischen „A–Z“ und „nach Bänden“ umschalten. „Nach Bänden“ ordnet aufsteigend nach Bandnummer, der erste Band zuerst. Bücher ohne Bandnummer stehen danach A–Z (**Auslegung**). Die Voreinstellung ist „nach Bänden“ (**Auslegung**).

**Umbenennen und Löschen**
- Wenn der Nutzer den Stift antippt, muss das System ein Blatt nach dem Muster „Verlag“ (REQ-063) mit dem Namen im Feld, der Pille „Sichern“ und darunter „Liste löschen“ anzeigen.
- „Sichern“ speichert den neuen Namen dauerhaft. Er gilt überall, auch in den Buchdetails (REQ-095, REQ-099). Ein leerer Name wird nicht gesichert, das Feld wird hervorgehoben wie in REQ-063.
- Wenn der Nutzer „Liste löschen“ antippt, muss das System eine Rückfrage anzeigen. Bestätigt er, löscht das System die Liste samt Zugehörigkeiten und Bandnummern, die Bücher bleiben erhalten. Danach zeigt es die Listenübersicht dieser Art (**Auslegung**). Verneint er, bleibt alles unverändert.

## Akzeptanzkriterien

### AK-1 Bücher der Liste
- **Gegeben** die Sammlung „Lieblingsbücher“ mit zwei von fünf Büchern
- **Wenn** der Nutzer sie öffnet
- **Dann** zeigt die Übersicht genau diese zwei Bücher A–Z, „2 Bücher“, den Namen „Lieblingsbücher“ mit Stift, Suchfeld, Plus, Sortierknopf und den Umschalter Raster/Liste
- **Und** es gibt keine Filterleiste

### AK-6 Plus zeigt alle Bücher zur Auswahl, enthaltene vormarkiert
- **Gegeben** die Saga „The Empyrean“ mit „Fourth Wing“ ist geöffnet, gespeichert sind außerdem „Onyx Storm“ und „Iron Flame“
- **Wenn** der Nutzer das Plus antippt
- **Dann** erscheint ein Blatt mit einer scrollbaren Liste aller Bücher A–Z: „Fourth Wing“ (markiert), „Iron Flame“, „Onyx Storm“
- **Und** es wird keine Liste und kein Buch angelegt, und das Menü „Buch hinzufügen“ öffnet sich nicht
- **Und** in einer geöffneten Sammlung bzw. (dritter Durchlauf) Bibliothek verhält sich das Plus genauso

### AK-7 Markieren und Entmarkieren
- **Gegeben** die Bücherliste aus AK-6 ist geöffnet
- **Wenn** der Nutzer „Iron Flame“ und „Onyx Storm“ antippt und danach „Onyx Storm“ erneut antippt
- **Dann** sind „Fourth Wing“ und „Iron Flame“ hervorgehoben, „Onyx Storm“ nicht

### AK-8 Sichern übernimmt Hinzufügen und Herausnehmen
- **Gegeben** in der Bücherliste aus AK-6 ist „Iron Flame“ zusätzlich markiert und „Fourth Wing“ entmarkiert
- **Wenn** der Nutzer „Sichern“ antippt
- **Dann** enthält die Saga nur „Iron Flame“ und zeigt „1 Buch“, auch nach einem Neustart
- **Und** „Fourth Wing“ ist weiterhin als Buch vorhanden

### AK-9 Schließen ohne Sichern verwirft
- **Gegeben** in der Bücherliste aus AK-6 wurden Markierungen geändert
- **Wenn** der Nutzer das Blatt schließt, ohne „Sichern“ anzutippen
- **Dann** enthält die Saga unverändert nur „Fourth Wing“

### AK-2 Saga nach Bänden
- **Gegeben** die Saga „Crescent City“ mit „House of Sky and Breath“ (Band 2), „House of Earth and Blood“ (Band 1) und „House of Flame and Shadow“ (Band 3)
- **Wenn** der Nutzer die Saga öffnet und die Sortierung „nach Bänden“ gewählt ist
- **Dann** stehen „House of Earth and Blood“, „House of Sky and Breath“, „House of Flame and Shadow“ in dieser Reihenfolge, ohne „Band X“ vor dem Titel
- **Und** nach Umschalten auf „A–Z“ lautet die Reihenfolge „House of Earth and Blood“, „House of Flame and Shadow“, „House of Sky and Breath“

### AK-3 Umbenennen
- **Gegeben** die Liste „Lieblingsbücher“ ist geöffnet
- **Wenn** der Nutzer den Stift antippt, „Herzensbücher“ einträgt und „Sichern“ antippt
- **Dann** heißt die Liste überall „Herzensbücher“, auch nach einem Neustart

### AK-4 Löschen mit Rückfrage
- **Gegeben** die Liste „Herzensbücher“ mit zwei Büchern
- **Wenn** der Nutzer „Liste löschen“ antippt und die Rückfrage bestätigt
- **Dann** gibt es die Liste nicht mehr, beide Bücher sind weiterhin vorhanden, und die Listenübersicht der Art wird angezeigt
- **Und** wenn er die Rückfrage verneint, bleibt die Liste unverändert

### AK-5 Buch öffnen und zurück
- **Gegeben** eine geöffnete Liste
- **Wenn** der Nutzer ein Buch antippt und in dessen Buchdetails den Zurück-Pfeil antippt
- **Dann** wird wieder die Liste angezeigt

## Abgrenzung (nicht Teil dieses REQ)

- Bandnummer in der Bücherliste (CEO: ohne „Band X“).

## Qualitätsanforderungen

- Darstellung in allen Farbdesigns und Stilen (REQ-068, REQ-071).

## Abhängigkeiten

- **REQ-036 bis REQ-038** (Muster der Übersicht). Dort hat der Sortierknopf „Zuletzt“ keine Funktion. In Sagas bekommt er hier eine.
- **REQ-063** (Blattmuster), **REQ-095, REQ-097, REQ-099, ADR-0002.**
- **REQ-100 (Entwurf):** Das Blatt „Liste bearbeiten“ (Stift) bekommt unter dem Namensfeld ein Bildfeld. „Sichern“ übernimmt auch das Bild, „Liste löschen“ löscht es mit. Die geöffnete Liste zeigt das Listenbild klein links neben dem Namen.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->


## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-23 | Erstellt aus dem vom CEO bestätigten Konzept, Entwurf | Anforderungsmanager |
| 2026-11-23 | CEO-Antworten 2 und 3 eingearbeitet: Das Plus legt eine Liste derselben Art an, kein Buch (AK-6 neu). Die Filterleiste ist offen (Widerspruch zwischen „nichts davon“ und „alles davon“). Status Entwurf | Anforderungsmanager |
| 2026-11-23 | CEO: „ja fallen weg“. Keine Filterleiste in der geöffneten Liste (Anforderung, AK-1). Keine offenen Fragen. Status Entwurf | Anforderungsmanager |
| 2026-11-23 | Vom CEO bestätigt (wörtlich): „okay, freigegeben. Starte mit dem nächsten Prototypen“. Status „Abgestimmt“ | Anforderungsmanager |
| 2026-11-23 | Änderungswunsch des CEO eingearbeitet („soll das "+" nicht zum anlegen einer neuen Saga sein. Stattdessen sollen mir alle Bücher von A-Z als Scrollbare Liste angezeigt werden …“): Plus in einer Saga zeigt alle Bücher zur Mehrfachauswahl, die markierten werden der Saga hinzugefügt. AK-6 neu gefasst, AK-7 und AK-8 neu. Auslegungen: Blatt von unten, Cover und Titel je Buch, Bandnummer aus dem Scan, Sammlungen und Bibliotheken vorerst unverändert. Drei offene Fragen. Status unverändert („In Umsetzung“), die geänderten Teile sind noch nicht vom CEO bestätigt | Anforderungsmanager |
| 2026-11-24 | CEO-Antworten eingearbeitet: 1 „ja“ (gilt auch für Sammlungen und Bibliotheken, Plus legt keine Liste mehr an), 2 „b“ (Übernahme erst mit „Sichern“, Schließen verwirft), 3 „ja zu allem“ (enthaltene Bücher vormarkiert, Entmarkieren nimmt sie nach „Sichern“ heraus). Eigene Auslegungen vom CEO nicht beanstandet. AK-6 bis AK-8 neu gefasst, AK-9 neu. Keine offenen Fragen. Status unverändert | Anforderungsmanager |
| 2026-11-24 | Änderung (Plus wählt Bücher aus, AK-6 bis AK-9) vom CEO bestätigt (wörtlich): „passt für mich :)“. Status bleibt „In Umsetzung“ | Anforderungsmanager |
