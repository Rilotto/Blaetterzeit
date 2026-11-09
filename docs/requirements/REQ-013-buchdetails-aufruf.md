---
id: REQ-013
titel: Buchdetails – Aufruf durch Antippen eines Buches
status: Entwurf
prioritaet: offen
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **durch Antippen eines Buches dessen Buchdetails öffnen**, damit **ich das Buch dort ansehen und gestalten kann**.

Vorgabe des CEO (wörtlich, Auszug, 2026-11-09): „Wenn ich auf ein Buch klicke (z.B. auf ein Cover aus dem Abschnitt "noch zu lesen"), wird das neue Fenster wie im Screenshot aufgerufen. Es läuft nach wie vor im Reiter "Bücher".“

Sprintziel Sprint 03: Das Feature „Buchdetails“ wird schrittweise erweitert. Teil 1 = Aufruf, Darstellung des Buches, Kamera, Galerie-Import, Zuschnitt.

Referenzbild: [referenzen/REF-buchdetails-01.png](referenzen/REF-buchdetails-01.png). Relevant ist nur der Bereich bis einschließlich des Buchtitels unter dem Buch. Die optische Übereinstimmung prüft der CEO im Prototyp; sie ist kein Akzeptanzkriterium.

## Anforderung (Satzschablone)

- Wenn der Nutzer im Abschnitt „Noch zu lesen“ (REQ-009) das Cover eines Bucheintrags antippt, muss das System das Fenster „Buchdetails“ zu genau diesem Buch anzeigen.
- Während das Fenster „Buchdetails“ angezeigt wird, muss das System den Menüpunkt „Bücher“ als aktiven Menüpunkt der Hauptnavigation (REQ-002) darstellen.
- Während das Fenster „Buchdetails“ angezeigt wird, muss das System die Hauptnavigation weiterhin anzeigen.

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

### AK-3 Reiter „Bücher“ bleibt aktiv
- **Gegeben** das Fenster „Buchdetails“ wird angezeigt
- **Wenn** die Hauptnavigation betrachtet wird
- **Dann** ist sie sichtbar
- **Und** „Bücher“ ist der aktive Menüpunkt

## Abgrenzung (nicht Teil dieses REQ)

- Inhalt des Fensters (REQ-014 bis REQ-018).
- Bereiche des Referenzbilds unterhalb des Buchtitels (Lesestatus, Fortschritt, Statistik, Zitat).
- Kopfzeile des Referenzbilds (Zurück-Pfeil, „Kaufen“, „…“): siehe Offene Fragen.

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-002:** Hauptnavigation, aktiver Menüpunkt.
- **REQ-009:** Bucheintrag im Abschnitt „Noch zu lesen“ (dort war das Antippen eines Bucheintrags bisher ausgegrenzt).
- **REQ-010:** Cover-Platzhalter.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

- Was genau soll man antippen können, um die Buchdetails zu öffnen (nur das Cover oder auch den Titel darunter), und von welchen weiteren Stellen der App aus?
- Kopfzeile im Referenzbild (Zurück-Pfeil, „Kaufen“, „…“): Was davon gehört zu Teil 1?
- Wie kommt der Nutzer aus den Buchdetails zurück zur Seite „Bücher“? Was soll passieren, wenn er in den Buchdetails auf den Reiter „Bücher“ tippt?
- Priorität.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-09 | Erstellt (Entwurf aus der CEO-Beschreibung „Buchdetails“ Teil 1) | Anforderungsmanager |
