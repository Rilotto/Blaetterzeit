---
id: REQ-038
titel: Übersicht „Alle Bücher“ – Suche nach Titel oder Autor
status: Entwurf
prioritaet: offen
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **alle Bücher nach Titel oder Autor durchsuchen**, damit **ich ein bestimmtes Buch schnell finde**.

Vorgabe des CEO (wörtlich, 2026-11-12): „Ebenso soll es oben eine Funktion geben, in der ich alle Bücher durchsuchen kann nach Titel oder Autor (Vor- oder Nachname).“

## Anforderung (Satzschablone)

- Das System muss dem Nutzer die Möglichkeit bieten, im oberen Bereich der Übersicht „Alle Bücher“ einen Suchbegriff einzugeben.
- Das System muss als Ergebnis genau die Bücher darstellen, deren Buchtitel oder Autor zum Suchbegriff passt.
- Das System muss Treffer sowohl über den Vornamen als auch über den Nachnamen des Autors finden.

## Akzeptanzkriterien

### AK-1 Suche nach Titel
- **Gegeben** Bücher „Dire bound“ und „Threshing day“
- **Wenn** der Nutzer „Dire bound“ sucht
- **Dann** wird nur „Dire bound“ angezeigt

### AK-2 Suche nach Vorname des Autors
- **Gegeben** ein Buch des Autors „Sable Sorensen“ und ein Buch eines anderen Autors
- **Wenn** der Nutzer „Sable“ sucht
- **Dann** wird nur das Buch von „Sable Sorensen“ angezeigt

### AK-3 Suche nach Nachname des Autors
- **Gegeben** ein Buch des Autors „Sable Sorensen“ und ein Buch eines anderen Autors
- **Wenn** der Nutzer „Sorensen“ sucht
- **Dann** wird nur das Buch von „Sable Sorensen“ angezeigt

## Abgrenzung (nicht Teil dieses REQ)

- Suche außerhalb der Übersicht „Alle Bücher“.

## Qualitätsanforderungen

- Keine genannt.

## Abhängigkeiten

- REQ-028 (Autor als ein Text gespeichert), REQ-036, REQ-037.

## Offene Fragen

- F6: Text im Suchfeld; Zeitpunkt der Suche; Groß-/Kleinschreibung; Teilwörter; Anzeige bei keinem Treffer; Zusammenspiel mit den Filterpillen.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-12 | Erstellt (Entwurf aus CEO-Vorgabe) | Anforderungsmanager |
