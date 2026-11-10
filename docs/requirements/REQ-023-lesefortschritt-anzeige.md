---
id: REQ-023
titel: Buchdetails – Lesefortschrittsbalken bzw. Herz unter der Statuspille
status: Entwurf
prioritaet: offen
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **unter der Statuspille meinen Lesefortschritt sehen**, damit **ich weiß, wie weit ich im Buch bin, und ihn von dort aus aktualisieren kann**.

Vorgabe des CEO (wörtlich, Auszug, 2026-11-10): „Unter der Pille ist ein Lesefortschrittsbalken. Dieser ist nicht zu sehen, wenn für das Buch keine Seitenanzahl eingetragen ist. Stattdessen wird unser Platzhalter Herz klein eingefügt (Farbe: Primär). Ist eine Seitenanzahl vorhanden, erscheint der Fortschrittsbalken, darunter die Seitenanzahl z.B. 42 / 400. Die Prozentzahl und der kleine Punkt sollen NICHT umgesetzt werden! Bei einem Klick auf den Fortschrittsbalken, die Seitenanzahl von bis oder dem Platzhalter erscheint von unten ein kleines Menü“

Referenzbild: [referenzen/REF-buchdetails-01.png](referenzen/REF-buchdetails-01.png).

## Anforderung (Satzschablone)

- Wenn für das Buch keine Seitenanzahl hinterlegt ist, muss das System unter der Statuspille (REQ-021) statt des Lesefortschrittsbalkens ein kleines Herz-Icon in Farbrubrik „Primär“ darstellen.
- Wenn für das Buch eine Seitenanzahl hinterlegt ist, muss das System unter der Statuspille einen Lesefortschrittsbalken darstellen, dessen Füllung dem Anteil der aktuellen Seite an der Seitenanzahl entspricht.
- Wenn für das Buch eine Seitenanzahl hinterlegt ist, muss das System unter dem Lesefortschrittsbalken die Angabe „<aktuelle Seite> / <Seitenanzahl>“ darstellen (Beispiel CEO: „42 / 400“).
- Das System darf an dieser Stelle weder eine Prozentangabe noch den Punkt am Balkenanfang aus dem Referenzbild darstellen.
- Wenn der Nutzer den Lesefortschrittsbalken, die Angabe „<aktuelle Seite> / <Seitenanzahl>“ oder das Herz-Icon antippt, muss das System das Menü „Aktuelle Seite“ (REQ-024) öffnen.

## Akzeptanzkriterien

### AK-1 Ohne Seitenanzahl: Herz statt Balken
- **Gegeben** ein Buch ohne hinterlegte Seitenanzahl
- **Wenn** die Buchdetails angezeigt werden
- **Dann** steht unter der Statuspille ein kleines Herz-Icon in Farbrubrik „Primär“
- **Und** es gibt keinen Lesefortschrittsbalken und keine Seitenangabe

### AK-2 Mit Seitenanzahl: Balken und Seitenangabe
- **Gegeben** ein Buch mit Seitenanzahl 400 und aktueller Seite 42
- **Wenn** die Buchdetails angezeigt werden
- **Dann** steht unter der Statuspille der Lesefortschrittsbalken
- **Und** darunter „42 / 400“
- **Und** das Herz-Icon erscheint dort nicht

### AK-3 Füllung entspricht dem Fortschritt
- **Gegeben** ein Buch mit Seitenanzahl 400 und aktueller Seite 100
- **Wenn** der Lesefortschrittsbalken betrachtet wird
- **Dann** ist er zu einem Viertel gefüllt

### AK-4 Keine Prozentzahl, kein Punkt
- **Gegeben** ein Buch mit Seitenanzahl
- **Wenn** der Bereich des Lesefortschrittsbalkens betrachtet wird
- **Dann** gibt es dort keine Prozentangabe und keinen Punkt am Balken

### AK-5 Antippen öffnet „Aktuelle Seite“
- **Gegeben** die Buchdetails werden angezeigt
- **Wenn** der Nutzer den Balken, die Seitenangabe oder (ohne Seitenanzahl) das Herz-Icon antippt
- **Dann** öffnet sich das Menü „Aktuelle Seite“

## Abgrenzung (nicht Teil dieses REQ)

- Inhalt und Verhalten des Menüs „Aktuelle Seite“ (REQ-024), Abfrage der Seitenanzahl (REQ-025).

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-021, REQ-024, REQ-025.** **REQ-010:** Herz-Icon. **REQ-008:** Buchdaten (neue Angaben Seitenanzahl, aktuelle Seite).

## Offene Fragen

- F3: Welche aktuelle Seite gilt, solange noch nichts gesichert wurde?
- F8: Farben von Balken (gefüllt/leer) und Seitenangabe.
- Priorität.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-10 | Erstellt (Entwurf aus CEO-Beschreibung, Erweiterung 2) | Anforderungsmanager |
