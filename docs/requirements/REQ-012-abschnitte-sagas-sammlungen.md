---
id: REQ-012
titel: Seite „Bücher“ – Abschnitte „Sagas“ und „Sammlungen“ mit Platzhalter
status: Implementiert
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

Referenzbild: [referenzen/REQ-002-referenz-hauptnavigation.png](referenzen/REQ-002-referenz-hauptnavigation.png) (Überschriften „Sagas“ und „Sammlungen“). Optische Übereinstimmung prüft der CEO im Prototyp.

## Anforderung (Satzschablone)

- Das System muss auf der Seite „Bücher“ unterhalb des Abschnitts „Noch zu lesen“ (REQ-009) den Abschnitt „Sagas“ und darunter den Abschnitt „Sammlungen“ darstellen (Reihenfolge wie im Referenzbild).
- Das System muss die Abschnittsüberschriften genau als „Sagas“ und „Sammlungen“ linksbündig darstellen, in derselben Größe und Schriftstärke wie die Überschrift „Noch zu lesen“.
- Das System muss beide Abschnittsüberschriften in der Farbrolle „Abschnittsüberschriftfarbe“ (Farbrubrik „Tertiär“, wie „Deine Bücher“, REQ-005) darstellen.
- Das System muss unter jeder dieser Überschriften genau einen Cover-Platzhalter (REQ-010) ohne Buchtitel darstellen.
- Das System muss diese Cover-Platzhalter in derselben Größe wie die Cover-Platzhalter der Bucheinträge im Abschnitt „Noch zu lesen“ darstellen.
- Das System darf in diesen Abschnitten keine weiteren Elemente (z. B. „Alle ansehen ›“, Bücher, Sagas, Sammlungen) darstellen.
- Wenn der Nutzer eine Überschrift oder einen Platzhalter dieser Abschnitte antippt, darf sich in der App nichts ändern.

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
- **Und** darunter kein Text

### AK-4 Gleiche Größe wie die Buch-Platzhalter
- **Gegeben** im Abschnitt „Noch zu lesen“ steht ein Buch ohne Buchcover
- **Wenn** dessen Cover-Platzhalter mit den Platzhaltern der Abschnitte „Sagas“ und „Sammlungen“ verglichen wird
- **Dann** haben alle dieselbe Breite und Höhe

### AK-5 Keine Funktion
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** der Nutzer eine Überschrift oder einen Platzhalter der Abschnitte „Sagas“ oder „Sammlungen“ antippt
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

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-09 | Erstellt aus CEO-Antwort F4. Eigener REQ statt Teil von REQ-009, weil es ein eigenständiges, unabhängig prüfbares Seitenelement ohne Buchlogik ist (atomar) und später durch echte Saga-/Sammlungs-REQs ersetzt werden kann, ohne REQ-009 zu berühren. Vom CEO bestätigt 2026-11-09, Status „Abgestimmt“ | Anforderungsmanager |
