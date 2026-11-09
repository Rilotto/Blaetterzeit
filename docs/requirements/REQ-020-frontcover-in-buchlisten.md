---
id: REQ-020
titel: Frontcover aus den Buchdetails ersetzt den Cover-Platzhalter in allen Buchlisten
status: Abgestimmt
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich, **dass ein in den Buchdetails hinzugefügtes Cover überall dort erscheint, wo das Buch bisher mit dem Platzhalter dargestellt wurde**, damit **ich mein Buch überall an seinem Cover erkenne**.

Antwort des CEO (wörtlich, Auszug, 2026-11-09): „Wenn ich ein Cover in den Buchdetails hinzufüge, sollen alle verwendeten Platzhalter für dieses Buch überschrieben werden und das Cover (Frontcover) erscheint dort.“

## Anforderung (Satzschablone)

- Das System muss das im Bereich „Cover“ der Buchdetails hinterlegte Bild (Frontcover, REQ-017) als Buchcover des Buches (REQ-008) führen.
- Wenn für ein Buch ein Frontcover hinterlegt ist, muss das System in allen Buchlisten an Stelle des Cover-Platzhalters (REQ-010) dieses Frontcover darstellen (derzeit: Abschnitt „Noch zu lesen“, REQ-009).
- Das System muss das Frontcover dort nach den Regeln für Buchcover aus REQ-009 darstellen (einheitliche Größe, nicht verzerrt).
- Das System darf Bilder der Bereiche „Buchrücken“ und „Schnitt“ nicht als Buchcover in Buchlisten darstellen (CEO: „das Cover (Frontcover)“).
- Wenn das Frontcover über „Foto entfernen“ (REQ-015) gelöscht wird, muss das System in den Buchlisten wieder den Cover-Platzhalter (REQ-010) darstellen.

## Akzeptanzkriterien

### AK-1 Frontcover statt Herz-Platzhalter
- **Gegeben** ein Buch mit Lesestatus *ungelesen*, bisher ohne Buchcover, im Abschnitt „Noch zu lesen“ mit dem Cover-Platzhalter dargestellt
- **Wenn** der Nutzer in dessen Buchdetails ein Bild im Bereich „Cover“ hinterlegt und zur Seite „Bücher“ zurückkehrt
- **Dann** zeigt der Bucheintrag dieses Buches das Frontcover
- **Und** kein Herz-Icon

### AK-2 Nur dieses Buch betroffen
- **Gegeben** mehrere Bücher ohne Buchcover im Abschnitt „Noch zu lesen“
- **Wenn** für eines davon ein Frontcover hinterlegt wird
- **Dann** zeigen die übrigen Bücher weiterhin den Cover-Platzhalter

### AK-3 Buchrücken und Schnitt erscheinen nicht in Listen
- **Gegeben** ein Buch ohne Frontcover, aber mit Bildern für „Buchrücken“ und „Schnitt“
- **Wenn** die Seite „Bücher“ angezeigt wird
- **Dann** zeigt sein Bucheintrag den Cover-Platzhalter

### AK-4 Entferntes Frontcover: wieder Platzhalter
- **Gegeben** ein Buch mit Frontcover in der Buchliste
- **Wenn** der Nutzer das Frontcover in den Buchdetails über „Foto entfernen“ löscht und zur Seite „Bücher“ zurückkehrt
- **Dann** zeigt sein Bucheintrag wieder den Cover-Platzhalter (REQ-010)

## Abgrenzung (nicht Teil dieses REQ)

- Die Platzhalter der Abschnitte „Sagas“ und „Sammlungen“ (REQ-012) gehören zu keinem Buch und bleiben unverändert.
- Weitere Buchlisten, die es noch nicht gibt; sie übernehmen diese Regel, sobald sie entstehen.

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-008:** Buchcover optional. **REQ-009:** Darstellung von Buchcovern in der Buchliste. **REQ-010:** gilt unverändert weiter für Bücher ohne Frontcover.
- **REQ-015, REQ-017, REQ-019:** Hinterlegen, Entfernen, dauerhafte Speicherung.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-09 | Erstellt aus CEO-Antwort 6 (Sprint 03) | Anforderungsmanager |
| 2026-11-09 | Priorität Must (CEO). Status „Abgestimmt“ (CEO 2026-11-09) | Anforderungsmanager |
