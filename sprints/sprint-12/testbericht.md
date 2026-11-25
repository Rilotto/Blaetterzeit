# Testbericht Sprint 12

## REQ-108 / REQ-005 AK-10

Datum: 2026-11-25 · Tester · Branch `sprint-12/umsetzung`

### Tests je AK
| AK | Tests (`tests/acceptance/REQ-108-fuer-dich-anpassen.test.tsx`) | Ergebnis |
|---|---|---|
| REQ-108/AK-1 | Blatt von unten, Titel genau, Ziehgriff/X; 4 Zeilen in Seitenreihenfolge, alle Haken, „Speichern“; Aufruf über App | bestanden |
| REQ-108/AK-2 | Sagas+Sammlungen aus → nur „Noch zu lesen“, „Alle Bücher“, Repo-Wert; Reihenfolge bei anderem Abwählen; wieder einblenden | bestanden |
| REQ-108/AK-3 | Haken aus ohne Speichern: Seite unverändert, nichts gespeichert | bestanden |
| REQ-108/AK-4 | Schließen über X, Zurück-Taste, Herunterziehen: alle 4, Haken beim Wiederöffnen gesetzt; mit vorhandener Auswahl | bestanden |
| REQ-108/AK-5 | letzter Haken bleibt, Hinweis erscheint und verschwindet; erneut auslösbar; mit 2 Haken kein Hinweis | bestanden |
| REQ-108/AK-6 | Speichern, Neustart der App mit demselben Repo: „Sagas“ fehlt, Haken aus | bestanden |
| REQ-108/AK-7 | neuer Abschnitt im Blatt angehakt und sichtbar, „Sagas“ bleibt aus; neuer Abschnitt ausblendbar | bestanden |
| REQ-108/AK-8 | Antippen des Ziehgriffs schließt nicht; Grenzwert Schwelle −1 / Schwelle | bestanden |
| REQ-005/AK-10 | angepasst: Antippen öffnet das Blatt; Schaltfläche unverändert (outerHTML, kein aria-pressed/expanded/data-aktiv); grober Test REQ-005 angepasst | bestanden |

Lauf (lokal, nur betroffene Dateien): REQ-108, REQ-005 (fein + grob), unit/fuerDich, contract/einstellungRepository: 5 Dateien, 87/87 grün; REQ-067 (wegen Umbau FensterDesign) 8/8 grün; `typecheck` und `lint` ohne Fehler. Volle Suite: CI.

### Gegenprobe
5 Fehler eingebaut (nicht persistieren, Filter ignoriert Auswahl, Schließen speichert, Mindestens-einer fehlt, neuer Abschnitt unsichtbar), alle 5 erkannt.

### Befunde
- **B1 (niedrig, Datenverlust möglich):** Wird das Blatt geöffnet, bevor die gespeicherte Auswahl asynchron geladen ist, zeigt es alle Haken gesetzt und übernimmt die geladene Auswahl auch danach nicht. „Speichern“ überschreibt dann die gespeicherte Auswahl mit `[]`. Reproduktion: Repo mit `fuerDichAusgeblendet='["sagas"]'`, `lesen` verzögert um 200 ms; Blatt sofort öffnen, nach 300 ms „Speichern“. Erwartet: Haken „Sagas“ aus, gespeichert bleibt `["sagas"]`. Tatsächlich: Haken an, gespeichert `[]`. Ursache: Der Entwurf in `BlattFuerDich` wird nur beim Einhängen aus `ausgeblendet` gebildet. Vorschlag: Die Schaltfläche erst nach dem Laden wirksam machen oder den Entwurf bei geladener Auswahl neu bilden.
- Hinweis: Ein Fehler beim Speichern wird nur per `console.warn` gemeldet. Die Seite zeigt die neue Auswahl, nach einem Neustart fehlt sie aber. Das REQ fordert hier nichts, deshalb kein Befund.

## REQ-109 Automatischer Zuschnitt auf das Seitenverhältnis

Testdatei: `tests/acceptance/REQ-109-bildzuschnitt-seitenverhaeltnis.test.tsx` (31 Tests). `mittigZuschneiden` ist gemockt (kein Canvas in jsdom) und markiert das Bild mit dem Zielverhältnis. So ist die Kette der Zuschnitte im Bildspeicher ablesbar.

| AK | Geprüft | Ergebnis |
|---|---|---|
| REQ-109/AK-1 | 600 × 600 → {x:110, y:0, 380 × 600}, mittig; 5 weitere Formate (größtmöglich, innerhalb des Bildes, unverzerrt, mittig ±1 px); Barcode → Manueller Eintrag → „Hinzufügen“: Cover genau einmal auf 13,8 : 21,8; Treffer mit Maßen → Breite : Höhe; ohne Format → Taschenbuch | bestanden |
| REQ-109/AK-2 | passende Bilder (4 Größen/Formate) → voller Rahmen, `ausschnittNoetig` false; bereits zugeschnittenes Cover wird beim „Hinzufügen“ nicht erneut zugeschnitten | bestanden |
| REQ-109/AK-3 | Cover-Form in den Buchdetails hat das Verhältnis des gespeicherten Zuschnitts, Bild 100 % × 100 % | bestanden |
| REQ-109/AK-4 | Taschenbuch → Kleinformat: Cover 10,5 : 14,8 gespeichert und angezeigt; Rücken und Schnitt werden mit zugeschnitten; gleiches Verhältnis (→ „Weiß ich nicht“) → kein Zuschnitt; Bereich ohne Bild → kein `put` | bestanden |
| REQ-109/AK-5 | 12 × 18 × 2, Dicke auf 4 über das Blatt „Maße“: Rücken und Schnitt auf 4 : 18, Cover unverändert; `geaenderteBereiche` für Format, Dicke, Seitenzahl ohne/mit Dicke, E-Book | bestanden |
| REQ-109/AK-6 | TB → KF → TB: dritter Zuschnitt läuft auf dem KF-Ergebnis, nicht auf dem Original | bestanden |
| REQ-109/AK-7 | Manueller Eintrag: Format auf Hardcover gesichert, „Hinzufügen“ → letzter Zuschnitt 14,8 : 21,0 | bestanden |

Lauf (lokal): REQ-109 31/31 grün; Nachbarn REQ-062, REQ-073, REQ-077, unit/automatischerZuschnitt, unit/buchAnlegen 90/90 grün; `typecheck` ohne Fehler, `lint` nur bestehende Warnungen. Volle Suite: CI.

REQ-073/REQ-077 (13,8 × 21,8): Die Tests zu REQ-073 AK-3/AK-4 und REQ-077 AK-1/AK-2/AK-6/AK-7 passen zum aktuellen REQ-Text. Keine Abweichung gefunden.

### Gegenprobe
5 Fehler eingebaut: Ausschnitt nicht mittig, Neuzuschnitt auf das alte Verhältnis, alle Bereiche statt nur der geänderten, kein Zuschnitt im Manuellen Eintrag, Formatwechsel im Manuellen Eintrag ignoriert. Alle 5 wurden erkannt.

### Befunde
- **B2 (niedrig, Datenverlust möglich):** In `BuchDetails.speichern()` läuft der Neuzuschnitt auch dann, wenn `repository.save` fehlschlägt, weil `.catch` vor `.then` steht. Dann sind die Bilder auf ein Format zugeschnitten, das nicht gespeichert ist. Nach dem Zurücksetzen passt das Bild nicht mehr, und die abgeschnittenen Teile sind verloren. Erwartet: Zuschnitt nur nach erfolgreichem Speichern.
- **Hinweis:** `onlineCoverZuschneiden` wird im Produktcode nicht aufgerufen. Der Zuschnitt beim Übernehmen geschieht nur im Manuellen Eintrag. Für REQ-111 („Online suchen“) muss das Cover ebenfalls über den Manuellen Eintrag laufen, sonst greift AK-1 dort nicht. Das ist beim Test zu REQ-111 zu prüfen.
- **Risiko:** Eine Änderung der Seitenzahl in den Buchdetails (ohne Dicke) ist nur über `geaenderteBereiche` geprüft, nicht über die Oberfläche. `alt` in `speichern()` ist der Stand des letzten Renderns; bei zwei sehr schnellen Speichervorgängen kann der Vergleich veraltet sein. Ein echter Canvas-Zuschnitt (Pixel, JPEG) ist in jsdom nicht prüfbar, deshalb im Prototyp auf dem Gerät prüfen.
