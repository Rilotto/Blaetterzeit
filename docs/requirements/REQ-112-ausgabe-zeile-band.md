---
id: REQ-112
titel: Karte „Ausgabe“ – Zeile „Band“ unter „Exemplar“, eine Bandnummer je Buch, auch aus dem Barcode-Scan
status: In Umsetzung
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **die Bandnummer eines Buches in der Karte „Ausgabe“ sehen und ändern, auch wenn das Buch noch in keiner Saga ist**, damit **die Bandnummer zum Buch gehört und überall gleich ist**.

CEO (wörtlich, 2026-11-25): „Der Band soll aus dem ISBN Code auch ausgelesen werden, sofern er hinterlegt ist“. Die Zeile „Band“ steht direkt unter „Exemplar“.

Entscheidung des CEO (2026-11-25): „a“, also eine Bandnummer pro Buch. Die Zeile „Band“ und die Saga zeigen immer denselben Wert. Eine Änderung an einer Stelle ändert ihn auch an der anderen.

Beauftragt vom CEO (wörtlich, 2026-11-25): „okay, setze bitte Sprint 11 um als Prototypen“. Die Auslegungen unten hat er ohne Gegenrede stehen lassen.

## Anforderung (Satzschablone)

**Daten**
- Das System muss je Buch höchstens eine optionale Bandnummer dauerhaft über die Repository-Schnittstelle (ADR-0002) speichern. Gültig ist eine ganze Zahl ≥ 1 (**Auslegung**, wie bisher REQ-096).
- Die Bandnummer gehört zum Buch, nicht zur Zugehörigkeit zu einer Saga. Die bisherige Bandnummer je Zugehörigkeit (je Saga) entfällt. Ist ein Buch in mehreren Sagas, hat es dort überall denselben Band (**Auslegung**).
- **Übernahme vorhandener Daten (Auslegung):** Beim ersten Start nach dem Update übernimmt das System vorhandene Werte ohne Datenverlust: Hat das Buch bereits eine eigene Bandnummer (aus dem Barcode-Scan), bleibt sie. Sonst erhält es die Bandnummer aus seiner Saga-Zugehörigkeit. Gibt es dort mehrere verschiedene, gilt die kleinste.

**Zeile „Band“**
- Das System muss in der Karte „Ausgabe“ (REQ-056) direkt unter der Zeile „Exemplar“ die Zeile „Band“ darstellen, rechts mit Pfeil „›“ (REQ-091).
- Die Zeile zeigt rechts die Bandnummer als Zahl, z. B. „2“. Ohne Bandnummer bleibt die rechte Seite leer (**Auslegung**, wie „Verlag“).
- Wenn der Nutzer die Zeile „Band“ antippt, muss das System ein Blatt nach dem Muster „Verlag“ (REQ-063) mit Titel „Band“, einem Zahlenfeld mit der aktuellen Bandnummer und der Pille „Sichern“ anzeigen (**Auslegung**).
- „Sichern“ mit gültigem Wert speichert die Bandnummer dauerhaft und schließt das Blatt. Ein leeres Feld entfernt die Bandnummer (Leeren, REQ-093). Bei ungültiger Eingabe hebt das System das Feld hervor wie im Blatt „ISBN“ (REQ-063) und speichert nichts. Schließen ohne „Sichern“ verwirft die Eingabe.

**Gleicher Wert überall**
- Das System muss die Bandnummer des Buches überall gleich anzeigen: Zeile „Band“, Zeile „Band <n> · <Saga>“ unter dem Autor (REQ-099), Feld „Band“ im Blatt „Zu einer Saga hinzufügen“ (REQ-096) und in der Listenübersicht „Sagas“ (REQ-097), Sortierung „nach Bänden“ (REQ-098).
- Ändert der Nutzer die Bandnummer an einer dieser Stellen, muss das System sie an allen anderen ohne Neustart ebenfalls geändert anzeigen.

**Manueller Eintrag**
- Das System muss die Zeile „Band“ auch in der Karte „Ausgabe“ des Blatts „Manueller Eintrag“ (REQ-060) an derselben Stelle anbieten, mit gleichem Blatt und gleichen Regeln (**Auslegung**). Der Wert wird mit dem Buch angelegt.

**Barcode-Scan**
- Liefert der übernommene Treffer des Barcode-Scans (REQ-062) eine Bandnummer, muss das System sie in die Zeile „Band“ des vorbefüllten Manuellen Eintrags übernehmen. Mit „Hinzufügen“ wird sie zur Bandnummer des Buches (**Auslegung**: wie bisher Buch.bandnummer).
- Ist die gelieferte Angabe keine ganze Zahl ≥ 1, übernimmt das System sie nicht (wie REQ-099).
- Eine gelieferte Reihe ordnet das Buch weiterhin keiner Saga zu (REQ-099).

## Akzeptanzkriterien

### AK-1 Zeile „Band“ unter „Exemplar“
- **Gegeben** die Karte „Ausgabe“ eines Buches mit Bandnummer 2
- **Wenn** der Nutzer sie betrachtet
- **Dann** steht die Zeile „Band“ direkt unter „Exemplar“ und zeigt rechts „2“ mit Pfeil „›“
- **Und** bei einem Buch ohne Bandnummer ist die rechte Seite leer, der Pfeil ist vorhanden

### AK-2 Ändern über das Blatt
- **Gegeben** ein Buch ohne Bandnummer, Reiter „Details“
- **Wenn** der Nutzer „Band“ antippt, 3 einträgt und „Sichern“ antippt
- **Dann** schließt das Blatt, die Zeile „Band“ zeigt „3“, auch nach einem Neustart

### AK-3 Leeren und ungültige Eingaben
- **Gegeben** ein Buch mit Bandnummer 3
- **Wenn** der Nutzer im Blatt „Band“ das Feld leert und „Sichern“ antippt
- **Dann** hat das Buch keine Bandnummer mehr, die Zeile ist rechts leer
- **Gegeben** das Blatt „Band“ ist geöffnet
- **Wenn** der Nutzer 0, -1, 1,5 bzw. „abc“ einträgt und „Sichern“ antippt
- **Dann** wird das Feld hervorgehoben, nichts wird gespeichert, das Blatt bleibt offen

### AK-4 Schließen ohne Sichern
- **Gegeben** ein Buch mit Bandnummer 1, das Blatt „Band“ ist geöffnet und 5 eingetragen
- **Wenn** der Nutzer das Blatt ohne „Sichern“ schließt
- **Dann** bleibt die Bandnummer 1

### AK-5 Zeile „Band“ ändert die Saga-Anzeige
- **Gegeben** „Fourth Wing“ ist in der Saga „The Empyrean“ und hat Band 1
- **Wenn** der Nutzer in der Zeile „Band“ 2 sichert
- **Dann** steht unter dem Autor ohne Neustart „Band 2 · The Empyrean“ (REQ-099)
- **Und** in der Listenübersicht „Sagas“ zeigt das Feld „Band“ 2 (REQ-097)

### AK-6 Saga-Feld ändert die Zeile „Band“
- **Gegeben** „Fourth Wing“ hat Band 1 und ist in der Saga „The Empyrean“
- **Wenn** der Nutzer in der Listenübersicht „Sagas“ (aus den Buchdetails) im Feld „Band“ 4 einträgt und übernimmt
- **Dann** zeigt die Zeile „Band“ der Karte „Ausgabe“ „4“

### AK-7 Ein Buch in mehreren Sagas
- **Gegeben** ein Buch mit Band 1 in den Sagas „The Empyrean“ und „Crescent City“
- **Wenn** die Buchdetails angezeigt werden
- **Dann** stehen unter dem Autor „Band 1 · Crescent City“ und „Band 1 · The Empyrean“
- **Und** nach Ändern der Zeile „Band“ auf 2 zeigen beide Zeilen „Band 2“

### AK-8 Manueller Eintrag
- **Gegeben** das Blatt „Manueller Eintrag“ ist geöffnet
- **Wenn** der Nutzer Titel, Seitenzahl und in der Zeile „Band“ 2 einträgt und „Hinzufügen“ antippt
- **Dann** hat das neue Buch die Bandnummer 2, die Zeile „Band“ der Buchdetails zeigt „2“

### AK-9 Band aus dem Barcode-Scan
- **Gegeben** ein Treffer des Barcode-Scans liefert Band 2, ein zweiter Treffer liefert keinen bzw. den Band „II“
- **Wenn** der Nutzer den ersten Treffer antippt
- **Dann** zeigt die Zeile „Band“ im Manuellen Eintrag „2“, und nach „Hinzufügen“ zeigt die Zeile „Band“ der Buchdetails „2“
- **Und** wählt er stattdessen den zweiten Treffer, bleibt die Zeile „Band“ leer

### AK-10 Übernahme vorhandener Daten
- **Gegeben** vor dem Update: Buch A ohne eigene Bandnummer in der Saga „Crescent City“ mit Band 3; Buch B mit eigener Bandnummer 2 (Scan) in einer Saga mit Band 5; Buch C in zwei Sagas mit Band 4 und Band 2
- **Wenn** die App nach dem Update startet
- **Dann** zeigt die Zeile „Band“ bei A „3“, bei B „2“, bei C „2“
- **Und** alle Saga-Zugehörigkeiten sind unverändert vorhanden

## Abgrenzung (nicht Teil dieses REQ)

- Unterschiedliche Bandnummern desselben Buches in verschiedenen Sagas (CEO-Entscheidung „a“: eine Bandnummer je Buch).
- Automatische Saga-Zuordnung aus einer gelieferten Reihe (REQ-099: „nein, das ordne ich selbst immer zu“).
- Bandangaben, die keine ganze Zahl sind (z. B. „1.5“, „II“).

## Qualitätsanforderungen

- Darstellung in allen Farbdesigns und Stilen (REQ-068, REQ-071).
- Kein Datenverlust beim Update (AK-10, Update-Test der CI).

## Abhängigkeiten

- **REQ-056:** Die Karte „Ausgabe“ bekommt eine dreizehnte Zeile „Band“ unter „Exemplar“ (Zeilenliste und AK-1 dort angepasst).
- **REQ-060:** Zeile „Band“ auch im Manuellen Eintrag (AK-1 dort angepasst).
- **REQ-096, REQ-097, REQ-098, REQ-099:** Die Bandnummer je Zugehörigkeit wird durch die Bandnummer des Buches abgelöst (dort angepasst).
- **REQ-062** (Barcode-Scan), **REQ-063** (Blattmuster), **REQ-091** (Pfeil), **REQ-093** (Leeren), **ADR-0002.**

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-25 | Erstellt aus den gesammelten Punkten für Sprint 11. CEO (wörtlich): „Der Band soll aus dem ISBN Code auch ausgelesen werden, sofern er hinterlegt ist“, Entscheidung „a“ (eine Bandnummer je Buch). Auslegungen (Blatt wie „Verlag“, Manueller Eintrag, Scan wie bisher Buch.bandnummer, ganze Zahl ab 1, überall derselbe Band) vom CEO ohne Gegenrede. Eigene Auslegungen: leere Zeile ohne Band, Übernahme vorhandener Daten (AK-10). Beauftragt (wörtlich): „okay, setze bitte Sprint 11 um als Prototypen“. Status „Abgestimmt“ | Anforderungsmanager |
