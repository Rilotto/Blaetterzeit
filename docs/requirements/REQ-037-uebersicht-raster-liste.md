---
id: REQ-037
titel: Übersichten – Darstellung als Raster oder Liste, zuletzt gewählte Ansicht gemerkt
status: In Umsetzung
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **meine Bücher in der Übersicht wahlweise mit Cover oder als Liste sehen**, damit **ich die für mich passende Darstellung nutze**.

Vorgabe des CEO (wörtlich, 2026-11-12): „Diese Bücher können entweder mit dem Frontcover, Titel und Autor angezeigt werden (siehe Screenshot), oder auch als Liste (siehe anderer Screenshot).“

Antworten des CEO (wörtlich, 2026-11-12):
- F3: „erstmal soll es nur die Beiden Ansichten geben. Die erste Ansicht ist immer die zuletzt ausgewählte, daher soll die App sich diese auch merken.“
- F5.1: „Wenn das Buch aktuell gelesen wird, soll dort der Fortschrittsbalken und die Prozentanzahl wie im Screenshot angezeigt werden. Anderenfalls wird der aktuelle Status des Buches angezeigt.“
- F5.2 Autor: „wie bisher, ein gespeicherter Text“. F5.3 ohne Autor: „Man sieht nur das Icon, keinen Namen“.
- F8: Farben „wie im Screenshot mit den bestehenden Farben“.

Referenzbilder: [referenzen/REF-alle-buecher-02-raster.png](referenzen/REF-alle-buecher-02-raster.png) (Raster), [referenzen/REF-alle-buecher-01-liste.png](referenzen/REF-alle-buecher-01-liste.png) (Liste).

## Anforderung (Satzschablone)

**Umschalter**
- Das System muss in den Übersichten (REQ-036, REQ-040) einen Umschalter mit genau zwei Ansichten darstellen: Rasteransicht und Listenansicht.
- Das System muss die zuletzt gewählte Ansicht je Liste (je Filter) getrennt dauerhaft speichern (über Neustart, Repository-Schnittstelle ADR-0002) und beim Anzeigen dieser Liste verwenden (CEO: „nein, immer nur für die jeweilige Liste.“).

**Autorzeile (beide Ansichten)**
- Das System muss den Autor als gespeicherten Text unverändert darstellen (REQ-028), mit dem Icon aus dem Referenzbild davor.
- Wenn ein Buch keinen Autor hat, muss das System nur das Icon ohne Namen darstellen.

**Rasteransicht**
- Das System muss jedes Buch mit Frontcover (bzw. Cover-Platzhalter REQ-010), darunter Buchtitel und Autorzeile darstellen.

**Listenansicht**
- Das System muss jedes Buch als Karte mit Frontcover (bzw. Cover-Platzhalter), Buchtitel und Autorzeile darstellen.
- Wenn das Buch den Lesestatus *am lesen* und eine Seitenanzahl hat, muss das System in der Karte den Lesefortschrittsbalken und darunter den Fortschrittstext darstellen: im Modus „Seite“ im Format „<aktuelle Seite> / <Seitenanzahl> · <Prozent> %“ (CEO: „ja“ zu „200 / 608 · 33 %“), im Modus „%“ nur „<Prozent> %“ ohne Seitenzahlen (CEO: „Wenn ich es in Prozent angebe, wird der Fortschritt trotzdem angezeigt.“, „Wenn ein Fortschritt nur in Prozent angegeben ist, sollen bitte keine Seitenzahlen dran stehen“). Prozent in ganzen Zahlen, kaufmännisch gerundet wie in der Statistik-Pille (REQ-026).
- Wenn das Buch den Lesestatus *am lesen*, aber keine Seitenanzahl hat, darf das System weder Balken noch Fortschrittstext darstellen (CEO: „Bei keiner Seitenzahl erscheint dieser Balken einfach nicht und auch nicht der Fortschrittstext.“).
- Wenn das Buch einen anderen Lesestatus hat, muss das System in der Karte genau die Bezeichnung dieses Lesestatus aus der zentralen Definition (REQ-008) darstellen, z. B. „ungelesen“ (CEO: „Immer an den konkreten Status halten bitte“).

**Farben**
- Farben aus bestehenden Farbrubriken nach dem Referenzbild; konkrete Werte kein Akzeptanzkriterium.

## Akzeptanzkriterien

### AK-1 Genau zwei Ansichten
- **Gegeben** eine Übersicht ist geöffnet
- **Wenn** der Umschalter betrachtet wird
- **Dann** bietet er genau Raster und Liste an

### AK-2 Wechsel
- **Gegeben** eine Übersicht ist geöffnet
- **Wenn** der Nutzer die jeweils andere Ansicht wählt
- **Dann** werden dieselben Bücher in derselben Reihenfolge in der gewählten Ansicht dargestellt

### AK-3 Ansicht wird je Liste gemerkt
- **Gegeben** der Nutzer hat bei „Alle“ die Listenansicht und bei „Noch zu lesen“ die Rasteransicht gewählt
- **Wenn** die App neu gestartet wird und beide Listen nacheinander angezeigt werden
- **Dann** erscheint „Alle“ in der Listenansicht und „Noch zu lesen“ in der Rasteransicht

### AK-4 Rastereintrag
- **Gegeben** die Rasteransicht und ein Buch mit Frontcover, Titel und Autor
- **Wenn** dessen Eintrag betrachtet wird
- **Dann** zeigt er Frontcover, Buchtitel, Icon und Autor

### AK-5 Ohne Cover, ohne Autor
- **Gegeben** ein Buch ohne Frontcover und ohne Autor
- **Wenn** es in Raster- oder Listenansicht angezeigt wird
- **Dann** steht an Stelle des Covers der Cover-Platzhalter (REQ-010)
- **Und** in der Autorzeile steht nur das Icon, kein Name

### AK-6 Liste: Buch „am lesen“
- **Gegeben** ein Buch mit Lesestatus *am lesen*, Seitenanzahl 608, aktuelle Seite 200
- **Wenn** es in der Listenansicht angezeigt wird
- **Dann** zeigt die Karte den Fortschrittsbalken und „200 / 608 · 33 %“

### AK-7 Liste: anderer Lesestatus
- **Gegeben** ein Buch mit Lesestatus *ungelesen*
- **Wenn** es in der Listenansicht angezeigt wird
- **Dann** zeigt die Karte genau „ungelesen“ und keinen Fortschrittsbalken

### AK-8 Liste: „am lesen“ ohne Seitenanzahl
- **Gegeben** ein Buch mit Lesestatus *am lesen* ohne Seitenanzahl
- **Wenn** es in der Listenansicht angezeigt wird
- **Dann** zeigt die Karte weder Fortschrittsbalken noch Fortschrittstext

### AK-9 Liste: Fortschritt im Modus „%“
- **Gegeben** ein Buch mit Lesestatus *am lesen*, Seitenanzahl und im Modus „%“ gespeichertem Fortschritt 33
- **Wenn** es in der Listenansicht angezeigt wird
- **Dann** zeigt die Karte den Fortschrittsbalken und genau „33 %“, ohne Seitenzahlen

## Abgrenzung (nicht Teil dieses REQ)

- Weitere Ansichten (dritte Ansicht aus dem Referenzbild: CEO „erstmal“ nicht).
- Suche (REQ-038).

## Qualitätsanforderungen

- Keine genannt.

## Abhängigkeiten

- REQ-008, REQ-010, REQ-020, REQ-023, REQ-024, REQ-025, REQ-028, REQ-036, REQ-040, ADR-0002.

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-12 | Erstellt (Entwurf aus CEO-Vorgabe) | Anforderungsmanager |
| 2026-11-12 | CEO-Antworten F3, F5, F8 eingearbeitet. Status bleibt Entwurf | Anforderungsmanager |
| 2026-11-12 | CEO-Antworten Runde 2: Ansicht je Liste (AK-3), Modus „%“ und ohne Seitenanzahl (neu AK-8, AK-9), konkreter Statusname (AK-7). Rundung aus REQ-026 abgeleitet. Status bleibt Entwurf | Anforderungsmanager |
| 2026-11-12 | CEO-Antwort Runde 3, F2: Modus „%“ ohne Seitenzahlen (AK-9). Status bleibt Entwurf | Anforderungsmanager |
