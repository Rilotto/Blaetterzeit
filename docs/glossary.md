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
| Farbrubrik | – | Allgemeine, zentral definierte und benannte Farbe der App (Begriff des CEO). Derzeit: Hintergrund, Primär, Sekundär und Tertiär (vom CEO benannt; ersetzt den früheren Arbeitsnamen „Inaktiv“) (REQ-002) sowie Ghost, GhostFrame und Schrift tertiär (REQ-006). Elemente der App beziehen ihre Farben über Farbrollen aus den Farbrubriken. |
| Ghost | – | Farbrubrik (Name vom CEO) für den Hintergrund inaktiver Filter. Standardwert aus dem Referenzbild (REQ-006). |
| GhostFrame | – | Farbrubrik (Name vom CEO) für den Rahmen inaktiver Filter. Standardwert aus dem Referenzbild (REQ-006). |
| Schrift tertiär | – | Farbrubrik (Name vom CEO, geschrieben „Schrift teritär“) für die Beschriftung inaktiver Filter. Standardwert aus dem Referenzbild (REQ-006). Nicht zu verwechseln mit der Farbrubrik „Tertiär“ (REQ-002); beide sind getrennte Farbrubriken, auch wenn ihre aktuellen Standardwerte ähnlich sind. |
| Farbrolle | – | Funktion einer Farbe an einem Element, z. B. Navigationshintergrund, Hervorhebungsfarbe, Aktivfarbe, Inaktivfarbe in der Hauptnavigation. Jede Farbrolle bezieht ihren Wert aus einer Farbrubrik (REQ-002). |
| App-Schrift | – | An genau einer Stelle zentral definierte, austauschbare Schrift, in der alle Texte der App dargestellt werden. Die Definition endet mit einer generischen Ersatzschrift. Die endgültige Schrift legt der CEO später fest; bis dahin wird die Systemschrift des Geräts verwendet (REQ-003). |
| Seite „Bücher“ | – | Zielansicht des Menüpunkts „Bücher“. Oben: Überschrift „Deine Bücher“, rechts daneben Filter-/Einstellungen-Schaltfläche und Plus-Schaltfläche (REQ-005), darunter die Filterleiste (REQ-006). Der Bereich unterhalb der Filterleiste ist vorerst leer; die Seite zeigt kein „under construction :)“ (REQ-005). |
| Filter-/Einstellungen-Schaltfläche | – | Runde Schaltfläche mit Rahmen und Regler-Icon (beides in Farbrubrik „Tertiär“) im Kopfbereich der Seite „Bücher“. Hat keinen aktiven Zustand; Antippen bewirkt derzeit nichts. Soll später ein eigenes Fenster öffnen; dessen Inhalt ist noch nicht definiert (REQ-005). |
| Plus-Schaltfläche | – | Runde Schaltfläche mit Plus-Icon im Kopfbereich der Seite „Bücher“. Hat keinen aktiven Zustand; Antippen bewirkt derzeit nichts. Soll später ein eigenes Fenster zum Hinzufügen eines Buches öffnen; Funktion noch nicht definiert (REQ-005). |
| Regler-Icon / Plus-Icon | – | Icons der beiden Schaltflächen der Seite „Bücher“, aus dem Referenzbild nachgebildet im technischen Stil der Navigations-Icons (einfarbige Linien-Icons auf transparentem Grund, von der App eingefärbt); keine Bibliotheks-Icons (REQ-005). |
| Filterleiste | – | Horizontal wischbare Leiste mit Filtern direkt unter der Überschrift der Seite „Bücher“, unabhängig von anderen Bereichen scrollbar (REQ-006). |
| Filter | – | Eintrag der Filterleiste in Kapselform (Pill) mit Name. Genau ein Filter ist aktiv. Antippen macht ihn zum aktiven Filter und löst seine Filterlogik aus (REQ-006, REQ-007). |
| Aktiver Filter | – | Der aktuell gewählte Filter. Hintergrund in Farbrubrik „Tertiär“, Beschriftung in Farbrubrik „Hintergrund“, kein Rahmen. Bei jedem Aufruf der Seite „Bücher“ (auch nach Seitenwechsel) ist „Für dich“ aktiv (REQ-006). |
| Inaktiver Filter | – | Jeder Filter außer dem aktiven. Hintergrund „Ghost“, Rahmen „GhostFrame“, Beschriftung „Schrift tertiär“ (REQ-006). |
| Filterkonfiguration | – | Zentral festgelegte, von der Darstellung unabhängige Liste der Filter mit Name, Reihenfolge und zugeordneter Filterlogik. Filter werden ausschließlich hier hinzugefügt, umbenannt, entfernt und sortiert. Wird nur in der Entwicklung gepflegt (CEO über den Chat); keine Bearbeitung in der App (REQ-007). |
| Filterlogik | – | Einem Filter zugeordnete Regel, welche Bücher bzw. welcher Seitenteil bei Aktivierung betroffen ist. Wird pro Filter separat vom CEO ausgearbeitet; im Grundgerüst bewirkt sie nichts Sichtbares (REQ-007). |
| Platzhalter-Textfarbe | – | Farbrolle des Platzhaltertexts „under construction :)“; bezieht ihren Wert aus der Farbrubrik „Tertiär“ (REQ-004). |
| Standardfarben | – | Aktuelle Standardwerte der Farbrubriken. Aktuell nur durch den CEO über den Chat änderbar (REQ-002, „Farben auf Zuruf“). |
