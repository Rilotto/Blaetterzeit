---
id: REQ-028
titel: Buchdetails – Autor unter dem Buchtitel
status: In Umsetzung
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **in den Buchdetails unter dem Buchtitel den Autor sehen**, damit **ich das Buch eindeutiger erkenne**.

Vorgabe des CEO (wörtlich, 2026-11-10): „Unter dem Titel des Buches in den Buchdetails soll der Autor stehen. Also maximal 2 Zeilen Titel, dann darunter in einer Zeile der oder die Autorin. Vorname, dann Nachname. Etwas kleinere Schrift wie der Buchtitel.“

Antworten des CEO (wörtlich, 2026-11-10):
- Farbe (auf Rückfrage, da GhostFrame zu wenig Kontrast hat): „Tertiär klingt gut.“
- „Nur ein Autor, auch nur ein Name wie bei Alchemised ist in Ordnung.“

## Anforderung (Satzschablone)

- Das System muss zu jedem Buch optional genau einen Autor speichern können (Erweiterung der Buchdaten, REQ-008).
- Das System muss in den Buchdetails direkt unter dem Buchtitel (REQ-018) und über der Statuspille (REQ-021) den Autor des Buches darstellen.
- Das System muss den Autor in der Reihenfolge „Vorname Nachname“ darstellen; ein Autor mit nur einem Namen (z. B. ein Pseudonym) ist zulässig und wird nur mit diesem Namen dargestellt.
- Das System muss den Autor in genau einer Zeile darstellen.
- Das System muss den Autor in einer kleineren Schriftgröße als den Buchtitel unter der Buchdarstellung darstellen.
- Das System muss den Autor in Farbrubrik „Tertiär“ darstellen.
- Die bisherige Darstellung des Buchtitels (höchstens zwei Zeilen, REQ-018) bleibt unverändert.

**Annahmen (nicht blockierend, vom CEO im Prototyp zu prüfen)**
- Passt der Name nicht in eine Zeile, schneidet das System ihn am Zeilenende ab und macht das mit „…“ kenntlich (analog zum Buchtitel, REQ-018).
- Hat ein Buch keinen Autor, entfällt die Autorzeile; die Statuspille folgt direkt auf den Titel.
- Der Autorname wird als ein Text in Lesereihenfolge („Vorname Nachname“ bzw. ein einzelner Name) gespeichert und unverändert angezeigt.

## Randbedingungen

- **Demodaten (kein App-Feature):** Der Tester trägt bei allen Demobüchern den echten Autor des jeweiligen Buches ein (Vorname Nachname bzw. einzelner Name). Kein Akzeptanzkriterium.

## Akzeptanzkriterien

### AK-1 Autor unter dem Titel
- **Gegeben** ein Buch mit Buchtitel und Autor „Vorname Nachname“
- **Wenn** die Buchdetails angezeigt werden
- **Dann** steht direkt unter dem Buchtitel der Autor als „Vorname Nachname“
- **Und** darunter folgt die Statuspille

### AK-2 Einzelner Name
- **Gegeben** ein Buch, dessen Autor nur aus einem Namen besteht
- **Wenn** die Buchdetails angezeigt werden
- **Dann** steht unter dem Buchtitel genau dieser Name

### AK-3 Eine Zeile
- **Gegeben** ein Buch mit einem Autornamen, der breiter ist als eine Zeile
- **Wenn** die Buchdetails angezeigt werden
- **Dann** ist der Autor auf eine Zeile begrenzt und am Ende mit „…“ abgeschnitten
- **Und** der Buchtitel ist weiterhin auf höchstens zwei Zeilen begrenzt

### AK-4 Kleinere Schrift als der Titel
- **Gegeben** die Buchdetails eines Buches mit Autor werden angezeigt
- **Wenn** die Schriftgrößen verglichen werden
- **Dann** ist die Schrift des Autors kleiner als die des Buchtitels

### AK-5 Farbe Tertiär aus zentraler Farbrubrik
- **Gegeben** die Buchdetails eines Buches mit Autor werden angezeigt
- **Wenn** die Farbe des Autors geprüft wird
- **Dann** ist er in Farbrubrik „Tertiär“ dargestellt
- **Und** nach Änderung des Werts von „Tertiär“ an der zentralen Stelle im geänderten Wert

### AK-6 Buch ohne Autor
- **Gegeben** ein Buch ohne Autor
- **Wenn** die Buchdetails angezeigt werden
- **Dann** gibt es unter dem Buchtitel keine Autorzeile und keinen Platzhaltertext
- **Und** die Statuspille folgt direkt auf den Buchtitel

## Abgrenzung (nicht Teil dieses REQ)

- Mehrere Autoren je Buch (CEO: „Nur ein Autor“).
- Eingeben oder Bearbeiten des Autors durch den Nutzer.
- Anzeige des Autors in Buchlisten (Bucheintrag, REQ-009).

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-008:** optionales Feld Autor. **REQ-018:** Buchtitel. **REQ-021:** Statuspille. **REQ-002:** Farbrubrik Tertiär. **ADR-0002.**

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-10 | Erstellt aus CEO-Vorgabe und Antworten („Tertiär klingt gut.“, „Nur ein Autor, auch nur ein Name wie bei Alchemised ist in Ordnung.“). Annahmen: Abschneiden mit „…“, keine Zeile ohne Autor. Priorität Must. Status „Abgestimmt“ (CEO 2026-11-10) | Anforderungsmanager |
