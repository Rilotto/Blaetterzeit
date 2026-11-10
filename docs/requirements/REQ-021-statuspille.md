---
id: REQ-021
titel: Buchdetails – Statuspille unter dem Buchtitel
status: Entwurf
prioritaet: offen
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **in den Buchdetails unter dem Titel den Lesestatus des Buches in einer Pille sehen**, damit **ich den Status auf einen Blick erkenne und von dort aus ändern kann (REQ-022)**.

Vorgabe des CEO (wörtlich, Auszug, 2026-11-10): „Halte dich auch hier bitte wieder an das Referenzbild. Unter dem Titel soll es in Pillenform die Statusauswahl geben. […] Der Standardstatus ist immer "Noch zu lesen". […] Hintergrundfarbe: Primär, Schriftfarbe: Hintergrundfarbe, Schrift zentriert in der Pille. Platzhalter (gerne wieder das Herz) pro Status auf der linken Seite, auch im Menü. Hier sollen später eigene Icons pro Status hinkommen. Übernehme wie aus dem Screenshot die kleinen Auf- und Ab-Pfeile in der Pille.“

Referenzbild: [referenzen/REF-buchdetails-01.png](referenzen/REF-buchdetails-01.png). Optische Übereinstimmung prüft der CEO im Prototyp; kein Akzeptanzkriterium.

## Anforderung (Satzschablone)

- Das System muss in den Buchdetails unterhalb des Buchtitels (REQ-018) eine Pille (Statuspille) darstellen, die den Lesestatus des angezeigten Buches nennt.
- Das System muss die Statuspille mit Hintergrund in Farbrubrik „Primär“ und Schrift in Farbrubrik „Hintergrund“ darstellen; die Schrift steht zentriert in der Pille.
- Das System muss in der Statuspille links ein Icon für den angezeigten Status darstellen; bis eigene Icons vorliegen, ist es für jeden Status das Herz-Icon.
- Das System muss die Zuordnung „Status → Icon“ zentral führen, sodass später je Status ein eigenes Icon hinterlegt werden kann, ohne die Statuspille zu ändern.
- Das System muss in der Statuspille die kleinen Auf- und Ab-Pfeile wie im Referenzbild darstellen.
- Das System muss bei einem Buch ohne abweichende Auswahl den Standardstatus anzeigen (CEO: „immer "Noch zu lesen"“; Zuordnung zu den Lesestatus aus REQ-008 offen, siehe Offene Fragen).

## Akzeptanzkriterien

### AK-1 Statuspille unter dem Titel
- **Gegeben** die Buchdetails eines Buches werden angezeigt
- **Wenn** der Bereich unter dem Buchtitel betrachtet wird
- **Dann** steht dort die Statuspille mit dem Lesestatus dieses Buches

### AK-2 Farben der Statuspille
- **Gegeben** die Statuspille wird angezeigt
- **Wenn** ihre Farben geprüft werden
- **Dann** ist der Hintergrund in Farbrubrik „Primär“ und die Schrift in Farbrubrik „Hintergrund“
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

### AK-7 Standardstatus
- **Gegeben** ein Buch, für das kein anderer Status gewählt wurde
- **Wenn** die Statuspille angezeigt wird
- **Dann** zeigt sie den Standardstatus (genaue Bezeichnung offen, siehe Offene Fragen)

## Abgrenzung (nicht Teil dieses REQ)

- Öffnen des Statusmenüs und Ändern des Status (REQ-022).
- Eigene Icons je Status (später).

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-008:** Lesestatus und zentrale Definition. **REQ-018:** Buchtitel. **REQ-010:** Herz-Icon. **REQ-022:** Statusmenü.

## Offene Fragen

- F1: Welche Bezeichnungen zeigt die Pille, und welcher Lesestatus ist mit „Noch zu lesen“ gemeint?
- F2: Gilt der Standardstatus nur für neue Bücher oder bei jedem Öffnen?
- F8: Farbe von Herz-Icon und Pfeilen in der Pille.
- Priorität.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-10 | Erstellt (Entwurf aus CEO-Beschreibung „Unter dem Titel geht es weiter“, Erweiterung 1) | Anforderungsmanager |
