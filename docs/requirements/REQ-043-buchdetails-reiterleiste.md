---
id: REQ-043
titel: Buchdetails – Reiterleiste mit wandernder Pille
status: Entwurf
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **in den Buchdetails über eine Reiterleiste zwischen Bereichen wechseln**, damit **ich Rezension, Notizbuch, Figuren & Orte und Details getrennt aufrufen kann**.

Vorgabe des CEO (wörtlich, 2026-11-13): „Die Graue Pille hat eine feste Breite (Bildschirmbreite), bei einem Klick auf das Icon wandert die Rote innenliegende Pille und es öffnet sich das andere Menü.“

Antworten des CEO (wörtlich, 2026-11-15):
- „Es gibt Rezension, Notizbuch (das mit dem Stift und den drei Linien), das Personensymbol steht für Figuren & Orte, das Info-i steht für Details. Das ist dann auch die Reihenfolge“
- „Die Leiste sitzt mit leichtem Abstand unterhalb der Statistik-Pille. Rezension ist beim Öffnen aktiv. Das Wandern der Pille soll smooth aussehen. Die Bezeichnung steht nur im aktiven Reiter.“
- Farben: „wie im Screenshot“
- Inhalt der übrigen Reiter (2026-11-15): „auch "unter construction :)"“

Referenzbilder: [referenzen/REF-rezension-01-bewertung.png](referenzen/REF-rezension-01-bewertung.png), [referenzen/REF-details-01-uebersicht.png](referenzen/REF-details-01-uebersicht.png). Aussehen, Farben und die Weichheit der Bewegung prüft der CEO im Prototyp; sie sind kein Akzeptanzkriterium.

## Anforderung (Satzschablone)

- Das System muss in den Buchdetails mit leichtem Abstand unterhalb der Statistik-Pille (REQ-026) eine Reiterleiste („graue Pille“) mit fester Breite in Bildschirmbreite darstellen.
- Das System muss in der Reiterleiste genau vier Reiter in dieser Reihenfolge darstellen: „Rezension“ (Stern), „Notizbuch“ (Stift mit drei Linien), „Figuren & Orte“ (Personensymbol), „Details“ (Info-i).
- Das System muss den aktiven Reiter durch eine innenliegende Pille („rote Pille“) mit Icon und Bezeichnung kennzeichnen; nicht aktive Reiter zeigen nur ihr Icon.
- Wenn die Buchdetails geöffnet werden, muss das System den Reiter „Rezension“ als aktiv darstellen.
- Wenn der Nutzer das Icon eines nicht aktiven Reiters antippt, muss das System die innenliegende Pille in einer fließenden Bewegung zu diesem Reiter wandern lassen und den zugehörigen Bereich anzeigen.
- Wenn der Reiter „Notizbuch“ oder „Figuren & Orte“ aktiv ist, muss das System in dessen Bereich den Platzhaltertext „under construction :)“ in der Platzhalter-Textfarbe (REQ-002, REQ-004) anzeigen.
- Die Breite der Reiterleiste darf sich beim Reiterwechsel nicht ändern.
- Das System muss Leiste, Pille, Icons und Schrift farblich wie im Referenzbild darstellen, mit Farben aus zentralen Farbrubriken.

## Akzeptanzkriterien

### AK-1 Lage und Breite
- **Gegeben** die Buchdetails werden angezeigt
- **Wenn** der Bereich unter der Statistik-Pille betrachtet wird
- **Dann** steht dort mit Abstand die Reiterleiste in Bildschirmbreite

### AK-2 Vier Reiter in fester Reihenfolge
- **Gegeben** die Reiterleiste wird angezeigt
- **Wenn** die Reiter von links nach rechts betrachtet werden
- **Dann** sind es genau „Rezension“, „Notizbuch“, „Figuren & Orte“, „Details“

### AK-3 Rezension beim Öffnen aktiv
- **Gegeben** ein beliebiges Buch
- **Wenn** dessen Buchdetails geöffnet werden
- **Dann** ist der Reiter „Rezension“ aktiv und sein Bereich wird angezeigt

### AK-4 Bezeichnung nur im aktiven Reiter
- **Gegeben** ein Reiter ist aktiv
- **Wenn** die Reiterleiste betrachtet wird
- **Dann** zeigt nur der aktive Reiter seine Bezeichnung neben dem Icon
- **Und** die drei übrigen zeigen nur ihr Icon

### AK-5 Reiterwechsel
- **Gegeben** der Reiter „Rezension“ ist aktiv
- **Wenn** der Nutzer das Icon eines anderen Reiters antippt
- **Dann** kennzeichnet die innenliegende Pille diesen Reiter mit seiner Bezeichnung
- **Und** der Bereich „Rezension“ wird nicht mehr angezeigt

### AK-6 Feste Breite
- **Gegeben** die Reiterleiste wird angezeigt
- **Wenn** der Nutzer nacheinander jeden Reiter antippt
- **Dann** bleibt die Breite der Reiterleiste unverändert

### AK-7 Fließende Bewegung
- **Gegeben** ein Reiter ist aktiv
- **Wenn** der Nutzer einen anderen Reiter antippt
- **Dann** bewegt sich die innenliegende Pille über einen Übergang zur neuen Stelle und springt nicht

### AK-8 Notizbuch und Figuren & Orte zeigen „under construction :)“
- **Gegeben** die Buchdetails werden angezeigt
- **Wenn** der Nutzer nacheinander „Notizbuch“ und „Figuren & Orte“ antippt
- **Dann** zeigt der Bereich jeweils „under construction :)“ in der Farbrubrik „Tertiär“ (REQ-004)

## Abgrenzung (nicht Teil dieses REQ)

- Inhalt des Reiters „Rezension“ (REQ-044 bis REQ-049).
- Echte Inhalte der Reiter „Notizbuch“, „Figuren & Orte“.
- Inhalt des Reiters „Details“ (REQ-051 ff.).

## Qualitätsanforderungen

- Keine messbaren Vorgaben; „smooth“ prüft der CEO im Prototyp.

## Abhängigkeiten

- **REQ-013:** Buchdetails. **REQ-026:** Statistik-Pille. **REQ-002, REQ-004:** Platzhaltertext „under construction :)“ in Tertiär.

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-13 | Erstellt (Entwurf aus CEO-Vorgabe „Pille Rezension“) | Anforderungsmanager |
| 2026-11-15 | CEO-Antworten 1, 2, 3, 8 eingearbeitet: vier Reiter, Lage, Startreiter, fließende Bewegung, Bezeichnung nur aktiv, Farben wie Screenshot, Must (neu AK-2 bis AK-4, AK-7) | Anforderungsmanager |
| 2026-11-15 | CEO-Antwort: übrige Reiter zeigen „under construction :)“ (neu AK-8) | Anforderungsmanager |
| 2026-11-15 | Reiter „Details“ erhält Inhalt (REQ-051 ff.) und zeigt kein „under construction :)“ mehr (AK-8 angepasst); Referenzbild REF-rezension-02-details.png (vom CEO gelöscht) durch REF-details-01-uebersicht.png ersetzt | Anforderungsmanager |
