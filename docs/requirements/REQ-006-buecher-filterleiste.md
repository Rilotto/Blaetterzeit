---
id: REQ-006
titel: Seite „Bücher“ – horizontal wischbare Filterleiste
status: In Umsetzung
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **auf der Seite „Bücher“ direkt unter der Überschrift eine horizontal wischbare Leiste mit Filtern**, damit **ich später mit einem Filter festlegen kann, welche Bücher mir angezeigt werden**.

Vorgabe des CEO (wörtlich, Auszug): „Direkt unterhalb der Überschrift befindet sich eine horizontal scrollbare Filterleiste. Im Referenzbild sind beispielsweise folgende Filter zu sehen: Für dich, Gerade am Lesen, Noch zu lesen.“ und „Die horizontale Filterleiste ist unabhängig von der darunterliegenden horizontalen Buchliste scrollbar.“

Referenzbild: [referenzen/REQ-002-referenz-hauptnavigation.png](referenzen/REQ-002-referenz-hauptnavigation.png), relevant ist nur die Filterleiste unter der Überschrift („grobe Orientierung“).

Welche Filter es gibt, wie sie heißen, in welcher Reihenfolge sie stehen und welche Filterlogik sie haben, kommt aus der Filterkonfiguration (REQ-007). Dieser REQ beschreibt Darstellung und Bedienung der Leiste.

## Anforderung (Satzschablone)

**Aufbau und Inhalt**
- Das System muss auf der Seite „Bücher“ direkt unterhalb der Überschrift „Deine Bücher“ (REQ-005) eine Filterleiste darstellen.
- Das System muss in der Filterleiste genau die Filter der Filterkonfiguration (REQ-007) in der dort festgelegten Reihenfolge von links nach rechts darstellen.
- Das System muss jeden Filter mit seinem in der Filterkonfiguration festgelegten Namen beschriften.

**Wischen**
- Das System muss dem Nutzer die Möglichkeit bieten, die gesamte Filterleiste horizontal nach links und rechts zu wischen.
- Das System muss die Filterleiste unabhängig von anderen Bereichen der Seite scrollen. Das gilt auch gegenüber der vom CEO erwähnten darunterliegenden horizontalen Buchliste, sobald es sie gibt (CEO). Sie gehört nicht zum Grundgerüst; der Bereich unterhalb der Filterleiste bleibt vorerst leer (REQ-005).

**Form**
- Das System muss jeden Filter als längliche, vollständig abgerundete Kapsel (Pill) darstellen.
- Das System muss die Breite jedes Filters nach seinem Inhalt und den definierten Innenabständen bemessen.

**Aktiver Filter**
- Das System muss genau einen Filter als aktiven Filter darstellen.
- Wenn die Seite „Bücher“ aufgerufen wird, muss das System den Filter „Für dich“ als aktiven Filter darstellen. Das gilt bei jedem Aufruf, auch nach einem Seitenwechsel (CEO: „Standardmäßig auch bei einem Seitenwechsel, soll immer 'Für dich' aktiv sein.“).
- Wenn der Nutzer einen Filter antippt, muss das System ihn als aktiven Filter und den zuvor aktiven Filter als inaktiven Filter darstellen.
- Wenn der Nutzer einen Filter antippt, muss das System die dem Filter in der Filterkonfiguration zugeordnete Filterlogik auslösen (Anknüpfungspunkt für die spätere Filterlogik, REQ-007).
- Wenn der Nutzer einen Filter antippt, darf sich auf der Seite „Bücher“ außer der Darstellung der Filter (aktiv/inaktiv) nichts ändern (CEO: „aktuell soll […] erstmal nichts passieren, außer, dass ein Filter aktiv angezeigt wird.“). Ausnahmen: Der Filter „Alle“ öffnet die Übersicht „Alle Bücher“ (REQ-039), der Filter „Gerade am Lesen“ die Übersicht „Gerade am Lesen“ (REQ-042). In den Übersichten ändert das Antippen eines Filters die angezeigten Bücher (REQ-036).

**Farben**
- Das System muss alle Farben dieses REQ über Farbrollen aus zentral definierten Farbrubriken beziehen (REQ-002, „Farben“; CLAUDE.md, „Farben auf Zuruf“). Zuordnung:

| Farbrolle | Element | Farbrubrik | Aussage des CEO |
|---|---|---|---|
| Aktiver Filter – Hintergrund | Hintergrund des aktiven Filters | Tertiär | „Hintergrund wie nicht aktive Schrift in Navigation“ |
| Aktiver Filter – Schrift | Beschriftung des aktiven Filters | Hintergrund | „Schriftfarbe wie Seitenhintergrund“ |
| Inaktiver Filter – Hintergrund | Hintergrund inaktiver Filter | Ghost (neu) | „Hintergrund wie in Screenshot (wird zukünftig 'Ghost' genannt)“ |
| Inaktiver Filter – Rahmen | Rahmen inaktiver Filter | GhostFrame (neu) | „Rahmen wie in Screenshot (zukünftig 'GhostFrame')“ |
| Inaktiver Filter – Schrift | Beschriftung inaktiver Filter | Tertiär | „Merge bitte Schrift tertiär und tertiär“ (2026-11-09; ursprünglich eigene Farbrubrik „Schrift tertiär“) |

- Das System muss den aktiven Filter ohne Rahmen darstellen (CEO zu F11: aktiver Filter hat keinen Rahmen).
- Das System muss die zwei neuen Farbrubriken „Ghost“ und „GhostFrame“ zusätzlich zu den bestehenden Farbrubriken (REQ-002) zentral definieren. Die Namen stammen vom CEO. Die früher hier definierte Farbrubrik „Schrift tertiär“ entfällt; sie wurde am 2026-11-09 auf Wunsch des CEO mit der Farbrubrik „Tertiär“ (REQ-002) zusammengelegt.
- Aktuelle Standardwerte der neuen Farbrubriken (aus dem Referenzbild gemessen, CEO: „wie in Screenshot“; kein Akzeptanzkriterium):

| Farbrubrik | aktueller Standardwert |
|---|---|
| Ghost | `#ECE8DC` |
| GhostFrame | `#DFD9CB` |

- Konkrete Farbwerte sind kein Akzeptanzkriterium. Ändert der CEO den Wert einer Farbrubrik, ändern sich die zugehörigen Elemente mit.

**Orientierungswerte aus dem Referenzbild (kein Akzeptanzkriterium)**
Vom Scrum Master gemessen (Bildbreite 1080 px ≈ 412 dp). Nur zur Orientierung, Prüfung durch den CEO im Prototyp:

| Element | Orientierungswert |
|---|---|
| Höhe eines Filters | ≈ 30 dp |

## Akzeptanzkriterien

### AK-1 Filterleiste direkt unter der Überschrift
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** der Nutzer den oberen Bereich betrachtet
- **Dann** befindet sich direkt unterhalb der Überschrift „Deine Bücher“ die Filterleiste

### AK-2 Filter gemäß Filterkonfiguration
- **Gegeben** die aktuelle Filterkonfiguration (REQ-007) mit den Filtern „Alle“, „Für dich“, „Gerade am Lesen“, „Noch zu lesen“ in dieser Reihenfolge
- **Wenn** die Filterleiste angezeigt wird
- **Dann** enthält sie genau diese vier Filter, von links nach rechts in dieser Reihenfolge und mit genau diesen Beschriftungen

### AK-3 „Für dich“ ist beim ersten Aufruf aktiv
- **Gegeben** die App wurde gerade geöffnet
- **Wenn** der Nutzer die Seite „Bücher“ aufruft
- **Dann** ist der Filter „Für dich“ aktiv
- **Und** alle anderen Filter sind inaktiv

### AK-4 Genau ein aktiver Filter
- **Gegeben** die Filterleiste wird angezeigt
- **Wenn** die Zustände aller Filter betrachtet werden
- **Dann** ist genau ein Filter aktiv

### AK-5 Kapselform
- **Gegeben** die Filterleiste wird angezeigt
- **Wenn** ein beliebiger Filter betrachtet wird
- **Dann** ist er eine längliche Form, deren schmale Seiten vollständig abgerundet sind (Eckenradius mindestens halbe Höhe)

### AK-6 Breite nach Inhalt
- **Gegeben** zwei Filter mit unterschiedlich langen Beschriftungen
- **Wenn** ihre Breiten verglichen werden
- **Dann** ist der Filter mit der längeren Beschriftung breiter
- **Und** jede Beschriftung ist vollständig lesbar (nicht abgeschnitten)

### AK-7 Darstellung aktiver und inaktiver Filter
- **Gegeben** die Filterleiste wird angezeigt
- **Wenn** der aktive Filter und die inaktiven Filter betrachtet werden
- **Dann** ist der Hintergrund des aktiven Filters in der Farbrubrik „Tertiär“ und seine Beschriftung in der Farbrubrik „Hintergrund“ dargestellt
- **Und** der aktive Filter hat keinen Rahmen
- **Und** der Hintergrund jedes inaktiven Filters ist in der Farbrubrik „Ghost“, sein Rahmen in der Farbrubrik „GhostFrame“ und seine Beschriftung in der Farbrubrik „Tertiär“ dargestellt

### AK-8 Horizontal wischen
- **Gegeben** die Filter sind zusammen breiter als der sichtbare Bereich der Filterleiste
- **Wenn** der Nutzer die Filterleiste nach links wischt
- **Dann** werden weiter rechts liegende Filter sichtbar
- **Und** wenn er danach nach rechts wischt, werden weiter links liegende Filter wieder sichtbar

### AK-9 Unabhängiges Scrollen
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** der Nutzer die Filterleiste horizontal wischt
- **Dann** verschiebt sich nur der Inhalt der Filterleiste
- **Und** die Überschrift, die Schaltflächen (REQ-005) und die übrigen Bereiche der Seite bleiben an ihrer Position

### AK-10 Antippen eines Filters
- **Gegeben** „Für dich“ ist aktiv
- **Wenn** der Nutzer den Filter „Gerade am Lesen“ antippt
- **Dann** ist „Gerade am Lesen“ aktiv dargestellt und „Für dich“ inaktiv
- **Und** die „Gerade am Lesen“ in der Filterkonfiguration zugeordnete Filterlogik wurde ausgelöst (öffnet die Übersicht „Gerade am Lesen“, REQ-042; „Alle“: REQ-039)

### AK-11 „Für dich“ ist nach einem Seitenwechsel wieder aktiv
- **Gegeben** auf der Seite „Bücher“ ist ein anderer Filter als „Für dich“ aktiv
- **Wenn** der Nutzer zu einem anderen Menüpunkt wechselt und danach wieder den Menüpunkt „Bücher“ antippt
- **Dann** ist der Filter „Für dich“ aktiv
- **Und** alle anderen Filter sind inaktiv

### AK-12 Neue Farbrubriken zentral definiert und wirksam
- **Gegeben** der Wert einer der Farbrubriken „Ghost“, „GhostFrame“, „Tertiär“ oder „Hintergrund“ wird an der zentralen Stelle geändert
- **Wenn** die Filterleiste angezeigt wird
- **Dann** sind alle Elemente dieses REQ, deren Farbrolle aus dieser Farbrubrik stammt (Tabelle im Abschnitt „Farben“), im geänderten Wert dargestellt
- **Und** keines dieser Elemente hat einen eigenen, davon abweichenden Farbwert
## Abgrenzung (nicht Teil dieses REQ)

- Welche Bücher ein Filter auswählt und welchen Teil der Seite er beeinflusst (CEO: wird pro Filter separat ausgearbeitet).
- Inhalte unterhalb der Filterleiste, einschließlich der horizontalen Buchliste (der Bereich bleibt vorerst leer, REQ-005).
- Aufbau und Pflege der Filterkonfiguration (REQ-007).
- Die Zahl, die im Referenzbild hinter einem Filter steht (CEO: „Die Zahl hinter dem Filter soll ignoriert werden.“).
- Konkrete Farbwerte und Maße als Akzeptanzkriterium.

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-005 (Kopfbereich Seite „Bücher“):** Überschrift, unter der die Leiste steht. Antippen der Schaltflächen dort ändert die Filterleiste nicht.
- **REQ-007 (Filterkonfiguration):** Quelle für Filter, Namen, Reihenfolge und Filterlogik.
- **REQ-002 (Implementiert):** bestehende Farbrubriken, Seitenhintergrund (unverändert). Die neuen Farbrubriken ergänzen die bestehenden, ohne sie zu ändern.
- **REQ-003 (Implementiert):** Beschriftungen in der App-Schrift.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. Nummern entsprechen der Fragenliste an den CEO vom 2026-11-09. -->

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-09 | Erstellt (Entwurf aus der Vorgabe des CEO zur Filterleiste der Seite „Bücher“, Punkte 4 bis 9 und Antworten zu Standardfilter). Orientierungswerte des Scrum Masters als Nicht-AK aufgenommen | Anforderungsmanager |
| 2026-11-09 | Antworten des CEO eingearbeitet. F1: Priorität „Must“ bestätigt, Vorläufigkeitsvermerk entfernt. F3: Farbzuordnungen eingetragen (aktiver Filter Tertiär / Schrift Hintergrund; inaktive Filter in den neuen Farbrubriken „Ghost“, „GhostFrame“, „Schrift tertiär“ mit Standardwerten aus dem Referenzbild). Die frühere Beschreibung „dunkelbraun mit heller Beschriftung“ bzw. „hellem, beigefarbenem Hintergrund, dezentem Rahmen, dunklerer Schrift“ und die gemessenen Werte des aktiven Filters entfallen zugunsten der Farbrubriken; Rahmenwert neu gemessen (`#DFD9CB`). AK-7 präzisiert, neu AK-12. F6: Aktivierung durch Antippen; außer der Darstellung passiert nichts, die Filterlogik bleibt als Anknüpfungspunkt (AK-10 präzisiert); „Für dich“ ist bei jedem Aufruf der Seite aktiv, auch nach Seitenwechsel (neu AK-11). F5 nach REQ-005 verschoben und dort als F10 neu formuliert; F5 blockiert diesen REQ nicht mehr. Zahl hinter Filtern in die Abgrenzung (CEO-Antwort 7). Neue offene Frage F11 (Rahmen des aktiven Filters) | Anforderungsmanager |
| 2026-11-09 | Antworten des CEO eingearbeitet. F11: Aktiver Filter hat keinen Rahmen (Anforderung im Abschnitt „Farben“, AK-7 ergänzt). F10 (REQ-005): Bereich unterhalb der Filterleiste bleibt leer, Verweise in „Wischen“ und Abgrenzung angepasst. Vom CEO am 2026-11-09 bestätigt, Status „Abgestimmt“ | Anforderungsmanager |
| 2026-11-09 | CEO: „Merge bitte Schrift tertiär und tertiär“. Farbrubrik „Schrift tertiär“ (Standardwert `#685849`) entfällt und wird mit „Tertiär“ (Standardwert `#6B5849`, REQ-002) zusammengelegt. Beschriftung inaktiver Filter jetzt in Farbrubrik „Tertiär“ (Farbtabelle, Definition neuer Farbrubriken, Standardwerte, AK-7, AK-12 angepasst). Reine Farbzuordnung, Status bleibt „Implementiert“; Code und Akzeptanztest sind anzupassen | Anforderungsmanager |
| 2026-11-12 | CEO-Antworten zu REQ-039/REQ-036 („an erster Stelle vor "Für Dich"“, „die Ansicht ändert sich entsprechend. Dies sind ja Filterpillen“): AK-2 auf vier Filter mit „Alle“ an erster Stelle; Ausnahme „Alle“ öffnet die Übersicht (Anforderung, AK-10). „Für dich“ bleibt Standard auf der Seite „Bücher“. REQ nicht eingefroren; Statuswechsel durch den Scrum Master | Anforderungsmanager |
| 2026-11-12 | CEO-Antwort Runde 3: „Gerade am Lesen“ öffnet eine Übersicht (REQ-042); AK-10 entsprechend angepasst | Anforderungsmanager |
