---
id: REQ-032
titel: Manueller Eintrag – Cover über Kamera oder Galerie hinzufügen
status: Entwurf
prioritaet: offen
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **beim manuellen Eintrag ein Cover per Kamera oder aus der Galerie hinzufügen**, damit **das neue Buch gleich mit Cover angelegt wird**.

Vorgabe des CEO (wörtlich, 2026-11-10): „Ein Klick auf 'Cover hinzufügen' öffnet wieder das Menü mit der Möglichkeit von Bildimporten per Kamera oder Galerie.“

## Anforderung (Satzschablone)

- Wenn der Nutzer im Blatt „Manueller Eintrag“ das Feld „Cover hinzufügen“ antippt, muss das System das bestehende Auswahlmenü (REQ-015) anzeigen.
- Wenn der Nutzer dort „Scannen“ oder „Aus Galerie auswählen“ wählt, muss das System Kameraansicht bzw. Galerie (REQ-016) und danach den Zuschnitt (REQ-017) genauso wie in den Buchdetails anbieten.
- Wenn der Nutzer den Zuschnitt bestätigt, muss das System das zugeschnittene Bild im Feld „Cover hinzufügen“ anzeigen und für das anzulegende Buch vormerken.
- Wenn der Nutzer Kameraansicht, Galerie oder Zuschnitt ohne Bestätigung verlässt, muss das System zum Blatt „Manueller Eintrag“ zurückkehren, ohne bereits eingetragene Angaben zu verändern.

## Akzeptanzkriterien

### AK-1 Antippen öffnet das Auswahlmenü
- **Gegeben** das Blatt „Manueller Eintrag“ ist geöffnet
- **Wenn** der Nutzer „Cover hinzufügen“ antippt
- **Dann** erscheint das Auswahlmenü mit „Scannen“ und „Aus Galerie auswählen“

### AK-2 Bild erscheint im Feld
- **Gegeben** der Nutzer hat über „Aus Galerie auswählen“ ein Bild gewählt
- **Wenn** er den Zuschnitt bestätigt
- **Dann** ist das Blatt „Manueller Eintrag“ wieder sichtbar
- **Und** im Feld „Cover hinzufügen“ wird das zugeschnittene Bild angezeigt

### AK-3 Eingaben bleiben erhalten
- **Gegeben** Titel und Autor sind eingetragen
- **Wenn** der Nutzer ein Cover hinzufügt oder den Vorgang ohne Bestätigung abbricht
- **Dann** sind Titel und Autor unverändert eingetragen

## Abgrenzung (nicht Teil dieses REQ)

- Kamera-, Galerie- und Zuschnitt-Technik selbst (REQ-016, REQ-017).
- Speichern des Buches (REQ-031).

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-015, REQ-016, REQ-017** (wiederverwendet), **REQ-019** (Speicherung), **REQ-020** (Frontcover in Buchlisten), **REQ-030**, **REQ-031**.

## Offene Fragen

- F6: Genau das bestehende Auswahlmenü (auch „Cover online suchen“ und bei vorhandenem Bild „Foto entfernen“) oder nur Kamera und Galerie? Wo soll das Bild nach dem Anlegen erscheinen (Bereich „Cover“ der Buchdetails, Buchlisten)? Welches Startformat hat der Zuschnitt?
- F7: Farbzuordnung des Felds „Cover hinzufügen“ und Priorität.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-10 | Erstellt (Entwurf aus der CEO-Vorgabe „Cover hinzufügen“) | Anforderungsmanager |
