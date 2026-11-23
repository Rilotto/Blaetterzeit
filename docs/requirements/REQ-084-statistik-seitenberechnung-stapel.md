---
id: REQ-084
titel: Seite „Statistik“ – Seiten „in Sessions“ und „aus beendeten Büchern“, gestapelt mit Legende
status: Implementiert
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **auch früher gelesene, nachgetragene Bücher in den Seiten sehen, getrennt von dem, was ich über Sitzungen erfasst habe**, damit **meine Statistik vollständig ist, ohne doppelt zu zählen**.

CEO (2026-11-22): Seiten werden zweifarbig gestapelt mit Legende darunter (ohne Pfeil „›“): „in Sessions“ (Primär) = Seiten, die beim Lesen über „Aktuelle Seite“ am jeweiligen Tag erfasst wurden; „aus beendeten Büchern“ (Gold bzw. eigene Farbrolle) = die restlichen, nie über Sessions erfassten Seiten eines beendeten Buches, alle am Tag „Beendet am“. Keine Doppelzählung.

Festlegung des Scrum Masters (2026-11-22), da aus REQ-024/REQ-027 nicht ableitbar: „Seiten in Sessions pro Tag“ = Differenz der aktuellen Seite je Tag aus den gespeicherten Sitzungen.

## Anforderung (Satzschablone)

**Daten**
- Wenn eine Sitzung entsteht (REQ-024), muss das System mit ihr zusätzlich den gesicherten Fortschritt als Seitenzahl speichern (Modus „%“: Prozentwert × Seitenanzahl / 100, kaufmännisch gerundet).

**Seiten in Sessions**
- Das System muss für jedes Buch und jeden Kalendertag (lokale Gerätezeit) die Seiten in Sessions berechnen als: Seitenzahl der letzten Sitzung des Tages minus Seitenzahl der letzten Sitzung vor diesem Tag (ohne frühere Sitzung: 0). Tage ohne Sitzung des Buches ergeben 0. Ein negatives Ergebnis zählt als 0 (Auslegung des Anforderungsmanagers).
- Sitzungen ohne gespeicherte Seitenzahl (vor Umsetzung dieses REQ entstanden) zählen als Lesetag, tragen aber 0 Seiten in Sessions bei und gelten als Bezugswert 0 (Auslegung des Anforderungsmanagers).

**Seiten aus beendeten Büchern**
- Für jedes Buch, das nach REQ-081 als beendet gilt und eine Seitenanzahl hat, muss das System die Seiten aus beendeten Büchern berechnen als: Seitenanzahl minus Summe aller Seiten in Sessions dieses Buches, mindestens 0; sie werden vollständig dem Tag „Beendet am“ (REQ-085) zugerechnet.
- Ein beendetes Buch ohne Seitenanzahl trägt 0 Seiten bei.
- Die Summe beider Anteile eines Buches darf seine Seitenanzahl nicht überschreiten (keine Doppelzählung).

**Darstellung**
- Ist die Kachel „Seiten“ gewählt, muss das System jeden Balken (REQ-083) aus zwei gestapelten Teilen darstellen: Seiten in Sessions in Farbrubrik „Primär“, Seiten aus beendeten Büchern in der neuen Farbrubrik „Gold“.
- Das System muss unter dem Diagramm eine Legende mit „in Sessions“ (Primär) und „aus beendeten Büchern“ (Gold) anzeigen, ohne Pfeil „›“.
- Die neue Farbrubrik „Gold“ muss in jedem Farbdesign (REQ-068) einen Wert haben; der Standardwert ist kein Akzeptanzkriterium (Farben auf Zuruf).

## Akzeptanzkriterien

### AK-1 Differenz je Tag
- **Gegeben** ein Buch mit 400 Seiten, Sitzungen: Montag auf Seite 20 und 50, Dienstag auf Seite 80
- **Wenn** die Woche gezeigt wird
- **Dann** hat Montag 50 und Dienstag 30 Seiten in Sessions

### AK-2 Prozentmodus
- **Gegeben** ein Buch mit 400 Seiten im Modus „%“, Sitzung heute auf 10 % ohne frühere Sitzung
- **Wenn** die Woche gezeigt wird
- **Dann** hat heute 40 Seiten in Sessions

### AK-3 Nachgetragenes Buch
- **Gegeben** ein Buch mit 300 Seiten ohne Sitzungen, Status *gelesen*, „Beendet am“ 05.03.2026
- **Wenn** „Jährlich“ 2026 mit „Seiten“ gezeigt wird
- **Dann** hat der Balken „M“ (März) 300 Seiten aus beendeten Büchern und 0 in Sessions, die Kachel „Seiten“ zeigt 300

### AK-4 Keine Doppelzählung
- **Gegeben** ein Buch mit 400 Seiten, Sitzungen bis Seite 250 im Oktober, dann Status *gelesen* mit „Beendet am“ 10.11.2026
- **Wenn** „Jährlich“ 2026 gezeigt wird
- **Dann** sind 250 Seiten in Sessions (Oktober) und 150 Seiten aus beendeten Büchern (November) gezählt, insgesamt 400

### AK-5 Negativer Tag zählt 0
- **Gegeben** Sitzung gestern auf Seite 100, heute wurde 30 gesichert (keine Sitzung) und danach 60 (Sitzung)
- **Wenn** die Woche gezeigt wird
- **Dann** hat heute 0 Seiten in Sessions

### AK-6 Stapel und Legende
- **Gegeben** ein Tag mit 40 Seiten in Sessions und 100 aus beendeten Büchern, „Seiten“ gewählt
- **Wenn** das Diagramm betrachtet wird
- **Dann** besteht der Balken aus einem Teil in „Primär“ und einem Teil in „Gold“
- **Und** darunter steht die Legende „in Sessions“ und „aus beendeten Büchern“ ohne „›“
- **Und** eine Änderung der Farbrubrik „Gold“ an der zentralen Stelle wirkt auf den Balkenteil und die Legende

## Abgrenzung (nicht Teil dieses REQ)

- Entstehen von Sitzungen und Streak-Regeln (REQ-024, REQ-027) bleiben unverändert.
- Lesetage zählen nur Sitzungen, nicht nachgetragene Bücher (REQ-086 bis REQ-089).

## Qualitätsanforderungen

- Siehe REQ-090.

## Abhängigkeiten

- **REQ-024** (Sitzung, wird um die Seitenzahl ergänzt), **REQ-025, REQ-081, REQ-083, REQ-085, REQ-068, ADR-0002.**

## Offene Fragen

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-22 | Erstellt aus CEO-Festlegungen und Festlegung des Scrum Masters zur Berechnung; Status „Abgestimmt“. Negativer Tag = 0 und Alt-Sitzungen ohne Seitenzahl als Auslegung gekennzeichnet | Anforderungsmanager |
