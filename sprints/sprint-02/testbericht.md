# Testbericht Sprint 02 – Seite „Bücher“ (REQ-005 bis REQ-012) und REQ-004

**Tester:** Subagent `tester` · **Datum:** 2026-11-09 · **Branch:** `sprint-02/buecher-grundgeruest`
**Grundlage:** REQ-005 bis REQ-012 (Status „In Umsetzung“) und die verbindliche Schnittstellen-Absprache in `sprints/sprint-02/plan.md`, Abschnitt „REQ-005 bis REQ-012 (Seite „Bücher“), Runde 1“, sowie die Ergänzungen des Scrum Masters (Exportname `abschnittKonfiguration`, asynchrones Laden ohne Props, `Buch` statt `Book`). Die Testfälle stammen aus dem REQ-Text, nicht aus dem Code. In den Tests stehen keine Hexwerte. Alle Sollfarben kommen aus `@/theme` (`farbrubriken`).

## Teil 2 – Seite „Bücher“

### Ergebnis auf einen Blick

| | |
|---|---|
| `npm run verify` | **grün**: Typecheck, Lint, 17 Testdateien mit 367 Tests bestanden, Traceability OK (12 REQs) |
| REQ-005 bis REQ-012 automatisch | 224 Tests, **alle AKs grün** (Tabelle unten) |
| Regression REQ-002/003/004 | 76 + 14 + 15 bestanden. Drei REQ-002-Tests habe ich auf den REQ-Text zurückgeführt (Abschnitt „Angepasste REQ-002-Tests“). `tests/regression/` ist noch leer, weil es noch kein Release gibt. |
| Gegenprobe (Mutationen) | 7 von 7 gezielt eingebauten Fehlern wurden erkannt. Geprüft in einer Wegwerfkopie unter `/tmp`, `src/` blieb unverändert (siehe unten). |
| Demodaten | `demo/testbuecher.json` mit 3 Büchern angelegt |
| Manueller Teil | Prüfliste M-B1 bis M-B14 ist **offen** |
| Empfehlung | **Automatisch freigabefähig.** Für die Abnahme sind die Sichtprüfung im Prototyp und die Klärung von F-1 (REQ-006-Text) nötig. |

Ausgabe von `npm run verify` (gekürzt):

```
> tsc -b
> oxlint
 ✓ tests/acceptance/REQ-002-hauptnavigation.test.tsx (76 tests)
 ✓ tests/acceptance/REQ-009-abschnitt-noch-zu-lesen.test.tsx (44 tests)
 ✓ tests/acceptance/REQ-006-buecher-filterleiste.test.tsx (40 tests)
 ✓ tests/acceptance/REQ-005-buecher-kopfbereich.test.tsx (41 tests)
 ✓ tests/acceptance/REQ-004-platzhaltertext-tertiaer.test.tsx (15 tests)
 ✓ tests/acceptance/REQ-011-leere-liste-platzhalter.test.tsx (20 tests)
 ✓ tests/acceptance/REQ-012-abschnitte-sagas-sammlungen.test.tsx (16 tests)
 ✓ tests/acceptance/REQ-007-filterkonfiguration.test.tsx (26 tests)
 ✓ tests/acceptance/REQ-010-cover-platzhalter.test.tsx (17 tests)
 ✓ tests/acceptance/REQ-003-schriftart.test.tsx (14 tests)
 ✓ tests/unit/buecher.test.tsx (8 tests)
 ✓ tests/unit/theme.test.tsx (6 tests)
 ✓ tests/unit/navigation.test.tsx (7 tests)
 ✓ tests/unit/schrift.test.tsx (4 tests)
 ✓ tests/acceptance/REQ-008-buchdaten-lesestatus.test.tsx (20 tests)
 ✓ tests/contract/inMemory.test.ts (7 tests)
 ✓ tests/unit/buch.test.ts (6 tests)
 Test Files  17 passed (17)
      Tests  367 passed (367)
✓ Traceability OK – 12 REQs, davon 0 freigegeben, 0 eingefrorene Testdateien.
```

### Testdateien

| REQ | Datei | Tests |
|---|---|---|
| REQ-005 | `tests/acceptance/REQ-005-buecher-kopfbereich.test.tsx` | 41 |
| REQ-006 | `tests/acceptance/REQ-006-buecher-filterleiste.test.tsx` | 40 |
| REQ-007 | `tests/acceptance/REQ-007-filterkonfiguration.test.tsx` | 26 |
| REQ-008 | `tests/acceptance/REQ-008-buchdaten-lesestatus.test.tsx` | 20 |
| REQ-009 | `tests/acceptance/REQ-009-abschnitt-noch-zu-lesen.test.tsx` | 44 |
| REQ-010 | `tests/acceptance/REQ-010-cover-platzhalter.test.tsx` | 17 |
| REQ-011 | `tests/acceptance/REQ-011-leere-liste-platzhalter.test.tsx` | 20 |
| REQ-012 | `tests/acceptance/REQ-012-abschnitte-sagas-sammlungen.test.tsx` | 16 |

**Testtechnik:**
- Zustände stelle ich über die Props von `BuecherAnsicht` (`buecher`, `filter`) her: leere Liste, Buch ohne Cover, Buch mit Cover (als Data-URI-SVG in verschiedenen Seitenverhältnissen), 25 bzw. 60 Bücher sowie 10 bzw. 25 Filter.
- Die Ansicht wird in einer Testwurzel mit `farbVariablen()` gerendert. So ergeben sich echte berechnete Farben.
- **„Änderung an der zentralen Stelle“:** Der Test ändert den Wert in `farbrubriken`, in `filterKonfiguration` oder in `abschnittKonfiguration.nochZuLesen.lesestatus`. Danach wird neu gerendert (bei den Konfigurationen mit frisch geladenen Modulen) und geprüft, dass die Ansicht folgt.
- **Farben:** Jede Farbe wird dreifach geprüft. (1) Der Inline-Style ist genau `var(--bz-farbe-<rubrik>)`, ohne Ausweichwert. (2) Die berechnete Farbe entspricht dem Rubrikwert. (3) Nach einer Änderung der Rubrik zeigt das Element den neuen Wert und nicht mehr den alten.
- **Titel-Regeln (strukturell, ohne Layout):** Geprüft werden `-webkit-line-clamp: 2` mit `display: -webkit-box`, `-webkit-box-orient: vertical` und `overflow: hidden`. Der Titeltext bleibt vollständig erhalten. Die Breite ist auf die Coverbreite begrenzt, lange Wörter brechen um, und der Eintrag hat eine feste Breite mit `flex-shrink: 0`.
- **„Antippen bewirkt nichts“:** Ich vergleiche `document.body.innerHTML` vorher und nachher, in der App mit aktivem Menüpunkt „Bücher“.
- **Icons:** Ein PNG-Dekoder im Test prüft `icon-regler.png` und `icon-plus.png` auf das RGBA-Format der Navigations-Icons, auf genau eine Farbe, auf transparente Ecken und auf einen Linienanteil. Geprüft wird außerdem die Einfärbung per Maske. `icon-herz.png` ist byte-identisch mit der Datei des CEO.

### Ergebnis je REQ und AK

| REQ | AK | Ergebnis | Kernprüfungen |
|---|---|---|---|
| REQ-005 | AK-1 bis AK-11 | **alle bestanden** | `<h1>` „Deine Bücher“ nur bei „Bücher“ · genau 2 Kopf-Schaltflächen in der Reihenfolge Filter, Plus · kreisförmig 40×40, gleicher Durchmesser · Rahmen und Regler in Tertiär, Hintergrund in Hintergrund · Plus in Primär, Icon in Hintergrund, zentriert · Farbänderung wirkt für alle 6 Rollen · Icons nachgebildet, einfarbig, transparent, keine Bibliothek, Maske · Antippen ändert das DOM nicht, kein `aria-pressed` · kein „under construction :)“ |
| REQ-006 | AK-1 bis AK-12 | **alle bestanden** | Leiste direkt nach dem Kopf · 3 Filter in Konfigurationsreihenfolge · „Für dich“ beim Aufruf aktiv · genau ein aktiver Filter (auch bei 0 oder 2 Standardfiltern) · Radius 9999px ≥ halbe Höhe · keine feste Breite, Innenabstand, `nowrap`, `flex-shrink: 0` · Farben aktiv und inaktiv, aktiver Filter ohne Rahmen · `overflowX: auto`, eine Zeile, 10 Filter · Scrollen ändert nichts außerhalb · Antippen löst genau die zugeordnete Logik aus, sonst keine Änderung · nach jedem Seitenwechsel wieder „Für dich“ · 5 Rubriken wirken |
| REQ-007 | AK-1 bis AK-9 | **alle bestanden** | Hinzufügen, Umbenennen, Entfernen und Umsortieren direkt in `filterKonfiguration` ändern die Leiste · 10, 25 und 0 Filter · keine Darstellungsangaben in der Konfiguration · „Für dich“ und „Gerade am Lesen“ nirgends sonst in `src/` · jede Filterlogik ist eine Funktion und ohne sichtbare Wirkung · in der App keine Eingabefelder und keine Bearbeitung (auch nicht über Kontextmenü oder Gerätespeicher) |
| REQ-008 | AK-1 bis AK-5 | **alle bestanden** | Speichern und Lesen über `createBookRepository()` mit und ohne Cover für alle 5 Status · Kopien statt Referenzen · gleiche Titel bleiben getrennt, Upsert über die ID · Demo-IDs sind eindeutige UUIDs · `LESESTATUS` exakt in der Schreibweise des CEO · „am lesen“ und „Wunschliste“ nur zentral, alte Status entfernt |
| REQ-009 | AK-1 bis AK-16 | **alle bestanden** | Abschnitt unter der Filterleiste, Überschrift und „Alle ansehen ›“ in einer Zeile · nur zugeordnete Bücher, auch die Demodaten über das Repository · Zuordnung zentral erweiterbar und reduzierbar · 25 und 60 Bücher · eigener Scrollbereich · einheitliche Coverfläche 112×168 (hochformatig), `object-fit: cover` · Titel linksbündig darunter · 2-Zeilen-Begrenzung und Ellipse · feste Eintragsbreite · gleiche Abstände über `gap` · ein Buch ohne Cover ist kein Leere-Liste-Fall · Dunkelbraun und Primär · Antippen bewirkt nichts · Vorbelegung nur „ungelesen“ |
| REQ-010 | AK-1 bis AK-6 | **alle bestanden** | Platzhalter mit Herz und echtem Titel · gleiche Maße wie ein Cover · kein `img`, `canvas` oder `svg`, keine fremden Cover-URLs, alle Platzhalter identisch · nur `icon-herz.png`, byte-identisch, genau eine Komponente · Ghost und Primär, Änderung wirkt, Gegenprobe mit Tertiär |
| REQ-011 | AK-1 bis AK-7 | **alle bestanden** | Platzhalter nur bei 0 zugeordneten Büchern (auch wenn es Bücher mit anderen Status gibt) · gestrichelte Fläche mit Herz und exaktem Text · Umschalten leer, gefüllt, leer · Antippen bewirkt nichts · Farben Ghost, GhostFrame und Primär, Änderung wirkt · gleiche Maße wie Cover und Cover-Platzhalter · Herz des CEO |
| REQ-012 | AK-1 bis AK-5 | **alle bestanden** | Reihenfolge „Noch zu lesen“, „Sagas“, „Sammlungen“ · `<h2>` in Tertiär · je genau ein Platzhalter, identisch mit dem im Bucheintrag, kein weiterer Text und keine Bedienelemente · gleiche Maße · Antippen bewirkt nichts |

### Gegenprobe: Erkennen die Tests Fehler?

Ich habe in einer Wegwerfkopie gezielt Fehler in `src/` eingebaut und danach `tests/acceptance` ausgeführt. Jeder dieser Fehler wurde erkannt:

| Mutation | rote Tests |
|---|---|
| aktiver Filter bekommt einen Rahmen | 2 (REQ-006/AK-7) |
| `WebkitLineClamp` am Buchtitel entfernt | 1 (REQ-009/AK-9) |
| Zuordnung „ungelesen“ in der Darstellung fest verdrahtet | 3 (REQ-009/AK-4) |
| Buchtitel in Rubrik Tertiär statt Dunkelbraun | 2 (REQ-009/AK-15) |
| Filterlogik wird beim Antippen nicht aufgerufen | 2 (REQ-006/AK-10, REQ-007/AK-8) |
| Plus-Schaltfläche mit `aria-pressed` | 1 (REQ-005/AK-10) |
| Eintragsbreite des Buchs entfernt | 2 (REQ-009/AK-10) |

### Angepasste REQ-002-Tests (Auftrag des Scrum Masters)

Die alten Fassungen schlagen gegen den neuen Stand genau dreimal fehl. Das habe ich in einer Wegwerfkopie mit der Testdatei aus `HEAD` geprüft. Ich habe alle drei Tests auf den Wortlaut des REQ zurückgeführt und nicht weiter abgeschwächt. Andere bestehende Tests habe ich nicht geändert.

| Test alt | Test neu | Begründung aus REQ-002 |
|---|---|---|
| `[REQ-002/AK-12] bei aktivem "%s" zeigt … "under construction :)"` für **alle fünf** Menüpunkte | gilt für **Menüpunkte ohne definierte Zielansicht** (Start, Bibliothek, Statistik, Profil). Dazu kommt ein Test, der sicherstellt, dass diese Liste nicht leer wird. | AK-12: „**Gegeben** die Zielansicht des aktiven Menüpunkts ist **noch nicht definiert**“. REQ-005 definiert die Zielansicht „Bücher“. Dass „Bücher“ den Text nicht zeigt, prüft REQ-005/AK-11. |
| `[REQ-002/AK-13] kein Element im Inhaltsbereich überdeckt den Hintergrund …` prüfte **jedes** Element in `<main>` | prüft `<main>` und die **Wurzel der Ansicht** (direkte Kinder von `<main>`): kein eigener Hintergrund außer `var(--bz-farbe-hintergrund)` oder transparent | AK-13: „der Hintergrund **des Inhaltsbereichs** ist in derselben Farbe … wie der Hintergrund der Hauptnavigation“. Flächen innerhalb des Inhalts verlangt AK-13 nicht auszuschließen, REQ-005 fordert sie sogar (Plus-Schaltfläche in Primär). Die übrigen AK-13-Tests (berechneter Hintergrund von `<main>` = Navigation in allen 5 Ansichten, `var(--bz-farbe-hintergrund)` ohne Literal) bleiben unverändert. |
| `[REQ-002/AK-5] unter src/ gibt es keine weiteren oder abweichenden Icon-Dateien` | (a) Die **Navigation** verwendet nur die 5 Icons der Zuordnungstabelle (Bildquellen und `data-icon`). (b) Jede Datei unter `src/` mit dem Namen eines CEO-Icons ist byte-identisch mit dem Original. | AK-5: „**Wenn die Hauptnavigation angezeigt wird** … es wird kein anderes Icon verwendet“. Der Abschnitt „Icons“ betrifft nur die Menüpunkte. REQ-005 und REQ-010 fordern weitere Icons unter `src/`. Teil (b) schützt zusätzlich vor einem veränderten CEO-Icon. |

### Gefundene Fehler und Befunde

Im Produktcode habe ich keine Abweichung von einem AK gefunden. Die folgenden Befunde betreffen REQ-Texte, die Absprache oder Risiken:

- **F-1 (REQ-Text, an den Scrum Master und den Anforderungsmanager): REQ-006 widerspricht REQ-005, REQ-009 und REQ-012.** REQ-006 sagt im Abschnitt „Wischen“: „Sie gehört nicht zum Grundgerüst; der Bereich unterhalb der Filterleiste bleibt vorerst leer (REQ-005).“ In der Abgrenzung steht: „Inhalte unterhalb der Filterleiste, einschließlich der horizontalen Buchliste (der Bereich bleibt vorerst leer, REQ-005).“ REQ-005 hat diese Vorgabe aber aufgehoben, und REQ-009 und REQ-012 füllen den Bereich. Die AKs von REQ-006 sind davon nicht betroffen. Ich habe nach REQ-009 getestet. Der Text sollte vor der Freigabe bereinigt werden.
- **F-2 (Lücke im REQ, Hinweis):** REQ-012 verlangt „dieselbe Größe und Schriftstärke wie die Überschrift ‚Noch zu lesen‘“, dafür gibt es aber kein AK. Umgesetzt ist das über einen gemeinsamen Stil (`abschnittsueberschriftStil`). Es steht in der manuellen Prüfliste (M-B10).
- **F-3 (Grenze der Prüfbarkeit, REQ-008/AK-5):** Bei *ungelesen*, *gelesen* und *abgebrochen* sind ID und Bezeichnung gleich geschrieben. Eine Suche im Quelltext kann deshalb nicht unterscheiden, ob ein Vergleich über die ID oder über die Bezeichnung läuft. Automatisch geprüft werden „am lesen“, „Wunschliste“, `.bezeichnung`-Vergleiche, weitere Bezeichnungslisten und die Entfernung der alten Status. Laut Absprache sind die IDs fest. Ein Fehler ist das nicht.
- **F-4 (Risiko, Code-Review):** Ohne Props lädt `BuecherAnsicht` die Bücher asynchron. Bis die Daten da sind, zeigt „Noch zu lesen“ weder eine Liste noch den Leere-Liste-Platzhalter. Schlägt `ladeBuecher()` fehl, bleibt dieser Zustand dauerhaft und es erscheint keine Meldung. Beim In-Memory-Speicher ist das unkritisch. Mit SQLite sollte der Fehlerfall behandelt werden.
- **F-5 (Risiko, Code-Review):** Der Coverschatten verwendet `color-mix(in srgb, var(--bz-farbe-dunkelbraun) 25%, transparent)`. Das ist kein eigener Farbwert und damit regelkonform. Ältere Android-WebViews (Chromium < 111) kennen `color-mix` aber nicht, dort fehlt der Schatten. Das ist in der manuellen Prüfung M-B7 auf dem Gerät zu prüfen.
- **F-6 (Hinweis):** In `FilterDefinition` ist `logik` optional (`logik?`). REQ-007 verlangt eine Filterlogik je Filter. Die Konfiguration erfüllt das, und der Test REQ-007/AK-8 sichert es ab. Laut Absprache ist das Feld optional, ein Fehler ist es deshalb nicht. Ein Pflichtfeld wäre robuster.
- **F-7 (Hinweis, Optik):** „Alle ansehen ›“ ist kursiv gesetzt. Der REQ sagt nur „dezent“. Ob das gewollt ist, prüft der CEO (M-B9).

### Manuelle Prüfliste (Prototyp im Browser und als APK, Hell- und Dunkelmodus des Systems)

jsdom hat kein Layout, kein echtes Scrollen und keine Darstellung. Diese Punkte prüft der CEO bzw. der Scrum Master. **Alle offen.**

| Nr. | REQ/AK | Prüfung |
|---|---|---|
| M-B1 | REQ-005/AK-2, AK-3 | „Deine Bücher“ steht links und groß, beide Schaltflächen stehen rechts auf derselben Höhe, links Filter, rechts Plus, Abstand ≈ 11 dp |
| M-B2 | REQ-005/AK-4 bis AK-6, AK-9 | Beide Schaltflächen sind runde Kreise gleicher Größe (≈ 40 dp). Die Icons Regler und Plus sehen aus wie im Referenzbild, haben eine Strichstärke wie die Navigations-Icons und sind scharf gezeichnet und mittig. |
| M-B3 | REQ-005/AK-10 | Beim Antippen gibt es keinen sichtbaren Aktiv- oder Gedrückt-Zustand (der Standard-Tap-Effekt des Systems ist laut REQ-002 erlaubt) |
| M-B4 | REQ-006/AK-1, AK-5, AK-6 | Die Filterleiste liegt direkt unter der Überschrift. Die Pills sind voll abgerundet, ≈ 30 dp hoch, nach Inhalt breit, mit einzeiliger und vollständiger Beschriftung. |
| M-B5 | REQ-006/AK-8, AK-9 | Mit vielen Filtern (Konfiguration testweise erweitern) lässt sich die Leiste nach links und rechts wischen. Überschrift, Buchliste und Seite bewegen sich nicht mit, und die Seite scrollt nicht horizontal. |
| M-B6 | REQ-009/AK-5, AK-6 | Bei mehr Büchern als Bildschirmbreite lässt sich die Buchliste unabhängig von der Filterleiste wischen, und das letzte Buch ist erreichbar. Vertikales Scrollen der Seite funktioniert weiter. |
| M-B7 | REQ-009 (Bucheintrag) | Das Cover ist hochformatig, hat leicht abgerundete Ecken und einen **dezenten Schatten**, der nicht abgeschnitten wird (oben, unten, am letzten Eintrag). Auch auf dem Gerät prüfen (F-5). |
| M-B8 | REQ-009/AK-7, AK-9, AK-10 | Ein echtes Coverbild ist unverzerrt. Ein langer Titel bricht nach 2 Zeilen mit „…“ ab und ist nicht breiter als das Cover. Benachbarte Cover stehen auf gleicher Höhe. |
| M-B9 | REQ-009/AK-1, AK-15 | „Alle ansehen ›“ steht rechts auf Höhe der Überschrift und ist dezent in Bordeaux (kursiv? F-7). Die Buchtitel sind dunkelbraun. |
| M-B10 | REQ-012, F-2 | „Sagas“ und „Sammlungen“ haben dieselbe Größe und Schriftstärke wie „Noch zu lesen“. Die Platzhalter sind gleich groß wie die Buch-Platzhalter. |
| M-B11 | REQ-010/AK-1, AK-5 | Die Cover-Platzhalterfläche ist in Ghost gehalten, das Herz in Bordeaux, mittig und gut erkennbar |
| M-B12 | REQ-011/AK-1, AK-6 | Leere Liste (Demodaten testweise ohne „ungelesen“): Die gestrichelte Fläche hat die Größe eines Covers, das Herz ist bordeaux, der Text darunter bordeaux und vollständig lesbar |
| M-B13 | REQ-006/AK-7 | Der aktive Filter (Tertiär mit heller Schrift, ohne Rahmen) und die inaktiven Filter (Ghost mit GhostFrame-Rahmen) sind gut unterscheidbar |
| M-B14 | REQ-005/AK-11, REQ-002 | „Bücher“ zeigt kein „under construction :)“, die übrigen vier Menüpunkte zeigen es weiterhin mittig |

### Demodaten

`demo/testbuecher.json` enthält drei Fantasy-Bücher. Die Auswahl stammt aus der Recherche des Scrum Masters. Gespeichert sind nur Titel und Status, keine Cover, die IDs sind UUID v4:

| Titel | Status |
|---|---|
| Dungeon Crawler Carl | ungelesen |
| Alchemised | ungelesen |
| When The Moon Hatched | am_lesen |

Im Prototyp zeigt „Noch zu lesen“ deshalb zwei Einträge mit Cover-Platzhalter. „When The Moon Hatched“ erscheint dort nicht, das passt zur Vorbelegung „nur ungelesen“ (getestet in REQ-009/AK-3).

### Risiken

- Die Tests für „Änderung an zentraler Stelle“ verändern `farbrubriken`, `filterKonfiguration` und `abschnittKonfiguration` zur Laufzeit. Werden diese Objekte später eingefroren (`Object.freeze`), müssen die Tests angepasst werden. Ein Produktfehler wäre das nicht.
- Die Tests suchen die Coverfläche als erstes Element mit fester Breite und Höhe in px. Stellt der Entwickler auf `aspect-ratio` oder Prozentmaße um, schlagen die Tests fehl, obwohl die Darstellung richtig sein kann. Dann ist eine Abstimmung nötig.

---

## Nachtrag – REQ-012, Runde 2 (Texte unter den Platzhaltern)

**Grundlage:** geänderter REQ-012 (AK-3 neu gefasst, AK-6 bis AK-9 neu) und `sprints/sprint-02/plan.md`, Abschnitt „REQ-012, Runde 2“. Die Testdatei `tests/acceptance/REQ-012-abschnitte-sagas-sammlungen.test.tsx` hat jetzt 35 statt 16 Tests. Die Sollfarbe kommt aus `@/theme` (`farbrubriken.primaer`), es steht kein Hexwert in den Tests.

`npm run verify`: **grün**. Typecheck und Lint ohne Befund, 17 Testdateien mit 386 Tests bestanden, Traceability OK (12 REQs).

| AK | Ergebnis | Testfälle (Kurzform) |
|---|---|---|
| AK-3 (neu) | **bestanden** | Der Cover-Platzhalter selbst enthält keinen Text, keinen `data-buchtitel` und nicht den Platzhaltertext. Im Abschnitt gibt es außer Überschrift und Platzhaltertext keinen Text, keinen Buchtitel und keine weiteren Elemente. |
| AK-6 | **bestanden** | „Sagas“ hat genau ein `data-platzhaltertext` mit genau „Deine nächste Saga wartet auf dich!“. Der Text steht nach dem Platzhalter und nicht in ihm und ist nicht breiter als der Platzhalter (Titelstelle). Er erscheint nicht in „Sammlungen“. Geprüft bei leerer Liste, bei 12 Büchern und in der App. |
| AK-7 | **bestanden** | wie AK-6, für „Sammlungen“ mit „Wie wäre es mit einer neuen Sammlung?“ |
| AK-8 | **bestanden** | Inline-Style genau `var(--bz-farbe-primaer)`, berechnete Farbe = Rubrik „Primär“. Eine Änderung von „Primär“ an zentraler Stelle wirkt auf beide Texte. Gegenprobe: Eine Änderung von „Tertiär“ lässt sie unverändert. |
| AK-9 | **bestanden** | Antippen (pointerdown, click, doubleclick, contextmenu) beider Texte in der App ändert das DOM nicht. Die Texte sind kein Link und keine Schaltfläche und liegen in keiner. |

**Code-Review:** `PlatzhalterAbschnitt.tsx` nutzt die gemeinsame Komponente `PlatzhalterText`, die Farbrolle `abschnittsplatzhalterText` → `primaer` und die Texte aus `abschnittKonfiguration`. Das entspricht der Absprache. Ich habe keine Nebenwirkungen auf andere REQs gefunden.
**Gefundene Fehler:** keine. **Manuell offen:** Typografie und Position „wie der Leere-Liste-Text (REQ-011)“ prüft der CEO im Prototyp (jsdom kann das nur eingeschränkt prüfen).

## Teil 1 – REQ-004 Platzhaltertext in Farbrubrik Tertiär (Stand der ersten Runde, unverändert)

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
