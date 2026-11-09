---
id: REQ-005
titel: Platzhalterseiten für noch nicht umgesetzte Hauptseiten
status: Entwurf
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer (CEO beim Prototyp-Test)** möchte ich **für jede noch nicht umgesetzte Hauptseite eine erkennbare Platzhalterseite sehen**, damit **ich den Grundaufbau der App vollständig durchklicken kann und klar erkenne, welche Bereiche noch fehlen**.

## Anforderung (Satzschablone)

- Wenn eine Hauptseite noch nicht durch einen eigenen REQ umgesetzt ist, muss das System an ihrer Stelle eine Platzhalterseite anzeigen.
- Das System muss auf jeder Platzhalterseite den Titel der Hauptseite anzeigen (gemäß REQ-004).
- Das System muss auf jeder Platzhalterseite einen Hinweis anzeigen, dass die Funktion noch nicht verfügbar ist _(Wortlaut vorläufig: „Kommt bald“, F1)_.
- Das System soll auf jeder Platzhalterseite zusätzlich das Icon der Hauptseite und eine kurze Beschreibung der geplanten Funktion anzeigen _(nur bei Variante B, F1)_.
- Das System darf auf einer Platzhalterseite außer der Hauptleiste keine bedienbaren Elemente anzeigen.

## Akzeptanzkriterien

<!-- Bewusst generisch formuliert: Welche Hauptseiten aktuell Platzhalter sind, ändert sich mit jedem
     umgesetzten REQ. Tests dürfen die Liste der Platzhalterseiten nicht fest verdrahten, sondern müssen sie
     aus der zentralen Seitendefinition ableiten. -->

### AK-1 Platzhalterseite für nicht umgesetzte Hauptseiten
- **Gegeben** eine Hauptseite ist noch nicht durch einen eigenen REQ umgesetzt
- **Wenn** der Nutzer ihren Eintrag in der Hauptleiste antippt
- **Dann** wird eine Platzhalterseite mit dem Titel dieser Hauptseite angezeigt

### AK-2 Hinweis „noch nicht verfügbar“
- **Gegeben** eine Platzhalterseite wird angezeigt
- **Wenn** der Nutzer die Seite betrachtet
- **Dann** sieht er einen Hinweis, dass die Funktion noch nicht verfügbar ist

### AK-3 Keine bedienbaren Elemente außer der Hauptleiste
- **Gegeben** eine Platzhalterseite wird angezeigt
- **Wenn** der Nutzer die Seite bzw. ein Screenreader die bedienbaren Elemente durchgeht
- **Dann** sind außer den Einträgen der Hauptleiste keine bedienbaren Elemente vorhanden

### AK-4 Icon und Beschreibung _(nur bei Variante B, F1)_
- **Gegeben** eine Platzhalterseite wird angezeigt
- **Wenn** der Nutzer die Seite betrachtet
- **Dann** sieht er das Icon des zugehörigen Hauptleisten-Eintrags und eine kurze Beschreibung der geplanten Funktion

## Abgrenzung (nicht Teil dieses REQ)

- Die tatsächlichen Funktionen der Hauptseiten (jeweils eigene REQs).
- Festlegung, welche Hauptseiten es gibt (REQ-004).
- Kennzeichnung nicht abgenommener Funktionen als „Entwurf“ im Prototyp – das ist eine Prozessvorgabe (CLAUDE.md), kein Produktverhalten.

## Qualitätsanforderungen

- Platzhalterseiten verwenden ausschließlich die Farbrollen (REQ-002) und die Typografie (REQ-003).

## Abhängigkeiten

- REQ-004 (Hauptseiten, Titel, Icons), REQ-002, REQ-003.
- Sobald ein REQ eine Hauptseite umsetzt, ersetzt dessen Inhalt die Platzhalterseite; REQ-005 bleibt dabei gültig, weil er nur für noch nicht umgesetzte Hauptseiten gilt.

## Offene Fragen

- F1: Inhalt der Platzhalterseiten: Variante A (nur Titel + „Kommt bald“) oder Variante B (Titel + Icon + ein Satz zur geplanten Funktion + „Kommt bald“)? Bei Variante A entfällt AK-4; bei Variante B werden die Beschreibungstexte je Seite mit dem CEO abgestimmt.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-09 | Erstellt (Entwurf für ersten Prototyp) | Anforderungsmanager |
