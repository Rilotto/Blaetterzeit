---
id: REQ-099
titel: Buchdetails – Zeile „Band n · Saga“ unter dem Autor, Übernahme von Reihe und Band aus dem Barcode-Scan
status: Implementiert
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **in den Buchdetails sehen, zu welcher Saga ein Buch gehört und welcher Band es ist**, damit **ich die Reihenfolge einer Buchreihe sofort erkenne**.

CEO (wörtlich, 2026-11-23): „Bandnummer ist ein super Hinweis!! Wo könnten wir das noch in den Buchdetails mit aufnehmen? Vielleicht unter dem Autor? So als "Band 1".“ Und: „Wenn der barcode eine Info über den Band mitliefert, übernehmen wir das bitte auch. Guter Vorschlag Claude!“

Vom CEO am 2026-11-23 bestätigtes Konzept, Punkt 6: Unter dem Autor steht „Band 1 · The Empyrean“, nur wenn das Buch in einer Saga ist. Bei mehreren Sagas steht je Saga eine Zeile. Ein Tipp öffnet die Saga. Liefert der Barcode-Scan eine Bandnummer bzw. Reihe, wird sie übernommen.

## Anforderung (Satzschablone)

**Anzeige**
- Wenn ein Buch in mindestens einer Saga ist, muss das System in den Buchdetails direkt unter der Autorzeile (REQ-028, REQ-094) je Saga eine Zeile „Band <n> · <Saga-Name>“ darstellen, zum Beispiel „Band 1 · The Empyrean“.
- Ohne Bandnummer zeigt die Zeile nur den Saga-Namen (**Auslegung**).
- Bei mehreren Sagas stehen die Zeilen A–Z nach Saga-Name (**Auslegung**: Reihenfolge nicht festgelegt).
- Ist das Buch in keiner Saga, entfällt die Zeile.
- Wenn der Nutzer eine solche Zeile antippt, muss das System die geöffnete Liste dieser Saga anzeigen (REQ-098).

**Barcode-Scan**
- Das System darf ein Buch aufgrund einer vom Barcode-Scan (REQ-062) gelieferten Reihe nicht automatisch einer Saga zuordnen und keine Saga automatisch anlegen. CEO (wörtlich, 2026-11-23): „nein, das ordne ich selbst immer zu“.
- Liefert der übernommene Treffer eine Bandnummer, muss das System sie beim Anlegen des Buches mit dem Buch speichern. Ordnet der Nutzer das Buch danach einer Saga zu (REQ-096, REQ-097), muss das Feld „Band“ dieser Saga damit vorausgefüllt sein. Der Nutzer kann den Wert vor dem Sichern ändern oder leeren. CEO (wörtlich, 2026-11-23): „ja soll schon im Feld "Band" stehen und übernommen werden“.
- Ist die gelieferte Angabe keine ganze Zahl ≥ 1 (Regel REQ-096), übernimmt das System sie nicht (**Auslegung**).

## Akzeptanzkriterien

### AK-1 Band und Saga unter dem Autor
- **Gegeben** ein Buch von Rebecca Yarros in der Saga „The Empyrean“ mit Band 1
- **Wenn** die Buchdetails angezeigt werden
- **Dann** steht direkt unter der Autorzeile „Band 1 · The Empyrean“

### AK-2 Mehrere Sagas
- **Gegeben** ein Buch in den Sagas „The Empyrean“ (Band 1) und „Crescent City“ (ohne Band)
- **Wenn** die Buchdetails angezeigt werden
- **Dann** stehen zwei Zeilen: „Crescent City“ und „Band 1 · The Empyrean“

### AK-3 Ohne Saga keine Zeile
- **Gegeben** ein Buch in keiner Saga
- **Wenn** die Buchdetails angezeigt werden
- **Dann** gibt es unter dem Autor keine Saga-Zeile

### AK-4 Antippen öffnet die Saga
- **Gegeben** die Zeile „Band 1 · The Empyrean“
- **Wenn** der Nutzer sie antippt
- **Dann** öffnet sich die Liste „The Empyrean“ (REQ-098)

### AK-6 Bandnummer aus dem Scan vorausgefüllt
- **Gegeben** ein über den Barcode-Scan angelegtes Buch, dessen Treffer Band 2 lieferte, in keiner Saga
- **Wenn** der Nutzer „+ Zu einer Saga hinzufügen“ antippt und „The Empyrean“ anhakt
- **Dann** steht im Feld „Band“ bereits 2
- **Und** nach „Sichern“ zeigen die Buchdetails „Band 2 · The Empyrean“

### AK-7 Keine automatische Saga-Zuordnung
- **Gegeben** ein Treffer des Barcode-Scans liefert die Reihe „The Empyrean“
- **Wenn** der Nutzer das Buch damit anlegt
- **Dann** ist das Buch in keiner Saga, und es wurde keine Saga angelegt

### AK-5 Änderungen wirken sofort
- **Gegeben** die Saga „The Empyrean“ wird in „Empyrean“ umbenannt bzw. die Bandnummer auf 2 geändert
- **Wenn** die Buchdetails wieder angezeigt werden
- **Dann** steht dort „Band 2 · Empyrean“

## Abgrenzung (nicht Teil dieses REQ)

- Saga-Fortschritt und „Weiter mit Band X“ (CEO hat beides abgelehnt).

## Qualitätsanforderungen

- Darstellung in allen Farbdesigns und Stilen (REQ-068, REQ-071).

## Abhängigkeiten

- **REQ-028 / REQ-094** (Autorzeile), **REQ-062** (Barcode-Übernahme erweitert), **REQ-095, REQ-096, REQ-098.**

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-23 | Erstellt aus dem vom CEO bestätigten Konzept, Entwurf | Anforderungsmanager |
| 2026-11-23 | CEO-Antwort 4 eingearbeitet: keine automatische Zuordnung zu einer Saga aus dem Barcode-Scan. Neu offen: Verbleib der gelieferten Bandnummer (Widerspruch zur früheren Aussage „übernehmen wir das bitte auch“). Status Entwurf | Anforderungsmanager |
| 2026-11-23 | CEO: „ja soll schon im Feld "Band" stehen und übernommen werden“. Bandnummer aus dem Scan wird gespeichert und bei der Saga-Zuordnung vorausgefüllt (AK-6, AK-7 neu). Keine offenen Fragen. Status Entwurf | Anforderungsmanager |
| 2026-11-23 | Vom CEO bestätigt (wörtlich): „okay, freigegeben. Starte mit dem nächsten Prototypen“. Status „Abgestimmt“ | Anforderungsmanager |
