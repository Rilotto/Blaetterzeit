---
id: REQ-071
titel: Fenster „Design“ – dritte Pille „Stil“ mit „Klassisch“ und „Feuilleton“
status: Implementiert
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **neben Farben und Schrift auch den Stil der Formen wählen**, damit **ich die App wahlweise im heutigen Kartenstil oder im gedruckten Zeitungsstil „Feuilleton“ nutzen kann**.

CEO (2026-11-18, wörtlich): „Lass uns im Reiter Profil -> Design noch eine weitere Pille einfügen: "Format". Hier soll unter anderem das bisherige Design in den Formen z.B. die Pillenform unter "klassisch" abgespeichert sein. Eine weitere Option soll Feuilleton sein.“ Auf die Frage, ob Feuilleton überall gilt: „ja überall“. Zum Vorschlag des Scrum Masters (Name „Stil“, Listendarstellung): „sieht super aus, übernehmen wir so!“

Erweitert REQ-067 (Fenster „Design“) und REQ-066 (Zeile „Design“). Name „Stil“ statt „Format“, damit keine Verwechslung mit „Format“ in der Karte „Ausgabe“ (REQ-056, REQ-058) entsteht.

## Anforderung (Satzschablone)

**Pille und Liste**
- Das System muss die Umschaltpille im Fenster „Design“ (REQ-067) um eine dritte Pille „Stil“ erweitern, Reihenfolge „Farben | Schriftart | Stil“.
- Wenn „Stil“ aktiv ist, muss das System darunter die Liste der Stile anzeigen.
- Das System muss Stile an genau einer zentralen Stelle definieren und zum Start genau „Klassisch“ und „Feuilleton“ in dieser Reihenfolge bereitstellen.
- Das System muss je Stil eine Zeile darstellen: links eine Mini-Skizze im jeweiligen Stil und in den aktuellen Farben (Filterreihe, Bucheintrag mit Cover und Fortschrittsbalken), rechts den Namen und darunter einen kurzen kursiven Satz:
  - „Klassisch“: „Karten, Pillen, weiche Schatten“
  - „Feuilleton“: „Linien statt Karten, wie gedruckt“
- Das System muss beim aktiven Stil ein Häkchen darstellen und bei allen anderen einen leeren Kreis.

**Wirkung und Speicherung**
- Wenn der Nutzer einen Stil antippt, muss das System ihn sofort app-weit anwenden, ohne Neustart und ohne „Sichern“.
- Das System muss den gewählten Stil dauerhaft über die Repository-Schnittstelle (ADR-0002) speichern und nach einem Neustart wieder anwenden. Ohne Wahl gilt „Klassisch“.
- Stil, Farbdesign (REQ-068) und Schrift (REQ-069) müssen frei kombinierbar sein.
- „Klassisch“ ist der heutige Stil. Mit „Klassisch“ muss die App genau so aussehen wie ohne diesen REQ.

**Regeln des Stils „Feuilleton“ (gelten in der ganzen App, u. a. Seite „Bücher“, Übersichten, Buchdetails, Ausgabe, Bewertung, Profil, Menüs und Blätter)**
- F1: Keine Karten, Rahmen oder Ghost-Flächen (Ausnahme: F7). Einträge und Zeilen sind nur durch eine dünne Trennlinie in GhostFrame getrennt.
- F2: Alle Texte, auch Seitentitel und Buchtitel, haben dieselben Schriftgrößen wie im Stil „Klassisch“. Seitentitel und Buchtitel stehen in normaler Strichstärke (nicht fett).
- F3: Filterleiste ohne Pillen: Filter als reiner Text in Tertiär, der aktive Filter in Primär mit Unterstrich (Standard 2 px).
- F4: Umschaltpillen (Reiterleiste REQ-043, Umschaltpille im Fenster „Design“) und Status-Chips folgen demselben Muster: Text, der aktive Eintrag in Primär mit Unterstrich, statt gefüllter Pille.
- F5: Cover-Platzhalter ohne Fläche, nur als dünner Rahmen in GhostFrame mit eckigen Ecken (CEO 2026-11-18: „B passt für mich“; abweichend von der Ghost-Fläche aus REQ-010, die für „Klassisch“ gilt); Fortschrittsbalken dünn (Standard ca. 2 px).
- F6: Untere Hauptnavigation auf der Farbrubrik „Hintergrund“ mit Trennlinie oben; das aktive Icon in Primär mit kurzem Strich darüber (statt Hervorhebung hinter dem Icon).
- F7 (Ausnahme von F1, CEO 2026-11-21): Blätter, Fenster und Menüs, die von unten aufgehen, behalten ihre Fläche. Sie haben eckige Ecken, keinen Schatten und oben eine Trennlinie.
- F8 (CEO 2026-11-21): Jede Oberfläche hat im Feuilleton dieselben Abmessungen wie im Stil „Klassisch“, also gleiche Abstände zwischen Einträgen und Büchern, Ränder, Innenabstände, Höhen und Breiten. Feuilleton ändert nur die Optik nach F1–F7 (Linien statt Flächen, Unterstrich statt Pille, Balkendicke, Ecken). Trennlinien liegen innerhalb des Raums, den bei „Klassisch“ Kartenrand und Kartenabstand einnehmen. Tippflächen bleiben mindestens 44 px groß.
- Konkrete Maße (Strichstärken, Größen) sind Standardwerte auf Zuruf und kein Akzeptanzkriterium.

**Zeile „Design“ im Profil**
- Das System muss in der Zeile „Design“ (REQ-066) rechts alle drei Wahlen anzeigen, in der Reihenfolge Farbdesign · Schrift · Stil, z. B. „Klassisch · Fraunces · Feuilleton ›“. (Reihenfolge = Auslegung des Anforderungsmanagers, entspricht der Pillenreihenfolge.)

## Akzeptanzkriterien

### AK-1 Dritte Pille „Stil“
- **Gegeben** das Fenster „Design“ ist offen
- **Wenn** der Nutzer die Umschaltpille betrachtet
- **Dann** zeigt sie „Farben“, „Schriftart“ und „Stil“ in dieser Reihenfolge
- **Und** nach Antippen von „Stil“ erscheint die Liste der Stile

### AK-2 Liste der Stile
- **Gegeben** „Stil“ ist aktiv
- **Wenn** der Nutzer die Liste betrachtet
- **Dann** stehen dort „Klassisch“ mit „Karten, Pillen, weiche Schatten“ und „Feuilleton“ mit „Linien statt Karten, wie gedruckt“ (kursiv), je mit Mini-Skizze links
- **Und** der aktive Stil trägt ein Häkchen, der andere einen leeren Kreis

### AK-3 Standard „Klassisch“ unverändert
- **Gegeben** der Nutzer hat noch nie einen Stil gewählt
- **Wenn** er die App öffnet
- **Dann** ist „Klassisch“ aktiv und die App sieht aus wie bisher

### AK-4 Sofort anwenden ohne Neustart
- **Gegeben** „Klassisch“ ist aktiv
- **Wenn** der Nutzer „Feuilleton“ antippt
- **Dann** gelten ohne Neustart in der ganzen App die Feuilleton-Regeln F1–F8
- **Und** das Häkchen wechselt zu „Feuilleton“

### AK-5 Dauerhaft gespeichert
- **Gegeben** der Nutzer hat „Feuilleton“ gewählt
- **Wenn** die App neu geladen oder neu gestartet wird
- **Dann** ist „Feuilleton“ weiterhin aktiv

### AK-6 Frei kombinierbar
- **Gegeben** „Feuilleton“ ist aktiv
- **Wenn** der Nutzer ein anderes Farbdesign oder eine andere Schrift wählt
- **Dann** bleibt „Feuilleton“ aktiv und die App zeigt den Stil in den neuen Farben bzw. der neuen Schrift
- **Und** die Mini-Skizzen der Stil-Liste zeigen die aktuellen Farben

### AK-7 Feuilleton: Linien statt Karten
- **Gegeben** „Feuilleton“ ist aktiv
- **Wenn** der Nutzer eine Seite mit Karten oder Einträgen betrachtet (z. B. Karte „Ausgabe“, Listenansicht, Profil)
- **Dann** gibt es keine Kartenflächen, Rahmen oder Ghost-Flächen (außer bei Blättern, Fenstern und Menüs von unten, siehe AK-11); Einträge sind durch dünne Trennlinien in GhostFrame getrennt
- **Und** alle Texte, auch Seiten- und Buchtitel, haben dieselbe Schriftgröße wie bei „Klassisch“
- **Und** Seiten- und Buchtitel stehen in normaler Strichstärke

### AK-8 Feuilleton: Filter, Umschaltpillen, Status-Chips
- **Gegeben** „Feuilleton“ ist aktiv
- **Wenn** der Nutzer Filterleiste, Reiterleiste, Umschaltpille im Fenster „Design“ oder einen Status-Chip betrachtet
- **Dann** sind die Einträge reiner Text ohne Pillenfläche, inaktive in Tertiär, der aktive in Primär mit Unterstrich

### AK-9 Feuilleton: Cover-Platzhalter, Fortschritt, Navigation
- **Gegeben** „Feuilleton“ ist aktiv
- **Wenn** der Nutzer Cover-Platzhalter, Fortschrittsbalken und Hauptnavigation betrachtet
- **Dann** ist der Cover-Platzhalter keine Fläche, sondern ein dünner Rahmen in GhostFrame mit eckigen Ecken, und der Fortschrittsbalken ist dünn
- **Und** die Hauptnavigation liegt auf „Hintergrund“ mit Trennlinie oben, das aktive Icon ist in Primär mit kurzem Strich darüber

### AK-10 Anzeige in der Zeile „Design“
- **Gegeben** Farbdesign „Salbei“, Schrift „Fraunces“, Stil „Feuilleton“
- **Wenn** der Nutzer die Seite „Profil“ betrachtet
- **Dann** zeigt die Zeile „Design“ rechts „Salbei · Fraunces · Feuilleton“

### AK-11 Feuilleton: Blätter, Fenster und Menüs von unten
- **Gegeben** „Feuilleton“ ist aktiv
- **Wenn** der Nutzer ein Blatt, Fenster oder Menü öffnet, das von unten aufgeht (z. B. Blatt „Preis“, Fenster „Design“, Statusmenü)
- **Dann** hat es weiterhin eine Fläche
- **Und** diese hat eckige Ecken, keinen Schatten und oben eine Trennlinie

### AK-12 Feuilleton: gleiche Abmessungen wie „Klassisch“
- **Gegeben** dieselben Bücher und Daten, einmal mit Stil „Klassisch“, einmal mit „Feuilleton“
- **Wenn** der Nutzer eine beliebige Oberfläche in beiden Stilen vergleicht (z. B. Seite „Bücher“, Listenansicht, Buchdetails, Karte „Ausgabe“, Profil, Blätter)
- **Dann** sind Abstände zwischen Einträgen und Büchern, Ränder, Innenabstände, Höhen und Breiten in beiden Stilen gleich
- **Und** die Trennlinien liegen innerhalb des Raums, den bei „Klassisch“ Kartenrand und Kartenabstand einnehmen
- **Und** jede Tippfläche ist mindestens 44 px groß

## Abgrenzung (nicht Teil dieses REQ)

- Ein Editor für eigene Stile; neue Stile nur auf Zuruf des CEO an der zentralen Stelle.
- Änderungen an Farben oder Schriften (REQ-068, REQ-069).
- Verhalten und Inhalte der Elemente; der Stil ändert nur die Darstellung.

## Qualitätsanforderungen

- Tippflächen bleiben in beiden Stilen mindestens so groß wie in REQ-065 festgelegt (≥ 44 px), auch wenn Filter und Umschaltpillen im Feuilleton nur als Text erscheinen.

## Abhängigkeiten

- REQ-066 (Zeile „Design“, Anzeige wird um den Stil erweitert), REQ-067 (Umschaltpille wird um „Stil“ erweitert), REQ-068, REQ-069 (gleiches Speicher- und Anwendungsmuster).
- Die bisherigen Darstellungs-REQs (u. a. REQ-002, REQ-006, REQ-010, REQ-021, REQ-023, REQ-043, REQ-056, REQ-065) beschreiben den Stil „Klassisch“ und bleiben dafür gültig.

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-21 | CEO (wörtlich): „ebenso sind in diesem Stil auch die Bücher zu weit auseinander. Bitte vergleiche die Abmessungen jeder Oberfläche und bei Abweichungen, passe diese gemäß dem Stil Klassisch an.“ Neue Regel F8: gleiche Abmessungen wie „Klassisch“, nur die Optik ändert sich, Trennlinien im Raum von Kartenrand/-abstand, Tippflächen mindestens 44 px. Neu AK-12, AK-4 auf F1–F8. Status unverändert | Anforderungsmanager |
| 2026-11-21 | CEO (wörtlich): „Im Stil feuilleton sind jetzt die Titel der Bücher ziiieeeeemlich groß. Bitte übernehme die schriftgrößen aus dem Klassischen Stil für alle Texte und plane dies als fix für den nächsten Prototypen.“ F2 geändert: Schriftgrößen aller Texte wie „Klassisch“, Regel „Seitentitel und Buchtitel groß“ entfällt, normale Strichstärke bleibt. AK-7 angepasst. Status unverändert | Anforderungsmanager |
| 2026-11-21 | CEO (wörtlich): „ja das passt für mich so“. Neue Regel F7 als Ausnahme von F1: Blätter, Fenster und Menüs von unten behalten ihre Fläche, eckig, ohne Schatten, mit Linie oben. Neu AK-11, AK-4 auf F1–F7, AK-7 mit Verweis. Status unverändert | Anforderungsmanager |
| 2026-11-18 | F5 und AK-9: Cover-Platzhalter im Feuilleton nur als dünner Rahmen in GhostFrame, eckig (CEO: „B passt für mich“), löst den Widerspruch zu REQ-010 | Anforderungsmanager |
| 2026-11-18 | Erstellt aus CEO-Wunsch, CEO-Antwort („ja überall“) und dem vom CEO angenommenen Vorschlag des Scrum Masters. Status „Abgestimmt“ | Anforderungsmanager |
