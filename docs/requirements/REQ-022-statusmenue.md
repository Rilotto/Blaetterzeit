---
id: REQ-022
titel: Buchdetails – Statusmenü zum Ändern des Lesestatus
status: Entwurf
prioritaet: offen
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **über die Statuspille ein Menü mit allen Status öffnen und einen davon wählen**, damit **ich den Lesestatus des Buches direkt in den Buchdetails ändern kann**.

Vorgabe des CEO (wörtlich, Auszug, 2026-11-10): „Diese soll sich wie das Menü davor vom Bildimport je nach Platz über oder unter der Pille öffnen und alle verfügbaren Status anzeigen. […] Das Menü schließt sich wie das andere Menü auch, durch einen Klick außerhalb der Menüfläche oder durch einen Klick auf einen Status, welcher dann auch übernommen wird. […] Platzhalter (gerne wieder das Herz) pro Status auf der linken Seite, auch im Menü.“

## Anforderung (Satzschablone)

- Wenn der Nutzer die Statuspille (REQ-021) antippt, muss das System ein Statusmenü anzeigen.
- Das System muss das Statusmenü je nach verfügbarem Platz über oder unter der Statuspille öffnen, wie das Auswahlmenü der Buchdarstellung (REQ-015).
- Das System muss im Statusmenü alle Lesestatus der zentralen Definition (REQ-008) anzeigen.
- Das System muss im Statusmenü links neben jedem Status das Icon dieses Status aus der zentralen Zuordnung (REQ-021) darstellen; bis eigene Icons vorliegen, das Herz-Icon.
- Wenn der Nutzer im Statusmenü einen Status antippt, muss das System diesen Status für das Buch übernehmen, ihn in der Statuspille anzeigen und das Statusmenü schließen.
- Wenn der Nutzer außerhalb des Statusmenüs tippt, muss das System das Statusmenü schließen, ohne den Status zu ändern.

## Akzeptanzkriterien

### AK-1 Menü öffnet sich mit allen Status
- **Gegeben** die Buchdetails werden angezeigt
- **Wenn** der Nutzer die Statuspille antippt
- **Dann** erscheint das Statusmenü
- **Und** es enthält alle Lesestatus der zentralen Definition

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
- **Gegeben** das Statusmenü ist geöffnet und das Buch hat Status A
- **Wenn** der Nutzer Status B antippt
- **Dann** ist das Statusmenü geschlossen
- **Und** die Statuspille zeigt Status B

### AK-5 Tippen außerhalb schließt ohne Änderung
- **Gegeben** das Statusmenü ist geöffnet und das Buch hat Status A
- **Wenn** der Nutzer außerhalb des Statusmenüs tippt
- **Dann** ist das Statusmenü geschlossen
- **Und** die Statuspille zeigt weiterhin Status A

## Abgrenzung (nicht Teil dieses REQ)

- Darstellung der Statuspille (REQ-021).

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-008:** zentrale Lesestatus; Abgrenzung dort („Ändern des Lesestatus in den Buchdetails“) wird hiermit ergänzt. **REQ-009:** Abschnitt „Noch zu lesen“ hängt vom Status ab. **REQ-015:** Vorbild für Öffnen/Schließen. **REQ-021.**

## Offene Fragen

- F1: Anzeigenamen und Reihenfolge der Status im Menü.
- F2: Dauerhafte Speicherung des gewählten Status und sofortige Wirkung auf Buchlisten.
- F8: Farben und Schrift des Statusmenüs.
- Priorität.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-10 | Erstellt (Entwurf aus CEO-Beschreibung, Erweiterung 1) | Anforderungsmanager |
