---
id: REQ-027
titel: Buchdetails – Lese-Streak „Tage in Folge“ in der Flamme
status: Abgestimmt
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **sehen, an wie vielen aufeinanderfolgenden Tagen ich dieses Buch gelesen habe**, damit **ich motiviert bin, dranzubleiben**.

Vorgabe des CEO (wörtlich, 2026-11-10): „Links sehen wir eine Flamme. Übernehme diese bitte so. Wenn ich einen Tag lese, kommt in der Flamme die Zahl 1. Dies ist eine Streak-Funktion. Bei zwei aufeinanderfolgenden Tagen, an denen ich das Buch gelesen habe, kommt dann eine 2 usw. Verpasse ich einen Tag dazwischen, erlischt der Streak und geht auf 0.“

Antworten des CEO (wörtlich bzw. bestätigter Vorschlag, 2026-11-10):
- „Gehe hier nach der Systemzeit des Telefons. 00:01–00:00 ist ein Tag.“
- „Eine Sitzung zählt nur dann, wenn die Seitenanzahl oder die Prozentanzahl im Menü 'Aktuelle Seite' erhöht wurde. Auch mehrere Sitzungen an einem Tag sind möglich (zählt dann aber nur als ein Tag für den Streak).“
- Flamme bei Streak > 0 „leuchtet in dezentem Rot und Orange“. Bestätigter Vorschlag: Streak 0 = Umriss in GhostFrame mit Zahl „0“ (gedeckt); Streak ≥ 1 = gefüllt mit Verlauf von unten „Flamme Rot“ nach oben „Flamme Orange“, Zahl in Farbrubrik „Hintergrund“; Form wie im Referenzbild. Zwei neue Farbrubriken „Flamme Rot“ (Standard #B5452F) und „Flamme Orange“ (Standard #E0904A); die Werte sind kein Akzeptanzkriterium.

Referenzbild: [referenzen/REF-buchdetails-01.png](referenzen/REF-buchdetails-01.png). Form der Flamme prüft der CEO im Prototyp.

## Anforderung (Satzschablone)

**Berechnung**
- Das System muss als Lesetag eines Buches jeden Kalendertag nach lokaler Gerätezeit (Tageswechsel um Mitternacht) werten, an dem für dieses Buch mindestens eine Sitzung (REQ-024) gespeichert wurde; mehrere Sitzungen am selben Kalendertag zählen als ein Lesetag.
- Das System muss den Streak eines Buches als Anzahl der lückenlos aufeinanderfolgenden Lesetage ermitteln, die mit dem heutigen oder dem gestrigen Kalendertag enden.
- Wenn weder heute noch gestern ein Lesetag des Buches ist (mindestens ein Kalendertag verpasst), muss das System den Streak 0 anzeigen.
- Das System muss den Streak je Buch führen.

**Darstellung**
- Das System muss im linken Teil der Statistik-Pille (REQ-026) eine Flamme in der Form des Referenzbilds darstellen, nachgebildet im Stil der übrigen Icons der App, mit der Streak-Zahl darin.
- Bei Streak 0 muss das System die Flamme nur als Umriss in Farbrubrik „GhostFrame“ mit der Zahl „0“ in gedeckter Darstellung zeigen.
- Bei Streak ≥ 1 muss das System die Flamme gefüllt mit einem Verlauf von unten Farbrubrik „Flamme Rot“ nach oben Farbrubrik „Flamme Orange“ und die Zahl in Farbrubrik „Hintergrund“ darstellen.

## Akzeptanzkriterien

### AK-1 Ein Lesetag ergibt 1
- **Gegeben** ein Buch ohne bisherige Sitzung
- **Wenn** der Nutzer heute den Fortschritt erhöht und sichert
- **Dann** zeigt die Flamme 1

### AK-2 Aufeinanderfolgende Tage zählen hoch
- **Gegeben** für das Buch gibt es Sitzungen gestern und heute
- **Wenn** die Buchdetails angezeigt werden
- **Dann** zeigt die Flamme 2

### AK-3 Mehrere Sitzungen an einem Tag zählen einmal
- **Gegeben** für das Buch gibt es heute drei Sitzungen und davor keine
- **Wenn** die Buchdetails angezeigt werden
- **Dann** zeigt die Flamme 1

### AK-4 Streak bleibt bis zum Ende des Folgetags bestehen
- **Gegeben** für das Buch gibt es Sitzungen vorgestern und gestern, heute noch keine
- **Wenn** die Buchdetails angezeigt werden
- **Dann** zeigt die Flamme 2

### AK-5 Verpasster Tag setzt auf 0
- **Gegeben** für das Buch gibt es eine Sitzung vorgestern, gestern und heute keine
- **Wenn** die Buchdetails angezeigt werden
- **Dann** zeigt die Flamme 0

### AK-6 Tageswechsel nach lokaler Gerätezeit
- **Gegeben** für das Buch gibt es Sitzungen um 23:59 und um 00:01 lokaler Gerätezeit am folgenden Kalendertag
- **Wenn** die Buchdetails am zweiten Tag angezeigt werden
- **Dann** zeigt die Flamme 2

### AK-7 Sichern ohne Erhöhung zählt nicht
- **Gegeben** für das Buch gibt es eine Sitzung gestern, heute wurde nur ohne Erhöhung gesichert
- **Wenn** die Buchdetails morgen angezeigt werden
- **Dann** zeigt die Flamme 0

### AK-8 Streak gilt je Buch
- **Gegeben** es gibt gestern und heute nur Sitzungen für Buch A
- **Wenn** die Buchdetails von Buch B angezeigt werden
- **Dann** zeigt die Flamme von Buch B 0

### AK-9 Darstellung bei 0 und ab 1
- **Gegeben** ein Buch mit Streak 0 und ein Buch mit Streak 3
- **Wenn** die jeweiligen Flammen betrachtet werden
- **Dann** ist die Flamme bei Streak 0 ein Umriss in „GhostFrame“ ohne Füllung mit der Zahl „0“
- **Und** die Flamme bei Streak 3 ist mit einem Verlauf von „Flamme Rot“ (unten) nach „Flamme Orange“ (oben) gefüllt und die Zahl „3“ ist in „Hintergrund“
- **Und** eine Änderung der Farbrubriken „Flamme Rot“ und „Flamme Orange“ an der zentralen Stelle wirkt auf die Flamme

## Abgrenzung (nicht Teil dieses REQ)

- Buchübergreifende Streaks.
- Entstehen von Sitzungen (REQ-024).
- Konkrete Farbwerte (Farben auf Zuruf).

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-024:** Sitzungen mit Zeitpunkt. **REQ-026:** Statistik-Pille. **REQ-006:** Farbrubrik GhostFrame.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-10 | Erstellt (Entwurf aus CEO-Beschreibung, Erweiterung 3) | Anforderungsmanager |
| 2026-11-10 | CEO-Antworten eingearbeitet: F6 Lesetag = Kalendertag lokaler Gerätezeit mit mindestens einer Sitzung, mehrere Sitzungen = ein Tag, Aussehen der Flamme bei 0 und ≥ 1, neue Farbrubriken „Flamme Rot“/„Flamme Orange“ (neu AK-3, AK-4, AK-6, AK-7, AK-9). Priorität Must. Status „Abgestimmt“ (CEO 2026-11-10) | Anforderungsmanager |
