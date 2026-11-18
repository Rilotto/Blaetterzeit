---
id: REQ-068
titel: Fenster „Design“ – Farbdesigns auswählen (Klassisch, Salbei, Nachtlektüre)
status: In Umsetzung
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: [REQ-001]
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **aus einer Liste gespeicherter Farbdesigns mit kurzer Farbvorschau wählen**, damit **sich die Farben der App sofort und dauerhaft ändern**.

CEO (2026-11-18, wörtlich): „Farben gibt mir eine Übersicht, welche der bisher festgelegten und gespeicherten Designs es gibt mit kurzer Farbvorschau (einfach in Kreisen?). […] Beim Klick auf ein Design oder eine Schriftart soll die App sich aktualisieren und keinen Neustart benötigen.“ Zu den Start-Designs: „Zum Start soll es auch die Mockup Designs geben. Setze diese bitte zusätzlich zu dem klassischen Design um.“

**Ersetzt REQ-001 (Themes, Entwurf, nie abgestimmt).** CEO, wörtlich: „Ja das wird durch die jetzige Funktion abgelöst und ist somit nicht mehr relevant.“ Von REQ-001 bleibt erhalten: Der Zugang läuft über „Profil“, die Auswahl wird vom CEO bereitgestellt und wächst, und eine Wahl ändert das Aussehen. Es ändert sich: Es gibt keine „Einstellungen“ mit Rubrik „Themes“, sondern Profil › App › Design. Ein Design legt die Werte aller Farbrubriken fest, die Schrift wird getrennt gewählt (REQ-069).

## Anforderung (Satzschablone)

- Das System muss Farbdesigns an genau einer zentralen Stelle definieren. Jedes Farbdesign hat einen Namen und legt einen Wert für jede Farbrubrik fest (siehe Glossar „Farbrubrik“).
- Das System muss zum Start genau die Farbdesigns „Klassisch“, „Salbei“ und „Nachtlektüre“ in dieser Reihenfolge bereitstellen.
- Das System muss im Fenster „Design“ unter „Farben“ je Farbdesign eine Zeile mit dem Namen und fünf Farbkreisen darstellen, und zwar in der Reihenfolge Hintergrund, Primär, Sekundär, Tertiär, Dunkelbraun mit den Werten dieses Designs.
- Das System muss beim aktiven Farbdesign ein Häkchen darstellen und bei allen anderen einen leeren Kreis.
- Wenn der Nutzer eine Zeile antippt, muss das System dieses Farbdesign sofort app-weit anwenden, ohne Neustart und ohne „Sichern“.
- Das System muss das gewählte Farbdesign dauerhaft über die Repository-Schnittstelle (ADR-0002) speichern und nach einem Neustart wieder anwenden.
- Solange der Nutzer kein Farbdesign gewählt hat, muss das System „Klassisch“ anwenden.
- Neue Farbdesigns kommen nur auf Zuruf des CEO an der zentralen Stelle hinzu. In der App gibt es keinen Editor.

**Standardwerte (keine Akzeptanzkriterien, auf Zuruf änderbar, analog CLAUDE.md „Farben auf Zuruf“)**

| Design | Hintergrund | Primär | Sekundär | Tertiär | Dunkelbraun (Text) |
|---|---|---|---|---|---|
| Klassisch | heutige Standardfarben | | | | |
| Salbei | #F3F5EE | #4E7D63 | #C9D6C3 | #5E6B5A | #2C3A2F |
| Nachtlektüre (dunkel) | #2B2420 | #D9A21B | #5A4A3E | #B8A58C | #F1E9DA |

Die übrigen Farbrubriken (Ghost, GhostFrame, Flamme Rot und Orange, Kriterienfarben) leitet der Entwickler je Design passend ab. Eine Farbänderung auf Zuruf betrifft das vom CEO genannte Design.

## Akzeptanzkriterien

### AK-1 Liste der Farbdesigns
- **Gegeben** das Fenster „Design“ mit aktivem „Farben“
- **Wenn** der Nutzer die Liste betrachtet
- **Dann** stehen dort „Klassisch“, „Salbei“ und „Nachtlektüre“ in dieser Reihenfolge, je mit fünf Farbkreisen in den Farben Hintergrund, Primär, Sekundär, Tertiär und Dunkelbraun des jeweiligen Designs

### AK-2 Standard und Markierung
- **Gegeben** der Nutzer hat noch nie ein Farbdesign gewählt
- **Wenn** er die App öffnet und die Liste betrachtet
- **Dann** verwendet die App die Farben von „Klassisch“
- **Und** „Klassisch“ trägt ein Häkchen, die anderen Designs einen leeren Kreis

### AK-3 Sofort anwenden ohne Neustart
- **Gegeben** „Klassisch“ ist aktiv
- **Wenn** der Nutzer „Nachtlektüre“ antippt
- **Dann** färbt sich die gesamte App, auch die Hauptnavigation und die Seite „Bücher“, ohne Neustart in den Farben von „Nachtlektüre“
- **Und** das Häkchen wechselt zu „Nachtlektüre“

### AK-4 Dauerhaft gespeichert
- **Gegeben** der Nutzer hat „Salbei“ gewählt
- **Wenn** die App neu geladen oder neu gestartet wird
- **Dann** ist „Salbei“ weiterhin aktiv

### AK-5 Jedes Design ist vollständig
- **Gegeben** die zentrale Definition der Farbdesigns
- **Wenn** geprüft wird, welche Farbrubriken jedes Design festlegt
- **Dann** legt jedes Design einen Wert für jede Farbrubrik fest

## Abgrenzung (nicht Teil dieses REQ)

- Ein Editor für eigene Designs in der App.
- Die Schriftwahl (REQ-069).

## Qualitätsanforderungen

- Keine.

## Abhängigkeiten

- REQ-002 und weitere REQs mit Farbrollen: Die Zuordnung Farbrolle → Farbrubrik bleibt unverändert, nur die Werte kommen aus dem aktiven Design.
- REQ-046 (blasse Kriterienfarbe wird aus voller Farbe und „Hintergrund“ des aktiven Designs gemischt).
- REQ-067. Ersetzt REQ-001.

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-18 | Erstellt aus der CEO-Anforderung, dem angenommenen Mockup und den CEO-Antworten (Start-Designs, Ablösung von REQ-001). Status „Abgestimmt“ | Anforderungsmanager |
