---
id: REQ-044
titel: Reiter „Rezension“ – Bereich „Bewertung“ mit 14 Bewertungskriterien
status: In Umsetzung
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **ein Buch nach mehreren Kriterien bewerten**, damit **ich festhalte, wie mir einzelne Aspekte gefallen haben**.

Vorgabe des CEO (wörtlich, 2026-11-13): „So beinhaltet Rezension die Bereiche Bewertung (inkl. Filtersymbol (später hinterlegte Funktionalität -> auf To-Do Liste setzen)) und die eigene Rezension als Textfeld. […] Die Bewertungskriterien kann ich selbst in der App auswählen aus einer verfügbaren Liste. Das ist aber die Filterfunktion, welche wir erst später umsetzen möchten.“

Mit dem CEO festgelegt (2026-11-13, über den Scrum Master): Kriterien und Reihenfolge; bis zur Filterfunktion sind alle 14 sichtbar; Bewertung je Kriterium 1–5 (fünf Symbole). CEO 2026-11-15 zu Farben/Gestaltung: „wie im Screenshot“.

Referenzbild: [referenzen/REF-rezension-01-bewertung.png](referenzen/REF-rezension-01-bewertung.png). Es zeigt nur sechs Kriterien („Figuren“ statt Haupt-/Nebenfiguren); maßgeblich ist die Liste unten. Die optische Übereinstimmung prüft der CEO im Prototyp; sie ist kein Akzeptanzkriterium.

## Anforderung (Satzschablone)

- Wenn der Reiter „Rezension“ (REQ-043) aktiv ist, muss das System den Bereich „Bewertung“ mit der Überschrift „Bewertung“ anzeigen.
- Das System muss rechts neben der Überschrift ein Filtersymbol darstellen.
- Wenn der Nutzer das Filtersymbol antippt, darf das System nichts verändern (Funktion steht auf der To-do-Liste, Eintrag 2026-11-13).
- Das System muss im Bereich „Bewertung“ genau diese 14 Bewertungskriterien in genau dieser Reihenfolge darstellen: Sterne, Tempo, Weltenbau, Spice, Spannung, Action, Hauptfiguren, Nebenfiguren, Plot Twist, Tränen, Romantik, Humor, Grusel, Dialoge.
- Das System muss „Sterne“ immer an erster Stelle darstellen.
- Das System muss je Bewertungskriterium dessen Namen und fünf Symbole des Kriteriums (REQ-046) darstellen.
- Das System muss Überschrift, Filtersymbol, Karte, Trennlinien und Kriteriennamen wie im Referenzbild darstellen, mit Farben aus zentralen Farbrubriken.

## Akzeptanzkriterien

### AK-1 Bereich „Bewertung“ im Reiter „Rezension“
- **Gegeben** die Buchdetails werden angezeigt
- **Wenn** der Reiter „Rezension“ aktiv ist
- **Dann** wird der Bereich mit der Überschrift „Bewertung“ und dem Filtersymbol angezeigt

### AK-2 14 Kriterien in fester Reihenfolge
- **Gegeben** der Bereich „Bewertung“ wird angezeigt
- **Wenn** die Kriterien von oben nach unten gelesen werden
- **Dann** lauten sie genau: Sterne, Tempo, Weltenbau, Spice, Spannung, Action, Hauptfiguren, Nebenfiguren, Plot Twist, Tränen, Romantik, Humor, Grusel, Dialoge

### AK-3 Fünf Symbole je Kriterium
- **Gegeben** der Bereich „Bewertung“ wird angezeigt
- **Wenn** eine beliebige Kriterienzeile betrachtet wird
- **Dann** enthält sie den Kriteriennamen und genau fünf Symbole dieses Kriteriums

### AK-4 Filtersymbol ohne Funktion
- **Gegeben** der Bereich „Bewertung“ wird angezeigt
- **Wenn** der Nutzer das Filtersymbol antippt
- **Dann** bleiben Kriterien, Reihenfolge und Bewertungen unverändert
- **Und** es öffnet sich kein Menü und kein Fenster

## Abgrenzung (nicht Teil dieses REQ)

- Auswahl der Kriterien über das Filtersymbol (To-do-Liste, Eintrag 2026-11-13).
- Setzen einer Bewertung (REQ-045), Icons und Farben der Kriterien (REQ-046), Stufentexte (REQ-048).

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-043, REQ-045, REQ-046, REQ-048.**

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-13 | Erstellt (Entwurf aus CEO-Vorgabe „Pille Rezension“) | Anforderungsmanager |
| 2026-11-15 | CEO-Antworten 3, 7, 8: Gestaltung wie Screenshot, Filtersymbol aus Material Symbols (REQ-046), Must | Anforderungsmanager |
| 2026-11-15 | Status „Abgestimmt“ (CEO 2026-11-15, über den Scrum Master: „Der Rest ist in Ordnung.“) | Anforderungsmanager |
