---
id: REQ-025
titel: Buchdetails – Seitenanzahl im Menü „Aktuelle Seite“ abfragen, wenn keine hinterlegt ist
status: Abgestimmt
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **beim ersten Eintragen meines Fortschritts nach Seiten nach der Seitenanzahl gefragt werden**, damit **der Fortschritt berechnet und angezeigt werden kann**.

Vorgabe des CEO (wörtlich, 2026-11-10): „WICHTIG: Rufe ich dieses Menü auf, ohne dass eine Seitenanzahl für das Buch hinterlegt ist, werde ich in einem kleinen Zusatzfeld danach gefragt. Die Zahl kann ich nur in den späteren Buchdetails ändern (ist eine weitere Erweiterung, kommt später noch dazu).“

Vom CEO bestätigter Vorschlag (2026-11-10): Im Fortschrittsmodus „Seite“ erscheint ohne Seitenanzahl über dem Eingabefeld ein Zusatzfeld „Seitenanzahl des Buches“ (Ghost, Rahmen GhostFrame). Sichern ist erst möglich, wenn beide Felder gefüllt sind (sonst kurzer Hinweis darunter). Danach ist die Seitenanzahl fest gespeichert. Im Modus „%“ ist keine Seitenanzahl nötig. „Man kann nicht über die festgelegte Seitenanzahl gehen“.

## Anforderung (Satzschablone)

- Das System muss zu jedem Buch optional eine Seitenanzahl speichern können (Erweiterung der Buchdaten aus REQ-008).
- Wenn das Menü „Aktuelle Seite“ (REQ-024) für ein Buch ohne Seitenanzahl im Fortschrittsmodus „Seite“ angezeigt wird, muss das System über dem Eingabefeld der aktuellen Seite ein Zusatzfeld mit der Beschriftung „Seitenanzahl des Buches“ anzeigen (Hintergrund „Ghost“, Rahmen „GhostFrame“).
- Im Fortschrittsmodus „%“ darf das System das Zusatzfeld nicht anzeigen.
- Das System muss als Seitenanzahl nur ganze Zahlen ab 1 annehmen.
- Solange Zusatzfeld oder Eingabefeld der aktuellen Seite leer ist, darf das System nicht sichern und muss darunter einen kurzen Hinweis anzeigen.
- Das System darf keine aktuelle Seite speichern, die größer als die eingegebene Seitenanzahl ist.
- Wenn der Nutzer „Sichern“ antippt und beide Felder gültig gefüllt sind, muss das System die Seitenanzahl dauerhaft als Seitenanzahl des Buches speichern (ADR-0002).
- Wenn das Menü ohne „Sichern“ geschlossen wird, darf das System die eingegebene Seitenanzahl nicht speichern.
- Wenn für das Buch eine Seitenanzahl hinterlegt ist, darf das System das Zusatzfeld nicht anzeigen; die Seitenanzahl ist im Menü „Aktuelle Seite“ nicht änderbar.

## Akzeptanzkriterien

### AK-1 Zusatzfeld ohne Seitenanzahl im Modus „Seite“
- **Gegeben** ein Buch ohne Seitenanzahl
- **Wenn** das Menü „Aktuelle Seite“ im Modus „Seite“ angezeigt wird
- **Dann** steht über dem Eingabefeld ein Zusatzfeld „Seitenanzahl des Buches“ mit Hintergrund „Ghost“ und Rahmen „GhostFrame“
- **Und** nach Wechsel auf „%“ ist das Zusatzfeld nicht sichtbar

### AK-2 Eingegebene Seitenanzahl wird gespeichert
- **Gegeben** ein Buch ohne Seitenanzahl, das Menü „Aktuelle Seite“ ist im Modus „Seite“ geöffnet
- **Wenn** der Nutzer im Zusatzfeld 400 und als aktuelle Seite 42 eingibt und „Sichern“ antippt
- **Dann** hat das Buch die Seitenanzahl 400, auch nach Neustart
- **Und** die Buchdetails zeigen den Lesefortschrittsbalken mit „42 / 400“ statt des Herz-Icons (REQ-023)

### AK-3 Sichern nur mit beiden Feldern
- **Gegeben** ein Buch ohne Seitenanzahl, das Menü ist im Modus „Seite“ geöffnet
- **Wenn** der Nutzer nur eines der beiden Felder füllt und „Sichern“ antippt
- **Dann** wird nichts gespeichert und das Menü bleibt offen
- **Und** darunter erscheint ein kurzer Hinweis

### AK-4 Aktuelle Seite nicht über der Seitenanzahl
- **Gegeben** ein Buch ohne Seitenanzahl, das Menü ist im Modus „Seite“ geöffnet
- **Wenn** der Nutzer Seitenanzahl 300 und aktuelle Seite 301 eingibt und sichern will
- **Dann** wird weder Seitenanzahl noch aktuelle Seite gespeichert

### AK-5 Schließen ohne Sichern verwirft die Seitenanzahl
- **Gegeben** ein Buch ohne Seitenanzahl, der Nutzer hat im Zusatzfeld 400 eingegeben
- **Wenn** er das Menü über X oder Tippen außerhalb schließt
- **Dann** hat das Buch weiterhin keine Seitenanzahl

### AK-6 Kein Zusatzfeld bei vorhandener Seitenanzahl
- **Gegeben** ein Buch mit Seitenanzahl
- **Wenn** das Menü „Aktuelle Seite“ geöffnet wird
- **Dann** gibt es kein Zusatzfeld für die Seitenanzahl
- **Und** die Seitenanzahl ist im Menü nicht änderbar

## Abgrenzung (nicht Teil dieses REQ)

- Ändern der Seitenanzahl in den Buchdetails (spätere Erweiterung laut CEO).
- Wortlaut des kurzen Hinweises (kein Akzeptanzkriterium; prüft der CEO im Prototyp).

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-008, REQ-023, REQ-024.** **ADR-0002.**

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-10 | Erstellt (Entwurf aus CEO-Beschreibung, Erweiterung 2) | Anforderungsmanager |
| 2026-11-10 | CEO-Antworten eingearbeitet: F4 Zusatzfeld „Seitenanzahl des Buches“ über dem Eingabefeld, nur im Modus „Seite“, Farben, Sichern nur mit beiden Feldern, Speicherung erst mit „Sichern“ (AK-1, AK-2 geändert, neu AK-3, AK-4, AK-5; AK-3 alt → AK-6). Priorität Must. Status „Abgestimmt“ (CEO 2026-11-10) | Anforderungsmanager |
