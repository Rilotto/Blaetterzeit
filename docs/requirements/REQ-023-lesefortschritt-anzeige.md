---
id: REQ-023
titel: Buchdetails – Lesefortschrittsbalken bzw. Herz unter der Statuspille
status: In Umsetzung
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
- Bestätigter Vorschlag: Anzeige unter dem Balken im Fortschrittsmodus „Seite“ „42 / 400“, im Fortschrittsmodus „%“ „5 %“. ~~Der Balken erscheint, sobald eine Seitenanzahl ODER ein Prozentwert vorhanden ist; das Herz nur, wenn beides fehlt.~~ (aufgehoben 2026-11-10, CEO: „Ja, auch beim %-Modus muss ich die Seitenanzahl angeben.“ – maßgeblich ist wieder allein die Seitenanzahl, wie in der ursprünglichen Vorgabe)
- Farben (wörtlich, Auszug): Fortschrittsbalken leer GhostFrame, Füllung Primär, Füllanteil = aktuelle Seite / Seitenanzahl (bzw. Prozentwert) – „50 von 200 → 25 % der Gesamtlänge“; Text „42 / 400“ Dunkelbraun.

Die frühere Vorgabe „Die Prozentzahl … NICHT umsetzen“ bezieht sich auf die Prozentangabe des Referenzbilds neben dem Balken im Modus „Seite“; die Anzeige „5 %“ im Modus „%“ hat der CEO ausdrücklich bestätigt.

Referenzbild: [referenzen/REF-buchdetails-01.png](referenzen/REF-buchdetails-01.png).

## Anforderung (Satzschablone)

- Solange für das Buch keine Seitenanzahl gespeichert ist, muss das System unter der Statuspille (REQ-021) statt des Lesefortschrittsbalkens ein kleines Herz-Icon in Farbrubrik „Primär“ darstellen – unabhängig vom Fortschrittsmodus.
- Wenn für das Buch eine Seitenanzahl gespeichert ist, muss das System unter der Statuspille einen Lesefortschrittsbalken darstellen.
- Annahme (nicht blockierend, vom CEO im Prototyp zu prüfen): Ist eine Seitenanzahl, aber noch kein Fortschritt gespeichert (Menü „Buchlänge“ gesichert, „Aktuelle Seite“ ohne Sichern geschlossen), zeigt das System den leeren Balken mit „0 / <Seitenanzahl>“ (ohne gespeicherten Modus gilt „Seite“).
- Das System muss den Balken im Fortschrittsmodus „Seite“ (REQ-024) im Anteil „aktuelle Seite / Seitenanzahl“ und im Fortschrittsmodus „%“ im Anteil „Prozentwert / 100“ seiner Gesamtlänge füllen.
- Das System muss den ungefüllten Teil des Balkens in Farbrubrik „GhostFrame“ und die Füllung in Farbrubrik „Primär“ darstellen.
- Das System muss unter dem Balken im Fortschrittsmodus „Seite“ die Angabe „<aktuelle Seite> / <Seitenanzahl>“ (Beispiel „42 / 400“) und im Fortschrittsmodus „%“ die Angabe „<Prozentwert> %“ (Beispiel „5 %“) in Farbrubrik „Dunkelbraun“ darstellen.
- Das System darf im Fortschrittsmodus „Seite“ keine Prozentangabe und in keinem Modus den Punkt am Balkenanfang aus dem Referenzbild darstellen.
- Wenn der Nutzer den Lesefortschrittsbalken oder die Angabe darunter antippt, muss das System das Menü „Aktuelle Seite“ (REQ-024) öffnen.
- Wenn der Nutzer das Herz-Icon antippt, muss das System das Menü „Buchlänge“ (REQ-025) öffnen.

## Akzeptanzkriterien

### AK-1 Ohne Seitenanzahl: Herz statt Balken
- **Gegeben** ein Buch ohne Seitenanzahl (Fortschrittsmodus „Seite“ bzw. in einem zweiten Durchlauf „%“)
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

### AK-4 Modus „%“: Balken und Prozentangabe
- **Gegeben** ein Buch mit Seitenanzahl 400 im Fortschrittsmodus „%“ mit Prozentwert 5
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

### AK-7 Antippen öffnet „Aktuelle Seite“ bzw. „Buchlänge“
- **Gegeben** die Buchdetails eines Buches mit Seitenanzahl werden angezeigt
- **Wenn** der Nutzer den Balken bzw. (zweiter Durchlauf) die Angabe darunter antippt
- **Dann** öffnet sich das Menü „Aktuelle Seite“
- **Und** bei einem Buch ohne Seitenanzahl öffnet das Antippen des Herz-Icons das Menü „Buchlänge“

### AK-8 Seitenanzahl ohne Fortschritt (Annahme)
- **Gegeben** ein Buch mit Seitenanzahl 400 ohne gespeicherten Fortschritt und ohne gespeicherten Modus
- **Wenn** die Buchdetails angezeigt werden
- **Dann** steht dort der ungefüllte Lesefortschrittsbalken mit „0 / 400“
- **Und** das Herz-Icon erscheint dort nicht

## Abgrenzung (nicht Teil dieses REQ)

- Inhalt und Verhalten der Menüs „Aktuelle Seite“ (REQ-024) und „Buchlänge“ (REQ-025).

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
| 2026-11-10 | Seitenanzahl ist jetzt immer Voraussetzung (CEO: „Ja, auch beim %-Modus muss ich die Seitenanzahl angeben.“). Entfallen: „Balken bei Seitenanzahl ODER Prozentwert“. Herz, solange keine Seitenanzahl hinterlegt ist; Herz öffnet Menü „Buchlänge“ (REQ-025). Geändert: AK-1, AK-4 (mit Seitenanzahl 400), AK-7; neu AK-8 (Annahme „0 / 400“). Status „Abgestimmt“ (CEO 2026-11-10) | Anforderungsmanager |
