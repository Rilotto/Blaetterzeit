---
id: REQ-087
titel: Seite „Statistik“ – Zeile „Serie X Tage“
status: Implementiert
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
- **Und** die Flammen in den Buchdetails von Buch A und Buch B zeigen weiterhin nur ihren eigenen Rekord „Längster Streak für dieses Buch“ (je 1, REQ-109)
- **Und** da heute gelesen wurde, ist die Flamme der Statistik angezündet (REQ-108)

## Abgrenzung (nicht Teil dieses REQ)

- Flamme und Streak in den Buchdetails (REQ-027, REQ-109). Zustände der Flamme (angezündet, ausgegraut, erloschen): REQ-108.

## Qualitätsanforderungen

- Siehe REQ-090.

## Abhängigkeiten

- **REQ-027, REQ-024.**
- **REQ-108 (Entwurf):** Die Flamme ist ausgegraut, wenn gestern, aber heute noch nicht gelesen wurde. **REQ-109 (Entwurf):** Der „Streak je Buch“ in AK-4 und in der Abgrenzung wird zum Rekord „Längster Streak für dieses Buch“.

## Offene Fragen

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-22 | Erstellt aus CEO-Festlegungen; bleibt „Entwurf“ wegen F3 (Konflikt mit REQ-027: Streak je Buch) | Anforderungsmanager |
| 2026-11-22 | F3 beantwortet: CEO nimmt den Vorschlag des Scrum Masters an („alright“): Serie auf der Statistikseite buchübergreifend, REQ-027 unverändert. Neu AK-4. Status „Abgestimmt“ | Anforderungsmanager |
| 2026-11-25 | Verweise auf REQ-108 und REQ-109 (Entwurf) unter Abhängigkeiten ergänzt. AKs bleiben bis zur Abstimmung unverändert. Status unverändert | Anforderungsmanager |
| 2026-11-25 | An REQ-108 und REQ-109 angepasst (Abgestimmt, CEO: „beide punkte passen für mich.“): AK-4 nennt den Rekord je Buch und die angezündete Flamme. Abgrenzung angepasst. Status unverändert | Anforderungsmanager |
