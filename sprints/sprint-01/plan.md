# Sprint 01 – Erster Prototyp

**Sprintziel (CEO, 2026-11-09):** Erster Prototyp als Artefakt in Claude, bestehend aus:
- dem Grundaufbau der App,
- der festgelegten Schrift und den Farben,
- den Icons in der Hauptleiste,
- Platzhalterseiten für alle noch nicht bearbeiteten Seiten.

**Sprintlänge / Ende:** _wird mit dem CEO festgelegt_. Am Sprintende wird der Prototyp geliefert.

## Vorbereitende Infrastruktur
- [x] App-ID auf `de.blaetterzeit` umstellen (CEO-Entscheidung)

## REQs
| REQ | Titel | Status |
|---|---|---|
| REQ-002 | Untere Hauptnavigation | In Umsetzung (abgestimmt 2026-11-09) |
| REQ-003 | Zentral definierte App-Schrift (Ersatzschrift) | In Umsetzung (CEO-Anweisung 2026-11-09) |

Nicht in diesem Sprint: REQ-001 Themes (Could, späterer Prototyp).

## Schnittstellen-Absprache Entwickler ↔ Tester (REQ-002)
Damit Tests und Code unabhängig entstehen können, gilt diese von außen prüfbare Struktur:
- Die Hauptnavigation ist ein `<nav aria-label="Hauptnavigation">`.
- Sie enthält genau fünf `<button>`-Elemente. Ihr zugänglicher Name ist die Beschriftung: Start, Bücher, Bibliothek, Statistik, Profil.
- Der aktive Menüpunkt hat `aria-current="page"`, alle anderen haben kein `aria-current`.
- Jeder Menüpunkt enthält ein Icon-Element mit `data-icon="<Dateiname>"`, z. B. `data-icon="icon-haus.png"`, und ein Beschriftungs-Element.
- Der Inhaltsbereich ist ein `<main>`.
- Farben kommen aus `src/theme/` (zentrale Farbrubriken).
- **Ergänzung (Runde 2):**
  - Die Hervorhebung hinter dem Icon ist ein eigenes Element mit `data-highlight`. Beim aktiven Menüpunkt hat sie `data-highlight="active"`, sonst `data-highlight="inactive"`.
  - Die Navigationsrollen werden als CSS-Variablen gesetzt: `--bz-nav-navigationshintergrund`, `--bz-nav-hervorhebungsfarbe`, `--bz-nav-aktivfarbe` und `--bz-nav-inaktivfarbe`.
  - Icon, Beschriftung, Hervorhebung und `<nav>` referenzieren ihre Farbe ausschließlich über diese Variablen (Inline-Style `var(--bz-nav-…)`).
- **Seitenhintergrund (REQ-002/AK-13, Runde 3):** Das `<main>` setzt seinen Hintergrund per Inline-Style `var(--bz-farbe-hintergrund)`, also direkt aus der Farbrubrik „Hintergrund“. Die Navigationsrolle `--bz-nav-navigationshintergrund` zeigt auf dieselbe Rubrik.
- **Schrift (REQ-003, geändert auf CEO-Anweisung):** Die App-Schrift ist genau an einer Stelle definiert, in `src/theme/schrift.ts`, als CSS-Variable `--bz-schrift` an der App-Wurzel. Der Wert endet mit einer generischen Ersatzschrift. Es gibt kein `@font-face` und keine Schriftdatei. Aktuell gilt die Systemschrift, der konkrete Schriftname ist kein Akzeptanzkriterium.

## Risiken
- Schrift und Icons müssen offline funktionieren, also lokal eingebunden sein und nicht von einem CDN geladen werden.
- Im Prototyp läuft der Web-Build im Browser. Die Darstellung auf dem S23 Ultra kann leicht abweichen, deshalb ist die Debug-APK als Gegenprobe sinnvoll.
