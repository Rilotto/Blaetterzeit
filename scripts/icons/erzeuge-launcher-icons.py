#!/usr/bin/env python3
"""REQ-120: Erzeugt alle Android-Launcher-Icons aus assets/logo/app-logo.png.

Aufruf (im Projektwurzelverzeichnis):
    python3 scripts/icons/erzeuge-launcher-icons.py [--hintergrund '#RRGGBB'] [--vorschau DATEI.png]

Benötigt Python 3 mit Pillow, numpy und scipy. Das Ergebnis ist deterministisch
(gleiche Vorlage + gleiche Werkzeugversionen ergeben dieselben Dateien).

Vorgehen:
1. Innenfläche des Logos (Pergament im abgerundeten Quadrat) bestimmen; Rahmen und
   schwarze Ecken fallen weg (weicher Übergang zur einfarbigen Hintergrundfarbe).
2. Motiv (alles, was sich deutlich vom Pergament abhebt) finden und den kleinsten
   umschließenden Kreis bestimmen.
3. Vordergrund-Ebene: Motivkreis auf 95 % des Safe-Zone-Kreises (66/108) skaliert und
   zentriert; außerhalb des Safe-Zone-Kreises vollständig transparent.
4. Hintergrund-Ebene: Pergamentfarbe (Median des Logo-Grunds am Rand der Innenfläche),
   so weit aufgehellt, dass jeder RGB-Kanal >= 200 ist (REQ-120 AK-2); überschreibbar per
   --hintergrund. Der Pergament-Grund im Vordergrund wird an diese Farbe angeglichen.
5. Legacy-Icons: Hintergrund + Vordergrund, mittlere 72/108 wie bei Android, als
   abgerundetes Quadrat (ic_launcher) bzw. Kreis (ic_launcher_round).
"""
import argparse
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

WURZEL = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
VORLAGE = os.path.join(WURZEL, 'assets', 'logo', 'app-logo.png')
RES = os.path.join(WURZEL, 'android', 'app', 'src', 'main', 'res')

DICHTEN = {'mdpi': 1.0, 'hdpi': 1.5, 'xhdpi': 2.0, 'xxhdpi': 3.0, 'xxxhdpi': 4.0}
SAFE_ANTEIL = 66 / 108 / 2  # Radius der Safe Zone relativ zur Kantenlänge
MOTIV_IN_SAFE = 0.95  # Motivkreis = 95 % des Safe-Zone-Radius
AUSBLEND_START = 0.955  # Alpha-Ausblendung (relativ zum Safe-Radius) ...
AUSBLEND_ENDE = 0.985  # ... endet sicher innerhalb der Safe Zone
ARBEITS_KANTE = 1728  # 16 x 108: Arbeitsauflösung der Vordergrund-Ebene


def lade_vorlage():
    bild = Image.open(VORLAGE).convert('RGB')
    if bild.size != (1254, 1254):
        sys.exit(f'Unerwartete Vorlagengröße {bild.size}')
    return np.asarray(bild).astype(np.float64)


def innenflaeche(px):
    """Abstand (px) jedes Pixels zum Rand der hellen Innenfläche; außerhalb 0."""
    hell = px.sum(axis=2) > 300
    marken, _ = ndimage.label(hell)
    mitte = marken[px.shape[0] // 2, px.shape[1] // 2]
    innen = ndimage.binary_fill_holes(marken == mitte)
    return ndimage.distance_transform_edt(innen)


def pergamentfarbe(px, abstand):
    band = (abstand > 30) & (abstand < 90)
    werte = px[band]
    # Ausreißer (Motivteile im Band) über Abstand zum Median entfernen
    median = np.median(werte, axis=0)
    nah = np.abs(werte - median).max(axis=1) < 25
    return np.median(werte[nah], axis=0)


def motivmaske(px, abstand, grund):
    abw = np.abs(px - grund).max(axis=2)
    maske = (abw > 50) & (abstand > 35)
    maske = ndimage.binary_opening(maske, iterations=2)
    marken, n = ndimage.label(maske)
    if n == 0:
        sys.exit('Kein Motiv gefunden')
    groessen = ndimage.sum(maske, marken, range(1, n + 1))
    behalten = np.isin(marken, 1 + np.nonzero(groessen >= 40)[0])
    return behalten


def umkreis(maske):
    """Näherung des kleinsten umschließenden Kreises (Mittelpunkt x, y; Radius)."""
    ys, xs = np.nonzero(maske)
    pkt = np.stack([xs + 0.5, ys + 0.5], axis=1)
    winkel = np.linspace(0, 2 * np.pi, 720, endpoint=False)
    richt = np.stack([np.cos(winkel), np.sin(winkel)], axis=1)
    extrem = pkt[np.argmax(pkt @ richt.T, axis=0)]
    best = None
    lo_x, hi_x, lo_y, hi_y = xs.min(), xs.max(), ys.min(), ys.max()
    schritt = 16.0
    cx0, cy0 = (lo_x + hi_x) / 2, (lo_y + hi_y) / 2
    spanne = max(hi_x - lo_x, hi_y - lo_y) / 2
    while schritt >= 0.25:
        gx = np.arange(cx0 - spanne, cx0 + spanne + 1e-9, schritt)
        gy = np.arange(cy0 - spanne, cy0 + spanne + 1e-9, schritt)
        cx, cy = np.meshgrid(gx, gy)
        c = np.stack([cx.ravel(), cy.ravel()], axis=1)
        d = np.sqrt(((c[:, None, :] - extrem[None, :, :]) ** 2).sum(axis=2)).max(axis=1)
        i = int(np.argmin(d))
        best = (c[i, 0], c[i, 1], d[i])
        cx0, cy0 = best[0], best[1]
        spanne = schritt * 2
        schritt /= 4
    return best


def hell_genug(farbe, minimum=200):
    """Pergamentton so weit Richtung Weiß ziehen, bis jeder Kanal >= minimum ist (AK-2)."""
    tief = farbe.min()
    if tief >= minimum:
        return farbe
    t = (minimum - tief) / (255 - tief)
    return np.ceil(farbe + (255 - farbe) * t)


def arbeitsbild(px, abstand, logo_grund, grund, kreis, angleichen=True):
    """Vordergrund in Arbeitsauflösung (RGB, außerhalb der Innenfläche Hintergrundfarbe).

    Pergament-Pixel des Logos werden auf die Hintergrundfarbe verschoben (gewichtet nach
    Nähe zum Pergamentton), damit keine Kante zwischen Logo-Grund und Hintergrund sichtbar
    ist. Motivpixel (deutlich vom Pergament verschieden) bleiben unverändert.
    """
    cx, cy, r = kreis
    alpha_innen = np.clip((abstand - 30) / 45, 0, 1)[..., None]
    gemischt = px * alpha_innen + logo_grund * (1 - alpha_innen)
    if angleichen:
        naehe = np.clip(1 - np.abs(gemischt - logo_grund).max(axis=2) / 60, 0, 1)[..., None]
        gemischt = gemischt + naehe * (grund - logo_grund)
    # Skalierung Logo-Pixel -> Arbeitspixel
    k = MOTIV_IN_SAFE * SAFE_ANTEIL * ARBEITS_KANTE / r
    groesse = int(round(1254 * k))
    logo = Image.fromarray(np.clip(np.rint(gemischt), 0, 255).astype(np.uint8)).resize(
        (groesse, groesse), Image.LANCZOS)
    leinwand = Image.new('RGB', (ARBEITS_KANTE, ARBEITS_KANTE), tuple(int(v) for v in np.rint(grund)))
    ox = int(round(ARBEITS_KANTE / 2 - cx * k))
    oy = int(round(ARBEITS_KANTE / 2 - cy * k))
    leinwand.paste(logo, (ox, oy))
    return leinwand


def kreis_alpha(kante, r_start, r_ende):
    m = (np.arange(kante) + 0.5) - kante / 2
    d = np.sqrt(m[None, :] ** 2 + m[:, None] ** 2)
    return np.clip((r_ende - d) / max(r_ende - r_start, 1e-6), 0, 1)


def vordergrund(arbeit, kante):
    rgb = np.asarray(arbeit.resize((kante, kante), Image.LANCZOS)).astype(np.float64)
    r_safe = SAFE_ANTEIL * kante
    a = kreis_alpha(kante, AUSBLEND_START * r_safe, AUSBLEND_ENDE * r_safe)
    return np.dstack([rgb, a * 255])


def abgerundet_alpha(kante, rand, radius):
    """Alpha eines abgerundeten Quadrats mit 1 px Kantenglättung."""
    m = (np.arange(kante) + 0.5)
    lo, hi = rand + radius, kante - rand - radius
    qx = np.clip(m, lo, hi)
    dx = m - qx
    dy = (m - qx)[:, None]
    d = np.sqrt(dx[None, :] ** 2 + dy ** 2) - radius
    return np.clip(0.5 - d, 0, 1)


def speichere(arr, pfad):
    os.makedirs(os.path.dirname(pfad), exist_ok=True)
    rgba = np.clip(np.rint(arr), 0, 255).astype(np.uint8)
    rgba[rgba[..., 3] == 0, :3] = 0  # vollständig transparente Pixel einheitlich
    Image.fromarray(rgba, 'RGBA').save(pfad, optimize=True)


def legacy(arbeit, grund, kante, rund):
    # mittlere 72/108 der Adaptive-Icon-Fläche (sichtbarer Bereich bei Android)
    gross = kante * 108 // 72
    fg = vordergrund(arbeit, gross)
    a = fg[..., 3:4] / 255
    rgb = fg[..., :3] * a + grund * (1 - a)
    rand = (gross - kante) // 2
    rgb = rgb[rand:rand + kante, rand:rand + kante]
    if rund:
        alpha = kreis_alpha(kante, kante / 2 - 1.0 - kante * 0.02, kante / 2 - kante * 0.02)
    else:
        alpha = abgerundet_alpha(kante, kante * 0.04, kante * 0.18)
    return np.dstack([rgb, alpha * 255])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--hintergrund', help="Hintergrundfarbe '#RRGGBB' statt gemessenem Pergament")
    ap.add_argument('--vorschau', help='Vorschau-PNG (Kreis- und Squircle-Maske) schreiben')
    ap.add_argument('--ohne-angleichung', action='store_true', help='Logo-Grund nicht an Hintergrund angleichen')
    args = ap.parse_args()

    px = lade_vorlage()
    abstand = innenflaeche(px)
    logo_grund = np.rint(pergamentfarbe(px, abstand))
    if args.hintergrund:
        h = args.hintergrund.lstrip('#')
        grund = np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], dtype=np.float64)
    else:
        grund = hell_genug(logo_grund)
    kreis = umkreis(motivmaske(px, abstand, logo_grund))
    arbeit = arbeitsbild(px, abstand, logo_grund, grund, kreis, not args.ohne_angleichung)

    hexwert = '#%02X%02X%02X' % tuple(int(v) for v in grund)
    with open(os.path.join(RES, 'values', 'ic_launcher_background.xml'), 'w', encoding='utf-8') as f:
        f.write('<?xml version="1.0" encoding="utf-8"?>\n<!-- REQ-120: Pergamentfarbe des Logo-Grunds. '
                'Erzeugt von scripts/icons/erzeuge-launcher-icons.py -->\n<resources>\n'
                f'    <color name="ic_launcher_background">{hexwert}</color>\n</resources>\n')

    for dichte, faktor in DICHTEN.items():
        ordner = os.path.join(RES, f'mipmap-{dichte}')
        speichere(vordergrund(arbeit, int(108 * faktor)), os.path.join(ordner, 'ic_launcher_foreground.png'))
        speichere(legacy(arbeit, grund, int(48 * faktor), False), os.path.join(ordner, 'ic_launcher.png'))
        speichere(legacy(arbeit, grund, int(48 * faktor), True), os.path.join(ordner, 'ic_launcher_round.png'))

    logo_hex = '#%02X%02X%02X' % tuple(int(v) for v in logo_grund)
    print(f'Logo-Grund {logo_hex}, Hintergrund {hexwert}, Motivkreis Mitte ({kreis[0]:.1f}, {kreis[1]:.1f}) '
          f'Radius {kreis[2]:.1f} (Logo-px)')

    if args.vorschau:
        kante = 432
        fg = vordergrund(arbeit, kante)
        a = fg[..., 3:4] / 255
        voll = fg[..., :3] * a + grund * (1 - a)
        tafeln = []
        # Kreis (Pixel-Launcher) und Squircle (Samsung-ähnlich): sichtbar sind die mittleren 72/108
        sicht = kante * 72 // 108
        rand = (kante - sicht) // 2
        teil = voll[rand:rand + sicht, rand:rand + sicht]
        tafeln.append(np.dstack([teil, kreis_alpha(sicht, sicht / 2 - 1, sicht / 2) * 255]))
        tafeln.append(np.dstack([teil, abgerundet_alpha(sicht, 0, sicht * 0.3) * 255]))
        # Volle Ebene mit eingezeichnetem Safe-Zone-Kreis
        rot = voll.copy()
        m = (np.arange(kante) + 0.5) - kante / 2
        d = np.sqrt(m[None, :] ** 2 + m[:, None] ** 2)
        ring = np.abs(d - SAFE_ANTEIL * kante) < 1
        rot[ring] = [0, 120, 255]
        tafeln.append(np.dstack([rot, np.full((kante, kante), 255.0)]))
        breite = sum(t.shape[1] for t in tafeln) + 20 * (len(tafeln) + 1)
        blatt = Image.new('RGBA', (breite, kante + 40), (60, 60, 60, 255))
        x = 20
        for t in tafeln:
            img = Image.fromarray(np.clip(np.rint(t), 0, 255).astype(np.uint8), 'RGBA')
            blatt.alpha_composite(img, (x, 20 + (kante - t.shape[0]) // 2))
            x += t.shape[1] + 20
        blatt.save(args.vorschau)


if __name__ == '__main__':
    main()
