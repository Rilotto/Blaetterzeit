---
id: REQ-090
titel: Seite „Statistik“ – Gestaltung aus Farbrubriken, in allen Farbdesigns und Stilen
status: In Umsetzung
prioritaet: Should
art: qualitaet
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich, dass **die Seite „Statistik“ zu meinem gewählten Design passt**, damit **die App einheitlich wirkt**.

CEO (2026-11-22): Gestaltung wie in den Screenshots, mit bestehenden Farbrubriken. Muss in allen Farbdesigns und in den Stilen Klassisch/Feuilleton funktionieren (REQ-068/071).

## Anforderung (Satzschablone)

- Das System muss alle Farben der Seite „Statistik“ (REQ-079 bis REQ-089) aus Farbrubriken beziehen; einzige neue Farbrubrik ist „Gold“ (REQ-084).
- Das System muss die Seite in jedem Farbdesign (REQ-068) und in beiden Stilen „Klassisch“ und „Feuilleton“ (REQ-071) mit allen Elementen lesbar darstellen; im Stil „Feuilleton“ gelten dessen Regeln (Linien statt Karten, Text mit Unterstrich statt Pillen).

## Akzeptanzkriterien

### AK-1 Farbdesigns
- **Gegeben** die Seite „Statistik“ mit Daten in allen Bereichen
- **Wenn** nacheinander jedes Farbdesign gewählt wird
- **Dann** ändern sich die Farben aller Elemente der Seite entsprechend, und kein Element hat eine fest eingetragene Farbe

### AK-2 Stil „Feuilleton“
- **Gegeben** Stil „Feuilleton“ ist gewählt
- **Wenn** die Seite „Statistik“ angezeigt wird
- **Dann** erscheinen Karten als Linien und Pillen als unterstrichener Text wie in den übrigen Seiten im Stil „Feuilleton“

## Abgrenzung (nicht Teil dieses REQ)

- Konkrete Farbwerte (Farben auf Zuruf).

## Qualitätsanforderungen

- Dieser REQ ist selbst eine Qualitätsanforderung.

## Abhängigkeiten

- **REQ-068, REQ-069, REQ-071, REQ-065.**

## Offene Fragen

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-22 | Erstellt aus CEO-Festlegungen; Status „Abgestimmt“ | Anforderungsmanager |
