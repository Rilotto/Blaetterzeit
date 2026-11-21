---
id: REQ-047
titel: Reiter „Rezension“ – Bereich „Deine Rezension“ mit Schreibfeld und Teilen-Symbol ohne Funktion
status: Entwurf
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **unter der Bewertung meine eigene Rezension sehen und von dort aus schreiben**, damit **ich meine Meinung zum Buch festhalte**.

Vorgabe des CEO (wörtlich, 2026-11-13): „So beinhaltet Rezension die Bereiche Bewertung […] und die eigene Rezension als Textfeld. Der Teilen Button und "enthält spoiler / Öffentlich" sollen NICHT umgesetzt werden.“

Antwort des CEO (wörtlich, 2026-11-15): „Überschrift muss umgesetzt werden, optisch bitte das "Teilen" Symbol rechts (aktuell ohne Funktion, bitte auf To-Do Liste setzen!), danach nur das Schreibfeld mit der Vorbefüllung "Wie fandest du es?" und dem Stift. Wenn ich da rein klicke, öffnet sich ein neues Fenster und ich kann hier meine Meinung reinschreiben (siehe Screenshots). Das mit öffentlich und enthält Spoiler muss nicht umgesetzt werden. Der Kreis und das "noch nicht geschrieben" entfällt ebenfalls. Es gibt keine Längenbegrenzung. Die volle Rezensionslänge wird nach "sichern" angezeigt.“ Farben: „wie im Screenshot“.

Hinweis: Die Antwort vom 2026-11-15 präzisiert „Teilen Button … NICHT umgesetzt“: Das Symbol wird dargestellt, die Funktion nicht (REQ-050, Could).

Referenzbild: [referenzen/REF-rezension-01-bewertung.png](referenzen/REF-rezension-01-bewertung.png). Die optische Übereinstimmung prüft der CEO im Prototyp; sie ist kein Akzeptanzkriterium.

## Anforderung (Satzschablone)

- Wenn der Reiter „Rezension“ (REQ-043) aktiv ist, muss das System unter dem Bereich „Bewertung“ (REQ-044) den Bereich mit der Überschrift „Deine Rezension“ anzeigen.
- Das System muss rechts neben der Überschrift ein Teilen-Symbol darstellen.
- Wenn der Nutzer das Teilen-Symbol antippt, darf das System nichts verändern (Funktion: REQ-050, To-do-Liste).
- Das System muss unter der Überschrift ein Schreibfeld darstellen. Ohne gesicherte Rezension zeigt es den Platzhaltertext „Wie fandest du es?“ mit einem Stift-Symbol.
- Wenn der Nutzer das Schreibfeld antippt, muss das System das Schreibfenster (REQ-049) öffnen.
- Liegt eine gesicherte Rezension vor, muss das System im Schreibfeld ihren vollständigen Text anzeigen, ohne Kürzung.
- Das System darf im Bereich weder einen Kreis noch den Text „Noch nicht geschrieben“ noch die Angaben „Enthält Spoiler“ und „Öffentlich“ darstellen.

## Akzeptanzkriterien

### AK-1 Überschrift und Teilen-Symbol
- **Gegeben** der Reiter „Rezension“ ist aktiv
- **Wenn** der Bereich unter „Bewertung“ betrachtet wird
- **Dann** steht dort die Überschrift „Deine Rezension“ und rechts daneben ein Teilen-Symbol

### AK-2 Teilen-Symbol ohne Funktion
- **Gegeben** der Bereich „Deine Rezension“ wird angezeigt
- **Wenn** der Nutzer das Teilen-Symbol antippt
- **Dann** öffnet sich kein Menü und kein Fenster, und nichts ändert sich

### AK-3 Leeres Schreibfeld
- **Gegeben** ein Buch ohne gesicherte Rezension
- **Wenn** der Bereich „Deine Rezension“ betrachtet wird
- **Dann** zeigt das Schreibfeld „Wie fandest du es?“ mit einem Stift-Symbol

### AK-4 Antippen öffnet das Schreibfenster
- **Gegeben** der Bereich „Deine Rezension“ wird angezeigt
- **Wenn** der Nutzer das Schreibfeld antippt
- **Dann** öffnet sich das Schreibfenster (REQ-049) zu diesem Buch

### AK-5 Volle Rezension nach dem Sichern
- **Gegeben** im Schreibfenster wurde ein Text mit 3000 Zeichen und mehreren Absätzen gesichert
- **Wenn** der Bereich „Deine Rezension“ betrachtet wird
- **Dann** zeigt das Schreibfeld den vollständigen Text ungekürzt
- **Und** „Wie fandest du es?“ wird nicht angezeigt

### AK-6 Entfallene Elemente
- **Gegeben** der Bereich „Deine Rezension“ wird angezeigt
- **Wenn** er vollständig betrachtet wird
- **Dann** gibt es keinen Kreis, kein „Noch nicht geschrieben“, kein „Enthält Spoiler“ und kein „Öffentlich“

### AK-7 Rezension je Buch
- **Gegeben** für Buch A wurde eine Rezension gesichert, für Buch B nicht
- **Wenn** die Buchdetails von Buch B angezeigt werden
- **Dann** zeigt das Schreibfeld „Wie fandest du es?“

## Abgrenzung (nicht Teil dieses REQ)

- Schreibfenster (REQ-049). Teilen-Funktion (REQ-050). „Enthält Spoiler“, „Öffentlich“.

## Qualitätsanforderungen

- Keine Längenbegrenzung der Rezension (CEO).

## Abhängigkeiten

- **REQ-043, REQ-044, REQ-049, REQ-050.**

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-13 | Erstellt (Entwurf aus CEO-Vorgabe „Pille Rezension“) | Anforderungsmanager |
| 2026-11-15 | CEO-Antworten 3, 6, 8: Überschrift, Teilen-Symbol ohne Funktion (statt „keine Teilen-Schaltfläche“), Schreibfeld mit Platzhalter und Stift öffnet Schreibfenster, kein Kreis / „Noch nicht geschrieben“, keine Längenbegrenzung, volle Länge nach Sichern; Must. AKs neu gefasst | Anforderungsmanager |
