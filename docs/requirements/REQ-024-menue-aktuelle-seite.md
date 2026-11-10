---
id: REQ-024
titel: Buchdetails – Menü „Aktuelle Seite“ und Sichern des Fortschritts
status: Abgestimmt
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **in einem Menü meine aktuelle Seite oder meinen Fortschritt in Prozent eingeben und sichern**, damit **mein Lesefortschritt festgehalten wird – nach Seiten oder, z. B. bei Kindle-Büchern, in Prozent**.

Vorgabe des CEO (wörtlich, Auszug, 2026-11-10): „[…] erscheint von unten ein kleines Menü (siehe neuem Screenshot). Die Überschrift "Aktuelle Seite" bleibt gleich (Schriftfarbe Dunkelbraun), es gibt die Seiten- oder Prozentauswahl (Standardauswahl ist Seite), darunter kann ich dann die aktuelle Seite aktualisieren. […] Die Pille "Sichern" setzen wir auch um, diese speichert den Fortschritt. Auch hier: Schriftfarbe: Hintergrund, Hintergrund: Primär.“ – „Eine Sitzung == ein Eintrag in "aktuelle Seite".“

Antworten des CEO (wörtlich bzw. bestätigte Vorschläge, 2026-11-10):
- „Bei der %-Auswahl gebe ich z. B. 5 % von 100 % ein statt 42 von 400 Seiten. + und − sollen nicht umgesetzt werden. Man kann nicht über die festgelegte Seitenanzahl gehen oder über 100 %. Der Hinweis soll nicht übernommen werden.“
- Bestätigter Vorschlag (Teil „braucht keine Seitenanzahl“ am 2026-11-10 aufgehoben, CEO: „Ja, auch beim %-Modus muss ich die Seitenanzahl angeben.“): Fortschrittsmodus „%“ braucht keine Seitenanzahl, Eingabe 0–100, gespeichert als Prozentwert (für Kindle-Bücher). Der gewählte Modus wird pro Buch gespeichert (Kindle-Buch öffnet direkt in „%“). Beim Moduswechsel wird der Fortschritt umgerechnet, wenn die Seitenanzahl bekannt ist, sonst ist die Eingabe leer.
- „Schließen auch wieder durch 'Sichern' oder durch einen Klick außerhalb des Menüs (dann wird die Eingabe nicht gespeichert) oder durch das X oben rechts → bitte auch übernehmen. Hintergrund Ghost, Rahmen GhostFrame, das X: Farbe Dunkelbraun.“
- „Bitte lege eine Schattierung wie im Screenshot über die im Hintergrund liegende Buchdetailseite, damit die Abgrenzung besser klar ist.“
- „Eine Sitzung zählt nur dann, wenn die Seitenanzahl oder die Prozentanzahl im Menü 'Aktuelle Seite' erhöht wurde. Auch mehrere Sitzungen an einem Tag sind möglich (zählt dann aber nur als ein Tag für den Streak).“
- Farben: Grundfläche Hintergrund, Umschalter aktiv Ghost / inaktiv GhostFrame, Eingabefeld Ghost mit Rahmen GhostFrame, Schrift darin Dunkelbraun; Überschrift Dunkelbraun; „Sichern“ Primär / Schrift Hintergrund.

Referenzbild: [referenzen/REF-buchdetails-03-aktuelle-seite.png](referenzen/REF-buchdetails-03-aktuelle-seite.png). Die optische Übereinstimmung (u. a. Stärke der Abdunklung) prüft der CEO im Prototyp; sie ist kein Akzeptanzkriterium.

## Anforderung (Satzschablone)

**Öffnen und Aufbau**
- Das System muss das Menü „Aktuelle Seite“ nur für ein Buch mit hinterlegter Seitenanzahl öffnen; ohne Seitenanzahl erscheint zuerst das Menü „Buchlänge“ (REQ-025), unabhängig vom Fortschrittsmodus.
- Das System muss das Menü „Aktuelle Seite“ von unten einblenden.
- Solange das Menü geöffnet ist, muss das System die dahinterliegenden Buchdetails mit einer Abdunklung (Schattierung) überdecken.
- Das System muss im Menü die Überschrift „Aktuelle Seite“ in Farbrubrik „Dunkelbraun“ darstellen.
- Das System muss oben rechts im Menü eine X-Schaltfläche mit Hintergrund „Ghost“, Rahmen „GhostFrame“ und X in „Dunkelbraun“ darstellen.
- Das System muss die Grundfläche des Menüs in Farbrubrik „Hintergrund“ darstellen.
- Das System muss im Menü einen Umschalter zwischen den Fortschrittsmodi „Seite“ und „%“ anbieten; die aktive Option in „Ghost“, die inaktive in „GhostFrame“.
- Das System muss das Menü in dem für das Buch gespeicherten Fortschrittsmodus öffnen; ist keiner gespeichert, in „Seite“.
- Das System muss unter dem Umschalter ein Eingabefeld (Hintergrund „Ghost“, Rahmen „GhostFrame“, Schrift „Dunkelbraun“) für den Fortschritt anbieten: im Modus „Seite“ die aktuelle Seite, im Modus „%“ den Prozentwert. Das Feld ist mit dem gespeicherten Wert vorbelegt, sonst leer.
- Das System darf keine Schaltflächen „−“/„+“ und keine Hinweiszeile „Du bist dann auf Seite …“ aus dem Referenzbild darstellen.
- Das System muss im Menü eine Pille „Sichern“ mit Hintergrund in Farbrubrik „Primär“ und Schrift in Farbrubrik „Hintergrund“ darstellen.

**Erlaubte Werte**
- Im Modus „Seite“ muss das System als aktuelle Seite nur ganze Zahlen von 0 bis zur Seitenanzahl des Buches annehmen.
- Im Modus „%“ muss das System als Prozentwert nur ganze Zahlen von 0 bis 100 annehmen (Prozent-Eingabe z. B. für Kindle-Bücher); auch hier ist die Seitenanzahl des Buches hinterlegt.
- Das System darf einen Wert über der Seitenanzahl bzw. über 100 nicht speichern.
- Ist das Eingabefeld leer, darf das System nicht sichern und muss unter dem Eingabefeld einen kurzen Hinweis anzeigen.

**Moduswechsel**
- Wenn der Nutzer den Modus wechselt, muss das System den eingegebenen Fortschritt anhand der Seitenanzahl in den neuen Modus umrechnen (Seite → % und % → Seite), kaufmännisch auf eine ganze Zahl gerundet; ein leeres Eingabefeld bleibt leer.

**Sichern und Schließen**
- Wenn der Nutzer „Sichern“ antippt, muss das System den eingegebenen Fortschritt (aktuelle Seite bzw. Prozentwert) und den gewählten Fortschrittsmodus für das Buch über die Repository-Schnittstelle speichern (ADR-0002), das Menü schließen und den Lesefortschritt (REQ-023) aktualisiert darstellen.
- Wenn der Nutzer „Sichern“ antippt und der Fortschritt gegenüber dem zuletzt gespeicherten Stand erhöht wurde, muss das System für das Buch eine Sitzung mit Datum und Uhrzeit speichern (Grundlage für REQ-026, REQ-027). Verglichen wird der Fortschrittsanteil (aktuelle Seite / Seitenanzahl bzw. Prozentwert / 100); ohne bisher gespeicherten Fortschritt gilt der Anteil 0.
- Wenn der Fortschritt beim Sichern gleich bleibt oder sinkt, muss das System ihn speichern, darf aber keine Sitzung anlegen.
- Wenn der Nutzer außerhalb des Menüs tippt oder die X-Schaltfläche antippt, muss das System das Menü schließen, ohne Eingaben (Fortschritt, Modus) zu speichern. Eine zuvor im Menü „Buchlänge“ gesicherte Seitenanzahl bleibt gespeichert (REQ-025).

## Akzeptanzkriterien

### AK-1 Menü erscheint von unten, Buchdetails abgedunkelt
- **Gegeben** die Buchdetails eines Buches mit Seitenanzahl werden angezeigt
- **Wenn** der Nutzer den Lesefortschritt antippt (REQ-023)
- **Dann** wird das Menü „Aktuelle Seite“ von unten eingeblendet
- **Und** die Buchdetails dahinter sind abgedunkelt

### AK-2 Überschrift, X und Farben
- **Gegeben** das Menü „Aktuelle Seite“ ist geöffnet
- **Wenn** es betrachtet wird
- **Dann** lautet die Überschrift „Aktuelle Seite“ in „Dunkelbraun“
- **Und** oben rechts steht eine X-Schaltfläche (Hintergrund „Ghost“, Rahmen „GhostFrame“, X „Dunkelbraun“)
- **Und** die Grundfläche ist „Hintergrund“, das Eingabefeld „Ghost“ mit Rahmen „GhostFrame“ und Schrift „Dunkelbraun“, die aktive Umschalter-Option „Ghost“, die inaktive „GhostFrame“

### AK-3 Startmodus
- **Gegeben** ein Buch ohne gespeicherten Fortschrittsmodus
- **Wenn** das Menü geöffnet wird
- **Dann** gibt es die Optionen „Seite“ und „%“ und „Seite“ ist ausgewählt
- **Und** bei einem Buch mit gespeichertem Modus „%“ ist beim Öffnen „%“ ausgewählt

### AK-4 Sichern im Modus „Seite“
- **Gegeben** ein Buch mit Seitenanzahl 400 und aktueller Seite 10, das Menü ist geöffnet
- **Wenn** der Nutzer 42 eingibt und „Sichern“ antippt
- **Dann** ist das Menü geschlossen und die Buchdetails zeigen „42 / 400“
- **Und** nach erneutem Öffnen der Buchdetails (auch nach Neustart) ist die aktuelle Seite 42

### AK-5 Sichern im Modus „%“
- **Gegeben** ein Buch mit Seitenanzahl 400 ohne gespeicherten Fortschritt, das Menü ist geöffnet
- **Wenn** der Nutzer „%“ wählt, 5 eingibt und „Sichern“ antippt
- **Dann** zeigen die Buchdetails den Balken und „5 %“
- **Und** beim nächsten Öffnen des Menüs (auch nach Neustart) ist „%“ ausgewählt und 5 eingetragen

### AK-6 Obergrenzen
- **Gegeben** ein Buch mit Seitenanzahl 400, das Menü ist geöffnet
- **Wenn** der Nutzer im Modus „Seite“ 401 bzw. im Modus „%“ 101 einzugeben und zu sichern versucht
- **Dann** wird dieser Wert nicht gespeichert
- **Und** der gespeicherte Fortschritt ist unverändert

### AK-7 Kein −/+ und keine Hinweiszeile
- **Gegeben** das Menü ist geöffnet
- **Wenn** es betrachtet wird
- **Dann** gibt es keine Schaltflächen „−“/„+“ und keinen Text „Du bist dann auf Seite …“

### AK-8 Leeres Eingabefeld
- **Gegeben** das Menü ist geöffnet und das Eingabefeld ist leer
- **Wenn** der Nutzer „Sichern“ antippt
- **Dann** wird nichts gespeichert, das Menü bleibt offen
- **Und** unter dem Eingabefeld erscheint ein kurzer Hinweis

### AK-9 Moduswechsel mit bekannter Seitenanzahl rechnet um
- **Gegeben** ein Buch mit Seitenanzahl 400, im Modus „Seite“ ist 42 eingetragen
- **Wenn** der Nutzer auf „%“ wechselt
- **Dann** steht im Eingabefeld 11 (42/400 = 10,5 %, kaufmännisch gerundet)
- **Und** beim Zurückwechseln auf „Seite“ mit 25 % steht dort 100

### AK-10 Kein Menü „Aktuelle Seite“ ohne Seitenanzahl
- **Gegeben** ein Buch ohne Seitenanzahl mit gespeichertem Fortschrittsmodus „Seite“ bzw. (zweiter Durchlauf) „%“
- **Wenn** der Nutzer in den Buchdetails das Herz-Icon antippt
- **Dann** erscheint nicht das Menü „Aktuelle Seite“, sondern das Menü „Buchlänge“ (REQ-025)

### AK-11 Schließen ohne Speichern
- **Gegeben** ein Buch mit aktueller Seite 10, das Menü ist geöffnet und der Nutzer hat 50 eingegeben
- **Wenn** er außerhalb des Menüs tippt bzw. (in einem zweiten Durchlauf) die X-Schaltfläche antippt
- **Dann** ist das Menü geschlossen
- **Und** die aktuelle Seite ist weiterhin 10 und es ist keine Sitzung hinzugekommen

### AK-12 Sitzung nur bei Erhöhung
- **Gegeben** ein Buch mit Seitenanzahl 400, aktueller Seite 42 und n Sitzungen
- **Wenn** der Nutzer 50 sichert
- **Dann** hat das Buch n+1 Sitzungen, die neue mit dem Zeitpunkt des Sicherns
- **Und** sichert er danach erneut 50 oder 30, bleibt es bei n+1 Sitzungen (der Fortschritt 30 wird trotzdem gespeichert)

### AK-13 Mehrere Sitzungen am selben Tag
- **Gegeben** ein Buch mit aktueller Seite 10
- **Wenn** der Nutzer am selben Tag nacheinander 20 und 30 sichert
- **Dann** sind zwei neue Sitzungen gespeichert

### AK-14 Farben der Pille „Sichern“
- **Gegeben** das Menü „Aktuelle Seite“ ist geöffnet
- **Wenn** die Pille „Sichern“ betrachtet wird
- **Dann** ist ihr Hintergrund in Farbrubrik „Primär“ und ihre Schrift in Farbrubrik „Hintergrund“

## Abgrenzung (nicht Teil dieses REQ)

- Menü „Buchlänge“ zur Eingabe der Seitenanzahl, falls keine hinterlegt ist (REQ-025).
- Ändern der Seitenanzahl (spätere Erweiterung der Buchdetails, laut CEO).
- Zählung der Sitzungen je Tag für den Streak (REQ-027).

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-023, REQ-025, REQ-026, REQ-027.** **REQ-008:** Buchdaten werden um aktuelle Seite, Prozentwert, Fortschrittsmodus und Sitzungen erweitert. **ADR-0002.**

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-10 | Erstellt (Entwurf aus CEO-Beschreibung, Erweiterung 2 und 3) | Anforderungsmanager |
| 2026-11-10 | CEO-Antworten eingearbeitet: F3 Modus „%“, Obergrenzen, kein −/+, keine Hinweiszeile, Modus je Buch, Umrechnung (neu AK-5, AK-6, AK-7, AK-9, AK-10; AK-3 geändert); F5 Schließen durch Sichern/X/außerhalb, Abdunklung (AK-1, AK-2, neu AK-11); F6 Sitzung nur bei Erhöhung (AK-5 alt → AK-12, neu AK-13); F8 Farben. Leeres Feld (neu AK-8). Priorität Must. Status „Abgestimmt“ (CEO 2026-11-10) | Anforderungsmanager |
| 2026-11-10 | Seitenanzahl ist jetzt immer Voraussetzung (CEO: „Ja, auch beim %-Modus muss ich die Seitenanzahl angeben.“); ohne Seitenanzahl zuerst Menü „Buchlänge“ (REQ-025). Entfallen: „%-Modus braucht keine Seitenanzahl“, Moduswechsel ohne Seitenanzahl, Seitenanzahl beim Schließen. Geändert: AK-1 (Gegeben mit Seitenanzahl), AK-5 (Modus „%“ mit Seitenanzahl 400), AK-10 neu gefasst (kein Menü „Aktuelle Seite“ ohne Seitenanzahl). Prozent-Eingabe bleibt. Status „Abgestimmt“ (CEO 2026-11-10) | Anforderungsmanager |
