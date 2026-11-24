---
id: REQ-105
titel: Reiter „Notizbuch“ – Abschnitt „Zitate“ mit Anlegen, Ändern und Löschen über ein Blatt
status: In Umsetzung
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **zu einem Buch Zitate mit Sprecher und Seite festhalten**, damit **ich schöne Stellen wiederfinde**.

CEO (2026-11-24, über den Scrum Master): Im Reiter „Notizbuch“ ein Abschnitt „Zitate“. Ohne Zitate eine gestrichelte Pille „+ Zitat hinzufügen“. Blatt von unten mit Zitat (mehrzeilig, Pflicht), „Wer sagt es?“ (optional, freier Text), Seite (optional) und „Sichern“. Liste sortiert nach Seite, ohne Seite am Ende. Antippen öffnet das Blatt zum Ändern, dort auch „Zitat löschen“. Mit „+“ kommen weitere Zitate dazu. Vorerst nur Zitate, keine freien Notizen.

## Anforderung (Satzschablone)

**Reiter**
- Wenn der Reiter „Notizbuch“ (REQ-043) aktiv ist, muss das System an Stelle von „under construction :)“ den Abschnitt „Zitate“ anzeigen (Überschrift im Stil der Abschnittsüberschriften im Reiter „Details“, REQ-051, **Auslegung**).
- Ohne Zitate muss das System darunter eine gestrichelte Pille „+ Zitat hinzufügen“ im Muster von REQ-052 bzw. REQ-095 anzeigen (je Stil angepasst, REQ-071).
- Mit Zitaten muss das System die Zitate untereinander anzeigen, je mit Zitattext (vollständig), darunter „Wer sagt es?“ und „S. <Seite>“, soweit vorhanden. Sortierung aufsteigend nach Seite, Zitate ohne Seite am Ende, bei gleicher bzw. ohne Seite in der Reihenfolge des Anlegens (**Auslegung**). Dazu ein „+“ zum Hinzufügen weiterer Zitate (Lage nach der Konzeptskizze, kein Akzeptanzkriterium).

**Blatt „Zitat“**
- Antippen von „+ Zitat hinzufügen“ bzw. „+“ öffnet ein Blatt von unten (Muster REQ-063) mit: Feld „Zitat“ (mehrzeilig, ohne Längenbegrenzung wie REQ-049, Pflicht), Feld „Wer sagt es?“ (einzeilig, freier Text, optional), Feld „Seite“ (optional, ganze Zahl ≥ 1, **Auslegung**) und „Sichern“.
- „Sichern“ speichert das Zitat dauerhaft zum Buch (ADR-0002) und schließt das Blatt. Ist das Feld „Zitat“ leer oder nur Leerzeichen, oder ist die Seite ungültig, hebt das System das betroffene Feld hervor wie in REQ-063 und speichert nichts.
- Schließen ohne „Sichern“ verwirft die Eingabe.
- Antippen eines vorhandenen Zitats öffnet dasselbe Blatt, vorbefüllt, mit zusätzlich „Zitat löschen“ unter „Sichern“. „Wer sagt es?“ und „Seite“ lassen sich leeren (REQ-093).
- „Zitat löschen“ zeigt eine Rückfrage (**Auslegung**, wie „Liste löschen“ in REQ-098). Bestätigt der Nutzer, löscht das System das Zitat und schließt das Blatt.
- Der Reiter „Figuren & Orte“ bleibt unverändert (REQ-043).

## Akzeptanzkriterien

### AK-1 Ohne Zitate
- **Gegeben** ein Buch ohne Zitate
- **Wenn** der Nutzer den Reiter „Notizbuch“ antippt
- **Dann** stehen dort „Zitate“ und die gestrichelte Pille „+ Zitat hinzufügen“, kein „under construction :)“

### AK-2 Zitat anlegen
- **Gegeben** das Blatt „Zitat“ ist über „+ Zitat hinzufügen“ geöffnet
- **Wenn** der Nutzer „Ich bin nicht das Feuer.“, „Violet“ und 312 einträgt und „Sichern“ antippt
- **Dann** zeigt der Abschnitt dieses Zitat mit „Violet“ und „S. 312“, auch nach einem Neustart

### AK-3 Zitat ist Pflicht
- **Gegeben** das Blatt „Zitat“ ist geöffnet, „Zitat“ ist leer bzw. (zweiter Durchlauf) nur Leerzeichen
- **Wenn** der Nutzer „Sichern“ antippt
- **Dann** ist das Feld „Zitat“ hervorgehoben, das Blatt bleibt offen, und es wurde nichts gespeichert

### AK-4 Nur Zitat genügt
- **Gegeben** im Blatt ist nur das Feld „Zitat“ ausgefüllt
- **Wenn** der Nutzer „Sichern“ antippt
- **Dann** ist das Zitat ohne Sprecher und ohne Seite gespeichert

### AK-5 Sortierung nach Seite
- **Gegeben** Zitate auf S. 200, ohne Seite und auf S. 15 (in dieser Reihenfolge angelegt)
- **Wenn** der Abschnitt betrachtet wird
- **Dann** stehen sie in der Reihenfolge S. 15, S. 200, ohne Seite

### AK-6 Ändern und Leeren
- **Gegeben** ein Zitat mit „Violet“ und S. 312
- **Wenn** der Nutzer es antippt, „Wer sagt es?“ leert, die Seite auf 313 ändert und „Sichern“ antippt
- **Dann** zeigt das Zitat keinen Sprecher und „S. 313“

### AK-7 Löschen mit Rückfrage
- **Gegeben** das Blatt eines vorhandenen Zitats ist geöffnet
- **Wenn** der Nutzer „Zitat löschen“ antippt und die Rückfrage bestätigt
- **Dann** ist das Zitat entfernt, auch nach einem Neustart
- **Und** verneint er, bleibt es erhalten
- **Und** war es das einzige Zitat, steht wieder „+ Zitat hinzufügen“ da

### AK-8 Schließen ohne Sichern verwirft
- **Gegeben** im Blatt eines neuen bzw. (zweiter Durchlauf) vorhandenen Zitats wurde etwas eingetragen
- **Wenn** der Nutzer es ohne „Sichern“ schließt
- **Dann** ist nichts gespeichert bzw. das Zitat unverändert

## Abgrenzung (nicht Teil dieses REQ)

- Freie Notizen (CEO: vorerst nur Zitate).
- Verknüpfung von „Wer sagt es?“ mit dem Reiter „Figuren & Orte“ (CEO: „gern später mit dem reiter figuren und orte verknüpfen“, To-do-Liste).

## Qualitätsanforderungen

- Darstellung in allen Farbdesigns und Stilen (REQ-068, REQ-071).

## Abhängigkeiten

- **REQ-043:** „Notizbuch“ zeigt bisher „under construction :)“ (Anforderung und AK-8). Das wird für „Notizbuch“ abgelöst, für „Figuren & Orte“ bleibt es.
- **REQ-049** (Muster Mehrzeilenfeld), **REQ-052, REQ-063, REQ-093, REQ-098, REQ-106, ADR-0002.**

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-24 | Erstellt aus CEO-Vision und abgenommener Konzeptskizze, Entwurf | Anforderungsmanager |
| 2026-11-24 | Vom CEO bestätigt (wörtlich): „sieht alles super aus! Danke!“. Status „Abgestimmt“ | Anforderungsmanager |
