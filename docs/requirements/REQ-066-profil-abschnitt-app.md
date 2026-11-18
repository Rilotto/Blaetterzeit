---
id: REQ-066
titel: Seite „Profil“ – Abschnitt „App“ mit Zeile „Design“
status: In Umsetzung
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **im Menüpunkt „Profil“ einen Abschnitt „App“ mit dem Eintrag „Design“**, damit **ich das Aussehen der App von dort aus wählen kann**.

CEO (2026-11-18, wörtlich): „In dem Reiter "profil" soll es nun einen neuen Abschnitt geben -> "App". In diesem soll es ein Untermenü geben (wie bei den Buchdetails -> Ausgabe). In diesem Untermenü ist unser erster Punkt: "Design".“
Abstimmung des Mockups des Scrum Masters (CEO, wörtlich): „Deine Ideen gefallen mir alle. Setzen wir so um.“

## Anforderung (Satzschablone)

- Das System muss in der Zielansicht des Menüpunkts „Profil“ einen Abschnitt mit der Überschrift „App“ in der Schriftgrößenstufe „Label“ (REQ-065) darstellen.
- Das System muss unter dieser Überschrift eine Karte darstellen, die derzeit genau eine Zeile „Design“ enthält und genauso aussieht wie die Karte „Ausgabe“ in den Buchdetails (REQ-056): dieselbe Kartenfläche (heller als der Hintergrund) sowie dieselbe Zeilengestaltung, Trennlinien und Pfeile.
- Das System muss in der Zeile „Design“ rechts die aktuelle Wahl als „<Farbdesign> · <Schrift> ›“ anzeigen (z. B. „Klassisch · Fraunces ›“).
- Wenn der Nutzer die Zeile „Design“ antippt, muss das System das Fenster „Design“ (REQ-067) öffnen.
- Die Zielansicht „Profil“ zeigt nicht mehr „under construction :)“.

## Akzeptanzkriterien

### AK-1 Abschnitt „App“ mit Karte und Zeile „Design“
- **Gegeben** die App ist geöffnet
- **Wenn** der Nutzer den Menüpunkt „Profil“ antippt
- **Dann** erscheint die Überschrift „App“ in der Stufe „Label“ und darunter eine Karte mit genau einer Zeile „Design“
- **Und** „under construction :)“ wird nicht angezeigt
- **Und** die Karte verwendet für Fläche, Zeilen, Trennlinien und Pfeil dieselben Farbrollen und dieselbe Gestaltung wie die Karte „Ausgabe“ (REQ-056); ihre Fläche hebt sich hell vom Hintergrund ab

### AK-2 Aktuelle Wahl in der Zeile
- **Gegeben** das Farbdesign „Salbei“ und die Schrift „Systemschrift“ sind gewählt
- **Wenn** der Nutzer die Seite „Profil“ betrachtet
- **Dann** zeigt die Zeile „Design“ rechts „Salbei · Systemschrift ›“
- **Und** nach einer anderen Wahl im Fenster „Design“ zeigt sie ohne Neustart die neue Wahl

### AK-3 Antippen öffnet das Fenster „Design“
- **Gegeben** die Seite „Profil“ ist geöffnet
- **Wenn** der Nutzer die Zeile „Design“ antippt
- **Dann** öffnet sich das Fenster „Design“

## Abgrenzung (nicht Teil dieses REQ)

- Weitere Abschnitte oder Zeilen der Seite „Profil“.
- Inhalt des Fensters „Design“ (REQ-067 bis REQ-069).

## Qualitätsanforderungen

- Keine.

## Abhängigkeiten

- REQ-002 (Menüpunkt „Profil“): Die Zielansicht ist ab jetzt definiert. Sonst bleibt REQ-002 unverändert.
- REQ-056 (Stil der Karte „Ausgabe“), REQ-065 (Schriftgrößenstufe „Label“), REQ-067 bis REQ-069.

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-18 | Erstellt aus der CEO-Anforderung und dem angenommenen Mockup. Status „Abgestimmt“ (CEO, wörtlich: „Deine Ideen gefallen mir alle. Setzen wir so um.“) | Anforderungsmanager |
| 2026-11-18 | Karte wie „Ausgabe“ präzisiert (gleiche helle Fläche, Zeilen, Trennlinien, Pfeil), AK-1 ergänzt. CEO zum Prototyp: „Schau mal bitte das Menü bei App an... da ist der Menühintergrund nicht in einem helleren / weißeren Ton wie bei den Buchdetails -> Ausgabe.... da gefällt mir das Menüdesign total gut. Können wir das bitte hier auch übernehmen?“ Status unverändert | Anforderungsmanager |
