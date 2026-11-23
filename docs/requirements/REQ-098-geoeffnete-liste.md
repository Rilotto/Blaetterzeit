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
- Die Plus-Schaltfläche legt in einer geöffneten Liste kein Buch an, sondern eine neue Liste derselben Art (Name wie in REQ-096). CEO (wörtlich, 2026-11-23): „durch ein "+" bei einer Saga, Sammlung und Bibliothek soll entsprechend NUR eine Saga, Sammlung oder Bibliothek (ensprechend auf wasman davor geklickt hat), angelegt werden können. Ein neues Buch soll nur über das "+" bei Bücher angelegt werden können.“ Die geöffnete Liste bleibt danach angezeigt (**Auslegung**).
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

### AK-6 Plus legt eine Liste derselben Art an
- **Gegeben** die Saga „The Empyrean“ ist geöffnet
- **Wenn** der Nutzer das Plus antippt und „Crescent City“ anlegt
- **Dann** gibt es die Saga „Crescent City“, es wurde kein Buch angelegt, und das Menü „Buch hinzufügen“ hat sich nicht geöffnet

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

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-23 | Erstellt aus dem vom CEO bestätigten Konzept, Entwurf | Anforderungsmanager |
| 2026-11-23 | CEO-Antworten 2 und 3 eingearbeitet: Das Plus legt eine Liste derselben Art an, kein Buch (AK-6 neu). Die Filterleiste ist offen (Widerspruch zwischen „nichts davon“ und „alles davon“). Status Entwurf | Anforderungsmanager |
| 2026-11-23 | CEO: „ja fallen weg“. Keine Filterleiste in der geöffneten Liste (Anforderung, AK-1). Keine offenen Fragen. Status Entwurf | Anforderungsmanager |
| 2026-11-23 | Vom CEO bestätigt (wörtlich): „okay, freigegeben. Starte mit dem nächsten Prototypen“. Status „Abgestimmt“ | Anforderungsmanager |
