---
id: REQ-009
titel: Seite „Bücher“ – Abschnitt „Noch zu lesen“ mit horizontaler Buchliste
status: Entwurf
prioritaet: offen
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **auf der Seite „Bücher“ unter der Filterleiste den Abschnitt „Noch zu lesen“ mit meinen noch zu lesenden Büchern sehen**, damit **ich auf einen Blick erkenne, welche Bücher noch vor mir liegen**.

Vorgabe des CEO (wörtlich, vollständig): [referenzen/CEO-vorgabe-noch-zu-lesen.txt](referenzen/CEO-vorgabe-noch-zu-lesen.txt). Dazu im Chat (wörtlich): „Ich möchte eine weitere Funktion einbinden, bevor der nächste Prototyp gebaut wird. Im Referenzbild gibt es den Abschnitt 'noch zu lesen', 'Saga' und 'Sammlung'. Die Abschnittsüberschriften sollen wie im Screenshot sein, mit der Farbe wie der große Titel 'Deine Bücher'.“

Referenzbild: [referenzen/REQ-002-referenz-hauptnavigation.png](referenzen/REQ-002-referenz-hauptnavigation.png). CEO: „Orientiere dich dabei eng an der Darstellung im Referenzbild.“ Die optische Übereinstimmung prüft der CEO im Prototyp; sie ist kein Akzeptanzkriterium.

## Anforderung (Satzschablone)

**Abschnitt und Überschrift**
- Das System muss auf der Seite „Bücher“ unterhalb der Filterleiste (REQ-006) den Abschnitt „Noch zu lesen“ darstellen.
- Das System muss die Abschnittsüberschrift „Noch zu lesen“ linksbündig in großer Schrift darstellen (Größe und Schriftstärke: Orientierung am Referenzbild).
- Das System muss die Abschnittsüberschrift in der Farbrolle „Abschnittsüberschriftfarbe“ darstellen, die ihren Wert aus der Farbrubrik „Tertiär“ bezieht (CEO: „mit der Farbe wie der große Titel 'Deine Bücher'“, REQ-005).
- Das System muss rechts neben der Abschnittsüberschrift den Text „Alle ansehen ›“ dezent darstellen (CEO: „dezenter bordeauxfarbener Text“; Farbrubrik offen, F6).

**Buchauswahl**
- Das System muss im Abschnitt „Noch zu lesen“ alle Bücher anzeigen, deren Lesestatus (REQ-008) dem Abschnitt „Noch zu lesen“ zugeordnet ist.
- Das System muss die Zuordnung „Lesestatus → Abschnitt ‚Noch zu lesen‘“ an genau einer zentralen Stelle festlegen, getrennt von der Darstellung.
- Das System muss die Zuordnung ausschließlich mit den vom CEO festgelegten Lesestatus vorbelegen *(Werte werden nach Antwort des CEO eingetragen, F1)*.
- Die Zuordnung wird in der Entwicklung gepflegt (CEO über den Chat). Ob der Nutzer sie in der App ändern kann, ist nicht Teil dieses REQ.
- Das System darf die Anzahl der angezeigten Bücher nicht begrenzen.

**Horizontale Buchliste**
- Das System muss die Bücher des Abschnitts nebeneinander in einer horizontal wischbaren Liste darstellen; weitere Bücher erscheinen rechts neben dem vorherigen.
- Das System muss die Buchliste unabhängig von der Filterleiste horizontal scrollbar machen.
- Das System muss zwischen benachbarten Bucheinträgen gleiche Abstände darstellen.
- Das System muss beim Scrollen der Buchliste das übrige Layout der Seite unverändert lassen.

**Bucheintrag**
- Das System muss jeden Bucheintrag aus dem Buchcover und dem Buchtitel direkt darunter darstellen.
- Das System muss das Buchcover hochformatig, mit leicht abgerundeten Ecken und dezentem Schatten darstellen (Seitenverhältnis ähnlich einem echten Buchcover).
- Das System muss alle Buchcover der Liste in derselben Darstellungsgröße darstellen.
- Das System muss Coverbilder unter Beibehaltung ihrer Proportionen in die Coverfläche einpassen; ein Coverbild darf nicht verzerrt werden.
- Wenn ein Buch kein Buchcover hat, muss das System an Stelle des Covers den Cover-Platzhalter (REQ-010) darstellen.
- Das System muss den Buchtitel linksbündig darstellen.
- Das System muss den Buchtitel höchstens so breit wie das Cover darstellen.
- Das System muss lange Buchtitel automatisch umbrechen und höchstens zwei Zeilen darstellen.
- Wenn ein Buchtitel mehr als zwei Zeilen benötigt, muss das System ihn nach der zweiten Zeile mit Auslassungspunkten abschneiden.
- Das System darf durch einen langen Buchtitel benachbarte Bucheinträge weder verschieben noch überlagern.
- Das System muss den Buchtitel in der Farbrolle „Buchtitelfarbe“ darstellen (Farbrubrik offen, F6).

**Leere Liste**
- Wenn dem Abschnitt „Noch zu lesen“ kein Buch zugeordnet ist, muss das System anstelle der Buchliste den Leere-Liste-Platzhalter (REQ-011) darstellen.

**Farben**
- Das System muss alle Farben dieses REQ über Farbrollen aus zentral definierten Farbrubriken beziehen (REQ-002; CLAUDE.md „Farben auf Zuruf“). Konkrete Farbwerte sind kein Akzeptanzkriterium.

| Farbrolle | Element | Farbrubrik | Aussage des CEO |
|---|---|---|---|
| Abschnittsüberschriftfarbe | Überschrift „Noch zu lesen“ | Tertiär | „Farbe wie der große Titel 'Deine Bücher'“ |
| Alle-ansehen-Farbe | Text „Alle ansehen ›“ | offen (F6) | „dezenter bordeauxfarbener Text“ |
| Buchtitelfarbe | Buchtitel unter dem Cover | offen (F6) | – |

**Orientierung am Referenzbild (kein Akzeptanzkriterium)**
Schriftgröße und -stärke von Abschnittsüberschrift, „Alle ansehen ›“ und Buchtitel, Covergröße, Abstand Titel–Cover, Abstände zwischen den Büchern und äußere Seitenabstände orientieren sich am Referenzbild. Messwerte kann der Scrum Master hier ergänzen; sie bleiben Orientierung.

## Akzeptanzkriterien

### AK-1 Abschnitt unter der Filterleiste
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** der Bereich unterhalb der Filterleiste betrachtet wird
- **Dann** steht dort links die Abschnittsüberschrift „Noch zu lesen“
- **Und** rechts daneben der Text „Alle ansehen ›“

### AK-2 Abschnittsüberschrift in der Farbrubrik Tertiär
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** die Abschnittsüberschrift „Noch zu lesen“ betrachtet wird
- **Dann** ist sie in der Farbe der Farbrubrik „Tertiär“ dargestellt (dieselbe wie „Deine Bücher“, REQ-005)

### AK-3 Nur zugeordnete Bücher
- **Gegeben** Bücher mit verschiedenen Lesestatus, von denen nur ein Teil dem Abschnitt „Noch zu lesen“ zugeordnet ist
- **Wenn** die Seite „Bücher“ angezeigt wird
- **Dann** zeigt der Abschnitt genau die Bücher mit zugeordnetem Lesestatus

### AK-4 Zuordnung zentral änderbar
- **Gegeben** die zentrale Zuordnung „Lesestatus → Abschnitt ‚Noch zu lesen‘“ wird um einen Lesestatus erweitert oder verringert
- **Wenn** die Seite „Bücher“ angezeigt wird
- **Dann** zeigt der Abschnitt entsprechend zusätzlich bzw. nicht mehr die Bücher mit diesem Lesestatus
- **Und** dafür war außerhalb der zentralen Zuordnung keine Änderung nötig

### AK-5 Keine Begrenzung der Anzahl
- **Gegeben** dem Abschnitt sind 25 Bücher zugeordnet
- **Wenn** die Buchliste vollständig horizontal durchgewischt wird
- **Dann** sind alle 25 Bücher nacheinander erreichbar

### AK-6 Horizontal wischbar, unabhängig von der Filterleiste
- **Gegeben** dem Abschnitt sind mehr Bücher zugeordnet, als in die Bildschirmbreite passen
- **Wenn** der Nutzer in der Buchliste horizontal wischt
- **Dann** verschiebt sich nur die Buchliste
- **Und** die Filterleiste und der übrige Seiteninhalt bleiben unverändert

### AK-7 Einheitliche Covergröße ohne Verzerrung
- **Gegeben** Bücher mit Coverbildern unterschiedlicher Seitenverhältnisse
- **Wenn** die Buchliste angezeigt wird
- **Dann** haben alle Coverflächen dieselbe Breite und Höhe
- **Und** die Höhe jeder Coverfläche ist größer als ihre Breite
- **Und** kein Coverbild ist verzerrt

### AK-8 Buchtitel unter dem Cover
- **Gegeben** ein Buch mit kurzem Titel
- **Wenn** sein Bucheintrag angezeigt wird
- **Dann** steht der Titel linksbündig direkt unter dem Cover

### AK-9 Langer Titel: zwei Zeilen, Auslassungspunkte, Coverbreite
- **Gegeben** ein Buch, dessen Titel in Coverbreite mehr als zwei Zeilen benötigt
- **Wenn** sein Bucheintrag angezeigt wird
- **Dann** ist der Titel umgebrochen und auf zwei Zeilen begrenzt
- **Und** endet mit Auslassungspunkten
- **Und** ist nicht breiter als das Cover

### AK-10 Langer Titel beeinflusst Nachbarn nicht
- **Gegeben** zwei benachbarte Bucheinträge, einer mit sehr langem, einer mit kurzem Titel
- **Wenn** die Buchliste angezeigt wird
- **Dann** überlagern sich die Einträge nicht
- **Und** Position und Größe des Nachbarcovers sind dieselben wie neben einem Eintrag mit kurzem Titel

### AK-11 Gleiche Abstände
- **Gegeben** mindestens drei Bücher in der Buchliste
- **Wenn** die Abstände zwischen benachbarten Bucheinträgen verglichen werden
- **Dann** sind sie gleich

### AK-12 Buch ohne Cover vs. keine Bücher
- **Gegeben** dem Abschnitt ist genau ein Buch ohne Buchcover zugeordnet
- **Wenn** die Seite „Bücher“ angezeigt wird
- **Dann** zeigt der Abschnitt einen Bucheintrag mit dem Cover-Platzhalter (REQ-010) und dem tatsächlichen Titel
- **Und** der Leere-Liste-Platzhalter (REQ-011) wird nicht angezeigt

### AK-13 Farben aus den zentralen Farbrubriken
- **Gegeben** der Wert der Farbrubrik einer Farbrolle dieses REQ wird an der zentralen Stelle geändert
- **Wenn** die Seite „Bücher“ angezeigt wird
- **Dann** sind alle Elemente mit dieser Farbrolle im geänderten Wert dargestellt

## Abgrenzung (nicht Teil dieses REQ)

- Abschnitte „Saga“ und „Sammlung(en)“ aus dem Referenzbild (CEO: „Die Rubrik ‚Sammlungen‘ selbst soll nicht umgesetzt werden“; zu „Saga“ siehe F4).
- Darstellung eines Buches ohne Cover im Detail (REQ-010) und der leeren Liste (REQ-011).
- Anlegen von Büchern, Buchdetails, Antippen eines Bucheintrags.
- Zusammenspiel mit der Filterlogik (REQ-007).
- Konkrete Maße, Schriftgrößen und Farbwerte als Akzeptanzkriterium.

## Qualitätsanforderungen

- Scrollverhalten „natürlich und flüssig“ (CEO): Prüfung durch den CEO im Prototyp, kein messbares Kriterium vorgegeben.

## Abhängigkeiten

- **REQ-005:** Bereich unterhalb der Filterleiste (wird angepasst, siehe dort); Farbrubrik der Überschrift „Deine Bücher“.
- **REQ-006:** Filterleiste, unabhängiges Scrollen.
- **REQ-008:** Buchdaten und Lesestatus.
- **REQ-010:** Cover-Platzhalter. **REQ-011:** Leere-Liste-Platzhalter.
- **REQ-003:** Alle Texte in der App-Schrift.

## Offene Fragen

- F1: Welche Lesestatus gehören zu „Noch zu lesen“?
- F3: Was passiert vorerst beim Antippen von „Alle ansehen ›“?
- F4: „Saga“ und „Sammlung“ jetzt schon anzeigen?
- F5: Welche Bücher zeigt der Prototyp?
- F6: Farbrubriken für „Alle ansehen ›“ und Buchtitel.
- F7: Priorität.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-09 | Erstellt (Entwurf aus der CEO-Vorgabe „Noch zu lesen“ und der Chat-Aussage zu den Abschnittsüberschriften) | Anforderungsmanager |
