---
id: REQ-070
titel: Zuschnitt – Lupe und Feinjustierung beim Ziehen eines Eckpunkts
status: In Umsetzung
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **beim Ziehen eines Eckpunkts im Zuschnitt-Fenster die Umgebung des Eckpunkts vergrößert sehen und ihn bei langsamen Bewegungen feiner setzen können**, damit **ich die Ecke trotz meines Fingers exakt auf die Buchecke legen kann**.

Vorgabe des CEO (wörtlich, 2026-11-18): „Wenn ich die Ecken des Rahmens ziehe und an die exakte Stelle des Buches setzen möchte, verbirgt mein eigener Finger die klare Sicht auf die Ecke des Buches. Ich hätte gerne ein Zoom Fenster, in dem ich die Ecke hergezoomt sehe und die Kante besser platzieren kann.“

Bestätigung des CEO zum Entwurf des Scrum Masters (wörtlich, 2026-11-18): „mega gut!!! … 1. Ja das passt so 2. ja unbedingt! … lass uns b ausprobieren“

Erweitert REQ-017 (Zuschnitt mit vier Eckpunkten, Sprint 03). Das Verhalten von REQ-017 bleibt vollständig erhalten.

## Anforderung (Satzschablone)

**Lupe**
- Solange der Nutzer einen Eckpunkt im Zuschnitt-Fenster zieht, muss das System eine Lupe anzeigen.
- Wenn der Nutzer den Eckpunkt loslässt, muss das System die Lupe ausblenden.
- Solange kein Eckpunkt gezogen wird, darf das System keine Lupe anzeigen.
- Das System muss die Lupe im oberen Bereich des Zuschnitt-Fensters auf der dem gezogenen Eckpunkt gegenüberliegenden Seite anzeigen: Liegt der gezogene Eckpunkt in der linken Hälfte des Zuschnitt-Fensters, oben rechts, liegt er in der rechten Hälfte, oben links.
- Das System muss die Lupe rund darstellen, mit einer Standardgröße von etwa 116 px Durchmesser.
- Das System muss in der Lupe den Bildausschnitt um den gezogenen Eckpunkt mit einem Standard-Zoomfaktor von 3× vergrößert anzeigen, einschließlich der Rahmenlinien des Zuschnitts.
- Das System muss in der Lupe die genaue Position des gezogenen Eckpunkts mit einem Fadenkreuz markieren.
- Das System muss den Inhalt der Lupe während des Ziehens fortlaufend der aktuellen Position des Eckpunkts nachführen.

**Geltungsbereich**
- Das System muss Lupe und Feinjustierung bei jedem Zuschnitt anbieten, unabhängig vom Zielbereich (Cover, Buchrücken, Schnitt).

**Feinjustierung (Variante b, CEO: „ausprobieren“)**
- Wenn der Nutzer einen Eckpunkt schnell bewegt (Geschwindigkeit oberhalb eines Schwellwerts), muss das System den Eckpunkt der Fingerbewegung 1:1 folgen lassen.
- Wenn der Nutzer einen Eckpunkt langsam bewegt (Geschwindigkeit unterhalb des Schwellwerts), muss das System den Eckpunkt um einen Faktor kleiner als 1 verkleinert gegenüber der Fingerbewegung verschieben (feiner als der Finger, ähnlich einer Computermaus mit Beschleunigung).
- Das System muss Schwellwert(e) und Faktor der Feinjustierung sowie Größe und Zoomfaktor der Lupe als zentral definierte Standardwerte führen, die auf Zuruf des CEO angepasst werden können. Die konkreten Standardwerte sind kein Akzeptanzkriterium.

## Akzeptanzkriterien

### AK-1 Lupe nur während des Ziehens
- **Gegeben** das Zuschnitt-Fenster wird angezeigt und kein Eckpunkt wird gezogen
- **Dann** ist keine Lupe sichtbar
- **Wenn** der Nutzer einen Eckpunkt zu ziehen beginnt
- **Dann** ist die Lupe sichtbar
- **Wenn** der Nutzer den Eckpunkt loslässt
- **Dann** ist die Lupe nicht mehr sichtbar

### AK-2 Lupe auf der gegenüberliegenden Seite oben
- **Gegeben** das Zuschnitt-Fenster wird angezeigt
- **Wenn** der Nutzer einen Eckpunkt in der linken Hälfte des Zuschnitt-Fensters zieht
- **Dann** erscheint die Lupe im oberen Bereich rechts
- **Wenn** der Nutzer stattdessen einen Eckpunkt in der rechten Hälfte zieht
- **Dann** erscheint die Lupe im oberen Bereich links

### AK-3 Vergrößerter Inhalt mit Rahmenlinien und Fadenkreuz
- **Gegeben** der Nutzer zieht einen Eckpunkt
- **Wenn** die Lupe angezeigt wird
- **Dann** ist sie rund
- **Und** sie zeigt den Bildausschnitt um den gezogenen Eckpunkt vergrößert (Zoomfaktor gemäß Standardwert)
- **Und** sie zeigt die Rahmenlinien des Zuschnitts vergrößert
- **Und** ein Fadenkreuz markiert die Position des gezogenen Eckpunkts

### AK-4 Lupe folgt dem Eckpunkt
- **Gegeben** der Nutzer zieht einen Eckpunkt und die Lupe wird angezeigt
- **Wenn** sich die Position des Eckpunkts ändert
- **Dann** zeigt die Lupe den Ausschnitt um die neue Position, mit dem Fadenkreuz auf dem Eckpunkt

### AK-5 Gilt für Cover, Buchrücken und Schnitt
- **Gegeben** das Zuschnitt-Fenster wurde über den Bereich „Cover“, „Buchrücken“ bzw. „Schnitt“ geöffnet
- **Wenn** der Nutzer einen Eckpunkt zieht
- **Dann** wird jeweils die Lupe angezeigt und die Feinjustierung angewendet

### AK-6 Schnelle Bewegung 1:1
- **Gegeben** der Nutzer zieht einen Eckpunkt
- **Wenn** er den Finger schneller als der Schwellwert bewegt
- **Dann** verschiebt sich der Eckpunkt um dieselbe Strecke wie der Finger

### AK-7 Langsame Bewegung feiner
- **Gegeben** der Nutzer zieht einen Eckpunkt
- **Wenn** er den Finger langsamer als der Schwellwert bewegt
- **Dann** verschiebt sich der Eckpunkt in dieselbe Richtung, aber um eine kürzere Strecke als der Finger (gemäß Faktor)

### AK-8 Zentrale Standardwerte
- **Gegeben** die Standardwerte für Schwellwert, Faktor, Lupengröße und Zoomfaktor
- **Wenn** einer dieser Standardwerte an der zentralen Stelle geändert wird
- **Dann** wirkt der geänderte Wert im Zuschnitt, ohne dass weitere Stellen angepasst werden müssen

## Abgrenzung (nicht Teil dieses REQ)

- Automatisches Erkennen oder Einrasten an Buchkanten, da vom CEO nicht genannt.
- Eine Einstellung für den Nutzer in der App zum Ändern von Lupe oder Feinjustierung; Anpassung erfolgt nur über die Standardwerte auf Zuruf des CEO.
- Änderungen an Startrahmen, Bestätigen, Geradeziehen und Zurück-Pfeil (bleiben wie in REQ-017).

## Qualitätsanforderungen

- Keine messbaren Vorgaben des CEO. Die Feinjustierung wird vom CEO am Gerät ausprobiert; Anpassungen erfolgen über die Standardwerte.

## Abhängigkeiten

- **REQ-017:** Zuschnitt mit vier Eckpunkten (wird erweitert, nicht ersetzt). AK-3 von REQ-017 (Eckpunkte einzeln frei verschiebbar) bleibt gültig; die Feinjustierung ändert nur das Verhältnis von Finger- zu Eckpunktbewegung.
- **REQ-016:** Bildquelle (Zuschnitt folgt auf Aufnahme bzw. Auswahl).

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-18 | Erstellt aus CEO-Wunsch und vom CEO bestätigtem Entwurf (Lupe, Feinjustierung Variante b). Status „Abgestimmt“ (CEO 2026-11-18), Priorität Should | Anforderungsmanager |
