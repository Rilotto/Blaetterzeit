---
id: REQ-021
titel: Buchdetails – Statuspille unter dem Buchtitel
status: Abgestimmt
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **in den Buchdetails unter dem Titel den Lesestatus des Buches in einer Pille sehen**, damit **ich den Status auf einen Blick erkenne und von dort aus ändern kann (REQ-022)**.

Vorgabe des CEO (wörtlich, Auszug, 2026-11-10): „Halte dich auch hier bitte wieder an das Referenzbild. Unter dem Titel soll es in Pillenform die Statusauswahl geben. […] Hintergrundfarbe: Primär, Schriftfarbe: Hintergrundfarbe, Schrift zentriert in der Pille. Platzhalter (gerne wieder das Herz) pro Status auf der linken Seite, auch im Menü. Hier sollen später eigene Icons pro Status hinkommen. Übernehme wie aus dem Screenshot die kleinen Auf- und Ab-Pfeile in der Pille.“

Antworten des CEO (wörtlich, 2026-11-10):
- „Die Statusnamen passen, nimm statt 'Noch zu lesen' den Status 'ungelesen' auch als Standardeinstellung im Status. Reihenfolge: ungelesen, am lesen, gelesen, abgebrochen, Wunschliste.“
- „Ja, der Status bleibt immer gespeichert, ja er wirkt sich immer direkt auf die Listen aus, der Standardstatus 'ungelesen' gilt für alle Bücher, deren Status nicht manuell selbst geändert wurde.“
- Farben: Pfeile in der Pille in Farbrubrik „Hintergrund“.

Referenzbild: [referenzen/REF-buchdetails-01.png](referenzen/REF-buchdetails-01.png). Die optische Übereinstimmung prüft der CEO im Prototyp; sie ist kein Akzeptanzkriterium.

## Anforderung (Satzschablone)

- Das System muss in den Buchdetails unterhalb des Buchtitels (REQ-018) eine Pille (Statuspille) darstellen, die den Lesestatus des angezeigten Buches mit seinem Namen aus der zentralen Definition (REQ-008) nennt.
- Das System muss die Statuspille mit Hintergrund in Farbrubrik „Primär“ und Schrift in Farbrubrik „Hintergrund“ darstellen; die Schrift steht zentriert in der Pille.
- Das System muss in der Statuspille links ein Icon für den angezeigten Status darstellen; bis eigene Icons vorliegen, ist es für jeden Status das Herz-Icon.
- Das System muss die Zuordnung „Status → Icon“ zentral führen, sodass später je Status ein eigenes Icon hinterlegt werden kann, ohne die Statuspille zu ändern.
- Das System muss in der Statuspille die kleinen Auf- und Ab-Pfeile wie im Referenzbild in Farbrubrik „Hintergrund“ darstellen.
- Das System muss für jedes Buch, dessen Lesestatus der Nutzer nicht selbst geändert hat, den Standardstatus *ungelesen* führen und anzeigen.

## Akzeptanzkriterien

### AK-1 Statuspille unter dem Titel mit Statusname
- **Gegeben** die Buchdetails eines Buches mit Lesestatus *am lesen* werden angezeigt
- **Wenn** der Bereich unter dem Buchtitel betrachtet wird
- **Dann** steht dort die Statuspille mit dem Text „am lesen“

### AK-2 Farben der Statuspille
- **Gegeben** die Statuspille wird angezeigt
- **Wenn** ihre Farben geprüft werden
- **Dann** ist der Hintergrund in Farbrubrik „Primär“, die Schrift in Farbrubrik „Hintergrund“ und die Auf-/Ab-Pfeile in Farbrubrik „Hintergrund“
- **Und** eine Änderung dieser Farbrubriken an der zentralen Stelle wirkt auf die Statuspille

### AK-3 Schrift zentriert
- **Gegeben** die Statuspille wird angezeigt
- **Wenn** die Lage der Schrift geprüft wird
- **Dann** ist sie in der Pille zentriert

### AK-4 Herz-Icon links als Platzhalter
- **Gegeben** ein Buch mit beliebigem Lesestatus
- **Wenn** die Statuspille angezeigt wird
- **Dann** steht links in der Pille das Herz-Icon

### AK-5 Icon je Status zentral austauschbar
- **Gegeben** in der zentralen Zuordnung wird für einen Status ein anderes Icon hinterlegt
- **Wenn** die Statuspille eines Buches mit diesem Status angezeigt wird
- **Dann** erscheint links das neu hinterlegte Icon

### AK-6 Auf- und Ab-Pfeile
- **Gegeben** die Statuspille wird angezeigt
- **Wenn** die Pille betrachtet wird
- **Dann** enthält sie die kleinen Auf- und Ab-Pfeile

### AK-7 Standardstatus „ungelesen“
- **Gegeben** ein Buch, dessen Lesestatus der Nutzer nicht selbst geändert hat
- **Wenn** die Statuspille angezeigt wird
- **Dann** zeigt sie „ungelesen“

## Abgrenzung (nicht Teil dieses REQ)

- Öffnen des Statusmenüs, Ändern und Speichern des Status, Wirkung auf Buchlisten (REQ-022).
- Eigene Icons je Status (später).
- Farbe des Herz-Icons in der Pille: nicht vom CEO festgelegt; das Icon wird über eine eigene Farbrolle eingefärbt, der Standardwert ist „Farbe auf Zuruf“ und kein Akzeptanzkriterium.

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-008:** Lesestatus und zentrale Definition. **REQ-018:** Buchtitel. **REQ-010:** Herz-Icon. **REQ-022:** Statusmenü.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-10 | Erstellt (Entwurf aus CEO-Beschreibung „Unter dem Titel geht es weiter“, Erweiterung 1) | Anforderungsmanager |
| 2026-11-10 | CEO-Antworten eingearbeitet: F1 Statusnamen aus REQ-008, Standardstatus *ungelesen* (AK-1, AK-7 konkretisiert); F2 Standardstatus gilt für alle nicht manuell geänderten Bücher; F8 Pfeile in Hintergrund (AK-2). Priorität Must. Status „Abgestimmt“ (CEO 2026-11-10) | Anforderungsmanager |
