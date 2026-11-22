---
id: REQ-082
titel: Seite „Statistik“ – Vergleichszeile gegenüber dem vorherigen Zeitraum
status: Entwurf
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **sehen, wie viel mehr oder weniger ich als im vorherigen Zeitraum gelesen habe**, damit **ich Entwicklungen erkenne**.

CEO (2026-11-22): „Vergleichszeile je Zeitraum gegenüber dem vorherigen gleichen Zeitraum, z. B. ‚+608 vs. 2025‘, ‚−608 vs. Oktober‘. Minus ist erlaubt.“

## Anforderung (Satzschablone)

- Das System muss unter der großen Kennzahl (REQ-081) eine Vergleichszeile anzeigen: Differenz der Kennzahl der gewählten Kachel zwischen gezeigtem Zeitraum und dem unmittelbar vorherigen Zeitraum derselben Art, mit Vorzeichen „+“ bzw. „−“, gefolgt von „vs.“ und der Bezeichnung des vorherigen Zeitraums.
- Bezeichnung im Monat: ausgeschriebener Monatsname (z. B. „vs. Oktober“); im Jahr: das Jahr (z. B. „vs. 2025“).

## Akzeptanzkriterien

### AK-1 Jahr mit Zuwachs
- **Gegeben** „Jährlich“, gezeigt wird 2026 mit 608 Seiten, 2025 hatte 0 Seiten, „Seiten“ gewählt
- **Wenn** die Karte betrachtet wird
- **Dann** lautet die Vergleichszeile „+608 vs. 2025“

### AK-2 Monat mit Rückgang
- **Gegeben** „Monatlich“, gezeigt wird November mit 0 Seiten, Oktober hatte 608 Seiten
- **Wenn** die Karte betrachtet wird
- **Dann** lautet die Vergleichszeile „−608 vs. Oktober“

### AK-3 Kachel „Bücher“
- **Gegeben** „Jährlich“, 2026 mit 1 beendetem Buch, 2025 mit 0, „Bücher“ gewählt
- **Wenn** die Karte betrachtet wird
- **Dann** lautet die Vergleichszeile „+1 vs. 2025“

## Abgrenzung (nicht Teil dieses REQ)

- Berechnung der Kennzahlen (REQ-081, REQ-084).

## Qualitätsanforderungen

- Siehe REQ-090.

## Abhängigkeiten

- **REQ-080, REQ-081.**

## Offene Fragen

- F1: Wie lautet die Bezeichnung des vorherigen Zeitraums in der Wochenansicht?
- F2: Was zeigt die Vergleichszeile, wenn die Differenz 0 ist?

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-22 | Erstellt aus CEO-Festlegungen; bleibt „Entwurf“ wegen F1/F2 (Wochenbezeichnung und Differenz 0 vom CEO nicht festgelegt) | Anforderungsmanager |
