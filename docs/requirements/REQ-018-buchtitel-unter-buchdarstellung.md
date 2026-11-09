---
id: REQ-018
titel: Buchdetails – Buchtitel unter der Buchdarstellung
status: In Umsetzung
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **in den Buchdetails unter der Buchdarstellung den Titel des Buches lesen**, damit **ich das Buch eindeutig erkenne, auch wenn ein Bild hinterlegt ist**.

Vorgabe des CEO (wörtlich, 2026-11-09): „Unter der Darstellung des Buches soll dann der Titel des Buches stehen (siehe erster Screenshot).“

Antworten des CEO (wörtlich, Auszüge, 2026-11-09): „[…] darunter wird der Titel maximal zweizeilig dargestellt.“ – „Der Titel hat die Farbe wie 'Deine Bücher'.“

Referenzbild: [referenzen/REF-buchdetails-01.png](referenzen/REF-buchdetails-01.png). Schriftgröße, Ausrichtung (im Bild mittig) und Abstand orientieren sich am Referenzbild; kein Akzeptanzkriterium.

## Anforderung (Satzschablone)

- Das System muss in den Buchdetails unterhalb der Buchdarstellung (REQ-014) den Buchtitel des angezeigten Buches darstellen.
- Das System muss den Buchtitel dort unabhängig davon darstellen, ob Bilder hinterlegt sind.
- Das System muss den Buchtitel dort bei Bedarf umbrechen und höchstens zweizeilig darstellen.
- Wenn der Buchtitel dort mehr als zwei Zeilen benötigen würde, muss das System ihn nach der zweiten Zeile abschneiden und das Abschneiden mit „…“ kenntlich machen (CEO, 2026-11-09).
- Das System muss den Buchtitel in der Farbrolle „Buchdetails-Titelfarbe“ darstellen, die ihren Wert aus der Farbrubrik „Tertiär“ bezieht (CEO: „wie 'Deine Bücher'“, REQ-005).

## Akzeptanzkriterien

### AK-1 Titel unter der Buchdarstellung
- **Gegeben** die Buchdetails eines Buches werden angezeigt
- **Wenn** der Bereich unterhalb der Buchdarstellung betrachtet wird
- **Dann** steht dort der Buchtitel dieses Buches

### AK-2 Auch mit hinterlegtem Cover
- **Gegeben** für das Buch ist im Bereich „Cover“ ein Bild hinterlegt
- **Wenn** die Buchdetails angezeigt werden
- **Dann** steht der Buchtitel weiterhin unter der Buchdarstellung

### AK-3 Höchstens zwei Zeilen
- **Gegeben** ein Buch, dessen Titel unter der Buchdarstellung mehr als zwei Zeilen benötigen würde
- **Wenn** die Buchdetails angezeigt werden
- **Dann** ist der Titel umgebrochen und auf höchstens zwei Zeilen begrenzt
- **Und** das Ende der zweiten Zeile zeigt „…“

### AK-4 Farbe wie „Deine Bücher“
- **Gegeben** die Buchdetails werden angezeigt
- **Wenn** der Buchtitel unter der Buchdarstellung betrachtet wird
- **Dann** ist er in der Farbe der Farbrubrik „Tertiär“ dargestellt (dieselbe wie „Deine Bücher“, REQ-005)

### AK-5 Farbe aus zentraler Farbrubrik
- **Gegeben** der Wert der Farbrubrik „Tertiär“ wird an der zentralen Stelle geändert
- **Wenn** die Buchdetails angezeigt werden
- **Dann** ist der Buchtitel unter der Buchdarstellung im geänderten Wert dargestellt

## Abgrenzung (nicht Teil dieses REQ)

- Inhalte unterhalb des Titels im Referenzbild (Lesestatus, Fortschritt, Statistik, Zitat).
- Bearbeiten des Titels.
- Titel auf der Coverfläche ohne Bild (REQ-014).

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-008:** Buchtitel. **REQ-013, REQ-014:** Fenster und Buchdarstellung. **REQ-005:** Farbe von „Deine Bücher“.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-09 | Erstellt (Entwurf aus der CEO-Beschreibung „Buchdetails“ Teil 1) | Anforderungsmanager |
| 2026-11-09 | CEO-Antworten 5 und 7 eingearbeitet: höchstens zweizeilig (neu AK-3), Farbe Tertiär wie „Deine Bücher“ (neu AK-4, AK-5). Offen: Kürzung nach Zeile 2, Priorität | Anforderungsmanager |
| 2026-11-09 | CEO-Antworten eingearbeitet: nach zwei Zeilen mit „…“ abgeschnitten (AK-3 ergänzt), Priorität Must. Status „Abgestimmt“ (CEO 2026-11-09) | Anforderungsmanager |
