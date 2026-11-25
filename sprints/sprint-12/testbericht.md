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
