---
id: REQ-069
titel: Fenster „Design“ – Schrift auswählen (Systemschrift, Fraunces)
status: Abgestimmt
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **aus den festgelegten Schriften mit kurzem Beispiel wählen**, damit **sich die App-Schrift sofort und dauerhaft ändert**.

CEO (2026-11-18, wörtlich): „In Schriftart sehe ich die bereits festgelegten Schriftarten auch aus Auswahl mit kurzen Beispielen. […] Beim Klick auf ein Design oder eine Schriftart soll die App sich aktualisieren und keinen Neustart benötigen.“ Zu den Schriften: „Systemschrift wie bisher und dann erstmal nur Fraunces.“

## Anforderung (Satzschablone)

- Das System muss die wählbaren Schriften an genau einer zentralen Stelle definieren, zum Start „Systemschrift“ (wie bisher in REQ-003) und „Fraunces“ (REQ-065).
- Das System muss im Fenster „Design“ unter „Schriftart“ je Schrift eine Zeile darstellen. Darin stehen der Name der Schrift und der Beispielsatz „Deine Bücher warten auf dich …“, beide in genau dieser Schrift.
- Das System muss bei der aktiven Schrift ein Häkchen darstellen und bei allen anderen einen leeren Kreis.
- Wenn der Nutzer eine Zeile antippt, muss das System diese Schrift sofort als App-Schrift für alle Texte anwenden, ohne Neustart und ohne „Sichern“.
- Das System muss die gewählte Schrift dauerhaft über die Repository-Schnittstelle (ADR-0002) speichern und nach einem Neustart wieder anwenden.
- Solange der Nutzer keine Schrift gewählt hat, muss das System „Fraunces“ anwenden.
- Farbdesign und Schrift sind frei miteinander kombinierbar.
- Ausnahme von der Regel „eine zentrale Schrift“ (REQ-003 AK-2, REQ-065 AK-3): Nur die Zeilen dieser Liste zeigen Name und Beispielsatz in ihrer eigenen Schrift. Diese Schrift stammt aus der zentralen Schriftdefinition.
- Neue Schriften kommen nur auf Zuruf des CEO an der zentralen Stelle hinzu.

## Akzeptanzkriterien

### AK-1 Liste der Schriften mit Beispiel
- **Gegeben** das Fenster „Design“ mit aktivem „Schriftart“
- **Wenn** der Nutzer die Liste betrachtet
- **Dann** stehen dort „Systemschrift“ und „Fraunces“, je mit dem Beispielsatz „Deine Bücher warten auf dich …“
- **Und** Name und Beispielsatz jeder Zeile erscheinen in der jeweiligen Schrift

### AK-2 Standard und Markierung
- **Gegeben** der Nutzer hat noch nie eine Schrift gewählt
- **Wenn** er die App öffnet und die Liste betrachtet
- **Dann** sind alle Texte der App in Fraunces dargestellt
- **Und** „Fraunces“ trägt ein Häkchen, „Systemschrift“ einen leeren Kreis

### AK-3 Sofort anwenden ohne Neustart
- **Gegeben** „Fraunces“ ist aktiv
- **Wenn** der Nutzer „Systemschrift“ antippt
- **Dann** erscheinen alle Texte der App außerhalb der Schriftliste ohne Neustart in der Systemschrift
- **Und** das Häkchen wechselt zu „Systemschrift“

### AK-4 Dauerhaft gespeichert
- **Gegeben** der Nutzer hat „Systemschrift“ gewählt
- **Wenn** die App neu geladen oder neu gestartet wird
- **Dann** ist „Systemschrift“ weiterhin aktiv

### AK-5 Frei kombinierbar
- **Gegeben** „Nachtlektüre“ und „Fraunces“ sind aktiv
- **Wenn** der Nutzer „Systemschrift“ wählt
- **Dann** bleibt „Nachtlektüre“ aktiv, und umgekehrt bleibt bei einem Wechsel des Farbdesigns die Schrift erhalten

## Abgrenzung (nicht Teil dieses REQ)

- Schriftgrößen. Die Stufen aus REQ-065 gelten für jede Schrift.
- Ein Editor oder das Hochladen eigener Schriften.

## Qualitätsanforderungen

- Keine.

## Abhängigkeiten

- REQ-003, REQ-065 (zentrale App-Schrift; Ausnahme nur für die Schriftliste), REQ-067, REQ-068.

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-18 | Erstellt aus der CEO-Anforderung, dem angenommenen Mockup und der CEO-Antwort zu den Schriften. Status „Abgestimmt“ | Anforderungsmanager |
