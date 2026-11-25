---
id: REQ-109
titel: Automatischer Zuschnitt von Cover, Rücken und Schnitt auf das Seitenverhältnis des Buches
status: In Umsetzung
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **dass Cover-Bilder genau zum Seitenverhältnis meines Buches passen**, damit **das Cover in den Buchdetails nicht abgeschnitten wirkt**.

Fehlerbild (CEO 2026-11-25): Cover werden in den Buchdetails abgeschnitten, weil Bilder, deren Seitenverhältnis nicht zu den Buchmaßen passt, randlos eingepasst werden (REQ-073). Vorgabe: Online-Cover werden beim Übernehmen einmal automatisch auf das Seitenverhältnis des Buches zugeschnitten. Ändert der Nutzer später Format oder Maße, wird das gespeicherte Cover automatisch neu zugeschnitten. Dem CEO wurde gesagt, dass Abgeschnittenes dann verloren ist; er wählte trotzdem „automatisch neu zuschneiden“.

## Anforderung (Satzschablone)

**Maßgebliches Seitenverhältnis**
- Maßgeblich sind die Proportionen nach REQ-073 aus den hinterlegten Maßen bzw. den Standardmaßen nach REQ-077: Cover = Breite : Höhe, Buchrücken und Schnitt = Dicke : Höhe.

**Online-Cover beim Übernehmen**
- Wenn das System ein Coverfoto aus einer Online-Quelle übernimmt (Barcode-Scan, REQ-062; „Online suchen“, REQ-111), muss es das Bild einmal automatisch auf das Cover-Seitenverhältnis des Buches zuschneiden, das sich aus den Angaben des Treffers (Maße, sonst Format und Standardmaße) ergibt.
- Das System muss mittig zuschneiden: Vom Bild bleibt der größtmögliche mittige Ausschnitt im Zielseitenverhältnis erhalten; überstehende Ränder werden gleichmäßig auf beiden Seiten entfernt (**Auslegung**).
- Das System darf das Bild dabei nicht verzerren und keine Ränder hinzufügen.

**Neu zuschneiden nach Änderung**
- Wenn sich durch eine gesicherte Änderung von Format, Maßen oder Seitenzahl das maßgebliche Seitenverhältnis eines Bereichs eines Buches ändert, muss das System das dort gespeicherte Bild automatisch mittig auf das neue Seitenverhältnis zuschneiden und das Ergebnis anstelle des bisherigen Bildes speichern. Das gilt auch im Blatt „Manueller Eintrag“ vor „Hinzufügen“.
  - Gilt für Cover, Buchrücken und Schnitt gleichermaßen, unabhängig davon, ob das Bild online übernommen oder vom Nutzer aufgenommen wurde (**Auslegung**).
  - Seitenzahl zählt mit, weil sie ohne hinterlegte Dicke die geschätzte Dicke und damit Rücken und Schnitt bestimmt (**Auslegung**).
- Abgeschnittene Bildteile sind danach verloren; ein späteres Zurückändern der Maße stellt sie nicht wieder her (CEO-Entscheidung).
- Bilder, die vor Einführung dieses REQ gespeichert wurden, schneidet das System erst bei der nächsten solchen Änderung zu (**Auslegung**: keine Änderung gespeicherter Daten ohne Aktion des Nutzers).

## Akzeptanzkriterien

### AK-1 Online-Cover wird beim Übernehmen zugeschnitten
- **Gegeben** ein Treffer ohne Maße mit Format „Print · Taschenbuch“ und einem Coverfoto von 600 × 600 Pixel
- **Wenn** der Nutzer den Treffer übernimmt
- **Dann** hat das eingetragene Cover das Seitenverhältnis 13,8 : 21,8 (Standardmaße nach REQ-077)
- **Und** es ist der mittige Ausschnitt des Fotos in voller Höhe, links und rechts gleich viel entfernt, unverzerrt

### AK-2 Passendes Bild bleibt unverändert
- **Gegeben** ein Coverfoto, dessen Seitenverhältnis bereits dem Cover-Seitenverhältnis des Buches entspricht
- **Wenn** es übernommen wird
- **Dann** wird nichts abgeschnitten

### AK-3 Cover passt in den Buchdetails ohne Beschnitt
- **Gegeben** ein Buch, dessen Cover nach AK-1 übernommen wurde
- **Wenn** seine Buchdetails angezeigt werden
- **Dann** ist das gesamte gespeicherte Cover-Bild sichtbar, ohne dass beim Einpassen Teile abgeschnitten werden

### AK-4 Formatwechsel schneidet das Cover neu zu
- **Gegeben** ein Buch ohne Maße mit „Print · Taschenbuch“ und gespeichertem Cover im Seitenverhältnis 13,8 : 21,8
- **Wenn** der Nutzer das Format auf „Print · Kleinformat“ ändert und sichert
- **Dann** ist das gespeicherte Cover mittig auf 10,5 : 14,8 zugeschnitten

### AK-5 Maßänderung schneidet Rücken und Schnitt neu zu
- **Gegeben** ein Buch mit Maßen 12 × 18 × 2 und gespeicherten Bildern für Cover, Rücken und Schnitt in diesen Proportionen
- **Wenn** der Nutzer die Dicke auf 4 ändert und sichert
- **Dann** sind Rücken und Schnitt mittig auf 4 : 18 zugeschnitten gespeichert
- **Und** das Cover ist unverändert, weil sich Breite : Höhe nicht geändert hat

### AK-6 Zurückändern stellt nichts wieder her
- **Gegeben** das Buch aus AK-4 nach dem Zuschnitt
- **Wenn** der Nutzer das Format wieder auf „Print · Taschenbuch“ ändert und sichert
- **Dann** wird das gespeicherte (bereits beschnittene) Cover mittig auf 13,8 : 21,8 zugeschnitten; die beim ersten Zuschnitt entfernten Teile sind nicht wieder enthalten

### AK-7 Änderung im Manuellen Eintrag
- **Gegeben** im Blatt „Manueller Eintrag“ ist ein übernommenes Online-Cover eingetragen (Taschenbuch, ohne Maße)
- **Wenn** der Nutzer das Format auf „Print · Hardcover“ ändert und mit „Hinzufügen“ anlegt
- **Dann** hat das gespeicherte Cover das Seitenverhältnis 14,8 : 21,0

## Abgrenzung (nicht Teil dieses REQ)

- Manueller Zuschnitt beim Aufnehmen/Auswählen eines Bildes (REQ-017, Startrahmen nach REQ-073).
- Proportionen in Buchlisten und Cover-Platzhaltern (REQ-009, REQ-010, REQ-020).
- Nachträglicher Zuschnitt bestehender Bilder ohne Änderung durch den Nutzer.
- Konkrete Standardmaße (REQ-077; in den AKs mit den aktuellen Werten).

## Qualitätsanforderungen

- Unverzerrte Darstellung (AK-1).

## Abhängigkeiten

- REQ-062 (Barcode-Übernahme), REQ-111 („Online suchen“), REQ-072 (Maße), REQ-058 (Format), REQ-025 (Seitenzahl), REQ-073 (Proportionen, Einpassen), REQ-077 (Standardmaße), REQ-030/REQ-060 (Manueller Eintrag).

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-25 | Erstellt. Inhalte vom CEO am 2026-11-25 im Chat festgelegt, Umsetzung beauftragt. Auslegungen markiert. Status „Abgestimmt“ | Anforderungsmanager |
