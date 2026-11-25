---
id: REQ-102
titel: Startseite – „Gerade am Lesen“ mit Fortschritt, Fortschritt direkt eintragen
status: Implementiert
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **auf der Startseite alle Bücher sehen, die ich gerade lese, und dort direkt meinen Fortschritt eintragen**, damit **ich nach dem Lesen mit einem Tipp meine Seite speichern kann**.

CEO (2026-11-24, über den Scrum Master): „Gerade am Lesen“: alle Bücher mit Status „am Lesen“ untereinander, je mit Cover, Titel, Autor und Fortschrittsbalken (Seite/Gesamt bzw. %). Antippen der Karte öffnet die Buchdetails. Der Fortschritt soll sich direkt auf der Startseite eintragen lassen. Die Art legt der Anforderungsmanager fest.

## Anforderung (Satzschablone)

- Das System muss auf der Startseite unter dem Kopf (REQ-101) den Bereich „Gerade am Lesen“ mit allen Büchern im Lesestatus *am lesen* (REQ-008) untereinander anzeigen. Die Reihenfolge ist A–Z nach Titel (**Auslegung**, wie die Übersichten REQ-036).
- Jede Karte zeigt Buchcover (ohne Cover den Cover-Platzhalter, REQ-010), Titel, Autor (ohne Autor keine Autorzeile, wie in Buchlisten) und den Lesefortschritt wie in den Buchdetails (REQ-023): Balken und „Seite / Gesamt“ bzw. „x %“. Ohne Seitenanzahl steht an Stelle des Balkens das Herz-Icon wie in REQ-023.
- Wenn der Nutzer die Karte außerhalb des Fortschritts antippt, muss das System die Buchdetails dieses Buches öffnen (REQ-013). Deren Zurück-Pfeil führt zur Startseite (**Auslegung**).
- Wenn der Nutzer den Fortschritt (Balken bzw. Herz-Icon) einer Karte antippt, muss das System auf der Startseite das Menü „Aktuelle Seite“ (REQ-024) für dieses Buch öffnen. Ohne Seitenanzahl erscheint zuerst das Menü „Buchlänge“ (REQ-025), wie in den Buchdetails (**Festlegung des Anforderungsmanagers**, vom CEO übertragen).
- Sichern, Sitzungen, Leeren und Schließen verhalten sich genau wie in REQ-024 und REQ-093. Danach zeigt die Karte den neuen Fortschritt.
- Ändert sich der Lesestatus eines Buches, erscheint es sofort im Bereich bzw. verschwindet daraus.
- Ist kein Buch im Status *am lesen*, muss das System im Bereich „Gerade am Lesen“ einen kurzen Hinweistext anzeigen: „Gerade kein Buch offen“ (CEO, 2026-11-24: „Ein kurzer Hinweis“, Wortlaut nach dem Beispiel des Scrum Masters, auf Zuruf änderbar). Der Hinweis hat keine Funktion beim Antippen (**Auslegung**).

## Akzeptanzkriterien

### AK-1 Alle Bücher „am lesen“
- **Gegeben** „Fourth Wing“ und „Iron Flame“ sind *am lesen*, „Onyx Storm“ ist *ungelesen*
- **Wenn** die Startseite angezeigt wird
- **Dann** zeigt „Gerade am Lesen“ untereinander genau „Fourth Wing“ und „Iron Flame“, je mit Cover, Titel, Autor und Fortschritt

### AK-2 Fortschritt wie in den Buchdetails
- **Gegeben** ein Buch *am lesen* mit 400 Seiten und aktueller Seite 42 bzw. (zweiter Durchlauf) Modus „%“ mit 5 %
- **Wenn** die Karte betrachtet wird
- **Dann** zeigt sie den Balken und „42 / 400“ bzw. „5 %“

### AK-3 Karte öffnet Buchdetails
- **Gegeben** die Karte „Fourth Wing“
- **Wenn** der Nutzer Cover oder Titel antippt
- **Dann** öffnen sich die Buchdetails von „Fourth Wing“

### AK-4 Fortschritt direkt eintragen
- **Gegeben** „Fourth Wing“ mit 400 Seiten, aktuelle Seite 42
- **Wenn** der Nutzer auf der Startseite den Balken antippt, 60 einträgt und „Sichern“ antippt
- **Dann** ist das Menü geschlossen, die Startseite bleibt angezeigt, die Karte zeigt „60 / 400“, und eine Sitzung ist hinzugekommen (REQ-024)

### AK-5 Ohne Seitenanzahl zuerst „Buchlänge“
- **Gegeben** ein Buch *am lesen* ohne Seitenanzahl
- **Wenn** der Nutzer auf der Startseite das Herz-Icon antippt
- **Dann** erscheint das Menü „Buchlänge“ (REQ-025)

### AK-7 Kein Buch „am lesen“
- **Gegeben** kein Buch hat den Status *am lesen*
- **Wenn** die Startseite angezeigt wird
- **Dann** zeigt „Gerade am Lesen“ den Hinweis „Gerade kein Buch offen“ und keine Karte

### AK-6 Statuswechsel wirkt sofort
- **Gegeben** „Onyx Storm“ wird in den Buchdetails auf *am lesen* gesetzt
- **Wenn** der Nutzer zur Startseite wechselt
- **Dann** steht „Onyx Storm“ in „Gerade am Lesen“

## Abgrenzung (nicht Teil dieses REQ)

- Ändern des Lesestatus auf der Startseite.

## Qualitätsanforderungen

- Darstellung in allen Farbdesigns und Stilen (REQ-068, REQ-071).

## Abhängigkeiten

- **REQ-008, REQ-010, REQ-013, REQ-020, REQ-023, REQ-024, REQ-025, REQ-093, REQ-101.**

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->


## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-24 | Erstellt aus CEO-Vision und abgenommener Konzeptskizze, Entwurf | Anforderungsmanager |
| 2026-11-24 | CEO-Antwort „Ein kurzer Hinweis“: ohne Buch *am lesen* der Hinweis „Gerade kein Buch offen“ (AK-7 neu). Keine offenen Fragen. Status Entwurf | Anforderungsmanager |
| 2026-11-24 | Vom CEO bestätigt (wörtlich): „sieht alles super aus! Danke!“. Status „Abgestimmt“ | Anforderungsmanager |
