---
id: REQ-048
titel: Reiter „Rezension“ – Stufentext unter dem Kriteriennamen
status: Entwurf
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **unter jedem Kriterium einen Text zur gewählten Stufe sehen**, damit **die Zahl der Symbole eine verständliche Bedeutung bekommt**.

Antwort des CEO (wörtlich, 2026-11-15): „ja, es soll optisch wie im Screenshot bitte umgesetzt werden. Die Stufen für die Rubrik Sterne: 1 - Nichts für mich, 2 - War okay, 3 - Hat mir gefallen, 4 - Absolut spitze, 5 - Ich habe es geliebt. Mache mir für die anderen Rubriken im selben Muster bitte Vorschläge.“ Die Texte der übrigen Kriterien hat der CEO am 2026-11-15 mit eigenen Änderungen bestätigt (über den Scrum Master). Ohne Bewertung: „Es steht dann nichts darunter, auch nach dem Zurücksetzen nicht“.

Referenzbild: [referenzen/REF-rezension-01-bewertung.png](referenzen/REF-rezension-01-bewertung.png) („Hat mir gefallen“ unter „Sterne“). Die optische Übereinstimmung prüft der CEO im Prototyp; sie ist kein Akzeptanzkriterium.

## Anforderung (Satzschablone)

- Wenn ein Bewertungskriterium den Wert n hat, muss das System unter dem Kriteriennamen den Stufentext für n darstellen.
- Wenn ein Bewertungskriterium keine Bewertung hat (auch nach dem Zurücksetzen), darf das System unter dem Kriteriennamen keinen Text darstellen.
- Das System muss die Stufentexte zentral je Kriterium und Stufe definieren:

| Kriterium | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| Sterne | Nichts für mich | War okay | Hat mir gefallen | Absolut spitze | Ich habe es geliebt |
| Tempo | Zäh wie Kaugummi | Eher gemächlich | Angenehmes Tempo | Flott unterwegs | Rasant, kaum Luft geholt |
| Weltenbau | Kaum vorhanden | Eher blass | Solide Welt | Lebendig und durchdacht | Sehr detailreich wie im Film |
| Spice | Ganz zahm | Ein Hauch Würze | Wird warm | Ziemlich heiß | Feuerscharf |
| Spannung | Kein Nervenkitzel | Leicht spannend | Hat mich gepackt | Stand unter Strom | Konnte nicht aufhören |
| Action | Ganz ruhig | Wenig los | Ordentlich Action | Viel Krawall | Explosiv |
| Hauptfiguren | Nichts für mich | Ganz okay | Mochte ich | Ans Herz gewachsen | Neue Lieblinge |
| Nebenfiguren | Blass geblieben | Ganz okay | Gut besetzt | Echte Bereicherung | Vollständige Charaktere mit Hintergrund |
| Plot Twist | Sah ich kommen | Kleine Überraschung | Gut versteckt | Hat mich erwischt | Komplett umgehauen |
| Tränen | Trockene Augen | Kurz geschluckt | Feuchte Augen | Taschentuch gebraucht | Hemmungslos geweint |
| Romantik | Kaum Romantik | Ein zartes Knistern | Schön romantisch | Herzklopfen pur | Hoffnungslos verliebt |
| Humor | Kaum gelacht | Mal geschmunzelt | Oft gelacht | Sehr witzig | Bauchweh vor Lachen |
| Grusel | Gar nicht gruselig | Leichtes Kribbeln | Gänsehaut | Licht angelassen | Albtraumstoff |
| Dialoge | Hölzern | Etwas steif | Natürlich | Schlagfertig | Hätte ich gern selbst gesagt |

## Akzeptanzkriterien

### AK-1 Stufentexte „Sterne“
- **Gegeben** der Bereich „Bewertung“ wird angezeigt
- **Wenn** der Nutzer „Sterne“ nacheinander auf 1, 2, 3, 4, 5 setzt
- **Dann** steht unter „Sterne“ jeweils „Nichts für mich“, „War okay“, „Hat mir gefallen“, „Absolut spitze“, „Ich habe es geliebt“

### AK-2 Text folgt dem Wert
- **Gegeben** „Sterne“ hat den Wert 3
- **Wenn** der Nutzer den Wert auf 5 ändert
- **Dann** steht unter „Sterne“ „Ich habe es geliebt“ und nicht mehr „Hat mir gefallen“

### AK-3 Stufentexte aller übrigen Kriterien
- **Gegeben** der Bereich „Bewertung“ wird angezeigt
- **Wenn** der Nutzer ein beliebiges der übrigen 13 Kriterien auf einen Wert n von 1 bis 5 setzt
- **Dann** steht unter dem Kriteriennamen genau der Text aus der Tabelle für dieses Kriterium und n

### AK-4 Ohne Bewertung kein Text
- **Gegeben** ein Kriterium ohne Bewertung bzw. (zweiter Durchlauf) ein Kriterium, dessen Bewertung gerade zurückgesetzt wurde
- **Wenn** die Kriterienzeile betrachtet wird
- **Dann** steht unter dem Kriteriennamen kein Text

## Abgrenzung (nicht Teil dieses REQ)

- Setzen und Zurücksetzen der Bewertung (REQ-045).

## Qualitätsanforderungen

- Keine.

## Abhängigkeiten

- **REQ-044, REQ-045.**

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-15 | Erstellt aus CEO-Antwort 5 | Anforderungsmanager |
| 2026-11-15 | CEO-bestätigte Stufentexte der 13 übrigen Kriterien und „ohne Bewertung kein Text“ eingearbeitet (AK-3 ausformuliert, neu AK-4) | Anforderungsmanager |
