---
id: REQ-055
titel: Reiter „Details“ – „Sammlungen und Bibliotheken“ ohne Funktion
status: Implementiert
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **den Abschnitt „Sammlungen und Bibliotheken“ schon sehen**, damit **der Reiter „Details“ vollständig wie im Referenzbild aussieht, bevor die Funktion kommt**.

Antwort des CEO (wörtlich, 2026-11-15): „keine Funktion aktuell, bitte auf die To-Do Liste“.

Referenzbild: [referenzen/REF-details-01-uebersicht.png](referenzen/REF-details-01-uebersicht.png). Die optische Übereinstimmung prüft der CEO im Prototyp; sie ist kein Akzeptanzkriterium.

## Anforderung (Satzschablone)

- Das System muss unter „Sammlungen und Bibliotheken“ die umrandete Pille „Zu einer Sammlung hinzufügen“ und darunter die Karte „In Bibliotheken“ mit Pfeil „›“ wie im Referenzbild darstellen (**Auslegung**: „keine Funktion“ = sichtbar, ohne Funktion).
- Das System darf in der Karte „In Bibliotheken“ keinen Bibliotheksnamen darstellen (**Auslegung**: der Name im Referenzbild ist ein fremdes Beispiel).
- Wenn der Nutzer die Pille oder die Karte antippt, darf das System nichts verändern.

## Akzeptanzkriterien

### AK-1 Elemente vorhanden
- **Gegeben** der Reiter „Details“ ist aktiv
- **Wenn** der Abschnitt „Sammlungen und Bibliotheken“ betrachtet wird
- **Dann** stehen dort „Zu einer Sammlung hinzufügen“ und die Karte „In Bibliotheken“ ohne Namen

### AK-2 Ohne Funktion
- **Gegeben** der Abschnitt wird angezeigt
- **Wenn** der Nutzer „Zu einer Sammlung hinzufügen“ bzw. „In Bibliotheken“ antippt
- **Dann** öffnet sich kein Menü und kein Fenster, und nichts ändert sich

## Abgrenzung (nicht Teil dieses REQ)

- Funktion von Sammlungen und Bibliotheken (To-do-Liste, Could). Abschnitt „Sammlungen“ der Seite „Bücher“ (REQ-012).

## Qualitätsanforderungen

- Keine.

## Abhängigkeiten

- **REQ-051, REQ-012.**

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-15 | Erstellt (Platzhalter für offenen Inhalt) | Anforderungsmanager |
| 2026-11-15 | CEO-Antwort 4: sichtbar ohne Funktion (Auslegung), kein Bibliotheksname; AKs ergänzt | Anforderungsmanager |
| 2026-11-15 | Status „Abgestimmt“ (CEO 2026-11-15, über den Scrum Master: „Der Rest ist in Ordnung.“) | Anforderungsmanager |
