---
id: REQ-103
titel: Startseite – „Diese Woche“ mit Covern je Tag und Lesesträhne
status: Implementiert
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **auf der Startseite sehen, an welchen Tagen dieser Woche ich gelesen habe und wie lang meine Lesesträhne ist**, damit **ich motiviert bin, dranzubleiben**.

CEO (2026-11-24, über den Scrum Master): „Diese Woche“: Wochenübersicht wie im Wochenkalender der Statistik (REQ-088), Mo–So, mit dem Cover des gelesenen Buchs pro Tag. Antippen öffnet die Statistik. Lesesträhne: Flamme mit Zahl wie in der Statistik (REQ-087).

## Anforderung (Satzschablone)

**Diese Woche**
- Das System muss auf der Startseite den Bereich „Diese Woche“ mit der laufenden Kalenderwoche (Montag bis Sonntag, lokale Gerätezeit) anzeigen, aufgebaut wie die Wochen-Kalenderkarte der Statistik (REQ-088): Wochentagszeile „MO DI MI DO FR SA SO“, je Tag eine Kachel mit Tageszahl, an Lesetagen das Cover des gelesenen Buches (Regeln für mehrere Bücher und fehlendes Cover wie REQ-088), heutiger Tag umrandet.
- Wenn der Nutzer den Bereich „Diese Woche“ antippt, muss das System den Menüpunkt „Statistik“ mit „Wöchentlich“ und der laufenden Woche öffnen (**Auslegung**: Zeitraum passend zur Wochenübersicht). Die dort gespeicherte Pillenwahl (REQ-079) wird damit auf „Wöchentlich“ gesetzt (**Auslegung**).

**Lesesträhne**
- Das System muss auf der Startseite die Lesesträhne mit Flamme und Zahl anzeigen, berechnet wie „Serie X Tage“ der Statistik (REQ-087: buchübergreifend, nur Sitzungen, endet heute oder gestern). Die Flamme ist angezündet, ausgegraut oder erloschen nach REQ-108 (Form und Farben wie REQ-027). Die Strähne steht im Bereich „Diese Woche“ (**Auslegung**: Lage nach der Konzeptskizze, kein Akzeptanzkriterium).

## Akzeptanzkriterien

### AK-1 Laufende Woche mit Covern
- **Gegeben** heute ist Mittwoch, 25.11.2026, Sitzungen am Montag („Fourth Wing“) und Mittwoch („Iron Flame“)
- **Wenn** die Startseite angezeigt wird
- **Dann** zeigt „Diese Woche“ MO bis SO mit 23 bis 29, am Montag das Cover von „Fourth Wing“, am Mittwoch das von „Iron Flame“, und der 25. ist umrandet

### AK-2 Antippen öffnet die Statistik
- **Gegeben** die Startseite wird angezeigt
- **Wenn** der Nutzer „Diese Woche“ antippt
- **Dann** ist der Menüpunkt „Statistik“ aktiv, „Wöchentlich“ ist gewählt, und die laufende Woche wird gezeigt

### AK-3 Lesesträhne wie in der Statistik
- **Gegeben** Sitzungen vorgestern, gestern und heute an verschiedenen Büchern
- **Wenn** die Startseite angezeigt wird
- **Dann** zeigt die Flamme 3, angezündet, dieselbe Zahl wie „Serie 3 Tage“ in der Statistik
- **Und** gibt es Sitzungen nur bis gestern, ist die Flamme ausgegraut mit sichtbarer Zahl (REQ-108)
- **Und** liegt die letzte Sitzung vorgestern, zeigt sie 0 und die Flamme als Umriss

## Abgrenzung (nicht Teil dieses REQ)

- Monats- und Jahresansicht auf der Startseite.

## Qualitätsanforderungen

- Darstellung in allen Farbdesigns und Stilen (REQ-068, REQ-071, REQ-090).

## Abhängigkeiten

- **REQ-027, REQ-079, REQ-080, REQ-086, REQ-087, REQ-088, REQ-101.**
- **REQ-108 (Entwurf):** Die Lesesträhne bekommt den Zustand „ausgegraut“ (gestern gelesen, heute noch nicht). Bisher gilt „bei 0 Umriss, sonst gefüllt“.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-24 | Erstellt aus CEO-Vision und abgenommener Konzeptskizze, Entwurf | Anforderungsmanager |
| 2026-11-24 | Vom CEO bestätigt (wörtlich): „sieht alles super aus! Danke!“. Status „Abgestimmt“ | Anforderungsmanager |
| 2026-11-25 | Verweis auf REQ-108 (Entwurf, ausgegraute Flamme) unter Abhängigkeiten ergänzt. AKs bleiben bis zur Abstimmung unverändert. Status unverändert | Anforderungsmanager |
| 2026-11-25 | An REQ-108 angepasst (Abgestimmt, CEO: „beide punkte passen für mich.“): Flamme mit drei Zuständen (Anforderung, AK-3). Status unverändert | Anforderungsmanager |
