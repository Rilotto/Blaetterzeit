# Glossar

Einheitliche Begriffe für Anforderungen, Code und Tests (IREB: gemeinsames Begriffsverständnis).
Gepflegt vom Anforderungsmanager. Im Code werden die englischen Bezeichner verwendet.

| Begriff | Code | Definition |
|---|---|---|
| Buch | `Book` | Ein vom Nutzer erfasstes Werk mit Titel und Autor, optional ISBN. |
| Lesestatus | `ReadingStatus` | Stand des Nutzers zu einem Buch: *Möchte ich lesen* (`want_to_read`), *Lese ich gerade* (`reading`), *Gelesen* (`read`). |
| Bibliothek | – | Gesamtheit aller erfassten Bücher eines Nutzers. |
| Theme | `Theme` | Satz aus genau vier Farbwerten, je einer pro Farbrolle, der das Farbaussehen der gesamten App bestimmt. Es ist immer genau ein Theme aktiv. |
| Farbrolle | `ColorRole` | Benannte Funktion einer Farbe im Theme, der UI-Elemente zugeordnet sind (vorläufig: Primärfarbe `primary`, Sekundärfarbe `secondary`, Hintergrundfarbe `background`, Textfarbe `text`; Namen noch nicht vom CEO bestätigt). Jedes farbige UI-Element gehört zu genau einer Farbrolle. |
| Hauptnavigation | – | Dauerhaft sichtbare Navigationsleiste am unteren Bildschirmrand mit fünf Menüpunkten (REQ-002). |
| Menüpunkt | – | Eintrag der Hauptnavigation, bestehend aus Icon und darunterliegender Beschriftung: Start, Bücher, Bibliothek, Statistik, Profil (REQ-002). |
| Aktiver Menüpunkt | – | Der aktuell ausgewählte Menüpunkt. Er wird mit einer Hervorhebung hinter dem Icon sowie Icon und Beschriftung in der Aktivfarbe dargestellt (REQ-002). |
| Zielansicht | – | Ansicht, die ein Menüpunkt später öffnet. Ihr Inhalt ist noch nicht definiert (REQ-002). |
| Standard-Theme | `defaultTheme` | Das mit der App ausgelieferte Theme; aktiv beim ersten Start und Ziel von „Auf Standard zurücksetzen“. Zentral an genau einer Stelle im Code definiert. |
