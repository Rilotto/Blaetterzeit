---
id: REQ-053
titel: Reiter „Details“ – Inhaltswarnungen als Pillen
status: Entwurf
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **die Inhaltswarnungen eines Buches als Pillen sehen**, damit **ich erkenne, ob und welche Warnungen markiert sind**.

Vorgabe des CEO (wörtlich, 2026-11-15): „Das selbe gilt auch für die Inhaltswarnungen. Setze hier bitte nur die "Warnungen markieren" um, nicht die große weiße Pille. Ist in meinen Augen doppelt umgesetzt und brauche ich nicht.“

Referenzbild: [referenzen/REF-details-01-uebersicht.png](referenzen/REF-details-01-uebersicht.png). Die optische Übereinstimmung prüft der CEO im Prototyp; sie ist kein Akzeptanzkriterium.

## Anforderung (Satzschablone)

- Das System muss je Buch eine Liste markierter Inhaltswarnungen führen (anfangs leer) und dauerhaft speichern (ADR-0002).
- Das System muss unter „Inhaltswarnungen“ jede markierte Warnung als gefüllte Pille darstellen, wie Genres (REQ-052).
- Wenn für ein Buch keine Inhaltswarnung markiert ist, muss das System unter „Inhaltswarnungen“ eine gestrichelte Pille „+ Warnungen markieren“ darstellen.
- Das System darf die große weiße Karte des Referenzbilds und den Text „Deine“ nicht darstellen.
- Wenn der Nutzer die gestrichelte Pille antippt, darf das System nichts verändern (REQ-054, Could).

## Akzeptanzkriterien

### AK-1 Ohne Markierung gestrichelte Pille
- **Gegeben** ein Buch ohne markierte Inhaltswarnungen
- **Wenn** der Reiter „Details“ angezeigt wird
- **Dann** steht unter „Inhaltswarnungen“ die gestrichelte Pille „+ Warnungen markieren“
- **Und** es gibt keine weiße Karte und kein „Deine“

### AK-2 Markierte Warnungen als gefüllte Pillen
- **Gegeben** ein Buch mit zwei markierten Inhaltswarnungen (Testdaten)
- **Wenn** der Reiter „Details“ angezeigt wird
- **Dann** stehen unter „Inhaltswarnungen“ zwei gefüllte Pillen und keine gestrichelte

### AK-3 Gestrichelte Pille ohne Funktion
- **Gegeben** die Pille „+ Warnungen markieren“ wird angezeigt
- **Wenn** der Nutzer sie antippt
- **Dann** öffnet sich kein Fenster und nichts ändert sich

## Abgrenzung (nicht Teil dieses REQ)

- Markieren von Warnungen (REQ-054, Could, To-do-Liste).

## Qualitätsanforderungen

- Keine.

## Abhängigkeiten

- **REQ-051, REQ-052, REQ-054.**

## Offene Fragen

- „Bearbeiten“: siehe Frage 5.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-15 | Erstellt aus CEO-Vorgabe „Reiter Details“ | Anforderungsmanager |
