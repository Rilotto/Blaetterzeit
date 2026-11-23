---
id: REQ-080
titel: Seite „Statistik“ – Zeitraum blättern und Zeitraum-Titel
status: Implementiert
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **mit Pfeilen zu früheren und späteren Wochen, Monaten oder Jahren blättern**, damit **ich vergangene Zeiträume vergleichen kann**.

CEO (2026-11-22): Pfeile ‹ ›, Blättern in Vergangenheit und Zukunft, „in der Zukunft ist alles leer“. Titel wie in den Screenshots, z. B. „16 – 22 Nov“ / 2026, „November“ / 2026, „2026“. „Die Woche beginnt immer montags.“

## Anforderung (Satzschablone)

- Das System muss unter den Zeitraum-Pillen links einen Pfeil „‹“, mittig den Zeitraum-Titel und rechts einen Pfeil „›“ anzeigen.
- Das System muss eine Woche immer von Montag bis Sonntag rechnen, einen Monat vom 1. bis zum letzten Tag, ein Jahr vom 1. Januar bis 31. Dezember, jeweils nach lokaler Gerätezeit.
- Wenn der Nutzer „‹“ bzw. „›“ antippt, muss das System den vorherigen bzw. nächsten Zeitraum derselben Art anzeigen; beide Richtungen sind unbegrenzt, auch in die Zukunft.
- Für Zeiträume bzw. Tage in der Zukunft muss das System alle Werte leer bzw. 0 zeigen.
- Das System muss als Zeitraum-Titel anzeigen:
  - Woche: erste Zeile „T – T Mon“ (z. B. „16 – 22 Nov“), zweite Zeile das Jahr (z. B. „2026“);
  - Monat: erste Zeile der ausgeschriebene Monatsname (z. B. „November“), zweite Zeile das Jahr;
  - Jahr: nur das Jahr (z. B. „2026“).
- Auslegung des Anforderungsmanagers: Liegt eine Woche in zwei Monaten, nennt die erste Zeile beide Monate („27 Okt – 2 Nov“); liegt sie in zwei Jahren, steht in der zweiten Zeile das Jahr des Sonntags. Monatskürzel: Jan, Feb, Mär, Apr, Mai, Jun, Jul, Aug, Sep, Okt, Nov, Dez.

## Akzeptanzkriterien

### AK-1 Wochentitel
- **Gegeben** heute ist Sonntag, 22.11.2026, „Wöchentlich“ ist aktiv
- **Wenn** die Seite geöffnet wird
- **Dann** lautet der Titel „16 – 22 Nov“ mit „2026“ darunter

### AK-2 Woche beginnt montags
- **Gegeben** heute ist Montag, 23.11.2026, „Wöchentlich“ ist aktiv
- **Wenn** die Seite geöffnet wird
- **Dann** lautet der Titel „23 – 29 Nov“

### AK-3 Zurückblättern
- **Gegeben** „Monatlich“ ist aktiv, gezeigt wird „November“ / 2026
- **Wenn** der Nutzer „‹“ antippt
- **Dann** lautet der Titel „Oktober“ / 2026

### AK-4 In die Zukunft blättern
- **Gegeben** „Jährlich“ ist aktiv, gezeigt wird „2026“, es gibt Sitzungen im Jahr 2026
- **Wenn** der Nutzer „›“ antippt
- **Dann** lautet der Titel „2027“ und alle Kennzahlen, Balken, Lesetage und Kalendermarkierungen sind leer bzw. 0

### AK-5 Monatswechsel in der Woche
- **Gegeben** „Wöchentlich“ ist aktiv
- **Wenn** die Woche vom 30.11.2026 bis 06.12.2026 gezeigt wird
- **Dann** lautet der Titel „30 Nov – 6 Dez“ / 2026

## Abgrenzung (nicht Teil dieses REQ)

- Inhalte der Kacheln, des Diagramms und der Kalender (REQ-081 bis REQ-088).

## Qualitätsanforderungen

- Siehe REQ-090.

## Abhängigkeiten

- **REQ-079.** Tageswechsel nach lokaler Gerätezeit wie **REQ-027**.

## Offene Fragen

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-22 | Erstellt aus CEO-Festlegungen; Status „Abgestimmt“. Titel bei monats- bzw. jahresübergreifender Woche und Monatskürzel als Auslegung gekennzeichnet | Anforderungsmanager |
