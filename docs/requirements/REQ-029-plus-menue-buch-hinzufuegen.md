---
id: REQ-029
titel: Seite „Bücher“ – Menü nach Antippen der Plus-Schaltfläche mit der Option „Von Hand eintragen“
status: Entwurf
prioritaet: offen
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **über die Plus-Schaltfläche der Seite „Deine Bücher“ ein Menü öffnen und dort „Von Hand eintragen“ wählen**, damit **ich ein neues Buch anlegen kann**.

Vorgabe des CEO (wörtlich, 2026-11-10): „Ich möchte über das '+' in der Übersichtsseite 'Deine Bücher' ein neues Buch anlegen. Dazu habe ich dir wieder zwei Screenshots. Übernimm in dem Menü, welches nach dem Klick auf das '+' kommt, nur die Option 'Von Hand eintragen'. Kopiere dieses Menü, das Icon, und die darauffolgende Seite 'Manueller Eintrag'. Behandle alles gleich wie bislang auch, lege die Farben fest wie bisher auch.“

Referenzbild: [referenzen/REF-buch-anlegen-01-menue.png](referenzen/REF-buch-anlegen-01-menue.png). Übernommen wird laut CEO nur die Option „Von Hand eintragen“; die Optionen „Online suchen“, „Barcode scannen“ und „Deine Bücher importieren“ sind nicht Teil dieses REQ. Die optische Übereinstimmung prüft der CEO im Prototyp; sie ist kein Akzeptanzkriterium.

Die Bezeichnung Menü „Buch hinzufügen“ ist ein Arbeitsname für die Dokumentation; das Menü zeigt keine Überschrift (Referenzbild).

## Anforderung (Satzschablone)

**Öffnen**
- Wenn der Nutzer auf der Seite „Bücher“ die Plus-Schaltfläche (REQ-005) antippt, muss das System das Menü „Buch hinzufügen“ anzeigen.

**Inhalt**
- Das System muss im Menü „Buch hinzufügen“ genau eine Option anzeigen: „Von Hand eintragen“.
- Das System muss die Option mit dem Titel „Von Hand eintragen“ und darunter dem Untertitel „Wenn deine Ausgabe fehlt“ darstellen.
- Das System muss links neben der Option ein Icon in einer Icon-Kachel darstellen, das dem Icon im Referenzbild nachgebildet ist (CEO: „Kopiere … das Icon“), im technischen Stil der übrigen nachgebildeten Icons (REQ-005: einfarbiges Linien-Icon auf transparentem Grund, von der App eingefärbt, keine Icon-Bibliothek).

**Wirkung**
- Wenn der Nutzer die Option „Von Hand eintragen“ antippt, muss das System das Menü „Buch hinzufügen“ schließen und das Blatt „Manueller Eintrag“ (REQ-030) anzeigen.

**Gestaltung**
- Das System muss Form, Schrift und Anordnung des Menüs am Referenzbild ausrichten (CEO: „Kopiere dieses Menü“).
- Das System muss alle Farben des Menüs über Farbrollen aus zentralen Farbrubriken beziehen (REQ-002; CLAUDE.md „Farben auf Zuruf“). Die Zuordnung der Farbrubriken ist offen (Offene Fragen).

## Akzeptanzkriterien

### AK-1 Plus öffnet das Menü
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** der Nutzer die Plus-Schaltfläche antippt
- **Dann** erscheint das Menü „Buch hinzufügen“

### AK-2 Genau eine Option mit Titel und Untertitel
- **Gegeben** das Menü „Buch hinzufügen“ ist geöffnet
- **Wenn** der Nutzer das Menü betrachtet
- **Dann** enthält es genau eine Option mit dem Titel „Von Hand eintragen“ und dem Untertitel „Wenn deine Ausgabe fehlt“
- **Und** die Optionen „Online suchen“, „Barcode scannen“ und „Deine Bücher importieren“ werden nicht angezeigt

### AK-3 Icon nachgebildet, nicht aus einer Bibliothek
- **Gegeben** das Menü „Buch hinzufügen“ ist geöffnet
- **Wenn** die Herkunft des Icons der Option geprüft wird
- **Dann** ist es eine im Projekt abgelegte, nachgebildete Icon-Datei, die von der App in der Farbe ihrer Farbrolle eingefärbt wird, und kein Icon aus einer externen Icon-Bibliothek

### AK-4 „Von Hand eintragen“ öffnet „Manueller Eintrag“
- **Gegeben** das Menü „Buch hinzufügen“ ist geöffnet
- **Wenn** der Nutzer „Von Hand eintragen“ antippt
- **Dann** ist das Menü geschlossen
- **Und** das Blatt „Manueller Eintrag“ wird angezeigt

### AK-5 Farben aus zentralen Farbrubriken
- **Gegeben** der Wert einer Farbrubrik, die im Menü „Buch hinzufügen“ verwendet wird, wird an der zentralen Stelle geändert
- **Wenn** das Menü geöffnet wird
- **Dann** sind alle Elemente mit dieser Farbrubrik im geänderten Wert dargestellt
- **Und** kein Element des Menüs hat einen eigenen, davon abweichenden Farbwert

## Abgrenzung (nicht Teil dieses REQ)

- Optionen „Online suchen“, „Barcode scannen“, „Deine Bücher importieren“ (CEO: „nur die Option 'Von Hand eintragen'“).
- Inhalt und Verhalten des Blatts „Manueller Eintrag“ (REQ-030 bis REQ-032).
- Konkrete Farbwerte und Maße als Akzeptanzkriterium.

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-005:** Plus-Schaltfläche; deren bisherige Vorgabe „Antippen bewirkt nichts“ wird für die Plus-Schaltfläche durch diesen REQ abgelöst (REQ-005 angepasst, AK-10).
- **REQ-030:** Blatt „Manueller Eintrag“.

## Offene Fragen

- F5: Wie schließt sich das Menü (z. B. ohne Auswahl)? Soll das „+“ bei geöffnetem Menü zum „×“ werden und die Seite abgedunkelt sein wie im Screenshot?
- F7: Farbzuordnung (Menüfläche, Rahmen, Icon-Kachel, Icon, Titel, Untertitel, Abdunklung) und Priorität.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-10 | Erstellt (Entwurf aus der CEO-Vorgabe „Buch anlegen“, Referenzbild 01) | Anforderungsmanager |
