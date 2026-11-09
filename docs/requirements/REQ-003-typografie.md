---
id: REQ-003
titel: Zentral definierte Schriftart und Schriftgrößen-Hierarchie
status: Entwurf
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **eine einheitliche, gut lesbare Schrift mit klarer Größenabstufung**, damit **die App ruhig und stimmig wirkt und ich Titel, Inhalte und Beschriftungen sofort unterscheiden kann**.

## Anforderung (Satzschablone)

- Das System muss alle Texte in der zentral definierten Schriftart der App darstellen.
- Randbedingung: Die Schriftart muss an genau einer zentralen Stelle definiert sein, sodass ein Austausch dort ohne weitere Anpassungen in der gesamten App wirkt.
- Das System muss die Schriftgröße jedes Textes aus einer zentral definierten Größen-Hierarchie mit den Stufen Seitentitel, Abschnittsüberschrift, Fließtext und Beschriftung beziehen _(Stufen vorläufig)_.
- Das System muss die Stufen so belegen, dass gilt: Seitentitel > Abschnittsüberschrift > Fließtext > Beschriftung.
- Das System muss die Schriftart ohne Netzwerkverbindung darstellen können _(vorläufig, abhängig von F2)_.

## Akzeptanzkriterien

### AK-1 Alle Texte in der zentralen Schriftart
- **Gegeben** die App ist gestartet
- **Wenn** eine beliebige Hauptseite angezeigt wird
- **Dann** werden alle Texte der Seite und der Hauptleiste in der zentral definierten Schriftart dargestellt

### AK-2 Schriftart zentral austauschbar
- **Gegeben** an der zentralen Stelle ist eine andere Schriftart eingetragen
- **Wenn** die App gestartet wird
- **Dann** werden alle Texte in der neu eingetragenen Schriftart dargestellt, ohne dass andere Stellen angepasst wurden

### AK-3 Größen nur aus der Hierarchie
- **Gegeben** die App ist gestartet
- **Wenn** eine beliebige Hauptseite angezeigt wird
- **Dann** entspricht die Schriftgröße jedes Textes genau einer Stufe der zentral definierten Größen-Hierarchie

### AK-4 Größen-Hierarchie absteigend
- **Gegeben** die zentral definierte Größen-Hierarchie
- **Wenn** die Größen der Stufen verglichen werden
- **Dann** gilt Seitentitel > Abschnittsüberschrift > Fließtext > Beschriftung

### AK-5 Schrift offline verfügbar _(vorläufig, F2)_
- **Gegeben** das Gerät hat keine Netzwerkverbindung
- **Wenn** die App gestartet wird
- **Dann** werden alle Texte in der zentral definierten Schriftart dargestellt (keine Ersatzschrift)

## Abgrenzung (nicht Teil dieses REQ)

- Auswahl oder Änderung der Schriftart bzw. -größe durch den Nutzer in der App.
- Berücksichtigung der Android-Systemeinstellung „Schriftgröße“ (ggf. eigener REQ).
- Der konkrete Schriftname ist kein Akzeptanzkriterium (zentral austauschbar wie die Standardfarben).
- Textfarben → REQ-002.

## Qualitätsanforderungen

- Lesbarkeit _(vorläufig)_: Fließtext mindestens 16 CSS-Pixel, Beschriftung mindestens 12 CSS-Pixel.
- Die Schriftart muss frei lizenziert sein (z. B. SIL Open Font License), sodass sie in der App mitgeliefert werden darf.

## Abhängigkeiten

- Wird genutzt von REQ-004 (Hauptleiste, Seitentitel) und REQ-005 (Platzhalterseiten).

## Offene Fragen

- F1: Welche Schriftart (bzw. Kombination für Überschriften/Fließtext) wird als Standard eingetragen? Falls eine Kombination gewählt wird, wird die Anforderung auf „zwei zentral definierte Schriftarten mit fester Zuordnung zu den Stufen“ erweitert.
- F2: Soll die Schrift lokal mit der App ausgeliefert werden (offline-fähig, Empfehlung) oder aus dem Internet geladen werden? Bei „aus dem Internet“ entfällt AK-5.
- F3: Bestätigung der vier Größenstufen und der Mindestgrößen.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-09 | Erstellt (Entwurf für ersten Prototyp) | Anforderungsmanager |
