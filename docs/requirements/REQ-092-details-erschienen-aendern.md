---
id: REQ-092
titel: „Erschienen“ – im Reiter „Details“ über ein Datumsblatt ändern und leeren, Feld „Jahr“ entfällt
status: Implementiert
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **die Angabe „Erschienen“ in der Karte „Ausgabe“ bearbeiten und wieder leeren, und zwar als einzige Erscheinungsangabe**, damit **ich sie nach dem Anlegen eintragen, korrigieren oder entfernen kann, ohne doppelte Felder für Jahr und Datum**.

CEO (wörtlich, 2026-11-23) auf die Frage, ob „Erschienen“ bearbeitbar werden soll: „nein ich möchte das auch bearbeiten können. Übernehme hier das template von Hinzugefügt.“ Gemeint ist: ja, bearbeitbar, mit einem Datumsblatt wie bei „Hinzugefügt“ (REQ-064).

CEO-Antworten (wörtlich, 2026-11-23), Runde 1, zu Datum oder Jahr (1), Format, Genauigkeit und Zukunft (2) sowie Leeren (3):
„1. wie bei Hinzugefügt
2. wie bei Hinzugefügt
3. Ja, ich möchte alles wieder leeren können, indem ich das Feld einfach mit der Löschen Taste leere. Soll für alle Text und Zahlenfelder gelten.“

CEO-Antworten (wörtlich, 2026-11-23), Runde 2:
- Zur Frage, was die Zeile bei einem Buch mit Jahr, aber ohne Datum zeigt: „wenn ich keinen monat angeben habe, soll nur das Jahr angezeigt werden“
- Zur Frage, ob das Feld „JAHR“ neben „Erschienen“ bestehen bleibt: „beide machen an der Stelle jetzt keinen Sinn mehr. Streiche Jahr raus.“

CEO-Antwort (wörtlich, 2026-11-23), Runde 3, zur Frage, ob man auch nur ein Jahr eintragen kann: „man soll auch nur das Jahr eintragen können. Je nachdem was vorliegt.“

## Anforderung (Satzschablone)

**Eine Erscheinungsangabe „Erschienen“**
- „Erschienen“ ist die einzige Erscheinungsangabe eines Buches. Sie ist entweder ein vollständiges Datum (Erscheinungsdatum, REQ-033) oder nur ein Jahr (Erscheinungsjahr), je nachdem, was vorliegt.
- Das System darf im Blatt „Manueller Eintrag“ kein Feld „JAHR“ mehr anzeigen. Die Erscheinungsangabe wird dort nur noch über „Erschienen“ eingegeben (REQ-060), und zwar mit denselben Eingabe- und Prüfregeln wie im Datumsblatt unten.
- Liefert der Barcode-Scan (REQ-062) ein vollständiges Datum, übernimmt das System es in „Erschienen“ als TT.MM.JJJJ. Liefert er nur ein Jahr, übernimmt das System es als JJJJ.

**Anzeige in der Zeile „Erschienen“**
- Mit Erscheinungsdatum muss die Zeile das Datum im Format von „Hinzugefügt“ zeigen (abgekürzter Monat mit Punkt und Jahr, z. B. „Feb. 2025“). Hat ein Buch auch ein Jahr, hat das Datum Vorrang.
- Mit Erscheinungsjahr ohne Datum muss die Zeile nur das Jahr zeigen, zum Beispiel „2019“. Das gilt auch für bereits gespeicherte Jahr-Werte, die erhalten bleiben.
- Ohne Erscheinungsangabe ist die Zeile rechts leer (REQ-056).

**Datumsblatt im Reiter „Details“**
- Wenn der Nutzer im Reiter „Details“ die Zeile „Erschienen“ antippt, muss das System ein Datumsblatt nach dem Muster des Blatts „Hinzugefügt“ (REQ-064) mit einem Feld und der Pille „Sichern“ anzeigen. Das Feld ist vorbefüllt mit dem gespeicherten Datum als TT.MM.JJJJ, ohne Datum mit dem gespeicherten Jahr als JJJJ, ohne beides leer.
- Gültig ist ein existierendes Kalenderdatum im Format TT.MM.JJJJ, das nicht in der Zukunft liegt (wie REQ-064), oder ein Jahr im Format JJJJ (vier Ziffern), das nicht nach dem laufenden Jahr liegt. Alles andere ist ungültig.
- Wenn der Nutzer „Sichern“ antippt und die Eingabe gültig ist, muss das System sie dauerhaft über die Repository-Schnittstelle (ADR-0002) speichern und das Blatt schließen. Die neue Angabe ersetzt die bisherige vollständig, also Datum und Jahr.
- Wenn die Eingabe ungültig ist, muss das System das Feld hervorheben wie im Blatt „Hinzugefügt“ (REQ-064: Primär, kein Hinweistext, bis der Nutzer etwas im Feld ändert). Es darf nichts speichern und muss das Blatt geöffnet lassen.
- Wenn der Nutzer das Feld leert und „Sichern“ antippt, muss das System die Erscheinungsangabe entfernen und das Blatt schließen. Ein leeres Feld gilt nicht als ungültig. Danach ist die Zeile „Erschienen“ rechts leer (REQ-056).
- Wenn der Nutzer das Blatt auf anderem Weg als „Sichern“ schließt, muss das System die Eingabe verwerfen.

## Akzeptanzkriterien

### AK-1 Blatt öffnet sich vorbefüllt
- **Gegeben** ein Buch mit Erscheinungsdatum 15.03.2021
- **Wenn** der Nutzer im Reiter „Details“ die Zeile „Erschienen“ antippt
- **Dann** ist ein Datumsblatt mit der Pille „Sichern“ geöffnet, und das Feld zeigt 15.03.2021

### AK-2 Gültiges Datum sichern
- **Gegeben** das Blatt „Erschienen“ ist geöffnet
- **Wenn** der Nutzer 01.02.2025 einträgt und „Sichern“ antippt
- **Dann** ist das Blatt geschlossen, das Erscheinungsdatum ist 01.02.2025, und die Zeile „Erschienen“ zeigt „Feb. 2025“
- **Und** beim erneuten Öffnen zeigt das Blatt 01.02.2025
- **Und** nach einem Neustart der App ist es unverändert vorhanden

### AK-3 Datum in der Zukunft wird nicht gesichert
- **Gegeben** das Blatt „Erschienen“ ist geöffnet
- **Wenn** der Nutzer das Datum von morgen einträgt und „Sichern“ antippt
- **Dann** ist das Feld in Primär hervorgehoben, ohne Hinweistext
- **Und** das Blatt bleibt geöffnet, und die Erscheinungsangabe ist unverändert

### AK-4 Nicht existierendes Datum wird nicht gesichert
- **Gegeben** das Blatt „Erschienen“ ist geöffnet
- **Wenn** der Nutzer 31.02.2025 einträgt und „Sichern“ antippt
- **Dann** ist das Feld hervorgehoben, und es wurde nichts gespeichert

### AK-5 Leeren entfernt die Erscheinungsangabe
- **Gegeben** ein Buch mit Erscheinungsdatum 15.03.2021, und das Blatt „Erschienen“ ist geöffnet
- **Wenn** der Nutzer das Feld mit der Löschtaste leert und „Sichern“ antippt
- **Dann** ist das Blatt geschlossen, das Buch hat keine Erscheinungsangabe, und die Zeile „Erschienen“ ist rechts leer, auch nach einem Neustart

### AK-6 Schließen ohne Sichern verwirft
- **Gegeben** im Blatt „Erschienen“ ist ein anderes Datum eingetragen oder das Feld geleert
- **Wenn** der Nutzer das Blatt schließt, ohne „Sichern“ anzutippen
- **Dann** ist die Erscheinungsangabe unverändert

### AK-7 Bestehendes Jahr ohne Datum
- **Gegeben** ein vorher angelegtes Buch mit Erscheinungsjahr 2019 und ohne Erscheinungsdatum
- **Wenn** die Karte „Ausgabe“ betrachtet wird
- **Dann** zeigt die Zeile „Erschienen“ „2019“

### AK-8 Datum hat Vorrang vor dem Jahr
- **Gegeben** ein Buch mit Erscheinungsjahr 2019 und Erscheinungsdatum 03.02.2019
- **Wenn** die Karte „Ausgabe“ betrachtet wird
- **Dann** zeigt die Zeile „Erschienen“ „Feb. 2019“

### AK-9 Kein Feld „JAHR“ im Manuellen Eintrag
- **Gegeben** das Blatt „Manueller Eintrag“ ist geöffnet
- **Wenn** der Nutzer es betrachtet
- **Dann** gibt es kein Feld „JAHR“, und die Erscheinungsangabe ist nur über „Erschienen“ eingebbar

### AK-10 Nur ein Jahr eintragen
- **Gegeben** ein Buch mit Erscheinungsdatum 15.03.2021, und das Blatt „Erschienen“ ist geöffnet
- **Wenn** der Nutzer 2019 einträgt und „Sichern“ antippt
- **Dann** ist das Blatt geschlossen, das Buch hat das Erscheinungsjahr 2019 und kein Erscheinungsdatum mehr, und die Zeile „Erschienen“ zeigt „2019“
- **Und** beim erneuten Öffnen zeigt das Feld 2019, auch nach einem Neustart

### AK-11 Ungültiges Jahr wird nicht gesichert
- **Gegeben** das Blatt „Erschienen“ ist geöffnet
- **Wenn** der Nutzer das Jahr nach dem laufenden Jahr bzw. (zweiter Durchlauf) „219“ einträgt und „Sichern“ antippt
- **Dann** ist das Feld hervorgehoben, das Blatt bleibt geöffnet, und es wurde nichts gespeichert

### AK-12 Nur ein Jahr im Manuellen Eintrag
- **Gegeben** im Blatt „Manueller Eintrag“ sind Titel und Seitenzahl eingetragen
- **Wenn** der Nutzer bei „Erschienen“ 2019 einträgt und „Hinzufügen“ antippt
- **Dann** hat das neue Buch das Erscheinungsjahr 2019, und die Zeile „Erschienen“ in den Details zeigt „2019“

### AK-13 Barcode-Scan liefert nur ein Jahr
- **Gegeben** ein Treffer des Barcode-Scans enthält als Erscheinungsangabe nur das Jahr 2019
- **Wenn** der Nutzer den Treffer übernimmt
- **Dann** steht im Blatt „Manueller Eintrag“ bei „Erschienen“ 2019

## Abgrenzung (nicht Teil dieses REQ)

- Pfeil an der Zeile „Erschienen“ (REQ-091).
- Leeren der übrigen Felder (REQ-093).

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

Folgende Inhalte bestehender REQs werden mit Umsetzung dieses REQ abgelöst. Alle stehen auf „Implementiert“ und sind nicht eingefroren, deshalb ist kein `ersetzt` nötig. Sie werden nach der Bestätigung durch den CEO nachgezogen.
- **REQ-030 / REQ-031:** Feld „JAHR“ im Blatt „Manueller Eintrag“ und dessen Prüfung (nur Ziffern, 1–3 Ziffern ungültig) entfallen.
- **REQ-033:** Das Erscheinungsjahr kann nicht mehr eingegeben werden. Vorhandene Werte bleiben gespeichert und werden nach diesem REQ angezeigt. Das Erscheinungsdatum bleibt unverändert.
- **REQ-060:** Die Aussage „Das Feld ‚JAHR‘ bleibt unverändert“ entfällt. Ebenso entfällt der Teil „Prüfung des Feldes ‚JAHR‘“ in der Aufzählung dessen, was aus REQ-031 unverändert bleibt.
- **REQ-056:** Der Wert „Erschienen: Erscheinungsjahr“, AK-3 (Anzeige „2025“) und „Erschienen“ in AK-7 (ohne Funktion) werden angepasst.
- **REQ-060:** Das Feld „Erschienen“ nimmt künftig auch JJJJ an.
- **REQ-062:** Ein vom Barcode-Scan geliefertes Jahr wird künftig in „Erschienen“ übernommen statt in „JAHR“.
- **REQ-064** (Muster), **REQ-093**, **ADR-0002.**

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-23 | Erstellt aus CEO-Vorgabe vom 2026-11-23 („Übernehme hier das template von Hinzugefügt.“), Entwurf | Anforderungsmanager |
| 2026-11-23 | CEO-Antworten Runde 1 eingearbeitet: wie „Hinzugefügt“ (Zeile „Feb. 2025“, Blatt TT.MM.JJJJ, vollständiges Datum, nicht in der Zukunft), Leeren per Löschtaste und „Sichern“. Status Entwurf | Anforderungsmanager |
| 2026-11-23 | CEO-Antworten Runde 2 eingearbeitet: Feld „JAHR“ entfällt, vorhandenes Jahr ohne Datum wird als Jahr angezeigt. Abgelöste Inhalte von REQ-030, REQ-031, REQ-033, REQ-060 und REQ-056 unter „Abhängigkeiten“ vermerkt. Titel angepasst, AK-7 bis AK-9 neu. Status Entwurf | Anforderungsmanager |
| 2026-11-23 | CEO-Antwort Runde 3 eingearbeitet: Statt eines Datums kann auch nur ein Jahr (JJJJ) eingetragen werden, „je nachdem was vorliegt“, auch im Manuellen Eintrag und beim Barcode-Scan. Vorbefüllung mit dem Jahr. AK-10 bis AK-13 neu. Keine offenen Fragen. Status Entwurf | Anforderungsmanager |
| 2026-11-23 | Vom CEO bestätigt (wörtlich): „okay, freigegeben. Starte mit dem nächsten Prototypen“. Status „Abgestimmt“ | Anforderungsmanager |
