---
id: REQ-075
titel: 3D-Ansicht – Modell frei drehen mit Schwung, ohne Zoom
status: In Umsetzung
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **das 3D-Modell meines Buches frei in alle Richtungen drehen**, damit **ich es von jeder Seite betrachten kann**.

CEO (2026-11-21, wörtlich): „Wichtig: Ich möchte das Buch frei drehen können […]“. Antwort des CEO (über den Scrum Master): völlig frei in alle Richtungen; nach dem Loslassen dreht es mit Schwung weiter; kein Zoom; ein Zurück zur Startansicht ist nicht nötig. Startansicht laut CEO (2026-11-22, wörtlich): „Das 3D Buch soll bitte als Startposition komplett gerade ausgerichtet sein, mit dem Cover nach vorn.“ Das ersetzt die frühere Vorgabe „schräg wie im Screenshot“.

Referenzbild: [referenzen/REF-3d-01-ansicht.png](referenzen/REF-3d-01-ansicht.png) (Gesamteindruck; für die Startansicht nicht mehr maßgeblich).

## Anforderung (Satzschablone)

- Das System muss das 3D-Modell (REQ-076) beim Öffnen der 3D-Ansicht (REQ-074) in der Startansicht komplett gerade ausgerichtet zeigen, mit dem Cover frontal nach vorne, ohne Neigung oder Drehung.
- Das System muss dem Nutzer die Möglichkeit bieten, das Modell durch Ziehen mit dem Finger frei um alle Achsen zu drehen, ohne Begrenzung des Drehwinkels.
- Wenn der Nutzer den Finger nach einer Ziehbewegung loslässt, muss das System das Modell mit dem Schwung der Bewegung weiterdrehen.
- Das System darf die Größe des Modells durch Gesten (z. B. Zwei-Finger-Spreizen) nicht verändern.

## Akzeptanzkriterien

### AK-1 Startansicht
- **Gegeben** ein Buch
- **Wenn** die 3D-Ansicht geöffnet wird
- **Dann** steht das Modell komplett gerade, das Cover zeigt frontal nach vorne
- **Und** das Modell ist weder geneigt noch gedreht

### AK-2 Frei drehen, alle Richtungen
- **Gegeben** die 3D-Ansicht ist geöffnet
- **Wenn** der Nutzer waagerecht, senkrecht bzw. schräg zieht
- **Dann** dreht sich das Modell der Bewegung entsprechend um die zugehörige Achse
- **Und** durch fortgesetztes Ziehen in eine Richtung werden nacheinander Rückseite, Schnitt, Ober- und Unterkante sichtbar (kein Anschlag)

### AK-3 Schwung nach dem Loslassen
- **Gegeben** der Nutzer zieht zügig über das Modell
- **Wenn** er den Finger loslässt
- **Dann** dreht sich das Modell noch weiter in dieselbe Richtung

### AK-4 Kein Zoom
- **Gegeben** die 3D-Ansicht ist geöffnet
- **Wenn** der Nutzer mit zwei Fingern spreizt oder zusammenzieht
- **Dann** bleibt die Größe des Modells unverändert

## Abgrenzung (nicht Teil dieses REQ)

- Schaltfläche zurück zur Startansicht (vom CEO nicht gewünscht).
- Zoom.

## Qualitätsanforderungen

- Keine.

## Abhängigkeiten

- REQ-074, REQ-076.

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-21 | Erstellt aus CEO-Beschreibung und CEO-Antworten (über den Scrum Master); Inhalt vom CEO bestätigt. Status „Abgestimmt“ | Anforderungsmanager |
| 2026-11-21 | Startansicht an Referenzbild angeglichen (Hinweis des Scrum Masters, CEO: „Startansicht wie im Screenshot“): Cover, Schnitt rechts, Oberkante oben, Rücken nicht sichtbar. Anforderung und AK-1 geändert. Status unverändert | Anforderungsmanager |
| 2026-11-22 | CEO (wörtlich): „Das 3D Buch soll bitte als Startposition komplett gerade ausgerichtet sein, mit dem Cover nach vorn.“ Startansicht jetzt gerade und frontal statt schräg wie im Screenshot. Anforderung und AK-1 geändert. Status unverändert | Anforderungsmanager |
