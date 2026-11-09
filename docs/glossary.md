# Glossar

Einheitliche Begriffe für Anforderungen, Code und Tests (IREB: gemeinsames Begriffsverständnis).
Gepflegt vom Anforderungsmanager. Im Code werden die englischen Bezeichner verwendet.

| Begriff | Code | Definition |
|---|---|---|
| Buch | `Book` | Ein vom Nutzer erfasstes Werk mit Titel und Autor, optional ISBN. |
| Lesestatus | `ReadingStatus` | Status, den der Nutzer später in den Buchdetails zu einem Buch angibt. Vom CEO vorerst festgelegte Werte: *ungelesen*, *am lesen*, *gelesen*, *abgebrochen*, *Wunschliste*. Grundlage der späteren Filterlogik (REQ-007). Code-Bezeichner der Werte legt der Entwickler fest. Die frühere Werteliste (*Möchte ich lesen*, *Lese ich gerade*, *Gelesen*) stammte nicht vom CEO und entfällt. |
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
| Seite „Bücher“ | – | Zielansicht des Menüpunkts „Bücher“. Oben: Überschrift „Deine Bücher“, rechts daneben Filter-/Einstellungen-Schaltfläche und Plus-Schaltfläche (REQ-005), darunter die Filterleiste (REQ-006). |
| Filter-/Einstellungen-Schaltfläche | – | Runde Schaltfläche mit Regler-Icon im Kopfbereich der Seite „Bücher“. Verhalten noch nicht definiert (REQ-005). |
| Plus-Schaltfläche | – | Runde Schaltfläche mit Pluszeichen im Kopfbereich der Seite „Bücher“. Soll später dem Hinzufügen eines Buches dienen; Funktion noch nicht definiert (REQ-005). |
| Filterleiste | – | Horizontal wischbare Leiste mit Filtern direkt unter der Überschrift der Seite „Bücher“, unabhängig von anderen Bereichen scrollbar (REQ-006). |
| Filter | – | Eintrag der Filterleiste in Kapselform (Pill) mit Name. Genau ein Filter ist aktiv; seine Aktivierung löst seine Filterlogik aus (REQ-006, REQ-007). |
| Aktiver Filter | – | Der aktuell gewählte Filter; dunkelbraun mit heller Beschriftung dargestellt. Standardmäßig „Für dich“ (REQ-006). |
| Filterkonfiguration | – | Zentral festgelegte, von der Darstellung unabhängige Liste der Filter mit Name, Reihenfolge und zugeordneter Filterlogik. Filter werden ausschließlich hier hinzugefügt, umbenannt, entfernt und sortiert (REQ-007). |
| Filterlogik | – | Einem Filter zugeordnete Regel, welche Bücher bzw. welcher Seitenteil bei Aktivierung betroffen ist. Wird pro Filter separat vom CEO ausgearbeitet (REQ-007). |
| Platzhalter-Textfarbe | – | Farbrolle des Platzhaltertexts „under construction :)“; bezieht ihren Wert aus der Farbrubrik „Tertiär“ (REQ-004). |
| Standardfarben | – | Aktuelle Standardwerte der Farbrubriken. Aktuell nur durch den CEO über den Chat änderbar (REQ-002, „Farben auf Zuruf“). |
