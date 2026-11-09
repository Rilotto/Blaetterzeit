---
id: REQ-013
titel: Buchdetails – Aufruf, Kopfzeile und Rückweg
status: Entwurf
prioritaet: offen
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

Sprintziel Sprint 03: Das Feature „Buchdetails“ wird schrittweise erweitert. Teil 1 = Aufruf, Darstellung des Buches, Kamera, Galerie-Import, Zuschnitt.

Referenzbilder: [referenzen/REF-buchdetails-01.png](referenzen/REF-buchdetails-01.png) (relevant bis einschließlich des Buchtitels unter dem Buch) und [referenzen/REF-buchdetails-02-auswahlmenue.png](referenzen/REF-buchdetails-02-auswahlmenue.png). Aussehen und Lage von Zurück-Pfeil und drei Punkten orientieren sich daran; die optische Übereinstimmung prüft der CEO im Prototyp, sie ist kein Akzeptanzkriterium.

## Anforderung (Satzschablone)

**Aufruf**
- Wenn der Nutzer im Abschnitt „Noch zu lesen“ (REQ-009) das Cover eines Bucheintrags antippt, muss das System das Fenster „Buchdetails“ zu genau diesem Buch anzeigen.
- Wenn der Nutzer im Abschnitt „Noch zu lesen“ den Buchtitel eines Bucheintrags antippt, muss das System das Fenster „Buchdetails“ zu genau diesem Buch anzeigen.
- Während das Fenster „Buchdetails“ angezeigt wird, muss das System die Hauptnavigation (REQ-002) weiterhin anzeigen und den Menüpunkt „Bücher“ als aktiven Menüpunkt darstellen.

**Kopfzeile**
- Das System muss in den Buchdetails oben links einen dezenten Zurück-Pfeil darstellen.
- Das System muss in den Buchdetails oben rechts die Drei-Punkte-Schaltfläche („…“) darstellen.
- Das System darf in den Buchdetails keine Funktion „Kaufen“ darstellen.

**Rückweg**
- Wenn der Nutzer in den Buchdetails den Zurück-Pfeil antippt, muss das System die Seite „Bücher“ („Deine Bücher“, REQ-005) anzeigen.
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

## Abgrenzung (nicht Teil dieses REQ)

- Aufruf der Buchdetails aus weiteren Listen (CEO: „das fügen wir aber nachträglich mit ein, wenn es relevant wird“).
- „Kaufen“ (CEO: „nicht relevant“).
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

- Was soll beim Antippen der drei Punkte oben rechts passieren?
- In welcher Farbe sollen Zurück-Pfeil und drei Punkte erscheinen?
- Priorität.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-09 | Erstellt (Entwurf aus der CEO-Beschreibung „Buchdetails“ Teil 1) | Anforderungsmanager |
| 2026-11-09 | CEO-Antworten 1 und 2 eingearbeitet: Aufruf auch über den Titel (neu AK-3), Zurück-Pfeil und Rückweg über Reiter „Bücher“ (neu AK-6, AK-7), Kopfzeile mit drei Punkten ohne „Kaufen“ (neu AK-5). Titel angepasst. Offen: Funktion der drei Punkte, Farbe, Priorität | Anforderungsmanager |
