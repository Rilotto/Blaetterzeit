---
id: REQ-051
titel: Reiter „Details“ – Aufbau mit fünf Abschnittsüberschriften
status: Entwurf
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **im Reiter „Details“ die Angaben zum Buch in klar überschriebenen Abschnitten sehen**, damit **ich mich schnell zurechtfinde**.

Vorgabe des CEO (wörtlich, 2026-11-15): „Hier gibts wie im Reiter Rezensionen auch so Überschriften. Hier sind diese: Genres, Tropes, Inhaltswarnungen, Sammlung und Bibliotheken, Ausgabe. Setze diese auf jeden Fall bitte mit um.“

Referenzbilder: [referenzen/REF-details-01-uebersicht.png](referenzen/REF-details-01-uebersicht.png), [referenzen/REF-details-02-ausgabe.png](referenzen/REF-details-02-ausgabe.png). Im Referenzbild lautet die vierte Überschrift „Sammlungen und Bibliotheken“; übernommen wird die Schreibweise des Referenzbilds. Die optische Übereinstimmung prüft der CEO im Prototyp; sie ist kein Akzeptanzkriterium.

## Anforderung (Satzschablone)

- Wenn der Reiter „Details“ (REQ-043) aktiv ist, muss das System dessen Bereich anstelle von „under construction :)“ anzeigen.
- Das System muss im Bereich „Details“ genau diese Überschriften in dieser Reihenfolge darstellen: „Genres“, „Tropes“, „Inhaltswarnungen“, „Sammlungen und Bibliotheken“, „Ausgabe“.
- Das System muss die Überschriften im selben Stil wie die Überschriften im Reiter „Rezension“ und farblich wie im Referenzbild darstellen, mit Farben aus zentralen Farbrubriken.

## Akzeptanzkriterien

### AK-1 Fünf Überschriften
- **Gegeben** die Buchdetails werden angezeigt
- **Wenn** der Nutzer den Reiter „Details“ antippt
- **Dann** stehen dort von oben nach unten „Genres“, „Tropes“, „Inhaltswarnungen“, „Sammlungen und Bibliotheken“, „Ausgabe“

### AK-2 Kein Platzhaltertext
- **Gegeben** der Reiter „Details“ ist aktiv
- **Wenn** der Bereich betrachtet wird
- **Dann** steht dort kein „under construction :)“

## Abgrenzung (nicht Teil dieses REQ)

- Inhalte der Abschnitte (REQ-052 bis REQ-058).
- „Kaufen“ (REQ-013: nicht relevant).

## Qualitätsanforderungen

- Keine.

## Abhängigkeiten

- **REQ-043, REQ-044, REQ-047.**

## Offene Fragen

- „Bearbeiten“ rechts neben Genres, Tropes und Inhaltswarnungen (Referenzbild): siehe Frage 5.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-15 | Erstellt aus CEO-Vorgabe „Reiter Details“ | Anforderungsmanager |
