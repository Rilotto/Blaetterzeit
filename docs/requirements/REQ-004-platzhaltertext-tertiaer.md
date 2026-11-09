---
id: REQ-004
titel: Platzhaltertext im Inhaltsbereich in Farbrubrik Tertiär
status: Abgestimmt
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

<!-- Priorität "Must": vorläufig, Bestätigung durch den CEO ausstehend (MoSCoW ist CEO-Entscheidung). -->

## Ziel / Nutzen

Als **Nutzer** möchte ich **den Platzhaltertext „under construction :)“ im Inhaltsbereich lesen können**, damit **ich erkenne, dass die Ansicht noch nicht fertig ist**.

Anlass (Befund im Prototyp): Der Platzhaltertext ist unsichtbar, weil seine Textfarbe der Hintergrundfarbe entspricht.

Vorgabe des CEO: Der Text bekommt „die Schriftfarbe der Navigationsleiste“. Auf Rückfrage, welche der Schriftfarben der Navigationsleiste gemeint ist: „tertiäre Farbe“ (Farbrubrik Tertiär).

## Anforderung (Satzschablone)

- Das System muss den Platzhaltertext „under construction :)“ im Inhaltsbereich in der Farbrolle „Platzhalter-Textfarbe“ darstellen.
- Das System muss die Farbrolle „Platzhalter-Textfarbe“ aus der zentral definierten Farbrubrik „Tertiär“ beziehen (dieselbe Farbrubrik, aus der die Inaktivfarbe der Hauptnavigation stammt, REQ-002).

**Verhältnis zu REQ-002**
- REQ-002 bleibt unverändert. REQ-002 legt Text, Position und Hintergrund des Platzhalters fest, aber keine Textfarbe. Dieser REQ ergänzt nur die Textfarbe.
- Konkrete Farbwerte sind kein Akzeptanzkriterium (CLAUDE.md, „Farben auf Zuruf“). Ändert der CEO den Wert der Farbrubrik „Tertiär“, ändert sich die Farbe des Platzhaltertexts mit.

## Akzeptanzkriterien

### AK-1 Platzhaltertext in der Farbrubrik Tertiär
- **Gegeben** ein Menüpunkt ist aktiv, dessen Zielansicht den Platzhaltertext „under construction :)“ zeigt
- **Wenn** der Nutzer den Inhaltsbereich betrachtet
- **Dann** ist der Platzhaltertext in der Farbe der zentral definierten Farbrubrik „Tertiär“ dargestellt
- **Und** die Farbe ist nicht als eigener, davon abweichender Farbwert festgelegt

### AK-2 Platzhaltertext hebt sich vom Hintergrund ab
- **Gegeben** die aktuellen Standardwerte der Farbrubriken
- **Wenn** der Platzhaltertext angezeigt wird
- **Dann** unterscheidet sich seine Textfarbe von der Hintergrundfarbe des Inhaltsbereichs (Farbrubrik „Hintergrund“)

### AK-3 Farbänderung der Rubrik wirkt auf den Platzhaltertext
- **Gegeben** der Wert der Farbrubrik „Tertiär“ wird an der zentralen Stelle geändert
- **Wenn** der Platzhaltertext angezeigt wird
- **Dann** ist er im geänderten Wert der Farbrubrik „Tertiär“ dargestellt

## Abgrenzung (nicht Teil dieses REQ)

- Farben anderer Texte der App (z. B. Texte der Seite „Bücher“, siehe REQ-005 und REQ-006).
- Änderungen an Text, Position oder Hintergrund des Platzhalters (REQ-002).
- Konkrete Farbwerte als Akzeptanzkriterium.

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Vorgaben (z. B. Kontrastverhältnis) genannt.

## Abhängigkeiten

- **REQ-002 (Hauptnavigation, Implementiert):** Platzhaltertext und Farbrubriken. Bleibt unverändert.
- **Prozess „Farben auf Zuruf“ (CLAUDE.md).**

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-09 | Erstellt aus CEO-Anweisung („die Schriftfarbe der Navigationsleiste“, auf Rückfrage: „tertiäre Farbe“). Status „Abgestimmt“, da der CEO die Umsetzung konkret angewiesen hat. Priorität vorläufig „Must“, Bestätigung durch den CEO ausstehend | Anforderungsmanager |
