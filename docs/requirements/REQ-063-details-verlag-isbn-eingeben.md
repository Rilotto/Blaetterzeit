---
id: REQ-063
titel: Reiter „Details“ – Verlag und ISBN über ein Blatt eingeben
status: Implementiert
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **Verlag und ISBN eines Buches eingeben**, damit **sie in der Karte „Ausgabe“ stehen**.

CEO (wörtlich, 2026-11-16, zur Frage nach Verlag, ISBN und Fotos): „ja bis auf Fotos.“ Gilt beim Anlegen (REQ-060) und im Reiter „Details“.
CEO (wörtlich, 2026-11-16, zur Eingabe in den Details): „mache mir einen Vorschlag“.

Vom CEO angenommener Vorschlag des Scrum Masters: Verlag → Blatt wie „Preis“ mit Textfeld und „Sichern“. ISBN → gleiches Blatt mit Ziffern; ungültig (nicht 10/13 Stellen oder Prüfziffer falsch) → Feld kurz rot umrandet, nicht gesichert. Schließen ohne Sichern verwirft.

Bestätigung des CEO (2026-11-16): „passt alles für mich. bitte für den nächsten Sprint planen.“

Bisher (CEO, 2026-11-15, REQ-056): Verlag und ISBN „aktuell leer, bitte ohne Eingabe“. Dieser REQ ändert das; „Fotos“ bleibt ohne Funktion.

## Anforderung (Satzschablone)

**Verlag**
- Wenn der Nutzer im Reiter „Details“ die Zeile „Verlag“ antippt, muss das System ein Blatt nach dem Muster des Menüs „Preis“ (REQ-059) mit einem Textfeld und der Pille „Sichern“ anzeigen; ein vorhandener Verlag steht im Feld.
- Wenn der Nutzer „Sichern“ antippt, muss das System den Verlag dauerhaft speichern, das Blatt schließen und den Verlag in der Zeile „Verlag“ anzeigen.

**ISBN**
- Wenn der Nutzer die Zeile „ISBN“ antippt, muss das System ein gleich aufgebautes Blatt anzeigen, dessen Feld nur Ziffern annimmt, zusätzlich „X“ als letzte Stelle einer 10-stelligen ISBN (Prüfziffer 10). Eine vorhandene ISBN steht im Feld.
- Eine ISBN ist gültig, wenn sie 10 oder 13 Stellen hat und ihre Prüfziffer stimmt. Ein leeres Feld ist nicht ungültig: Sichern entfernt Verlag bzw. ISBN (REQ-093).
- Wenn der Nutzer „Sichern“ antippt und die ISBN ungültig ist, muss das System das Feld so hervorheben wie das ungültige Feld „JAHR“ (REQ-031: Primär, kein Hinweistext, bis der Nutzer etwas im Feld ändert), nichts speichern und das Blatt geöffnet lassen.
- Wenn die ISBN gültig ist, muss das System sie bei „Sichern“ dauerhaft speichern, das Blatt schließen und sie in der Zeile „ISBN“ anzeigen.

**Schließen**
- Wenn der Nutzer eines der Blätter auf anderem Weg als „Sichern“ schließt (wie beim Menü „Preis“), muss das System die Eingabe verwerfen.
- Die Android-Zurück-Taste muss jedes der Blätter schließen und die Eingabe verwerfen, wie bei den anderen Blättern.

**Fotos**
- Die Zeile „Fotos“ bleibt ohne Funktion.

## Akzeptanzkriterien

### AK-1 Verlag eingeben
- **Gegeben** ein Buch ohne Verlag, der Reiter „Details“ ist geöffnet
- **Wenn** der Nutzer „Verlag“ antippt, „Carlsen“ einträgt und „Sichern“ antippt
- **Dann** zeigt die Zeile „Verlag“ „Carlsen“
- **Und** nach einem Neustart der App ist der Verlag unverändert vorhanden

### AK-2 Gültige ISBN eingeben
- **Gegeben** ein Buch ohne ISBN
- **Wenn** der Nutzer „ISBN“ antippt, 9783551551672 einträgt und „Sichern“ antippt
- **Dann** zeigt die Zeile „ISBN“ diese ISBN
- **Und** nach einem Neustart der App ist sie unverändert vorhanden

### AK-3 ISBN nimmt nur Ziffern an, bei ISBN-10 „X“ an letzter Stelle
- **Gegeben** das Blatt „ISBN“ ist geöffnet
- **Wenn** der Nutzer „978-3a“ eingibt
- **Dann** enthält das Feld nur „9783“
- **Und** gibt der Nutzer 080442957X ein und tippt „Sichern“ an, wird diese ISBN-10 gespeichert und in der Zeile „ISBN“ angezeigt

### AK-4 Ungültige ISBN wird nicht gesichert
- **Gegeben** im Blatt „ISBN“ steht 9783551551670 (Prüfziffer falsch) bzw. 12345 (falsche Länge)
- **Wenn** der Nutzer „Sichern“ antippt
- **Dann** ist das Feld in Primär hervorgehoben, ohne Hinweistext
- **Und** das Blatt bleibt geöffnet und es wurde nichts gespeichert

### AK-5 Hervorhebung endet bei Änderung
- **Gegeben** das Feld im Blatt „ISBN“ ist hervorgehoben
- **Wenn** der Nutzer etwas im Feld ändert
- **Dann** ist es nicht mehr hervorgehoben

### AK-6 Schließen ohne Sichern verwirft
- **Gegeben** das Blatt „Verlag“ ist geöffnet und „Carlsen“ eingetragen
- **Wenn** der Nutzer es schließt, ohne „Sichern“ anzutippen, auch über die Android-Zurück-Taste
- **Dann** ist das Blatt geschlossen und der vorherige Verlag unverändert
- **Und** dasselbe gilt für das Blatt „ISBN“: Die Android-Zurück-Taste schließt es, und die ISBN bleibt unverändert

### AK-7 Fotos bleibt ohne Funktion
- **Gegeben** der Reiter „Details“ ist geöffnet
- **Wenn** der Nutzer die Zeile „Fotos“ antippt
- **Dann** ändert sich nichts

## Abgrenzung (nicht Teil dieses REQ)

- Eingabe beim Anlegen (REQ-060), Übernahme aus dem Scan (REQ-062).
- „Hinzugefügt“ (REQ-064). Funktion „Fotos“ (To-do-Liste).

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-056:** Zeilen „Verlag“ und „ISBN“ waren dort ohne Eingabe; das ändert sich mit Umsetzung dieses REQ.
- **REQ-059:** Muster des Blatts. **REQ-031:** Muster der Hervorhebung. **REQ-034:** dauerhafte Speicherung.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-16 | Erstellt (Entwurf aus der CEO-Antwort zum Änderungsantrag „Buch anlegen“) | Anforderungsmanager |
| 2026-11-16 | Vom CEO angenommenen Vorschlag eingearbeitet (Blätter für Verlag und ISBN, Prüfung der ISBN). „Hinzugefügt“ in REQ-064 ausgelagert. Status „Abgestimmt“ (CEO: „passt alles für mich. bitte für den nächsten Sprint planen.“) | Anforderungsmanager |
| 2026-11-18 | Android-Zurück-Taste ergänzt (schließt die Blätter Verlag und ISBN und verwirft die Eingabe), AK-6 erweitert. Anlass ist Befund 3 des Testers, beauftragt vom Scrum Master. Status unverändert | Anforderungsmanager |
| 2026-11-18 | AK-3 und Anforderung angepasst: Bei ISBN-10 ist „X“ an letzter Stelle erlaubt (Prüfziffer 10). Der Scrum Master hat seinen eigenen, vom CEO angenommenen Vorschlag „nur Ziffern“ korrigiert (sprints/sprint-06/plan.md, „Hinweise / kleine Klärungen“). Status unverändert | Anforderungsmanager |
| 2026-11-23 | An REQ-093 angepasst (Abgestimmt, CEO: „okay, freigegeben. Starte mit dem nächsten Prototypen“): Ein leeres Feld ist nicht ungültig, Sichern entfernt die Angabe. Nur Anforderungstext geändert, AKs unverändert. Status unverändert | Anforderungsmanager |
