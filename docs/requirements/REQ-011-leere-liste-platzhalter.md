---
id: REQ-011
titel: Leere-Liste-Platzhalter im Abschnitt „Noch zu lesen“
status: Abgestimmt
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **bei leerem Abschnitt „Noch zu lesen“ einen erkennbaren Platzhalter sehen**, damit **klar ist, dass noch kein Buch vorhanden ist, und ich dort später ein Buch anlegen kann**.

Vorgabe des CEO (wörtlich, Auszug aus [referenzen/CEO-vorgabe-noch-zu-lesen.txt](referenzen/CEO-vorgabe-noch-zu-lesen.txt)): „Falls im Abschnitt ‚Noch zu lesen‘ aktuell kein einziges Buch vorhanden ist, soll anstelle der Buchliste ein Platzhalter erscheinen. Dieser Platzhalter soll sich gestalterisch am Feld ‚Neue Sammlung‘ im Referenzbild orientieren.“ – „Der Platzhalter soll später als Schaltfläche dienen, um ein neues Buch anzulegen. Die genaue Aktion wird mit mir abgestimmt.“

Präzisierung des CEO (2026-11-09, wörtlich): „verwende bitte das Herz, färbe es bordeaux ein und schreibe den Text unter das Buch (an die Titelstelle): 'Wie wäre es mit einem neuen Buch?'“ Das Herz-Icon ([referenzen/icons/icon-herz.png](referenzen/icons/icon-herz.png)) ersetzt das ursprünglich beschriebene Pluszeichen.

Referenzbild: Feld „Neue Sammlung“ in [referenzen/REQ-002-referenz-hauptnavigation.png](referenzen/REQ-002-referenz-hauptnavigation.png) (nur Optik des gestrichelten Rahmens, Orientierung).

## Anforderung (Satzschablone)

- Wenn dem Abschnitt „Noch zu lesen“ kein Buch zugeordnet ist, muss das System anstelle der Buchliste den Leere-Liste-Platzhalter darstellen.
- Wenn dem Abschnitt mindestens ein Buch zugeordnet ist (auch ohne Buchcover), darf das System den Leere-Liste-Platzhalter nicht darstellen.
- Das System muss den Leere-Liste-Platzhalter wie einen Bucheintrag (REQ-009) aufbauen: oben eine Fläche in Form und Größe der Coverfläche, darunter an der Stelle des Buchtitels ein Text.
- Das System muss die Fläche mit einem gestrichelten Rahmen darstellen.
- Das System muss in der Fläche das Herz-Icon des CEO darstellen und es selbst in der Farbe seiner Farbrolle einfärben.
- Das System muss an der Titelstelle genau den Text „Wie wäre es mit einem neuen Buch?“ darstellen.
- Wenn der Nutzer den Leere-Liste-Platzhalter antippt, darf sich in der App nichts ändern (CEO: „aktuell noch nichts.“). Die spätere Aktion „neues Buch anlegen“ steht in der To-do-Liste (`docs/todo.md`) und wird gesondert mit dem CEO abgestimmt.
- Das System darf für den Leere-Liste-Platzhalter kein anderes Icon als das Herz-Icon des CEO verwenden.
- Das System muss alle Farben des Platzhalters über Farbrollen aus zentralen Farbrubriken beziehen. Konkrete Farbwerte sind kein Akzeptanzkriterium.

| Farbrolle | Element | Farbrubrik | Aussage des CEO |
|---|---|---|---|
| Leerplatzhalter-Fläche | Fläche | Ghost | Rückfrage-Ergebnis 2026-11-09 |
| Leerplatzhalter-Rahmen | gestrichelter Rahmen | GhostFrame | Rückfrage-Ergebnis 2026-11-09 |
| Leerplatzhalter-Icon | Herz-Icon | Primär | „färbe es bordeaux ein“ |
| Leerplatzhalter-Text | Text an der Titelstelle | Primär | Rückfrage-Ergebnis 2026-11-09 (Bordeaux) |

## Akzeptanzkriterien

### AK-1 Platzhalter bei leerem Abschnitt
- **Gegeben** dem Abschnitt „Noch zu lesen“ ist kein Buch zugeordnet
- **Wenn** die Seite „Bücher“ angezeigt wird
- **Dann** steht unter der Abschnittsüberschrift statt einer Buchliste der Leere-Liste-Platzhalter
- **Und** er besteht aus einer Fläche mit gestricheltem Rahmen und dem Herz-Icon darin
- **Und** darunter steht genau der Text „Wie wäre es mit einem neuen Buch?“

### AK-2 Kein Platzhalter, sobald ein Buch da ist
- **Gegeben** dem Abschnitt ist genau ein Buch ohne Buchcover zugeordnet
- **Wenn** die Seite „Bücher“ angezeigt wird
- **Dann** wird der Leere-Liste-Platzhalter nicht angezeigt
- **Und** stattdessen der Bucheintrag mit Cover-Platzhalter und Titel (REQ-010)

### AK-3 Antippen bewirkt vorerst nichts
- **Gegeben** der Leere-Liste-Platzhalter wird angezeigt
- **Wenn** der Nutzer ihn antippt
- **Dann** ändert sich in der App nichts (kein neues Fenster, keine neue Ansicht, kein Wechsel des Menüpunkts, keine Änderung der Seite „Bücher“)

### AK-4 Farben aus zentralen Farbrubriken
- **Gegeben** der Wert einer Farbrubrik einer Farbrolle dieses REQ wird an der zentralen Stelle geändert
- **Wenn** der Leere-Liste-Platzhalter angezeigt wird
- **Dann** sind alle Elemente mit dieser Farbrolle im geänderten Wert dargestellt

### AK-5 Größe wie ein Cover
- **Gegeben** der Leere-Liste-Platzhalter wird angezeigt
- **Wenn** seine Fläche mit der Coverfläche eines Bucheintrags (REQ-009) verglichen wird
- **Dann** haben beide dieselbe Breite und Höhe

### AK-6 Farbzuordnung
- **Gegeben** der Leere-Liste-Platzhalter wird angezeigt
- **Wenn** seine Elemente betrachtet werden
- **Dann** ist die Fläche in der Farbe der Farbrubrik „Ghost“ dargestellt
- **Und** der gestrichelte Rahmen in „GhostFrame“
- **Und** das Herz-Icon und der Text in „Primär“

### AK-7 Nur das Herz-Icon des CEO
- **Gegeben** der Leere-Liste-Platzhalter wird angezeigt
- **Wenn** die Herkunft des Icons geprüft wird
- **Dann** ist es die vom CEO bereitgestellte Datei `icon-herz.png` und stammt nicht aus einer Icon-Bibliothek

## Abgrenzung (nicht Teil dieses REQ)

- Die Rubrik „Sammlungen“ als Funktion (nur ihre Optik dient als Vorbild; Abschnittsüberschrift mit Platzhalter: REQ-012).
- Die spätere Aktion „neues Buch anlegen“ (To-do, `docs/todo.md`).
- Cover-Platzhalter für Bücher ohne Cover (REQ-010).
- Konkrete Maße und Farbwerte als Akzeptanzkriterium.

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-009:** Abschnitt „Noch zu lesen“, Aufbau und Covergröße des Bucheintrags.
- **REQ-010:** abzugrenzender Zustand „Buch ohne Cover“; dasselbe Herz-Icon.
- **REQ-006:** Farbrubriken „Ghost“, „GhostFrame“.
- **REQ-005:** Plus-Schaltfläche soll ebenfalls später ein Buch anlegen; beide Wege werden bei der Abstimmung der Aktion gemeinsam betrachtet.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-09 | Erstellt (Entwurf aus der CEO-Vorgabe „Noch zu lesen“, Abschnitt 6) | Anforderungsmanager |
| 2026-11-09 | CEO-Antworten eingearbeitet: F2 Herz-Icon statt Pluszeichen, Aufbau wie Bucheintrag in Covergröße, Text „Wie wäre es mit einem neuen Buch?“ an der Titelstelle (neu AK-5, AK-7). F3 Antippen bewirkt vorerst nichts (AK-3), spätere Aktion in To-do. F6 Fläche Ghost, Rahmen GhostFrame, Herz und Text Primär (neu AK-6). Entfallen: „großzügige Innenabstände“, „abgerundete rechteckige Fläche“ als eigenständige Form. F7 Must. Vom CEO bestätigt 2026-11-09, Status „Abgestimmt“ | Anforderungsmanager |
