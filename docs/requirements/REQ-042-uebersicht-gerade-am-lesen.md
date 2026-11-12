---
id: REQ-042
titel: Übersicht „Gerade am Lesen“ über die Filterpille
status: In Umsetzung
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **über die Filterpille „Gerade am Lesen“ eine Übersicht der Bücher sehen, die ich gerade lese**, damit **ich sie schnell finde**.

Antwort des CEO (wörtlich, 2026-11-12): „Bei "Gerade am Lesen" soll eine neue Übersichtsliste (wie "Noch zu lesen" und "alle") angezeigt werden. Nur eben alle Bücher, welche aktuell den Status "gerade am lesen" haben.“ Suchfeld-Muster (CEO): „In [Status] suchen“.

## Anforderung (Satzschablone)

- Wenn der Nutzer auf der Seite „Bücher“ oder in einer Übersicht die Filterpille „Gerade am Lesen“ antippt, muss das System innerhalb des Reiters „Bücher“ die Übersicht „Gerade am Lesen“ mit dieser Pille als aktivem Filter anzeigen.
- Das System muss die Übersicht „Gerade am Lesen“ wie die Übersicht „Alle Bücher“ aufbauen (REQ-036, REQ-037, REQ-038).
- Das System muss in dieser Übersicht genau die Bücher mit dem Lesestatus *am lesen* (REQ-008) darstellen, alphabetisch A–Z nach Titel.
- Das System muss das leere Suchfeld mit „In Gerade am Lesen suchen“ beschriften.

## Akzeptanzkriterien

### AK-1 Öffnen über die Pille
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** der Nutzer „Gerade am Lesen“ antippt
- **Dann** wird die Übersicht „Gerade am Lesen“ angezeigt, „Gerade am Lesen“ ist aktiv und der Menüpunkt „Bücher“ bleibt ausgewählt

### AK-2 Nur Bücher „am lesen“, A–Z
- **Gegeben** Bücher „Zeit“ und „Asche“ mit Status *am lesen* und „Berg“ mit Status *ungelesen*
- **Wenn** die Übersicht „Gerade am Lesen“ angezeigt wird
- **Dann** zeigt sie genau „Asche“, „Zeit“ in dieser Reihenfolge

### AK-3 Suchfeld-Text
- **Gegeben** die Übersicht „Gerade am Lesen“ mit leerem Suchfeld
- **Wenn** das Suchfeld betrachtet wird
- **Dann** steht darin „In Gerade am Lesen suchen“

## Abgrenzung (nicht Teil dieses REQ)

- Abschnitt „Gerade am Lesen“ auf der Seite „Bücher“ (gibt es nicht).

## Qualitätsanforderungen

- Keine genannt.

## Abhängigkeiten

- REQ-006, REQ-007, REQ-008, REQ-036, REQ-037, REQ-038.

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-12 | Erstellt aus CEO-Antwort Runde 3, F1 | Anforderungsmanager |
