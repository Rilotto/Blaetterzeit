---
id: REQ-067
titel: Fenster „Design“ – Blatt mit Umschaltpille „Farben / Schriftart“ und Live-Vorschau
status: Implementiert
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **ein kompaktes Fenster, in dem ich zwischen Farben und Schriftart umschalte und das Ergebnis sofort sehe**, damit **ich eine wachsende Sammlung von Designs und Schriften schnell vergleichen kann**.

CEO (2026-11-18, wörtlich): „Beim Klick auf Design wird ein neues Fenster geöffnet, welches oben wieder zwei Pillen hat: "Farben" & "Schriftart". […] Es soll alles recht kompakt dargestellt werden, da ich eine Sammlung von Designs und Schriftarten im laufe der Entwicklung erarbeiten möchte.“ Das Mockup ist vom CEO angenommen.

## Anforderung (Satzschablone)

- Das System muss das Fenster „Design“ als von unten eingeblendetes Blatt mit Ziehgriff, Titel „Design“ und X-Schaltfläche darstellen.
- Das System muss unter dem Kopf eine Live-Vorschau darstellen, nämlich eine Mini-Buchkarte im aktuell gewählten Farbdesign und in der aktuell gewählten Schrift.
- Das System muss eine Umschaltpille mit „Farben“ und „Schriftart“ darstellen. Sie funktioniert wie die Reiterleiste (REQ-043): Die aktive Pille wandert fließend zur angetippten.
- Beim Öffnen ist „Farben“ aktiv. Darunter zeigt das System bei „Farben“ die Liste der Farbdesigns (REQ-068) und bei „Schriftart“ die Liste der Schriften (REQ-069).
- Wenn der Nutzer X antippt oder das Blatt am Ziehgriff herunterzieht, muss das System das Fenster schließen. Die getroffene Wahl bleibt erhalten, denn es gibt kein „Sichern“.

## Akzeptanzkriterien

### AK-1 Aufbau des Blatts
- **Gegeben** die Seite „Profil“
- **Wenn** der Nutzer die Zeile „Design“ antippt
- **Dann** erscheint von unten ein Blatt mit Ziehgriff, Titel „Design“, X-Schaltfläche, Live-Vorschau und der Umschaltpille „Farben | Schriftart“
- **Und** „Farben“ ist aktiv, darunter steht die Liste der Farbdesigns

### AK-2 Umschalten
- **Gegeben** das Fenster „Design“ ist offen und „Farben“ ist aktiv
- **Wenn** der Nutzer „Schriftart“ antippt
- **Dann** wird „Schriftart“ aktiv und die Liste der Schriften erscheint anstelle der Liste der Farbdesigns
- **Und** erneutes Antippen von „Farben“ zeigt wieder die Liste der Farbdesigns

### AK-3 Live-Vorschau folgt der Wahl
- **Gegeben** das Fenster „Design“ ist offen
- **Wenn** der Nutzer ein anderes Farbdesign oder eine andere Schrift antippt
- **Dann** zeigt die Mini-Buchkarte sofort das neue Farbdesign bzw. die neue Schrift

### AK-4 Schließen ohne Verlust der Wahl
- **Gegeben** der Nutzer hat im Fenster „Design“ eine Wahl getroffen
- **Wenn** er das Fenster über X oder Herunterziehen am Ziehgriff schließt
- **Dann** ist das Fenster geschlossen, die Seite „Profil“ ist sichtbar und die getroffene Wahl bleibt aktiv

## Abgrenzung (nicht Teil dieses REQ)

- Inhalt und Verhalten der Listen (REQ-068, REQ-069).
- Ein Editor für eigene Designs oder Schriften.

## Qualitätsanforderungen

- Kompakte Darstellung (CEO-Wunsch), umgesetzt über die Stufen und Abstände aus REQ-065. Es gibt keinen eigenen Messwert.

## Abhängigkeiten

- REQ-043 (Mechanik der Reiterleiste), REQ-066, REQ-068, REQ-069.

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-18 | Erstellt aus der CEO-Anforderung und dem angenommenen Mockup. Status „Abgestimmt“ | Anforderungsmanager |
