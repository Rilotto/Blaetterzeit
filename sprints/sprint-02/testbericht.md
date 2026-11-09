# Testbericht Sprint 02 – REQ-004 Platzhaltertext in Farbrubrik Tertiär

**Tester:** Subagent `tester` · **Datum:** 2026-11-09 · **Branch:** `sprint-02/buecher-grundgeruest`
**Testdatei:** `tests/acceptance/REQ-004-platzhaltertext-tertiaer.test.tsx` (15 Testfälle, neu)

**Grundlage:** REQ-004 (Status „Abgestimmt“) und die Schnittstellen-Absprache in `sprints/sprint-02/plan.md`, Abschnitt „REQ-004“. Die Testfälle habe ich aus dem REQ-Text abgeleitet, nicht aus dem Code. Im Test stehen keine Hexwerte, alle Sollfarben kommen aus `@/theme` (`farbrubriken`).

REQ-005 bis REQ-007 haben den Status „Entwurf“. Sie sind nicht Gegenstand dieses Berichts.

## Ergebnis auf einen Blick

| | |
|---|---|
| `npm run verify` | **grün**: Typecheck, Lint, 8 Testdateien / 128 Tests bestanden, Traceability OK (7 REQs) |
| REQ-004 automatisch | 15 von 15 bestanden |
| Regression REQ-002 / REQ-003 | 75 von 75 und 14 von 14 bestanden, `tests/regression/` ist noch leer (kein Release) |
| Gegenprobe gegen den Stand vor der Änderung | 7 von 15 Tests schlagen fehl (alle AK-1- und AK-3-Kerntests). Geprüft in einer Wegwerf-Kopie unter `/tmp`, `src/` blieb unverändert |
| Manueller Teil | M-1 offen (siehe unten) |
| Empfehlung | REQ-004 ist **automatisch vollständig belegt**. Freigabefähig nach Sichtprüfung M-1 im Prototyp |

Ausgabe von `npm run verify` (gekürzt):

```
> tsc -b
> oxlint
 ✓ tests/acceptance/REQ-002-hauptnavigation.test.tsx (75 tests)
 ✓ tests/acceptance/REQ-004-platzhaltertext-tertiaer.test.tsx (15 tests)
 ✓ tests/acceptance/REQ-003-schriftart.test.tsx (14 tests)
 ✓ tests/unit/theme.test.tsx (6 tests)
 ✓ tests/unit/navigation.test.tsx (7 tests)
 ✓ tests/unit/schrift.test.tsx (4 tests)
 ✓ tests/contract/inMemory.test.ts (5 tests)
 ✓ tests/unit/book.test.ts (2 tests)
 Test Files  8 passed (8)
      Tests  128 passed (128)
✓ Traceability OK – 7 REQs, davon 0 freigegeben, 0 eingefrorene Testdateien.
```

## Ergebnis je Akzeptanzkriterium

| AK | Ergebnis | Testfälle (Kurzform) |
|---|---|---|
| AK-1 Platzhaltertext in Rubrik Tertiär | **bestanden** | Text steht in einem Element innerhalb von `<main>` · berechnete Textfarbe = Rubrik „Tertiär“ in jeder Platzhalteransicht · Inline-Style genau `var(--bz-farbe-tertiaer)`, gesetzt innerhalb von `<main>` · kein Farbliteral und kein Ausweichwert `var(…, #…)` · App-Wurzel und `<main>` setzen keine Textfarbe (Absprache) · Laufzeitprobe: wird `--bz-farbe-tertiaer` an der Wurzel umgesetzt, geht der Text mit (das schließt einen fest eingesetzten Wert aus, der zufällig gleich ist) · gleiche Farbe wie `--bz-nav-inaktivfarbe` |
| AK-2 hebt sich vom Hintergrund ab | **bestanden** | Standardwerte „Tertiär“ und „Hintergrund“ sind verschieden · Textfarbe ≠ berechneter Hintergrund von `<main>` in jeder Platzhalteransicht · keine Transparenz, `opacity: 0`, `visibility: hidden` oder `display: none` · kein Zwischenelement mit Hintergrund in der Rubrik „Tertiär“ |
| AK-3 Rubrikänderung wirkt | **bestanden** | Der Wert `farbrubriken.tertiaer.wert` wird an der zentralen Stelle vor dem Laden der App geändert (Module neu geladen). Der Platzhaltertext zeigt danach den neuen Wert und nicht mehr den alten (zwei Varianten) · der neue Wert wirkt gleichzeitig auf die Inaktivfarbe der Navigation · Gegenprobe: eine Änderung von „Hintergrund“ lässt die Textfarbe unverändert |

**Geltungsbereich:** Nach AK-1 („Zielansicht zeigt den Platzhaltertext“) prüfen die Tests jede Ansicht, die den Platzhaltertext zeigt. Mindestens eine solche Ansicht muss es geben, sonst schlägt der Test fehl. Wird „Bücher“ durch REQ-005 zu einer echten Ansicht, bleiben die REQ-004-Tests deshalb gültig.

### Manuelle Prüfung (jsdom kann keine echte Darstellung prüfen)

- **M-1 (AK-2):** Den Prototyp im Browser und als APK öffnen und auf jeder Platzhalteransicht prüfen, ob „under construction :)“ lesbar ist, auch im Dunkelmodus des Systems. **Offen.**
  Begründung: Der ursprüngliche Befund (Text unsichtbar) ließ sich in jsdom nicht nachstellen. Vor der Änderung hatte der Text dort die Standardfarbe und nicht die Hintergrundfarbe, die AK-2-Tests waren also schon vorher grün. AK-2 ist automatisch nur als notwendige Bedingung belegt.

## Code-Review (Diff des Entwicklers)

Der Diff betrifft nur `src/views/UnderConstruction.tsx`: Das `<p>` bekommt `color: rubrikFarbe('tertiaer')`, also `var(--bz-farbe-tertiaer)`. Das entspricht der Absprache. Es gibt keine Nebenwirkungen auf die Navigation, den Hintergrund oder die Schrift. Die CSS-Dateien enthalten keine `color`-Regel, die das Inline-Style überschreiben würde.

- **Hinweis (kein Fehler):** Der Import erfolgt relativ (`'../theme/farben'`), `App.tsx` dagegen nutzt `'@/theme'`. Das ist nur eine Stilfrage und funktional ohne Wirkung.

## Gefundene Fehler

Keine.

## Prüfung: Kollision mit den bestehenden REQ-002- und REQ-003-Tests

Ich habe alle Tests aus REQ-002 und REQ-003 geprüft, die `<main>`, Farben oder den Platzhalter betreffen. **Keiner kollidiert mit REQ-004.** Ich habe keinen bestehenden Test geändert.

| Bestehender Test | Was er prüft | Verhältnis zu REQ-004 |
|---|---|---|
| `[REQ-002/AK-13] kein Element im Inhaltsbereich überdeckt den Hintergrund mit einer eigenen Farbe` | nur `background` / `background-color` | Er prüft keine Textfarbe, deshalb keine Kollision. |
| `[REQ-002/AK-13] <main> bezieht den Hintergrund per var(--bz-farbe-hintergrund)` | nur den Hintergrund von `<main>` | keine Kollision |
| `[REQ-002/AK-2/6/7] Farben sind zentral in src/theme/ definiert` | keine Farbliterale außerhalb von `src/theme/` | `var(--bz-farbe-tertiaer)` ist kein Literal, deshalb verträglich |
| `[REQ-002/AK-6/7] keine Farbliterale im Inline-Style der Navigation` | nur `<nav>` | nicht betroffen |
| `[REQ-002/AK-12] … zeigt genau "under construction :)"` | Textinhalt und Sichtbarkeit | Textfarbe nicht geprüft, deshalb keine Kollision |
| REQ-003 (App-Schrift) | nur Schrift | nicht betroffen |

## Risiken für die weitere Sprintarbeit (nicht REQ-004, an den Scrum Master)

1. **REQ-002/AK-12-Test gegen REQ-005 („Bücher“-Seite).** Der Test `it.each(LABELS)('[REQ-002/AK-12] bei aktivem "%s" zeigt der Inhaltsbereich genau "under construction :)"')` verlangt den Platzhalter für **alle fünf** Menüpunkte, also auch für „Bücher“. REQ-002/AK-12 gilt aber nur, solange die Zielansicht „noch nicht definiert“ ist. Sobald REQ-005 umgesetzt ist, wird dieser Test rot, obwohl REQ-002 das nicht verlangt. Das ist nach der Regel im Auftrag ein Fall, in dem ein Test etwas prüft, was REQ-002 nicht verlangt. Ich schlage vor, den Test auf Menüpunkte ohne definierte Zielansicht einzuschränken, wenn REQ-005 abgestimmt ist. Ich ändere ihn erst nach Auftrag, mit Begründung im Bericht. Jetzt ändere ich ihn nicht, weil REQ-005 noch „Entwurf“ ist und der Test derzeit fachlich stimmt.
2. **REQ-002/AK-13-Test „kein Element im Inhaltsbereich überdeckt den Hintergrund“** prüft **jedes** Element in `<main>`. Bekommt die Bücher-Seite z. B. einen Plus-Button mit Hintergrund in „Primär“ (REQ-005), wird dieser Test rot. REQ-002/AK-13 verlangt nur, dass der **Hintergrund des Inhaltsbereichs** der Navigation entspricht, nicht dass kein Element darin eine Fläche hat. Hier braucht es eine Auslegungsentscheidung. Ich empfehle, sie mit der Abstimmung von REQ-005 über den Anforderungsmanager zu klären.
3. **Testtechnik AK-3:** Die Tests laden die Module per `vi.resetModules()` neu, um die Änderung „an der zentralen Stelle“ nachzubilden. Das funktioniert, solange `farbrubriken` ein veränderliches, exportiertes Objekt bleibt. Macht der Entwickler es unveränderlich (`Object.freeze`, `as const`), muss der Test angepasst werden. Das wäre dann kein Produktfehler.
