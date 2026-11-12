---
id: REQ-037
titel: Übersicht „Alle Bücher“ – Darstellung als Raster oder Liste
status: Entwurf
prioritaet: offen
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **meine Bücher in der Übersicht wahlweise mit Cover oder als Liste sehen**, damit **ich die für mich passende Darstellung nutze**.

Vorgabe des CEO (wörtlich, 2026-11-12): „Diese Bücher können entweder mit dem Frontcover, Titel und Autor angezeigt werden (siehe Screenshot), oder auch als Liste (siehe anderer Screenshot).“

Referenzbilder: [referenzen/REF-alle-buecher-02-raster.png](referenzen/REF-alle-buecher-02-raster.png) (Raster), [referenzen/REF-alle-buecher-01-liste.png](referenzen/REF-alle-buecher-01-liste.png) (Liste).

## Anforderung (Satzschablone)

- Das System muss dem Nutzer die Möglichkeit bieten, in der Übersicht „Alle Bücher“ zwischen der Rasteransicht und der Listenansicht zu wechseln.
- Das System muss in der Rasteransicht jedes Buch mit Frontcover, Buchtitel und Autor darstellen.
- Wenn ein Buch kein Frontcover hat, muss das System an dessen Stelle den Cover-Platzhalter (REQ-010) darstellen.
- Das System muss in der Listenansicht jedes Buch als Listeneintrag darstellen; Inhalt siehe Offene Fragen.

## Akzeptanzkriterien

### AK-1 Rasteransicht
- **Gegeben** die Übersicht zeigt die Rasteransicht und ein Buch mit Frontcover, Titel und Autor
- **Wenn** dessen Eintrag betrachtet wird
- **Dann** zeigt er Frontcover, Buchtitel und Autor

### AK-2 Buch ohne Frontcover
- **Gegeben** ein Buch ohne Frontcover
- **Wenn** es in der Rasteransicht angezeigt wird
- **Dann** steht an Stelle des Covers der Cover-Platzhalter (REQ-010)

### AK-3 Wechsel zwischen den Ansichten
- **Gegeben** die Übersicht ist geöffnet
- **Wenn** der Nutzer die jeweils andere Ansicht wählt
- **Dann** werden dieselben Bücher in der gewählten Ansicht dargestellt

## Abgrenzung (nicht Teil dieses REQ)

- Suche (REQ-038).

## Qualitätsanforderungen

- Keine genannt.

## Abhängigkeiten

- REQ-010, REQ-020 (Frontcover in Buchlisten), REQ-023 (Fortschritt), REQ-028 (Autor), REQ-036.

## Offene Fragen

- F3: Welche Ansichten (Raster, Liste, dritte Ansicht aus dem Screenshot)? Standardansicht? Wird die Wahl gemerkt?
- F5: Inhalt des Listeneintrags (Fortschritt „x / y · z %“, Status-Anzeige); Schreibweise des Autors; Buch ohne Autor.
- F8: Farben.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-12 | Erstellt (Entwurf aus CEO-Vorgabe) | Anforderungsmanager |
