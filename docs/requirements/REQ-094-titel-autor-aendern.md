---
id: REQ-094
titel: Buchdetails – Titel und Autor unter dem Cover über ein Blatt ändern, Autor leeren, Platzhalter „unbekannter Autor“
status: In Umsetzung
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **Titel und Autor eines Buches direkt in den Buchdetails ändern, den Autor leeren und einen fehlenden Autor nachtragen**, damit **ich Tippfehler oder falsch übernommene Angaben nachträglich korrigieren kann**.

CEO (wörtlich, 2026-11-23) auf die Frage, wo der Autor nachträglich bearbeitet und geleert werden soll: „Ja, ich möchte den Autor in dem Bereich Buchübersicht mit einem Klick auf den Autor selbst ändern und leeren können (unterhalb des Covers). Den Titel möchte ich an dieser Stelle auch auf die gleiche Art und Weise ändern können.“

Vorher (CEO, wörtlich, 2026-11-23): „Autor und die aktuelle Seite und den Prozentwert und die eigene Rezension sollen leerbar sein.“ Titel und Seitenzahl: „Nein diese bleiben als Pflichtfeld.“

CEO-Antworten (wörtlich, 2026-11-23):
- Zur Art der Eingabe: „Ne so wie bei Verlag. danke“
- Zum Nachtragen eines fehlenden Autors: „dann lass uns hier als Platzhalten "unbekannter Autor" hinschreiben :)“

Mit „Bereich Buchübersicht … unterhalb des Covers“ sind die Buchdetails gemeint, also der Buchtitel unter der Buchdarstellung (REQ-018) und die Autorzeile darunter (REQ-028).

## Anforderung (Satzschablone)

**Blatt (Muster „Verlag“, REQ-063)**
- Wenn der Nutzer in den Buchdetails den Autor unter dem Titel antippt, muss das System ein Blatt nach dem Muster des Blatts „Verlag“ (REQ-063) anzeigen. Es hat ein Textfeld, vorbefüllt mit dem gespeicherten Autor (ohne Autor leer), und die Pille „Sichern“.
- Wenn der Nutzer in den Buchdetails den Buchtitel unter der Buchdarstellung antippt, muss das System ein gleich aufgebautes Blatt mit dem gespeicherten Titel im Feld anzeigen.
- Wenn der Nutzer ein Blatt auf anderem Weg als „Sichern“ schließt, auch mit der Android-Zurück-Taste, muss das System die Eingabe verwerfen (wie REQ-063).

**Autor**
- Wenn der Nutzer „Sichern“ antippt, muss das System den eingetragenen Autor dauerhaft speichern (ADR-0002), das Blatt schließen und den Autor überall anzeigen, wo er erscheint (REQ-028, REQ-037).
- Wenn das Feld beim Sichern leer ist, muss das System den Autor entfernen (REQ-093).
- Hat ein Buch keinen Autor, muss das System in den Buchdetails an der Stelle der Autorzeile den Platzhalter „unbekannter Autor“ anzeigen, statt die Zeile wegzulassen. Antippt der Nutzer den Platzhalter, öffnet sich das Blatt mit leerem Feld. So kann er einen Autor nachtragen.
- Der Platzhalter ist kein gespeicherter Autor.

**Titel**
- Wenn der Nutzer „Sichern“ mit einem gültigen Titel antippt, muss das System ihn dauerhaft speichern, das Blatt schließen und den neuen Titel überall anzeigen, wo der Titel erscheint, zum Beispiel in den Buchlisten (REQ-009, REQ-035, REQ-037), im Bereich „Cover“ ohne Bild (REQ-014) und in der 3D-Ansicht (REQ-074).
- Der Titel bleibt Pflichtangabe. Ist das Feld leer oder enthält es nur Leerzeichen, darf das System nichts speichern. Es muss das Feld so hervorheben wie das ungültige Feld im Blatt „ISBN“ (REQ-063: Primär, kein Hinweistext, bis der Nutzer etwas im Feld ändert) und das Blatt geöffnet lassen.

## Akzeptanzkriterien

### AK-1 Autor ändern
- **Gegeben** ein Buch mit Autor „Ann Leckie“
- **Wenn** der Nutzer in den Buchdetails den Autor antippt
- **Dann** ist ein Blatt mit „Ann Leckie“ im Feld und der Pille „Sichern“ geöffnet
- **Und wenn** er „Anne Leckie“ einträgt und „Sichern“ antippt, ist das Blatt geschlossen, und die Autorzeile zeigt „Anne Leckie“, auch nach einem Neustart

### AK-2 Autor leeren zeigt den Platzhalter
- **Gegeben** ein Buch mit Autor „Ann Leckie“
- **Wenn** der Nutzer den Autor antippt, das Feld mit der Löschtaste leert und „Sichern“ antippt
- **Dann** hat das Buch keinen Autor, und unter dem Titel steht „unbekannter Autor“, auch nach einem Neustart

### AK-3 Autor nachtragen über den Platzhalter
- **Gegeben** ein Buch ohne Autor, unter dem Titel steht „unbekannter Autor“
- **Wenn** der Nutzer „unbekannter Autor“ antippt
- **Dann** öffnet sich das Blatt mit leerem Feld
- **Und wenn** er „Ann Leckie“ einträgt und „Sichern“ antippt, zeigt die Autorzeile „Ann Leckie“

### AK-4 Titel ändern
- **Gegeben** ein Buch mit Titel „Der Testroman“
- **Wenn** der Nutzer in den Buchdetails den Titel antippt, „Der Testroman, Band 2“ einträgt und „Sichern“ antippt
- **Dann** zeigen die Buchdetails und der Bucheintrag auf der Seite „Bücher“ „Der Testroman, Band 2“, auch nach einem Neustart

### AK-5 Titel darf nicht leer sein
- **Gegeben** das Blatt zum Titel „Der Testroman“ ist geöffnet
- **Wenn** der Nutzer das Feld leert bzw. (zweiter Durchlauf) nur Leerzeichen einträgt und „Sichern“ antippt
- **Dann** ist das Feld in Primär hervorgehoben, ohne Hinweistext, das Blatt bleibt geöffnet, und der Titel bleibt „Der Testroman“

### AK-6 Schließen ohne Sichern verwirft
- **Gegeben** im Blatt zu Titel bzw. Autor ist ein geänderter Wert eingetragen
- **Wenn** der Nutzer das Blatt schließt, ohne „Sichern“ anzutippen
- **Dann** sind Titel und Autor unverändert

## Abgrenzung (nicht Teil dieses REQ)

- Titel und Autor beim Anlegen (REQ-030, REQ-031, REQ-060).
- Platzhalter „unbekannter Autor“ in Buchlisten: Der CEO hat ihn nur für die Buchdetails festgelegt („hier“). Die Autorzeile der Listen bleibt unverändert (REQ-037).
- Leeren übriger Felder (REQ-093).

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-028:** Die Annahme „Hat ein Buch keinen Autor, entfällt die Autorzeile“ wird mit Umsetzung dieses REQ abgelöst. Künftig steht dort „unbekannter Autor“. Der Status ist „Implementiert“, nicht eingefroren, deshalb ist kein `ersetzt` nötig. REQ-028 wird nach der Bestätigung nachgezogen.
- **REQ-018:** Der Titel wird antippbar. Seine Darstellung bleibt unverändert.
- **REQ-063** (Muster des Blatts), **REQ-008, REQ-034, REQ-093, ADR-0002.**
- **REQ-014 / REQ-074:** nicht betroffen, weil nur Titel und Autor unter der Buchdarstellung antippbar werden.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-23 | Erstellt aus CEO-Antwort vom 2026-11-23, Entwurf | Anforderungsmanager |
| 2026-11-23 | CEO-Antworten eingearbeitet: Blatt wie bei „Verlag“; ohne Autor steht der Platzhalter „unbekannter Autor“, antippbar zum Nachtragen. Ein leerer Titel wird wie eine ungültige ISBN hervorgehoben (Ableitung aus dem Blatt-Muster). AK-1 bis AK-6 neu gefasst. Keine offenen Fragen. Status Entwurf | Anforderungsmanager |
| 2026-11-23 | Vom CEO bestätigt (wörtlich): „okay, freigegeben. Starte mit dem nächsten Prototypen“. Status „Abgestimmt“ | Anforderungsmanager |
