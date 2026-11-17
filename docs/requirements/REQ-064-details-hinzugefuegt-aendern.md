---
id: REQ-064
titel: Reiter „Details“ – Datum „Hinzugefügt“ über ein Blatt ändern
status: In Umsetzung
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **das automatisch gespeicherte Datum „Hinzugefügt“ überschreiben**, damit **es stimmt, auch wenn ich ein Buch später eintrage, als ich es bekommen habe**.

CEO (wörtlich, 2026-11-16): „weiterhin automatisch, ich möchte es aber überschreiben können“; zur Eingabe in den Details: „mache mir einen Vorschlag“.

Vom CEO angenommener Vorschlag des Scrum Masters: Hinzugefügt → Blatt mit Datum TT.MM.JJJJ, vorbefüllt, kein Datum in der Zukunft. Schließen ohne Sichern verwirft.

Bestätigung des CEO (2026-11-16): „passt alles für mich. bitte für den nächsten Sprint planen.“

## Anforderung (Satzschablone)

- Wenn der Nutzer im Reiter „Details“ die Zeile „Hinzugefügt“ antippt, muss das System ein Blatt nach dem Muster des Menüs „Preis“ (REQ-059) mit einem Datumsfeld im Format TT.MM.JJJJ und der Pille „Sichern“ anzeigen, vorbefüllt mit dem gespeicherten Eintragungsdatum.
- Ein Datum ist ungültig, wenn es kein existierendes Kalenderdatum im Format TT.MM.JJJJ ist oder in der Zukunft liegt.
- Wenn der Nutzer „Sichern“ antippt und das Datum gültig ist, muss das System es dauerhaft als Eintragungsdatum speichern, das Blatt schließen und es in der Zeile „Hinzugefügt“ anzeigen.
- Wenn das Datum ungültig ist, muss das System das Feld so hervorheben wie das ungültige Feld „JAHR“ (REQ-031: Primär, kein Hinweistext, bis der Nutzer etwas im Feld ändert), nichts speichern und das Blatt geöffnet lassen.
- Wenn der Nutzer das Blatt auf anderem Weg als „Sichern“ schließt, muss das System die Eingabe verwerfen.
- Dasselbe Blatt dient beim Anlegen zum Überschreiben von „Hinzugefügt“ (REQ-060).

## Akzeptanzkriterien

### AK-1 Blatt vorbefüllt
- **Gegeben** ein Buch mit Eintragungsdatum 10.11.2026
- **Wenn** der Nutzer im Reiter „Details“ „Hinzugefügt“ antippt
- **Dann** ist das Blatt geöffnet und das Feld zeigt 10.11.2026

### AK-2 Gültiges Datum sichern
- **Gegeben** das Blatt „Hinzugefügt“ ist geöffnet
- **Wenn** der Nutzer 01.02.2025 einträgt und „Sichern“ antippt
- **Dann** ist das Eintragungsdatum 01.02.2025 und die Zeile „Hinzugefügt“ zeigt dieses Datum
- **Und** nach einem Neustart der App ist es unverändert vorhanden

### AK-3 Datum in der Zukunft wird nicht gesichert
- **Gegeben** das Blatt „Hinzugefügt“ ist geöffnet
- **Wenn** der Nutzer das Datum von morgen einträgt und „Sichern“ antippt
- **Dann** ist das Feld in Primär hervorgehoben, ohne Hinweistext
- **Und** das Blatt bleibt geöffnet, das Eintragungsdatum ist unverändert

### AK-4 Nicht existierendes Datum wird nicht gesichert
- **Gegeben** das Blatt „Hinzugefügt“ ist geöffnet
- **Wenn** der Nutzer 31.02.2025 einträgt und „Sichern“ antippt
- **Dann** ist das Feld hervorgehoben und es wurde nichts gespeichert

### AK-5 Schließen ohne Sichern verwirft
- **Gegeben** im Blatt „Hinzugefügt“ ist ein anderes Datum eingetragen
- **Wenn** der Nutzer es schließt, ohne „Sichern“ anzutippen
- **Dann** ist das Eintragungsdatum unverändert

## Abgrenzung (nicht Teil dieses REQ)

- Automatisches Speichern beim Anlegen (REQ-041).

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-041:** Eintragungsdatum war dort „nicht änderbar“; das ändert sich mit Umsetzung dieses REQ. Das automatische Speichern bleibt.
- **REQ-056, REQ-059, REQ-031, REQ-034, REQ-060.**
- Sortierknopf „Zuletzt“ (To-do-Liste) würde das geänderte Eintragungsdatum verwenden.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-16 | Erstellt aus CEO-Antwort und vom CEO angenommenem Vorschlag; Status „Abgestimmt“ (CEO: „passt alles für mich. bitte für den nächsten Sprint planen.“) | Anforderungsmanager |
