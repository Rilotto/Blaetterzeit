---
id: REQ-025
titel: Buchdetails – Seitenanzahl im Menü „Aktuelle Seite“ abfragen, wenn keine hinterlegt ist
status: Entwurf
prioritaet: offen
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **beim ersten Eintragen meines Fortschritts nach der Seitenanzahl gefragt werden**, damit **der Fortschritt berechnet und angezeigt werden kann**.

Vorgabe des CEO (wörtlich, 2026-11-10): „WICHTIG: Rufe ich dieses Menü auf, ohne dass eine Seitenanzahl für das Buch hinterlegt ist, werde ich in einem kleinen Zusatzfeld danach gefragt. Die Zahl kann ich nur in den späteren Buchdetails ändern (ist eine weitere Erweiterung, kommt später noch dazu).“

## Anforderung (Satzschablone)

- Das System muss zu jedem Buch optional eine Seitenanzahl speichern können (Erweiterung der Buchdaten aus REQ-008).
- Wenn das Menü „Aktuelle Seite“ (REQ-024) für ein Buch ohne Seitenanzahl geöffnet wird, muss das System im Menü ein Zusatzfeld anzeigen, das nach der Seitenanzahl fragt.
- Das System muss die dort eingegebene Seitenanzahl als Seitenanzahl des Buches speichern.
- Wenn für das Buch eine Seitenanzahl hinterlegt ist, darf das System das Zusatzfeld nicht anzeigen; die Seitenanzahl ist im Menü „Aktuelle Seite“ nicht änderbar.

## Akzeptanzkriterien

### AK-1 Zusatzfeld ohne Seitenanzahl
- **Gegeben** ein Buch ohne Seitenanzahl
- **Wenn** das Menü „Aktuelle Seite“ geöffnet wird
- **Dann** enthält es ein Zusatzfeld, das nach der Seitenanzahl fragt

### AK-2 Eingegebene Seitenanzahl wird gespeichert
- **Gegeben** ein Buch ohne Seitenanzahl, das Menü „Aktuelle Seite“ ist geöffnet
- **Wenn** der Nutzer im Zusatzfeld 400 eingibt und „Sichern“ antippt
- **Dann** hat das Buch die Seitenanzahl 400, auch nach Neustart
- **Und** die Buchdetails zeigen den Lesefortschrittsbalken statt des Herz-Icons (REQ-023)

### AK-3 Kein Zusatzfeld bei vorhandener Seitenanzahl
- **Gegeben** ein Buch mit Seitenanzahl
- **Wenn** das Menü „Aktuelle Seite“ geöffnet wird
- **Dann** gibt es kein Zusatzfeld für die Seitenanzahl
- **Und** die Seitenanzahl ist im Menü nicht änderbar

## Abgrenzung (nicht Teil dieses REQ)

- Ändern der Seitenanzahl in den Buchdetails (spätere Erweiterung laut CEO).

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-008, REQ-023, REQ-024.** **ADR-0002.**

## Offene Fragen

- F4: Lage und Aussehen des Zusatzfelds; muss es vor dem Sichern ausgefüllt sein; wird die Seitenanzahl schon ohne „Sichern“ übernommen?
- Priorität.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-10 | Erstellt (Entwurf aus CEO-Beschreibung, Erweiterung 2) | Anforderungsmanager |
