# Launcher-Icons (REQ-120)

Einzige Vorlage: `assets/logo/app-logo.png` (wird nicht verändert).

Erzeugen (im Projektwurzelverzeichnis, Python 3 mit Pillow, numpy, scipy):

```bash
python3 scripts/icons/erzeuge-launcher-icons.py                       # Hintergrund automatisch
python3 scripts/icons/erzeuge-launcher-icons.py --hintergrund '#FEE8C8'  # Farbe auf Zuruf
python3 scripts/icons/erzeuge-launcher-icons.py --vorschau /tmp/icon-vorschau.png
```

Das Skript schreibt nach `android/app/src/main/res/`:

- `mipmap-{mdpi…xxxhdpi}/ic_launcher_foreground.png` – Vordergrund des Adaptive Icons
  (108–432 px, RGBA). Motiv ohne Rahmen/schwarze Ecken, auf 95 % der Safe Zone
  (Kreis 66/108) skaliert, außerhalb der Safe Zone transparent.
- `values/ic_launcher_background.xml` – Hintergrundfarbe: gemessener Pergamentton des Logos,
  aufgehellt bis jeder RGB-Kanal ≥ 200 ist (REQ-120 AK-2).
- `mipmap-{mdpi…xxxhdpi}/ic_launcher.png` (abgerundetes Quadrat) und `ic_launcher_round.png`
  (Kreis), 48–192 px – Legacy-Icons vor Android 8.

`mipmap-anydpi-v26/ic_launcher*.xml` verbinden Hintergrundfarbe und Vordergrund; das Manifest
verweist über `@mipmap/ic_launcher` und `@mipmap/ic_launcher_round` darauf.
Die erzeugten Dateien sind eingecheckt; das Skript läuft nicht im Build oder in der CI.
