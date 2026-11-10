---
id: REQ-026
titel: Buchdetails – Statistik-Pille mit Tagen in Folge, Fortschritt in % und Sitzungen
status: Abgestimmt
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **in den Buchdetails eine Übersicht mit Streak, Fortschritt in Prozent und Anzahl der Sitzungen sehen**, damit **ich meine Lesegewohnheit zu diesem Buch erkenne**.

Vorgabe des CEO (wörtlich, Auszug, 2026-11-10): „Diese große Pille auf der Übersichtsseite der Buchdetails: Links sehen wir eine Flamme. Übernehme diese bitte so. […] Übernehme auch den Text der Tage in Folge, die Aufteilung und die Sitzungen etc. Eine Sitzung == ein Eintrag in "aktuelle Seite". Nur in der Mitte möchte ich nicht 0m (steht für 0 Minuten Lesezeit), sondern den Lesefortschritt in % angezeigt bekommen. Nur gerundete Zahlen, ohne Nachkomma. Hintergrund: Ghost, Rahmen: ganze durchgängige Linie, Farbe GhostFrame. Das Zitat unter der Pille entfällt.“

Antworten des CEO (wörtlich, 2026-11-10):
- „Ohne Seitenanzahl steht da 0 %. Es wird kaufmännisch gerundet. Text: 'gelesen'.“ (Im Fortschrittsmodus „%“: der gespeicherte Prozentwert.)
- „Eine Sitzung zählt nur dann, wenn die Seitenanzahl oder die Prozentanzahl im Menü 'Aktuelle Seite' erhöht wurde.“
- Farben: Zahlen und Texte Dunkelbraun, Trennlinien und Rahmen GhostFrame, Hintergrund Ghost.

Referenzbild: [referenzen/REF-buchdetails-01.png](referenzen/REF-buchdetails-01.png). Die optische Übereinstimmung prüft der CEO im Prototyp; sie ist kein Akzeptanzkriterium.

## Anforderung (Satzschablone)

- Das System muss in den Buchdetails unter dem Lesefortschritt (REQ-023) eine Statistik-Pille mit drei durch Trennlinien getrennten Teilen in der Aufteilung des Referenzbilds darstellen.
- Das System muss die Statistik-Pille mit Hintergrund in Farbrubrik „Ghost“, durchgehendem (nicht gestricheltem) Rahmen und Trennlinien in Farbrubrik „GhostFrame“ sowie allen Zahlen und Texten in Farbrubrik „Dunkelbraun“ darstellen (Ausnahme: Zahl in der Flamme, REQ-027).
- Das System muss im linken Teil die Flamme mit der Streak-Zahl (REQ-027) und darunter den Text „Tage in Folge“ darstellen.
- Das System muss im mittleren Teil den Lesefortschritt des Buches als ganze Prozentzahl mit „%“ und darunter den Text „gelesen“ darstellen (statt der Lesezeit aus dem Referenzbild).
- Das System muss den Prozentwert im Fortschrittsmodus „Seite“ als aktuelle Seite / Seitenanzahl × 100, kaufmännisch auf eine ganze Zahl gerundet, und im Fortschrittsmodus „%“ als gespeicherten Prozentwert ermitteln; ohne Seitenanzahl und ohne Prozentwert zeigt es „0 %“.
- Das System muss im rechten Teil die Anzahl der Sitzungen des Buches (REQ-024) und darunter den Text „Sitzungen“ darstellen.
- Das System darf unter der Statistik-Pille kein Zitat darstellen.

## Akzeptanzkriterien

### AK-1 Drei Teile in der Pille
- **Gegeben** die Buchdetails werden angezeigt
- **Wenn** der Bereich unter dem Lesefortschritt betrachtet wird
- **Dann** steht dort die Statistik-Pille mit linkem Teil (Flamme, „Tage in Folge“), mittlerem Teil (Prozent, „gelesen“) und rechtem Teil (Zahl, „Sitzungen“)

### AK-2 Farben und Rahmen
- **Gegeben** die Statistik-Pille wird angezeigt
- **Wenn** die Farben geprüft werden
- **Dann** ist der Hintergrund in „Ghost“
- **Und** Rahmen (durchgehende Linie) und Trennlinien sind in „GhostFrame“
- **Und** Prozentzahl, Sitzungszahl und die Texte „Tage in Folge“, „gelesen“, „Sitzungen“ sind in „Dunkelbraun“

### AK-3 Fortschritt kaufmännisch gerundet
- **Gegeben** ein Buch im Modus „Seite“ mit Seitenanzahl 400 und aktueller Seite 42 (10,5 %)
- **Wenn** der mittlere Teil betrachtet wird
- **Dann** zeigt er „11 %“
- **Und** bei aktueller Seite 41 (10,25 %) „10 %“

### AK-4 Fortschritt im Modus „%“
- **Gegeben** ein Buch ohne Seitenanzahl im Modus „%“ mit Prozentwert 5
- **Wenn** der mittlere Teil betrachtet wird
- **Dann** zeigt er „5 %“

### AK-5 Ohne Fortschrittsangaben 0 %
- **Gegeben** ein Buch ohne Seitenanzahl und ohne Prozentwert
- **Wenn** der mittlere Teil betrachtet wird
- **Dann** zeigt er „0 %“ und darunter „gelesen“

### AK-6 Sitzungen zählen
- **Gegeben** für ein Buch wurde der Fortschritt im Menü „Aktuelle Seite“ dreimal erhöht und einmal ohne Erhöhung gesichert
- **Wenn** der rechte Teil betrachtet wird
- **Dann** zeigt er 3

### AK-7 Kein Zitat
- **Gegeben** die Buchdetails werden angezeigt
- **Wenn** der Bereich unter der Statistik-Pille betrachtet wird
- **Dann** steht dort kein Zitat

## Abgrenzung (nicht Teil dieses REQ)

- Berechnung der Streak-Zahl und Aussehen der Flamme (REQ-027).
- Entstehen von Sitzungen (REQ-024).
- Lesezeit in Minuten („0m“ entfällt laut CEO).

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-023, REQ-024, REQ-027.** **REQ-006:** Farbrubriken Ghost, GhostFrame. **REQ-009:** Farbrubrik Dunkelbraun.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-10 | Erstellt (Entwurf aus CEO-Beschreibung, Erweiterung 3) | Anforderungsmanager |
| 2026-11-10 | CEO-Antworten eingearbeitet: F6 Sitzung nur bei Erhöhung (AK-6); F7 kaufmännische Rundung, „0 %“ ohne Angaben, Modus „%“, Text „gelesen“ (AK-3 konkretisiert, neu AK-4, AK-5); F8 Farben (AK-2). Priorität Must. Status „Abgestimmt“ (CEO 2026-11-10) | Anforderungsmanager |
