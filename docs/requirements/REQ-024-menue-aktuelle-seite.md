---
id: REQ-024
titel: Buchdetails – Menü „Aktuelle Seite“ und Sichern des Fortschritts
status: Entwurf
prioritaet: offen
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **in einem Menü meine aktuelle Seite eingeben und sichern**, damit **mein Lesefortschritt festgehalten wird**.

Vorgabe des CEO (wörtlich, Auszug, 2026-11-10): „[…] erscheint von unten ein kleines Menü (siehe neuem Screenshot). Die Überschrift "Aktuelle Seite" bleibt gleich (Schriftfarbe Dunkelbraun), es gibt die Seiten- oder Prozentauswahl (Standardauswahl ist Seite), darunter kann ich dann die aktuelle Seite aktualisieren. […] Die Pille "Sichern" setzen wir auch um, diese speichert den Fortschritt. Auch hier: Schriftfarbe: Hintergrund, Hintergrund: Primär.“ – Erweiterung 3: „Eine Sitzung == ein Eintrag in "aktuelle Seite".“

Referenzbild: [referenzen/REF-buchdetails-03-aktuelle-seite.png](referenzen/REF-buchdetails-03-aktuelle-seite.png). Optische Übereinstimmung prüft der CEO im Prototyp; kein Akzeptanzkriterium.

## Anforderung (Satzschablone)

- Das System muss das Menü „Aktuelle Seite“ von unten einblenden.
- Das System muss im Menü die Überschrift „Aktuelle Seite“ in Farbrubrik „Dunkelbraun“ darstellen.
- Das System muss im Menü eine Auswahl zwischen „Seite“ und „%“ anbieten; beim Öffnen ist „Seite“ ausgewählt.
- Das System muss dem Nutzer unter dieser Auswahl die Möglichkeit bieten, die aktuelle Seite zu ändern.
- Das System muss im Menü eine Pille „Sichern“ mit Hintergrund in Farbrubrik „Primär“ und Schrift in Farbrubrik „Hintergrund“ darstellen.
- Wenn der Nutzer „Sichern“ antippt, muss das System die eingegebene aktuelle Seite als Lesefortschritt des Buches speichern (über die Repository-Schnittstelle, ADR-0002).
- Wenn der Nutzer „Sichern“ antippt, muss das System für das Buch einen Leseeintrag (Sitzung) mit Datum speichern (Grundlage für REQ-026, REQ-027).
- Nach dem Sichern muss das System Lesefortschrittsbalken und Seitenangabe (REQ-023) mit der neuen aktuellen Seite darstellen.

## Akzeptanzkriterien

### AK-1 Menü erscheint von unten
- **Gegeben** die Buchdetails werden angezeigt
- **Wenn** der Nutzer den Lesefortschritt antippt (REQ-023)
- **Dann** wird das Menü „Aktuelle Seite“ von unten eingeblendet

### AK-2 Überschrift in Dunkelbraun
- **Gegeben** das Menü „Aktuelle Seite“ ist geöffnet
- **Wenn** die Überschrift betrachtet wird
- **Dann** lautet sie „Aktuelle Seite“ und ist in Farbrubrik „Dunkelbraun“

### AK-3 Auswahl Seite/% mit Standard „Seite“
- **Gegeben** das Menü „Aktuelle Seite“ wird geöffnet
- **Wenn** die Auswahl betrachtet wird
- **Dann** gibt es die Optionen „Seite“ und „%“
- **Und** „Seite“ ist ausgewählt

### AK-4 Sichern speichert die aktuelle Seite
- **Gegeben** ein Buch mit Seitenanzahl 400 und aktueller Seite 10, das Menü ist geöffnet
- **Wenn** der Nutzer 42 als aktuelle Seite eingibt und „Sichern“ antippt
- **Dann** zeigen die Buchdetails „42 / 400“
- **Und** nach erneutem Öffnen der Buchdetails (auch nach Neustart) ist die aktuelle Seite 42

### AK-5 Sichern legt eine Sitzung an
- **Gegeben** ein Buch mit n gespeicherten Sitzungen
- **Wenn** der Nutzer im Menü „Aktuelle Seite“ „Sichern“ antippt
- **Dann** hat das Buch n+1 Sitzungen, die neue mit dem Datum des Sicherns

### AK-6 Farben der Pille „Sichern“
- **Gegeben** das Menü „Aktuelle Seite“ ist geöffnet
- **Wenn** die Pille „Sichern“ betrachtet wird
- **Dann** ist ihr Hintergrund in Farbrubrik „Primär“ und ihre Schrift in Farbrubrik „Hintergrund“

## Abgrenzung (nicht Teil dieses REQ)

- Abfrage der Seitenanzahl, falls keine hinterlegt ist (REQ-025).
- Ändern der Seitenanzahl (spätere Erweiterung der Buchdetails, laut CEO).

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-023, REQ-025, REQ-026, REQ-027.** **REQ-008:** Buchdaten werden um aktuelle Seite und Sitzungen erweitert. **ADR-0002.**

## Offene Fragen

- F3: Prozent-Modus (Eingabe, Speicherung), Wirkung von −/+, erlaubte Werte, Hinweiszeile „Du bist dann auf Seite …“, Startwert der aktuellen Seite.
- F5: Schließen ohne Sichern (X, Strich oben, Tippen außerhalb, Wischen) und was mit der Eingabe passiert; schließt sich das Menü nach „Sichern“?
- F6: Zählt jedes Sichern als Sitzung (auch ohne geänderte Seite, mehrmals am Tag)?
- F8: Farben von Menüfläche, Umschalter, Eingabefeld, Hinweiszeile.
- Priorität.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-10 | Erstellt (Entwurf aus CEO-Beschreibung, Erweiterung 2 und 3) | Anforderungsmanager |
