---
id: REQ-010
titel: Cover-Platzhalter für Bücher ohne Buchcover
status: Abgestimmt
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **bei einem Buch ohne eigenes Cover ein einheitliches Platzhalter-Cover sehen**, damit **das Buch trotzdem erkennbar in der Liste steht und nicht mit fremden oder generierten Bildern verwechselt wird**.

Vorgabe des CEO (wörtlich, Auszug aus [referenzen/CEO-vorgabe-noch-zu-lesen.txt](referenzen/CEO-vorgabe-noch-zu-lesen.txt)): „In diesem Fall soll nicht das Cover eines anderen Buches oder ein automatisch generiertes Ersatzbild angezeigt werden. Stattdessen erscheint ein von mir bereitgestelltes Buchcover-Platzhalter-Icon. […] Die Platzhalterdarstellung muss als wiederverwendbare Komponente umgesetzt werden. Erfinde kein endgültiges Buchcover-Icon und verwende keine beliebigen Icons aus externen Bibliotheken als finalen Ersatz.“

Vom CEO bereitgestelltes Icon (2026-11-09): [referenzen/icons/icon-herz.png](referenzen/icons/icon-herz.png) (Herz-Icon, 512×512 px, schwarze Linie auf transparentem Grund). CEO: „verwende bitte das Herz, färbe es bordeaux ein“; auf Rückfrage gilt das Herz „für beides“ (Cover-Platzhalter und Leere-Liste-Platzhalter, REQ-011).

## Anforderung (Satzschablone)

- Wenn ein Buch kein Buchcover hat, muss das System an Stelle des Covers den Cover-Platzhalter darstellen.
- Das System muss den Cover-Platzhalter als Cover-Platzhalterfläche mit dem Herz-Icon des CEO darin darstellen.
- Das System muss die Cover-Platzhalterfläche in denselben äußeren Abmessungen darstellen wie ein normales Buchcover an derselben Stelle.
- Das System muss das Herz-Icon selbst in der Farbe seiner Farbrolle einfärben (wie die Icons der Hauptnavigation, REQ-002).
- Das System muss im Bucheintrag unterhalb des Cover-Platzhalters den tatsächlichen Buchtitel genauso darstellen wie unter einem normalen Buchcover (REQ-009).
- Das System darf bei einem Buch ohne Buchcover weder das Cover eines anderen Buches noch ein automatisch generiertes Ersatzbild darstellen.
- Das System darf als Buchcover-Platzhalter-Icon ausschließlich das vom CEO bereitgestellte Herz-Icon verwenden; weder ein selbst erfundenes Icon noch ein Icon aus einer externen Bibliothek.
- Das System muss den Cover-Platzhalter als wiederverwendbare Einheit bereitstellen, die überall eingesetzt werden kann, wo ein Buchcover dargestellt wird, auch ohne darunterstehenden Buchtitel (Verwendung in REQ-012).
- Das System muss alle Farben des Cover-Platzhalters über Farbrollen aus zentralen Farbrubriken beziehen. Konkrete Farbwerte sind kein Akzeptanzkriterium.

| Farbrolle | Element | Farbrubrik | Aussage des CEO |
|---|---|---|---|
| Coverplatzhalter-Fläche | Cover-Platzhalterfläche | Ghost | Rückfrage-Ergebnis 2026-11-09 |
| Coverplatzhalter-Icon | Herz-Icon | Primär | „färbe es bordeaux ein“ |

## Akzeptanzkriterien

### AK-1 Platzhalter statt Cover
- **Gegeben** ein Buch ohne Buchcover im Abschnitt „Noch zu lesen“
- **Wenn** die Seite „Bücher“ angezeigt wird
- **Dann** zeigt sein Bucheintrag die Cover-Platzhalterfläche mit dem Herz-Icon des CEO
- **Und** darunter den tatsächlichen Buchtitel

### AK-2 Gleiche Abmessungen wie ein Cover
- **Gegeben** nebeneinander ein Buch mit und ein Buch ohne Buchcover
- **Wenn** die Buchliste angezeigt wird
- **Dann** haben Cover-Platzhalterfläche und Coverfläche dieselbe Breite und Höhe

### AK-3 Kein fremdes oder generiertes Bild
- **Gegeben** ein Buch ohne Buchcover neben Büchern mit Buchcover
- **Wenn** die Buchliste angezeigt wird
- **Dann** zeigt der Eintrag ohne Buchcover kein Coverbild eines anderen Buches und kein generiertes Bild

### AK-4 Nur das Herz-Icon des CEO
- **Gegeben** der Cover-Platzhalter wird angezeigt
- **Wenn** die Herkunft des Icons geprüft wird
- **Dann** ist es die vom CEO bereitgestellte Datei `icon-herz.png` und stammt nicht aus einer Icon-Bibliothek

### AK-5 Farben: Fläche Ghost, Herz Primär
- **Gegeben** der Cover-Platzhalter wird angezeigt
- **Wenn** Fläche und Herz-Icon betrachtet werden
- **Dann** ist die Fläche in der Farbe der Farbrubrik „Ghost“ dargestellt
- **Und** das Herz-Icon in der Farbe der Farbrubrik „Primär“

### AK-6 Farben aus zentralen Farbrubriken
- **Gegeben** der Wert der Farbrubrik „Ghost“ oder „Primär“ wird an der zentralen Stelle geändert
- **Wenn** ein Cover-Platzhalter angezeigt wird
- **Dann** sind die Elemente mit der zugehörigen Farbrolle im geänderten Wert dargestellt

## Abgrenzung (nicht Teil dieses REQ)

- Darstellung bei leerer Buchliste (REQ-011) – dieser Zustand darf nicht mit dem Cover-Platzhalter verwechselt werden.
- Hinzufügen eines Covers durch den Nutzer.
- Optische Übereinstimmung mit dem Referenzbild als Akzeptanzkriterium.

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-008:** Buchcover ist optional.
- **REQ-009:** Bucheintrag im Abschnitt „Noch zu lesen“, Buchtitelfarbe.
- **REQ-006:** Farbrubrik „Ghost“.
- **REQ-011, REQ-012:** verwenden dasselbe Herz-Icon bzw. die Komponente.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-09 | Erstellt (Entwurf aus der CEO-Vorgabe „Noch zu lesen“, Abschnitt 5) | Anforderungsmanager |
| 2026-11-09 | CEO-Antworten eingearbeitet: F2 Herz-Icon des CEO, bordeaux eingefärbt. F6 Fläche Ghost, Herz Primär (AK-5 präzisiert, neu AK-6). Wiederverwendbarkeit ohne Titel für REQ-012 ergänzt. F7 Must. Vom CEO bestätigt 2026-11-09, Status „Abgestimmt“ | Anforderungsmanager |
