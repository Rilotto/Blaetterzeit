---
id: REQ-035
titel: Seite „Bücher“ – Abschnitt „Alle Bücher“ mit „Alle ansehen ›“
status: Entwurf
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **auf der Seite „Bücher“ einen Abschnitt „Alle Bücher“ mit meinen zuletzt eingetragenen Büchern sehen**, damit **ich neue Bücher sofort finde und von dort zur Übersicht aller Bücher gelange**.

Vorgabe des CEO (wörtlich, 2026-11-12): „Im Reiter "Bücher" haben wir aktuell drei Bereiche: "Noch zu lesen", "Sagas" und "Sammlungen". Ich möchte, dass hier unterhalb von "Sammlungen" ein neuer Bereich hinzukommt. Gestalte diesen wie die anderen Bereiche auch, mit denselben Platzhaltern und Gestaltungsrichtlinien. Der neue Bereich heißt "Alle Bücher". Ebenso bekommt dieser Bereich auch wie "Noch zu lesen" rechts das kleine "Alle ansehen >". Dieses "Alle ansehen >" öffnet im Reiter "Bücher" ein neues Fenster, in dem es eine Übersicht aller Bücher gibt.“

Antworten des CEO (wörtlich, 2026-11-12):
- F1: „Unter der Überschrift sind alle Bücher aufgezeigt (unabhängig ihres Status), die neuesten eingetragenen immer links vorn. Maximal 10 Bücher werden in dieser Reihe nach rechts angezeigt. Die Bücher wandern also mit älterwerdendem "Eintragungsdatum" nach rechts. Solange kein Buch eingetragen ist, ist genau ein Platzhalter.“
- F8: Farben „wie im Screenshot mit den bestehenden Farben“; Priorität „must“.

## Anforderung (Satzschablone)

**Abschnitt und Überschrift**
- Das System muss auf der Seite „Bücher“ unterhalb des Abschnitts „Sammlungen“ (REQ-012) den Abschnitt „Alle Bücher“ darstellen.
- Das System muss die Abschnittsüberschrift genau als „Alle Bücher“ darstellen, in derselben Gestaltung wie die Überschriften der bestehenden Abschnitte (REQ-009, REQ-012: linksbündig, gleiche Größe und Schriftstärke, Farbrolle „Abschnittsüberschriftfarbe“ / Farbrubrik „Tertiär“).
- Das System muss rechts neben der Überschrift „Alle Bücher“ den Text „Alle ansehen ›“ in derselben Gestaltung wie „Alle ansehen ›“ im Abschnitt „Noch zu lesen“ darstellen (Schrift aus derselben zentralen Definition, Farbrolle „Alle-ansehen-Farbe“ / Farbrubrik „Primär“).
- Wenn der Nutzer „Alle ansehen ›“ im Abschnitt „Alle Bücher“ antippt, muss das System innerhalb des Reiters „Bücher“ die Übersicht „Alle Bücher“ (REQ-036) öffnen.

**Buchreihe**
- Das System muss im Abschnitt Bücher unabhängig von ihrem Lesestatus darstellen.
- Das System muss die Bücher in einer horizontalen Reihe nach Eintragungsdatum (REQ-041) absteigend anordnen: das zuletzt eingetragene Buch ganz links.
- Das System muss höchstens 10 Bücher in dieser Reihe darstellen (die 10 zuletzt eingetragenen).
- Das System muss die Bucheinträge in derselben Gestaltung wie im Abschnitt „Noch zu lesen“ darstellen (Bucheintrag mit Buchcover bzw. Cover-Platzhalter REQ-010 und Buchtitel, REQ-009).
- Wenn der Nutzer Cover oder Titel eines Bucheintrags antippt, muss das System die Buchdetails dieses Buches öffnen (CEO: „Dann öffnen sich die Buchdetails des Buches.“; Rückweg wie REQ-013 zur Seite „Bücher“).

**Leerer Zustand**
- Wenn kein Buch eingetragen ist, muss das System im Abschnitt genau einen Platzhalter darstellen, gestaltet wie der Leere-Liste-Platzhalter (REQ-011), an der Titelstelle mit genau dem Text „Deine Bücher warten auf dich...“ (CEO 2026-11-12: „Ja genauso ein Platzhalterrahmen. Text: "Deine Bücher warten auf dich..."“). Wie bei REQ-011 bewirkt Antippen nichts.

## Akzeptanzkriterien

### AK-1 Abschnitt unter „Sammlungen“
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** der Bereich unterhalb des Abschnitts „Sammlungen“ betrachtet wird
- **Dann** steht dort links die Überschrift „Alle Bücher“
- **Und** rechts daneben „Alle ansehen ›“

### AK-2 Überschrift wie die anderen Abschnitte
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** die Überschrift „Alle Bücher“ mit „Sammlungen“ verglichen wird
- **Dann** stimmen Schriftgröße, Schriftstärke und Farbrubrik („Tertiär“) überein

### AK-3 „Alle ansehen ›“ wie bei „Noch zu lesen“
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** „Alle ansehen ›“ der Abschnitte „Alle Bücher“ und „Noch zu lesen“ verglichen werden
- **Dann** stimmen Schriftgröße, Schriftart, Schriftstärke und Farbrubrik („Primär“) überein

### AK-4 „Alle ansehen ›“ öffnet die Übersicht
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** der Nutzer „Alle ansehen ›“ im Abschnitt „Alle Bücher“ antippt
- **Dann** wird die Übersicht „Alle Bücher“ (REQ-036) angezeigt
- **Und** der Menüpunkt „Bücher“ der Hauptnavigation bleibt ausgewählt

### AK-5 Alle Lesestatus
- **Gegeben** je ein Buch mit jedem Lesestatus (REQ-008)
- **Wenn** die Seite „Bücher“ angezeigt wird
- **Dann** enthält der Abschnitt „Alle Bücher“ jedes dieser Bücher

### AK-6 Neueste links
- **Gegeben** drei Bücher, nacheinander eingetragen A, dann B, dann C
- **Wenn** die Seite „Bücher“ angezeigt wird
- **Dann** stehen sie im Abschnitt von links nach rechts in der Reihenfolge C, B, A

### AK-7 Höchstens 10 Bücher
- **Gegeben** 12 eingetragene Bücher
- **Wenn** die Reihe vollständig durchgewischt wird
- **Dann** sind genau die 10 zuletzt eingetragenen Bücher enthalten

### AK-8 Bucheintrag wie bei „Noch zu lesen“
- **Gegeben** ein Buch ohne Buchcover und ein Buch mit Buchcover
- **Wenn** sie im Abschnitt „Alle Bücher“ angezeigt werden
- **Dann** zeigen sie Cover-Platzhalter (REQ-010) bzw. Buchcover und darunter den Buchtitel, in Größe und Gestaltung wie im Abschnitt „Noch zu lesen“

### AK-9 Kein Buch: genau ein Platzhalter
- **Gegeben** es ist kein Buch eingetragen
- **Wenn** die Seite „Bücher“ angezeigt wird
- **Dann** zeigt der Abschnitt „Alle Bücher“ genau einen Platzhalter, gestaltet wie der Leere-Liste-Platzhalter (REQ-011)
- **Und** an der Titelstelle steht genau „Deine Bücher warten auf dich...“
- **Und** Antippen ändert nichts

### AK-10 Buch antippen öffnet Buchdetails
- **Gegeben** der Abschnitt „Alle Bücher“ zeigt mehrere Bücher
- **Wenn** der Nutzer Cover oder Titel eines Buches antippt und danach den Zurück-Pfeil
- **Dann** werden zuerst die Buchdetails genau dieses Buches und danach die Seite „Bücher“ angezeigt

## Abgrenzung (nicht Teil dieses REQ)

- Inhalt der Übersicht (REQ-036 bis REQ-038), Filterpille „Alle“ (REQ-039), Übersicht „Noch zu lesen“ (REQ-040).
- Speichern des Eintragungsdatums (REQ-041).

## Qualitätsanforderungen

- Keine genannt.

## Abhängigkeiten

- REQ-009, REQ-010, REQ-011, REQ-012, REQ-020, REQ-036, REQ-041.

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-12 | Erstellt (Entwurf aus CEO-Vorgabe) | Anforderungsmanager |
| 2026-11-12 | CEO-Antworten F1, F8 eingearbeitet (Buchreihe, max. 10, neueste links, leerer Zustand, Priorität Must). Status bleibt Entwurf | Anforderungsmanager |
| 2026-11-12 | CEO-Antworten Runde 2: leerer Zustand wie REQ-011 mit Text „Deine Bücher warten auf dich...“ (AK-9); Altbücher ohne Eintragungsdatum gibt es nicht. Status bleibt Entwurf | Anforderungsmanager |
| 2026-11-12 | CEO-Antwort Runde 3, F3: Antippen öffnet Buchdetails (neu AK-10). Status bleibt Entwurf | Anforderungsmanager |
