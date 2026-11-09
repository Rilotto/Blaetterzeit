---
id: REQ-010
titel: Cover-Platzhalter für Bücher ohne Buchcover
status: Entwurf
prioritaet: offen
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **bei einem Buch ohne eigenes Cover ein einheitliches Platzhalter-Cover sehen**, damit **das Buch trotzdem erkennbar in der Liste steht und nicht mit fremden oder generierten Bildern verwechselt wird**.

Vorgabe des CEO (wörtlich, Auszug aus [referenzen/CEO-vorgabe-noch-zu-lesen.txt](referenzen/CEO-vorgabe-noch-zu-lesen.txt)): „In diesem Fall soll nicht das Cover eines anderen Buches oder ein automatisch generiertes Ersatzbild angezeigt werden. Stattdessen erscheint ein von mir bereitgestelltes Buchcover-Platzhalter-Icon. […] Ich werde dir dieses Icon selbst zur Verfügung stellen. Frage mich ausdrücklich danach. […] Die Platzhalterdarstellung muss als wiederverwendbare Komponente umgesetzt werden. Erfinde kein endgültiges Buchcover-Icon und verwende keine beliebigen Icons aus externen Bibliotheken als finalen Ersatz.“

## Anforderung (Satzschablone)

- Wenn ein Buch kein Buchcover hat, muss das System an Stelle des Covers den Cover-Platzhalter darstellen.
- Das System muss den Cover-Platzhalter als Cover-Platzhalterfläche mit dem vom CEO bereitgestellten Buchcover-Platzhalter-Icon darin darstellen.
- Das System muss die Cover-Platzhalterfläche in denselben äußeren Abmessungen darstellen wie ein normales Buchcover an derselben Stelle.
- Das System muss den Buchtitel unterhalb des Cover-Platzhalters genauso darstellen wie unter einem normalen Buchcover.
- Das System darf bei einem Buch ohne Buchcover weder das Cover eines anderen Buches noch ein automatisch generiertes Ersatzbild darstellen.
- Das System darf als endgültiges Buchcover-Platzhalter-Icon ausschließlich das vom CEO bereitgestellte Icon verwenden; weder ein selbst erfundenes Icon noch ein Icon aus einer externen Bibliothek.
- Das System muss den Cover-Platzhalter als wiederverwendbare Einheit bereitstellen, die überall eingesetzt werden kann, wo ein Buchcover dargestellt wird.
- Das System muss die Farbe der Cover-Platzhalterfläche über eine Farbrolle aus einer zentralen Farbrubrik beziehen (Farbrubrik offen, F6). Konkrete Farbwerte sind kein Akzeptanzkriterium.

## Akzeptanzkriterien

### AK-1 Platzhalter statt Cover
- **Gegeben** ein Buch ohne Buchcover im Abschnitt „Noch zu lesen“
- **Wenn** die Seite „Bücher“ angezeigt wird
- **Dann** zeigt sein Bucheintrag die Cover-Platzhalterfläche mit dem Buchcover-Platzhalter-Icon des CEO
- **Und** darunter den tatsächlichen Buchtitel

### AK-2 Gleiche Abmessungen wie ein Cover
- **Gegeben** nebeneinander ein Buch mit und ein Buch ohne Buchcover
- **Wenn** die Buchliste angezeigt wird
- **Dann** haben Cover-Platzhalterfläche und Coverfläche dieselbe Breite und Höhe

### AK-3 Kein fremdes oder generiertes Bild
- **Gegeben** ein Buch ohne Buchcover neben Büchern mit Buchcover
- **Wenn** die Buchliste angezeigt wird
- **Dann** zeigt der Eintrag ohne Buchcover kein Coverbild eines anderen Buches und kein generiertes Bild

### AK-4 Nur das Icon des CEO
- **Gegeben** der Cover-Platzhalter wird angezeigt
- **Wenn** die Herkunft des Icons geprüft wird
- **Dann** ist es die vom CEO bereitgestellte Icon-Datei und stammt nicht aus einer Icon-Bibliothek

### AK-5 Farbe aus zentraler Farbrubrik
- **Gegeben** der Wert der Farbrubrik der Cover-Platzhalterfläche wird an der zentralen Stelle geändert
- **Wenn** ein Cover-Platzhalter angezeigt wird
- **Dann** ist die Cover-Platzhalterfläche im geänderten Wert dargestellt

## Abgrenzung (nicht Teil dieses REQ)

- Darstellung bei leerer Buchliste (REQ-011) – dieser Zustand darf nicht mit dem Cover-Platzhalter verwechselt werden.
- Hinzufügen eines Covers durch den Nutzer.
- Optische Übereinstimmung mit dem Referenzbild als Akzeptanzkriterium.

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-008:** Buchcover ist optional.
- **REQ-009:** Bucheintrag im Abschnitt „Noch zu lesen“.
- **Bereitstellung des Icons durch den CEO (F2):** Ohne das Icon kann dieser REQ nicht abgestimmt werden.

## Offene Fragen

- F2: Buchcover-Platzhalter-Icon des CEO (Datei).
- F6: Farbrubrik der Cover-Platzhalterfläche.
- F7: Priorität.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-09 | Erstellt (Entwurf aus der CEO-Vorgabe „Noch zu lesen“, Abschnitt 5) | Anforderungsmanager |
