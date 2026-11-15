---
id: REQ-046
titel: Bewertungskriterien – eigenes Icon und eigene Farbrubrik je Kriterium (voll und blass)
status: In Umsetzung
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **jedes Bewertungskriterium an eigenem Symbol und eigener Farbe erkennen**, damit **die Bewertung übersichtlich ist**.

CEO (wörtlich, 2026-11-13): „Jede Kategorie hat ihr eigenes Symbol. Dies ist weniger farbintensiv, bis sie angewählt werden.“ Zur blassen Farbe: „Dein Vorschlag zur automatischen Berechnung der blassen Farben ist in Ordnung.“ Icons und volle Farben mit dem CEO festgelegt (2026-11-13, über den Scrum Master). Herkunft der Grafiken, CEO (wörtlich, 2026-11-15): „Setze deine Vorschläge bitte um. Die haben wir bereits abgestimmt.“ Inhalt laut Scrum Master: Material Symbols; ein eigenes Icon nur, wo es dort keines gibt (z. B. Chili); Romantik = Material-Herz, nicht das vorhandene Herz-Icon (REQ-010).

## Anforderung (Satzschablone)

- Das System muss für die Kriterien-Icons und das Filtersymbol (REQ-044) Icons aus Material Symbols verwenden; nur wo Material Symbols kein passendes Icon bietet, wird ein eigenes Icon im selben Stil nachgebildet.
- Das System muss für „Romantik“ das Herz aus Material Symbols verwenden, nicht das Herz-Icon des CEO (REQ-010).

- Das System muss je Bewertungskriterium das folgende Icon verwenden:

| Kriterium | Icon | Farbrubrik (Standardwert, kein AK) |
|---|---|---|
| Sterne | Stern | Sterne (#D9A21B) |
| Tempo | Funkeln (wie Referenzbild) | Tempo (#5B6FB0) |
| Weltenbau | Globus | Weltenbau (#4E7D63) |
| Spice | Chilischote | Spice (#B83A2E) |
| Spannung | EKG-Linie ohne Herz | Spannung (#6D4C8D) |
| Action | Blitz | Action (#D9822B) |
| Hauptfiguren | Person mit Krone | Hauptfiguren (#A0622D) |
| Nebenfiguren | Personengruppe | Nebenfiguren (#6B5849) |
| Plot Twist | drei waagerechte Balken, nach unten spitz zulaufend (wie Referenzbild) | Plot Twist (#8E3B67) |
| Tränen | Tropfen | Tränen (#3F7CB8) |
| Romantik | ein Herz | Romantik (#C2577A) |
| Humor | lachendes Gesicht | Humor (#8EA33B) |
| Grusel | Geist | Grusel (#45505A) |
| Dialoge | zwei Sprechblasen | Dialoge (#2F8F8A) |

- Das System muss je Bewertungskriterium eine eigene, zentral definierte Farbrubrik mit dem Namen des Kriteriums führen (volle Farbe), änderbar „auf Zuruf“.
- Das System muss die blasse Farbe jedes Kriteriums automatisch aus dessen voller Farbe durch Mischung mit der Farbrubrik „Hintergrund“ berechnen.
- Wenn die volle Farbe eines Kriteriums geändert wird, muss das System dessen blasse Farbe entsprechend neu berechnen.

## Akzeptanzkriterien

### AK-1 Eigenes Icon je Kriterium
- **Gegeben** der Bereich „Bewertung“ wird angezeigt
- **Wenn** die Symbole der 14 Kriterien verglichen werden
- **Dann** verwendet jedes Kriterium das ihm in der Tabelle zugeordnete Icon
- **Und** keine zwei Kriterien verwenden dasselbe Icon

### AK-2 Eigene Farbrubrik je Kriterium
- **Gegeben** die zentrale Farbdefinition
- **Wenn** sie geprüft wird
- **Dann** enthält sie für jedes der 14 Kriterien eine eigene Farbrubrik

### AK-3 Volle Farbe aus der Farbrubrik
- **Gegeben** die Farbrubrik eines Kriteriums wird an der zentralen Stelle geändert
- **Wenn** ein angewähltes Symbol dieses Kriteriums angezeigt wird
- **Dann** ist es im geänderten Wert dargestellt

### AK-4 Blasse Farbe automatisch abgeleitet
- **Gegeben** die Farbrubrik eines Kriteriums wird an der zentralen Stelle geändert
- **Wenn** ein nicht angewähltes Symbol dieses Kriteriums angezeigt wird
- **Dann** ist es in einer Mischung aus dem geänderten Wert und der Farbrubrik „Hintergrund“ dargestellt
- **Und** diese blasse Farbe unterscheidet sich von der vollen Farbe

## Abgrenzung (nicht Teil dieses REQ)

- Konkrete Farbwerte und Mischungsverhältnis sind kein Akzeptanzkriterium („Farben auf Zuruf“).
- Wann ein Symbol angewählt ist (REQ-045).

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-044, REQ-045.** **REQ-002:** Farbrubrik „Hintergrund“. **REQ-010:** vorhandenes Herz-Icon wird für Romantik nicht verwendet.

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-13 | Erstellt (Entwurf aus CEO-Vorgaben zu Icons und Farben) | Anforderungsmanager |
| 2026-11-15 | CEO-Antworten 7, 8: Material Symbols, eigenes Icon nur ersatzweise, Romantik = Material-Herz; Must | Anforderungsmanager |
| 2026-11-15 | Status „Abgestimmt“ (CEO 2026-11-15, über den Scrum Master: „Der Rest ist in Ordnung.“) | Anforderungsmanager |
