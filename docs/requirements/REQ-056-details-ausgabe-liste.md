---
id: REQ-056
titel: Reiter „Details“ – Abschnitt „Ausgabe“ mit elf Zeilen
status: Entwurf
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

Referenzbild: [referenzen/REF-details-02-ausgabe.png](referenzen/REF-details-02-ausgabe.png). Die optische Übereinstimmung prüft der CEO im Prototyp; sie ist kein Akzeptanzkriterium.

## Anforderung (Satzschablone)

- Das System muss unter „Ausgabe“ eine Karte mit genau diesen Zeilen in dieser Reihenfolge darstellen, je links Bezeichnung, rechts Wert: Seiten, Format, Exemplar, Signiert, Sonderausgabe, Fotos, Preis, Verlag, Erschienen, ISBN, Hinzugefügt.
- Das System muss die Zeilen Seiten, Format, Exemplar, Sonderausgabe, Fotos und Preis rechts mit einem Pfeil „›“ darstellen; die übrigen ohne Pfeil.
- Werte:
  - Seiten: Seitenanzahl des Buches (REQ-025).
  - Format: gewähltes Format und ggf. Unterformat, getrennt durch „ · “ (z. B. „Print · Taschenbuch“) (REQ-058).
  - Exemplar: gewählter Eigentumsstatus (z. B. „Meins“) (REQ-058).
  - Sonderausgabe: gewählte Sonderausgabe, ohne Auswahl „Keins“ (REQ-058).
  - Erschienen: Erscheinungsjahr (REQ-033).
  - Hinzugefügt: Eintragungsdatum (REQ-041) als abgekürzter Monat mit Punkt und Jahr (z. B. „Okt. 2026“).
  - Signiert, Fotos, Preis, Verlag, ISBN: siehe Offene Fragen.
- Das System muss Karte, Trennlinien, Bezeichnungen, Werte und Pfeile farblich wie im Referenzbild darstellen, mit Farben aus zentralen Farbrubriken.

## Akzeptanzkriterien

### AK-1 Elf Zeilen in fester Reihenfolge
- **Gegeben** der Reiter „Details“ ist aktiv
- **Wenn** die Karte unter „Ausgabe“ betrachtet wird
- **Dann** lauten die Zeilen von oben nach unten: Seiten, Format, Exemplar, Signiert, Sonderausgabe, Fotos, Preis, Verlag, Erschienen, ISBN, Hinzugefügt

### AK-2 Pfeile
- **Gegeben** die Karte „Ausgabe“ wird angezeigt
- **Wenn** die rechten Enden der Zeilen betrachtet werden
- **Dann** haben genau Seiten, Format, Exemplar, Sonderausgabe, Fotos und Preis einen Pfeil „›“

### AK-3 Seiten und Erschienen
- **Gegeben** ein Buch mit Seitenanzahl 608 und Erscheinungsjahr 2025
- **Wenn** die Karte „Ausgabe“ betrachtet wird
- **Dann** zeigt „Seiten“ den Wert 608 und „Erschienen“ den Wert 2025

### AK-4 Format, Exemplar, Sonderausgabe
- **Gegeben** ein Buch mit Format „Print“, Unterformat „Taschenbuch“, Exemplar „Meins“ und ohne Sonderausgabe
- **Wenn** die Karte „Ausgabe“ betrachtet wird
- **Dann** zeigen die Zeilen „Print · Taschenbuch“, „Meins“ und „Keins“

### AK-5 Hinzugefügt
- **Gegeben** ein Buch mit Eintragungsdatum 14.10.2026
- **Wenn** die Karte „Ausgabe“ betrachtet wird
- **Dann** zeigt „Hinzugefügt“ den Wert „Okt. 2026“

## Abgrenzung (nicht Teil dieses REQ)

- Ändern der Seitenanzahl (REQ-057). Fenster „Format“ (REQ-058).

## Qualitätsanforderungen

- Keine.

## Abhängigkeiten

- **REQ-025, REQ-033, REQ-041, REQ-051, REQ-057, REQ-058.**

## Offene Fragen

- Signiert („Premium“ mit Schloss), Fotos („Cover“), Preis („Trag ein, was du bezahlt hast“): Anzeige und Wirkung beim Antippen? (Frage 2)
- Verlag und ISBN: eingebbar und wo? Was zeigt eine Zeile ohne Wert (z. B. Seiten, Erschienen, Verlag, ISBN)? (Frage 3)

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-15 | Erstellt aus CEO-Vorgabe „Reiter Details“ | Anforderungsmanager |
