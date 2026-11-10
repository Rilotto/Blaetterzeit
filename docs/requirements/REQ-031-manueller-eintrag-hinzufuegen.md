---
id: REQ-031
titel: Manueller Eintrag – neues Buch mit „Hinzufügen“ anlegen
status: Abgestimmt
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **mit „Hinzufügen“ aus meinen Eingaben im Blatt „Manueller Eintrag“ ein neues Buch anlegen**, damit **es in meiner Bibliothek gespeichert ist**.

Vorgabe des CEO (wörtlich, 2026-11-10): „Ich möchte über das '+' in der Übersichtsseite 'Deine Bücher' ein neues Buch anlegen.“

Referenzbild: [referenzen/REF-buch-anlegen-02-manueller-eintrag.png](referenzen/REF-buch-anlegen-02-manueller-eintrag.png). Die dort blasse Pille „Hinzufügen“ wird nicht übernommen (CEO: „'Hinzufügen' ist immer aktiv und daher immer antippbar.“; Darstellung: REQ-030).

Priorität: Must (vom CEO bestätigt, 2026-11-10).

## Anforderung (Satzschablone)

**Pflichtangabe**
- Der Titel ist die einzige Pflichtangabe (CEO: „Pflicht: der Titel.“). Autor, Jahr, Seiten und Cover sind optional.
- Wenn der Nutzer „Hinzufügen“ antippt und das Feld „TITEL“ leer ist, darf das System kein Buch anlegen und muss das Blatt geöffnet lassen, ohne Eingaben zu verändern.
- In diesem Fall muss das System unter dem Feld „TITEL“ den Hinweis „Bitte gib einen Titel ein“ in der Farbrubrik „Primär“ anzeigen (CEO-bestätigter Vorschlag).
- Sobald der Nutzer danach im Feld „TITEL“ etwas eingibt, muss das System den Hinweis ausblenden (vom CEO bestätigt, 2026-11-10).
- Ein Titel, der nur aus Leerzeichen besteht, gilt als leer (vom CEO bestätigt, 2026-11-10).

**Anlegen**
- Wenn der Nutzer „Hinzufügen“ antippt und ein Titel eingetragen ist, muss das System ein neues Buch mit neuer eindeutiger ID (REQ-008) anlegen.
- Das System muss dabei die eingetragenen Angaben zu diesem Buch speichern: Titel, Autor (REQ-008), Jahr als Erscheinungsjahr (REQ-033), Seiten als Seitenanzahl (REQ-025) und ein gewähltes Cover als Frontcover (REQ-032).
- Das System muss dem neuen Buch den Lesestatus *ungelesen* geben (CEO: „Ja, ein neues Buch bekommt den Standardstatus 'ungelesen'.“).
- Das System darf leer gelassene optionale Felder nicht mit ihrem Platzhaltertext (z. B. „2024“, „496“) speichern.
- Ist „SEITEN“ leer, hat das Buch keine Seitenanzahl; das Menü „Buchlänge“ (REQ-025) fragt sie dann wie bisher ab (CEO: „Da dies aber kein Pflichtfeld sein soll, muss die Abfrage 'Buchlänge' weiterhin aktiv bleiben.“).
- Das System muss das Buch ausschließlich über die Repository-Schnittstelle speichern (ADR-0002).
- Das System muss das neue Buch dauerhaft speichern, sodass es nach einem Neustart der App vorhanden ist.

**Danach**
- Nach dem Anlegen muss das System das Blatt „Manueller Eintrag“ schließen und die Buchdetails (REQ-013) des neuen Buches anzeigen (CEO: „ich sehe die Buchdetails“).

## Akzeptanzkriterien

### AK-1 Buch wird angelegt
- **Gegeben** im Blatt „Manueller Eintrag“ ist der Titel „Testbuch“ und der Autor „Vorname Nachname“ eingetragen
- **Wenn** der Nutzer „Hinzufügen“ antippt
- **Dann** gibt es ein neues Buch mit Titel „Testbuch“, Autor „Vorname Nachname“ und einer ID, die kein anderes Buch hat

### AK-2 Platzhaltertexte werden nicht gespeichert
- **Gegeben** ein Titel ist eingetragen, die Felder „JAHR“ und „SEITEN“ sind leer
- **Wenn** der Nutzer das Buch mit „Hinzufügen“ anlegt
- **Dann** hat das Buch weder ein Erscheinungsjahr 2024 noch 496 Seiten gespeichert
- **Und** es hat kein Erscheinungsjahr und keine Seitenanzahl

### AK-3 Dauerhaft gespeichert
- **Gegeben** der Nutzer hat ein Buch mit „Hinzufügen“ angelegt
- **Wenn** die App neu gestartet wird
- **Dann** ist das Buch mit allen eingetragenen Angaben vorhanden

### AK-4 Ohne Titel wird nichts gespeichert
- **Gegeben** das Feld „TITEL“ ist leer, Autor ist eingetragen
- **Wenn** der Nutzer „Hinzufügen“ antippt
- **Dann** wird kein Buch angelegt
- **Und** das Blatt bleibt geöffnet, der Autor bleibt eingetragen
- **Und** unter dem Feld „TITEL“ steht „Bitte gib einen Titel ein“ in der Farbrubrik „Primär“

### AK-10 Hinweis verschwindet bei Eingabe
- **Gegeben** unter dem Feld „TITEL“ steht „Bitte gib einen Titel ein“
- **Wenn** der Nutzer im Feld „TITEL“ etwas eingibt
- **Dann** wird der Hinweis nicht mehr angezeigt

### AK-11 Titel nur aus Leerzeichen gilt als leer
- **Gegeben** im Feld „TITEL“ stehen nur Leerzeichen
- **Wenn** der Nutzer „Hinzufügen“ antippt
- **Dann** wird kein Buch angelegt, das Blatt bleibt geöffnet
- **Und** unter dem Feld „TITEL“ steht „Bitte gib einen Titel ein“

### AK-5 Nur Titel genügt
- **Gegeben** nur das Feld „TITEL“ ist ausgefüllt
- **Wenn** der Nutzer „Hinzufügen“ antippt
- **Dann** wird ein neues Buch mit diesem Titel angelegt

### AK-6 Standardstatus „ungelesen“
- **Gegeben** der Nutzer hat ein Buch mit „Hinzufügen“ angelegt
- **Wenn** der Lesestatus des Buches geprüft wird
- **Dann** ist er *ungelesen*
- **Und** das Buch erscheint im Abschnitt „Noch zu lesen“ der Seite „Bücher“ (REQ-009)

### AK-7 Buchdetails des neuen Buches
- **Gegeben** im Blatt ist ein Titel eingetragen
- **Wenn** der Nutzer „Hinzufügen“ antippt
- **Dann** ist das Blatt geschlossen
- **Und** die Buchdetails des neuen Buches werden angezeigt (Titel des neuen Buches unter der Buchdarstellung)

### AK-8 Seiten als Seitenanzahl
- **Gegeben** Titel ist eingetragen, im Feld „SEITEN“ steht 350
- **Wenn** der Nutzer „Hinzufügen“ antippt und in den Buchdetails den Lesefortschritt öffnet
- **Dann** hat das Buch die Seitenanzahl 350
- **Und** das Menü „Buchlänge“ erscheint nicht

### AK-9 Ohne Seiten wird „Buchlänge“ abgefragt
- **Gegeben** ein Buch wurde ohne Eintrag im Feld „SEITEN“ angelegt
- **Wenn** der Nutzer in dessen Buchdetails den Lesefortschritt öffnet
- **Dann** erscheint das Menü „Buchlänge“ (REQ-025)

## Abgrenzung (nicht Teil dieses REQ)

- Aufbau und Farben des Blatts (REQ-030), Cover (REQ-032), Datenfelder Jahr/Erscheinungsdatum (REQ-033).
- Bearbeiten und Löschen bestehender Bücher.

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-008:** Buchdaten, ID, Autor, Lesestatus. **REQ-025:** Seitenanzahl und Menü „Buchlänge“ (bleibt unverändert aktiv). **REQ-019:** Bildspeicherung. **REQ-009:** Abschnitt „Noch zu lesen“ zeigt Bücher nach Lesestatus. **REQ-013:** Buchdetails. **REQ-021:** Standardstatus *ungelesen*.
- **ADR-0002.**

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-10 | Erstellt (Entwurf aus der CEO-Vorgabe „Buch anlegen“) | Anforderungsmanager |
| 2026-11-10 | CEO-Antworten eingearbeitet. F1: Titel einzige Pflichtangabe, „Hinzufügen“ immer antippbar, ohne Titel Hinweis in Primär (AK-4, AK-5). F3: SEITEN = Seitenanzahl, optional, „Buchlänge“ bleibt aktiv; Standardstatus *ungelesen* (AK-6, AK-8, AK-9). F4: danach Buchdetails des neuen Buches (AK-7). Priorität Must (Bestätigung ausstehend). Status „Abgestimmt“ auf Weisung des Scrum Masters nach den übermittelten CEO-Antworten | Anforderungsmanager |
| 2026-11-10 | Vom CEO mit „Ja“ bestätigt: Hinweis verschwindet bei Eingabe im Titel (neu AK-10), Titel nur aus Leerzeichen gilt als leer (neu AK-11). Priorität Must vom CEO bestätigt („ja“). Status bleibt „Abgestimmt“ | Anforderungsmanager |
