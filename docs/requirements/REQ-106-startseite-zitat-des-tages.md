---
id: REQ-106
titel: Startseite – „Zitat des Tages“ aus allen gespeicherten Zitaten
status: In Umsetzung
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **auf der Startseite jeden Tag eines meiner gespeicherten Zitate sehen**, damit **ich mich an schöne Stellen erinnere**.

CEO (2026-11-24, über den Scrum Master): „Zitat des Tages“: jeden Tag ein anderes aus allen gespeicherten Zitaten, mit Buchtitel und Seite. Antippen öffnet das Buch im Reiter „Notizbuch“. Ohne Zitate entfällt die Kachel.

## Anforderung (Satzschablone)

- Wenn mindestens ein Zitat gespeichert ist (REQ-105), muss das System auf der Startseite die Kachel „Zitat des Tages“ mit Zitattext, Buchtitel und Seite anzeigen (ohne Seite entfällt die Seitenangabe, mit „Wer sagt es?“ zusätzlich der Sprecher, **Auslegung**).
- Das System muss je Kalendertag (lokale Gerätezeit) genau ein Zitat aus allen Zitaten aller Bücher wählen. Es bleibt für den ganzen Tag gleich, auch nach Neustart (**Auslegung**).
- Am Folgetag muss das System ein anderes Zitat als am Vortag wählen, sofern es mehr als ein Zitat gibt. Bei genau einem Zitat erscheint dieses jeden Tag.
- Wird das Zitat des Tages gelöscht, wählt das System für diesen Tag ein anderes. Gibt es dann keines mehr, entfällt die Kachel.
- Ohne gespeicherte Zitate darf das System die Kachel nicht anzeigen.
- Wenn der Nutzer die Kachel antippt, muss das System die Buchdetails des zugehörigen Buches mit aktivem Reiter „Notizbuch“ öffnen (Ausnahme von REQ-043 AK-3, wo beim Öffnen „Rezension“ aktiv ist).

## Akzeptanzkriterien

### AK-1 Ohne Zitate keine Kachel
- **Gegeben** kein Buch hat Zitate
- **Wenn** die Startseite angezeigt wird
- **Dann** gibt es keine Kachel „Zitat des Tages“

### AK-2 Kachel mit Titel und Seite
- **Gegeben** genau ein Zitat „Ich bin nicht das Feuer.“ aus „Fourth Wing“, S. 312
- **Wenn** die Startseite angezeigt wird
- **Dann** zeigt die Kachel den Zitattext, „Fourth Wing“ und „S. 312“

### AK-3 Gleich über den Tag, anders am Folgetag
- **Gegeben** drei Zitate aus zwei Büchern
- **Wenn** die Startseite am selben Tag mehrfach und nach einem Neustart angezeigt wird
- **Dann** ist es jedes Mal dasselbe Zitat
- **Und** am Folgetag ist es ein anderes

### AK-4 Antippen öffnet den Reiter „Notizbuch“
- **Gegeben** die Kachel zeigt ein Zitat aus „Fourth Wing“
- **Wenn** der Nutzer sie antippt
- **Dann** öffnen sich die Buchdetails von „Fourth Wing“ mit aktivem Reiter „Notizbuch“

### AK-5 Gelöschtes Zitat des Tages
- **Gegeben** das heutige Zitat des Tages wird im Reiter „Notizbuch“ gelöscht, es gibt noch weitere Zitate
- **Wenn** die Startseite wieder angezeigt wird
- **Dann** zeigt die Kachel ein anderes Zitat

## Abgrenzung (nicht Teil dieses REQ)

- Teilen eines Zitats.

## Qualitätsanforderungen

- Darstellung in allen Farbdesigns und Stilen (REQ-068, REQ-071).

## Abhängigkeiten

- **REQ-043:** Beim Öffnen über die Kachel ist „Notizbuch“ statt „Rezension“ aktiv (Ausnahme zu AK-3).
- **REQ-101, REQ-105.**

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-24 | Erstellt aus CEO-Vision und abgenommener Konzeptskizze, Entwurf | Anforderungsmanager |
| 2026-11-24 | Vom CEO bestätigt (wörtlich): „sieht alles super aus! Danke!“. Status „Abgestimmt“ | Anforderungsmanager |
