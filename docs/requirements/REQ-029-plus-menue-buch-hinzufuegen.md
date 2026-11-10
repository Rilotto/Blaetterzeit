---
id: REQ-029
titel: Seite „Bücher“ – Menü nach Antippen der Plus-Schaltfläche mit der Option „Von Hand eintragen“
status: Abgestimmt
prioritaet: Must
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

Priorität: Must (vom CEO bestätigt, 2026-11-10).

## Anforderung (Satzschablone)

**Öffnen**
- Wenn der Nutzer auf der Seite „Bücher“ die Plus-Schaltfläche (REQ-005) antippt, muss das System das Menü „Buch hinzufügen“ anzeigen.
- Solange das Menü „Buch hinzufügen“ geöffnet ist, muss das System die Seite „Bücher“ abdunkeln, so wie die Buchdetails beim Menü „Aktuelle Seite“ (Abdunklung, REQ-024).
- Solange das Menü „Buch hinzufügen“ geöffnet ist, muss das System in der Plus-Schaltfläche statt des Plus-Icons ein „×“ darstellen (CEO-bestätigter Vorschlag). Ist das Menü geschlossen, zeigt die Plus-Schaltfläche wieder das Plus-Icon.

**Inhalt**
- Das System muss im Menü „Buch hinzufügen“ genau eine Option anzeigen: „Von Hand eintragen“.
- Das System muss die Option mit dem Titel „Von Hand eintragen“ und darunter dem Untertitel „Wenn deine Ausgabe fehlt“ darstellen.
- Das System muss links neben der Option ein Icon in einer Icon-Kachel darstellen, das dem Icon im Referenzbild nachgebildet ist (CEO: „Kopiere … das Icon“), im technischen Stil der übrigen nachgebildeten Icons (REQ-005: einfarbiges Linien-Icon auf transparentem Grund, von der App eingefärbt, keine Icon-Bibliothek).

**Wirkung und Schließen**
CEO (wörtlich): „Das Menü schließt sich nur durch einen Klick auf ein Feld innerhalb des Menüs (weitere Optionen im Menü werden später ergänzt) oder durch einen Klick außerhalb des Menüs.“
- Wenn der Nutzer die Option „Von Hand eintragen“ antippt, muss das System das Menü „Buch hinzufügen“ schließen und das Blatt „Manueller Eintrag“ (REQ-030) anzeigen.
- Wenn der Nutzer außerhalb des Menüs tippt, muss das System das Menü schließen, ohne eine weitere Ansicht zu öffnen.
- Wenn der Nutzer die Plus-Schaltfläche antippt, während sie „×“ zeigt, muss das System das Menü schließen, ohne eine weitere Ansicht zu öffnen (CEO-bestätigter Vorschlag).
- Das System darf das Menü auf keine andere Weise schließen.

**Farben**
- Das System muss alle Farben des Menüs über Farbrollen aus zentralen Farbrubriken beziehen (REQ-002; CLAUDE.md „Farben auf Zuruf“). Zuordnung (CEO-bestätigter Vorschlag, 2026-11-10):

| Element | Farbrubrik |
|---|---|
| Menüfläche | Hintergrund |
| Rahmen des Menüs | GhostFrame |
| Abdunklung der Seite | wie Abdunklung beim Menü „Aktuelle Seite“ (REQ-024) |
| Icon-Kachel | Ghost |
| Icon | Primär |
| Titel „Von Hand eintragen“ | Dunkelbraun |
| Untertitel „Wenn deine Ausgabe fehlt“ | Tertiär, kursiv (Format wie „Alle ansehen ›“, REQ-009) |
| „×“ in der Plus-Schaltfläche | wie das Plus-Icon (Plusschaltfläche-Vorder-/Hintergrund, REQ-005) |

- Konkrete Farbwerte sind kein Akzeptanzkriterium.

**Gestaltung**
- Das System muss Form, Schrift und Anordnung des Menüs am Referenzbild ausrichten (CEO: „Kopiere dieses Menü“).

## Akzeptanzkriterien

### AK-1 Plus öffnet das Menü
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** der Nutzer die Plus-Schaltfläche antippt
- **Dann** erscheint das Menü „Buch hinzufügen“
- **Und** die Seite „Bücher“ ist abgedunkelt

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
- **Gegeben** der Wert einer Farbrubrik aus der Tabelle „Farben“ wird an der zentralen Stelle geändert
- **Wenn** das Menü geöffnet wird
- **Dann** sind alle Elemente mit dieser Farbrubrik im geänderten Wert dargestellt
- **Und** kein Element des Menüs hat einen eigenen, davon abweichenden Farbwert

### AK-6 „×“ bei geöffnetem Menü
- **Gegeben** die Seite „Bücher“ wird angezeigt und das Menü ist geschlossen
- **Wenn** der Nutzer die Plus-Schaltfläche antippt
- **Dann** zeigt die Plus-Schaltfläche „×“ statt des Plus-Icons
- **Und** sobald das Menü wieder geschlossen ist (gleich auf welchem erlaubten Weg), zeigt sie wieder das Plus-Icon

### AK-7 Schließen durch Tippen außerhalb
- **Gegeben** das Menü „Buch hinzufügen“ ist geöffnet
- **Wenn** der Nutzer außerhalb des Menüs tippt
- **Dann** ist das Menü geschlossen, die Abdunklung ist weg
- **Und** es ist keine weitere Ansicht geöffnet (insbesondere nicht das Blatt „Manueller Eintrag“)

### AK-8 Schließen durch Tippen auf „×“
- **Gegeben** das Menü „Buch hinzufügen“ ist geöffnet
- **Wenn** der Nutzer die Plus-Schaltfläche („×“) antippt
- **Dann** ist das Menü geschlossen
- **Und** es ist keine weitere Ansicht geöffnet

### AK-9 Tippen auf die Menüfläche außerhalb der Option schließt nicht
- **Gegeben** das Menü „Buch hinzufügen“ ist geöffnet
- **Wenn** der Nutzer auf die Menüfläche, aber nicht auf die Option „Von Hand eintragen“ tippt
- **Dann** bleibt das Menü geöffnet

## Abgrenzung (nicht Teil dieses REQ)

- Optionen „Online suchen“, „Barcode scannen“, „Deine Bücher importieren“ (CEO: „nur die Option 'Von Hand eintragen'“). Weitere Optionen ergänzt der CEO später.
- Inhalt und Verhalten des Blatts „Manueller Eintrag“ (REQ-030 bis REQ-032).
- Konkrete Farbwerte und Maße als Akzeptanzkriterium.

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-005:** Plus-Schaltfläche; deren bisherige Vorgabe „Antippen bewirkt nichts“ wird für die Plus-Schaltfläche durch diesen REQ abgelöst (REQ-005 angepasst). Der Wechsel „+“/„×“ ist der einzige Zustandswechsel der Plus-Schaltfläche.
- **REQ-024:** Abdunklung als Vorbild.
- **REQ-030:** Blatt „Manueller Eintrag“.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-10 | Erstellt (Entwurf aus der CEO-Vorgabe „Buch anlegen“, Referenzbild 01) | Anforderungsmanager |
| 2026-11-10 | CEO-Antworten eingearbeitet. F5: Schließen nur über eine Option, Tippen außerhalb oder „×“; „+“ wird bei geöffnetem Menü zu „×“; Abdunklung wie „Aktuelle Seite“ (neu AK-6 bis AK-9, AK-1 ergänzt). F7: Farbzuordnung (Tabelle). Priorität Must (Bestätigung ausstehend). Status „Abgestimmt“ auf Weisung des Scrum Masters nach den übermittelten CEO-Antworten | Anforderungsmanager |
| 2026-11-10 | Vom CEO mit „Ja“ bestätigt: „×“ in den Farben des Plus-Icons. Priorität Must vom CEO bestätigt („ja“). Status bleibt „Abgestimmt“ | Anforderungsmanager |
