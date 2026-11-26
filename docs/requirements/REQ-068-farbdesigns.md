---
id: REQ-068
titel: Fenster „Design“ – Farbdesigns auswählen (Klassisch, Salbei, Nachtlektüre, Raureif, Polarnacht, Minztraube, Traubennacht)
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
- Das System muss genau die Farbdesigns „Klassisch“, „Salbei“, „Nachtlektüre“, „Raureif“, „Polarnacht“, „Minztraube“ und „Traubennacht“ in dieser Reihenfolge bereitstellen.
- Das System muss jedes Farbdesign an der zentralen Stelle als genau eines von „hell“ oder „dunkel“ einordnen:
  - hell: Klassisch, Salbei, Raureif, Minztraube
  - dunkel: Nachtlektüre, Polarnacht, Traubennacht
- Das System muss im Fenster „Design“ unter „Farben“ je Farbdesign eine Zeile mit dem Namen und fünf Farbkreisen darstellen, und zwar in der Reihenfolge Hintergrund, Primär, Sekundär, Tertiär, Dunkelbraun mit den Werten dieses Designs. Welche Zeilen gerade sichtbar sind, regelt die Auswahl „Hell“ / „Dunkel“ (REQ-110). Innerhalb von „Hell“ bzw. „Dunkel“ gilt die Reihenfolge oben.
- Das System muss beim aktiven Farbdesign ein Häkchen darstellen und bei allen anderen einen leeren Kreis.
- Wenn der Nutzer eine Zeile antippt, muss das System dieses Farbdesign sofort app-weit anwenden, ohne Neustart und ohne „Sichern“.
- Das System muss das gewählte Farbdesign dauerhaft über die Repository-Schnittstelle (ADR-0002) speichern und nach einem Neustart wieder anwenden.
- Solange der Nutzer kein Farbdesign gewählt hat, muss das System „Klassisch“ anwenden.
- Neue Farbdesigns kommen nur auf Zuruf des CEO an der zentralen Stelle hinzu. In der App gibt es keinen Editor.

**Standardwerte (keine Akzeptanzkriterien, auf Zuruf änderbar, analog CLAUDE.md „Farben auf Zuruf“)**

| Design | Hintergrund | Primär | Sekundär | Tertiär | Dunkelbraun (Text) | Kartenfläche (REQ-065) |
|---|---|---|---|---|---|---|
| Klassisch | heutige Standardfarben | | | | | #FFFDF8 |
| Salbei | #F3F5EE | #4E7D63 | #C9D6C3 | #5E6B5A | #2C3A2F | #FBFCF8 |
| Nachtlektüre (dunkel) | #2B2420 | #D9A21B | #5A4A3E | #B8A58C | #F1E9DA | #362D28 |
| Raureif (hell) | #F6F8FA | #2E5A7A | #C9D8E3 | #5C6B78 | #1E2A35 | leitet der Entwickler ab |
| Polarnacht (dunkel) | #0F1620 | #8EC5E8 | #24364A | #9BABBB | #E8F0F6 | leitet der Entwickler ab |
| Minztraube (hell) | #F6F8FA | #9B287B | #EBCFE3 | #5C164E | #170F11 | leitet der Entwickler ab |
| Traubennacht (dunkel) | #170F11 | #D46BB6 | #5C164E | #B79AB0 | #F6F8FA | leitet der Entwickler ab |

Zusätzlich vom CEO vorgegeben: Ghost / GhostFrame für Raureif #EBF0F4 / #D8E0E7, für Polarnacht #172030 / #253244, für Minztraube #EBF0F4 / #D8E0E7, für Traubennacht #22171B / #402039.

Minztraube und Traubennacht beruhen auf der eigenen Palette des CEO. Sie nennt zusätzlich „Schrift tertiär“: Minztraube #6E5468, Traubennacht #A88DA2. Diese Farbrubrik gibt es seit 2026-11-09 nicht mehr, sie ist mit „Tertiär“ zusammengelegt (Glossar „Farbrubrik“). **Auslegung:** In „Tertiär“ steht der vom CEO als „Tertiär“ genannte Wert. Die Werte für „Schrift tertiär“ bleiben hier nur vermerkt. Will der CEO stattdessen den Schrift-Wert für „Tertiär“, ist das eine Farbänderung auf Zuruf.

„Kartenfläche“ erscheint nicht in den fünf Farbkreisen der Liste.

Die übrigen Farbrubriken (Ghost und GhostFrame, soweit nicht oben vorgegeben, Kartenfläche bei Raureif, Polarnacht, Minztraube und Traubennacht, Flamme Rot und Orange, Kriterienfarben, Gold) leitet der Entwickler je Design passend ab. Eine Farbänderung auf Zuruf betrifft das vom CEO genannte Design.

## Akzeptanzkriterien

### AK-1 Liste der Farbdesigns
- **Gegeben** das Fenster „Design“ mit aktivem „Farben“
- **Wenn** der Nutzer die Liste unter „Hell“ und danach unter „Dunkel“ (REQ-110) betrachtet
- **Dann** stehen unter „Hell“ „Klassisch“, „Salbei“, „Raureif“ und „Minztraube“ in dieser Reihenfolge
- **Und** unter „Dunkel“ stehen „Nachtlektüre“, „Polarnacht“ und „Traubennacht“ in dieser Reihenfolge
- **Und** jede Zeile hat fünf Farbkreise in den Farben Hintergrund, Primär, Sekundär, Tertiär und Dunkelbraun des jeweiligen Designs

### AK-2 Standard und Markierung
- **Gegeben** der Nutzer hat noch nie ein Farbdesign gewählt
- **Wenn** er die App öffnet und die Liste betrachtet
- **Dann** verwendet die App die Farben von „Klassisch“
- **Und** „Klassisch“ trägt ein Häkchen, alle anderen Designs unter „Hell“ und unter „Dunkel“ einen leeren Kreis

### AK-3 Sofort anwenden ohne Neustart
- **Gegeben** „Klassisch“ ist aktiv
- **Wenn** der Nutzer auf „Dunkel“ wechselt und „Nachtlektüre“ antippt
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
- REQ-110 (Pillen „Hell“ / „Dunkel“, nutzt die Einordnung hell/dunkel aus diesem REQ).

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-25 | CEO-Wunsch vom 2026-11-23, bestätigt (CEO 2026-11-25: „hätten nicht noch neue Farbpaletten und die Trennung von Hell und Dunkel mit in den Prototypen sollen?“). Zwei Farbdesigns ergänzt: „Minztraube“ (hell) und „Traubennacht“ (dunkel), Werte aus der eigenen Palette des CEO als Standardwerte. Jedes Design ist jetzt als hell oder dunkel eingeordnet. Die Liste wird nach „Hell“ / „Dunkel“ getrennt angezeigt (REQ-110). Titel, Anforderung, Tabelle, AK-1, AK-2 und AK-3 geändert. Auslegung zu „Schrift tertiär“ siehe Standardwerte. Status unverändert, Wechsel auf „In Umsetzung“ durch den Scrum Master | Anforderungsmanager |
| 2026-11-22 | CEO (wörtlich): „Bitte baue nun den Prototypen und berücksichtige auch die neuen Farben“ (Winter-Templates vom 2026-11-21). Zwei Farbdesigns ergänzt: „Raureif“ (hell) und „Polarnacht“ (dunkel), Reihenfolge Klassisch, Salbei, Nachtlektüre, Raureif, Polarnacht. Standardwerte auf Zuruf; Kartenfläche, Flammen und Kriterienfarben leitet der Entwickler ab. Titel, Anforderung, AK-1 und Tabelle geändert. Status unverändert | Anforderungsmanager |
| 2026-11-18 | Farbrubrik „Kartenfläche“ (REQ-065) mit Standardwerten je Design in die Tabelle aufgenommen (Klassisch #FFFDF8, Salbei #FBFCF8, Nachtlektüre #362D28). Begründung: CEO-Wunsch nach hellerer Kartenfläche „wie bei Buchdetails -> Ausgabe“, nachdem die Körnung entfällt. Status unverändert | Anforderungsmanager |
| 2026-11-18 | Erstellt aus der CEO-Anforderung, dem angenommenen Mockup und den CEO-Antworten (Start-Designs, Ablösung von REQ-001). Status „Abgestimmt“ | Anforderungsmanager |
