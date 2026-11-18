---
id: REQ-061
titel: Menü „Buch hinzufügen“ – Option „Barcode scannen“ und Scan-Bildschirm
status: Implementiert
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **im Menü „Buch hinzufügen“ die Option „Barcode scannen“ wählen und den ISBN-Barcode eines Buches scannen**, damit **ich ein Buch anlegen kann, ohne die Angaben abzutippen**.

Vorgabe des CEO (wörtlich, 2026-11-16): „Den Menüpunkt "Barcode scannen" kannst du auch bitte gleich mit umsetzen. Hier möchte ich den ISBN Code scannen können und du suchst alle Details aus dem Internet samt Coverfoto und füllst entsprechend die Felder aus. Wenn keine Info vorhanden ist, ist dies leer und man kann das Feld manuell bearbeiten.“

CEO-Antworten (wörtlich, 2026-11-16):
- Abbruch, verweigerter Kamerazugriff: „Dann erscheine ich wieder auf der Übersichtsseite "Bücher"“
- Scan-Bildschirm: „siehe angehängter Screenshot der Scan-Funktion (Kamera ist aktiviert)“

Bestätigung des CEO (2026-11-16): „passt alles für mich. bitte für den nächsten Sprint planen.“

Referenzbilder:
- Option im Menü: [referenzen/REF-buch-anlegen-01-menue.png](referenzen/REF-buch-anlegen-01-menue.png) (enthält „Barcode scannen“)
- Scan-Bildschirm: [referenzen/REF-barcode-01-scan.png](referenzen/REF-barcode-01-scan.png)

Die optische Übereinstimmung prüft der CEO im Prototyp; sie ist kein Akzeptanzkriterium.

## Anforderung (Satzschablone)

**Option im Menü**
- Das System muss im Menü „Buch hinzufügen“ (REQ-029) zusätzlich die Option „Barcode scannen“ anzeigen, mit Titel, Untertitel und nachgebildetem Icon wie im Referenzbild des Menüs, im Stil der Option „Von Hand eintragen“ (REQ-029).
- Wenn der Nutzer „Barcode scannen“ antippt, muss das System das Menü schließen und den Scan-Bildschirm anzeigen.

**Scan-Bildschirm (Referenzbild REF-barcode-01-scan)**
- Das System muss das laufende Kamerabild anzeigen, darin einen Rahmen für den Barcode, den Text „Richte den Barcode im Rahmen aus“ und den Text „Wir schlagen es automatisch nach, sobald es erkannt wurde.“
- Das System muss oben links eine X-Schaltfläche und oben rechts eine Taschenlampen-Schaltfläche anzeigen.
- Wenn der Nutzer die Taschenlampen-Schaltfläche antippt, muss das System das Licht der Kamera ein- bzw. ausschalten.
- Wenn ein ISBN-Barcode erkannt wurde, muss das System ohne weitere Aktion des Nutzers die Suche starten (REQ-062).

**Abbruch**
- Wenn der Nutzer die X-Schaltfläche antippt oder die Android-Zurück-Taste betätigt, muss das System den Scan-Bildschirm schließen und die Seite „Bücher“ anzeigen, ohne ein Buch anzulegen.
- Wenn der Kamerazugriff verweigert wird oder keine Kamera verfügbar ist, muss das System die Seite „Bücher“ anzeigen, ohne ein Buch anzulegen.

**Icons und Farben**
- Icons nachgebildet im Stil der übrigen Icons (REQ-005), ohne Icon-Bibliothek. Farben über Farbrollen aus zentralen Farbrubriken (REQ-002); konkrete Farbwerte sind kein Akzeptanzkriterium.

## Akzeptanzkriterien

### AK-1 Option im Menü
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** der Nutzer die Plus-Schaltfläche antippt
- **Dann** enthält das Menü „Buch hinzufügen“ die Optionen „Von Hand eintragen“ und „Barcode scannen“

### AK-2 Option öffnet den Scan-Bildschirm
- **Gegeben** das Menü „Buch hinzufügen“ ist geöffnet
- **Wenn** der Nutzer „Barcode scannen“ antippt
- **Dann** ist das Menü geschlossen und der Scan-Bildschirm wird angezeigt

### AK-3 Aufbau des Scan-Bildschirms
- **Gegeben** der Scan-Bildschirm ist geöffnet und der Kamerazugriff erlaubt
- **Wenn** der Nutzer ihn betrachtet
- **Dann** sieht er Kamerabild, Rahmen, X-Schaltfläche oben links, Taschenlampen-Schaltfläche oben rechts, „Richte den Barcode im Rahmen aus“ und „Wir schlagen es automatisch nach, sobald es erkannt wurde.“

### AK-4 Taschenlampe
- **Gegeben** der Scan-Bildschirm ist geöffnet, das Licht ist aus
- **Wenn** der Nutzer die Taschenlampen-Schaltfläche antippt
- **Dann** ist das Licht an
- **Und** nach erneutem Antippen ist es wieder aus

### AK-5 Erkannte ISBN startet die Suche automatisch
- **Gegeben** der Scan-Bildschirm ist geöffnet
- **Wenn** die Kamera einen ISBN-Barcode erfasst
- **Dann** startet die Suche zu genau dieser ISBN ohne weitere Aktion des Nutzers

### AK-6 X und Zurück-Taste brechen ab
- **Gegeben** der Scan-Bildschirm ist geöffnet
- **Wenn** der Nutzer die X-Schaltfläche antippt oder die Android-Zurück-Taste betätigt
- **Dann** wird die Seite „Bücher“ angezeigt und es wurde kein Buch angelegt

### AK-7 Kamerazugriff verweigert
- **Gegeben** der Nutzer verweigert den Kamerazugriff
- **Wenn** er „Barcode scannen“ antippt
- **Dann** wird die Seite „Bücher“ angezeigt und es wurde kein Buch angelegt

## Abgrenzung (nicht Teil dieses REQ)

- Suche, Auswahl und Übernahme der Angaben (REQ-062).
- Optionen „Online suchen“, „Deine Bücher importieren“ (To-do-Liste).

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-029:** AK-2 (genau eine Option) wird mit Umsetzung dieses REQ hinfällig.
- **REQ-016:** bestehende Kameranutzung. Abweichend vom dortigen Hinweis „Kamera nicht verfügbar“ führt hier ein verweigerter Zugriff laut CEO zur Seite „Bücher“.
- **REQ-062.**

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-16 | Erstellt (Entwurf aus der CEO-Antwort zum Änderungsantrag „Buch anlegen“) | Anforderungsmanager |
| 2026-11-16 | CEO-Antworten eingearbeitet: Scan-Bildschirm nach Referenzbild REF-barcode-01-scan (AK-3, AK-4), Abbruch und verweigerter Kamerazugriff führen zur Seite „Bücher“ (AK-6, AK-7). Status „Abgestimmt“ (CEO: „passt alles für mich. bitte für den nächsten Sprint planen.“) | Anforderungsmanager |
