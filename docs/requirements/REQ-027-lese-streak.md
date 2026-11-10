---
id: REQ-027
titel: Buchdetails – Lese-Streak „Tage in Folge“ in der Flamme
status: Entwurf
prioritaet: offen
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **sehen, an wie vielen aufeinanderfolgenden Tagen ich dieses Buch gelesen habe**, damit **ich motiviert bin, dranzubleiben**.

Vorgabe des CEO (wörtlich, 2026-11-10): „Links sehen wir eine Flamme. Übernehme diese bitte so. Wenn ich einen Tag lese, kommt in der Flamme die Zahl 1. Dies ist eine Streak-Funktion. Bei zwei aufeinanderfolgenden Tagen, an denen ich das Buch gelesen habe, kommt dann eine 2 usw. Verpasse ich einen Tag dazwischen, erlischt der Streak und geht auf 0.“

Referenzbild: [referenzen/REF-buchdetails-01.png](referenzen/REF-buchdetails-01.png).

## Anforderung (Satzschablone)

- Das System muss im linken Teil der Statistik-Pille (REQ-026) eine Flamme wie im Referenzbild darstellen, nachgebildet im Stil der übrigen Icons der App.
- Das System muss in der Flamme die Anzahl der aufeinanderfolgenden Tage darstellen, an denen der Nutzer dieses Buch gelesen hat (Streak).
- Wenn der Nutzer an einem Tag zwischen zwei Lesetagen dieses Buch nicht gelesen hat, muss das System den Streak auf 0 setzen.
- Das System muss den Streak je Buch führen.

## Akzeptanzkriterien

### AK-1 Ein Lesetag ergibt 1
- **Gegeben** ein Buch ohne bisherigen Lesetag
- **Wenn** der Nutzer heute liest
- **Dann** zeigt die Flamme 1

### AK-2 Aufeinanderfolgende Tage zählen hoch
- **Gegeben** der Nutzer hat das Buch gestern und heute gelesen
- **Wenn** die Buchdetails angezeigt werden
- **Dann** zeigt die Flamme 2

### AK-3 Verpasster Tag setzt auf 0
- **Gegeben** der Nutzer hat das Buch vorgestern gelesen, gestern nicht und heute noch nicht
- **Wenn** die Buchdetails angezeigt werden
- **Dann** zeigt die Flamme 0

### AK-4 Streak gilt je Buch
- **Gegeben** der Nutzer hat gestern und heute nur Buch A gelesen
- **Wenn** die Buchdetails von Buch B angezeigt werden
- **Dann** zeigt die Flamme von Buch B 0

## Abgrenzung (nicht Teil dieses REQ)

- Buchübergreifende Streaks.

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-024:** Sitzungen mit Datum. **REQ-026:** Statistik-Pille.

## Offene Fragen

- F6: Was zählt als „an einem Tag gelesen“; wann beginnt ein neuer Tag; Aussehen der Flamme bei 0 und bei laufendem Streak.
- Priorität.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-10 | Erstellt (Entwurf aus CEO-Beschreibung, Erweiterung 3) | Anforderungsmanager |
