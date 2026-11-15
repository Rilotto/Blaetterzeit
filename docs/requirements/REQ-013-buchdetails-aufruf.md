---
id: REQ-013
titel: Buchdetails – Aufruf, Kopfzeile und Rückweg
status: Implementiert
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **durch Antippen eines Buches dessen Buchdetails öffnen und von dort wieder zurückkehren**, damit **ich das Buch dort ansehen und gestalten kann**.

Vorgabe des CEO (wörtlich, Auszug, 2026-11-09): „Wenn ich auf ein Buch klicke (z.B. auf ein Cover aus dem Abschnitt "noch zu lesen"), wird das neue Fenster wie im Screenshot aufgerufen. Es läuft nach wie vor im Reiter "Bücher".“

Antworten des CEO (wörtlich, 2026-11-09):
- „Ein Klick auf das Cover und den Titel. Später auch noch aus diversen Listen, das fügen wir aber nachträglich mit ein, wenn es relevant wird. Zurück komme ich auf die Seite, indem ich auf den dezenten Pfeil oben links klicke. Setze diesen bitte auch mit um (siehe Screenshots). Wenn ich aus der Buchdetailansicht auf den Reiter Bücher klicke, komme ich zurück auf die Bücher-Hauptseite 'Deine Bücher'.“
- „Wir setzen nur den Zurück-Pfeil und die drei Punkte oben rechts um. Kaufen ist für mich nicht relevant.“
- Funktion der drei Punkte: „erstmal nichts“.
- Farbe von Zurück-Pfeil und drei Punkten: „dunkelbraun wie 'Deine Bücher'“. Maßgeblich ist „wie 'Deine Bücher'“, also die Farbrubrik „Tertiär“ (REQ-005), nicht die Farbrubrik „Dunkelbraun“ (REQ-009); so dem CEO vom Scrum Master erläutert.

Sprintziel Sprint 03: Das Feature „Buchdetails“ wird schrittweise erweitert. Teil 1 = Aufruf, Darstellung des Buches, Kamera, Galerie-Import, Zuschnitt.

Referenzbilder: [referenzen/REF-buchdetails-01.png](referenzen/REF-buchdetails-01.png) (relevant bis einschließlich des Buchtitels unter dem Buch) und [referenzen/REF-buchdetails-02-auswahlmenue.png](referenzen/REF-buchdetails-02-auswahlmenue.png). Aussehen und Lage von Zurück-Pfeil und drei Punkten orientieren sich daran; die optische Übereinstimmung prüft der CEO im Prototyp, sie ist kein Akzeptanzkriterium.

## Anforderung (Satzschablone)

**Aufruf**
- Wenn der Nutzer im Abschnitt „Noch zu lesen“ (REQ-009) das Cover eines Bucheintrags antippt, muss das System das Fenster „Buchdetails“ zu genau diesem Buch anzeigen.
- Wenn der Nutzer im Abschnitt „Noch zu lesen“ den Buchtitel eines Bucheintrags antippt, muss das System das Fenster „Buchdetails“ zu genau diesem Buch anzeigen.
- Dasselbe gilt für Cover und Titel im Abschnitt „Alle Bücher“ (REQ-035) und in den Übersichten (REQ-036).
- Während das Fenster „Buchdetails“ angezeigt wird, muss das System die Hauptnavigation (REQ-002) weiterhin anzeigen und den Menüpunkt „Bücher“ als aktiven Menüpunkt darstellen.

**Kopfzeile**
- Das System muss in den Buchdetails oben links einen dezenten Zurück-Pfeil darstellen.
- Das System muss in den Buchdetails oben rechts die Drei-Punkte-Schaltfläche („…“) darstellen.
- Das System darf in den Buchdetails keine Funktion „Kaufen“ darstellen.
- Wenn der Nutzer die Drei-Punkte-Schaltfläche antippt, darf das System nichts verändern (CEO: „erstmal nichts“).
- Das System muss den Zurück-Pfeil und die Drei-Punkte-Schaltfläche in der Farbrolle „Kopfzeilen-Symbolfarbe“ darstellen, die ihren Wert aus der Farbrubrik „Tertiär“ bezieht (CEO: „wie 'Deine Bücher'“, REQ-005). Dies gilt auch für den Zurück-Pfeil in der Kameraansicht (REQ-016) und im Zuschnitt-Fenster (REQ-017). Konkrete Farbwerte sind kein Akzeptanzkriterium.

**Rückweg**
- Wenn der Nutzer in den Buchdetails den Zurück-Pfeil antippt, muss das System die Seite „Bücher“ („Deine Bücher“, REQ-005) anzeigen. Ausnahme: Wurden die Buchdetails aus einer Übersicht (REQ-036, REQ-040) geöffnet, muss das System wieder diese Übersicht anzeigen (CEO 2026-11-12: „der Zurückpfeil in den Buchdetails geht dann aber zurück auf die Übersichtsliste davor“).
- Wenn der Nutzer in den Buchdetails den Menüpunkt „Bücher“ der Hauptnavigation antippt, muss das System die Seite „Bücher“ („Deine Bücher“) anzeigen.

## Akzeptanzkriterien

### AK-1 Antippen des Covers öffnet die Buchdetails
- **Gegeben** die Seite „Bücher“ zeigt im Abschnitt „Noch zu lesen“ mehrere Bücher
- **Wenn** der Nutzer das Cover eines dieser Bücher antippt
- **Dann** wird das Fenster „Buchdetails“ angezeigt
- **Und** es zeigt den Buchtitel genau dieses Buches (REQ-018)

### AK-2 Auch Bücher ohne Buchcover
- **Gegeben** ein Buch ohne Buchcover, dargestellt mit dem Cover-Platzhalter (REQ-010)
- **Wenn** der Nutzer den Cover-Platzhalter antippt
- **Dann** wird das Fenster „Buchdetails“ zu diesem Buch angezeigt

### AK-3 Antippen des Titels öffnet die Buchdetails
- **Gegeben** die Seite „Bücher“ zeigt im Abschnitt „Noch zu lesen“ mehrere Bücher
- **Wenn** der Nutzer den Buchtitel unter einem dieser Cover antippt
- **Dann** wird das Fenster „Buchdetails“ zu genau diesem Buch angezeigt

### AK-4 Reiter „Bücher“ bleibt aktiv
- **Gegeben** das Fenster „Buchdetails“ wird angezeigt
- **Wenn** die Hauptnavigation betrachtet wird
- **Dann** ist sie sichtbar
- **Und** „Bücher“ ist der aktive Menüpunkt

### AK-5 Kopfzeile: Zurück-Pfeil und drei Punkte, kein „Kaufen“
- **Gegeben** das Fenster „Buchdetails“ wird angezeigt
- **Wenn** der obere Rand betrachtet wird
- **Dann** steht oben links ein Zurück-Pfeil
- **Und** oben rechts die Drei-Punkte-Schaltfläche
- **Und** es gibt keine Funktion „Kaufen“

### AK-6 Zurück-Pfeil führt zur Seite „Bücher“
- **Gegeben** das Fenster „Buchdetails“ wurde aus dem Abschnitt „Noch zu lesen“ geöffnet
- **Wenn** der Nutzer den Zurück-Pfeil antippt
- **Dann** wird die Seite „Bücher“ mit der Überschrift „Deine Bücher“ angezeigt
- **Und** das Fenster „Buchdetails“ ist nicht mehr zu sehen

### AK-7 Reiter „Bücher“ führt zur Seite „Bücher“
- **Gegeben** das Fenster „Buchdetails“ wird angezeigt
- **Wenn** der Nutzer in der Hauptnavigation „Bücher“ antippt
- **Dann** wird die Seite „Bücher“ mit der Überschrift „Deine Bücher“ angezeigt

### AK-8 Drei Punkte ohne Funktion
- **Gegeben** das Fenster „Buchdetails“ wird angezeigt
- **Wenn** der Nutzer die Drei-Punkte-Schaltfläche antippt
- **Dann** wird weiterhin das Fenster „Buchdetails“ desselben Buches angezeigt
- **Und** es öffnet sich kein Menü und kein weiteres Fenster

### AK-9 Zurück-Pfeil und drei Punkte in Tertiär
- **Gegeben** das Fenster „Buchdetails“ wird angezeigt
- **Wenn** Zurück-Pfeil und Drei-Punkte-Schaltfläche betrachtet werden
- **Dann** sind beide in der Farbe der Farbrubrik „Tertiär“ dargestellt (dieselbe wie „Deine Bücher“, REQ-005)

### AK-10 Farbe aus zentraler Farbrubrik
- **Gegeben** der Wert der Farbrubrik „Tertiär“ wird an der zentralen Stelle geändert
- **Wenn** die Buchdetails angezeigt werden
- **Dann** sind Zurück-Pfeil und Drei-Punkte-Schaltfläche im geänderten Wert dargestellt

### AK-11 Zurück-Pfeil führt in die Übersicht zurück
- **Gegeben** das Fenster „Buchdetails“ wurde aus einer Übersicht (REQ-036, REQ-040) geöffnet
- **Wenn** der Nutzer den Zurück-Pfeil antippt
- **Dann** wird wieder diese Übersicht angezeigt

## Abgrenzung (nicht Teil dieses REQ)

- Aufruf der Buchdetails aus den Übersichten (REQ-036). Aufruf aus weiteren Listen (CEO: „das fügen wir aber nachträglich mit ein, wenn es relevant wird“).
- „Kaufen“ (CEO: „nicht relevant“).
- Funktion der Drei-Punkte-Schaltfläche (CEO: „erstmal nichts“).
- Inhalt des Fensters (REQ-014 bis REQ-018).
- Bereiche des Referenzbilds unterhalb des Buchtitels (Lesestatus, Fortschritt, Statistik, Zitat).

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-002:** Hauptnavigation, aktiver Menüpunkt.
- **REQ-005:** Seite „Bücher“ mit Überschrift „Deine Bücher“.
- **REQ-006:** Bei jedem Aufruf der Seite „Bücher“ ist der Filter „Für dich“ aktiv – gilt damit auch bei der Rückkehr aus den Buchdetails.
- **REQ-009:** Bucheintrag im Abschnitt „Noch zu lesen“ (dort war das Antippen eines Bucheintrags bisher ausgegrenzt; dieser REQ ergänzt es).
- **REQ-010:** Cover-Platzhalter.
- **REQ-016, REQ-017:** Derselbe Zurück-Pfeil erscheint in der Kameraansicht und im Zuschnitt.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-09 | Erstellt (Entwurf aus der CEO-Beschreibung „Buchdetails“ Teil 1) | Anforderungsmanager |
| 2026-11-09 | CEO-Antworten 1 und 2 eingearbeitet: Aufruf auch über den Titel (neu AK-3), Zurück-Pfeil und Rückweg über Reiter „Bücher“ (neu AK-6, AK-7), Kopfzeile mit drei Punkten ohne „Kaufen“ (neu AK-5). Titel angepasst. Offen: Funktion der drei Punkte, Farbe, Priorität | Anforderungsmanager |
| 2026-11-09 | CEO-Antworten eingearbeitet: drei Punkte ohne Funktion (neu AK-8), Zurück-Pfeil und drei Punkte in Tertiär wie „Deine Bücher“, auch in Kameraansicht und Zuschnitt (neu AK-9, AK-10), Priorität Must. Status „Abgestimmt“ (CEO 2026-11-09) | Anforderungsmanager |
| 2026-11-12 | CEO-Antwort F7 zu REQ-036 („der Zurückpfeil in den Buchdetails geht dann aber zurück auf die Übersichtsliste davor“): Ausnahme im Rückweg, neu AK-11. REQ nicht eingefroren; Statuswechsel durch den Scrum Master | Anforderungsmanager |
| 2026-11-12 | CEO-Antwort Runde 3, F3: Aufruf auch aus Abschnitt „Alle Bücher“ (Rückweg zur Seite „Bücher“) | Anforderungsmanager |
