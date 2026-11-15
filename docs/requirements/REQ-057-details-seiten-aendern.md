---
id: REQ-057
titel: Reiter „Details“ – Seitenanzahl über die Zeile „Seiten“ ändern
status: Entwurf
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **die Seitenanzahl eines Buches nachträglich ändern**, damit **Fortschritt und Statistik stimmen**.

Vorgabe des CEO (wörtlich, 2026-11-15): „Wenn ich auf "Seiten" klicke, öffnet sich auch das Menü zur Eingabe der Seitenzahl, wie wir es bei erstmaliger Festlegung auch schon umgesetzt haben.“ „Adaptiere die bisher festgelegten Regeln, was bei Sichern passiert etc., wie bisher auch, um Nachfragen zu sparen.“

## Anforderung (Satzschablone)

- Wenn der Nutzer die Zeile „Seiten“ (REQ-056) antippt, muss das System das Menü „Buchlänge“ (REQ-025) über abgedunkelten Buchdetails öffnen; ist eine Seitenanzahl hinterlegt, steht sie im Eingabefeld.
- Wenn der Nutzer „Sichern“ mit einer gültigen Seitenanzahl (ganze Zahl ≥ 1, wie REQ-025) antippt, muss das System sie dauerhaft speichern und das Menü schließen (übertragen aus REQ-025; anders als dort folgt kein Menü „Aktuelle Seite“).
- Wenn der Nutzer das Menü über X oder Tippen außerhalb schließt, darf das System nichts speichern (wie REQ-025).
- Nach dem Sichern muss das System die neue Seitenanzahl überall verwenden: Zeile „Seiten“, Lesefortschrittsbalken (REQ-023), Prozentwert der Statistik-Pille (REQ-026).

## Akzeptanzkriterien

### AK-1 Öffnen mit vorhandenem Wert
- **Gegeben** ein Buch mit Seitenanzahl 608
- **Wenn** der Nutzer die Zeile „Seiten“ antippt
- **Dann** öffnet sich das Menü „Buchlänge“ mit 608 im Eingabefeld

### AK-2 Sichern
- **Gegeben** das Menü „Buchlänge“ wurde über „Seiten“ geöffnet
- **Wenn** der Nutzer 400 eingibt und „Sichern“ antippt
- **Dann** schließt sich das Menü, ohne dass das Menü „Aktuelle Seite“ erscheint
- **Und** die Zeile „Seiten“ zeigt 400, auch nach einem Neustart

### AK-3 Schließen ohne Sichern
- **Gegeben** das Menü „Buchlänge“ wurde über „Seiten“ geöffnet und 400 eingegeben
- **Wenn** der Nutzer X bzw. (zweiter Durchlauf) außerhalb tippt
- **Dann** bleibt die Seitenanzahl 608

### AK-4 Fortschritt folgt der neuen Seitenanzahl
- **Gegeben** ein Buch im Modus „Seite“ mit aktueller Seite 100 und Seitenanzahl 400
- **Wenn** die Seitenanzahl auf 200 geändert wird
- **Dann** zeigt der Lesefortschritt „100 / 200“ und die Statistik-Pille „50 %“

## Abgrenzung (nicht Teil dieses REQ)

- Erstmalige Eingabe der Seitenanzahl (REQ-025).

## Qualitätsanforderungen

- Keine.

## Abhängigkeiten

- **REQ-023, REQ-024, REQ-025, REQ-026, REQ-056.**

## Offene Fragen

- Was soll passieren, wenn die neue Seitenanzahl kleiner ist als die bereits gespeicherte aktuelle Seite? (Frage 6)

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-15 | Erstellt aus CEO-Vorgabe „Reiter Details“ | Anforderungsmanager |
