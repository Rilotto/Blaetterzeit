---
id: REQ-104
titel: Startseite – Jahresziel „X von Y Büchern“ mit Blatt zum Festlegen
status: Implementiert
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **ein Jahresziel für gelesene Bücher festlegen und meinen Stand sehen**, damit **ich mein Leseziel im Blick behalte**.

CEO (2026-11-24, über den Scrum Master): Kachel „X von Y Büchern 2026“, gelesene Bücher im laufenden Jahr gegen das Jahresziel. Antippen öffnet ein Blatt mit Zahlenfeld und „Sichern“ wie bei Verlag. Ohne Ziel zeigt die Kachel „Jahresziel festlegen“.

## Anforderung (Satzschablone)

- Das System muss je Kalenderjahr optional ein Jahresziel (ganze Zahl ≥ 1, **Auslegung**) dauerhaft über die Repository-Schnittstelle speichern (ADR-0002). Ein Ziel gilt nur für sein Jahr. Im neuen Jahr gibt es zunächst kein Ziel (**Auslegung**: „Jahresziel 2026“ bezieht sich auf das Jahr).
- Das System muss auf der Startseite eine Kachel Jahresziel anzeigen:
  - mit Ziel: „X von Y Büchern <laufendes Jahr>“, z. B. „7 von 20 Büchern 2026“,
  - ohne Ziel: „Jahresziel festlegen“.
- X ist die Zahl der im laufenden Jahr beendeten Bücher, gezählt wie „Bücher“ in der Statistik für das Jahr (REQ-081: „Beendet am“ im Jahr, Status *gelesen*). Nachgetragene Bücher zählen mit (REQ-085).
- Wenn der Nutzer die Kachel antippt, muss das System ein Blatt nach dem Muster „Verlag“ (REQ-063) mit einem Zahlenfeld (vorbefüllt mit dem Ziel, ohne Ziel leer) und „Sichern“ anzeigen.
- „Sichern“ mit gültiger Zahl speichert das Ziel und schließt das Blatt. Eine ungültige Eingabe (0, keine ganze Zahl) wird hervorgehoben wie in REQ-063 und nicht gespeichert. Ein leeres Feld entfernt das Ziel (REQ-093). Schließen ohne „Sichern“ verwirft.
- Übertrifft X das Ziel, zeigt die Kachel weiter „X von Y Büchern“ (**Auslegung**).

## Akzeptanzkriterien

### AK-1 Ohne Ziel
- **Gegeben** für 2026 ist kein Jahresziel gespeichert
- **Wenn** die Startseite angezeigt wird
- **Dann** zeigt die Kachel „Jahresziel festlegen“

### AK-2 Ziel festlegen
- **Gegeben** kein Jahresziel, heute ist der 24.11.2026
- **Wenn** der Nutzer die Kachel antippt, 20 einträgt und „Sichern“ antippt
- **Dann** zeigt die Kachel „X von 20 Büchern 2026“, auch nach einem Neustart

### AK-3 Zählung wie in der Statistik
- **Gegeben** 2026 sind drei Bücher *gelesen* mit „Beendet am“ in 2026, eines davon nachgetragen, und ein Buch mit „Beendet am“ in 2025
- **Wenn** die Kachel mit Ziel 20 angezeigt wird
- **Dann** zeigt sie „3 von 20 Büchern 2026“, dieselbe Zahl wie „Bücher“ in der Statistik für 2026

### AK-4 Ungültig, leeren, verwerfen
- **Gegeben** das Blatt mit Ziel 20 ist geöffnet
- **Wenn** der Nutzer 0 einträgt und „Sichern“ antippt
- **Dann** ist das Feld hervorgehoben und das Ziel bleibt 20
- **Und** leert er das Feld und tippt „Sichern“, zeigt die Kachel „Jahresziel festlegen“
- **Und** schließt er das Blatt nach einer Änderung ohne „Sichern“, bleibt das Ziel unverändert

### AK-5 Neues Jahr
- **Gegeben** für 2026 ist das Ziel 20 gespeichert, heute ist der 01.01.2027
- **Wenn** die Startseite angezeigt wird
- **Dann** zeigt die Kachel „Jahresziel festlegen“

## Abgrenzung (nicht Teil dieses REQ)

- Jahresziel für Seiten.
- Anzeige des Jahresziels in der Statistik.

## Qualitätsanforderungen

- Darstellung in allen Farbdesigns und Stilen (REQ-068, REQ-071).

## Abhängigkeiten

- **REQ-063, REQ-081, REQ-085, REQ-093, REQ-101, ADR-0002.**

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-24 | Erstellt aus CEO-Vision und abgenommener Konzeptskizze, Entwurf | Anforderungsmanager |
| 2026-11-24 | Vom CEO bestätigt (wörtlich): „sieht alles super aus! Danke!“. Status „Abgestimmt“ | Anforderungsmanager |
