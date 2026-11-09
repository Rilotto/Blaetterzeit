---
id: REQ-001
titel: Farben der App in den Einstellungen über die vier Farbrollen anpassen
status: Entwurf
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

<!-- Priorität vorläufig "Should" (CEO: "später in den Einstellungen") – Bestätigung offen, siehe Offene Fragen. -->

## Ziel / Nutzen

Als **Nutzer** möchte ich **die Farben der App jederzeit in den Einstellungen über ein Theme mit vier Farbrollen ändern können**, damit **die App so aussieht, wie es mir gefällt**.

## Anforderung (Satzschablone)

- Farbrollen, Zuordnung Element → Farbrolle und Standard-Theme sind in REQ-002 festgelegt und werden hier vorausgesetzt.
- Das System muss dem Nutzer in den Einstellungen die Möglichkeit bieten, jede der vier Farbrollen einzeln zu ändern.
- Wenn der Nutzer eine Farbrolle ändert, muss das System alle dieser Farbrolle zugeordneten UI-Elemente in der neuen Farbe darstellen, ohne dass die App neu gestartet werden muss.
- Das System muss das aktive Theme dauerhaft speichern, sodass es nach einem Neustart der App unverändert angewendet wird.
- Das System muss dem Nutzer die Möglichkeit bieten, das aktive Theme auf das Standard-Theme zurückzusetzen. _(vorläufig, Bestätigung offen – F4)_

## Akzeptanzkriterien

<!-- Vorläufig. Werden nach Beantwortung der Offenen Fragen konkretisiert.
     AK-1 (Standard-Theme beim ersten Start) wurde am 2026-11-09 nach REQ-002 AK-1 verschoben; Nummer bleibt frei. -->

### AK-2 Farbrolle ändern wirkt sofort auf alle zugeordneten Elemente
- **Gegeben** das Standard-Theme ist aktiv
- **Wenn** der Nutzer in den Einstellungen die Primärfarbe auf einen anderen Wert ändert
- **Dann** werden alle der Primärfarbe zugeordneten UI-Elemente sofort (ohne Neustart) in der neuen Farbe dargestellt
- **Und** die den anderen drei Farbrollen zugeordneten UI-Elemente bleiben unverändert

### AK-3 Jede Farbrolle einzeln änderbar
- **Gegeben** die Einstellungen sind geöffnet
- **Wenn** der Nutzer nacheinander Primär-, Sekundär-, Hintergrund- und Textfarbe ändert
- **Dann** übernimmt das System jede der vier Änderungen unabhängig voneinander

### AK-4 Theme bleibt nach Neustart erhalten
- **Gegeben** der Nutzer hat mindestens eine Farbrolle geändert
- **Wenn** die App beendet und erneut gestartet wird
- **Dann** sind alle vier Farbrollen mit den zuletzt gewählten Werten belegt

### AK-5 Zurücksetzen auf Standard
- **Gegeben** der Nutzer hat mindestens eine Farbrolle geändert
- **Wenn** der Nutzer „Auf Standard zurücksetzen“ auslöst
- **Dann** sind alle vier Farbrollen wieder mit den Werten des Standard-Themes belegt

## Abgrenzung (nicht Teil dieses REQ)

- Eine Chat-Funktion in der App. „Farben auch hier im Chat ändern“ meint den Entwicklungsprozess (siehe Abhängigkeiten), nicht ein Produktmerkmal.
- Änderung von Schriftart, Schriftgröße, Abständen oder Layout.
- Farben pro einzelnem UI-Element (nur über die vier Farbrollen).
- Teilen/Exportieren von Themes – sofern der CEO nichts anderes festlegt (siehe F2).

## Qualitätsanforderungen

- Lesbarkeit: offen, siehe F5 (z. B. Kontrastwarnung nach WCAG 2.1 AA, Kontrastverhältnis Text/Hintergrund ≥ 4,5 : 1).
- Die Farbänderung muss innerhalb von 1 Sekunde nach Bestätigung sichtbar sein. _(vorläufig)_

## Abhängigkeiten

- **REQ-002** (Farbrollen, Zuordnungstabelle, Standard-Theme, zentrale Definition der Standardwerte) ist Voraussetzung. Konkrete Standardwerte sind kein AK (CLAUDE.md „Farben auf Zuruf“).
- Setzt die Hauptseite „Einstellungen“ voraus (REQ-004; bis zur Umsetzung von REQ-001 dort Platzhalterseite nach REQ-005).
- Persistenz des Themes über die Speicher-Abstraktion (ADR-0002); Theme sollte im Export/Backup enthalten sein (Vision: „Export/Backup muss möglich sein“) – zu bestätigen.

## Offene Fragen

- F1: (nach REQ-002 F1 verschoben) Namen der Farbrollen und Zuordnungstabelle werden in REQ-002 geklärt.
- F2: Nur ein eigenes Theme oder zusätzlich vordefinierte Themes zur Auswahl? Ggf. Aufteilung in eigenen REQ.
- F3: Hell-/Dunkel-Modus – gewünscht? Falls ja, als vordefiniertes Theme oder als eigener Modus mit je vier Farben (ggf. eigener REQ).
- F4: Art der Farbauswahl (Farbwähler, Hex-Eingabe, Palette) und Bestätigung „Zurücksetzen auf Standard“.
- F5: Kontrast-/Lesbarkeitsprüfung bei Nutzeränderung (Warnung, Blockieren oder keine) und Priorität (Standardfarben: siehe REQ-002 F2).

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-08 | Erstellt (Entwurf aus Grundanforderung des CEO) | Anforderungsmanager |
| 2026-11-09 | Farbrollen-Definition, Zuordnung, Standard-Theme und AK-1 nach REQ-002 herausgelöst; REQ-001 behandelt nur noch die Anpassbarkeit in den Einstellungen. Titel angepasst. | Anforderungsmanager |
