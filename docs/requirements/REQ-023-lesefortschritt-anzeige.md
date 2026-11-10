---
id: REQ-023
titel: Buchdetails – Lesefortschrittsbalken bzw. Herz unter der Statuspille
status: Abgestimmt
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **unter der Statuspille meinen Lesefortschritt sehen**, damit **ich weiß, wie weit ich im Buch bin, und ihn von dort aus aktualisieren kann**.

Vorgabe des CEO (wörtlich, Auszug, 2026-11-10): „Unter der Pille ist ein Lesefortschrittsbalken. Dieser ist nicht zu sehen, wenn für das Buch keine Seitenanzahl eingetragen ist. Stattdessen wird unser Platzhalter Herz klein eingefügt (Farbe: Primär). Ist eine Seitenanzahl vorhanden, erscheint der Fortschrittsbalken, darunter die Seitenanzahl z.B. 42 / 400. Die Prozentzahl und der kleine Punkt sollen NICHT umgesetzt werden! Bei einem Klick auf den Fortschrittsbalken, die Seitenanzahl von bis oder dem Platzhalter erscheint von unten ein kleines Menü“

Antworten des CEO (2026-11-10):
- Bestätigter Vorschlag: Anzeige unter dem Balken im Fortschrittsmodus „Seite“ „42 / 400“, im Fortschrittsmodus „%“ „5 %“. Der Balken erscheint, sobald eine Seitenanzahl ODER ein Prozentwert vorhanden ist; das Herz nur, wenn beides fehlt.
- Farben (wörtlich, Auszug): Fortschrittsbalken leer GhostFrame, Füllung Primär, Füllanteil = aktuelle Seite / Seitenanzahl (bzw. Prozentwert) – „50 von 200 → 25 % der Gesamtlänge“; Text „42 / 400“ Dunkelbraun.

Die frühere Vorgabe „Die Prozentzahl … NICHT umsetzen“ bezieht sich auf die Prozentangabe des Referenzbilds neben dem Balken im Modus „Seite“; die Anzeige „5 %“ im Modus „%“ hat der CEO ausdrücklich bestätigt.

Referenzbild: [referenzen/REF-buchdetails-01.png](referenzen/REF-buchdetails-01.png).

## Anforderung (Satzschablone)

- Wenn für das Buch weder eine Seitenanzahl noch ein Prozentwert gespeichert ist, muss das System unter der Statuspille (REQ-021) statt des Lesefortschrittsbalkens ein kleines Herz-Icon in Farbrubrik „Primär“ darstellen.
- Wenn für das Buch eine Seitenanzahl oder ein Prozentwert gespeichert ist, muss das System unter der Statuspille einen Lesefortschrittsbalken darstellen.
- Das System muss den Balken im Fortschrittsmodus „Seite“ (REQ-024) im Anteil „aktuelle Seite / Seitenanzahl“ und im Fortschrittsmodus „%“ im Anteil „Prozentwert / 100“ seiner Gesamtlänge füllen.
- Das System muss den ungefüllten Teil des Balkens in Farbrubrik „GhostFrame“ und die Füllung in Farbrubrik „Primär“ darstellen.
- Das System muss unter dem Balken im Fortschrittsmodus „Seite“ die Angabe „<aktuelle Seite> / <Seitenanzahl>“ (Beispiel „42 / 400“) und im Fortschrittsmodus „%“ die Angabe „<Prozentwert> %“ (Beispiel „5 %“) in Farbrubrik „Dunkelbraun“ darstellen.
- Das System darf im Fortschrittsmodus „Seite“ keine Prozentangabe und in keinem Modus den Punkt am Balkenanfang aus dem Referenzbild darstellen.
- Wenn der Nutzer den Lesefortschrittsbalken, die Angabe darunter oder das Herz-Icon antippt, muss das System das Menü „Aktuelle Seite“ (REQ-024) öffnen.

## Akzeptanzkriterien

### AK-1 Ohne Seitenanzahl und Prozentwert: Herz statt Balken
- **Gegeben** ein Buch ohne Seitenanzahl und ohne Prozentwert
- **Wenn** die Buchdetails angezeigt werden
- **Dann** steht unter der Statuspille ein kleines Herz-Icon in Farbrubrik „Primär“
- **Und** es gibt keinen Lesefortschrittsbalken und keine Fortschrittsangabe

### AK-2 Modus „Seite“: Balken und Seitenangabe
- **Gegeben** ein Buch im Fortschrittsmodus „Seite“ mit Seitenanzahl 400 und aktueller Seite 42
- **Wenn** die Buchdetails angezeigt werden
- **Dann** steht unter der Statuspille der Lesefortschrittsbalken
- **Und** darunter „42 / 400“
- **Und** das Herz-Icon erscheint dort nicht

### AK-3 Füllung im Modus „Seite“
- **Gegeben** ein Buch im Fortschrittsmodus „Seite“ mit Seitenanzahl 200 und aktueller Seite 50
- **Wenn** der Lesefortschrittsbalken betrachtet wird
- **Dann** ist er zu 25 % seiner Gesamtlänge gefüllt

### AK-4 Modus „%“: Balken und Prozentangabe ohne Seitenanzahl
- **Gegeben** ein Buch ohne Seitenanzahl im Fortschrittsmodus „%“ mit Prozentwert 5
- **Wenn** die Buchdetails angezeigt werden
- **Dann** steht unter der Statuspille der Lesefortschrittsbalken, zu 5 % seiner Gesamtlänge gefüllt
- **Und** darunter „5 %“
- **Und** das Herz-Icon erscheint dort nicht

### AK-5 Keine Prozentzahl im Modus „Seite“, kein Punkt
- **Gegeben** ein Buch im Fortschrittsmodus „Seite“ mit Seitenanzahl
- **Wenn** der Bereich des Lesefortschrittsbalkens betrachtet wird
- **Dann** gibt es dort keine Prozentangabe und keinen Punkt am Balken

### AK-6 Farben
- **Gegeben** der Lesefortschrittsbalken wird angezeigt
- **Wenn** die Farben geprüft werden
- **Dann** ist der ungefüllte Teil in „GhostFrame“, die Füllung in „Primär“ und die Angabe darunter in „Dunkelbraun“

### AK-7 Antippen öffnet „Aktuelle Seite“
- **Gegeben** die Buchdetails werden angezeigt
- **Wenn** der Nutzer den Balken, die Angabe darunter oder (ohne Seitenanzahl und Prozentwert) das Herz-Icon antippt
- **Dann** öffnet sich das Menü „Aktuelle Seite“

## Abgrenzung (nicht Teil dieses REQ)

- Inhalt und Verhalten des Menüs „Aktuelle Seite“ (REQ-024), Abfrage der Seitenanzahl (REQ-025).
- Eine Seitenanzahl entsteht derzeit nur zusammen mit einer gesicherten aktuellen Seite (REQ-025); ein Buch mit Seitenanzahl, aber ohne aktuelle Seite kommt daher nicht vor. Spätere Erweiterungen (Seitenanzahl in den Buchdetails ändern) klären das gesondert.

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-021, REQ-024, REQ-025.** **REQ-010:** Herz-Icon. **REQ-008:** Buchdaten (neue Angaben Seitenanzahl, aktuelle Seite, Prozentwert, Fortschrittsmodus).

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-10 | Erstellt (Entwurf aus CEO-Beschreibung, Erweiterung 2) | Anforderungsmanager |
| 2026-11-10 | CEO-Antworten eingearbeitet: F3/F4 Fortschrittsmodus „%“ (Balken auch ohne Seitenanzahl, Anzeige „5 %“, neu AK-4), Herz nur ohne Seitenanzahl und Prozentwert (AK-1); F8 Farben (neu AK-6); AK-3 auf CEO-Beispiel 50/200 geändert. Priorität Must. Status „Abgestimmt“ (CEO 2026-11-10) | Anforderungsmanager |
