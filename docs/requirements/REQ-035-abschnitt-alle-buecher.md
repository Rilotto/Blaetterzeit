---
id: REQ-035
titel: Seite „Bücher“ – Abschnitt „Alle Bücher“ mit „Alle ansehen ›“
status: Entwurf
prioritaet: offen
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **auf der Seite „Bücher“ einen Abschnitt „Alle Bücher“ sehen**, damit **ich von dort zur Übersicht aller meiner Bücher gelange**.

Vorgabe des CEO (wörtlich, 2026-11-12): „Im Reiter "Bücher" haben wir aktuell drei Bereiche: "Noch zu lesen", "Sagas" und "Sammlungen". Ich möchte, dass hier unterhalb von "Sammlungen" ein neuer Bereich hinzukommt. Gestalte diesen wie die anderen Bereiche auch, mit denselben Platzhaltern und Gestaltungsrichtlinien. Der neue Bereich heißt "Alle Bücher". Ebenso bekommt dieser Bereich auch wie "Noch zu lesen" rechts das kleine "Alle ansehen >". Dieses "Alle ansehen >" öffnet im Reiter "Bücher" ein neues Fenster, in dem es eine Übersicht aller Bücher gibt.“

## Anforderung (Satzschablone)

- Das System muss auf der Seite „Bücher“ unterhalb des Abschnitts „Sammlungen“ (REQ-012) den Abschnitt „Alle Bücher“ darstellen.
- Das System muss die Abschnittsüberschrift genau als „Alle Bücher“ darstellen, in derselben Gestaltung wie die Überschriften der bestehenden Abschnitte (REQ-009, REQ-012: linksbündig, gleiche Größe und Schriftstärke, Farbrolle „Abschnittsüberschriftfarbe“ / Farbrubrik „Tertiär“).
- Das System muss rechts neben der Überschrift „Alle Bücher“ den Text „Alle ansehen ›“ in derselben Gestaltung wie „Alle ansehen ›“ im Abschnitt „Noch zu lesen“ darstellen (Schrift aus derselben zentralen Definition, Farbrolle „Alle-ansehen-Farbe“ / Farbrubrik „Primär“).
- Wenn der Nutzer „Alle ansehen ›“ im Abschnitt „Alle Bücher“ antippt, muss das System innerhalb des Reiters „Bücher“ die Übersicht „Alle Bücher“ (REQ-036) öffnen.
- Inhalt des Abschnitts unter der Überschrift: siehe Offene Fragen (CEO: „mit denselben Platzhaltern und Gestaltungsrichtlinien“).

## Akzeptanzkriterien

### AK-1 Abschnitt unter „Sammlungen“
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** der Bereich unterhalb des Abschnitts „Sammlungen“ betrachtet wird
- **Dann** steht dort links die Überschrift „Alle Bücher“
- **Und** rechts daneben „Alle ansehen ›“

### AK-2 Überschrift wie die anderen Abschnitte
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** die Überschrift „Alle Bücher“ mit „Sammlungen“ verglichen wird
- **Dann** stimmen Schriftgröße, Schriftstärke und Farbrubrik („Tertiär“) überein

### AK-3 „Alle ansehen ›“ wie bei „Noch zu lesen“
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** „Alle ansehen ›“ der Abschnitte „Alle Bücher“ und „Noch zu lesen“ verglichen werden
- **Dann** stimmen Schriftgröße, Schriftart, Schriftstärke und Farbrubrik („Primär“) überein

### AK-4 „Alle ansehen ›“ öffnet die Übersicht
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** der Nutzer „Alle ansehen ›“ im Abschnitt „Alle Bücher“ antippt
- **Dann** wird die Übersicht „Alle Bücher“ (REQ-036) angezeigt
- **Und** der Menüpunkt „Bücher“ der Hauptnavigation bleibt ausgewählt

## Abgrenzung (nicht Teil dieses REQ)

- Inhalt der Übersicht (REQ-036 bis REQ-038).
- „Alle ansehen ›“ im Abschnitt „Noch zu lesen“ (REQ-009 AK-14 bleibt unverändert, solange der CEO nichts anderes entscheidet).

## Qualitätsanforderungen

- Keine genannt.

## Abhängigkeiten

- REQ-009, REQ-012 (Gestaltungsvorbild), REQ-010/REQ-011 (Platzhalter, je nach Antwort), REQ-036.

## Offene Fragen

- F1: Was steht im Abschnitt unter der Überschrift „Alle Bücher“? Leerer Zustand?

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-12 | Erstellt (Entwurf aus CEO-Vorgabe) | Anforderungsmanager |
