---
id: REQ-038
titel: Übersichten – Suche nach Titel oder Autor
status: Entwurf
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **die Bücher einer Übersicht nach Titel oder Autor durchsuchen**, damit **ich ein bestimmtes Buch schnell finde**.

Vorgabe des CEO (wörtlich, 2026-11-12): „Ebenso soll es oben eine Funktion geben, in der ich alle Bücher durchsuchen kann nach Titel oder Autor (Vor- oder Nachname).“

Antworten des CEO (wörtlich, 2026-11-12): F6.1 Suchfeld-Text „wie im screenshot“; F6.2 „gerne schon beim Tippen“; F6.3 Groß-/Kleinschreibung „nein“; F6.4 Wortteile „ja“; F6.5 kein Treffer „nichts (leere liste)“; F6.6 „nur für die gewählte pille / Filterung“.

## Anforderung (Satzschablone)

- Das System muss im oberen Bereich der Übersicht ein Suchfeld darstellen, das, solange es leer ist, nach dem Muster „In [Liste] suchen“ beschriftet ist: bei „Alle“ genau „In Alle Bücher suchen“, bei „Noch zu lesen“ genau „In Noch zu lesen suchen“ (CEO: „Muster, bitte merken: "In [Status] suchen"“).
- Das System muss bereits während der Eingabe nach jedem Zeichen das Ergebnis aktualisieren.
- Das System muss genau die Bücher darstellen, deren Buchtitel oder Autor den Suchbegriff als Zeichenfolge enthält (auch Wortteile), ohne Unterscheidung von Groß- und Kleinschreibung.
- Das System muss nur innerhalb der Bücher der gewählten Filterpille bzw. Übersicht suchen.
- Wenn kein Buch passt, muss das System eine leere Liste ohne Hinweistext darstellen.
- Wenn das Suchfeld leer ist, muss das System alle Bücher der Übersicht darstellen.

## Akzeptanzkriterien

### AK-1 Suchfeld-Text
- **Gegeben** die Übersicht „Alle Bücher“ mit leerem Suchfeld
- **Wenn** das Suchfeld betrachtet wird
- **Dann** steht darin „In Alle Bücher suchen“
- **Und** in der Übersicht „Noch zu lesen“ steht im leeren Suchfeld „In Noch zu lesen suchen“

### AK-2 Titel, Wortteil, Groß/Klein
- **Gegeben** Bücher „Dire bound“ und „Threshing day“
- **Wenn** der Nutzer „BOU“ eingibt
- **Dann** wird nur „Dire bound“ angezeigt, ohne weitere Bestätigung

### AK-3 Vorname und Nachname
- **Gegeben** ein Buch des Autors „Sable Sorensen“ und ein Buch eines anderen Autors
- **Wenn** der Nutzer „sable“ bzw. „soren“ eingibt
- **Dann** wird jeweils nur das Buch von „Sable Sorensen“ angezeigt

### AK-4 Kein Treffer
- **Gegeben** kein Buch enthält „xyz“
- **Wenn** der Nutzer „xyz“ eingibt
- **Dann** wird kein Buch und kein Hinweistext angezeigt

### AK-5 Nur innerhalb der Übersicht
- **Gegeben** die Übersicht „Noch zu lesen“ (REQ-040), ein ungelesenes Buch „Alpha“ und ein gelesenes Buch „Alphabet“
- **Wenn** der Nutzer „alpha“ eingibt
- **Dann** wird nur „Alpha“ angezeigt

### AK-6 Suchfeld leeren
- **Gegeben** eine Suche ist aktiv
- **Wenn** der Nutzer das Suchfeld leert
- **Dann** werden wieder alle Bücher der Übersicht angezeigt

## Abgrenzung (nicht Teil dieses REQ)

- Suche außerhalb der Übersichten.

## Qualitätsanforderungen

- Keine genannt.

## Abhängigkeiten

- REQ-028 (Autor als ein Text), REQ-036, REQ-037, REQ-040.

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-12 | Erstellt (Entwurf aus CEO-Vorgabe) | Anforderungsmanager |
| 2026-11-12 | CEO-Antworten F6 eingearbeitet. Status bleibt Entwurf | Anforderungsmanager |
| 2026-11-12 | CEO-Antwort 5.1: Suchfeld-Muster „In [Liste] suchen“ (AK-1 ergänzt). Status bleibt Entwurf | Anforderungsmanager |
