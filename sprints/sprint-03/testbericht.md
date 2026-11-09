# Testbericht Sprint 03 – Buchdetails Teil 1

**Tester**, 2026-11-09, Branch `sprint-03/buchdetails` (Arbeitskopie, nicht committet)
**Umfang:** REQ-013 bis REQ-020, REQ-012 AK-10/AK-11
**Grundlage:** REQ-Texte und `plan.md`, Abschnitt „Schnittstellen-Absprache Entwickler ↔ Tester (Runde 1)“

## Ergebnis `npm run verify` (gesamte Suite)

```
Test Files  29 passed (29)
     Tests  614 passed (614)
✓ Traceability OK – 20 REQs, davon 0 freigegeben, 0 eingefrorene Testdateien.
EXIT 0
```
Typecheck und Lint sind ohne Fehler durchgelaufen. `tests/regression/` ist noch leer, weil bisher kein Release stattgefunden hat. Alle Akzeptanztests der Sprints 01 und 02 sind unverändert grün.

## Ergebnis je REQ/AK (bestandene Tests / fehlgeschlagene)

| REQ | AKs | Ergebnis |
|---|---|---|
| REQ-012 (nur AK-10, AK-11) | AK-10 4/0, AK-11 3/0 | bestanden |
| REQ-013 | AK-1…AK-10, je ≥ 1 Test, 0 rot | bestanden |
| REQ-014 | AK-1…AK-8, 0 rot | bestanden |
| REQ-015 | AK-1…AK-9, 0 rot | bestanden |
| REQ-016 | AK-1…AK-6, 0 rot | bestanden (automatisiert nur der App-Anteil, siehe manuelle Liste) |
| REQ-017 | AK-1…AK-9, 0 rot | bestanden |
| REQ-018 | AK-1…AK-5, 0 rot | bestanden |
| REQ-019 | AK-1…AK-5, 0 rot | bestanden (Neustart nachgestellt, Gerät manuell) |
| REQ-020 | AK-1…AK-4, 0 rot | bestanden |

Neue Dateien: `tests/acceptance/REQ-013-…` bis `REQ-020-….test.tsx`. In `REQ-012-….test.tsx` habe ich nur ergänzt (AK-10, AK-11), bestehende Tests habe ich nicht verändert. Bestehende Tests anderer REQs musste ich nicht anpassen.

## Teststrategie (kurz)
- **Test-Doubles:** Bildquelle und ImageStore werden über die Props von `BuchDetails` bzw. `BuecherAnsicht` ersetzt. Als Testbilder dienen 1×1-PNG-Data-URLs. Die Demodaten werden in jedem Test durch eigene Testbücher ersetzt.
- **Kameraansicht:** Für die Prüfung der Oberfläche läuft die Standard-Bildquelle der App, in jsdom ohne Kamera. Den Bildfluss Aufnahme → Zuschnitt → Speichern prüfe ich mit dem Double.
- **Entzerrung (`entzerren`, `homographie`, `abbilden`):** Ein bekanntes Trapez wird auf ein Rechteck abgebildet. Geprüft wird:
  - Die Ecken landen exakt auf den Zielecken.
  - Der Schnittpunkt der Diagonalen landet in der Rechteckmitte. Das gilt nur für eine echte Perspektivabbildung.
  - Es entsteht kein schwarzer Außenbereich, und die farbigen Eckmarker landen in der richtigen Ecke, also ohne Spiegelung oder Drehung.
  - Die Mittellinie bleibt gerade.
  - Grenzfall: Eine identische Abbildung lässt das Bild unverändert.
- **Neustart (REQ-019):** Zwei Varianten:
  1. Die Buchdetails werden mit demselben ImageStore neu aufgebaut.
  2. Nach `vi.resetModules` wird über `createImageStore()` eine neue Instanz erzeugt, die auf derselben IndexedDB arbeitet (fake-indexeddb).
- **Layout, Drehung, Zeilenbegrenzung:** strukturell über die Styles geprüft, weil jsdom kein Layout berechnet.

## Gefundene Fehler

Im Produktcode keine. Zwei Fehler lagen in meinen eigenen Tests und sind behoben:
1. In der REQ-015-Hilfsfunktion griff bei einem explizit übergebenen `undefined` der Default-Parameter. Dadurch lief die Test-Bildquelle statt der Standardquelle. Der Hinweis kam vom Entwickler und ist bestätigt. Jetzt kennzeichnet `null` die Standardquelle. Die Prüfung ist unverändert.
2. Die Hilfsfunktion `zeige()` (REQ-015/016/017) wartete nicht auf das asynchron geladene Buch. Das führte zu einem sporadisch roten Test. Sie wartet jetzt auf die drei Bereiche.

## Review-Befunde und Risiken (keine AK-Verletzung)
1. **Hinweis „Kamera nicht verfügbar“** erscheint auch, wenn der Zugriff verweigert wurde. REQ-016 klammert Hinweise ausdrücklich aus („vom CEO nicht festgelegt“). Der Hinweis verletzt kein AK, ist aber Verhalten, das der CEO nicht beschlossen hat. Nach Regel 0 und Regel 4 empfehle ich, ihn dem CEO im Prototyp vorzulegen. Ein Fehler ist er nicht.
2. **`canvasVerfuegbar()` erkennt jsdom am User-Agent**, also eine Test-Weiche im Produktcode. Im Betrieb ist das Risiko gering. Die Folge: In jsdom gibt `zuschneiden()` das Bild unverändert zurück, sodass die Verbindung von Eckpunkten, Pixelumrechnung, `zielgroesse` und Canvas nie automatisch getestet wird. Getestet ist nur die reine Funktion. Empfehlung an den Entwickler: die Weiche durch Injektion ersetzen (Canvas-Fabrik oder Zuschneide-Funktion als Prop) oder einen Unit-Test für die Umrechnung in `zuschneiden` ergänzen. Bis dahin steht die Bildqualität des Zuschnitts auf der manuellen Liste.
3. **Menüfarben:** Fläche „Hintergrund“ mit 92 % Deckkraft (`color-mix` auf die Rubrik-Variable), Schrift und Icons „Dunkelbraun“. Alle Farben kommen aus zentralen Rubriken über Farbrollen, wie REQ-015 verlangt. Ob das zum Referenzbild passt, prüft der CEO.
4. **Antippen in der Liste:** Der Klick-Handler sitzt auf dem `<li>`, das keine Schaltfläche ist. Damit ist er weder per Tastatur noch per Screenreader bedienbar. Kein AK verlangt das. Für die spätere Web-App ist es ein Risiko.
5. **REQ-012 AK-10:** Die Auslassungspunkte bei Überlänge beruhen auf einer Annahme (offene Frage im REQ, nicht blockierend). Der CEO bestätigt sie im Prototyp.
6. **Kopplung der Tests:** AK-11 von REQ-012 ersetzt die zentrale Definition `@/theme/textformate` (`textformatAlleAnsehen`). Wird sie umbenannt oder verschoben, muss der Test nachgezogen werden.

## Manuelle Prüfliste

### Artefakt (Web-Prototyp im Browser/Handy)
- [ ] Buchdetails öffnen über Cover, Platzhalter und Titel. Zurück über den Pfeil und über den Reiter „Bücher“.
- [ ] Optik von Zurück-Pfeil und drei Punkten (Lage, Größe, Farbe wie „Deine Bücher“).
- [ ] Buchdarstellung: Proportionen und Abstände wie im Referenzbild. „Buchrücken +“ und „Schnitt +“ von unten nach oben lesbar, „+“ oben.
- [ ] Langer Titel auf der Coverfläche: vollständig und innerhalb des Rechtecks (extrem lange Titel testen).
- [ ] Titel unter dem Buch: mittig, höchstens zwei Zeilen mit „…“.
- [ ] Auswahlmenü: Lage, Farbe, Schrift und Icons wie im Referenzbild. Schließen durch Tippen außerhalb. „Foto entfernen“ mit X nur bei vorhandenem Bild.
- [ ] Galerie über den Dateidialog, Abbruch des Dialogs, danach Zuschnitt.
- [ ] Zuschnitt: Eckpunkte gut greifbar, auch per Finger ziehbar. Startrahmen schmal bzw. Cover-Format.
- [ ] Ergebnis des Geradeziehens bei einem schräg fotografierten Buch: unverzerrt, kein Rand außerhalb der Ecken sichtbar, Bildschärfe.
- [ ] Frontcover erscheint in „Noch zu lesen“ in Covergröße und unverzerrt. Nach „Foto entfernen“ ist wieder das Herz zu sehen.
- [ ] Neu laden (F5): Bilder bleiben erhalten (IndexedDB), soweit die Artefakt-Umgebung das zulässt.
- [ ] Sagas/Sammlungen: Platzhaltertexte in der Schrift wie „Alle ansehen ›“, höchstens zwei Zeilen.

### Nur APK auf dem S23 Ultra
- [ ] **Kamera:** „Scannen“ zeigt die Kameraansicht der App mit Live-Bild (Rückkamera). Auslöser nimmt auf, danach folgt der Zuschnitt mit genau diesem Foto.
- [ ] **Durchsichtiger Hintergrund während der Kamera:** Die Vorschau ist sichtbar, kein weißer oder schwarzer Bildschirm, Zurück-Pfeil und Auslöser liegen darüber. Nach dem Verlassen ist der App-Hintergrund wieder normal.
- [ ] **Berechtigung:** Erste Kameranutzung fragt nach der Berechtigung. Bei Verweigerung bleibt das Bild unverändert und die App stürzt nicht ab. Auch nach „Nicht mehr fragen“ prüfen und dabei auf den Hinweis „Kamera nicht verfügbar“ achten, siehe Befund 1.
- [ ] **Galerie:** Der Android Photo Picker öffnet sich. Abbruch ändert nichts. Auswahl führt zum Zuschnitt.
- [ ] **Neustart:** Bilder in allen drei Bereichen bei zwei Büchern hinterlegen. App wischend beenden und neu starten: Jedes Bild steht an seiner Stelle, das Frontcover ist in der Liste. Ersetztes Bild bleibt ersetzt, entferntes bleibt entfernt (SQLite + Dateien).
- [ ] Großes Kamerafoto (> 2000 px): flüssige Verarbeitung, kein Speicherproblem.
- [ ] Hinweis: Die Debug-APK ist anders signiert als die spätere Release-APK. Vor dem Wechsel muss deinstalliert werden, dabei gehen die Bilder verloren.

## Empfehlung
**Freigabefähig für den Prototyp: ja.** Alle AKs der Sprint-REQs sind grün, die gesamte Suite inklusive Traceability ist grün, und es gibt keine Nebenwirkungen auf die Tests der Sprints 01 und 02. Für den Status „Implementiert“ gilt eine Einschränkung: Kamera, Berechtigung und Neustart (REQ-016 AK-1/3/6, REQ-019 AK-1 bis AK-4 auf dem Gerät) sind nur auf der APK nachweisbar und müssen über die manuelle Liste bestätigt werden. Befund 1 sollte dem CEO vorgelegt werden.
