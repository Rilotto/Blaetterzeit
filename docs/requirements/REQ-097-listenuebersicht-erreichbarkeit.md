---
id: REQ-097
titel: Listenübersicht je Art (Sagas, Sammlungen, Bibliotheken) mit Häkchen und „+“, erreichbar aus Buchdetails, Seite „Bücher“ und Menüpunkt „Bibliothek“
status: In Umsetzung
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **alle Listen einer Art in einer Übersicht sehen, ein Buch dort hinzufügen oder herausnehmen und die Listen auch außerhalb der Buchdetails erreichen**, damit **ich meine Sagas, Sammlungen und Bibliotheken pflegen kann**.

CEO (wörtlich, 2026-11-23): „4. Wenn ein Buch einer Saga, Sammlung oder Liste hinzugefügt wurde, dann erschein wie jetzt bereits umgesetzt "in Bibliotheken / in Saga / in Sammlung". Bei einem klick auf die jeweilige Zeile öffnet sich ein komplett neues flächendeckendes Fenster mit einer Listenübersicht und der darin enthaltenen Listen.“

CEO-Antworten (wörtlich, 2026-11-23):
- Welche Listen: „alle Listen dieser Art“
- Erreichbarkeit: „ja genau über Sagas und Sammlungen auf der Seite Bücher. Das war der Hintergrundgedanke. Ich brauche alles davon“
- Bibliothek: „ist verlinkt mit dem Reiter "Bibliothek". Daher muss das auch gleich heißen.“

Vom CEO am 2026-11-23 bestätigtes Konzept, Punkte 4 und 7: Je Liste werden Name und Anzahl der Bücher gezeigt. Ein Häkchen zeigt, ob das Buch drin ist, und schaltet das um (mehrere möglich). „+“ legt eine neue Liste an. Ein Tipp auf den Namen öffnet die Liste. Sagas und Sammlungen sind über die gleichnamigen Abschnitte der Seite „Bücher“ erreichbar, Bibliotheken über den Menüpunkt „Bibliothek“.

## Anforderung (Satzschablone)

**Listenübersicht**
- Das System muss je Art (Sagas, Sammlungen, Bibliotheken) eine flächendeckende Listenübersicht mit allen Listen dieser Art anzeigen. Je Liste zeigt sie den Namen und die Anzahl der Bücher („<n> Bücher“, bei einem Buch „1 Buch“, wie REQ-036).
- Die Übersicht hat ein „+“. Antippen fragt einen Namen ab und legt eine neue Liste dieser Art an (wie REQ-096). Ein leerer Name legt keine Liste an.
- Wenn der Nutzer den Namen einer Liste antippt, muss das System die geöffnete Liste anzeigen (REQ-098).
- Die Reihenfolge der Listen ist A–Z nach Name (**Auslegung**: nicht festgelegt).

**Aus den Buchdetails geöffnet (mit Buchbezug)**
- Wenn der Nutzer in den Buchdetails die Zeile „In Saga“, „In Sammlung“ bzw. „In Bibliotheken“ (REQ-095) antippt, muss das System die Listenübersicht dieser Art öffnen und je Liste ein Häkchen zeigen, ob das Buch darin ist.
- Antippen eines Häkchens nimmt das Buch sofort in die Liste auf bzw. aus ihr heraus und wird dauerhaft gespeichert (**Auslegung**: sofort wirksam, ohne „Sichern“). Mehrere Häkchen sind möglich.
- Bei Sagas zeigt die Übersicht je angehakter Saga das optionale Feld „Band“ mit denselben Regeln wie REQ-096 (**Auslegung**: sonst wäre ein Band nach der ersten Zuordnung nicht mehr änderbar).
- Eine hier über „+“ angelegte Liste ist sofort angehakt (**Auslegung**, wie REQ-096).
- Ist das Buch danach in keiner Liste dieser Art mehr, zeigt der Abschnitt in den Buchdetails wieder die Pille (REQ-095).

**Ohne Buchbezug**
- Über den Menüpunkt „Bibliothek“ oder über „Alle ansehen ›“ der Seite „Bücher“ geöffnet, zeigt die Listenübersicht keine Häkchen und kein Feld „Band“, weil kein Buch im Kontext ist. Eine dort über „+“ angelegte Liste ist leer.
- Der Zurück-Pfeil führt auch von der Seite „Bücher“ aus zur vorherigen Ansicht zurück (**Auslegung**, wie oben).

**Erreichbarkeit**
- Seite „Bücher“ (CEO, wörtlich, 2026-11-23: „Ja erstmal bleiben die Platzhalter bestehen, ich möchte später individuelle "Titelbilder" für die Listen hinterlegen können. Der Name der Liste steht wie ein Buchtitel unter dem Platzhalter. Beim Tippen auf eine Saga oder Sammlung öffnet sich direkt entsprechend die Liste.“):
  - Gibt es mindestens eine Saga bzw. Sammlung, muss das System im Abschnitt „Sagas“ bzw. „Sammlungen“ je Liste einen Cover-Platzhalter (REQ-010) darstellen. Darunter steht der Name der Liste an der Titelstelle, wie ein Buchtitel im Abschnitt „Noch zu lesen“ (REQ-009). Die Listen stehen in einer horizontalen Reihe wie dort, A–Z nach Name (**Auslegung**).
  - Wenn der Nutzer eine dieser Listen antippt, muss das System direkt die geöffnete Liste anzeigen (REQ-098).
  - Gibt es keine Saga bzw. Sammlung, bleibt der Abschnitt wie in REQ-012 (Platzhalter mit „Deine nächste Saga wartet auf dich!“ bzw. „Wie wäre es mit einer neuen Sammlung?“, ohne Funktion).
  - Das System muss neben den Überschriften „Sagas“ und „Sammlungen“ der Seite „Bücher“ den Text „Alle ansehen ›“ darstellen, gestaltet wie im Abschnitt „Noch zu lesen“ (REQ-009). Antippen öffnet die Listenübersicht „Sagas“ bzw. „Sammlungen“. CEO (wörtlich, 2026-11-23): „Füge auf der Startseite von "Bücher" neben Sagas und Sammlungen auch den Text "Alle ansehen >" hinzu. Dies öffnet dann die Übersichtseite aller Sagas oder Sammlungen.“
  - „Alle ansehen ›“ erscheint auch, wenn es noch keine Liste der Art gibt. Die CEO-Vorgabe ist nicht an Listen gebunden, und über „+“ lässt sich in der Übersicht eine erste Liste anlegen. Die leere Übersicht zeigt dann nur „+“.
- Das System muss als Zielansicht des Menüpunkts „Bibliothek“ (REQ-002) die Listenübersicht „Bibliotheken“ anzeigen. Der Platzhalter „under construction :)“ entfällt dort.
- Rückweg: Aus den Buchdetails geöffnet, führt ein Zurück-Pfeil wie in den Buchdetails (REQ-013) zur vorherigen Ansicht zurück (**Auslegung**, Muster REQ-036 F7).

## Akzeptanzkriterien

### AK-1 Alle Listen der Art mit Anzahl
- **Gegeben** die Sammlungen „Lieblingsbücher“ (3 Bücher) und „Sommer 2026“ (1 Buch) und eine Saga
- **Wenn** die Listenübersicht „Sammlungen“ geöffnet wird
- **Dann** zeigt sie genau „Lieblingsbücher · 3 Bücher“ und „Sommer 2026 · 1 Buch“ (Anordnung frei) und keine Saga

### AK-2 Aus den Buchdetails mit Häkchen
- **Gegeben** ein Buch in „Lieblingsbücher“, nicht in „Sommer 2026“
- **Wenn** der Nutzer in den Buchdetails „In Sammlung“ antippt
- **Dann** öffnet sich die flächendeckende Listenübersicht „Sammlungen“, „Lieblingsbücher“ ist angehakt, „Sommer 2026“ nicht

### AK-3 Häkchen schaltet um
- **Gegeben** die Übersicht aus AK-2
- **Wenn** der Nutzer bei „Sommer 2026“ das Häkchen setzt und bei „Lieblingsbücher“ entfernt
- **Dann** ist das Buch nur noch in „Sommer 2026“, die Anzahlen sind angepasst, auch nach einem Neustart

### AK-4 Letztes Häkchen entfernt
- **Gegeben** ein Buch nur in der Saga „The Empyrean“
- **Wenn** der Nutzer in der Listenübersicht „Sagas“ das Häkchen entfernt und zu den Buchdetails zurückkehrt
- **Dann** steht dort wieder „+ Zu einer Saga hinzufügen“

### AK-5 Neue Liste über „+“
- **Gegeben** die Listenübersicht „Sagas“ ist aus den Buchdetails geöffnet
- **Wenn** der Nutzer „+“ antippt und „Crescent City“ anlegt
- **Dann** erscheint „Crescent City“ in der Übersicht und ist angehakt

### AK-6 Name öffnet die Liste
- **Gegeben** die Listenübersicht „Sagas“
- **Wenn** der Nutzer auf „The Empyrean“ tippt
- **Dann** öffnet sich die Liste „The Empyrean“ (REQ-098)

### AK-7 Menüpunkt „Bibliothek“
- **Gegeben** die Bibliothek „Zuhause“ existiert
- **Wenn** der Nutzer den Menüpunkt „Bibliothek“ antippt
- **Dann** zeigt der Inhaltsbereich die Listenübersicht „Bibliotheken“ mit „Zuhause“, ohne Häkchen, und nicht „under construction :)“

### AK-8 Seite „Bücher“ mit Listen
- **Gegeben** die Sagas „The Empyrean“ und „Crescent City“
- **Wenn** die Seite „Bücher“ angezeigt wird
- **Dann** stehen im Abschnitt „Sagas“ zwei Cover-Platzhalter, darunter „Crescent City“ bzw. „The Empyrean“ an der Titelstelle
- **Und wenn** der Nutzer „The Empyrean“ antippt, öffnet sich direkt die Liste „The Empyrean“ (REQ-098)

### AK-9 Seite „Bücher“ ohne Listen
- **Gegeben** es gibt keine Sammlung
- **Wenn** die Seite „Bücher“ angezeigt wird
- **Dann** zeigt der Abschnitt „Sammlungen“ den Platzhalter mit „Wie wäre es mit einer neuen Sammlung?“ (REQ-012) und neben der Überschrift „Alle ansehen ›“

### AK-10 „Alle ansehen ›“ öffnet die Listenübersicht ohne Häkchen
- **Gegeben** die Sagas „The Empyrean“ und „Crescent City“
- **Wenn** der Nutzer auf der Seite „Bücher“ neben „Sagas“ „Alle ansehen ›“ antippt
- **Dann** öffnet sich die Listenübersicht „Sagas“ mit beiden Sagas, Anzahl der Bücher und „+“, ohne Häkchen und ohne Feld „Band“

## Abgrenzung (nicht Teil dieses REQ)

- Geöffnete Liste, Umbenennen und Löschen (REQ-098).
- Individuelle „Titelbilder“ für Listen (CEO: „später“).

## Qualitätsanforderungen

- Darstellung in allen Farbdesigns und Stilen (REQ-068, REQ-071).

## Abhängigkeiten

- **REQ-012:** „Keine weiteren Elemente (z. B. ‚Alle ansehen ›‘)“ und die gleichlautende Abgrenzung werden abgelöst, weil „Alle ansehen ›“ immer erscheint. Sobald es Listen gibt, werden außerdem „genau ein Cover-Platzhalter“ und „Antippen ändert nichts“ abgelöst. Platzhalter und Texte ohne Listen bleiben.
- **REQ-009, REQ-010** (Muster für Reihe, Platzhalter und Titelstelle).
- **REQ-002:** Die Zielansicht des Menüpunkts „Bibliothek“ ist dort nicht definiert („under construction :)“). Sie wird hier festgelegt.
- **REQ-095, REQ-096, REQ-098, REQ-013, REQ-036, ADR-0002.**

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-23 | Erstellt aus dem vom CEO bestätigten Konzept, Entwurf | Anforderungsmanager |
| 2026-11-23 | CEO-Antwort 1 eingearbeitet: Seite „Bücher“ zeigt je Liste einen Platzhalter mit Namen, Antippen öffnet direkt die Liste, ohne Listen bleibt REQ-012 (AK-8 neu gefasst, AK-9 neu). Status Entwurf | Anforderungsmanager |
| 2026-11-23 | CEO-Ergänzung: „Alle ansehen ›“ neben „Sagas“ und „Sammlungen“ öffnet die Listenübersicht. Abgeleitet: erscheint auch ohne Listen, Übersicht dort ohne Häkchen (kein Buch im Kontext). AK-9 ergänzt, AK-10 neu. Status Entwurf | Anforderungsmanager |
| 2026-11-23 | Vom CEO bestätigt (wörtlich): „okay, freigegeben. Starte mit dem nächsten Prototypen“. Status „Abgestimmt“ | Anforderungsmanager |
