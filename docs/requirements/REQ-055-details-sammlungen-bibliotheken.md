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

- **Abgelöst durch REQ-095 bis REQ-097 (Abgestimmt 2026-11-23).** Der bisherige Inhalt (umrandete Pille „Zu einer Sammlung hinzufügen“ und Karte „In Bibliotheken“ ohne Namen und ohne Funktion) entfällt. Abschnittsname, Pillen und Zeilen regelt REQ-095.

## Akzeptanzkriterien

### AK-1 Abschnitt umbenannt (abgelöst durch REQ-095)
- **Gegeben** der Reiter „Details“ ist aktiv
- **Wenn** der Abschnitt betrachtet wird
- **Dann** heißt er „Sagas, Sammlungen und Bibliotheken“, und es gibt keinen Abschnitt „Sammlungen und Bibliotheken“ mehr (Inhalt: REQ-095)

### AK-2 Keine Elemente ohne Funktion (abgelöst durch REQ-095)
- **Gegeben** ein Buch in keiner Liste, der Abschnitt wird angezeigt
- **Wenn** der Nutzer die Pille „+ Zu einer Sammlung hinzufügen“ antippt
- **Dann** öffnet sich das Blatt zum Hinzufügen (REQ-096), und es gibt keine Karte „In Bibliotheken“ ohne Funktion

## Abgrenzung (nicht Teil dieses REQ)

- Funktion von Sammlungen und Bibliotheken (To-do-Liste, Could). Abschnitt „Sammlungen“ der Seite „Bücher“ (REQ-012).

## Qualitätsanforderungen

- Keine.

## Abhängigkeiten

- **REQ-051, REQ-012.**
- **REQ-095 (Entwurf):** löst diesen REQ mit Umsetzung vollständig ab (Abschnitt „Sagas, Sammlungen und Bibliotheken“ mit drei gestrichelten Pillen bzw. Zeilen „In Saga/Sammlung/Bibliotheken“ mit Funktion, REQ-096, REQ-097).

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-15 | Erstellt (Platzhalter für offenen Inhalt) | Anforderungsmanager |
| 2026-11-15 | CEO-Antwort 4: sichtbar ohne Funktion (Auslegung), kein Bibliotheksname; AKs ergänzt | Anforderungsmanager |
| 2026-11-15 | Status „Abgestimmt“ (CEO 2026-11-15, über den Scrum Master: „Der Rest ist in Ordnung.“) | Anforderungsmanager |
| 2026-11-23 | Durch REQ-095 bis REQ-097 abgelöst (Abgestimmt, CEO: „okay, freigegeben. Starte mit dem nächsten Prototypen“). Anforderung, AK-1 und AK-2 auf das neue Verhalten umgestellt. Status unverändert | Anforderungsmanager |
