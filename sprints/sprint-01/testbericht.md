# Testbericht Sprint 01 – REQ-002 Hauptnavigation, REQ-003 App-Schrift

**Tester:** Subagent `tester` · **Datum:** 2026-11-09 (Runde 2, ergänzt um AK-13 aus Runde 3) · **Branch:** `sprint-01/prototyp-basis`
**Testdateien:**
- `tests/acceptance/REQ-002-hauptnavigation.test.tsx` (75 Testfälle, davon 10 neu in Runde 2 und 8 neu für AK-13)
- `tests/acceptance/REQ-003-schriftart.test.tsx` (14 Testfälle, neu)

**Grundlage:** REQ-002, REQ-003 (Fassung „Zentral definierte App-Schrift“ nach CEO-Anweisung „Ersatzschrift“) und die Schnittstellen-Absprache in `sprints/sprint-01/plan.md` inklusive „Ergänzung (Runde 2)“, „Seitenhintergrund (REQ-002/AK-13, Runde 3)“ und „Schrift (REQ-003, geändert)“. Den Code habe ich nicht als Quelle verwendet.

## Ergebnis auf einen Blick

| | |
|---|---|
| `npm run verify` | **grün**: Typecheck, Lint, 7 Testdateien / 113 Tests bestanden, Traceability OK (3 REQs) |
| Automatischer Teil REQ-002 | 75 von 75 bestanden (inkl. AK-13) |
| Automatischer Teil REQ-003 | 14 von 14 bestanden |
| Mutationsprobe (Wegwerf-Kopie unter `/tmp`, `src/` unverändert) | 11 von 11 eingebauten Fehlern werden erkannt (siehe unten) |
| Manueller Teil | **noch offen** (Prüfliste unten) |
| Empfehlung | Noch **nicht** freigabefähig. REQ-003 ist automatisch vollständig belegt (manuell nur noch Sichtprüfung M-13). Für REQ-002 bleiben Layout-AKs (2, 3, 4, 9, 10, 12) und die Form der Hervorhebung (6) manuell zu prüfen. |

Ausgabe von `npm run verify` (gekürzt):
```
> tsc -b
> oxlint
 ✓ tests/acceptance/REQ-002-hauptnavigation.test.tsx (75 tests)
 ✓ tests/acceptance/REQ-003-schriftart.test.tsx (14 tests)
 ✓ tests/unit/navigation.test.tsx (7 tests)
 ✓ tests/unit/schrift.test.tsx (4 tests)
 ✓ tests/unit/theme.test.tsx (6 tests)
 ✓ tests/contract/inMemory.test.ts (5 tests)
 ✓ tests/unit/book.test.ts (2 tests)
 Test Files  7 passed (7)
      Tests  113 passed (113)
✓ Traceability OK – 3 REQs, davon 0 freigegeben, 0 eingefrorene Testdateien.
```
`tests/regression/` enthält noch keine eingefrorenen Tests (nur `manifest.json`). `tests/retired/` existiert nicht.

## REQ-002 – Testfälle je AK

Neu in Runde 2 ist der Block „Hervorhebung und Farbrollen über --bz-nav-*-Variablen“. Die Farbwerte holt der Test aus der zentralen Definition (`farbrubriken` aus `@/theme`), hart codierte Hexwerte gibt es im Test nicht. Die Zuordnung Rolle → Rubrik stammt aus der REQ-Tabelle: Navigationshintergrund → Hintergrund, Aktivfarbe → Primär, Hervorhebungsfarbe → Sekundär, Inaktivfarbe → Tertiär. Verglichen werden die von jsdom berechneten Farben. Eine Farbänderung auf Zuruf bricht die Tests deshalb nicht, eine falsche Zuordnung von Rolle zu Rubrik wird dagegen erkannt.

| AK | Automatisch geprüft (jsdom) | Manuell nötig | Stand |
|---|---|---|---|
| AK-1 | Genau eine `nav "Hauptnavigation"`, genau 5 Buttons, Beschriftungen und Reihenfolge exakt, auch nach Wechseln | – | **bestanden** |
| AK-2 | `nav` liegt außerhalb von `<main>`. **Neu:** Die 4 `--bz-nav-*`-Variablen sind an der App-Wurzel gesetzt und ergeben jeweils den Wert ihrer Farbrubrik. Der Hintergrund von `nav` referenziert nur `--bz-nav-navigationshintergrund` und ergibt berechnet die Rubrik „Hintergrund“ | M-2 (Position unten) | auto grün, manuell offen |
| AK-3 | Gleicher DOM-Pfad und gleiche Inline-Styles aller 5 Punkte (schwacher Ersatz) | M-3 | auto grün, manuell offen |
| AK-4 | Genau ein Icon und eine Beschriftung je Punkt, Icon steht im DOM vor der Beschriftung | M-4 | auto grün, manuell offen |
| AK-5 | Icon-Zuordnung je Punkt, keine fremden Icons, keine SVG, keine Icon-Bibliothek, CEO-Dateien byte-identisch | M-5 (Sicht) | **bestanden** |
| AK-6 | Für jeden der 5 Punkte als aktiver Punkt: genau ein `[data-highlight]` je Menüpunkt, beim aktiven `="active"`. Es umschließt das Icon bzw. liegt neben ihm und umfasst die Beschriftung nicht (Ersatz für „nicht volle Höhe“). Die Hervorhebung referenziert nur `--bz-nav-hervorhebungsfarbe`, ist nicht verborgen und hat berechnet die Rubrik „Sekundär“. Das Icon referenziert nur `--bz-nav-aktivfarbe` und ergibt berechnet „Primär“. Die nächste Farbquelle der Beschriftung ist genau `var(--bz-nav-aktivfarbe)`, berechnet „Primär“. In der ganzen `nav` stehen keine Farbliterale im Inline-Style | M-6 (Form länglich/abgerundet, Icon sichtbar eingefärbt) | auto grün, manuell offen |
| AK-7 | Für alle inaktiven Punkte: `data-highlight="inactive"` ohne sichtbare Hervorhebungsfarbe. Icon referenziert nur `--bz-nav-inaktivfarbe`, Beschriftung `var(--bz-nav-inaktivfarbe)`, beide berechnet „Tertiär“. Kein `aria-current` | M-7 (Sicht) | **auto vollständig**, Sichtprüfung empfohlen |
| AK-8 | Alle 20 Übergänge für `aria-current`. **Neu:** Wechselfolge Bücher → Profil → Start → Statistik → Bibliothek → Bücher, nach jedem Schritt vollständige Darstellung aktiv/inaktiv (Hervorhebung + Farben) aller 5 Punkte, genau eine aktive Hervorhebung | M-8 (Gerät) | **bestanden** |
| AK-9 | `nav` bleibt bei Wechseln dasselbe Element außerhalb von `<main>` | M-9 | auto grün, manuell offen |
| AK-10 | Voraussetzung `viewport-fit=cover` + `safe-area-inset-bottom` | M-10 | auto grün, manuell offen |
| AK-11 | Nach dem Öffnen ist genau „Start“ aktiv, auch nach vorherigem Wechsel. **Neu:** Beim Öffnen hat genau „Start“ Hervorhebung und Aktivfarbe, die anderen die Inaktivfarbe | – | **bestanden** |
| AK-12 | Text genau „under construction :)“ bei allen 5 Punkten, sichtbar | M-12 | auto grün, manuell offen |
| AK-13 | `--bz-farbe-hintergrund` steht an der App-Wurzel und ergibt die Rubrik „Hintergrund“. Bei jedem der 5 aktiven Punkte ist der berechnete Hintergrund von `<main>` gleich der Rubrik „Hintergrund“ **und** gleich dem berechneten Hintergrund von `nav`. `<main>` setzt `background(-color)` per Inline-Style über `var(--bz-farbe-hintergrund)`, ohne zusätzlichen Farbwert. Kein Element im Inhaltsbereich überdeckt den Hintergrund mit einer eigenen Farbe (alle 5 Ansichten inkl. Platzhalter) | M-14 (Sicht, ganze Fläche) | auto grün, manuell offen |

## REQ-003 – Testfälle je AK

Der konkrete Schriftname ist laut REQ kein AK. Die Tests prüfen weder auf „system-ui“ noch auf eine bestimmte Schrift, und sie hängen von keiner Schriftdatei ab, damit die CI unabhängig vom lokalen Stand ist. Alle CSS-Dateien unter `src/` werden im Test als `<style>` eingehängt, damit eine Schriftfestlegung per CSS nicht übersehen wird.

| AK | Automatisch geprüft (jsdom) | Manuell nötig | Stand |
|---|---|---|---|
| AK-1 | `--bz-schrift` ist an der App-Wurzel gesetzt. Die berechnete Schrift der 5 Beschriftungen und von „under construction :)“ entspricht der zentralen Schrift. Bei jedem der 5 aktiven Punkte haben **alle** Elemente mit eigenem Text die zentrale Schrift. Austauschbarkeit: Wird `--bz-schrift` zentral auf eine Testschrift gesetzt, übernehmen alle Texte sie, ohne dass ein Element angepasst wird | M-13 (Sicht) | **bestanden** |
| AK-2 | Eine Schriftfolge (erkennbar an einer generischen Familie) steht in genau einer Datei unter `src/`, und die liegt in `src/theme/`. Außerhalb von `src/theme/` setzt kein Code `font-family`/`fontFamily`/`font` als Literal, außer `var(--bz-schrift)` oder `inherit`. Zur Laufzeit hat kein gerendertes Element eine eigene Inline-Schrift (geprüft bei allen 5 aktiven Punkten). Kein `@font-face`, kein Schrift-CDN, keine Schriftdatei unter `src/` oder `public/` | – | **bestanden** |
| AK-3 | Die Schriftfolge in `--bz-schrift` endet mit einer generischen Familie (CSS Fonts 4) ohne Anführungszeichen und hat keine leeren Einträge. Die berechnete Schrift der Texte endet ebenfalls generisch | – | **bestanden** |

Hinweis zur Vorgabe „bedingter Skip“ aus Runde 2: Mit der Änderung von REQ-003 entfällt die Schriftdatei. Deshalb gibt es keinen Hash-Vergleich und keinen bedingten Skip. In beiden Testdateien steht kein `.skip`.

## Mutationsprobe (Wirksamkeit der neuen Tests)

Ich habe Fehler in eine Kopie von `src/` unter `/tmp` eingebaut und jeweils `tests/acceptance` ausgeführt. Am Projekt habe ich nichts geändert.

| Eingebauter Fehler | Ergebnis |
|---|---|
| M1 Beschriftung immer in Inaktivfarbe | 7 Tests rot |
| M2 Hervorhebung auch bei inaktiven Punkten | 7 Tests rot |
| M3 Aktivfarbe auf falsche Rubrik (Sekundär) gemappt | 8 Tests rot |
| M4 Nav-Hintergrund als Literal `'white'` | 2 Tests rot |
| M5 Beschriftung mit eigener Schrift `serif` | 10 Tests rot |
| M6 Generischer Fallback am Ende entfernt | 2 Tests rot |
| M7 `fontFamily` an der App-Wurzel fehlt | 7 Tests rot |
| M8 Icon-Farben aktiv/inaktiv vertauscht | 7 Tests rot |
| M9 `<main>` ohne Hintergrund | 6 AK-13-Tests rot |
| M10 `<main>` aus Rubrik Sekundär statt Hintergrund | 6 AK-13-Tests rot |
| M11 Platzhalteransicht mit eigenem Hintergrund `white` | 1 AK-13-Test rot (Überdeckungsprüfung) |

## Manuelle Prüfliste (Prototyp im Browser und Debug-APK auf dem S23 Ultra)

- [ ] **M-2:** Die Leiste sitzt am unteren Bildschirmrand, ihr Hintergrund ist der Navigationshintergrund (Rubrik Hintergrund, aktuell cremefarben).
- [ ] **M-3:** Die fünf Menüpunkte sind gleich breit, im Hoch- und im Querformat. „Bibliothek“ verschiebt nichts.
- [ ] **M-4:** Das Icon steht über der Beschriftung und horizontal mittig zu ihr.
- [ ] **M-5:** Sichtprüfung: Haus → Start, offenes Buch → Bücher, Bücherregal → Bibliothek, Diagramm → Statistik, Person → Profil. Icons scharf, unverzerrt, nicht beschnitten.
- [ ] **M-6:** Aktiver Punkt: Die Hervorhebung ist **länglich und abgerundet**, liegt hinter dem Icon und füllt nicht die volle Höhe (Farbrolle und Lage sind automatisch geprüft, die Form nicht). Das Icon ist **sichtbar** in der Aktivfarbe eingefärbt (Maske greift, nicht schwarz und keine volle Farbfläche).
- [ ] **M-7:** Inaktive Punkte: Icon und Beschriftung im gedeckten Braunton, keine Hervorhebung (Sichtprüfung).
- [ ] **M-8:** Auf dem Gerät: Beim Antippen wechselt die Darstellung sofort. Kein graublaues Tap-Highlight und kein fremdfarbiger Fokusrahmen (siehe Risiko R-3).
- [ ] **M-9:** Inhalt höher als der Bildschirm: Die Leiste bleibt beim Scrollen sichtbar und an ihrer Position. Mit dem kurzen Platzhalter nur behelfsweise prüfbar (Fenster sehr niedrig ziehen oder Inhalt per DevTools einfügen).
- [ ] **M-10:** S23 Ultra mit Gestenleiste **und** 3-Tasten-Navigation: Nichts wird verdeckt, die Leiste verdeckt auch die Systemleiste nicht. Ebenso in Chrome auf dem Handy.
- [ ] **M-12:** „under construction :)“ steht horizontal und vertikal mittig, bei allen 5 Punkten, im Hoch- und Querformat.
- [ ] **M-14 (neu, REQ-002/AK-13):** Der Inhaltsbereich hat bei allen 5 Punkten über die **ganze** Fläche denselben cremefarbenen Ton wie die Leiste, ohne Kante oder Farbsprung zwischen Inhalt und Leiste. Auch der Bereich unter der Statusleiste oben (randlose Darstellung) und ein eventueller Rest des Seitenhintergrunds (`body`) sind nicht weiß, z. B. beim Überscrollen.
- [ ] **M-13 (neu, REQ-003):** Alle Texte erscheinen in einer gut lesbaren serifenlosen Systemschrift (Android: Roboto), Menüleiste und Platzhalter in derselben Schrift. Keine Times/Serifenschrift mehr wie im ersten Prototyp-Stand.

## Gefundene Fehler

Keine Fehler gegen die AKs von REQ-002 (inkl. AK-13) und REQ-003 im automatisch prüfbaren Teil.

## Review des Entwickler-Diffs (Beobachtungen, Risiken)

Den Code habe ich erst nach dem Schreiben der Tests gelesen. Zwei anfängliche Fehlschläge in REQ-003 (AK-2) kamen von meiner zu engen statischen Erkennung: Die Variable wird über einen berechneten Schlüssel gesetzt, `fontFamily` über eine Konstante. Ich habe die Erkennung korrigiert, ohne die Prüfschärfe zu senken; M5 und M7 beweisen das. Die Umsetzung war in diesen Punkten nicht fehlerhaft.

- **R-1 Prozess REQ-003:** Die Priorität ist laut Scrum Master inzwischen festgelegt. Für die Tests ohne Auswirkung, erledigt.
- **R-2 Eingefrorene Tests hängen an Rubrik-IDs:** Der REQ-002-Test greift auf `farbrubriken.hintergrund/primaer/sekundaer/tertiaer` zu (IDs, nicht Anzeigenamen), AK-13 zusätzlich auf den Variablennamen `--bz-farbe-hintergrund` aus der Absprache. Werte und Anzeigenamen dürfen sich auf Zuruf ändern, ohne dass Tests brechen. Benennt der Entwickler aber die **IDs** oder die Variablennamen um, wird der eingefrorene Test rot. → Entwickler: IDs und Variablennamen stabil halten, Umbenennungen nur am Feld `name`.
- **R-3 Tap-Highlight/Fokus:** Laut REQ-002 (Abgrenzung, CEO-Entscheidung) bleiben der Standard-Fokusrahmen und die Tap-Hervorhebung unverändert. Kein Mangel mehr, M-8 bleibt als reine Beobachtung.
- **R-4 Inhaltsbereich weiß:** Erledigt durch REQ-002/AK-13 und umgesetzt. Offen bleibt nur der Bereich außerhalb von `<main>` (`body`/`html`, z. B. Überscroll-Bereich, Statusleiste). In jsdom ist das nicht prüfbar, siehe M-14.
- **R-5 Alter Build:** Ein früherer `dist/` enthielt `fonts/SimpleHandmade.ttf` (Demo-Lizenz). Inzwischen ist er entfernt. Vor dem Prototyp `npm run build` frisch ausführen, damit die Lizenzdatei nicht im Artefakt landet.
- **Behobene Punkte aus Runde 1:** Befund 1 (Schrift) ist durch REQ-003 geregelt und umgesetzt. Befund 5 (Lücke in der Schnittstellen-Absprache) ist durch die Ergänzung in Runde 2 geschlossen, AK-6/7 sind jetzt automatisch geprüft.

## Grenzen der automatischen Tests (ehrlich)

- jsdom berechnet kein Layout: Breiten, Positionen, Zentrierung, Scrollen, Safe-Area, Form und Höhe der Hervorhebung werden nicht gemessen.
- Die Farben werden als berechnete CSS-Werte geprüft, nicht als tatsächlich gerenderte Pixel. Ob die PNG-Maske des Icons im Browser oder in der WebView greift, zeigt nur M-6.
- Ob die Systemschrift tatsächlich geladen und dargestellt wird, ist nicht prüfbar, nur ihre Zuweisung (M-13).
- Bei Kurzschreibweisen (`border`, `background`) erkennt die Literalprüfung nur gängige benannte Farben, nicht alle 148 CSS-Farbnamen.
- Die statische Prüfung in REQ-003/AK-2 löst Bezeichner nicht auf. Das deckt die Laufzeitprüfung ab, allerdings nur für gerenderte Elemente.
