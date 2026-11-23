---
id: REQ-096
titel: Blatt „Zu einer Saga / Sammlung / Bibliothek hinzufügen“ mit Mehrfachauswahl, neuer Liste und Band
status: In Umsetzung
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **ein Buch über die Pille einer oder mehreren Listen zuordnen oder dafür eine neue Liste anlegen**, damit **ich es schnell einsortieren kann**.

CEO (wörtlich, 2026-11-23): „3. Bei einem Klick auf eine dieser drei Pillen, öffnet sich von unten ein neues Fenster und ich kann hier entweder eine neue Saga, Sammlung oder Bibliothek anlegen (erstmal nur den Namen), oder das Buch einer bereits angelegten Liste hinzufügen.“ Zur Bandnummer: „Bandnummer ist ein super Hinweis!!“

Vom CEO am 2026-11-23 bestätigtes Konzept, Punkt 3: Das Blatt zeigt nur die Listen dieser Art mit Häkchen, Mehrfachauswahl und „Sichern“. Eine neue Liste wird über „+“ angelegt, nicht über ein dauerhaft sichtbares Eingabefeld (CEO: „um die Übersicht clean zu halten“). Bei Sagas gibt es je angehakter Saga ein optionales Feld „Band“.

## Anforderung (Satzschablone)

- Wenn der Nutzer eine Pille aus REQ-095 antippt, muss das System ein Blatt von unten (Muster wie die übrigen Blätter, z. B. REQ-063) anzeigen. Es enthält alle Listen dieser Art, je mit Namen und einem Häkchen, das sich ein- und ausschalten lässt (Mehrfachauswahl), außerdem ein „+“ und die Pille „Sichern“.
- Gibt es noch keine Liste dieser Art, enthält das Blatt nur „+“ und „Sichern“.
- Wenn der Nutzer „+“ antippt, muss das System ein Eingabefeld für den Namen einer neuen Liste dieser Art anzeigen. Wird ein Name bestätigt, erscheint die neue Liste im Blatt und ist angehakt. Ein leerer Name oder einer nur aus Leerzeichen legt keine Liste an (**Auslegung**). Die Art der Bestätigung legt der Entwickler im Muster der übrigen Blätter fest.
- Nur bei Sagas: Je angehakter Saga muss das System ein optionales Feld „Band“ anzeigen. Gültig sind eine leere Eingabe oder eine ganze Zahl ≥ 1 (**Auslegung**: Zahlenbereich nicht festgelegt). Bei ungültiger Eingabe hebt das System das Feld hervor wie im Blatt „ISBN“ (REQ-063) und speichert nichts.
- Wenn der Nutzer „Sichern“ antippt, muss das System das Buch allen angehakten Listen zuordnen, Bandnummern speichern, neu angelegte Listen dauerhaft speichern und das Blatt schließen.
- Wenn der Nutzer das Blatt auf anderem Weg schließt, muss das System Häkchen, Bandnummern und im Blatt neu angelegte Listen verwerfen (**Auslegung**: analog „Schließen ohne Sichern verwirft“).

## Akzeptanzkriterien

### AK-1 Nur Listen dieser Art
- **Gegeben** es gibt die Sagas „The Empyrean“ und „Crescent City“ und die Sammlung „Lieblingsbücher“
- **Wenn** der Nutzer „+ Zu einer Saga hinzufügen“ antippt
- **Dann** zeigt das Blatt genau „The Empyrean“ und „Crescent City“ mit Häkchen, dazu „+“ und „Sichern“

### AK-2 Mehrfachauswahl und Sichern
- **Gegeben** das Blatt für Sammlungen mit „Lieblingsbücher“ und „Sommer 2026“
- **Wenn** der Nutzer beide anhakt und „Sichern“ antippt
- **Dann** ist das Buch in beiden Sammlungen, und der Abschnitt zeigt die Zeile „In Sammlung“ statt der Pille, auch nach einem Neustart

### AK-3 Neue Liste über „+“
- **Gegeben** das Blatt für Bibliotheken ohne Listen
- **Wenn** der Nutzer „+“ antippt, „Zuhause“ einträgt, bestätigt und „Sichern“ antippt
- **Dann** gibt es die Bibliothek „Zuhause“, und das Buch ist darin

### AK-4 Band bei Sagas
- **Gegeben** das Blatt für Sagas mit „The Empyrean“
- **Wenn** der Nutzer „The Empyrean“ anhakt, bei „Band“ 2 einträgt und „Sichern“ antippt
- **Dann** ist das Buch in „The Empyrean“ mit Band 2
- **Und** bei Sammlungen und Bibliotheken gibt es kein Feld „Band“

### AK-5 Schließen ohne Sichern verwirft
- **Gegeben** im Blatt sind Häkchen gesetzt und über „+“ eine neue Liste angelegt
- **Wenn** der Nutzer das Blatt schließt, ohne „Sichern“ anzutippen
- **Dann** ist das Buch in keiner neuen Liste, und die neue Liste existiert nicht

## Abgrenzung (nicht Teil dieses REQ)

- Herausnehmen aus Listen und Umschalten nach der ersten Zuordnung (REQ-097). Weitere Angaben einer Liste außer dem Namen (CEO: „erstmal nur den Namen“).

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-095, REQ-097, REQ-099, REQ-063** (Blattmuster), **ADR-0002.**

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-23 | Erstellt aus dem vom CEO bestätigten Konzept, Entwurf | Anforderungsmanager |
| 2026-11-23 | Vom CEO bestätigt (wörtlich): „okay, freigegeben. Starte mit dem nächsten Prototypen“. Status „Abgestimmt“ | Anforderungsmanager |
