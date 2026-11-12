---
id: REQ-040
titel: Übersicht „Noch zu lesen“ über „Alle ansehen ›“
status: Entwurf
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **über „Alle ansehen ›“ im Abschnitt „Noch zu lesen“ eine Übersicht meiner noch zu lesenden Bücher öffnen**, damit **ich sie vollständig durchsuchen und ansehen kann**.

Antwort des CEO (wörtlich, 2026-11-12, F2.4): „Wenn du gerade dabei bist: es soll eine gleiche Liste angezeigt werden mit den gleichen Ansichtsoptionen nur eben die Bücher im Status "noch zu lesen".“ F4.5: „Bei der Liste "Alle Bücher" und "noch zu lesen" -> von A-Z gemäß Titel“.

## Anforderung (Satzschablone)

- Wenn der Nutzer im Abschnitt „Noch zu lesen“ „Alle ansehen ›“ antippt, muss das System innerhalb des Reiters „Bücher“ die Übersicht „Noch zu lesen“ öffnen.
- Das System muss die Übersicht „Noch zu lesen“ wie die Übersicht „Alle Bücher“ aufbauen (Kopf, Anzahlzeile, Sortierknopf, Navigation: REQ-036; Ansichten: REQ-037; Suche: REQ-038).
- Das System muss in dieser Übersicht genau die Bücher darstellen, die dem Abschnitt „Noch zu lesen“ zugeordnet sind (zentrale Abschnittszuordnung, REQ-009), alphabetisch A–Z nach Titel.
- Wenn die Übersicht über „Alle ansehen ›“ im Abschnitt „Noch zu lesen“ geöffnet wird, muss das System die Filterpille „Noch zu lesen“ als aktiven Filter darstellen (CEO: „ja“).
- Das System muss das leere Suchfeld mit „In Noch zu lesen suchen“ beschriften (REQ-038).

## Akzeptanzkriterien

### AK-1 Öffnen
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** der Nutzer im Abschnitt „Noch zu lesen“ „Alle ansehen ›“ antippt
- **Dann** wird die Übersicht „Noch zu lesen“ angezeigt und der Menüpunkt „Bücher“ bleibt ausgewählt
- **Und** die Filterpille „Noch zu lesen“ ist aktiv

### AK-2 Nur zugeordnete Bücher, A–Z
- **Gegeben** ungelesene Bücher „Zeit“ und „Asche“ sowie ein gelesenes Buch „Berg“
- **Wenn** die Übersicht „Noch zu lesen“ geöffnet wird
- **Dann** zeigt sie genau „Asche“, „Zeit“ in dieser Reihenfolge

### AK-3 Gleiche Ansichtsoptionen
- **Gegeben** die Übersicht „Noch zu lesen“ ist geöffnet
- **Wenn** Umschalter und Suchfeld betrachtet werden
- **Dann** bietet sie Raster und Liste (REQ-037) und die Suche (REQ-038)

## Abgrenzung (nicht Teil dieses REQ)

- Änderung der Abschnittszuordnung (REQ-009).

## Qualitätsanforderungen

- Keine genannt.

## Abhängigkeiten

- REQ-009 (AK-14 am 2026-11-12 angepasst), REQ-007, REQ-036, REQ-037, REQ-038.

## Offene Fragen

- Öffnet das Antippen der Filterpille „Noch zu lesen“ auf der Seite „Bücher“ ebenfalls diese Übersicht (wie „Alle“ und „Gerade am Lesen“)? Nicht ausdrücklich beantwortet.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-12 | Erstellt aus CEO-Antwort F2.4/F4.5 | Anforderungsmanager |
| 2026-11-12 | CEO-Antworten 1.3, 5.1: Pille „Noch zu lesen“ aktiv, Suchfeld-Text. REQ-009 angepasst. Status bleibt Entwurf | Anforderungsmanager |
