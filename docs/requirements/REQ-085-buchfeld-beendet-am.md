---
id: REQ-085
titel: Buchfeld „Beendet am“ – automatisch beim Status *gelesen*, überschreibbar im Reiter „Details“
status: Implementiert
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **für jedes Buch festhalten, wann ich es beendet habe, und das Datum auch nachträglich setzen**, damit **ich früher gelesene Bücher nachtragen kann und sie in der Statistik richtig zählen**.

CEO (2026-11-22): Neues Buchfeld „Beendet am“; wird automatisch gesetzt, wenn der Status auf „Gelesen“ wechselt; kann überschrieben werden, im Reiter Details › Ausgabe über ein Datumsblatt wie bei „Hinzugefügt“ (TT.MM.JJJJ). Zweck: bereits früher gelesene Bücher nachträglich eintragen. „klingt super! Machen wir so!“

## Anforderung (Satzschablone)

- Das System muss je Buch optional ein Datum „Beendet am“ dauerhaft über die Repository-Schnittstelle speichern (ADR-0002).
- Wenn der Lesestatus eines Buches auf *gelesen* wechselt (REQ-022), muss das System „Beendet am“ auf das heutige Datum (lokale Gerätezeit) setzen.
- Das System muss in der Karte „Ausgabe“ des Reiters „Details“ (REQ-056) eine Zeile „Beendet am“ anzeigen, direkt unter „Hinzugefügt“ (Auslegung des Anforderungsmanagers). Mit Datum zeigt sie es im selben Format wie „Hinzugefügt“ (REQ-064); ohne Datum zeigt sie keinen Wert (Auslegung).
- Wenn der Nutzer die Zeile „Beendet am“ antippt, muss das System ein Datumsblatt mit demselben Verhalten wie das Blatt „Hinzugefügt“ (REQ-064) anzeigen: Feld TT.MM.JJJJ, vorbefüllt mit dem gespeicherten Datum (ohne Datum: leer), Pille „Sichern“, kein Datum in der Zukunft, ungültige Eingabe hervorgehoben ohne Speichern, Schließen ohne „Sichern“ verwirft.
- Ein überschriebenes „Beendet am“ bleibt erhalten, bis der Nutzer es erneut überschreibt oder der Status erneut auf *gelesen* wechselt.

## Akzeptanzkriterien

### AK-1 Automatisch beim Wechsel auf *gelesen*
- **Gegeben** ein Buch mit Status *am lesen* ohne „Beendet am“, heute ist der 22.11.2026
- **Wenn** der Nutzer den Status auf *gelesen* setzt
- **Dann** ist „Beendet am“ 22.11.2026, auch nach Neustart

### AK-2 Überschreiben
- **Gegeben** ein Buch mit „Beendet am“ 22.11.2026
- **Wenn** der Nutzer im Reiter „Details“ „Beendet am“ antippt, 14.03.2019 einträgt und „Sichern“ antippt
- **Dann** ist „Beendet am“ 14.03.2019, die Zeile zeigt es im Format von „Hinzugefügt“, nach Neustart unverändert

### AK-3 Zukunft wird nicht gesichert
- **Gegeben** das Blatt „Beendet am“ ist geöffnet
- **Wenn** der Nutzer das Datum von morgen einträgt und „Sichern“ antippt
- **Dann** ist das Feld wie bei „Hinzugefügt“ hervorgehoben, das Blatt bleibt offen, nichts wird gespeichert

### AK-4 Schließen verwirft
- **Gegeben** im Blatt „Beendet am“ ist ein anderes Datum eingetragen
- **Wenn** der Nutzer es ohne „Sichern“ schließt
- **Dann** ist „Beendet am“ unverändert

### AK-5 Nachtragen zählt in der Statistik
- **Gegeben** ein Buch mit 300 Seiten, Status *gelesen*, „Beendet am“ auf 14.03.2019 überschrieben
- **Wenn** die Statistik „Jährlich“ 2019 zeigt
- **Dann** zeigt „Bücher“ 1 und „Seiten“ 300 (REQ-081, REQ-084)

## Abgrenzung (nicht Teil dieses REQ)

- Verhalten beim Wechsel weg von *gelesen* (keine Festlegung des CEO; für die Zählung siehe REQ-081). Das Leeren von „Beendet am“ regelt REQ-093: Ein leeres Feld entfernt das Datum beim Sichern.
- Automatischer Statuswechsel bei 100 % Fortschritt.

## Qualitätsanforderungen

- Siehe REQ-090.

## Abhängigkeiten

- **REQ-008** (Buchdaten erweitert), **REQ-022, REQ-056, REQ-064, ADR-0002.**

## Offene Fragen

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-22 | Erstellt aus CEO-Festlegungen; Status „Abgestimmt“. Position der Zeile und Anzeige ohne Datum als Auslegung gekennzeichnet | Anforderungsmanager |
| 2026-11-23 | An REQ-093 angepasst (Abgestimmt, CEO: „okay, freigegeben. Starte mit dem nächsten Prototypen“): Leeren ist jetzt festgelegt (Abgrenzung). AKs unverändert. Status unverändert | Anforderungsmanager |
