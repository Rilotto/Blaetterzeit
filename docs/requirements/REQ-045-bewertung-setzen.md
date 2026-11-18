---
id: REQ-045
titel: Reiter „Rezension“ – Bewertung je Kriterium setzen, zurücksetzen und dauerhaft speichern
status: Implementiert
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **je Bewertungskriterium eine Bewertung von 1 bis 5 vergeben und sie dauerhaft behalten**, damit **meine Einschätzung zum Buch festgehalten ist**.

Mit dem CEO festgelegt (2026-11-13): „Bewertung je Kriterium 1–5 (fünf Symbole).“ CEO (wörtlich, 2026-11-13): „Dies ist weniger farbintensiv, bis sie angewählt werden.“

Antworten des CEO (wörtlich, 2026-11-15):
- Antippen des n-ten Symbols setzt n: „ja“
- Erneutes Antippen / Entfernen: „Bewertung in der Spalte / Rubrik wird zurückgesetzt.“ / „siehe 4.2“
- Halbe Werte: „nein“
- Dauerhaft speichern: „oh ja (super wichtig!)“

Referenzbild: [referenzen/REF-rezension-01-bewertung.png](referenzen/REF-rezension-01-bewertung.png) (Sterne mit Wert 3: drei volle, zwei blasse Symbole).

## Anforderung (Satzschablone)

- Wenn der Nutzer das n-te Symbol (n = 1 bis 5) eines Bewertungskriteriums antippt, muss das System die Bewertung dieses Kriteriums für dieses Buch auf n setzen.
- Wenn der Nutzer das Symbol antippt, das dem aktuell gesetzten Wert entspricht, muss das System die Bewertung dieses Kriteriums zurücksetzen (keine Bewertung).
- Das System darf nur ganzzahlige Werte von 1 bis 5 zulassen.
- Bei Wert n muss das System die Symbole 1 bis n in der vollen Farbe und die übrigen in der blassen Farbe des Kriteriums (REQ-046) darstellen; ohne Bewertung alle blass.
- Das System muss die Bewertungen je Buch und Kriterium sofort dauerhaft speichern, sodass sie nach Verlassen der Buchdetails, Neuladen und Neustart erhalten bleiben (über die Repository-Schnittstelle, ADR-0002).
- Das System muss die Bewertungen eines Buches unabhängig von denen anderer Bücher und anderer Kriterien führen.

## Akzeptanzkriterien

### AK-1 Ohne Bewertung alles blass
- **Gegeben** ein Buch ohne Bewertung
- **Wenn** der Bereich „Bewertung“ angezeigt wird
- **Dann** sind alle Symbole aller 14 Kriterien blass

### AK-2 Antippen setzt den Wert
- **Gegeben** „Tempo“ hat keine Bewertung
- **Wenn** der Nutzer das dritte Tempo-Symbol antippt
- **Dann** hat „Tempo“ den Wert 3
- **Und** die Symbole 1–3 sind voll, 4–5 blass

### AK-3 Wert ändern
- **Gegeben** „Tempo“ hat den Wert 3
- **Wenn** der Nutzer das fünfte bzw. (zweiter Durchlauf) das erste Tempo-Symbol antippt
- **Dann** hat „Tempo“ den Wert 5 bzw. 1

### AK-4 Erneutes Antippen setzt zurück
- **Gegeben** „Tempo“ hat den Wert 3
- **Wenn** der Nutzer das dritte Tempo-Symbol antippt
- **Dann** hat „Tempo“ keine Bewertung und alle Tempo-Symbole sind blass
- **Und** die Bewertungen der übrigen Kriterien bleiben unverändert

### AK-5 Nur ganze Werte
- **Gegeben** der Bereich „Bewertung“ wird angezeigt
- **Wenn** der Nutzer beliebige Symbole antippt
- **Dann** ist jeder gesetzte Wert eine ganze Zahl von 1 bis 5

### AK-6 Dauerhaft gespeichert
- **Gegeben** für ein Buch ist „Sterne“ = 4 und „Spice“ = 2 gesetzt
- **Wenn** die App neu gestartet und die Buchdetails dieses Buches geöffnet werden
- **Dann** ist „Sterne“ = 4 und „Spice“ = 2

### AK-7 Bewertungen je Buch getrennt
- **Gegeben** für Buch A ist „Tempo“ bewertet, für Buch B nicht
- **Wenn** die Buchdetails von Buch B angezeigt werden
- **Dann** sind bei „Tempo“ alle Symbole blass

## Abgrenzung (nicht Teil dieses REQ)

- Auswahl der Kriterien (To-do-Liste). Icons und Farbwerte (REQ-046). Stufentexte (REQ-048).

## Qualitätsanforderungen

- Keine messbaren Vorgaben.

## Abhängigkeiten

- **REQ-044, REQ-046.** ADR-0002 (Repository-Schnittstelle). **REQ-034:** Buchdatenspeicherung.

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-13 | Erstellt (Entwurf aus CEO-Vorgabe „Pille Rezension“) | Anforderungsmanager |
| 2026-11-15 | CEO-Antworten 4.1–4.5, 8 eingearbeitet: Setzen, Zurücksetzen, keine halben Werte, dauerhafte Speicherung, Must (neu AK-2 bis AK-6) | Anforderungsmanager |
| 2026-11-15 | Status „Abgestimmt“ (CEO 2026-11-15, über den Scrum Master: „Der Rest ist in Ordnung.“) | Anforderungsmanager |
