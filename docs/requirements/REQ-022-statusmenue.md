---
id: REQ-022
titel: Buchdetails – Statusmenü zum Ändern des Lesestatus
status: Abgestimmt
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **über die Statuspille ein Menü mit allen Status öffnen und einen davon wählen**, damit **ich den Lesestatus des Buches direkt in den Buchdetails ändern kann**.

Vorgabe des CEO (wörtlich, Auszug, 2026-11-10): „Diese soll sich wie das Menü davor vom Bildimport je nach Platz über oder unter der Pille öffnen und alle verfügbaren Status anzeigen. […] Das Menü schließt sich wie das andere Menü auch, durch einen Klick außerhalb der Menüfläche oder durch einen Klick auf einen Status, welcher dann auch übernommen wird. […] Platzhalter (gerne wieder das Herz) pro Status auf der linken Seite, auch im Menü.“

Antworten des CEO (wörtlich, 2026-11-10):
- „Die Statusnamen passen […] Reihenfolge: ungelesen, am lesen, gelesen, abgebrochen, Wunschliste.“
- „Ja, der Status bleibt immer gespeichert, ja er wirkt sich immer direkt auf die Listen aus […]“
- Farben: Statusmenü wie das Auswahlmenü beim Bildimport (REQ-015).

## Anforderung (Satzschablone)

- Wenn der Nutzer die Statuspille (REQ-021) antippt, muss das System ein Statusmenü anzeigen.
- Das System muss das Statusmenü je nach verfügbarem Platz über oder unter der Statuspille öffnen, wie das Auswahlmenü der Buchdarstellung (REQ-015).
- Das System muss im Statusmenü alle Lesestatus der zentralen Definition (REQ-008) mit ihren Namen in der Reihenfolge *ungelesen*, *am lesen*, *gelesen*, *abgebrochen*, *Wunschliste* anzeigen.
- Das System muss im Statusmenü links neben jedem Status das Icon dieses Status aus der zentralen Zuordnung (REQ-021) darstellen; bis eigene Icons vorliegen, das Herz-Icon.
- Das System muss das Statusmenü mit denselben Farbrollen (Fläche, Schrift, Icons) und derselben Schrift darstellen wie das Auswahlmenü der Buchdarstellung (REQ-015).
- Wenn der Nutzer im Statusmenü einen Status antippt, muss das System diesen Status für das Buch übernehmen, ihn in der Statuspille anzeigen und das Statusmenü schließen.
- Das System muss den gewählten Status dauerhaft über die Repository-Schnittstelle speichern (ADR-0002), auch über Neustarts hinweg.
- Das System muss einen geänderten Status sofort in allen Buchlisten berücksichtigen, die vom Lesestatus abhängen (z. B. Abschnitt „Noch zu lesen“, REQ-009).
- Wenn der Nutzer außerhalb des Statusmenüs tippt, muss das System das Statusmenü schließen, ohne den Status zu ändern.

## Akzeptanzkriterien

### AK-1 Menü öffnet sich mit allen Status in fester Reihenfolge
- **Gegeben** die Buchdetails werden angezeigt
- **Wenn** der Nutzer die Statuspille antippt
- **Dann** erscheint das Statusmenü
- **Und** es enthält genau die Einträge „ungelesen“, „am lesen“, „gelesen“, „abgebrochen“, „Wunschliste“ in dieser Reihenfolge

### AK-2 Position je nach Platz
- **Gegeben** unter der Statuspille ist nicht genug Platz für das Statusmenü
- **Wenn** der Nutzer die Statuspille antippt
- **Dann** öffnet sich das Statusmenü über der Pille
- **Und** bei genügend Platz darunter öffnet es sich unter der Pille

### AK-3 Icon je Status im Menü
- **Gegeben** das Statusmenü ist geöffnet
- **Wenn** die Einträge betrachtet werden
- **Dann** steht links neben jedem Status das Icon aus der zentralen Zuordnung (derzeit das Herz-Icon)

### AK-4 Status wählen übernimmt und schließt
- **Gegeben** das Statusmenü ist geöffnet und das Buch hat Status *ungelesen*
- **Wenn** der Nutzer „gelesen“ antippt
- **Dann** ist das Statusmenü geschlossen
- **Und** die Statuspille zeigt „gelesen“

### AK-5 Tippen außerhalb schließt ohne Änderung
- **Gegeben** das Statusmenü ist geöffnet und das Buch hat Status *ungelesen*
- **Wenn** der Nutzer außerhalb des Statusmenüs tippt
- **Dann** ist das Statusmenü geschlossen
- **Und** die Statuspille zeigt weiterhin „ungelesen“

### AK-6 Status bleibt gespeichert
- **Gegeben** der Nutzer hat für ein Buch den Status *abgebrochen* gewählt
- **Wenn** die Buchdetails erneut geöffnet werden (auch nach Neustart der App)
- **Dann** zeigt die Statuspille „abgebrochen“

### AK-7 Sofortige Wirkung auf die Buchlisten
- **Gegeben** ein Buch mit Status *ungelesen* steht im Abschnitt „Noch zu lesen“
- **Wenn** der Nutzer in dessen Buchdetails den Status *am lesen* wählt und zur Seite „Bücher“ zurückkehrt
- **Dann** steht das Buch nicht mehr im Abschnitt „Noch zu lesen“
- **Und** wählt der Nutzer danach wieder *ungelesen*, steht es dort wieder

### AK-8 Gestaltung wie das Auswahlmenü
- **Gegeben** das Statusmenü ist geöffnet
- **Wenn** Fläche, Schrift und Icons geprüft werden
- **Dann** beziehen sie ihre Farben aus denselben Farbrollen wie das Auswahlmenü der Buchdarstellung (REQ-015)

## Abgrenzung (nicht Teil dieses REQ)

- Darstellung der Statuspille (REQ-021).
- Welche Status zum Abschnitt „Noch zu lesen“ gehören (Abschnittszuordnung, REQ-009, unverändert).

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-008:** zentrale Lesestatus; dessen Abgrenzung „Ändern des Lesestatus in den Buchdetails“ wird hiermit umgesetzt. **REQ-009:** Abschnitt „Noch zu lesen“ hängt vom Status ab. **REQ-015:** Vorbild für Öffnen/Schließen und Gestaltung. **REQ-021.** **ADR-0002.**

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-10 | Erstellt (Entwurf aus CEO-Beschreibung, Erweiterung 1) | Anforderungsmanager |
| 2026-11-10 | CEO-Antworten eingearbeitet: F1 Namen und Reihenfolge (AK-1); F2 dauerhafte Speicherung und sofortige Wirkung auf Listen (neu AK-6, AK-7); F8 Gestaltung wie REQ-015 (neu AK-8). Priorität Must. Status „Abgestimmt“ (CEO 2026-11-10) | Anforderungsmanager |
