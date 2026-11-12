---
id: REQ-036
titel: Übersicht „Alle Bücher“ – Fenster, Kopf, Anzahl, Reihenfolge, Rückweg
status: Entwurf
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **eine Übersicht aller meiner Bücher öffnen**, damit **ich meinen gesamten Bestand auf einen Blick sehe**.

Vorgabe des CEO (wörtlich, 2026-11-12): „Dieses "Alle ansehen >" öffnet im Reiter "Bücher" ein neues Fenster, in dem es eine Übersicht aller Bücher gibt. Die Überschrift "Deine Bücher", die Filterpillen und das + bleiben erhalten (siehe Screenshots).“

Antworten des CEO (wörtlich, 2026-11-12):
- F2.1 Rückweg: „indem ich wieder auf den Reiter "bücher" klicke“
- F2.3 Zahlen hinter den Pillen: „nein“
- F4.1 „2 Bücher“: „Ja, hier soll die gesamtanzahl der in der Liste vorhandenen Bücher angezeigt werden. Ist es nur ein Buch, muss hier: 1 Buch stehen.“
- F4.2 Schloss/Häkchen: „Nein“. F4.4 „Mehr ⌄“: „nein“.
- F4.3 „Zuletzt“: „bitte umsetzten, aber ohne Funktion (aufnehmen auf die To-Do liste mit Hinweis: hier auch nach Eintragungsdatum filtern zu können!)“
- F4.5 Reihenfolge: „Bei der Liste "Alle Bücher" und "noch zu lesen" -> von A-Z gemäß Titel“
- F7: „Ja es öffnen sich dann die Buchdetails, der Zurückpfeil in den Buchdetails geht dann aber zurück auf die Übersichtsliste davor.“
- F8: Farben „wie im Screenshot mit den bestehenden Farben“; leerer Zustand: „nichts“; Priorität „must“.

Referenzbilder: [referenzen/REF-alle-buecher-01-liste.png](referenzen/REF-alle-buecher-01-liste.png), [referenzen/REF-alle-buecher-02-raster.png](referenzen/REF-alle-buecher-02-raster.png). Optische Übereinstimmung prüft der CEO im Prototyp.

## Anforderung (Satzschablone)

**Fenster und Kopf**
- Das System muss die Übersicht „Alle Bücher“ innerhalb des Reiters „Bücher“ als eigenes Fenster darstellen.
- Das System muss in der Übersicht die Überschrift „Deine Bücher“, die Filterleiste (REQ-006) und die Plus-Schaltfläche (REQ-005) weiterhin darstellen.
- Das System darf hinter den Filterpillen keine Zahlen darstellen.
- Das System darf den Schloss-/Häkchen-Schalter und die Pille „Mehr ⌄“ aus dem Referenzbild nicht darstellen.

**Inhalt**
- Das System muss in der Übersicht alle gespeicherten Bücher (REQ-034) unabhängig vom Lesestatus darstellen, ohne Begrenzung der Anzahl.
- Das System muss die Bücher alphabetisch von A bis Z nach Buchtitel anordnen.
- Wenn kein Buch vorhanden ist, muss das System an Stelle der Bücher nichts darstellen.

**Filterpillen in der Übersicht**
- Wenn der Nutzer in der Übersicht eine Filterpille antippt, muss das System diese als aktiven Filter darstellen und an Stelle der bisherigen Bücher die Bücher gemäß deren Filterlogik (REQ-007) darstellen (CEO: „die Ansicht ändert sich entsprechend. Dies sind ja Filterpillen“). Sortierung, Ansicht und Suche gelten für die jeweilige Liste (REQ-037, REQ-038).
- Wenn der Nutzer in einer Übersicht die Filterpille „Für dich“ antippt, muss das System die Seite „Bücher“ mit ihren Abschnitten und „Für dich“ als aktivem Filter anzeigen (CEO: „Hier soll einfach erstmal die Übersicht wie gehabt bleiben.“).

**Anzahlzeile und Sortierknopf**
- Das System muss die Anzahl der aktuell in der Liste dargestellten Bücher als „<n> Bücher“ darstellen, bei genau einem Buch als „1 Buch“; während einer Suche zählt es die Treffer (CEO: „ja“).
- Das System muss den Sortierknopf „Zuletzt“ darstellen. Wenn der Nutzer ihn antippt, darf sich in der App nichts ändern (Funktion: To-do-Liste).

**Navigation**
- Wenn der Nutzer in der Übersicht ein Buch antippt, muss das System die Buchdetails (REQ-013) dieses Buches öffnen.
- Wenn der Nutzer in Buchdetails, die aus der Übersicht geöffnet wurden, den Zurück-Pfeil antippt, muss das System die Übersicht wieder anzeigen.
- Wenn der Nutzer in der Übersicht den Menüpunkt „Bücher“ der Hauptnavigation antippt, muss das System die Seite „Bücher“ anzeigen.

**Farben**
- Das System muss alle Farben aus bestehenden Farbrubriken beziehen, Zuordnung nach dem Referenzbild (CEO: „wie im Screenshot mit den bestehenden Farben“). Konkrete Farbwerte sind kein Akzeptanzkriterium.

## Akzeptanzkriterien

### AK-1 Kopfbereich bleibt erhalten, ohne Zahlen
- **Gegeben** die Übersicht „Alle Bücher“ ist geöffnet
- **Wenn** der obere Bereich betrachtet wird
- **Dann** sind „Deine Bücher“, die Filterpillen und die Plus-Schaltfläche sichtbar
- **Und** hinter keiner Filterpille steht eine Zahl

### AK-2 Alle Bücher, A–Z
- **Gegeben** Bücher „Zorn“ (gelesen), „Anfang“ (ungelesen), „Mitte“ (am lesen)
- **Wenn** die Übersicht geöffnet wird
- **Dann** stehen sie in der Reihenfolge „Anfang“, „Mitte“, „Zorn“

### AK-3 Keine Begrenzung
- **Gegeben** 25 gespeicherte Bücher
- **Wenn** die Übersicht vollständig durchgescrollt wird
- **Dann** sind alle 25 Bücher erreichbar

### AK-4 Anzahl: Mehrzahl und Einzahl
- **Gegeben** 2 Bücher bzw. 1 Buch
- **Wenn** die Übersicht geöffnet wird
- **Dann** steht dort „2 Bücher“ bzw. „1 Buch“

### AK-10 Anzahl zählt Suchtreffer
- **Gegeben** 3 Bücher, davon passt 1 zum Suchbegriff
- **Wenn** der Nutzer den Suchbegriff eingibt
- **Dann** steht dort „1 Buch“

### AK-11 Filterpille in der Übersicht antippen
- **Gegeben** die Übersicht „Alle Bücher“ mit ungelesenen und gelesenen Büchern
- **Wenn** der Nutzer die Filterpille „Noch zu lesen“ antippt
- **Dann** ist „Noch zu lesen“ aktiv und es werden nur die Bücher der Abschnittszuordnung „Noch zu lesen“ dargestellt

### AK-12 „Für dich“ führt zur Seite „Bücher“
- **Gegeben** eine Übersicht ist geöffnet
- **Wenn** der Nutzer „Für dich“ antippt
- **Dann** wird die Seite „Bücher“ mit ihren Abschnitten angezeigt und „Für dich“ ist aktiv

### AK-5 „Zuletzt“ ohne Funktion
- **Gegeben** die Übersicht ist geöffnet
- **Wenn** der Nutzer „Zuletzt“ antippt
- **Dann** ändert sich in der App nichts

### AK-6 Nicht übernommene Elemente
- **Gegeben** die Übersicht ist geöffnet
- **Wenn** sie betrachtet wird
- **Dann** gibt es keinen Schloss-/Häkchen-Schalter und keine Pille „Mehr ⌄“

### AK-7 Buch antippen und zurück
- **Gegeben** die Übersicht ist geöffnet
- **Wenn** der Nutzer ein Buch antippt und danach in den Buchdetails den Zurück-Pfeil
- **Dann** werden zuerst die Buchdetails dieses Buches und danach wieder die Übersicht angezeigt

### AK-8 Zurück zur Seite „Bücher“
- **Gegeben** die Übersicht ist geöffnet
- **Wenn** der Nutzer den Menüpunkt „Bücher“ antippt
- **Dann** wird die Seite „Bücher“ angezeigt

### AK-9 Kein Buch
- **Gegeben** es ist kein Buch gespeichert
- **Wenn** die Übersicht geöffnet wird
- **Dann** werden an Stelle der Bücher weder Bücher noch Platzhalter noch Hinweistext dargestellt

## Abgrenzung (nicht Teil dieses REQ)

- Raster/Liste (REQ-037), Suche (REQ-038), Filterpille „Alle“ (REQ-039), Übersicht „Noch zu lesen“ (REQ-040).
- Funktion des Sortierknopfs „Zuletzt“ (To-do-Liste).

## Qualitätsanforderungen

- Keine genannt.

## Abhängigkeiten

- REQ-005, REQ-006, REQ-007, REQ-008, REQ-013 (Zurück-Pfeil führt bisher immer zur Seite „Bücher“, wird angepasst), REQ-034, REQ-035, REQ-039.

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-12 | Erstellt (Entwurf aus CEO-Vorgabe) | Anforderungsmanager |
| 2026-11-12 | CEO-Antworten F2.1, F2.3, F4, F7, F8 eingearbeitet. Status bleibt Entwurf | Anforderungsmanager |
| 2026-11-12 | CEO-Antworten Runde 2: Filterpillen ändern die Liste (neu AK-11), Anzahl zählt Suchtreffer (neu AK-10). Status bleibt Entwurf | Anforderungsmanager |
| 2026-11-12 | CEO-Antwort Runde 3, F1: „Für dich“ führt zurück zur Seite „Bücher“ (neu AK-12); „Gerade am Lesen“: REQ-042. Status bleibt Entwurf | Anforderungsmanager |
