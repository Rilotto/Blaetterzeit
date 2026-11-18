---
id: REQ-058
titel: Reiter „Details“ – Fenster „Format“ für Format, Sonderausgabe und Exemplar
status: Implementiert
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **Format, Sonderausgabe und Eigentum meines Exemplars in einem Fenster festlegen**, damit **die Ausgabe vollständig beschrieben ist**.

Vorgabe des CEO (wörtlich, 2026-11-15): „Öffne ich einen der folgenden Punkte: Format, Exemplar, Sonderausgabe, kommt das Fenster "Format" -> Auch hier nachbauen wie im Screenshot!“ „Adaptiere die bisher festgelegten Regeln, was bei Sichern passiert etc., wie bisher auch, um Nachfragen zu sparen. Icons baust du bitte selbst nach.“

Antworten des CEO (wörtlich, 2026-11-15):
- Unterauswahl E-Book/Hörbuch: „Noch keine Funktion (auf To-Do Liste bitte -> Could)“
- „nur eine Sonderausgabe, ein erneuter Klick hebt die Auswahl wieder auf“
- „Erstmal nur Farbschnitt, Erstausgabe, Sammlerausgabe“
- „es ist nichts vorausgewählt“

Referenzbild: [referenzen/REF-details-03-format.png](referenzen/REF-details-03-format.png). Die optische Übereinstimmung prüft der CEO im Prototyp; sie ist kein Akzeptanzkriterium.

## Anforderung (Satzschablone)

- Wenn der Nutzer die Zeile „Format“, „Exemplar“ oder „Sonderausgabe“ (REQ-056) antippt, muss das System das Fenster „Format“ von unten über abgedunkelten Buchdetails öffnen und den gespeicherten Stand als Auswahl zeigen.
- Bei einem Buch ohne gespeicherte Angaben darf im Fenster nichts vorausgewählt sein.
- Das System muss oben einen Ziehgriff, die zentrierte Überschrift „Format“ und rechts eine X-Schaltfläche darstellen.
- Das System muss drei Kacheln „Print“, „E-Book“, „Hörbuch“ mit selbst nachgebildeten Icons darstellen; höchstens eine ist gewählt (Häkchen, hervorgehoben), nicht gewählte zeigen einen leeren Kreis.
- Wenn „Print“ gewählt ist, muss das System darunter die Karte „Print“ mit den Unterformaten „Hardcover“, „Taschenbuch“, „Kleinformat“, „Weiß ich nicht“ (je mit nachgebildetem Icon, höchstens eines gewählt) und dem Bereich „Sonderausgabe“ darstellen.
- Wenn „E-Book“ oder „Hörbuch“ gewählt ist, darf das System keine Karte mit Unterauswahl darstellen (**Auslegung**: Unterauswahl steht auf der To-do-Liste, Could).
- Das System muss im Bereich „Sonderausgabe“ genau die Pillen „Farbschnitt“, „Erstausgabe“, „Sammlerausgabe“ darstellen und rechts neben der Bezeichnung die gewählte Sonderausgabe anzeigen.
- Wenn der Nutzer eine nicht gewählte Sonderausgabe antippt, muss das System sie als einzige wählen; tippt er die gewählte erneut an, muss das System die Auswahl aufheben.
- Das System muss unter „Wem gehört dieses Exemplar?“ die Auswahl „Meins“, „Ich will es“, „Geliehen“, „Verliehen“, „Verkauft“ darstellen, höchstens eine gewählt.
- Das System muss unten die Schaltfläche „Sichern“ in Farbrubrik „Primär“ darstellen.
- Wenn der Nutzer „Sichern“ antippt, muss das System Format, Unterformat, Sonderausgabe und Exemplar dauerhaft speichern (ADR-0002), das Fenster schließen und die Zeilen in „Ausgabe“ aktualisieren (übertragen aus REQ-049).
- Wenn der Nutzer das Fenster ohne „Sichern“ schließt (X, Herunterziehen am Griff, Tippen außerhalb, Android-Zurück-Taste), darf das System nichts speichern (übertragen aus REQ-049).
- Das System muss Elemente und Farben wie im Referenzbild darstellen, mit Farben aus zentralen Farbrubriken.

## Akzeptanzkriterien

### AK-1 Öffnen aus drei Zeilen
- **Gegeben** der Reiter „Details“ ist aktiv
- **Wenn** der Nutzer „Format“, „Exemplar“ bzw. „Sonderausgabe“ antippt
- **Dann** öffnet sich jeweils das Fenster „Format“ mit Ziehgriff, Überschrift „Format“, X und „Sichern“

### AK-2 Neues Buch ohne Vorauswahl
- **Gegeben** ein Buch ohne gespeicherte Format-, Sonderausgabe- und Exemplar-Angaben
- **Wenn** das Fenster „Format“ geöffnet wird
- **Dann** ist weder Format noch Sonderausgabe noch Exemplar gewählt

### AK-3 Gespeicherter Stand
- **Gegeben** ein Buch mit gespeichertem „Print“, „Taschenbuch“, „Farbschnitt“, „Meins“
- **Wenn** das Fenster „Format“ geöffnet wird
- **Dann** sind genau diese Werte gewählt und rechts neben „Sonderausgabe“ steht „Farbschnitt“

### AK-4 Genau ein Format, Karte nur bei Print
- **Gegeben** „Print“ ist gewählt
- **Wenn** der Nutzer „E-Book“ antippt
- **Dann** hat „E-Book“ das Häkchen und „Print“ nicht mehr
- **Und** die Karte mit Unterformaten und Sonderausgabe wird nicht angezeigt

### AK-5 Eine Sonderausgabe, abwählbar
- **Gegeben** „Print“ ist gewählt, „Farbschnitt“ ist gewählt
- **Wenn** der Nutzer „Erstausgabe“ antippt und danach erneut „Erstausgabe“
- **Dann** ist zuerst nur „Erstausgabe“ gewählt
- **Und** danach ist keine Sonderausgabe gewählt

### AK-6 Genau drei Sonderausgaben
- **Gegeben** die Karte „Print“ wird angezeigt
- **Wenn** die Pillen unter „Sonderausgabe“ betrachtet werden
- **Dann** sind es genau „Farbschnitt“, „Erstausgabe“, „Sammlerausgabe“

### AK-7 Unterformat und Exemplar je höchstens eines
- **Gegeben** „Print“ mit „Taschenbuch“ und Exemplar „Meins“ ist gewählt
- **Wenn** der Nutzer „Hardcover“ und „Geliehen“ antippt
- **Dann** sind „Hardcover“ und „Geliehen“ gewählt, „Taschenbuch“ und „Meins“ nicht mehr

### AK-8 Sichern
- **Gegeben** im Fenster wurden „Print“, „Hardcover“ und „Geliehen“ gewählt
- **Wenn** der Nutzer „Sichern“ antippt
- **Dann** schließt sich das Fenster
- **Und** die Zeilen zeigen „Print · Hardcover“ und „Geliehen“, auch nach einem Neustart

### AK-9 Schließen ohne Sichern
- **Gegeben** im Fenster wurde eine Auswahl geändert
- **Wenn** der Nutzer X, Herunterziehen, Tippen außerhalb bzw. die Zurück-Taste verwendet
- **Dann** bleiben die gespeicherten Werte unverändert

## Abgrenzung (nicht Teil dieses REQ)

- Anzeige der Werte in der Karte „Ausgabe“ (REQ-056).
- Unterauswahl für E-Book und Hörbuch (To-do-Liste, Could).

## Qualitätsanforderungen

- Keine.

## Abhängigkeiten

- **REQ-049** (Regeln für Sichern/Schließen), **REQ-056.**

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-15 | Erstellt aus CEO-Vorgabe „Reiter Details“ und Referenzbild REF-details-03-format.png | Anforderungsmanager |
| 2026-11-15 | CEO-Antworten 1.1–1.4 eingearbeitet: keine Unterauswahl E-Book/Hörbuch (Auslegung: keine Karte), eine Sonderausgabe abwählbar, genau drei Sonderausgaben, keine Vorauswahl (neu AK-2, AK-5, AK-6) | Anforderungsmanager |
| 2026-11-15 | Status „Abgestimmt“ (CEO 2026-11-15, über den Scrum Master: „Der Rest ist in Ordnung.“) | Anforderungsmanager |
