---
id: REQ-087
titel: Seite „Statistik“ – Zeile „Serie X Tage“
status: Abgestimmt
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **meine aktuelle Lesesträhne auf der Statistikseite sehen**, damit **ich motiviert bin, dranzubleiben**.

CEO (2026-11-22): Zeile „Serie X Tage“ = dieselbe Lesesträhne wie in den Buchdetails. Serie zählt nur Tage mit Sessions, nicht nachgetragene Bücher.

## Anforderung (Satzschablone)

- Das System muss unter der Karte mit Kacheln und Diagramm links ein Flammen-Symbol und die Zeile „Serie X Tage“ anzeigen (wie REF-statistik-01).
- X wird nach der Regel von REQ-027 berechnet (lückenlose Lesetage, die heute oder gestern enden; verpasster Tag = 0; Tagesgrenze lokale Gerätezeit; nur Sitzungen zählen), jedoch buchübergreifend: Jeder Kalendertag mit einer Sitzung an irgendeinem Buch ist ein Lesetag. Dies ist eine Ausnahme von REQ-027 nur für die Seite „Statistik“; in den Buchdetails bleibt die Serie je Buch.
- X ist unabhängig vom gezeigten Zeitraum und bezieht sich immer auf heute.

## Akzeptanzkriterien

### AK-1 Serie aus Sitzungen
- **Gegeben** Sitzungen vorgestern, gestern und heute
- **Wenn** die Seite betrachtet wird
- **Dann** steht „Serie 3 Tage“, auch wenn ein vergangener Zeitraum gezeigt wird

### AK-2 Verpasster Tag
- **Gegeben** die letzte Sitzung war vorgestern
- **Wenn** die Seite betrachtet wird
- **Dann** steht „Serie 0 Tage“

### AK-3 Nachgetragenes Buch zählt nicht
- **Gegeben** keine Sitzungen, ein Buch mit „Beendet am“ heute
- **Wenn** die Seite betrachtet wird
- **Dann** steht „Serie 0 Tage“

### AK-4 Buchübergreifend
- **Gegeben** Sitzung gestern nur für Buch A, heute nur für Buch B
- **Wenn** die Seite betrachtet wird
- **Dann** steht „Serie 2 Tage“
- **Und** die Flammen in den Buchdetails von Buch A und Buch B zeigen weiterhin den Streak je Buch (REQ-027)

## Abgrenzung (nicht Teil dieses REQ)

- Flamme und Streak in den Buchdetails (REQ-027) bleiben unverändert.

## Qualitätsanforderungen

- Siehe REQ-090.

## Abhängigkeiten

- **REQ-027, REQ-024.**

## Offene Fragen

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-22 | Erstellt aus CEO-Festlegungen; bleibt „Entwurf“ wegen F3 (Konflikt mit REQ-027: Streak je Buch) | Anforderungsmanager |
| 2026-11-22 | F3 beantwortet: CEO nimmt den Vorschlag des Scrum Masters an („alright“): Serie auf der Statistikseite buchübergreifend, REQ-027 unverändert. Neu AK-4. Status „Abgestimmt“ | Anforderungsmanager |
