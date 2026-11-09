---
id: REQ-011
titel: Leere-Liste-Platzhalter im Abschnitt „Noch zu lesen“
status: Entwurf
prioritaet: offen
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **bei leerem Abschnitt „Noch zu lesen“ einen erkennbaren Platzhalter sehen**, damit **klar ist, dass noch kein Buch vorhanden ist, und ich dort später ein Buch anlegen kann**.

Vorgabe des CEO (wörtlich, Auszug aus [referenzen/CEO-vorgabe-noch-zu-lesen.txt](referenzen/CEO-vorgabe-noch-zu-lesen.txt)): „Falls im Abschnitt ‚Noch zu lesen‘ aktuell kein einziges Buch vorhanden ist, soll anstelle der Buchliste ein Platzhalter erscheinen. Dieser Platzhalter soll sich gestalterisch am Feld ‚Neue Sammlung‘ im Referenzbild orientieren. Wichtig: Es geht ausschließlich um die Optik des Platzhalters. Die Rubrik ‚Sammlungen‘ selbst soll nicht umgesetzt werden.“ – „Der Platzhalter soll später als Schaltfläche dienen, um ein neues Buch anzulegen. Die genaue Aktion wird mit mir abgestimmt.“

Referenzbild: Feld „Neue Sammlung“ in [referenzen/REQ-002-referenz-hauptnavigation.png](referenzen/REQ-002-referenz-hauptnavigation.png) (nur Optik, Orientierung).

## Anforderung (Satzschablone)

- Wenn dem Abschnitt „Noch zu lesen“ kein Buch zugeordnet ist, muss das System anstelle der Buchliste den Leere-Liste-Platzhalter darstellen.
- Wenn dem Abschnitt mindestens ein Buch zugeordnet ist (auch ohne Buchcover), darf das System den Leere-Liste-Platzhalter nicht darstellen.
- Das System muss den Leere-Liste-Platzhalter als abgerundete, rechteckige Fläche mit gestricheltem Rahmen darstellen (CEO: hell, creme-/beigefarben; Rahmen dezent beigefarben).
- Das System muss in der Fläche mittig ein Pluszeichen darstellen (CEO: „in Bordeauxrot“).
- Das System muss unter dem Pluszeichen einen kurzen Text darstellen: *(Text wird nach Antwort des CEO eingetragen, F2)*.
- Das System muss die Fläche mit großzügigen Innenabständen darstellen (Orientierung am Feld „Neue Sammlung“ im Referenzbild).
- Wenn der Nutzer den Leere-Liste-Platzhalter antippt, muss das System *(Verhalten vorerst nach Antwort des CEO, F3)*. Die spätere Aktion „neues Buch anlegen“ wird gesondert abgestimmt.
- Das System muss alle Farben des Platzhalters über Farbrollen aus zentralen Farbrubriken beziehen. Konkrete Farbwerte sind kein Akzeptanzkriterium.

| Farbrolle | Element | Farbrubrik | Aussage des CEO |
|---|---|---|---|
| Leerplatzhalter-Fläche | Fläche | offen (F6) | „helle, creme- beziehungsweise beigefarbene Fläche“ |
| Leerplatzhalter-Rahmen | gestrichelter Rahmen | offen (F6) | „dezenter beigefarbener Rahmen“ |
| Leerplatzhalter-Plus | Pluszeichen | offen (F6) | „in Bordeauxrot“ |
| Leerplatzhalter-Text | Text unter dem Plus | offen (F6) | – |

## Akzeptanzkriterien

### AK-1 Platzhalter bei leerem Abschnitt
- **Gegeben** dem Abschnitt „Noch zu lesen“ ist kein Buch zugeordnet
- **Wenn** die Seite „Bücher“ angezeigt wird
- **Dann** steht unter der Abschnittsüberschrift statt einer Buchliste der Leere-Liste-Platzhalter
- **Und** er besteht aus einer abgerundeten rechteckigen Fläche mit gestricheltem Rahmen, einem mittigen Pluszeichen und darunter dem abgestimmten Text

### AK-2 Kein Platzhalter, sobald ein Buch da ist
- **Gegeben** dem Abschnitt ist genau ein Buch ohne Buchcover zugeordnet
- **Wenn** die Seite „Bücher“ angezeigt wird
- **Dann** wird der Leere-Liste-Platzhalter nicht angezeigt
- **Und** stattdessen der Bucheintrag mit Cover-Platzhalter und Titel (REQ-010)

### AK-3 Antippen (vorerst)
- **Gegeben** der Leere-Liste-Platzhalter wird angezeigt
- **Wenn** der Nutzer ihn antippt
- **Dann** *(erwartetes Verhalten nach Antwort des CEO, F3)*

### AK-4 Farben aus zentralen Farbrubriken
- **Gegeben** der Wert einer Farbrubrik einer Farbrolle dieses REQ wird an der zentralen Stelle geändert
- **Wenn** der Leere-Liste-Platzhalter angezeigt wird
- **Dann** sind alle Elemente mit dieser Farbrolle im geänderten Wert dargestellt

## Abgrenzung (nicht Teil dieses REQ)

- Die Rubrik „Sammlungen“ (CEO: nicht umsetzen; nur ihre Optik dient als Vorbild).
- Die endgültige Aktion „neues Buch anlegen“ (wird mit dem CEO abgestimmt).
- Cover-Platzhalter für Bücher ohne Cover (REQ-010).
- Konkrete Maße und Farbwerte als Akzeptanzkriterium.

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-009:** Abschnitt „Noch zu lesen“.
- **REQ-010:** abzugrenzender Zustand „Buch ohne Cover“.
- **REQ-005:** Plus-Schaltfläche soll ebenfalls später ein Buch anlegen; beide Wege werden bei der Abstimmung der Aktion gemeinsam betrachtet.

## Offene Fragen

- F2: Text unter dem Pluszeichen.
- F3: Verhalten beim Antippen (vorerst).
- F6: Farbrubriken für Fläche, Rahmen, Plus, Text.
- F7: Priorität.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-09 | Erstellt (Entwurf aus der CEO-Vorgabe „Noch zu lesen“, Abschnitt 6) | Anforderungsmanager |
