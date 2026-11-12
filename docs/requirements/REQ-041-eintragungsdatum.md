---
id: REQ-041
titel: Buchdaten – Eintragungsdatum speichern
status: In Umsetzung
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich, **dass die App sich merkt, wann ich ein Buch eingetragen habe**, damit **der Abschnitt „Alle Bücher“ die neuesten Bücher zuerst zeigt**.

Antwort des CEO (wörtlich, 2026-11-12, F1): „… die neuesten eingetragenen immer links vorn. … Die Bücher wandern also mit älterwerdendem "Eintragungsdatum" nach rechts.“

Befund: Die Buchdaten (REQ-008, `src/domain/buch.ts`) enthalten bisher kein Eintragungsdatum.

## Anforderung (Satzschablone)

- Wenn ein Buch angelegt wird (REQ-031), muss das System den Zeitpunkt des Anlegens als Eintragungsdatum des Buches speichern.
- Das System muss das Eintragungsdatum dauerhaft mit dem Buch speichern (REQ-034, ADR-0002).
- Das System darf dem Nutzer keine Möglichkeit bieten, das Eintragungsdatum zu ändern.

## Akzeptanzkriterien

### AK-1 Gesetzt beim Anlegen
- **Gegeben** das Blatt „Manueller Eintrag“
- **Wenn** der Nutzer ein Buch mit „Hinzufügen“ anlegt
- **Dann** hat das Buch ein Eintragungsdatum mit dem Zeitpunkt des Anlegens

### AK-2 Dauerhaft
- **Gegeben** ein angelegtes Buch
- **Wenn** die App neu gestartet wird
- **Dann** hat das Buch dasselbe Eintragungsdatum

## Abgrenzung (nicht Teil dieses REQ)

- Anzeige des Eintragungsdatums; Sortieren/Filtern danach (To-do-Liste, Sortierknopf „Zuletzt“).

## Qualitätsanforderungen

- Keine genannt.

## Abhängigkeiten

- REQ-008, REQ-031, REQ-034, REQ-035.

## Offene Fragen

- Keine. Bücher ohne Eintragungsdatum gibt es nicht (CEO: „gibt es nicht, entfällt daher da neue App“); keine Übernahme von Altbeständen nötig.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-12 | Erstellt aus CEO-Antwort F1 | Anforderungsmanager |
