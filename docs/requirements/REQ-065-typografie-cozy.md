---
id: REQ-065
titel: Typografie und Proportionen – App-Schrift Fraunces, zentrale Schriftgrößenstufen, Abstandsraster und Cozy-Details
status: Abgestimmt
prioritaet: Should
art: qualitaet
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich, **dass die App gemütlich („cozy“) wirkt, mit stimmigen, eher kleineren Schriftgrößen und Proportionen**, damit **sich das Lesen und Stöbern in der App ruhig und angenehm anfühlt**.

Auslöser (CEO, nach Vergleich mit der Referenz „SlowReads“): Look and Feel „nicht cozy genug, Schriftgröße und Proportionen nicht stimmig, eher zu groß“.

Abstimmungsnachweis (CEO, 2026-11-18, wörtlich): „Plane die Änderung bitte für den nächsten Prototypen mir ein. Es soll Variante B - Fraunces werden. Danke für den Vorschlag!“ Der Vorschlag des Scrum Masters (Variante B) ist damit vom CEO angenommen. Er ist in diesem REQ vollständig abgebildet.

## Anforderung (Satzschablone)

**Schrift**
- Das System muss als App-Schrift (REQ-003) die Schrift „Fraunces“ verwenden, für alle Texte der App einschließlich der Hauptnavigation.
- Das System muss die Schriftdatei(en) von Fraunces mit der App ausliefern und darf sie zur Laufzeit nicht aus dem Internet laden.
- Das System muss die Lizenzdatei von Fraunces (SIL Open Font License) mit der App ausliefern.
- Das System muss die App-Schrift weiterhin an genau einer zentralen Stelle festlegen (zentrale Schriftvariable `--bz-schrift`, Name vom Scrum Master vorgegeben). Die Schriftfolge endet mit einer generischen Ersatzschrift.

**Schriftgrößenstufen**
- Das System muss die Schriftgrößen der App an genau einer zentralen Stelle als benannte Schriftgrößenstufen festlegen: Label, Meta, Text, Titel, Abschnitt, Seite.
- Das System muss jedem Text der App genau eine dieser Schriftgrößenstufen zuordnen. Andere Schriftgrößen darf es nicht geben.
- Das System muss Texte der Stufe „Label“ in Großbuchstaben und mit erhöhter Zeichensperrung darstellen.

**Proportionen**
- Das System muss die Abstände der App aus einem zentral definierten Abstandsraster beziehen und einen zentral definierten Bildschirmrand einhalten.
- Das System muss Pillen und Schaltflächen eine zentral definierte Standardhöhe geben. Die antippbare Fläche jeder Pille und Schaltfläche muss dabei mindestens 44 × 44 px groß sein.
- Das System muss die Icons der Hauptnavigation in einer zentral definierten Größe darstellen, die kleiner ist als bisher.

**Cozy-Details**
- Das System muss Autorenangaben und Stufentexte (REQ-048) kursiv darstellen.
- Das System muss den Hintergrund der App mit einer leichten Papier-Körnung darstellen.
- Das System muss Karten mit einem weichen, warmen Schatten statt eines harten Rahmens absetzen.
- Das System muss Fließtext mit einem Zeilenabstand von etwa dem 1,5-Fachen der Schriftgröße darstellen.

**Standardwerte (keine Akzeptanzkriterien, auf Zuruf änderbar)**

Analog zu CLAUDE.md „Farben auf Zuruf“: Die folgenden Zahlenwerte sind **Standardwerte** an der zentralen Stelle. Sagt der CEO im Chat z. B. „Stufe Text auf 16 px“, passt der Entwickler nur den Standardwert an, ohne neuen REQ. Eingefroren wird nur das Verhalten: welche Stufe bzw. Rolle welches Element bekommt, dass es nur die definierten Stufen gibt und dass die Werte zentral festgelegt sind.

| Stufe / Rolle | Standardwert |
|---|---|
| Label (Großbuchstaben, gesperrt) | 12 px |
| Meta | 14 px |
| Text | 15 px |
| Titel | 17 px |
| Abschnitt | 20 px |
| Seite | 22–26 px |
| Abstandsraster | 4 / 8 / 12 / 16 / 24 px |
| Bildschirmrand | 20 px |
| Höhe Pillen und Schaltflächen | 36 px (bisher 40 px) |
| Zeilenabstand Fließtext | ca. 1,5 |
| Navigations-Icons | etwas kleiner als bisher (Wert legt der Entwickler fest) |

Welche Stufe ein bestehendes Element bekommt, legt der Entwickler nach folgender Rollenbeschreibung fest. Die Zuordnung wird an der zentralen Stelle bzw. im Code nachvollziehbar dokumentiert:
- **Seite:** Seitenüberschriften (z. B. „Deine Bücher“).
- **Abschnitt:** Abschnittsüberschriften (z. B. „Noch zu lesen“, „Sagas“, Überschriften von Menüs und Blättern).
- **Titel:** Buchtitel und Titel einzelner Einträge.
- **Text:** Fließtext, Eingaben, Beschriftungen von Pillen und Schaltflächen.
- **Meta:** Nebenangaben (z. B. Autor, Anzahlzeilen, Seitenangaben, Navigationsbeschriftungen).
- **Label:** kleine Kennzeichnungen über Feldern oder Gruppen.

## Akzeptanzkriterien

### AK-1 App-Schrift ist Fraunces und wird lokal ausgeliefert
- **Gegeben** die App ist gebaut und ohne Internetverbindung geöffnet, und der Nutzer hat keine andere Schrift gewählt (REQ-069)
- **Wenn** der Nutzer Texte auf der Seite „Bücher“, in den Buchdetails und in der Hauptnavigation betrachtet
- **Dann** sind alle diese Texte in Fraunces dargestellt
- **Und** die App lädt keine Schriftdatei aus dem Internet (die Schriftdatei ist Teil des Builds)

### AK-2 Lizenzdatei wird mitgeliefert
- **Gegeben** der Build der App (Web-Build und APK)
- **Wenn** geprüft wird, welche Dateien zur Schrift ausgeliefert werden
- **Dann** ist neben der Schriftdatei die Lizenzdatei der SIL Open Font License für Fraunces enthalten

### AK-3 Schrift an genau einer Stelle, mit generischer Ersatzschrift
- **Gegeben** die Schriftfestlegungen der App
- **Wenn** geprüft wird, wo die Schrift für Texte festgelegt wird
- **Dann** ist sie nur in der zentralen Schriftvariable `--bz-schrift` festgelegt, deren Schriftfolge ohne Nutzerwahl mit Fraunces beginnt und mit einer generischen Ersatzschrift endet
- **Und** kein Element legt eine davon abweichende Schrift fest. Einzige Ausnahme sind die Zeilen der Schriftliste in REQ-069.

### AK-4 Nur die definierten Schriftgrößenstufen
- **Gegeben** die zentrale Definition der Schriftgrößenstufen Label, Meta, Text, Titel, Abschnitt, Seite
- **Wenn** geprüft wird, welche Schriftgrößen Elemente der App verwenden
- **Dann** bezieht jedes Element seine Schriftgröße aus genau einer dieser Stufen
- **Und** kein Element legt eine eigene, davon abweichende Schriftgröße fest

### AK-5 Rollenzuordnung der Schriftgrößenstufen
- **Gegeben** die Seite „Bücher“ und die Buchdetails mit einem Buch mit Autor
- **Wenn** die Schriftgrößen betrachtet werden
- **Dann** hat die Seitenüberschrift „Deine Bücher“ die Stufe „Seite“, die Abschnittsüberschrift „Noch zu lesen“ die Stufe „Abschnitt“, der Buchtitel in den Buchdetails die Stufe „Titel“ und der Autor die Stufe „Meta“
- **Und** die Stufen sind in der Reihenfolge Label < Meta < Text < Titel < Abschnitt < Seite von klein nach groß geordnet

### AK-6 Größe auf Zuruf an einer Stelle änderbar
- **Gegeben** die zentrale Definition der Schriftgrößenstufen
- **Wenn** der Wert einer Stufe (z. B. „Text“) an der zentralen Stelle geändert wird
- **Dann** ändern sich alle Texte dieser Stufe entsprechend
- **Und** an keinem Element muss dafür etwas angepasst werden

### AK-7 Labels in Großbuchstaben und gesperrt
- **Gegeben** ein Text der Stufe „Label“
- **Wenn** er angezeigt wird
- **Dann** erscheint er in Großbuchstaben und mit erhöhter Zeichensperrung, unabhängig von der Schreibweise im zugrunde liegenden Text

### AK-8 Abstände aus dem zentralen Raster
- **Gegeben** die zentrale Definition des Abstandsrasters und des Bildschirmrands
- **Wenn** geprüft wird, welche Abstände Elemente der App verwenden
- **Dann** beziehen sie ihre Abstände aus dem Abstandsraster bzw. dem Bildschirmrand
- **Und** der Inhalt der Seiten hält links und rechts den zentral definierten Bildschirmrand ein

### AK-9 Pillen und Schaltflächen: zentrale Höhe, Tippfläche mindestens 44 px
- **Gegeben** eine Pille oder Schaltfläche der App (z. B. Filter, Statuspille, „Sichern“, runde Schaltflächen im Kopfbereich)
- **Wenn** ihre Höhe und ihre antippbare Fläche geprüft werden
- **Dann** bezieht ihre sichtbare Höhe ihren Wert aus der zentralen Standardhöhe
- **Und** ihre antippbare Fläche ist mindestens 44 × 44 px groß, auch wenn die sichtbare Fläche kleiner ist

### AK-10 Autor und Stufentexte kursiv
- **Gegeben** ein Buch mit Autor und gesetzter Bewertung
- **Wenn** die Autorenangabe (z. B. in den Buchdetails) und ein Stufentext (z. B. „Hat mir gefallen“) angezeigt werden
- **Dann** sind beide kursiv dargestellt

### AK-11 Papier-Körnung, weiche Schatten, Zeilenabstand
- **Gegeben** die App ist geöffnet
- **Wenn** der Hintergrund, eine Karte (z. B. Statistik-Pille oder Karte „Ausgabe“) und ein mehrzeiliger Fließtext betrachtet werden
- **Dann** zeigt der Hintergrund eine leichte Papier-Körnung
- **Und** die Karte ist durch einen weichen Schatten abgesetzt und nicht durch einen harten Rahmen
- **Und** der Fließtext hat einen Zeilenabstand von etwa dem 1,5-Fachen der Schriftgröße

## Abgrenzung (nicht Teil dieses REQ)

- Konkrete Zahlenwerte (Pixel, Zeilenabstand, Icongröße, Stärke der Körnung und des Schattens). Sie sind Standardwerte auf Zuruf und keine Akzeptanzkriterien.
- Farben und Farbrubriken. Sie bleiben unverändert. Die Schattenfarbe leitet sich aus den bestehenden Farbrubriken ab.
- Inhalte, Texte, Reihenfolge und Verhalten bestehender Elemente. Sie bleiben unverändert, es ändern sich nur Schrift, Schriftgröße, Abstände, Höhen und die genannten Cozy-Details.
- Eine Möglichkeit für den Nutzer, Schrift oder Schriftgröße in der App zu ändern (vgl. REQ-001 Themes).

## Qualitätsanforderungen

- Tippfläche jeder Pille und Schaltfläche mindestens 44 × 44 px (AK-9).
- Schrift ohne Internetverbindung verfügbar (AK-1).

## Abhängigkeiten

- **REQ-003 (Zentral definierte App-Schrift, Implementiert, nicht freigegeben):** Bleibt gültig: alle Texte in der App-Schrift, genau eine zentrale Stelle, generische Ersatzschrift am Ende. Dieser REQ legt die dort offengelassene endgültige Schrift fest (Fraunces). Die Randbedingungen in REQ-003 „Systemschrift des Geräts“ und „keine Schriftdatei“ gelten damit nicht mehr. REQ-003 sieht diesen Fall selbst vor („Änderung der Randbedingungen … wird mit dem CEO abgestimmt“). Die Abstimmung liegt vor. Kein `ersetzt`, da die AKs von REQ-003 erhalten bleiben. Hinweis in REQ-003 eingetragen.
- **Frühere REQs mit konkreten Größen (alle nicht freigegeben):** Wo ein bisheriger REQ einen konkreten Wert für Schriftgröße, Abstand oder Pillen- bzw. Schaltflächenhöhe nennt (z. B. Pillenhöhe 40 px), gilt ab diesem REQ die Stufe bzw. der Standardwert dieses REQ. Relative Vorgaben bleiben erhalten (z. B. REQ-028: Autor kleiner als der Titel, erfüllt durch Meta < Titel). Farben, Inhalte und Verhalten dieser REQs bleiben unverändert.
- **REQ-028 (Autor), REQ-048 (Stufentexte):** Erhalten zusätzlich Kursivschrift (AK-10).
- **REQ-002 (Hauptnavigation):** Navigationsbeschriftungen in Fraunces, Navigations-Icons kleiner. Alle übrigen Vorgaben bleiben.
- **CLAUDE.md „Farben auf Zuruf“:** Gilt analog für Schriftgrößen, Abstände und Höhen.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-18 | AK-1 und AK-3 an die Schriftwahl aus REQ-069 angepasst: Fraunces ist Standard ohne Nutzerwahl, und die Schriftliste ist die einzige Ausnahme von der zentralen Schrift (CEO: „Systemschrift wie bisher und dann erstmal nur Fraunces.“). Status unverändert | Anforderungsmanager |
| 2026-11-18 | Erstellt aus dem vom CEO angenommenen Vorschlag des Scrum Masters (Variante B, Fraunces). Status „Abgestimmt“, Priorität Should. Abstimmungsnachweis (CEO, wörtlich): „Plane die Änderung bitte für den nächsten Prototypen mir ein. Es soll Variante B - Fraunces werden. Danke für den Vorschlag!“ | Anforderungsmanager |
