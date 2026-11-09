# Glossar

Einheitliche Begriffe für Anforderungen, Code und Tests (IREB: gemeinsames Begriffsverständnis).
Gepflegt vom Anforderungsmanager. Im Code werden die englischen Bezeichner verwendet.

| Begriff | Code | Definition |
|---|---|---|
| Buch | `Book` | Ein vom Nutzer erfasstes Werk mit Titel und Autor, optional ISBN. |
| Lesestatus | `ReadingStatus` | Stand des Nutzers zu einem Buch: *Möchte ich lesen* (`want_to_read`), *Lese ich gerade* (`reading`), *Gelesen* (`read`). |
| Bibliothek | – | Gesamtheit aller erfassten Bücher eines Nutzers. |
| Theme | `Theme` | Vom CEO bereitgestelltes, in den Einstellungen (Rubrik „Themes“) auswählbares Erscheinungsbild der App. Bei Auswahl ändert sich das Aussehen der App entsprechend. Woraus ein Theme besteht, ist noch nicht festgelegt (REQ-001). |
| Hauptnavigation | – | Dauerhaft sichtbare Navigationsleiste am unteren Bildschirmrand mit fünf Menüpunkten (REQ-002). |
| Menüpunkt | – | Eintrag der Hauptnavigation, bestehend aus Icon und darunterliegender Beschriftung: Start, Bücher, Bibliothek, Statistik, Profil (REQ-002). |
| Aktiver Menüpunkt | – | Der aktuell ausgewählte Menüpunkt. Er wird mit einer Hervorhebung hinter dem Icon sowie Icon und Beschriftung in der Aktivfarbe dargestellt (REQ-002). |
| Zielansicht | – | Ansicht, die ein Menüpunkt später öffnet. Ihr Inhalt ist noch nicht definiert (REQ-002). |
| Inhaltsbereich | – | Bereich über der Hauptnavigation, in dem die Zielansicht des aktiven Menüpunkts erscheint. Solange sie nicht definiert ist, steht dort mittig „under construction :)“ (REQ-002). |
| Farbrubrik | – | Allgemeine, zentral definierte und benannte Farbe der App (Begriff des CEO). Derzeit: Hintergrund, Primär, Sekundär und Tertiär (vom CEO benannt; ersetzt den früheren Arbeitsnamen „Inaktiv“). Elemente der App beziehen ihre Farben über Farbrollen aus den Farbrubriken (REQ-002). |
| Farbrolle | – | Funktion einer Farbe an einem Element, z. B. Navigationshintergrund, Hervorhebungsfarbe, Aktivfarbe, Inaktivfarbe in der Hauptnavigation. Jede Farbrolle bezieht ihren Wert aus einer Farbrubrik (REQ-002). |
| App-Schrift | – | An genau einer Stelle zentral definierte, austauschbare Schrift, in der alle Texte der App dargestellt werden. Die Definition endet mit einer generischen Ersatzschrift. Die endgültige Schrift legt der CEO später fest; bis dahin wird die Systemschrift des Geräts verwendet (REQ-003). |
| Standardfarben | – | Aktuelle Standardwerte der Farbrubriken. Aktuell nur durch den CEO über den Chat änderbar (REQ-002, „Farben auf Zuruf“). |
