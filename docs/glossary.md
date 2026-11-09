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
| Standard-Theme | `defaultTheme` | Das mit der App ausgelieferte Theme; aktiv beim ersten Start und Ziel von „Auf Standard zurücksetzen“. Zentral an genau einer Stelle im Code definiert. Konkrete Werte sind kein Akzeptanzkriterium (REQ-002). |
| Zuordnungstabelle | – | Verbindliche Liste, welches UI-Element welcher Farbrolle zugeordnet ist (geführt in REQ-002). |
| Hauptleiste | `MainNav` | Dauerhaft sichtbare Navigationsleiste mit je einem Eintrag (Icon + Beschriftung) pro Hauptseite; dient dem Wechsel zwischen den Hauptseiten (REQ-004). |
| Hauptleisten-Eintrag | `NavItem` | Ein antippbares Element der Hauptleiste, das genau zu einer Hauptseite führt. Der Eintrag der angezeigten Hauptseite ist der *aktive Eintrag*. |
| Hauptseite | `Page` | Eine über die Hauptleiste direkt erreichbare Seite der App (vorläufig: Bibliothek, Aktuell lesen, Hinzufügen, Statistik, Einstellungen). |
| Startseite | – | Die Hauptseite, die nach dem Start der App angezeigt wird (vorläufig: Bibliothek). |
| Platzhalterseite | `PlaceholderPage` | Inhalt einer Hauptseite, deren Funktion noch nicht durch einen eigenen REQ umgesetzt ist; zeigt Titel und den Hinweis, dass die Funktion noch nicht verfügbar ist (REQ-005). |
| Schriftart (App-Schrift) | `fontFamily` | Die zentral an genau einer Stelle definierte Schriftart, in der alle Texte der App dargestellt werden; austauschbar ohne weitere Codeänderungen (REQ-003). |
| Größenstufe | `TypeScale` | Eine Stufe der zentral definierten Schriftgrößen-Hierarchie (vorläufig: Seitentitel, Abschnittsüberschrift, Fließtext, Beschriftung). |
| Prototyp | – | Für den CEO ansehbarer Web-Build mit Demodaten. Ein Prototyp ist keine Freigabe; nicht abgenommene Funktionen sind darin als „Entwurf“ gekennzeichnet. |
