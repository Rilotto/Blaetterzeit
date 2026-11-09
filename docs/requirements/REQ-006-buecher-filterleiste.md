---
id: REQ-006
titel: Seite „Bücher“ – horizontal wischbare Filterleiste
status: Entwurf
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

<!-- Priorität "Must": vorläufig, Bestätigung durch den CEO ausstehend (MoSCoW ist CEO-Entscheidung, siehe Offene Fragen). -->

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
- Das System muss die Filterleiste unabhängig von anderen Bereichen der Seite scrollen. Insbesondere muss sie unabhängig von einer darunterliegenden horizontalen Buchliste scrollbar sein (CEO).

**Form**
- Das System muss jeden Filter als längliche, vollständig abgerundete Kapsel (Pill) darstellen.
- Das System muss die Breite jedes Filters nach seinem Inhalt und den definierten Innenabständen bemessen.

**Aktiver Filter**
- Das System muss genau einen Filter als aktiven Filter darstellen (CEO: „Der aktive Filter …“).
- Wenn die Seite „Bücher“ nach dem Öffnen der App angezeigt wird, muss das System den Filter „Für dich“ als aktiven Filter darstellen (CEO: standardmäßig aktiv ist „Für dich“).
- Das System muss den aktiven Filter dunkelbraun mit heller Beschriftung darstellen.
- Das System muss inaktive Filter mit hellem, beigefarbenem Hintergrund, dezentem Rahmen und dunklerer Schrift darstellen.
- Wenn ein Filter aktiviert wird, muss das System ihn als aktiven Filter darstellen, den zuvor aktiven Filter als inaktiven Filter darstellen und die dem Filter in der Filterkonfiguration zugeordnete Filterlogik auslösen.
- Wie der Nutzer einen Filter aktiviert und was die Filterlogik im Grundgerüst sichtbar bewirkt, ist offen (siehe Offene Fragen).

**Farben**
- Das System muss alle Farben dieses REQ aus zentral definierten Farbrubriken beziehen (REQ-002, „Farben“; CLAUDE.md, „Farben auf Zuruf“). Welche Farbrubrik welche Farbrolle speist, ist offen (siehe Offene Fragen).

**Orientierungswerte aus dem Referenzbild (kein Akzeptanzkriterium)**
Vom Scrum Master gemessen (Bildbreite 1080 px ≈ 412 dp). Nur zur Orientierung, Prüfung durch den CEO im Prototyp:

| Element | Orientierungswert |
|---|---|
| Höhe eines Filters | ≈ 30 dp |
| Aktiver Filter | Hintergrund ≈ `#392F25` (dunkelbraun), Schrift ≈ `#F7EFE4` (hell) |
| Inaktiver Filter | Hintergrund ≈ `#ECE8DC` (helles Beige), Schrift ≈ `#685849`, Rahmen ≈ `#EEE8DA` (kaum sichtbar) |

## Akzeptanzkriterien

### AK-1 Filterleiste direkt unter der Überschrift
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** der Nutzer den oberen Bereich betrachtet
- **Dann** befindet sich direkt unterhalb der Überschrift „Deine Bücher“ die Filterleiste

### AK-2 Filter gemäß Filterkonfiguration
- **Gegeben** die aktuelle Filterkonfiguration (REQ-007) mit den Filtern „Für dich“, „Gerade am Lesen“, „Noch zu lesen“ in dieser Reihenfolge
- **Wenn** die Filterleiste angezeigt wird
- **Dann** enthält sie genau diese drei Filter, von links nach rechts in dieser Reihenfolge und mit genau diesen Beschriftungen

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

### AK-7 Darstellung aktiver und inaktiver Filter unterscheidbar
- **Gegeben** die Filterleiste wird angezeigt
- **Wenn** der aktive Filter mit einem inaktiven Filter verglichen wird
- **Dann** unterscheiden sich Hintergrundfarbe und Schriftfarbe
- **Und** inaktive Filter haben einen Rahmen
- **Und** alle Farben stammen aus zentral definierten Farbrubriken

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

### AK-10 Aktivieren eines Filters
- **Gegeben** „Für dich“ ist aktiv
- **Wenn** der Filter „Gerade am Lesen“ aktiviert wird
- **Dann** ist „Gerade am Lesen“ aktiv dargestellt und „Für dich“ inaktiv
- **Und** die „Gerade am Lesen“ in der Filterkonfiguration zugeordnete Filterlogik wurde ausgelöst

<!-- AK-10 wird nach Beantwortung von F6 präzisiert (Art der Aktivierung, sichtbare Wirkung). Farbrollen-AKs werden nach F3 ergänzt. -->

## Abgrenzung (nicht Teil dieses REQ)

- Welche Bücher ein Filter auswählt und welchen Teil der Seite er beeinflusst (CEO: wird pro Filter separat ausgearbeitet).
- Die horizontale Buchliste und alle übrigen Abschnitte unterhalb der Filterleiste.
- Aufbau und Pflege der Filterkonfiguration (REQ-007).
- Konkrete Farbwerte und Maße als Akzeptanzkriterium.

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-005 (Kopfbereich Seite „Bücher“):** Überschrift, unter der die Leiste steht.
- **REQ-007 (Filterkonfiguration):** Quelle für Filter, Namen, Reihenfolge und Filterlogik.
- **REQ-002 (Implementiert):** Farbrubriken, Seitenhintergrund (unverändert).
- **REQ-003 (Implementiert):** Beschriftungen in der App-Schrift.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. Nummern entsprechen der Fragenliste an den CEO vom 2026-11-09. -->

- F1: Priorität (MoSCoW) dieses REQ?
- F3: Aus welchen Farbrubriken sollen die Farben der Filter kommen, und soll es dafür neue Farbrubriken geben (wenn ja: wie heißen sie)? Betroffen hier: aktiver Filter (Hintergrund, Schrift); inaktiver Filter (Hintergrund, Rahmen, Schrift).
- F5: Was soll im Grundgerüst unterhalb der Filterleiste zu sehen sein?
- F6: Wie aktiviert der Nutzer einen Filter, was soll im Grundgerüst sichtbar passieren, wenn ein Filter aktiviert wird, und welcher Filter soll aktiv sein, wenn der Nutzer die Seite „Bücher“ verlässt und später wieder aufruft?

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-09 | Erstellt (Entwurf aus der Vorgabe des CEO zur Filterleiste der Seite „Bücher“, Punkte 4 bis 9 und Antworten zu Standardfilter). Orientierungswerte des Scrum Masters als Nicht-AK aufgenommen | Anforderungsmanager |
