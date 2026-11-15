---
id: REQ-059
titel: Reiter „Details“ – Preis über ein Menü eingeben
status: In Umsetzung
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **eintragen, was ich für das Buch bezahlt habe**, damit **ich meine Ausgaben festhalte**.

Antwort des CEO (wörtlich, 2026-11-15): „In €, Es öffnet sich ein Menü wie bei der Auswahl der Seitenanzahl und die Vorbefüllung ist 0,00 Euro“. Vorgabe: „Adaptiere die bisher festgelegten Regeln, was bei Sichern passiert etc., wie bisher auch“.

## Anforderung (Satzschablone)

- Wenn der Nutzer die Zeile „Preis“ (REQ-056) antippt, muss das System ein Menü nach Muster des Menüs „Buchlänge“ (REQ-025) über abgedunkelten Buchdetails öffnen: Ziehgriff, Überschrift „Preis“, X-Schaltfläche, Eingabefeld, Pille „Sichern“ (**Auslegung**: Überschrift „Preis“).
- Ohne gespeicherten Preis muss das System das Eingabefeld mit „0,00 €“ vorbefüllen; mit gespeichertem Preis steht dieser im Feld.
- Das System muss Beträge in Euro mit zwei Nachkommastellen und Komma als Dezimaltrennzeichen annehmen und anzeigen.
- Wenn der Nutzer „Sichern“ antippt, muss das System den Preis dauerhaft speichern (ADR-0002), das Menü schließen und in der Zeile „Preis“ den Betrag im Format „12,99 €“ anzeigen.
- Wenn der Nutzer das Menü über X oder Tippen außerhalb schließt, darf das System nichts speichern (wie REQ-025).

## Akzeptanzkriterien

### AK-1 Öffnen mit Vorbefüllung
- **Gegeben** ein Buch ohne gespeicherten Preis
- **Wenn** der Nutzer die Zeile „Preis“ antippt
- **Dann** öffnet sich das Menü „Preis“ mit „0,00 €“ im Eingabefeld

### AK-2 Sichern
- **Gegeben** das Menü „Preis“ ist geöffnet
- **Wenn** der Nutzer 12,99 eingibt und „Sichern“ antippt
- **Dann** schließt sich das Menü
- **Und** die Zeile „Preis“ zeigt „12,99 €“, auch nach einem Neustart

### AK-3 Gespeicherter Preis beim erneuten Öffnen
- **Gegeben** ein Buch mit gespeichertem Preis 12,99 €
- **Wenn** der Nutzer die Zeile „Preis“ antippt
- **Dann** steht „12,99 €“ im Eingabefeld

### AK-4 Schließen ohne Sichern
- **Gegeben** das Menü „Preis“ ist geöffnet und 20,00 eingegeben, gespeichert ist 12,99 €
- **Wenn** der Nutzer X bzw. (zweiter Durchlauf) außerhalb tippt
- **Dann** zeigt die Zeile „Preis“ weiterhin „12,99 €“

## Abgrenzung (nicht Teil dieses REQ)

- Andere Währungen.

## Qualitätsanforderungen

- Keine.

## Abhängigkeiten

- **REQ-025, REQ-056.**

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-15 | Erstellt aus CEO-Antwort 2.3 | Anforderungsmanager |
| 2026-11-15 | Status „Abgestimmt“ (CEO 2026-11-15, über den Scrum Master: „Der Rest ist in Ordnung.“) | Anforderungsmanager |
