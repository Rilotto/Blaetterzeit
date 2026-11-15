---
id: REQ-058
titel: Reiter „Details“ – Fenster „Format“ für Format, Sonderausgabe und Exemplar
status: Entwurf
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

Referenzbild: [referenzen/REF-details-03-format.png](referenzen/REF-details-03-format.png). Die optische Übereinstimmung prüft der CEO im Prototyp; sie ist kein Akzeptanzkriterium.

## Anforderung (Satzschablone)

- Wenn der Nutzer die Zeile „Format“, „Exemplar“ oder „Sonderausgabe“ (REQ-056) antippt, muss das System das Fenster „Format“ von unten über abgedunkelten Buchdetails öffnen, mit dem aktuell gespeicherten Stand vorausgewählt.
- Das System muss im Fenster oben einen Ziehgriff, die zentrierte Überschrift „Format“ und rechts eine X-Schaltfläche darstellen.
- Das System muss drei Kacheln „Print“, „E-Book“, „Hörbuch“ mit selbst nachgebildeten Icons darstellen; genau eine ist gewählt (Häkchen, hervorgehoben), die anderen zeigen einen leeren Kreis.
- Wenn „Print“ gewählt ist, muss das System darunter eine Karte „Print“ mit den Unterformaten „Hardcover“, „Taschenbuch“, „Kleinformat“, „Weiß ich nicht“ (je mit nachgebildetem Icon) darstellen, von denen genau eines gewählt werden kann (hervorgehoben).
- Das System muss in der Karte den Bereich „Sonderausgabe“ mit der gewählten Sonderausgabe rechts neben der Bezeichnung und darunter wischbaren Pillen der Sonderausgaben darstellen, mindestens „Farbschnitt“, „Erstausgabe“, „Sammlerausgabe“; gewählte Pillen hervorgehoben.
- Das System muss unter der Überschrift „Wem gehört dieses Exemplar?“ die Auswahl „Meins“, „Ich will es“, „Geliehen“, „Verliehen“, „Verkauft“ darstellen, von denen genau eine gewählt ist (hervorgehoben).
- Das System muss unten die Schaltfläche „Sichern“ in Farbrubrik „Primär“ darstellen.
- Wenn der Nutzer „Sichern“ antippt, muss das System Format, Unterformat, Sonderausgabe und Exemplar dauerhaft speichern (ADR-0002), das Fenster schließen und die Zeilen in „Ausgabe“ aktualisieren (übertragen aus REQ-049).
- Wenn der Nutzer das Fenster ohne „Sichern“ schließt (X, Herunterziehen am Griff, Tippen außerhalb, Android-Zurück-Taste), darf das System nichts speichern (übertragen aus REQ-049).
- Das System muss Elemente und Farben wie im Referenzbild darstellen, mit Farben aus zentralen Farbrubriken.

## Akzeptanzkriterien

### AK-1 Öffnen aus drei Zeilen
- **Gegeben** der Reiter „Details“ ist aktiv
- **Wenn** der Nutzer „Format“, „Exemplar“ bzw. „Sonderausgabe“ antippt
- **Dann** öffnet sich jeweils das Fenster „Format“ mit Ziehgriff, Überschrift „Format“, X und „Sichern“

### AK-2 Vorauswahl
- **Gegeben** ein Buch mit gespeichertem „Print“, „Taschenbuch“, Sonderausgabe „Farbschnitt“, Exemplar „Meins“
- **Wenn** das Fenster „Format“ geöffnet wird
- **Dann** sind genau diese Werte hervorgehoben bzw. mit Häkchen versehen
- **Und** rechts neben „Sonderausgabe“ steht „Farbschnitt“

### AK-3 Genau ein Format
- **Gegeben** „Print“ ist gewählt
- **Wenn** der Nutzer „E-Book“ antippt
- **Dann** hat „E-Book“ das Häkchen und „Print“ nicht mehr

### AK-4 Unterformat und Exemplar je genau eines
- **Gegeben** „Print“ mit „Taschenbuch“ und Exemplar „Meins“ ist gewählt
- **Wenn** der Nutzer „Hardcover“ und „Geliehen“ antippt
- **Dann** sind „Hardcover“ und „Geliehen“ gewählt, „Taschenbuch“ und „Meins“ nicht mehr

### AK-5 Sichern
- **Gegeben** im Fenster wurden „Print“, „Hardcover“ und „Geliehen“ gewählt
- **Wenn** der Nutzer „Sichern“ antippt
- **Dann** schließt sich das Fenster
- **Und** die Zeilen zeigen „Print · Hardcover“ und „Geliehen“, auch nach einem Neustart

### AK-6 Schließen ohne Sichern
- **Gegeben** im Fenster wurde eine Auswahl geändert
- **Wenn** der Nutzer X, Herunterziehen, Tippen außerhalb bzw. die Zurück-Taste verwendet
- **Dann** bleiben die gespeicherten Werte unverändert

## Abgrenzung (nicht Teil dieses REQ)

- Anzeige der Werte in der Karte „Ausgabe“ (REQ-056).

## Qualitätsanforderungen

- Keine.

## Abhängigkeiten

- **REQ-049** (Regeln für Sichern/Schließen), **REQ-056.**

## Offene Fragen

- Was erscheint unter den Kacheln, wenn „E-Book“ oder „Hörbuch“ gewählt ist (eigene Unterauswahl, Sonderausgabe)? Kann mehr als eine Sonderausgabe gewählt werden, und lässt sich eine Wahl wieder aufheben? Wie lautet die vollständige Liste der Sonderausgaben (im Bild rechts abgeschnitten)? Was ist bei einem neuen Buch vorausgewählt? (Frage 1)

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-15 | Erstellt aus CEO-Vorgabe „Reiter Details“ und Referenzbild REF-details-03-format.png | Anforderungsmanager |
