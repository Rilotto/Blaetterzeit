---
id: REQ-026
titel: Buchdetails – Statistik-Pille mit Tagen in Folge, Fortschritt in % und Sitzungen
status: Entwurf
prioritaet: offen
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **in den Buchdetails eine Übersicht mit Streak, Fortschritt in Prozent und Anzahl der Sitzungen sehen**, damit **ich meine Lesegewohnheit zu diesem Buch erkenne**.

Vorgabe des CEO (wörtlich, Auszug, 2026-11-10): „Diese große Pille auf der Übersichtsseite der Buchdetails: Links sehen wir eine Flamme. Übernehme diese bitte so. […] Übernehme auch den Text der Tage in Folge, die Aufteilung und die Sitzungen etc. Eine Sitzung == ein Eintrag in "aktuelle Seite". Nur in der Mitte möchte ich nicht 0m (steht für 0 Minuten Lesezeit), sondern den Lesefortschritt in % angezeigt bekommen. Nur gerundete Zahlen, ohne Nachkomma. Hintergrund: Ghost, Rahmen: ganze durchgängige Linie, Farbe GhostFrame. Das Zitat unter der Pille entfällt.“

Referenzbild: [referenzen/REF-buchdetails-01.png](referenzen/REF-buchdetails-01.png). Optische Übereinstimmung prüft der CEO im Prototyp; kein Akzeptanzkriterium.

## Anforderung (Satzschablone)

- Das System muss in den Buchdetails unter dem Lesefortschritt (REQ-023) eine Statistik-Pille mit drei Teilen in der Aufteilung des Referenzbilds darstellen.
- Das System muss die Statistik-Pille mit Hintergrund in Farbrubrik „Ghost“ und durchgehendem (nicht gestricheltem) Rahmen in Farbrubrik „GhostFrame“ darstellen.
- Das System muss im linken Teil die Flamme mit der Streak-Zahl (REQ-027) und darunter den Text „Tage in Folge“ darstellen.
- Das System muss im mittleren Teil den Lesefortschritt des Buches in Prozent als ganze Zahl ohne Nachkommastelle darstellen (statt der Lesezeit aus dem Referenzbild).
- Das System muss im rechten Teil die Anzahl der Sitzungen des Buches und darunter den Text „Sitzungen“ darstellen; eine Sitzung ist ein Eintrag im Menü „Aktuelle Seite“ (REQ-024).
- Das System darf unter der Statistik-Pille kein Zitat darstellen.

## Akzeptanzkriterien

### AK-1 Drei Teile in der Pille
- **Gegeben** die Buchdetails werden angezeigt
- **Wenn** der Bereich unter dem Lesefortschritt betrachtet wird
- **Dann** steht dort die Statistik-Pille mit linkem Teil (Flamme, „Tage in Folge“), mittlerem Teil (Prozent) und rechtem Teil (Zahl, „Sitzungen“)

### AK-2 Farben und Rahmen
- **Gegeben** die Statistik-Pille wird angezeigt
- **Wenn** Hintergrund und Rahmen geprüft werden
- **Dann** ist der Hintergrund in Farbrubrik „Ghost“
- **Und** der Rahmen ist eine durchgehende Linie in Farbrubrik „GhostFrame“

### AK-3 Fortschritt in ganzen Prozent
- **Gegeben** ein Buch mit Seitenanzahl 400 und aktueller Seite 42
- **Wenn** der mittlere Teil betrachtet wird
- **Dann** zeigt er eine ganze Prozentzahl ohne Nachkommastelle (Rundungsregel offen, siehe Offene Fragen)

### AK-4 Sitzungen zählen
- **Gegeben** für ein Buch wurde im Menü „Aktuelle Seite“ dreimal gesichert
- **Wenn** der rechte Teil betrachtet wird
- **Dann** zeigt er 3

### AK-5 Kein Zitat
- **Gegeben** die Buchdetails werden angezeigt
- **Wenn** der Bereich unter der Statistik-Pille betrachtet wird
- **Dann** steht dort kein Zitat

## Abgrenzung (nicht Teil dieses REQ)

- Berechnung der Streak-Zahl (REQ-027).
- Lesezeit in Minuten („0m“ entfällt laut CEO).

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-023, REQ-024, REQ-027.** **REQ-006:** Farbrubriken Ghost, GhostFrame.

## Offene Fragen

- F6: Zählt jedes Sichern als Sitzung (auch ohne geänderte Seite, mehrmals am Tag)?
- F7: Anzeige im mittleren Teil ohne Seitenanzahl; Rundungsregel; Beschriftung unter der Prozentzahl.
- F8: Farben von Zahlen, Texten und Trennlinien.
- Priorität.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-10 | Erstellt (Entwurf aus CEO-Beschreibung, Erweiterung 3) | Anforderungsmanager |
