---
id: REQ-095
titel: Listen (Sagas, Sammlungen, Bibliotheken) und Abschnitt „Sagas, Sammlungen und Bibliotheken“ in den Buchdetails
status: Implementiert
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **meine Bücher in Sagas, Sammlungen und Bibliotheken einordnen und in den Buchdetails sehen, wo ein Buch einsortiert ist**, damit **ich Buchreihen und eigene Zusammenstellungen pflegen kann**.

CEO (wörtlich, 2026-11-23): „Im Abschnitt "Sammlungen und Bibliotheken" in den Buchdetails geht es weiter. 1. Benenne den Abschnitt um in "Sagas, Sammlungen und Bibliotheken" 2. Alle drei Kategorien stellen Listen dar im weiteren Verlauf. Wenn das Buch zu keiner Liste hinzugefügt wurde, steht unter der Abschnittsüberschrift jeweils drei Pillen (untereinander, linksbündig) in gestrichelter Form mit einen + (Siehe bei Tropes und Genres). Je nach Stil muss sich die Optik natürlich ändern.“

CEO-Antworten (wörtlich, 2026-11-23):
- „eine Saga ist eine Buchreihe. Z.B. The Empyrean. Eine Sammlung kann z.B. "meine Lieblingsbücher" sein. Eine Bibliothek ist aktuell gleich wie Sammlung, wird später aber noch in diesem Detailgrab benötigt und ist verlinkt mit dem Reiter "Bibliothek". Daher muss das auch gleich heißen.“
- Mehrere Listen je Art: „Ja“
- „ja die + zu einer xxx hinzufügen bleibt dann bestehen. In dem ich dann auf "in Sammlung" klicke und ich hier ja eine neue Sammlung oder bereits bestehende auswählen kann. Entsprechend ist eine mehrfachauswahl möglich.“

Vom CEO am 2026-11-23 bestätigtes Konzept (über den Scrum Master), Punkte 1, 2, 4 und 8: Die Pillen stehen nur für die Arten, in denen das Buch noch in keiner Liste ist. Bei Zugehörigkeit erscheint die Zeile „In Saga“, „In Sammlung“ bzw. „In Bibliotheken“ mit dem Namen und einem Pfeil.

## Anforderung (Satzschablone)

**Listen**
- Das System muss drei Arten von Listen führen: Saga (Buchreihe), Sammlung und Bibliothek. Eine Liste hat eine Art und einen Namen. Bibliotheken verhalten sich vorerst wie Sammlungen.
- Ein Buch kann in beliebig vielen Listen jeder Art sein. Je Saga, in der ein Buch ist, kann optional eine Bandnummer gespeichert sein (REQ-096).
- Das System muss Listen, Zugehörigkeiten und Bandnummern dauerhaft über die Repository-Schnittstelle speichern (ADR-0002).

**Abschnitt in den Buchdetails (Reiter „Details“)**
- Das System muss den bisherigen Abschnitt „Sammlungen und Bibliotheken“ (REQ-055) als „Sagas, Sammlungen und Bibliotheken“ bezeichnen.
- Das System muss darin für jede Art, in der das Buch in **keiner** Liste ist, eine gestrichelte Pille darstellen. Die Pillen stehen untereinander und linksbündig in der Reihenfolge Saga, Sammlung, Bibliothek und tragen die Texte „+ Zu einer Saga hinzufügen“, „+ Zu einer Sammlung hinzufügen“ bzw. „+ Zu einer Bibliothek hinzufügen“.
- Die Pillen haben die Gestaltung der gestrichelten Pillen bei Genres und Tropes (REQ-052) im jeweiligen Stil (REQ-071).
- Für jede Art, in der das Buch in mindestens einer Liste ist, muss das System an Stelle der Pille die Zeile „In Saga“, „In Sammlung“ bzw. „In Bibliotheken“ darstellen, rechts mit dem Namen der Liste und einem Pfeil „›“. Ist das Buch in mehreren Listen der Art, stehen die Namen durch „, “ getrennt (**Auslegung**: Darstellung mehrerer Namen nicht festgelegt).
- Antippen einer Pille öffnet das Blatt „Zu einer … hinzufügen“ (REQ-096). Antippen einer Zeile öffnet die Listenübersicht dieser Art (REQ-097).

## Akzeptanzkriterien

### AK-1 Abschnitt umbenannt, drei Pillen ohne Zugehörigkeit
- **Gegeben** ein Buch, das in keiner Liste ist
- **Wenn** der Reiter „Details“ angezeigt wird
- **Dann** heißt der Abschnitt „Sagas, Sammlungen und Bibliotheken“
- **Und** darunter stehen untereinander die gestrichelten Pillen „+ Zu einer Saga hinzufügen“, „+ Zu einer Sammlung hinzufügen“, „+ Zu einer Bibliothek hinzufügen“

### AK-2 Mischzustand
- **Gegeben** ein Buch in der Saga „The Empyrean“, aber in keiner Sammlung und keiner Bibliothek
- **Wenn** der Abschnitt angezeigt wird
- **Dann** steht für Sagas die Zeile „In Saga“ mit „The Empyrean“ und Pfeil
- **Und** für Sammlung und Bibliothek stehen weiter die beiden gestrichelten Pillen

### AK-3 Mehrere Listen einer Art
- **Gegeben** ein Buch in den Sammlungen „Lieblingsbücher“ und „Sommer 2026“
- **Wenn** der Abschnitt angezeigt wird
- **Dann** zeigt die Zeile „In Sammlung“ beide Namen, und es gibt keine Pille „+ Zu einer Sammlung hinzufügen“

### AK-4 Antippen
- **Gegeben** der Abschnitt zeigt eine Pille und eine Zeile
- **Wenn** der Nutzer die Pille bzw. (zweiter Durchlauf) die Zeile antippt
- **Dann** öffnet sich das Blatt dieser Art (REQ-096) bzw. die Listenübersicht dieser Art (REQ-097)

### AK-5 Dauerhaft gespeichert
- **Gegeben** ein Buch wurde der Saga „The Empyrean“ und der Bibliothek „Zuhause“ zugeordnet
- **Wenn** die App neu gestartet wird
- **Dann** sind Listen und Zugehörigkeiten unverändert vorhanden

## Abgrenzung (nicht Teil dieses REQ)

- Blatt zum Hinzufügen (REQ-096), Listenübersicht und Erreichbarkeit (REQ-097), geöffnete Liste (REQ-098), Saga-Zeile unter dem Autor (REQ-099).
- Abgelehnt (CEO, 2026-11-23): Saga-Fortschritt und „Weiter mit Band X“.
- Spätere Bedeutung der Bibliothek über Sammlungen hinaus (CEO: „wird später aber noch … benötigt“).

## Qualitätsanforderungen

- Darstellung in allen Farbdesigns und Stilen (REQ-068, REQ-071).

## Abhängigkeiten

- **REQ-055:** wird mit Umsetzung dieses REQ vollständig abgelöst (Name des Abschnitts, Pille „Zu einer Sammlung hinzufügen“ und Karte „In Bibliotheken“ ohne Funktion). Status „Implementiert“, nicht eingefroren, deshalb kein `ersetzt`.
- **REQ-008** (Buchdaten erweitert), **REQ-051** (Abschnittsüberschriften), **REQ-052** (Pillenmuster), **REQ-071**, **ADR-0002.**

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-23 | Erstellt aus dem vom CEO bestätigten Konzept, Entwurf | Anforderungsmanager |
| 2026-11-23 | Vom CEO bestätigt (wörtlich): „okay, freigegeben. Starte mit dem nächsten Prototypen“. Status „Abgestimmt“ | Anforderungsmanager |
