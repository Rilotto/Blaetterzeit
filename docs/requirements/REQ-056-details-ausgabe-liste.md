---
id: REQ-056
titel: Reiter „Details“ – Abschnitt „Ausgabe“ mit zwölf Zeilen
status: Implementiert
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **die Angaben zu meiner Ausgabe des Buches gesammelt sehen und ändern**, damit **ich weiß, welches Exemplar ich habe**.

Vorgabe des CEO (wörtlich, 2026-11-15): „Bei der Ausgabe gibt es mehrere Funktionen, diese möchte ich auch mit umsetzen (siehe weiterer Screenshot). Setze dies bitte entsprechend dem Screenshot ebenfalls so um.“ „Adaptiere die bisher festgelegten Regeln, was bei Sichern passiert etc., wie bisher auch, um Nachfragen zu sparen. Icons baust du bitte selbst nach.“

Antworten des CEO (wörtlich, 2026-11-15):
- „signiert und fotos bleiben erstmal ohne Funktion (To-Do Liste)“; danach: „Signiert soll bitte nicht umgesetzt werden. Der Rest ist in Ordnung.“
- Verlag, ISBN: „aktuell leer, bitte ohne Eingabe und setze beides auf die To-Do Liste“
- Preis: „In €, Es öffnet sich ein Menü wie bei der Auswahl der Seitenanzahl und die Vorbefüllung ist 0,00 Euro“ (REQ-059)

Referenzbild: [referenzen/REF-details-02-ausgabe.png](referenzen/REF-details-02-ausgabe.png). Die optische Übereinstimmung prüft der CEO im Prototyp; sie ist kein Akzeptanzkriterium.

## Anforderung (Satzschablone)

- Das System muss unter „Ausgabe“ eine Karte mit genau diesen Zeilen in dieser Reihenfolge darstellen, je links Bezeichnung, rechts Wert: Seiten, Format, Maße (REQ-072), Exemplar, Sonderausgabe, Fotos, Preis, Verlag, Erschienen, ISBN, Hinzugefügt, Beendet am (REQ-085).
- Das System darf keine Zeile „Signiert“ darstellen (CEO: „Signiert soll bitte nicht umgesetzt werden.“).
- Das System muss die Zeilen Seiten, Format, Exemplar, Sonderausgabe, Fotos und Preis sowie die Zeile „Maße“ (REQ-072) rechts mit einem Pfeil „›“ darstellen, die übrigen ohne Pfeil; auch „Beendet am“ hat keinen Pfeil (**Auslegung**: REQ-085 legt keinen fest, die Zeile verhält sich wie „Hinzugefügt“, die keinen Pfeil hat).
- Werte:
  - Seiten: Seitenanzahl des Buches (REQ-025); Antippen: REQ-057.
  - Format: gewähltes Format, bei Print mit gewähltem Unterformat getrennt durch „ · “ (z. B. „Print · Taschenbuch“); Antippen: REQ-058.
  - Exemplar: gewählter Eigentumsstatus (z. B. „Meins“); Antippen: REQ-058.
  - Sonderausgabe: gewählte Sonderausgabe, ohne Auswahl „Keins“; Antippen: REQ-058.
  - Fotos: „Cover“ wie im Referenzbild (**Auslegung**).
  - Preis: gespeicherter Preis im Format „12,99 €“; ohne gespeicherten Preis der Text „Trag ein, was du bezahlt hast“ wie im Referenzbild (**Auslegung**); Antippen: REQ-059.
  - Verlag, ISBN: gespeicherter Verlag bzw. gespeicherte ISBN, ohne Wert rechts leer; Antippen: REQ-063.
  - Erschienen: Erscheinungsjahr (REQ-033).
  - Hinzugefügt: Eintragungsdatum (REQ-041) als abgekürzter Monat mit Punkt und Jahr (z. B. „Okt. 2026“); Antippen: REQ-064.
  - Beendet am: Datum „Beendet am“ im selben Format wie „Hinzugefügt“, ohne Datum rechts leer; Antippen: REQ-085.
- Wenn eine Zeile keinen Wert hat (Seiten, Format, Exemplar, Erschienen, Verlag, ISBN), muss das System die rechte Seite leer lassen (**Auslegung**).
- Wenn der Nutzer „Fotos“ oder „Erschienen“ antippt, darf das System nichts verändern. Das Antippen von „Verlag“ und „ISBN“ regelt REQ-063, das Antippen von „Hinzugefügt“ REQ-064 (Datumsblatt).
- Das System muss Karte, Trennlinien, Bezeichnungen, Werte und Pfeile farblich wie im Referenzbild darstellen, mit Farben aus zentralen Farbrubriken.

## Akzeptanzkriterien

### AK-1 Zwölf Zeilen in fester Reihenfolge, kein „Signiert“
- **Gegeben** der Reiter „Details“ ist aktiv
- **Wenn** die Karte unter „Ausgabe“ betrachtet wird
- **Dann** lauten die Zeilen von oben nach unten genau: Seiten, Format, Maße, Exemplar, Sonderausgabe, Fotos, Preis, Verlag, Erschienen, ISBN, Hinzugefügt, Beendet am
- **Und** es gibt keine Zeile „Signiert“

### AK-2 Pfeile
- **Gegeben** die Karte „Ausgabe“ wird angezeigt
- **Wenn** die rechten Enden der Zeilen betrachtet werden
- **Dann** haben genau Seiten, Format, Exemplar, Sonderausgabe, Fotos und Preis sowie „Maße“ (REQ-072) einen Pfeil „›“
- **Und** „Hinzugefügt“ und „Beendet am“ haben keinen Pfeil

### AK-3 Seiten und Erschienen
- **Gegeben** ein Buch mit Seitenanzahl 608 und Erscheinungsjahr 2025
- **Wenn** die Karte „Ausgabe“ betrachtet wird
- **Dann** zeigt „Seiten“ den Wert 608 und „Erschienen“ den Wert 2025

### AK-4 Format, Exemplar, Sonderausgabe
- **Gegeben** ein Buch mit Format „Print“, Unterformat „Taschenbuch“, Exemplar „Meins“ und ohne Sonderausgabe
- **Wenn** die Karte „Ausgabe“ betrachtet wird
- **Dann** zeigen die Zeilen „Print · Taschenbuch“, „Meins“ und „Keins“

### AK-5 Neues Buch
- **Gegeben** ein neu angelegtes Buch nur mit Titel
- **Wenn** die Karte „Ausgabe“ betrachtet wird
- **Dann** sind Seiten, Format, Exemplar, Erschienen, Verlag und ISBN rechts leer
- **Und** Sonderausgabe zeigt „Keins“, Preis „Trag ein, was du bezahlt hast“, Fotos „Cover“

### AK-6 Hinzugefügt
- **Gegeben** ein Buch mit Eintragungsdatum 14.10.2026
- **Wenn** die Karte „Ausgabe“ betrachtet wird
- **Dann** zeigt „Hinzugefügt“ den Wert „Okt. 2026“

### AK-7 Zeilen ohne Funktion
- **Gegeben** die Karte „Ausgabe“ wird angezeigt
- **Wenn** der Nutzer „Fotos“ bzw. „Erschienen“ antippt
- **Dann** öffnet sich kein Menü und kein Fenster, und nichts ändert sich
- **Und** für „Verlag“ und „ISBN“ (Blatt nach REQ-063) sowie „Hinzugefügt“ (Datumsblatt nach REQ-064) gilt dieses AK nicht

## Abgrenzung (nicht Teil dieses REQ)

- Seitenanzahl ändern (REQ-057), Fenster „Format“ (REQ-058), Preis eingeben (REQ-059).
- Funktion von Fotos (To-do-Liste, Could). Eingabe von Verlag und ISBN: REQ-063.
- „Signiert“ (CEO: nicht umsetzen).

## Qualitätsanforderungen

- Keine.

## Abhängigkeiten

- **REQ-025, REQ-033, REQ-041, REQ-051, REQ-057, REQ-058, REQ-059, REQ-063, REQ-064, REQ-085.**

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-15 | Erstellt aus CEO-Vorgabe „Reiter Details“ | Anforderungsmanager |
| 2026-11-15 | CEO-Antworten 2, 3 eingearbeitet; Auslegungen: Signiert/Fotos nur Anzeige wie Screenshot, leere Werte rechts leer, Preisanzeige (neu AK-5, AK-7) | Anforderungsmanager |
| 2026-11-15 | CEO: „Signiert soll bitte nicht umgesetzt werden. Der Rest ist in Ordnung.“ Zeile „Signiert“ entfernt (zehn Zeilen; AK-1, AK-5, AK-7 angepasst). Status „Abgestimmt“ | Anforderungsmanager |
| 2026-11-21 | CEO (wörtlich): „ja ergänze bitte den Pfeil bei "Maße".“ Zeile „Maße“ (REQ-072) in die Pfeil-Aufzählung (Anforderung, AK-2) aufgenommen. Status unverändert | Anforderungsmanager |
| 2026-11-21 | Konflikt mit REQ-072 (vom CEO bestätigt: „Maße“ direkt unter „Format“) aufgelöst: Zeilenliste und AK-1 auf elf Zeilen mit „Maße“ nach „Format“, Titel angepasst. Status unverändert | Anforderungsmanager |
| 2026-11-22 | An REQ-085 angepasst: zwölfte Zeile „Beendet am“ direkt unter „Hinzugefügt“ (Position laut REQ-085), Wert wie „Hinzugefügt“, ohne Pfeil (Auslegung, wie „Hinzugefügt“). Titel, Zeilenliste, AK-1, AK-2 angepasst. Status unverändert | Anforderungsmanager |
| 2026-11-23 | Widerspruch zu REQ-064 aufgelöst, CEO (wörtlich): „Genau, Req-064 löst damit req-056 ab.“ „Hinzugefügt“ aus den Zeilen ohne Funktion (Anforderung, AK-7) entfernt; Antippen von „Hinzugefügt“ öffnet das Datumsblatt nach REQ-064. Pfeil-Regel (AK-2: „Hinzugefügt“ ohne Pfeil) unverändert. Status unverändert | Anforderungsmanager |
| 2026-11-23 | Widerspruch zu REQ-063 aufgelöst, CEO (wörtlich): „Ja req-063 ist hier maßgebend.“ Verlag und ISBN: Wert „derzeit leer, ohne Eingabemöglichkeit“ ersetzt durch gespeicherten Wert, Antippen nach REQ-063; aus den Zeilen ohne Funktion (Anforderung, AK-7) und der Abgrenzung entfernt. Pfeil-Regel unverändert. Status unverändert | Anforderungsmanager |
