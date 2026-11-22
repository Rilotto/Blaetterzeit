---
id: REQ-079
titel: Seite „Statistik“ – Kopf „Dein Lesen“ und Zeitraum-Pillen
status: In Umsetzung
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **auf der Seite „Statistik“ zwischen Woche, Monat und Jahr wechseln**, damit **ich mein Lesen in dem Zeitraum sehe, der mich gerade interessiert**.

CEO (2026-11-22): Kopf „Dein Lesen“, Teilen-Knopf „nein“; Pillen nur „Wöchentlich“, „Monatlich“, „Jährlich“, „Täglich“ entfällt; aktiv ist immer die zuletzt gewählte Pille (dauerhaft gespeichert). Gestaltung wie in den Screenshots.

Referenzbilder: [referenzen/REF-statistik-01.png](referenzen/REF-statistik-01.png) bis [referenzen/REF-statistik-07-buecher.png](referenzen/REF-statistik-07-buecher.png). Optische Übereinstimmung prüft der CEO im Prototyp.

## Anforderung (Satzschablone)

- Das System muss im Menüpunkt „Statistik“ (REQ-002) die Seite „Statistik“ an Stelle von „under construction :)“ anzeigen.
- Das System muss oben auf der Seite die Überschrift „Dein Lesen“ ohne Teilen-Schaltfläche anzeigen.
- Das System muss darunter genau drei Zeitraum-Pillen in der Reihenfolge „Wöchentlich“, „Monatlich“, „Jährlich“ anzeigen, von denen genau eine aktiv ist.
- Wenn der Nutzer eine Zeitraum-Pille antippt, muss das System sie aktiv setzen, die Zeitraumart (Woche, Monat, Jahr) der ganzen Seite darauf umstellen, den Zeitraum zeigen, der den heutigen Tag enthält, und die Wahl dauerhaft über die Repository-Schnittstelle speichern (ADR-0002).
- Beim Öffnen der Seite muss das System die zuletzt gewählte Zeitraum-Pille aktiv zeigen (auch nach Neustart). Ist noch keine gespeichert, ist „Wöchentlich“ aktiv (Auslegung des Anforderungsmanagers nach REF-statistik-01).

## Akzeptanzkriterien

### AK-1 Kopf ohne Teilen
- **Gegeben** der Nutzer öffnet den Menüpunkt „Statistik“
- **Wenn** die Seite angezeigt wird
- **Dann** steht oben „Dein Lesen“, es gibt keine Teilen-Schaltfläche und kein „under construction :)“

### AK-2 Genau drei Pillen
- **Gegeben** die Seite „Statistik“ ist geöffnet
- **Wenn** die Pillen betrachtet werden
- **Dann** gibt es genau „Wöchentlich“, „Monatlich“, „Jährlich“ in dieser Reihenfolge und keine Pille „Täglich“

### AK-3 Wahl bleibt gespeichert
- **Gegeben** der Nutzer hat „Jährlich“ angetippt
- **Wenn** er die Seite verlässt und wieder öffnet bzw. (zweiter Durchlauf) die App neu startet
- **Dann** ist „Jährlich“ aktiv und es wird das laufende Jahr gezeigt

### AK-4 Erststart
- **Gegeben** es wurde noch nie eine Zeitraum-Pille gewählt
- **Wenn** die Seite geöffnet wird
- **Dann** ist „Wöchentlich“ aktiv und die laufende Woche wird gezeigt

## Abgrenzung (nicht Teil dieses REQ)

- Zeitraum „Täglich“ (entfällt laut CEO).
- Teilen der Statistik (CEO: „nein“).
- Bereich „Wrap-ups · Premium“ aus den Screenshots (entfällt laut CEO).
- Zeitraum-Navigation (REQ-080), Kacheln (REQ-081), Vergleichszeile (REQ-082), Diagramm (REQ-083/084), „Beendet am“ (REQ-085), Lesetage/Serie (REQ-086/087), Kalender (REQ-088/089).

## Qualitätsanforderungen

- Siehe REQ-090 (Farbdesigns und Stile).

## Abhängigkeiten

- **REQ-002** (Menüpunkt „Statistik“), **ADR-0002**, **REQ-090**.

## Offene Fragen

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-22 | Erstellt aus CEO-Festlegungen; Status „Abgestimmt“ (CEO-Bestätigung über Scrum Master). Standardpille „Wöchentlich“ als Auslegung gekennzeichnet | Anforderungsmanager |
