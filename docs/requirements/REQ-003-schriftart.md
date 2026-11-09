---
id: REQ-003
titel: Zentral definierte App-Schrift
status: Implementiert
prioritaet: Could
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **CEO** möchte ich, **dass alle Texte der App eine einzige, zentral definierte App-Schrift verwenden**, damit **ich die endgültige Schrift später an einer Stelle festlegen kann, ohne einzelne Elemente der App anpassen zu müssen**.

**Priorität:** Could (MoSCoW, CEO-Entscheidung 2026-11-09).

Vorgabe des CEO (wörtlich): „Dann lassen wir das mit der Schriftart. Wir nutzen eine eigene, noch nicht fest definierte. Verwende selbstständig eine Ersatzschrift. Wir kümmern uns darum später.“

## Anforderung (Satzschablone)

- Das System muss alle Texte der App in der App-Schrift darstellen.
- Das System muss die App-Schrift an genau einer zentralen Stelle festlegen, sodass sie dort austauschbar ist, ohne dass einzelne Elemente der App angepasst werden müssen.
- Das System muss die Festlegung der App-Schrift mit einer generischen Ersatzschrift abschließen, sodass Texte auch dann lesbar dargestellt werden, wenn keine der vorher genannten Schriften verfügbar ist.

**Randbedingungen**
- Die endgültige App-Schrift legt der CEO später fest. Bis dahin verwendet die App eine vom Team gewählte Ersatzschrift.
- Entscheidung des Scrum Masters auf Anweisung des CEO („Verwende selbstständig eine Ersatzschrift“): Bis zur Festlegung durch den CEO wird die Systemschrift des Geräts verwendet (Schriftfolge `system-ui`, `Roboto`, `sans-serif`). Es wird keine Schriftdatei mit der App ausgeliefert. Der konkrete Schriftname ist kein Akzeptanzkriterium und kann ohne neuen REQ an der zentralen Stelle ausgetauscht werden.

## Akzeptanzkriterien

### AK-1 Alle Texte in der App-Schrift
- **Gegeben** die App ist geöffnet
- **Wenn** der Nutzer die angezeigten Texte betrachtet (aktuell: die Beschriftungen der fünf Menüpunkte der Hauptnavigation und der Platzhaltertext „under construction :)“ im Inhaltsbereich)
- **Dann** sind alle diese Texte in der zentral definierten App-Schrift dargestellt

### AK-2 App-Schrift an genau einer Stelle definiert
- **Gegeben** die Schriftfestlegungen der App
- **Wenn** geprüft wird, wo die Schrift für Texte der App festgelegt wird
- **Dann** ist die App-Schrift an genau einer zentralen Stelle definiert
- **Und** kein Element der App legt eine eigene, davon abweichende Schrift fest

### AK-3 Generische Ersatzschrift am Ende der Definition
- **Gegeben** die zentrale Definition der App-Schrift
- **Wenn** die darin genannte Schriftfolge betrachtet wird
- **Dann** endet sie mit einer generischen Ersatzschrift (z. B. `sans-serif`)

## Abgrenzung (nicht Teil dieses REQ)

- Auswahl der endgültigen App-Schrift. Diese legt der CEO später fest.
- Ausliefern einer eigenen Schriftdatei mit der App.
- Schriftgrößen, Schriftgewichte und typografische Hierarchien (z. B. Überschriften). Dazu hat der CEO keine Vorgaben gemacht.
- Eine Möglichkeit für den Nutzer, die Schrift in der App zu ändern (Einstellungen, Themes, vgl. REQ-001).

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-002 (Hauptnavigation, In Umsetzung):** Die Beschriftungen der Menüpunkte und der Platzhaltertext „under construction :)“ sind aktuell die einzigen Texte der App und werden in der App-Schrift dargestellt. Das Verhalten von REQ-002 (Inhalte, Farben, Anordnung) bleibt unverändert.
- **REQ-001 (Themes, Entwurf):** Ob ein Theme später auch die Schrift umfasst, ist dort zu klären. Die zentrale Festlegung der App-Schrift ist dafür die Grundlage.
- **Hinweis für später (blockiert nicht):** Die endgültige App-Schrift legt der CEO noch fest. Sobald sie feststeht, wird sie an der zentralen Stelle eingetragen. Falls dafür eine Schriftdatei mit der App ausgeliefert werden soll, ist das eine Änderung der Randbedingungen und wird mit dem CEO abgestimmt.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-09 | Erstellt aus der Vorgabe des CEO. Status „Abgestimmt“, da der CEO die Umsetzung ausdrücklich angeordnet hat (Abstimmungsnachweis, wörtlich: „Implementiere als Schriftart bitte diese aus der zip“). Lizenzhinweis „Demo – PERSONAL USE ONLY“ als Randbedingung aufgenommen; Versionierung der Datei bis zur Entscheidung des CEO ausgesetzt | Anforderungsmanager |
| 2026-11-09 | Umgeschrieben auf CEO-Anweisung (wörtlich: „Dann lassen wir das mit der Schriftart. Wir nutzen eine eigene, noch nicht fest definierte. Verwende selbstständig eine Ersatzschrift. Wir kümmern uns darum später.“). Die Schrift „Simple Handmade“ samt Schriftdatei und Lizenzfrage entfällt. Neu: zentral definierte, austauschbare App-Schrift; Ersatzschrift bis zur Festlegung durch den CEO ist die Systemschrift (Entscheidung Scrum Master auf Anweisung des CEO). AK-2 (Schrift aus Datei des CEO) und AK-3 (Ersatzschrift bei fehlender Datei) ersetzt durch AK-2 (genau eine Stelle) und AK-3 (generische Ersatzschrift am Ende). Priorität Must, Bestätigung durch den CEO ausstehend. Status bleibt „In Umsetzung“ | Anforderungsmanager |
| 2026-11-09 | Priorität vom CEO festgelegt: 4 auf der CEO-Skala (1 = höchste), „nice to have“ (CEO, wörtlich: „Req-003 ist ein 'nice to have' – also eher Prio 4 (1 ist das höchste)“). Frontmatter `prioritaet: 4`, Vermerk „Bestätigung ausstehend“ entfernt. Anforderungstext und AKs unverändert. Status unverändert „In Umsetzung“ | Anforderungsmanager |
| 2026-11-09 | Priorität auf MoSCoW umgestellt: Could (CEO, wörtlich: „wir nehmen deine Skala und halten uns an IREB. Req-003 bekommt entsprechend bitte 'could'“). Frontmatter `prioritaet: Could`, Prioritätsvermerk im Abschnitt „Ziel / Nutzen“ angepasst. Anforderungstext und AKs unverändert. Status unverändert „In Umsetzung“ | Anforderungsmanager |
