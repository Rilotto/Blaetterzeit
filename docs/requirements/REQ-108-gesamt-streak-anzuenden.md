---
id: REQ-108
titel: Gesamt-Streak (Startseite, Statistik) – Flamme erst durch Lesen am heutigen Tag „angezündet“, sonst ausgegraut
status: In Umsetzung
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **meine Lesesträhne jeden Tag selbst durch Lesen „anzünden“**, damit **ich sehe, ob ich heute schon gelesen habe, ohne dass die Strähne verloren wirkt**.

CEO (wörtlich, 2026-11-25): „Gestern habe ich gelesen -> Flamme an auf 1. Heute habe ich noch nicht gelesen, die Flamme ist trotzdem noch an. Ich möchte diese aber selbst "anzünden" durch lesen. Die 1 ist trotzdem sichtbar im leicht ausgegrauten Feuer. […] Also dass wir die Logik bei den Streaks aufsplitten.“

Ergänzung (CEO, 2026-11-25, über den Scrum Master): „1. Ja“, das Ausgrauen gilt auch in der Statistik. Das bestehende Flammen-Icon bleibt, neue Icon-Entwürfe hat er abgelehnt. Die Zusammenfassung des Scrum Masters hat er ohne Widerspruch stehen lassen.

## Anforderung (Satzschablone)

**Geltungsbereich**
- Dieser REQ gilt für den buchübergreifenden Gesamt-Streak: Lesesträhne auf der Startseite (REQ-103) und „Serie X Tage“ in der Statistik (REQ-087). Für die Buchdetails gilt REQ-109.

**Zählung (unverändert)**
- Die Zahl wird wie bisher berechnet (REQ-087): lückenlose Kalendertage mit mindestens einer Sitzung an irgendeinem Buch, die heute oder gestern enden. Lokale Gerätezeit, nur Sitzungen zählen (eine Sitzung entsteht nur bei erhöhtem Fortschritt, REQ-024).

**Drei Zustände der Flamme**
- **Angezündet**: Wenn heute ein Lesetag ist, muss das System die Flamme gefüllt wie bisher darstellen (Verlauf „Flamme Rot“ nach „Flamme Orange“, Zahl in „Hintergrund“, REQ-027). Die Zahl enthält den heutigen Tag.
- **Ausgegraut**: Wenn gestern ein Lesetag ist, heute aber noch nicht, muss das System die Zahl weiter anzeigen und die Flamme gefüllt in der neuen Farbrolle „Flamme ausgegraut“ darstellen. Diese bezieht ihren Wert aus der Farbrubrik „GhostFrame“ (**Auslegung**, Standardwert auf Zuruf änderbar). Die Zahl steht in „Dunkelbraun“ (**Auslegung**, wegen der Lesbarkeit auf hellem Grund).
- **Erloschen**: Wenn weder heute noch gestern ein Lesetag ist, zeigt das System 0 wie bisher (Umriss in „GhostFrame“, REQ-027).
- Die Form der Flamme bleibt das bestehende Flammen-Icon.
- Sobald der Nutzer heute eine Sitzung speichert, muss das System die Flamme beim nächsten Anzeigen angezündet darstellen.

## Akzeptanzkriterien

### AK-1 Gestern gelesen, heute noch nicht: ausgegraut
- **Gegeben** Sitzungen nur gestern, heute noch keine
- **Wenn** Startseite bzw. (zweiter Durchlauf) Statistik angezeigt wird
- **Dann** zeigt die Flamme 1 und ist ausgegraut (Farbrolle „Flamme ausgegraut“, kein Rot-Orange-Verlauf)
- **Und** die Statistik zeigt „Serie 1 Tage“ bzw. die Zahl 1 (Wortlaut wie REQ-087)

### AK-2 Heute gelesen: angezündet
- **Gegeben** Sitzungen gestern und heute
- **Wenn** Startseite bzw. Statistik angezeigt wird
- **Dann** zeigt die Flamme 2 mit dem Verlauf „Flamme Rot“ nach „Flamme Orange“

### AK-3 Anzünden durch Lesen
- **Gegeben** der Zustand aus AK-1
- **Wenn** der Nutzer heute den Fortschritt eines Buches erhöht und sichert
- **Dann** zeigt die Flamme 2 und ist angezündet

### AK-4 Sichern ohne Erhöhung zündet nicht an
- **Gegeben** der Zustand aus AK-1
- **Wenn** der Nutzer heute nur ohne Erhöhung sichert
- **Dann** bleibt die Flamme bei 1 und ausgegraut

### AK-5 Erloschen
- **Gegeben** die letzte Sitzung war vorgestern
- **Wenn** Startseite bzw. Statistik angezeigt wird
- **Dann** zeigt die Flamme 0 als Umriss wie bisher

### AK-6 Farbrolle zentral
- **Gegeben** der Wert der Farbrubrik „GhostFrame“ wird zentral geändert
- **Wenn** eine ausgegraute Flamme angezeigt wird
- **Dann** ist sie im geänderten Wert gefüllt

## Abgrenzung (nicht Teil dieses REQ)

- Streak in den Buchdetails (REQ-109).
- Neues Flammen-Icon (vom CEO abgelehnt).

## Qualitätsanforderungen

- Darstellung in allen Farbdesigns und Stilen (REQ-068, REQ-071, REQ-090).

## Abhängigkeiten

- **REQ-087:** Zählung bleibt. Die Darstellung der Flamme bekommt den Zustand „ausgegraut“. Die Abgrenzung „Flamme in den Buchdetails bleibt unverändert“ wird durch REQ-109 abgelöst.
- **REQ-103:** Die Lesesträhne der Startseite bekommt den Zustand „ausgegraut“. Bisher gilt dort „bei 0 Umriss, sonst gefüllt“.
- **REQ-027** (Flammenform, Farbrubriken), **REQ-024, REQ-109.**

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-25 | Erstellt aus CEO-Vorgabe und Ergänzungen vom 2026-11-25, Entwurf | Anforderungsmanager |
| 2026-11-25 | Festlegungen (Rot-Orange-Verlauf bei angezündeter Flamme, ausgegraut in „GhostFrame“ mit Zahl in „Dunkelbraun“) vom CEO bestätigt (wörtlich): „beide punkte passen für mich.“ Status „Abgestimmt“ | Anforderungsmanager |
