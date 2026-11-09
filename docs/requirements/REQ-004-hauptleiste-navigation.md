---
id: REQ-004
titel: App-Grundgerüst mit Hauptleiste und Seitenwechsel
status: Entwurf
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **über eine immer sichtbare Hauptleiste mit Icons zwischen den Hauptseiten der App wechseln**, damit **ich jeden Bereich der App mit einem Tipp erreiche und jederzeit sehe, wo ich mich befinde**.

## Anforderung (Satzschablone)

- Das System muss eine Hauptleiste anzeigen, die auf jeder Hauptseite sichtbar ist.
- Das System muss die Hauptleiste am unteren Bildschirmrand anzeigen _(vorläufig, F2)_.
- Das System muss in der Hauptleiste genau einen Eintrag je Hauptseite in folgender Reihenfolge anzeigen _(vorläufig, F1)_: Bibliothek, Aktuell lesen, Hinzufügen, Statistik, Einstellungen.
- Das System muss jeden Eintrag der Hauptleiste mit einem Icon und einer Beschriftung darstellen _(Beschriftung immer sichtbar – vorläufig, F1)_.
- Randbedingung: Alle Icons der Hauptleiste müssen aus einer einheitlichen, frei lizenzierten Icon-Bibliothek in einem einheitlichen Stil stammen _(Bibliothek offen, F3)_.
- Wenn der Nutzer einen Eintrag der Hauptleiste antippt, muss das System die zugehörige Hauptseite anzeigen.
- Das System muss den Eintrag der aktuell angezeigten Hauptseite als aktiv kennzeichnen, sowohl sichtbar als auch für Bedienungshilfen (Screenreader) erkennbar.
- Das System muss auf jeder Hauptseite deren Titel anzeigen; der Titel entspricht der Beschriftung des Hauptleisten-Eintrags.
- Wenn die App gestartet wird, muss das System die Startseite anzeigen _(vorläufig: Bibliothek, F1)_.

## Akzeptanzkriterien

### AK-1 Hauptleiste mit allen Einträgen nach dem Start
- **Gegeben** die App ist nicht geöffnet
- **Wenn** der Nutzer die App startet
- **Dann** wird die Hauptleiste mit allen festgelegten Einträgen in der festgelegten Reihenfolge angezeigt
- **Und** jeder Eintrag zeigt ein Icon und seine Beschriftung

### AK-2 Startseite nach dem Start
- **Gegeben** die App ist nicht geöffnet
- **Wenn** der Nutzer die App startet
- **Dann** wird die Startseite angezeigt und ihr Eintrag in der Hauptleiste ist als aktiv gekennzeichnet

### AK-3 Seitenwechsel über die Hauptleiste
- **Gegeben** eine beliebige Hauptseite wird angezeigt
- **Wenn** der Nutzer einen anderen Eintrag der Hauptleiste antippt
- **Dann** wird die zu diesem Eintrag gehörende Hauptseite mit ihrem Titel angezeigt
- **Und** dies gilt für jeden Eintrag der Hauptleiste

### AK-4 Genau ein aktiver Eintrag
- **Gegeben** eine beliebige Hauptseite wird angezeigt
- **Wenn** der Nutzer die Hauptleiste betrachtet bzw. ein Screenreader sie ausliest
- **Dann** ist genau der Eintrag der angezeigten Hauptseite als aktiv gekennzeichnet und alle anderen nicht

### AK-5 Hauptleiste bleibt sichtbar
- **Gegeben** der Nutzer hat über die Hauptleiste zu einer beliebigen Hauptseite gewechselt
- **Wenn** die Hauptseite angezeigt wird
- **Dann** ist die Hauptleiste weiterhin vollständig sichtbar und bedienbar

### AK-6 Antippen des aktiven Eintrags
- **Gegeben** eine Hauptseite wird angezeigt
- **Wenn** der Nutzer den bereits aktiven Eintrag erneut antippt
- **Dann** bleibt dieselbe Hauptseite angezeigt und ihr Eintrag bleibt als aktiv gekennzeichnet

### AK-7 Position der Hauptleiste _(vorläufig, F2)_
- **Gegeben** die App wird im Hochformat angezeigt
- **Wenn** eine beliebige Hauptseite angezeigt wird
- **Dann** befindet sich die Hauptleiste am unteren Bildschirmrand

## Abgrenzung (nicht Teil dieses REQ)

- Inhalte und Funktionen der Hauptseiten (bis zu ihrer Umsetzung: Platzhalterseiten, REQ-005).
- Verhalten der Android-Zurück-Taste/-Geste (eigener REQ, sobald es Unterseiten gibt).
- Merken der zuletzt geöffneten Seite über einen Neustart hinweg.
- Querformat und Tablet-Layouts.
- Animationen beim Seitenwechsel.
- Farben (REQ-002) und Schrift (REQ-003).

## Qualitätsanforderungen

- Bedienbarkeit: Die Tippfläche jedes Hauptleisten-Eintrags muss mindestens 48 × 48 CSS-Pixel groß sein.
- Antwortzeit: Nach dem Antippen eines Eintrags muss die zugehörige Hauptseite innerhalb von 300 ms angezeigt werden.
- Zielgerät: Im Hochformat des Samsung Galaxy S23 Ultra müssen alle Einträge ohne Abschneiden oder Scrollen der Hauptleiste sichtbar sein; in der Android-App darf die Hauptleiste nicht von der Systemnavigation verdeckt werden.

## Abhängigkeiten

- REQ-002 (Farbrollen der Hauptleiste), REQ-003 (Schrift und Größenstufen), REQ-005 (Platzhalterseiten als Inhalt der noch nicht umgesetzten Hauptseiten).
- Die Hauptseite „Einstellungen“ ist der spätere Ort für REQ-001.

## Offene Fragen

- F1: Einträge der Hauptleiste (Anzahl, Namen, Reihenfolge, Icon je Eintrag), Startseite und ob Beschriftungen immer oder nur beim aktiven Eintrag sichtbar sind.
- F2: Position der Hauptleiste (Empfehlung: unten).
- F3: Icon-Bibliothek und Stil (outline/gefüllt; ggf. gefüllt nur für den aktiven Eintrag).

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-09 | Erstellt (Entwurf für ersten Prototyp) | Anforderungsmanager |
