---
id: REQ-002
titel: Untere Hauptnavigation mit fünf Menüpunkten
status: Entwurf
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **am unteren Bildschirmrand eine dauerhaft sichtbare Hauptnavigation mit fünf Menüpunkten**, damit **ich jederzeit zwischen den Bereichen der App wechseln kann**.

Referenzbild des CEO: [referenzen/REQ-002-referenz-hauptnavigation.png](referenzen/REQ-002-referenz-hauptnavigation.png).
Laut CEO ist darauf **nur die untere Navigationsleiste** relevant. Das Bild dient nur dem Verständnis der Anforderung („Ich habe dir das Bild gegeben, damit du meine Anforderungen besser verstehen kannst.“). Maßgeblich ist ausschließlich die Beschreibung des CEO in diesem REQ. Einzige Ausnahme: Die aktuellen Standardfarbwerte orientieren sich auf Wunsch des CEO am Referenzbild („Orientiere dich erstmal gerne an dem Referenzbild.“), siehe Abschnitt „Farben“.

## Anforderung (Satzschablone)

**Aufbau**
- Das System muss am unteren Bildschirmrand eine Hauptnavigation dauerhaft sichtbar darstellen.
- Das System muss in der Hauptnavigation genau fünf Menüpunkte in dieser Reihenfolge (von links nach rechts) darstellen: 1. Start, 2. Bücher, 3. Bibliothek, 4. Statistik, 5. Profil.
- Das System muss die fünf Menüpunkte gleichmäßig auf die verfügbare Breite verteilen.
- Das System muss jeden Menüpunkt als Icon mit darunterliegender Beschriftung darstellen. Das Icon steht mittig über der Beschriftung.
- Das System muss die Hauptnavigation auch beim vertikalen Scrollen des Inhalts sichtbar lassen.
- Das System muss die Hauptnavigation so darstellen, dass sie den unteren sicheren Bildschirmbereich berücksichtigt (sie wird nicht von Systemelementen des Geräts verdeckt und verdeckt diese nicht).

**Icons**
- Das System muss für die Menüpunkte ausschließlich die vom CEO bereitgestellten Icon-Dateien verwenden. Es dürfen keine selbst ausgewählten Icons und keine Icons aus einer Icon-Bibliothek verwendet werden.
- Der CEO stellt je Menüpunkt genau eine Icon-Datei bereit. Es gibt keine getrennten Dateien für den aktiven und den inaktiven Zustand.
- Das System muss das Icon eines Menüpunkts selbst in der Farbe des jeweiligen Zustands (Aktivfarbe bzw. Inaktivfarbe) einfärben (CEO: „Du musst sie nur umfärben.“).
- Das System muss die Icons den Menüpunkten gemäß folgender Tabelle zuordnen:

| Menüpunkt | Icon-Datei (unter `docs/requirements/referenzen/icons/`) | Status der Zuordnung |
|---|---|---|
| Start | `icon-haus.png` | eindeutig |
| Bücher | `icon-offenes-buch.png` | **offen, Bestätigung CEO ausstehend (F1)** |
| Bibliothek | `icon-buecherregal.png` | **offen, Bestätigung CEO ausstehend (F1)** |
| Statistik | `icon-diagramm.png` | eindeutig |
| Profil | `icon-person.png` | eindeutig |

Eigenschaften der gelieferten Dateien: je 512 × 512 Pixel, PNG, schwarze Linien auf transparentem Hintergrund.

**Aktiver Menüpunkt**
- Wenn die App geöffnet wird, muss das System den Menüpunkt „Start“ als aktiven Menüpunkt darstellen.
- Das System muss einen ausgewählten Menüpunkt als aktiven Menüpunkt darstellen.
- Wenn der Nutzer einen Menüpunkt antippt, muss das System diesen Menüpunkt zum aktiven Menüpunkt machen.
- Das System muss hinter dem Icon des aktiven Menüpunkts eine längliche, abgerundete Hervorhebung in der Hervorhebungsfarbe darstellen. Die Hervorhebung liegt primär hinter dem Icon und nicht als Hintergrund über die gesamte Höhe des Menüpunkts.
- Das System muss Icon und Beschriftung des aktiven Menüpunkts in der Aktivfarbe darstellen.
- Das System muss die übrigen Menüpunkte in der Inaktivfarbe darstellen.

**Inhaltsbereich**
- Solange die Zielansicht eines Menüpunkts nicht definiert ist, muss das System bei aktivem Menüpunkt im Inhaltsbereich mittig den Text „under construction :)“ darstellen. Das gilt für alle fünf Menüpunkte.

**Farben**
- Das System muss die Farben der Hauptnavigation als benannte, zentral definierte Farben beziehen.
- Die Farben sind aktuell ausschließlich durch den CEO über den Chat änderbar (CEO: „Aktuell sollen diese nur hier verwaltbar sein.“). Die App bietet dafür keine Einstellungsmöglichkeit.
- Aktuelle Standardwerte (aus dem Referenzbild gemessen, **Bestätigung CEO ausstehend, F2**):

| Farbe (vorläufiger Name) | Beschreibung des CEO | aktueller Standardwert |
|---|---|---|
| Navigationshintergrund | heller, cremefarbener Ton | `#FAF6EB` |
| Hervorhebungsfarbe | beige | `#D9C8AE` |
| Aktivfarbe | bordeauxrot | `#76312C` |
| Inaktivfarbe | gedeckter Braunton | `#6B5849` |

- Konkrete Farbwerte sind keine Akzeptanzkriterien (siehe CLAUDE.md, Abschnitt „Farben auf Zuruf“). Eingefroren wird nur, welche Farbe welches Element färbt.

**Randbedingungen (technische Vorgaben des CEO)**
- Das System muss den aktiven Menüpunkt dynamisch verwalten.
- Das System muss die Zuordnung der Icons zu den Menüpunkten an einer zentralen Stelle festlegen.
- Das System muss so aufgebaut sein, dass jeder der fünf Menüpunkte später eine eigene Ansicht öffnen kann.

## Akzeptanzkriterien

### AK-1 Fünf Menüpunkte in fester Reihenfolge
- **Gegeben** die App ist geöffnet
- **Wenn** der Nutzer die Hauptnavigation betrachtet
- **Dann** enthält sie genau fünf Menüpunkte mit den Beschriftungen „Start“, „Bücher“, „Bibliothek“, „Statistik“ und „Profil“, von links nach rechts in dieser Reihenfolge

### AK-2 Position am unteren Bildschirmrand und Hintergrund
- **Gegeben** die App ist geöffnet
- **Wenn** der Nutzer den Bildschirm betrachtet
- **Dann** befindet sich die Hauptnavigation am unteren Bildschirmrand
- **Und** ihr Hintergrund ist in der Farbe „Navigationshintergrund“ dargestellt

### AK-3 Gleichmäßige Verteilung
- **Gegeben** die Hauptnavigation wird angezeigt
- **Wenn** die Breiten der fünf Menüpunkte verglichen werden
- **Dann** nimmt jeder Menüpunkt den gleichen Anteil der verfügbaren Breite ein

### AK-4 Icon mittig über der Beschriftung
- **Gegeben** die Hauptnavigation wird angezeigt
- **Wenn** ein beliebiger Menüpunkt betrachtet wird
- **Dann** besteht er aus einem Icon und einer Beschriftung
- **Und** das Icon steht über der Beschriftung und ist horizontal mittig zu ihr ausgerichtet

### AK-5 Nur die Icons des CEO gemäß Zuordnungstabelle
- **Gegeben** die Icon-Dateien des CEO liegen unter `docs/requirements/referenzen/icons/`
- **Wenn** die Hauptnavigation angezeigt wird
- **Dann** zeigt jeder Menüpunkt das ihm laut Zuordnungstabelle (Abschnitt „Icons“) zugeordnete Icon
- **Und** es wird kein anderes Icon (weder selbst ausgewählt noch aus einer Icon-Bibliothek) verwendet

### AK-6 Darstellung des aktiven Menüpunkts
- **Gegeben** ein Menüpunkt (z. B. „Bücher“) ist aktiv
- **Wenn** die Hauptnavigation angezeigt wird
- **Dann** liegt hinter seinem Icon eine längliche, abgerundete Hervorhebung in der Hervorhebungsfarbe
- **Und** die Hervorhebung erstreckt sich nicht über die gesamte Höhe des Menüpunkts
- **Und** Icon und Beschriftung dieses Menüpunkts sind in der Aktivfarbe dargestellt

### AK-7 Darstellung der inaktiven Menüpunkte
- **Gegeben** ein Menüpunkt ist aktiv
- **Wenn** die Hauptnavigation angezeigt wird
- **Dann** sind Icons und Beschriftungen aller anderen Menüpunkte in der Inaktivfarbe dargestellt
- **Und** hinter ihren Icons liegt keine Hervorhebung

### AK-8 Wechsel des aktiven Menüpunkts
- **Gegeben** ein Menüpunkt ist aktiv
- **Wenn** der Nutzer einen anderen Menüpunkt antippt
- **Dann** wird der angetippte Menüpunkt wie in AK-6 dargestellt
- **Und** der zuvor aktive Menüpunkt wird wie in AK-7 dargestellt

### AK-9 Sichtbar beim vertikalen Scrollen
- **Gegeben** der Inhalt des Bildschirms ist höher als der sichtbare Bereich
- **Wenn** der Nutzer den Inhalt vertikal scrollt
- **Dann** bleibt die Hauptnavigation vollständig sichtbar und an ihrer Position

### AK-10 Unterer sicherer Bildschirmbereich
- **Gegeben** das Gerät hat am unteren Rand einen Systembereich (z. B. Systemnavigation oder Gestenleiste)
- **Wenn** die Hauptnavigation angezeigt wird
- **Dann** werden Icons und Beschriftungen der Menüpunkte nicht von diesem Systembereich verdeckt

### AK-11 „Start“ ist beim Öffnen der App aktiv
- **Gegeben** die App ist nicht geöffnet
- **Wenn** der Nutzer die App öffnet
- **Dann** ist der Menüpunkt „Start“ aktiv und wird wie in AK-6 dargestellt
- **Und** alle anderen Menüpunkte werden wie in AK-7 dargestellt

### AK-12 Platzhaltertext im Inhaltsbereich
- **Gegeben** die Zielansicht des aktiven Menüpunkts ist noch nicht definiert
- **Wenn** einer der fünf Menüpunkte aktiv ist
- **Dann** zeigt der Inhaltsbereich mittig genau den Text „under construction :)“

## Abgrenzung (nicht Teil dieses REQ)

- Inhalte und Funktionen der Zielansichten der fünf Menüpunkte. Der CEO hat sie noch nicht definiert („Für noch nicht definierte Zielansichten sollen keine umfangreichen Funktionen erfunden werden.“).
- Alle übrigen Elemente des Referenzbilds (Überschrift, Filter, Buchliste, Sagas, Sammlungen usw.). CEO: „Nein, bitte erstmal nur die Leiste.“
- Auswahl oder Gestaltung der Icons. Die Icons stellt der CEO selbst bereit.
- Konkrete Farbwerte als Akzeptanzkriterium (siehe „Farben auf Zuruf“).
- Eine Möglichkeit für den Nutzer, Farben in der App zu ändern (Einstellungen, Themes). Das ist Gegenstand von REQ-001 und für einen späteren Prototyp vorgesehen.

## Qualitätsanforderungen

- Keine. Der CEO hat bisher keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **Icon-Dateien:** Vom CEO geliefert unter `docs/requirements/referenzen/icons/`. Die Umsetzung von AK-5 setzt die bestätigte Zuordnungstabelle voraus (F1).
- **Prozess „Farben auf Zuruf“:** Der CEO gibt Farbänderungen im Chat als Liste aus Name und Farbwert durch (CEO: „z. B. Hintergrund #FFFFFF, Primärfarbe: #FFFF22, …“). Die zentral definierten Standardwerte werden dann durch den Entwickler angepasst.
- **REQ-001 (Themes, Entwurf, später):** Später sollen Themes das Aussehen der App ändern. Die zentrale Definition der Farben in diesem REQ ist die Grundlage dafür. Wie die vier Navigationsfarben in einem Theme abgebildet werden, wird erst bei REQ-001 geklärt.
- **Glossar:** Der Begriff „Bibliothek“ ist bereits als „Gesamtheit aller erfassten Bücher“ definiert. Daneben gibt es jetzt die Menüpunkte „Bücher“ und „Bibliothek“. Die Abgrenzung wird erst bei der Definition der Zielansichten geklärt.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

- F1: Icon-Zuordnung. Gehört `icon-offenes-buch.png` zu „Bücher“ und `icon-buecherregal.png` zu „Bibliothek“ (Reihenfolge der Lieferung)? Im Referenzbild steht das offene Buch unter „Bibliothek“.
- F2: Farbwerte. Bestätigst du die aus dem Referenzbild gemessenen Standardwerte Navigationshintergrund `#FAF6EB`, Hervorhebungsfarbe `#D9C8AE`, Aktivfarbe `#76312C`, Inaktivfarbe `#6B5849`?

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-09 | Erstellt (Entwurf ausschließlich aus der Vorgabe des CEO zur unteren Hauptnavigation, mit Referenzbild) | Anforderungsmanager |
| 2026-11-09 | Antworten des CEO eingearbeitet: Priorität „Must“ und AK-8 bestätigt; Icons geliefert (eine Datei je Menüpunkt, Einfärben durch die App), Zuordnungstabelle ergänzt; Farben zentral und vorerst nur über den Chat änderbar, aktuelle Standardwerte aus Referenzbild eingetragen; Startzustand „Start“ (neu AK-11); Platzhaltertext „under construction :)“ (neu AK-12); Rolle des Referenzbilds präzisiert. Offene Fragen F1 bis F6 beantwortet, neu: F1 Icon-Zuordnung, F2 Bestätigung Farbwerte | Anforderungsmanager |
