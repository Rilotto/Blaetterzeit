---
id: REQ-072
titel: Karte „Ausgabe“ – Zeile „Maße“ (Breite × Höhe × Dicke) mit Blatt „Maße“
status: Implementiert
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **Breite, Höhe und Dicke meines Buches erfassen, von Hand oder automatisch beim Barcode-Scan**, damit **die Ausgabe vollständig beschrieben ist und die Buchdarstellung die echten Proportionen zeigen kann (REQ-073)**.

CEO (2026-11-18, wörtlich): „Ich möchte eine neue Zeile im Menü "Ausgabe" bei den Büchern eingeben unterhalb von Format. Die neue Zeile soll lauten: Maße. Hier sollen Breite, Höhe und Dicke des Buches eingetragen werden können und auch automatisch eingetragen werden, wenn die Daten beim Scan des Barcodes vorliegen.“ Zum Vorschlag des Scrum Masters: „passt mit einer Nachkommastelle“, Bestätigung: „B passt für mich. Konzept 1 auch.“

## Anforderung (Satzschablone)

**Daten**
- Das System muss je Buch optional Breite, Höhe und Dicke in Zentimetern mit höchstens einer Nachkommastelle dauerhaft über die Repository-Schnittstelle (ADR-0002) speichern. Jeder Wert ist einzeln optional.

**Zeile „Maße“**
- Das System muss in der Karte „Ausgabe“ (REQ-056) direkt unter der Zeile „Format“ die Zeile „Maße“ darstellen.
- Das System muss die Zeile „Maße“ rechts mit einem Pfeil „›“ darstellen, wie die Zeile „Preis“ (REQ-056).
- Sind Werte hinterlegt, muss die Zeile sie als „Breite × Höhe × Dicke cm“ mit genau einer Nachkommastelle und Komma zeigen, z. B. „13,5 × 21,0 × 3,2 cm“. Fehlt ein Einzelwert, muss die Zeile dafür den Standardwert nach REQ-077 einsetzen (nicht gespeichert) und dann wie beim Vorschlag ein vorangestelltes „ca.“ zeigen, abgeschwächt bzw. kursiv, z. B. „ca. 14,8 × 24,0 × 2,8 cm“ bei einem Hardcover mit 400 Seiten und nur hinterlegter Höhe (**Auslegung** aus REQ-077 „Fehlt nur ein Einzelwert, gilt dafür der Standardwert“, CEO 2026-11-25). Ohne „ca.“ und nicht abgeschwächt erscheint die Zeile nur, wenn alle drei Werte hinterlegt sind.
- Ist kein Wert hinterlegt, muss die Zeile die geschätzten Standardmaße (REQ-077) als Vorschlag zeigen, mit vorangestelltem „ca.“ und abgeschwächt bzw. kursiv, z. B. „ca. 13,8 × 21,8 × 2,4 cm“. Ändert sich das Format oder die Seitenzahl, passen sich die Schätzwerte an.
- Das System darf Schätzwerte nie selbsttätig speichern; sie werden erst durch „Sichern“ im Blatt „Maße“ zu hinterlegten Werten.

**Blatt „Maße“**
- Wenn der Nutzer die Zeile „Maße“ antippt, muss das System das Blatt „Maße“ von unten einblenden, mit Ziehgriff, Titel „Maße“ und X-Schaltfläche.
- Das Blatt muss drei Eingabefelder nebeneinander in der Reihenfolge Breite × Höhe × Dicke enthalten, je mit Label in Großbuchstaben, dazu den Hinweis „in Zentimetern“ und die Pille „Sichern“. Vorhandene Werte sind vorbefüllt; ist kein Wert hinterlegt, sind die drei Felder mit den geschätzten Standardmaßen (REQ-077) vorbefüllt. Sind nur einzelne Werte hinterlegt, sind nur diese vorbefüllt und die übrigen Felder leer, damit „Sichern“ keine Schätzwerte unbemerkt speichert (**Auslegung**, unverändertes Verhalten).
- Das System muss eine Zahlentastatur mit Komma anbieten. Als Dezimaltrennzeichen sind Komma und Punkt erlaubt.
- Ein Feld ist gültig, wenn es leer ist oder eine Zahl größer 0 mit höchstens einer Nachkommastelle enthält. Ungültig sind 0, negative Werte, Buchstaben und mehr als eine Nachkommastelle.
- Wenn der Nutzer „Sichern“ antippt und alle Felder gültig sind, muss das System die Werte dauerhaft speichern (leeres Feld = kein Wert) und das Blatt schließen.
- Wenn der Nutzer „Sichern“ antippt und mindestens ein Feld ungültig ist, muss das System jedes ungültige Feld rot umranden und nichts speichern. Das Blatt bleibt offen.
- Wenn der Nutzer das Blatt über X, Herunterziehen, Tippen außerhalb oder die Android-Zurück-Taste schließt, muss das System die Eingaben verwerfen.

**Manueller Eintrag und Barcode**
- Das System muss die Zeile „Maße“ auch in der Karte „Ausgabe“ des Blatts „Manueller Eintrag“ (REQ-060) an derselben Stelle anbieten, mit gleichem Blatt und gleichen Regeln. Die Werte werden mit dem Buch angelegt.
- Wenn beim Barcode-Scan (REQ-062) eine Quelle Maße liefert (z. B. Höhe aus der DNB, `physical_dimensions` aus Open Library), muss das System die eindeutig zuordenbaren Werte auf eine Nachkommastelle in Zentimetern umgerechnet in den vorbefüllten Manuellen Eintrag übernehmen. Nicht gelieferte oder nicht eindeutig zuordenbare Werte bleiben leer. Liefert keine Quelle Maße, wird nichts übernommen oder gespeichert; Zeile und Blatt zeigen dann den Schätz-Vorschlag.

## Akzeptanzkriterien

### AK-1 Zeile unter „Format“
- **Gegeben** die Karte „Ausgabe“ eines Buches
- **Wenn** der Nutzer sie betrachtet
- **Dann** steht die Zeile „Maße“ direkt unter „Format“
- **Und** die Zeile „Maße“ zeigt rechts einen Pfeil „›“, wie „Preis“

### AK-2 Anzeige mit und ohne Werte
- **Gegeben** ein Taschenbuch mit 400 Seiten ohne Maße
- **Dann** zeigt die Zeile abgeschwächt bzw. kursiv „ca. 13,8 × 21,8 × 2,4 cm“ (mit den aktuellen Standardwerten nach REQ-077)
- **Und** es sind weiterhin keine Maße gespeichert
- **Gegeben** ein Buch mit Breite 13,5, Höhe 21, Dicke 3,2
- **Dann** zeigt die Zeile „13,5 × 21,0 × 3,2 cm“
- **Gegeben** ein Hardcover mit 400 Seiten, nur mit Höhe 24
- **Dann** zeigt die Zeile abgeschwächt bzw. kursiv „ca. 14,8 × 24,0 × 2,8 cm“ (fehlende Werte aus den Standardwerten nach REQ-077; **Auslegung**)
- **Und** gespeichert ist weiterhin nur die Höhe 24,0

### AK-3 Aufbau des Blatts
- **Gegeben** die Karte „Ausgabe“
- **Wenn** der Nutzer die Zeile „Maße“ antippt
- **Dann** erscheint das Blatt mit Ziehgriff, Titel „Maße“, X, drei Feldern Breite × Höhe × Dicke mit Labels in Großbuchstaben, Hinweis „in Zentimetern“ und „Sichern“
- **Und** vorhandene Werte sind vorbefüllt
- **Gegeben** ein Taschenbuch mit 400 Seiten ohne Maße
- **Wenn** der Nutzer das Blatt öffnet
- **Dann** sind die Felder mit 13,8, 21,8 und 2,4 vorbefüllt (mit den aktuellen Standardwerten nach REQ-077)

### AK-4 Gültig sichern, auch teilweise
- **Gegeben** das Blatt „Maße“ eines Taschenbuchs mit 400 Seiten ist offen
- **Wenn** der Nutzer „13.5“ bei Breite einträgt, Höhe und Dicke leert und „Sichern“ antippt
- **Dann** schließt das Blatt und die Zeile zeigt abgeschwächt bzw. kursiv „ca. 13,5 × 21,8 × 2,4 cm“ (mit den aktuellen Standardwerten nach REQ-077; **Auslegung**, siehe AK-2)
- **Und** nach Neuladen der App ist nur die Breite 13,5 hinterlegt

### AK-5 Ungültige Werte
- **Gegeben** das Blatt „Maße“ ist offen
- **Wenn** der Nutzer in einem Feld „0“, „-2“, „abc“ oder „13,55“ einträgt und „Sichern“ antippt
- **Dann** ist dieses Feld rot umrandet, das Blatt bleibt offen und es wird nichts gespeichert

### AK-6 Schließen verwirft
- **Gegeben** das Blatt „Maße“ ist offen und der Nutzer hat Werte geändert
- **Wenn** er es über X, Herunterziehen, Tippen außerhalb oder die Zurück-Taste schließt
- **Dann** sind die zuvor gespeicherten Maße unverändert

### AK-7 Im Manuellen Eintrag
- **Gegeben** das Blatt „Manueller Eintrag“
- **Wenn** der Nutzer Maße einträgt und das Buch hinzufügt
- **Dann** zeigt die Karte „Ausgabe“ des neuen Buches diese Maße

### AK-8 Übernahme beim Barcode-Scan
- **Gegeben** eine Quelle liefert zur gescannten ISBN Maße (z. B. nur die Höhe 21 cm)
- **Wenn** der Nutzer den Treffer antippt
- **Dann** enthält der vorbefüllte Manuelle Eintrag diese Werte (Höhe 21,0), nicht gelieferte Werte sind leer
- **Gegeben** keine Quelle liefert Maße
- **Wenn** der Nutzer den Treffer antippt
- **Dann** werden keine Maße übernommen oder gespeichert
- **Und** Zeile und Blatt „Maße“ im Manuellen Eintrag zeigen den Schätz-Vorschlag „ca. …“ nach REQ-077 (wie AK-2, AK-3)

### AK-9 Schätzwerte folgen dem Format, werden nicht gespeichert
- **Gegeben** ein Buch ohne Maße mit „Print · Taschenbuch“
- **Wenn** der Nutzer das Format auf „Print · Hardcover“ ändert und sichert
- **Dann** zeigt die Zeile „Maße“ die Schätzwerte für Hardcover
- **Gegeben** das Blatt „Maße“ ist mit Schätzwerten vorbefüllt
- **Wenn** der Nutzer es ohne „Sichern“ schließt
- **Dann** sind weiterhin keine Maße gespeichert
- **Wenn** er stattdessen „Sichern“ antippt
- **Dann** sind die Werte gespeichert und die Zeile zeigt sie ohne „ca.“ und nicht abgeschwächt

## Abgrenzung (nicht Teil dieses REQ)

- Andere Einheiten als Zentimeter in der Eingabe.
- Wirkung auf die Buchdarstellung (REQ-073).

## Qualitätsanforderungen

- Keine.

## Abhängigkeiten

- REQ-056 (Karte „Ausgabe“, erhält eine weitere Zeile), REQ-059 (Muster Blatt „Preis“), REQ-060 (Manueller Eintrag), REQ-062 (Barcode-Suche), REQ-073 (Proportionen), REQ-077 (Standardmaße; Vorschlag und Vorbefüllung erst umsetzbar, wenn REQ-077 abgestimmt ist).

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-18 | Erstellt aus CEO-Wunsch und vom CEO bestätigtem Vorschlag (eine Nachkommastelle). Status „Abgestimmt“ | Anforderungsmanager |
| 2026-11-21 | CEO (wörtlich): „ja ergänze bitte den Pfeil bei "Maße".“ Pfeil „›“ rechts an der Zeile „Maße“ ergänzt (Anforderung, AK-1). Status unverändert | Anforderungsmanager |
| 2026-11-21 | CEO („a klingt gut“): ohne Maße zeigt die Zeile die geschätzten Standardmaße (REQ-077) als Vorschlag „ca. …“ statt „Trag die Maße ein“; Blatt damit vorbefüllt; gespeichert erst mit „Sichern“; Anpassung bei Formatwechsel. AK-2, AK-3 geändert, AK-9 neu. Status unverändert | Anforderungsmanager |
| 2026-11-21 | Widerspruch zu AK-3 behoben (Hinweis des Scrum Masters, im Sinne der CEO-Entscheidung „a“): AK-8 ohne Maße aus der Quelle → nichts gespeichert, Zeile und Blatt zeigen den Schätz-Vorschlag. Status unverändert | Anforderungsmanager |
| 2026-11-25 | Konflikt mit REQ-077 AK-10 behoben (Auftrag des Scrum Masters, neuerer CEO-Wunsch vom 2026-11-25 hat Vorrang). **Auslegung:** Fehlende Einzelwerte zeigt die Zeile mit dem Standardwert nach REQ-077 statt „–“, dann mit „ca.“ und abgeschwächt bzw. kursiv; gespeichert wird nur Hinterlegtes; Blatt bei Teilwerten nur mit hinterlegten Werten vorbefüllt. Anforderung (Zeile, Blatt), AK-2 (dritter Fall) und AK-4 geändert. Status unverändert, CEO sieht die Auslegung bei der Bestätigung | Anforderungsmanager |
| 2026-11-25 | Beispielwert „ca. …“ an neue Taschenbuch-Standardmaße 13,8 × 21,8 (REQ-077) angepasst; Verhalten unverändert. CEO-Vorgabe 2026-11-25 (abends) | Anforderungsmanager |
| 2026-11-26 | Zusammenführung Sprint 11 und Sprint 12: Regel „fehlender Einzelwert = Standardwert mit ‚ca.‘“ (Sprint 11) ersetzt „–“; alle Beispielwerte (Anforderung, AK-3, AK-4) auf 13,8 × 21,8 cm (Sprint 12, jüngere CEO-Vorgabe). Status unverändert | Anforderungsmanager |
