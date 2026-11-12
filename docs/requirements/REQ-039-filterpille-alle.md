---
id: REQ-039
titel: Filterleiste – neue Filterpille „Alle“ öffnet die Übersicht „Alle Bücher“
status: Entwurf
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **über eine Filterpille „Alle“ direkt zur Übersicht aller Bücher gelangen**, damit **ich nicht erst zum Abschnitt „Alle Bücher“ scrollen muss**.

Antwort des CEO (wörtlich, 2026-11-12, F2.2): „eine neue Filterpille "Alle" mit einem hinterlegten Filter, der alle Bücher anzeigt. Das Antippen der Filterpille öffnet auch die Übersicht aller Bücher.“ F2.3 (Zahlen hinter den Pillen): „nein“.

## Anforderung (Satzschablone)

- Das System muss in der Filterkonfiguration (REQ-007) einen zusätzlichen Filter mit dem Namen „Alle“ an erster Stelle vor „Für dich“ führen (CEO: „an erster Stelle vor "Für Dich"“).
- Auf der Seite „Bücher“ bleibt „Für dich“ der standardmäßig aktive Filter (REQ-006).
- Das System muss dem Filter „Alle“ eine Filterlogik zuordnen, die alle Bücher unabhängig vom Lesestatus auswählt.
- Wenn der Nutzer auf der Seite „Bücher“ die Filterpille „Alle“ antippt, muss das System die Übersicht „Alle Bücher“ (REQ-036) öffnen.
- Wenn die Übersicht „Alle Bücher“ angezeigt wird, muss das System die Filterpille „Alle“ als aktiven Filter darstellen.
- Das System darf hinter der Filterpille „Alle“ keine Zahl darstellen.

## Akzeptanzkriterien

### AK-1 Pille „Alle“ vorhanden
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** die Filterleiste durchgewischt wird
- **Dann** steht ganz links, vor „Für dich“, eine Filterpille mit genau der Beschriftung „Alle“, ohne Zahl

### AK-2 Antippen öffnet die Übersicht
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** der Nutzer „Alle“ antippt
- **Dann** wird die Übersicht „Alle Bücher“ angezeigt
- **Und** „Alle“ ist dort der aktive Filter

### AK-3 Filterlogik wählt alle Bücher
- **Gegeben** je ein Buch mit jedem Lesestatus
- **Wenn** die Filterlogik von „Alle“ ausgewertet wird
- **Dann** liefert sie alle diese Bücher

### AK-4 „Alle ansehen ›“ aktiviert ebenfalls „Alle“
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** der Nutzer im Abschnitt „Alle Bücher“ „Alle ansehen ›“ antippt
- **Dann** ist in der Übersicht die Filterpille „Alle“ aktiv

## Abgrenzung (nicht Teil dieses REQ)

- Filterlogik der übrigen Filter.

## Qualitätsanforderungen

- Keine genannt.

## Abhängigkeiten

- REQ-006, REQ-007 (am 2026-11-12 angepasst), REQ-036.

## Offene Fragen

- Keine. („Für dich“: REQ-036 AK-12, „Gerade am Lesen“: REQ-042. Antippen von „Noch zu lesen“ auf der Seite „Bücher“: siehe Rückfrage in REQ-040.)

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-12 | Erstellt aus CEO-Antwort F2.2/F2.3 | Anforderungsmanager |
| 2026-11-12 | CEO-Antwort 1.1: Position vor „Für dich“ (AK-1). REQ-006/007 angepasst. Status bleibt Entwurf | Anforderungsmanager |
