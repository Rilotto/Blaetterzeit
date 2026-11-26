# Sprint 13 – Testbericht

## REQ-121 – Profil: „Deine Bibliothek“ › „Aktueller Wert“

**Tests:** `tests/acceptance/REQ-121-profil-deine-bibliothek-wert.test.tsx` (22 Tests, Tags `[REQ-121/AK-1]` bis `[REQ-121/AK-6]`).
**Lokaler Lauf (CEO-Vorgabe 2026-11-26, nur aktuelle Funktion):** `npx vitest run tests/acceptance/REQ-121-profil-deine-bibliothek-wert.test.tsx tests/unit/bibliothekswert.test.ts --reporter=dot` → 2 Dateien, 32/32 grün. `tsc -b` und `oxlint` ohne Befund. Volle Suite nur über die CI (noch nicht gelaufen).

| AK | Ergebnis | Geprüft |
|---|---|---|
| AK-1 | bestanden | Reihenfolge du/bibliothek/app über die Navigation; Überschrift gleiche Schriftgröße, Farbe, Gewicht und Großschreibung wie „App“; Karte im Stil der Karte „App“ mit genau einer Zeile „Aktueller Wert“, ohne Pfeil |
| AK-2 | bestanden | Bestand A–E ergibt „38,00 €“ (Profilansicht und ganze App), Exemplar egal, Preis 0 zählt als 0, Cent-genau, alle Status außer Wunschliste, kein Eingabefeld |
| AK-3 | bestanden | ohne Preise, nur Wunschliste mit Preis, keine Bücher (auch ganze App) ergeben „0,00 €“ |
| AK-4 | bestanden | 1234,56 € → „1.234,56 €“, dazu Grenzwerte 0, 5 ct, 999,99, 1.000,00, 1.234.567,89 |
| AK-5 | bestanden | ganze App: B in Buchdetails auf Wunschliste → 18,00 €, Preis E 7,50 € → 25,50 € ohne Neustart; neu angelegtes Buch zählt beim nächsten Öffnen mit |
| AK-6 | bestanden | Zeile ist ein div ohne Button, Link oder tabindex; Antippen (Zeile, Bezeichnung, Wert) öffnet nichts, das DOM und der Speicher bleiben unverändert |

**Gegenprobe (3 Fehler, Kernlogik):** Wunschliste zählt mit (7 rot), *abgebrochen* ausgeschlossen (5 rot), Tausenderpunkt fehlt (3 rot): alle 3 erkannt.

**Diff-Review** (`src/views/ProfilAnsicht.tsx`, `src/domain/bibliothekswert.ts`): AKs erfüllt, Speicherzugriff über das Repository (ADR-0002). Keine Fehler gefunden.
- Hinweis: Wenn `list()` fehlschlägt, wird nur eine Warnung geloggt, und die Zeile zeigt still „0,00 €“. Laut REQ ist das kein Fehlerfall, es ist aber ein geringes Risiko.
- Nebenwirkung: Im selben Diff steht die Umstellung auf volle Breite (`seiteStil` ohne seitlichen Abstand, Überschriften mit `bildschirmrand`). Sie gehört zu REQ-066 AK-4 laut Sprintplan und wurde hier nicht geprüft. `tests/acceptance/REQ-066-…` wurde vom Entwickler erweitert (+48 Zeilen). Deshalb vor dem Merge das CI-Ergebnis abwarten.

**Empfehlung:** REQ-121 ist freigabefähig, sobald die CI (`npm run verify`, volle Suite) grün ist.

## REQ-120 – App-Logo als Android-Launcher-Icon

**Tests:** `tests/acceptance/REQ-120-app-logo-launcher-icon.test.ts` (34 Tests, Tags `[REQ-120/AK-1]` bis `[REQ-120/AK-7]`; Pixelprüfung über `tests/unit/helpers/png.ts`, relativ importiert, weil `@` auf `src/` zeigt).
**Lokaler Lauf (nur aktuelle Funktion):** `npx vitest run tests/acceptance/REQ-120-app-logo-launcher-icon.test.ts tests/unit/launcherIcons.test.ts --reporter=dot` → 2 Dateien, 37/37 grün. `tsc -b` und `oxlint` ohne Befund. Volle Suite nur über die CI (noch nicht gelaufen).

| AK | Ergebnis | Geprüft |
|---|---|---|
| AK-1 | bestanden | `ic_launcher.xml`/`ic_launcher_round.xml`: je genau ein `<background>` und ein `<foreground>`; Manifest `<application>` mit `android:icon`/`android:roundIcon` |
| AK-2 | bestanden | beide Hintergründe `@color/ic_launcher_background`, kein Bild; `#FEE8C8` = (254, 232, 200): jeder Kanal ≥ 200 (Blau genau auf der Grenze), nicht Weiß |
| AK-3 | bestanden | 5 Dichten, 108/162/216/324/432 px, quadratisch, Alphakanal |
| AK-4 | bestanden | alle Pixel außerhalb des Kreises 66/108 transparent oder ≤ 16 je Kanal von der Hintergrundfarbe, keine dunklen Pixel, 4 Ecken; Grenzpixel direkt außerhalb des Kreises |
| AK-5 | bestanden | umschließendes Rechteck ≥ 45 % der Kante, Mittelpunkt ≤ 5 % vom Bildmittelpunkt, alle Dichten |
| AK-6 | bestanden | 10 Dateien in 48/72/96/144/192 px; Ecke (0,0) und übrige Ecken transparent; kein dunkles Pixel im 8-%-Rand; Mitte deckend |
| AK-7 | bestanden | Vorlage 1254 × 1254 px mit schwarzer Originalecke; `scripts/icons/README.md` nennt Vorlage und Skript, Skript existiert |
| AK-8 | manuell offen | Geräteprüfung am S23 Ultra durch den CEO steht aus |

**Gegenprobe (3 Fehler):** schwarze Ecke im hdpi-Vordergrund (2 rot), xxhdpi-Motiv um 25 % vergrößert und damit außerhalb der Safe Zone (1 rot), xhdpi-Vordergrund fehlt (3 rot): alle 3 erkannt.

**Review / Hinweise:**
- AK-2: Der gemessene Logo-Grund `#FDDCAE` (Blau 174) würde AK-2 verletzen. Die Aufhellung auf `#FEE8C8` erfüllt AK-2 und ist laut REQ zulässig, weil der konkrete Wert kein AK ist.
- Risiko für AK-8: Im Vordergrund liegen innerhalb der Safe Zone etwa 2.000 deckende Pixel (xxxhdpi, ca. 1 % der Fläche) im alten Pergamentton `#FDDCAE`. Das sind mehr als 16 je Kanal Abweichung zur Hintergrundfarbe. Auf dem Gerät könnte deshalb ein leicht dunklerer Pergament-Fleck um das Motiv sichtbar sein. Kein AK-Verstoß, weil AK-4 nur außerhalb der Safe Zone gilt. Der CEO soll bei AK-8 darauf achten.
- Es sind keine Capacitor-Standard-Icons mehr vorhanden (kein `drawable*/ic_launcher*`).

**Empfehlung:** REQ-120 ist nach grüner CI (`npm run verify`) und der Geräteprüfung AK-8 durch den CEO freigabefähig.

## REQ-118/REQ-119 (Tester, 2026-11-26)

**Lokal ausgeführt** (CEO-Vorgabe: nur aktueller Auftrag, volle Suite nur in der CI): `npx vitest run` für tests/unit/coverSuche, tests/unit/onlineSuche, tests/acceptance/REQ-015, -032, -116, -117, -118, -119 und tests/grob/REQ-015 mit `--reporter=dot` → **9 Dateien, 185 Tests grün**. `npm run typecheck` grün, `npm run lint` ohne Fehler. `npm run verify` (volle Suite) wurde lokal **nicht** ausgeführt und steht noch aus (CI).

**Neue Tests:** `tests/acceptance/REQ-118-cover-online-suchen.test.tsx` (37 Tests, AK-1 bis AK-17), `tests/acceptance/REQ-119-sprachfilter-online-suche.test.tsx` (24 Tests, AK-1 bis AK-9).

| REQ | AK | Ergebnis |
|---|---|---|
| REQ-118 | AK-1 bis AK-17 | bestanden (lokal) |
| REQ-119 | AK-1 bis AK-9 | bestanden (lokal) |

**Gegenprobe:** 5 von 5 eingebauten Fehlern erkannt (Sprachfilter im Ergebnis, Merken, mindestens eine Sprache, Cover-Übernahme ohne Zuschnitt, Cover-Suche ohne Coverfilter bzw. ohne 15er-Grenze).

**Gegenlesen der Alttests:** REQ-015 (fein und grob), REQ-116 und REQ-117 sind sachgerecht an die neuen AKs angepasst und nicht abgeschwächt. Bei REQ-032 AK-6 fehlte der laut AK eingetragene Autor. Das habe ich ergänzt: Der Autor wird eingetragen und bleibt unverändert.

**Befunde am Produktcode:** kein AK-Verstoß.

**Risiken (nur auf dem Gerät bzw. mit echten Diensten prüfbar):**
1. Open Library liefert mit `language` die Sprachen **aller Ausgaben eines Werks**. Das Cover (`cover_i`) ist das Standardcover des Werks. Bei „nur Deutsch“ kann daher das Cover einer englischen Ausgabe erscheinen (REQ-119 AK-2, „deren Cover“).
2. Die Cover-Suche fragt je Quelle 20 Treffer an und lädt alle Cover, bevor sie mischt. Das sind bis zu 40 Bilddownloads je Suche, was im Mobilnetz langsam sein kann.
3. DNB: Steht in MARC 041 $a mehr als ein Sprachcode zusammengeschrieben (ältere Praxis, z. B. `gereng`), wird 041 verworfen. Dann gilt 008, sonst entfällt der Treffer.
4. Beim Öffnen sind die beiden Sprachknöpfe kurz nicht gewählt, bis die gemerkte Auswahl geladen ist. Das betrifft nur die Darstellung.
5. Nicht automatisiert geprüft: Tastatur schließen mit der Android-Zurück-Taste bei offener Tastatur und Optik im Prototyp.

**Empfehlung:** REQ-118 und REQ-119 sind freigabefähig, sobald die CI (`npm run verify`, volle Suite) grün ist.
