---
id: REQ-031
titel: Manueller Eintrag – neues Buch mit „Hinzufügen“ anlegen
status: Entwurf
prioritaet: offen
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **mit „Hinzufügen“ aus meinen Eingaben im Blatt „Manueller Eintrag“ ein neues Buch anlegen**, damit **es in meiner Bibliothek gespeichert ist**.

Vorgabe des CEO (wörtlich, 2026-11-10): „Ich möchte über das '+' in der Übersichtsseite 'Deine Bücher' ein neues Buch anlegen.“

Referenzbild: [referenzen/REF-buch-anlegen-02-manueller-eintrag.png](referenzen/REF-buch-anlegen-02-manueller-eintrag.png) (Pille „Hinzufügen“ dort blass dargestellt).

## Anforderung (Satzschablone)

- Wenn der Nutzer im Blatt „Manueller Eintrag“ „Hinzufügen“ antippt und die Voraussetzungen erfüllt sind (offen, F1), muss das System ein neues Buch mit neuer eindeutiger ID (REQ-008) anlegen.
- Das System muss dabei die eingetragenen Angaben (Titel, Autor, Jahr, Seiten, Erscheinungsdatum) und ein gewähltes Cover (REQ-032) zu diesem Buch speichern.
- Das System darf leer gelassene optionale Felder nicht mit ihrem Platzhaltertext (z. B. „2024“, „496“) speichern.
- Das System muss das Buch ausschließlich über die Repository-Schnittstelle speichern (ADR-0002).
- Das System muss das neue Buch dauerhaft speichern, sodass es nach einem Neustart der App vorhanden ist.

## Akzeptanzkriterien

### AK-1 Buch wird angelegt
- **Gegeben** im Blatt „Manueller Eintrag“ ist der Titel „Testbuch“ und der Autor „Vorname Nachname“ eingetragen und alle Voraussetzungen für „Hinzufügen“ sind erfüllt
- **Wenn** der Nutzer „Hinzufügen“ antippt
- **Dann** gibt es ein neues Buch mit Titel „Testbuch“, Autor „Vorname Nachname“ und einer ID, die kein anderes Buch hat

### AK-2 Platzhaltertexte werden nicht gespeichert
- **Gegeben** die Felder „JAHR“ und „SEITEN“ sind leer
- **Wenn** der Nutzer das Buch mit „Hinzufügen“ anlegt
- **Dann** hat das Buch weder das Jahr 2024 noch 496 Seiten gespeichert

### AK-3 Dauerhaft gespeichert
- **Gegeben** der Nutzer hat ein Buch mit „Hinzufügen“ angelegt
- **Wenn** die App neu gestartet wird
- **Dann** ist das Buch mit allen eingetragenen Angaben vorhanden

## Abgrenzung (nicht Teil dieses REQ)

- Aufbau des Blatts (REQ-030), Cover (REQ-032), Datenfelder Jahr/Erscheinungsdatum (REQ-033).
- Bearbeiten und Löschen bestehender Bücher.

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-008:** Buchdaten, ID, Autor, Lesestatus. **REQ-025:** Seitenanzahl (F3). **REQ-019:** Bildspeicherung. **REQ-009:** Abschnitt „Noch zu lesen“ zeigt Bücher nach Lesestatus.
- **ADR-0002.**

## Offene Fragen

- F1: Welche Angaben sind Pflicht, wann ist „Hinzufügen“ antippbar, wie sieht „Hinzufügen“ aus, solange es nicht antippbar ist?
- F3: Wird „SEITEN“ als Seitenanzahl (REQ-025) gespeichert?
- F4: Was passiert nach „Hinzufügen“ (Blatt schließt? welche Ansicht erscheint?) und welchen Lesestatus erhält das neue Buch?
- F7: Priorität.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-10 | Erstellt (Entwurf aus der CEO-Vorgabe „Buch anlegen“) | Anforderungsmanager |
