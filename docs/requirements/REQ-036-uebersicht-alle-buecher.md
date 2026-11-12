---
id: REQ-036
titel: Übersicht „Alle Bücher“ – Fenster mit allen Büchern
status: Entwurf
prioritaet: offen
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **eine Übersicht aller meiner Bücher öffnen**, damit **ich meinen gesamten Bestand auf einen Blick sehe**.

Vorgabe des CEO (wörtlich, 2026-11-12): „Dieses "Alle ansehen >" öffnet im Reiter "Bücher" ein neues Fenster, in dem es eine Übersicht aller Bücher gibt. Die Überschrift "Deine Bücher", die Filterpillen und das + bleiben erhalten (siehe Screenshots).“

Referenzbilder: [referenzen/REF-alle-buecher-01-liste.png](referenzen/REF-alle-buecher-01-liste.png), [referenzen/REF-alle-buecher-02-raster.png](referenzen/REF-alle-buecher-02-raster.png). Optische Übereinstimmung prüft der CEO im Prototyp.

## Anforderung (Satzschablone)

- Das System muss die Übersicht „Alle Bücher“ innerhalb des Reiters „Bücher“ als eigenes Fenster darstellen.
- Das System muss in der Übersicht die Überschrift „Deine Bücher“, die Filterpillen (Filterleiste, REQ-006) und die Plus-Schaltfläche (REQ-005) weiterhin darstellen.
- Das System muss in der Übersicht alle gespeicherten Bücher (REQ-034) darstellen.
- Das System darf die Anzahl der dargestellten Bücher nicht begrenzen.

## Akzeptanzkriterien

### AK-1 Kopfbereich bleibt erhalten
- **Gegeben** die Übersicht „Alle Bücher“ ist geöffnet
- **Wenn** der obere Bereich betrachtet wird
- **Dann** sind die Überschrift „Deine Bücher“, die Filterpillen und die Plus-Schaltfläche sichtbar

### AK-2 Alle Bücher enthalten
- **Gegeben** Bücher mit jedem Lesestatus (REQ-008)
- **Wenn** die Übersicht „Alle Bücher“ geöffnet wird
- **Dann** ist jedes dieser Bücher genau einmal enthalten

### AK-3 Keine Begrenzung
- **Gegeben** 25 gespeicherte Bücher
- **Wenn** die Übersicht vollständig durchgescrollt wird
- **Dann** sind alle 25 Bücher erreichbar

## Abgrenzung (nicht Teil dieses REQ)

- Darstellungsarten Raster/Liste (REQ-037), Suche (REQ-038).

## Qualitätsanforderungen

- Keine genannt.

## Abhängigkeiten

- REQ-005, REQ-006, REQ-007, REQ-008, REQ-013, REQ-034, REQ-035.

## Offene Fragen

- F2: Rückweg aus der Übersicht; Filterpillen im Fenster (aktive Pille, Wirkung, Zahlen).
- F4: Elemente aus dem Screenshot, die der CEO nicht genannt hat („2 Bücher“, Schloss-/Häkchen-Schalter, „Zuletzt“, „Mehr ⌄“); Reihenfolge der Bücher.
- F7: Antippen eines Buches; Rückweg aus den Buchdetails.
- F8: Leerer Zustand der Übersicht.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-12 | Erstellt (Entwurf aus CEO-Vorgabe) | Anforderungsmanager |
