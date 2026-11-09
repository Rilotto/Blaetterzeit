---
id: REQ-018
titel: Buchdetails – Buchtitel unter der Buchdarstellung
status: Entwurf
prioritaet: offen
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **in den Buchdetails unter der Buchdarstellung den Titel des Buches lesen**, damit **ich das Buch eindeutig erkenne, auch wenn ein Bild hinterlegt ist**.

Vorgabe des CEO (wörtlich, 2026-11-09): „Unter der Darstellung des Buches soll dann der Titel des Buches stehen (siehe erster Screenshot).“

Referenzbild: [referenzen/REF-buchdetails-01.png](referenzen/REF-buchdetails-01.png). Schriftgröße, Ausrichtung (im Bild mittig) und Abstand orientieren sich am Referenzbild; kein Akzeptanzkriterium.

## Anforderung (Satzschablone)

- Das System muss in den Buchdetails unterhalb der Buchdarstellung (REQ-014) den Buchtitel des angezeigten Buches darstellen.
- Das System muss den Buchtitel dort unabhängig davon darstellen, ob Bilder hinterlegt sind.
- Das System muss die Farbe des Buchtitels über eine Farbrolle aus einer zentralen Farbrubrik beziehen (Farbrubrik offen).

## Akzeptanzkriterien

### AK-1 Titel unter der Buchdarstellung
- **Gegeben** die Buchdetails eines Buches werden angezeigt
- **Wenn** der Bereich unterhalb der Buchdarstellung betrachtet wird
- **Dann** steht dort der Buchtitel dieses Buches

### AK-2 Auch mit hinterlegtem Cover
- **Gegeben** für das Buch ist im Bereich „Cover“ ein Bild hinterlegt
- **Wenn** die Buchdetails angezeigt werden
- **Dann** steht der Buchtitel weiterhin unter der Buchdarstellung

## Abgrenzung (nicht Teil dieses REQ)

- Inhalte unterhalb des Titels im Referenzbild (Lesestatus, Fortschritt, Statistik, Zitat).
- Bearbeiten des Titels.

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-008:** Buchtitel. **REQ-013, REQ-014:** Fenster und Buchdarstellung.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

- Farbe des Titels.
- Wie soll ein langer Titel dargestellt werden?
- Priorität.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-09 | Erstellt (Entwurf aus der CEO-Beschreibung „Buchdetails“ Teil 1) | Anforderungsmanager |
