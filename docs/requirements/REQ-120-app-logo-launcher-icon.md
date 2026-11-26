---
id: REQ-120
titel: App-Logo als Android-Launcher-Icon (Adaptive Icon mit Pergament-Hintergrund, Legacy-Icons in allen Dichten)
status: Implementiert
prioritaet: Should
art: qualitaet
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **das Blätterzeit-Logo als App-Symbol auf meinem Smartphone sehen**, damit **ich die App sofort erkenne und sie auch dort zum Stil der App passt**.

CEO (2026-11-26, im Chat festgelegt): Das Logo liegt in `assets/logo/app-logo.png` (1254 × 1254 px, RGB; Aquarell-Motiv: aufgeschlagenes Buch, dessen linke Seite in ein großes rot-orangefarbenes Ahornblatt übergeht, fallendes Herbstlaub, goldenes Funkeln, auf hellem Pergamentgrund in einem abgerundeten Quadrat mit schwarzen Ecken). Es wird als Launcher-Icon verwendet: Adaptive Icon (Android 8+) mit Pergament-Farbfläche als Hintergrund-Ebene und dem Motiv ohne abgerundeten Rahmen und ohne schwarze Ecken als Vordergrund-Ebene innerhalb der Safe Zone, damit Samsungs Maske nichts abschneidet; Legacy-Icons (rund und eckig) in allen Dichten aus derselben Vorlage; Prüfung auf dem S23 Ultra.

## Anforderung (Satzschablone)

**Vorlage**
- Einzige Vorlage für alle Icon-Dateien ist `assets/logo/app-logo.png`. Die Vorlage bleibt unverändert im Projekt.
- Die Icon-Dateien müssen aus der Vorlage reproduzierbar erzeugt werden können; den Weg (z. B. Skript) legt der Entwickler fest und beschreibt ihn kurz im Projekt (**Auslegung**).

**Adaptive Icon (Android 8 und neuer)**
- Das System muss ein Adaptive Icon für `ic_launcher` und `ic_launcher_round` bereitstellen, jeweils aus Hintergrund- und Vordergrund-Ebene; das App-Manifest verweist mit `android:icon` und `android:roundIcon` darauf.
- Hintergrund-Ebene: einfarbige Fläche in der Pergamentfarbe des Logo-Grunds. Standardwert #FAF6EB bzw. der im Logo gemessene Pergamentton; der konkrete Wert ist kein Akzeptanzkriterium (wie „Farben auf Zuruf“).
- Vordergrund-Ebene: das Motiv (Buch, Ahornblatt, Herbstlaub, Funkeln) ohne abgerundeten Rahmen und ohne schwarze Ecken. Außerhalb des Motivs ist die Ebene transparent oder pergamentfarben (**Auslegung**: Pergament-Reste des Logo-Grunds sind zulässig, weil sie mit dem Hintergrund verschmelzen).
- Das Motiv muss vollständig innerhalb der Safe Zone liegen: im zentralen Kreis mit 66/108 der Kantenlänge als Durchmesser (Android-Vorgabe für Adaptive Icons; entspricht den „mittleren ~66 %“ des CEO).
- Das Motiv soll die Safe Zone gut ausfüllen und nicht winzig wirken (**Auslegung**: umschließendes Rechteck des Motivs mindestens 45 % der Kantenlänge der Ebene).
- Vordergrund-Ebene als Bitmap in den Dichten mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi mit 108, 162, 216, 324, 432 px Kantenlänge, mit Alphakanal (**Auslegung**: Bitmap statt Vektor, da Aquarell).
- Eine einfarbige Ebene für „Themensymbole“ (Android 13) ist nicht vorgesehen (**Auslegung**: vom CEO nicht verlangt).

**Legacy-Icons (vor Android 8)**
- Das System muss `ic_launcher.png` (eckig) und `ic_launcher_round.png` (rund) in den Dichten mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi mit 48, 72, 96, 144, 192 px Kantenlänge bereitstellen, erzeugt aus derselben Vorlage.
- Eckig: Pergamentfläche mit abgerundeten Ecken und dem Motiv, Ecken außerhalb der Rundung transparent. Rund: Pergament-Kreis mit dem Motiv, außerhalb transparent (**Auslegung**). In keinem Legacy-Icon gibt es schwarze Ecken.
- Die bisherigen Standard-Icons von Capacitor/Android werden vollständig ersetzt.

## Akzeptanzkriterien

### AK-1 Adaptive Icon definiert und im Manifest eingetragen
- **Gegeben** das Android-Projekt
- **Wenn** `android/app/src/main/res/mipmap-anydpi-v26/` und das App-Manifest geprüft werden
- **Dann** gibt es `ic_launcher.xml` und `ic_launcher_round.xml` mit je einer Hintergrund- und einer Vordergrund-Ebene
- **Und** das Manifest verweist mit `android:icon="@mipmap/ic_launcher"` und `android:roundIcon="@mipmap/ic_launcher_round"` darauf

### AK-2 Hintergrund-Ebene ist eine einfarbige helle Pergamentfläche
- **Gegeben** die Hintergrund-Ebene des Adaptive Icons
- **Wenn** sie geprüft wird
- **Dann** ist sie eine einzige Farbe (Farbressource oder einfarbige Fläche), kein Bild mit Motiv
- **Und** die Farbe ist hell (jeder RGB-Kanal ≥ 200) und nicht reines Weiß (**Auslegung**: Toleranz statt fester Wert)

### AK-3 Vordergrund-Ebene in allen Dichten
- **Gegeben** das Android-Projekt
- **Wenn** die Vordergrund-Bitmaps in `mipmap-mdpi` bis `mipmap-xxxhdpi` geprüft werden
- **Dann** existiert je Dichte eine quadratische PNG mit Alphakanal in genau 108, 162, 216, 324 bzw. 432 px Kantenlänge

### AK-4 Motiv nur in der Safe Zone, keine schwarzen Ecken, kein Rahmen
- **Gegeben** jede Vordergrund-Bitmap
- **Wenn** alle Pixel außerhalb des zentralen Kreises mit Durchmesser 66/108 der Kantenlänge geprüft werden
- **Dann** ist jedes davon vollständig transparent oder pergamentfarben (Abweichung von der Hintergrundfarbe je RGB-Kanal ≤ 16)
- **Und** insbesondere sind die vier Eckpixel transparent oder pergamentfarben und kein Pixel der Ebene außerhalb der Safe Zone ist dunkel (alle RGB-Kanäle ≤ 60 bei Deckkraft > 0)

### AK-5 Motiv füllt die Safe Zone sichtbar aus
- **Gegeben** jede Vordergrund-Bitmap
- **Wenn** das umschließende Rechteck aller Motiv-Pixel (weder transparent noch pergamentfarben) bestimmt wird
- **Dann** ist es in Breite oder Höhe mindestens 45 % der Kantenlänge
- **Und** sein Mittelpunkt liegt höchstens 5 % der Kantenlänge vom Bildmittelpunkt entfernt (**Auslegung**)

### AK-6 Legacy-Icons eckig und rund in allen Dichten
- **Gegeben** das Android-Projekt
- **Wenn** `mipmap-mdpi` bis `mipmap-xxxhdpi` geprüft werden
- **Dann** gibt es je Dichte `ic_launcher.png` und `ic_launcher_round.png` in genau 48, 72, 96, 144 bzw. 192 px Kantenlänge
- **Und** bei jedem ist das Eckpixel (0, 0) vollständig transparent, und kein Pixel mit Deckkraft > 0 im äußeren Rand von 8 % der Kantenlänge ist dunkel (alle RGB-Kanäle ≤ 60)

### AK-7 Vorlage vorhanden und unverändert
- **Gegeben** das Projekt
- **Wenn** `assets/logo/app-logo.png` geprüft wird
- **Dann** existiert die Datei mit 1254 × 1254 px
- **Und** im Projekt ist beschrieben, wie die Icon-Dateien daraus erzeugt werden

### AK-8 Geräteprüfung auf dem S23 Ultra (manuell)
- **Gegeben** die Debug-APK ist auf dem Samsung Galaxy S23 Ultra installiert
- **Wenn** der CEO das App-Symbol auf dem Startbildschirm, in der App-Übersicht und unter Einstellungen → Apps betrachtet
- **Dann** zeigt es überall das Blätterzeit-Motiv vollständig (Buch und Ahornblatt nicht angeschnitten) auf Pergamentgrund
- **Und** es sind keine schwarzen Ecken und kein zweiter Rahmen innerhalb der Samsung-Maske zu sehen
- **Und** es ist kein Standard-Icon von Capacitor/Android mehr zu sehen
- Hinweis: manuelle Prüfung, wird im Testbericht als „manuell“ geführt.

## Abgrenzung (nicht Teil dieses REQ)

- Favicon und Web-App-Icons, Startbildschirm (Splash Screen), Logo innerhalb der App.
- Themensymbole (einfarbige Ebene, Android 13).
- Änderungen am Motiv selbst.

## Qualitätsanforderungen

- Das Motiv wird nie von der Gerätemaske angeschnitten (AK-4, AK-8).

## Randbedingungen

- Plattform: Android-APK (Capacitor). AK-1 bis AK-7 sind automatisch prüfbar (Dateien, Größen, Pixel); AK-8 nur am Gerät.

## Abhängigkeiten

- Android-Projekt `android/`; Geräteprüfung analog zu den übrigen APK-Prüfungen auf dem S23 Ultra.

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-26 | Erstellt. Inhalte vom CEO am 2026-11-26 im Chat festgelegt, Umsetzung beauftragt. Auslegungen markiert (Bitmap-Vordergrund, Toleranzen, Mindestgröße Motiv, Legacy-Form, keine Themensymbole). Status „Abgestimmt“ | Anforderungsmanager |
