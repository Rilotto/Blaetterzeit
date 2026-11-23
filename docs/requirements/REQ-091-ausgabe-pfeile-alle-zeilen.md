---
id: REQ-091
titel: Karte „Ausgabe“ – Pfeil „›“ auch bei Verlag, Erschienen, ISBN, Hinzugefügt und Beendet am
status: In Umsetzung
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **an allen Zeilen der Karte „Ausgabe“ rechts einen Pfeil sehen**, damit **die Liste einheitlich aussieht wie bei den oberen Zeilen**.

Vorgabe des CEO (wörtlich, 2026-11-23): „In der Liste der Ausgabe fehlen bei Verlag, Erschienen, ISBN, Hinzugefügt und Beendet am noch ein kleines Pfeilchen rechts wie bei den oberen Zeilen. Bitte ergänze diese.“ Zu „Fotos“: „Fotos hat bereits einen Pfeil.“

## Anforderung (Satzschablone)

- Das System muss in der Karte „Ausgabe“ des Reiters „Details“ (REQ-056) die Zeilen Verlag, Erschienen, ISBN, Hinzugefügt und Beendet am rechts mit einem Pfeil „›“ darstellen, so wie die Zeilen Seiten, Format, Maße, Exemplar, Sonderausgabe, Fotos und Preis.
- Damit hat jede der zwölf Zeilen der Karte „Ausgabe“ einen Pfeil „›“.
- Das System muss auch in der Karte „Ausgabe“ im Blatt „Manueller Eintrag“ (REQ-060) jede Zeile rechts mit einem Pfeil „›“ darstellen. CEO (wörtlich, 2026-11-23): „auch in manueller Eintrag. Danke für die Ergänzung!“
- Pfeile der bisherigen Zeilen bleiben unverändert.

## Akzeptanzkriterien

### AK-1 Alle zwölf Zeilen mit Pfeil
- **Gegeben** die Karte „Ausgabe“ im Reiter „Details“ wird angezeigt
- **Wenn** die rechten Enden der Zeilen betrachtet werden
- **Dann** haben Seiten, Format, Maße, Exemplar, Sonderausgabe, Fotos, Preis, Verlag, Erschienen, ISBN, Hinzugefügt und Beendet am je einen Pfeil „›“

### AK-2 Pfeil auch ohne Wert
- **Gegeben** ein Buch ohne Verlag, ohne ISBN, ohne Erscheinungsangabe und ohne „Beendet am“
- **Wenn** die Karte „Ausgabe“ betrachtet wird
- **Dann** haben auch die Zeilen Verlag, Erschienen, ISBN und Beendet am rechts einen Pfeil „›“

### AK-3 Pfeile im Blatt „Manueller Eintrag“
- **Gegeben** das Blatt „Manueller Eintrag“ ist geöffnet
- **Wenn** die Karte „Ausgabe“ darin betrachtet wird
- **Dann** hat jede ihrer Zeilen rechts einen Pfeil „›“, auch Verlag, Erschienen, ISBN und Hinzugefügt

## Abgrenzung (nicht Teil dieses REQ)

- Funktion beim Antippen von „Erschienen“ (REQ-092). Verhalten beim Antippen der übrigen Zeilen bleibt wie in REQ-056, REQ-060, REQ-063, REQ-064 und REQ-085.

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-056:** Anforderung (Pfeil-Regel) und AK-2 („Hinzugefügt“ und „Beendet am“ haben keinen Pfeil) werden mit Abstimmung dieses REQ hinfällig; REQ-056 wird dann angepasst.
- **REQ-085:** keine Änderung nötig (legt keinen Pfeil fest).
- **REQ-060:** Die Karte „Ausgabe“ im Blatt „Manueller Eintrag“ erhält ebenfalls die Pfeile.
- **REQ-092:** Ohne REQ-092 hätte „Erschienen“ einen Pfeil, aber keine Funktion beim Antippen.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-23 | Erstellt aus CEO-Vorgabe vom 2026-11-23 (Entwurf) | Anforderungsmanager |
| 2026-11-23 | Offene Frage 1 (Pfeile im Blatt „Manueller Eintrag“) gestellt, vom CEO noch nicht beantwortet. Status Entwurf | Anforderungsmanager |
| 2026-11-23 | CEO-Antwort „auch in manueller Eintrag“ eingearbeitet: Pfeile auch in der Karte „Ausgabe“ des Blatts „Manueller Eintrag“ (neu AK-3). Keine offenen Fragen. Status Entwurf | Anforderungsmanager |
| 2026-11-23 | Vom CEO bestätigt (wörtlich): „okay, freigegeben. Starte mit dem nächsten Prototypen“. Status „Abgestimmt“ | Anforderungsmanager |
