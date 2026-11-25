---
id: REQ-109
titel: Buchdetails – „Längste Serie“ für dieses Buch als Rekord statt laufender Streak
status: In Umsetzung
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **in den Buchdetails sehen, an wie vielen Tagen am Stück ich dieses Buch höchstens gelesen habe**, damit **der Wert auch nach einer Pause oder nach dem Beenden aussagekräftig bleibt**.

CEO (wörtlich, 2026-11-25): „Und bei den Buchdetails: Können wir hier den Streak bitte umbenennen in "Längster Streak für dieses Buch"?. Hier soll der Streak nur für das Buch gezählt werden. Ein Buch, was ich in 5 Sitzungen an 5 Tagen gelesen habe (also 1 sitzung pro Tag), kann maximal einen 5er Streak bekommen. Also dass wir die Logik bei den Streaks aufsplitten.“

Zusammenfassung des Scrum Masters, vom CEO ohne Widerspruch stehen gelassen (2026-11-25): Wert ist die längste lückenlose Folge von Kalendertagen mit mindestens einer Sitzung dieses Buches über die gesamte Historie. Mehrere Sitzungen am selben Tag zählen als ein Tag. Der Wert ist ein Rekord und sinkt nicht. Das bestehende Flammen-Icon bleibt.

## Anforderung (Satzschablone)

- Das System muss in der Statistik-Pille der Buchdetails (REQ-026) unter der Flamme statt „Tage in Folge“ die Beschriftung „Längste Serie“ anzeigen. CEO (wörtlich, 2026-11-25): „Ändern wir den Text bitte unter der Flamme zu Längste Serie. Wenn der Text nicht in die Boxen passt, sollen sinnvolle Zeilenumbrüche mit Silbentrennung entstehen.“ Die frühere Beschriftung „Längster Streak für dieses Buch“ entfällt.
- Passt die Beschriftung nicht in ihre Box, bricht sie mit Silbentrennung um und läuft nie über die Box hinaus (REQ-111).
- Das System muss als Zahl in der Flamme die längste lückenlose Folge von Lesetagen dieses Buches über die gesamte Historie anzeigen. Lesetag wie bisher (REQ-027): Kalendertag nach lokaler Gerätezeit mit mindestens einer Sitzung dieses Buches, mehrere Sitzungen am Tag zählen als ein Tag.
- Der Wert hängt nicht davon ab, ob heute oder gestern gelesen wurde. Er sinkt nicht durch Pausen, durch das Beenden des Buches oder durch einen Statuswechsel.
- Der Wert kann höchstens so groß sein wie die Zahl der Lesetage des Buches.
- Die Flamme wird nicht ausgegraut, weil der Wert ein Rekord ist (**Festlegung des Anforderungsmanagers**, Vorschlag des Scrum Masters). Bei 0 (keine Sitzung) Umriss in „GhostFrame“, ab 1 gefüllt mit dem Verlauf „Flamme Rot“ nach „Flamme Orange“, jeweils wie REQ-027. Form: bestehendes Flammen-Icon.
- Sitzungen anderer Bücher zählen nicht (Streak je Buch).

## Akzeptanzkriterien

### AK-1 Beschriftung
- **Gegeben** die Buchdetails werden angezeigt
- **Wenn** der linke Teil der Statistik-Pille betrachtet wird
- **Dann** steht unter der Flamme genau „Längste Serie“, weder „Längster Streak für dieses Buch“ noch „Tage in Folge“
- **Und** die Beschriftung unterliegt den Umbruchregeln aus REQ-111 (AK-4)

### AK-2 Längste Folge über die Historie
- **Gegeben** Sitzungen des Buches an 1., 2., 3. und 10., 11. November, heute ist der 25. November
- **Wenn** die Buchdetails angezeigt werden
- **Dann** zeigt die Flamme 3, angezündet (nicht ausgegraut)

### AK-3 Fünf Tage, fünf Sitzungen
- **Gegeben** fünf Sitzungen an fünf aufeinanderfolgenden Tagen, je eine pro Tag
- **Wenn** die Buchdetails angezeigt werden
- **Dann** zeigt die Flamme 5
- **Und** mit drei weiteren Sitzungen an einem dieser Tage bleibt es 5

### AK-4 Rekord sinkt nicht
- **Gegeben** die Flamme zeigt 5, danach wurde 10 Tage nicht gelesen, und das Buch wurde auf *gelesen* gesetzt
- **Wenn** die Buchdetails angezeigt werden
- **Dann** zeigt die Flamme weiterhin 5

### AK-5 Nur dieses Buch
- **Gegeben** gestern und heute nur Sitzungen an Buch A, Buch B hatte nie eine Sitzung
- **Wenn** die Buchdetails von Buch B angezeigt werden
- **Dann** zeigt die Flamme 0 als Umriss

## Abgrenzung (nicht Teil dieses REQ)

- Gesamt-Streak auf Startseite und in der Statistik (REQ-108).

## Qualitätsanforderungen

- Darstellung in allen Farbdesigns und Stilen (REQ-068, REQ-071).

## Abhängigkeiten

- **REQ-027:** Die Berechnung (Streak, der heute oder gestern endet, verpasster Tag = 0) und AK-4, AK-5 und AK-7 werden mit Umsetzung dieses REQ durch den Rekord abgelöst. Lesetag-Definition und Darstellung der Flamme bleiben.
- **REQ-026:** Die Beschriftung „Tage in Folge“ wird ersetzt (Anforderung, AK-1, AK-2).
- **REQ-087:** AK-4 verweist auf „Streak je Buch (REQ-027)“. Gemeint ist künftig der Rekord nach diesem REQ.
- **REQ-024, REQ-108.**

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-25 | Erstellt aus CEO-Vorgabe vom 2026-11-25, Entwurf | Anforderungsmanager |
| 2026-11-25 | Vom CEO bestätigt (wörtlich): „beide punkte passen für mich.“ Status „Abgestimmt“ | Anforderungsmanager |
| 2026-11-25 | Fehler (High): Beschriftung lief über die Box und überlappte „gelesen“. Beschriftung „Längster Streak für dieses Buch“ → „Längste Serie“. CEO (wörtlich): „Ändern wir den Text bitte unter der Flamme zu Längste Serie. Wenn der Text nicht in die Boxen passt, sollen sinnvolle Zeilenumbrüche mit Silbentrennung entstehen.“ Umbruch über REQ-111. Titel, Anforderung, AK-1 geändert. Beauftragt (wörtlich): „okay, setze bitte Sprint 11 um als Prototypen“. Status „Abgestimmt“ | Anforderungsmanager |
