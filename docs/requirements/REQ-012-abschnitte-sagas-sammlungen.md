---
id: REQ-012
titel: Seite „Bücher“ – Abschnitte „Sagas“ und „Sammlungen“ mit Platzhalter
status: In Umsetzung
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **CEO** möchte ich **die Abschnitte „Sagas“ und „Sammlungen“ schon jetzt mit Überschrift und Platzhalter sehen**, damit **das Grundgerüst der Seite „Bücher“ vollständig erkennbar ist, bevor die Funktionen dahinter entstehen**.

Vorgabe des CEO (wörtlich, 2026-11-09): „Die Abschnitte mit ihren Überschriften sollen bitte jetzt schon erscheinen, auch mit Platzhaltern in der selben Größe wie die Buch-Platzhalter (kannst du hier einfach auch verwenden).“ Diese Aussage ist neuer als die Vorgabe „Die Rubrik ‚Sammlungen‘ selbst soll nicht umgesetzt werden“; beides ist vereinbar, weil hier nur Überschrift und Platzhalter erscheinen, keine Sammlungs- oder Saga-Funktion.

Ergänzung des CEO (wörtlich, 2026-11-09): „Lass uns bei beiden Abschnitten einen Text unter den Platzhaltern machen. einmal: Wie wäre es mit einer neuen Sammlung? und einmal: Deine nächste Saga wartet auf dich!“ Zuordnung: „Sagas“ → „Deine nächste Saga wartet auf dich!“, „Sammlungen“ → „Wie wäre es mit einer neuen Sammlung?“. Darstellung wie der Text des Leere-Liste-Platzhalters (REQ-011): an der Titelstelle unter dem Platzhalter, Farbrubrik „Primär“ (vom Scrum Master so angekündigt, CEO hat nicht widersprochen; Prüfung im Prototyp).

Referenzbild: [referenzen/REQ-002-referenz-hauptnavigation.png](referenzen/REQ-002-referenz-hauptnavigation.png) (Überschriften „Sagas“ und „Sammlungen“). Optische Übereinstimmung prüft der CEO im Prototyp.

## Anforderung (Satzschablone)

- Das System muss auf der Seite „Bücher“ unterhalb des Abschnitts „Noch zu lesen“ (REQ-009) den Abschnitt „Sagas“ und darunter den Abschnitt „Sammlungen“ darstellen (Reihenfolge wie im Referenzbild).
- Das System muss die Abschnittsüberschriften genau als „Sagas“ und „Sammlungen“ linksbündig darstellen, in derselben Größe und Schriftstärke wie die Überschrift „Noch zu lesen“.
- Das System muss beide Abschnittsüberschriften in der Farbrolle „Abschnittsüberschriftfarbe“ (Farbrubrik „Tertiär“, wie „Deine Bücher“, REQ-005) darstellen.
- Das System muss unter jeder dieser Überschriften genau einen Cover-Platzhalter (REQ-010) ohne Buchtitel darstellen.
- Das System muss diese Cover-Platzhalter in derselben Größe wie die Cover-Platzhalter der Bucheinträge im Abschnitt „Noch zu lesen“ darstellen.
- Das System muss im Abschnitt „Sagas“ unter dem Cover-Platzhalter an der Titelstelle genau den Text „Deine nächste Saga wartet auf dich!“ darstellen.
- Das System muss im Abschnitt „Sammlungen“ unter dem Cover-Platzhalter an der Titelstelle genau den Text „Wie wäre es mit einer neuen Sammlung?“ darstellen.
- Das System muss diese beiden Texte in der Farbrolle „Abschnittsplatzhalter-Text“ (Farbrubrik „Primär“, wie der Text des Leere-Liste-Platzhalters, REQ-011) darstellen. Konkrete Farbwerte sind kein Akzeptanzkriterium.
- Das System darf in diesen Abschnitten keine weiteren Elemente (z. B. „Alle ansehen ›“, Bücher, Sagas, Sammlungen) darstellen.
- Wenn der Nutzer eine Überschrift, einen Platzhalter oder einen Platzhaltertext dieser Abschnitte antippt, darf sich in der App nichts ändern.

## Akzeptanzkriterien

### AK-1 Beide Abschnitte unter „Noch zu lesen“
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** der Bereich unterhalb des Abschnitts „Noch zu lesen“ betrachtet wird
- **Dann** folgt dort die Überschrift „Sagas“ und darunter die Überschrift „Sammlungen“

### AK-2 Überschriften in der Farbrubrik Tertiär
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** die Überschriften „Sagas“ und „Sammlungen“ betrachtet werden
- **Dann** sind beide in der Farbe der Farbrubrik „Tertiär“ dargestellt

### AK-3 Je ein Cover-Platzhalter ohne Titel
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** die Abschnitte „Sagas“ und „Sammlungen“ betrachtet werden
- **Dann** steht unter jeder Überschrift genau ein Cover-Platzhalter (REQ-010)
- **Und** der Cover-Platzhalter selbst zeigt keinen Buchtitel (Text unter dem Platzhalter: AK-6, AK-7)

### AK-4 Gleiche Größe wie die Buch-Platzhalter
- **Gegeben** im Abschnitt „Noch zu lesen“ steht ein Buch ohne Buchcover
- **Wenn** dessen Cover-Platzhalter mit den Platzhaltern der Abschnitte „Sagas“ und „Sammlungen“ verglichen wird
- **Dann** haben alle dieselbe Breite und Höhe

### AK-5 Keine Funktion
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** der Nutzer eine Überschrift oder einen Platzhalter der Abschnitte „Sagas“ oder „Sammlungen“ antippt
- **Dann** ändert sich in der App nichts

### AK-6 Text unter dem Platzhalter „Sagas“
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** der Abschnitt „Sagas“ betrachtet wird
- **Dann** steht unter dem Cover-Platzhalter an der Titelstelle genau der Text „Deine nächste Saga wartet auf dich!“

### AK-7 Text unter dem Platzhalter „Sammlungen“
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** der Abschnitt „Sammlungen“ betrachtet wird
- **Dann** steht unter dem Cover-Platzhalter an der Titelstelle genau der Text „Wie wäre es mit einer neuen Sammlung?“

### AK-8 Platzhaltertexte in der Farbrubrik Primär
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** die Texte aus AK-6 und AK-7 betrachtet werden
- **Dann** sind beide in der Farbe der Farbrubrik „Primär“ dargestellt
- **Und** nach Änderung des Werts der Farbrubrik „Primär“ an der zentralen Stelle erscheinen beide im geänderten Wert

### AK-9 Antippen der Platzhaltertexte bewirkt nichts
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** der Nutzer einen der Texte aus AK-6 oder AK-7 antippt
- **Dann** ändert sich in der App nichts

## Abgrenzung (nicht Teil dieses REQ)

- Jede echte Saga- oder Sammlungsfunktion (Anlegen, Anzeigen, Zuordnen von Büchern).
- „Alle ansehen ›“ in diesen Abschnitten.
- Konkrete Maße und Farbwerte als Akzeptanzkriterium.

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-009:** Abschnitt „Noch zu lesen“, Abschnittsüberschriftfarbe, Covergröße.
- **REQ-010:** wiederverwendbarer Cover-Platzhalter (ohne Titel einsetzbar).
- **REQ-005:** Farbrubrik der Überschrift „Deine Bücher“.
- **REQ-011:** Vorbild für Position (Titelstelle) und Farbrubrik „Primär“ der Platzhaltertexte.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-09 | Erstellt aus CEO-Antwort F4. Eigener REQ statt Teil von REQ-009, weil es ein eigenständiges, unabhängig prüfbares Seitenelement ohne Buchlogik ist (atomar) und später durch echte Saga-/Sammlungs-REQs ersetzt werden kann, ohne REQ-009 zu berühren. Vom CEO bestätigt 2026-11-09, Status „Abgestimmt“ | Anforderungsmanager |
| 2026-11-09 | Ergänzung auf CEO-Wunsch (wörtlich): „Lass uns bei beiden Abschnitten einen Text unter den Platzhaltern machen. einmal: Wie wäre es mit einer neuen Sammlung? und einmal: Deine nächste Saga wartet auf dich!“ Neu: AK-6 (Text Sagas), AK-7 (Text Sammlungen), AK-8 (Farbrubrik Primär), AK-9 (Antippen der Texte ohne Wirkung). AK-3 angepasst: „darunter kein Text“ ersetzt durch „Cover-Platzhalter zeigt keinen Buchtitel“, da sonst Widerspruch zu AK-6/AK-7. Darstellung (Titelstelle, Primär) vom Scrum Master angekündigt, CEO hat nicht widersprochen; Prüfung im Prototyp. REQ war nicht eingefroren; Status von „Implementiert“ auf „In Umsetzung“ | Anforderungsmanager |
