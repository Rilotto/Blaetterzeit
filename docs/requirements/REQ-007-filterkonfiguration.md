---
id: REQ-007
titel: Filterkonfiguration unabhängig von der Darstellung
status: Entwurf
prioritaet: Must
art: randbedingung
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

<!-- Priorität "Must": vorläufig, Bestätigung durch den CEO ausstehend (MoSCoW ist CEO-Entscheidung, siehe Offene Fragen). -->

## Ziel / Nutzen

Als **CEO** möchte ich, **dass die Filter der Seite „Bücher“ aus einer flexiblen, von der Darstellung unabhängigen Filterkonfiguration erzeugt werden**, damit **ich im Laufe der Entwicklung ohne größere Änderungen Filter hinzufügen, umbenennen, entfernen und neu sortieren kann**.

Vorgabe des CEO (wörtlich, Auszug): „Ich möchte im Laufe der Entwicklung selbst festlegen, welche Filter überhaupt existieren, wie sie heißen und welche Bücher sie anzeigen.“ und „Erstelle eine flexible Datenstruktur für diese Filter, sodass ich später ohne größere Änderungen weitere Filter hinzufügen, umbenennen, entfernen oder neu sortieren kann im Laufe des Entwicklungsprozesses.“

## Anforderung (Satzschablone)

**Filterkonfiguration**
- Das System muss die Filter der Filterleiste (REQ-006) aus einer Filterkonfiguration erzeugen.
- Das System muss die Filterkonfiguration unabhängig von der visuellen Darstellung verwalten. Die Filterkonfiguration enthält keine Angaben zur Darstellung; die Darstellung enthält keine fest eingebauten Filter.
- Das System muss die Filterkonfiguration an einer zentralen Stelle festlegen.
- Das System muss je Filter in der Filterkonfiguration mindestens festlegen: den Namen (Beschriftung), die Position in der Reihenfolge und die zugeordnete Filterlogik.
- Das System muss eine beliebige Anzahl von Filtern in der Filterkonfiguration ermöglichen.
- Das System muss die Reihenfolge der Filter über die Filterkonfiguration festlegen.
- Das System muss es ermöglichen, Filter hinzuzufügen, umzubenennen, zu entfernen und neu zu sortieren, indem ausschließlich die Filterkonfiguration geändert wird.

**Aktuelle Filterkonfiguration (vom CEO festgelegt)**

| Position | Name | standardmäßig aktiv | Filterlogik |
|---|---|---|---|
| 1 | Für dich | ja | noch nicht ausgearbeitet |
| 2 | Gerade am Lesen | nein | noch nicht ausgearbeitet |
| 3 | Noch zu lesen | nein | noch nicht ausgearbeitet |

**Filterlogik (Rahmen, noch nicht ausgearbeitet)**
- Die Filterlogik je Filter arbeitet der CEO später pro Filter separat aus, einschließlich der Frage, welchen Teil der Seite der Filter beeinflusst (CEO: „ja, dies arbeiten wir aber pro Filter separat aus“).
- Grundlage für die spätere Auswahl der Bücher ist laut CEO der Lesestatus, den der Nutzer später in den Buchdetails angibt (CEO: „In den Buchdetails kann ich später einen Status angeben.“). Vorgesehene Werte (CEO: „Diese werden vorerst sein“): ungelesen, am lesen, gelesen, abgebrochen, Wunschliste (siehe Glossar „Lesestatus“).
- Welcher Filter welche Lesestatus auswählt, ist nicht festgelegt und nicht Teil dieses REQ.

## Akzeptanzkriterien

### AK-1 Filterleiste entspricht der Filterkonfiguration
- **Gegeben** die aktuelle Filterkonfiguration (Tabelle oben)
- **Wenn** die Filterleiste angezeigt wird
- **Dann** zeigt sie genau die Filter der Filterkonfiguration mit deren Namen in deren Reihenfolge

### AK-2 Filter hinzufügen nur über die Konfiguration
- **Gegeben** in der Filterkonfiguration wird ein weiterer Filter ergänzt
- **Wenn** die Filterleiste angezeigt wird
- **Dann** erscheint der neue Filter an der in der Konfiguration festgelegten Position
- **Und** dafür wurde nur die Filterkonfiguration geändert

### AK-3 Filter umbenennen nur über die Konfiguration
- **Gegeben** in der Filterkonfiguration wird der Name eines Filters geändert
- **Wenn** die Filterleiste angezeigt wird
- **Dann** trägt der Filter den neuen Namen
- **Und** dafür wurde nur die Filterkonfiguration geändert

### AK-4 Filter entfernen nur über die Konfiguration
- **Gegeben** in der Filterkonfiguration wird ein Filter entfernt
- **Wenn** die Filterleiste angezeigt wird
- **Dann** ist der entfernte Filter nicht mehr enthalten und die übrigen Filter behalten ihre Reihenfolge
- **Und** dafür wurde nur die Filterkonfiguration geändert

### AK-5 Filter neu sortieren nur über die Konfiguration
- **Gegeben** in der Filterkonfiguration wird die Reihenfolge der Filter geändert
- **Wenn** die Filterleiste angezeigt wird
- **Dann** stehen die Filter in der neuen Reihenfolge
- **Und** dafür wurde nur die Filterkonfiguration geändert

### AK-6 Beliebige Anzahl
- **Gegeben** eine Filterkonfiguration mit deutlich mehr Filtern als in der aktuellen Konfiguration (z. B. zehn)
- **Wenn** die Filterleiste angezeigt wird
- **Dann** enthält sie alle diese Filter in der festgelegten Reihenfolge

### AK-7 Konfiguration unabhängig von der Darstellung
- **Gegeben** die Filterkonfiguration
- **Wenn** ihr Inhalt geprüft wird
- **Dann** enthält sie keine Darstellungsangaben (z. B. Farben, Maße, Formen)
- **Und** die Darstellung der Filterleiste enthält keine fest eingebauten Filternamen

### AK-8 Jeder Filter hat eine zugeordnete Filterlogik
- **Gegeben** die Filterkonfiguration
- **Wenn** ein beliebiger Filter darin betrachtet wird
- **Dann** ist ihm eine Filterlogik zugeordnet, die beim Aktivieren des Filters ausgelöst wird (REQ-006, AK-10)

## Abgrenzung (nicht Teil dieses REQ)

- Inhalt der Filterlogik je Filter (welche Bücher, welcher Teil der Seite). Wird pro Filter separat ausgearbeitet.
- Erfassung des Lesestatus in den Buchdetails (CEO: „später“).
- Darstellung und Bedienung der Filterleiste (REQ-006).

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-006 (Filterleiste):** stellt die Filter dieser Konfiguration dar und löst ihre Filterlogik aus.
- **Lesestatus (Glossar):** Grundlage der späteren Filterlogik. Ein eigener REQ entsteht, sobald der CEO die Buchdetails definiert.
- **ADR-0002 (Speicherzugriff nur über Repository-Schnittstellen):** zu beachten, falls die Filterkonfiguration gespeichert wird.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. Nummern entsprechen der Fragenliste an den CEO vom 2026-11-09. -->

- F1: Priorität (MoSCoW) dieses REQ?
- F7: Wer pflegt die Filterkonfiguration und wo (nur du über den Chat, wie bei den Farben, oder später auch der Nutzer in der App)? Und was gehört außer Name, Reihenfolge, Filterlogik und Standardfilter noch zu einem Filter? (Im Referenzbild steht hinter „Gerade am Lesen“ zusätzlich eine Zahl.)

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-09 | Erstellt (Entwurf aus der Vorgabe des CEO, Punkte 1 bis 3 und 10, flexible Datenstruktur, Antworten zu Filtern, Reihenfolge, Standardfilter und Lesestatus) | Anforderungsmanager |
