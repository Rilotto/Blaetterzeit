---
id: REQ-052
titel: Reiter „Details“ – Genres und Tropes als Pillen
status: Implementiert
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **die Genres und Tropes eines Buches als Pillen sehen**, damit **ich auf einen Blick erkenne, was festgelegt ist und was noch fehlt**.

Vorgabe des CEO (wörtlich, 2026-11-15): „Dann haben wir bei Genres und Tropes die gestrichelten Pillen. In "Genres" ist bereits eine Auswahl getroffen. Festgelegte Genres oder Tropes werden entsprechend dargestellt (gefüllte Pille). Ist nichts ausgewählt, ist die gestrichelte Pille wie bei Tropes mit dem Text. Hier soll man später reinklicken können und ein neues Fenster öffnet sich mit möglichen Auswahlfeldern. Diese Funktion soll später kommen, bitte auf die To-Do Liste schreiben -> Prio: Could).“

Referenzbild: [referenzen/REF-details-01-uebersicht.png](referenzen/REF-details-01-uebersicht.png) (gefüllte Pille „Fantasy“, gestrichelte Pille „+ Tropes hinzufügen“). Die optische Übereinstimmung prüft der CEO im Prototyp; sie ist kein Akzeptanzkriterium.

## Anforderung (Satzschablone)

- Das System muss je Buch eine Liste festgelegter Genres und eine Liste festgelegter Tropes führen (anfangs leer) und dauerhaft speichern (Repository-Schnittstelle, ADR-0002).
- Das System muss unter „Genres“ jedes festgelegte Genre als gefüllte Pille mit seinem Namen darstellen.
- Wenn für ein Buch kein Genre festgelegt ist, muss das System unter „Genres“ eine gestrichelte Pille mit dem Text „+ Genres hinzufügen“ darstellen.
- Das System muss unter „Tropes“ jeden festgelegten Trope als gefüllte Pille darstellen; ist keiner festgelegt, eine gestrichelte Pille mit dem Text „+ Tropes hinzufügen“.
- Wenn der Nutzer eine gestrichelte Pille antippt, darf das System nichts verändern (Auswahlfenster: REQ-054, Could).
- Das System muss die Pillen farblich wie im Referenzbild darstellen, mit Farben aus zentralen Farbrubriken.

## Akzeptanzkriterien

### AK-1 Ohne Auswahl gestrichelte Pillen
- **Gegeben** ein Buch ohne festgelegte Genres und Tropes
- **Wenn** der Reiter „Details“ angezeigt wird
- **Dann** steht unter „Genres“ die gestrichelte Pille „+ Genres hinzufügen“
- **Und** unter „Tropes“ die gestrichelte Pille „+ Tropes hinzufügen“

### AK-2 Festgelegte Genres als gefüllte Pillen
- **Gegeben** ein Buch mit den festgelegten Genres „Fantasy“ und „Romance“ (Testdaten)
- **Wenn** der Reiter „Details“ angezeigt wird
- **Dann** stehen unter „Genres“ die gefüllten Pillen „Fantasy“ und „Romance“
- **Und** keine gestrichelte Pille unter „Genres“

### AK-3 Festgelegte Tropes als gefüllte Pillen
- **Gegeben** ein Buch mit einem festgelegten Trope (Testdaten)
- **Wenn** der Reiter „Details“ angezeigt wird
- **Dann** steht unter „Tropes“ dessen gefüllte Pille und keine gestrichelte Pille

### AK-4 Gestrichelte Pillen ohne Funktion
- **Gegeben** die gestrichelten Pillen werden angezeigt
- **Wenn** der Nutzer eine davon antippt
- **Dann** öffnet sich kein Fenster und nichts ändert sich

## Abgrenzung (nicht Teil dieses REQ)

- Auswählen von Genres und Tropes (REQ-054, Could, To-do-Liste). Bis dahin hat kein Buch in der App festgelegte Genres oder Tropes; gefüllte Pillen entstehen nur über Testdaten.

## Qualitätsanforderungen

- Keine.

## Abhängigkeiten

- **REQ-051, REQ-054.** **REQ-008:** Buchdaten.

## Offene Fragen

- Keine. („Bearbeiten“: REQ-051.)

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-15 | Erstellt aus CEO-Vorgabe „Reiter Details“ | Anforderungsmanager |
| 2026-11-15 | Status „Abgestimmt“ (CEO 2026-11-15, über den Scrum Master: „Der Rest ist in Ordnung.“) | Anforderungsmanager |
