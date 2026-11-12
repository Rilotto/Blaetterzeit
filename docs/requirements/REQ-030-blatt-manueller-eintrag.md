---
id: REQ-030
titel: Blatt „Manueller Eintrag“ – Aufbau und Eingabefelder
status: Implementiert
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **in einem Blatt „Manueller Eintrag“ die Angaben zu einem neuen Buch eintragen**, damit **ich Bücher anlegen kann, die ich nicht anders finde**.

Vorgabe des CEO (wörtlich, 2026-11-10): „Kopiere dieses Menü, das Icon, und die darauffolgende Seite 'Manueller Eintrag'. Behandle alles gleich wie bislang auch, lege die Farben fest wie bisher auch.“

Referenzbild: [referenzen/REF-buch-anlegen-02-manueller-eintrag.png](referenzen/REF-buch-anlegen-02-manueller-eintrag.png). Die optische Übereinstimmung prüft der CEO im Prototyp; sie ist kein Akzeptanzkriterium.

Priorität: Must (vom CEO bestätigt, 2026-11-10).

## Anforderung (Satzschablone)

**Aufbau (von oben nach unten, wie im Referenzbild)**
- Das System muss das Blatt „Manueller Eintrag“ bildschirmfüllend darstellen.
- Das System muss oben mittig einen Ziehgriff darstellen.
- Das System muss die Überschrift „Manueller Eintrag“ und rechts daneben eine runde X-Schaltfläche darstellen.
- Das System muss darunter ein hochformatiges Feld mit gestricheltem Rahmen, Kamera-Icon und dem Text „Cover hinzufügen“ darstellen (Funktion: REQ-032).
- Das System muss darunter eine Formular-Karte mit folgenden Feldern darstellen, je mit Feldbeschriftung in Großbuchstaben und durch Trennlinien getrennt:
  - „TITEL“ mit Platzhaltertext „Buchtitel“,
  - „AUTOR“ mit Platzhaltertext „Autor“,
  - in einer Zeile nebeneinander „JAHR“ mit Platzhaltertext „2024“ und „SEITEN“ mit Platzhaltertext „496“,
  - „ERSCHEINUNGSDATUM“ mit dem Eintrag „+ Erscheinungsdatum hinzufügen“.
- Das System muss unter der Formular-Karte die Pille „Hinzufügen“ darstellen (Wirkung: REQ-031).
- Das System muss Platzhaltertexte nur anzeigen, solange das jeweilige Feld leer ist; ein Platzhaltertext ist kein eingetragener Wert. Das gilt für alle Felder: Titel, Autor, Jahr und Seiten (CEO, wörtlich: „Ja, bei allen Feldern verschwinden die 'Vorbefüllungen'.“).

**Eingabe**
- Das System muss dem Nutzer die Möglichkeit bieten, Titel, Autor, Jahr und Seiten einzutragen.
- „JAHR“ ist das Erscheinungsjahr des Buches, „SEITEN“ die Seitenanzahl des Buches (REQ-025) (CEO 2026-11-10). Bedeutung und Speicherung: REQ-031, REQ-033.
- Das System darf im Feld „JAHR“ nur Ziffern annehmen, höchstens vier (vom CEO bestätigt, 2026-11-10).
- Eine Eingabe mit nur einer bis drei Ziffern ist ungültig; Hervorhebung des Feldes in Primär beim Antippen von „Hinzufügen“ und Verhalten beim Anlegen: REQ-031 (CEO, 2026-11-10).
- Wenn der Nutzer „+ Erscheinungsdatum hinzufügen“ antippt, darf sich im Blatt nichts ändern (CEO: „'Erscheinungsdatum hinzufügen' bekommt noch keine Funktion.“). Die Funktion steht in der To-do-Liste (`docs/todo.md`).

**Schließen**
CEO (wörtlich): „'Manueller Eintrag' schließt sich durch einen Klick auf das X oder auf Hinzufügen. Bei X wird nichts gespeichert, bei Hinzufügen hingegen schon.“ Ergänzung (wörtlich, 2026-11-10): „Doch, die Android-Zurück-Taste kann das auch schließen, aber ohne zu speichern, sowie das Herunterziehen am Griff.“
- Wenn der Nutzer die X-Schaltfläche antippt, die Android-Zurück-Taste betätigt oder das Blatt am Ziehgriff nach unten zieht, muss das System das Blatt schließen, ohne ein Buch anzulegen und ohne eingetragene Angaben oder ein vorgemerktes Cover zu speichern; danach wird die Seite „Bücher“ angezeigt.
- Das Schließen über „Hinzufügen“ (mit Speichern) legt REQ-031 fest.
- Das System darf das Blatt auf keine andere Weise schließen (insbesondere nicht durch bloßes Antippen des Ziehgriffs).

**Icons**
- Das System muss Kamera-Icon und X-Icon dem Referenzbild nachbilden, im technischen Stil der übrigen nachgebildeten Icons (REQ-005), ohne Icon-Bibliothek.
- Das System muss Form, Schrift und Anordnung am Referenzbild ausrichten.

**Farben**
- Das System muss alle Farben über Farbrollen aus zentralen Farbrubriken beziehen (REQ-002; „Farben auf Zuruf“). Zuordnung (CEO-bestätigter Vorschlag und CEO-Aussage zur Pille, 2026-11-10):

| Element | Farbrubrik |
|---|---|
| Fläche des Blatts | Hintergrund |
| Ziehgriff | Tertiär |
| Überschrift „Manueller Eintrag“ | Dunkelbraun |
| X-Schaltfläche | wie im Menü „Aktuelle Seite“ (REQ-024): Fläche Ghost, Rahmen GhostFrame, X Dunkelbraun |
| Feld „Cover hinzufügen“: Fläche | Ghost |
| Feld „Cover hinzufügen“: gestrichelter Rahmen | GhostFrame |
| Feld „Cover hinzufügen“: Kamera-Icon und Text | Tertiär |
| Formular-Karte: Fläche | Ghost |
| Formular-Karte: Rahmen | GhostFrame |
| Feldbeschriftungen (klein, Großbuchstaben) | Dunkelbraun |
| Platzhaltertexte | Tertiär |
| eingegebener Text | Dunkelbraun |
| Trennlinien | GhostFrame |
| „+ Erscheinungsdatum hinzufügen“ | Primär |
| Pille „Hinzufügen“: Fläche | Primär (CEO: „in vollem Bordeaux, wie die 'Sichern'-Pille“) |
| Pille „Hinzufügen“: Schrift | Hintergrund |

- Die Pille „Hinzufügen“ wird immer in voller Farbe dargestellt und nie blass/deaktiviert (CEO: „'Hinzufügen' ist immer aktiv und daher immer antippbar.“). Die blasse Darstellung im Referenzbild wird nicht übernommen.
- Konkrete Farbwerte sind kein Akzeptanzkriterium.

## Akzeptanzkriterien

### AK-1 Aufbau des Blatts
- **Gegeben** das Blatt „Manueller Eintrag“ ist geöffnet
- **Wenn** der Nutzer es betrachtet
- **Dann** sieht er Ziehgriff, Überschrift „Manueller Eintrag“, X-Schaltfläche, das Feld „Cover hinzufügen“ mit Kamera-Icon, die Formular-Karte und die Pille „Hinzufügen“ in dieser Reihenfolge von oben nach unten

### AK-2 Felder mit Beschriftung und Platzhaltertext
- **Gegeben** das Blatt ist neu geöffnet und nichts eingetragen
- **Wenn** der Nutzer die Formular-Karte betrachtet
- **Dann** zeigt sie „TITEL“/„Buchtitel“, „AUTOR“/„Autor“, „JAHR“/„2024“ und „SEITEN“/„496“ nebeneinander sowie „ERSCHEINUNGSDATUM“ mit „+ Erscheinungsdatum hinzufügen“

### AK-3 Platzhaltertext verschwindet bei Eingabe
- **Gegeben** das Blatt ist geöffnet
- **Wenn** der Nutzer in eines der Felder „TITEL“, „AUTOR“, „JAHR“ oder „SEITEN“ etwas eingibt
- **Dann** wird in diesem Feld die Eingabe statt des Platzhaltertexts („Buchtitel“, „Autor“, „2024“ bzw. „496“) angezeigt
- **Und** wenn der Nutzer die Eingabe wieder vollständig löscht, erscheint dort wieder der Platzhaltertext

### AK-4 Icons nachgebildet
- **Gegeben** das Blatt ist geöffnet
- **Wenn** die Herkunft von Kamera-Icon und X-Icon geprüft wird
- **Dann** sind es im Projekt abgelegte, nachgebildete Icon-Dateien und keine Icons aus einer externen Icon-Bibliothek

### AK-5 Farben aus zentralen Farbrubriken
- **Gegeben** der Wert einer Farbrubrik aus der Tabelle „Farben“ wird an der zentralen Stelle geändert
- **Wenn** das Blatt geöffnet wird
- **Dann** sind alle Elemente mit dieser Farbrubrik im geänderten Wert dargestellt
- **Und** kein Element hat einen eigenen, davon abweichenden Farbwert

### AK-6 „+ Erscheinungsdatum hinzufügen“ ohne Funktion
- **Gegeben** das Blatt ist geöffnet
- **Wenn** der Nutzer „+ Erscheinungsdatum hinzufügen“ antippt
- **Dann** ändert sich im Blatt nichts und es öffnet sich keine Eingabe

### AK-7 X schließt ohne Speichern
- **Gegeben** im Blatt sind Titel und Autor eingetragen
- **Wenn** der Nutzer die X-Schaltfläche antippt
- **Dann** ist das Blatt geschlossen und die Seite „Bücher“ wird angezeigt
- **Und** es wurde kein neues Buch angelegt

### AK-8 Antippen des Ziehgriffs schließt nicht
- **Gegeben** das Blatt ist geöffnet und Titel ist eingetragen
- **Wenn** der Nutzer den Ziehgriff nur antippt
- **Dann** bleibt das Blatt geöffnet und der Titel eingetragen

### AK-10 Android-Zurück-Taste schließt ohne Speichern
- **Gegeben** im Blatt sind Titel und Autor eingetragen
- **Wenn** der Nutzer die Android-Zurück-Taste betätigt
- **Dann** ist das Blatt geschlossen und die Seite „Bücher“ wird angezeigt
- **Und** es wurde kein neues Buch angelegt

### AK-11 Herunterziehen am Ziehgriff schließt ohne Speichern
- **Gegeben** im Blatt sind Titel und Autor eingetragen
- **Wenn** der Nutzer das Blatt am Ziehgriff nach unten zieht
- **Dann** ist das Blatt geschlossen und die Seite „Bücher“ wird angezeigt
- **Und** es wurde kein neues Buch angelegt

### AK-12 Jahr nur vier Ziffern
- **Gegeben** das Blatt ist geöffnet
- **Wenn** der Nutzer in das Feld „JAHR“ „20a245“ eingibt
- **Dann** zeigt das Feld höchstens vier Ziffern und keine anderen Zeichen

### AK-9 Pille „Hinzufügen“ immer aktiv dargestellt
- **Gegeben** das Blatt ist neu geöffnet und kein Feld ist ausgefüllt
- **Wenn** der Nutzer die Pille „Hinzufügen“ betrachtet
- **Dann** ist sie antippbar und in Primär mit Schrift in Hintergrund dargestellt (nicht blass oder deaktiviert)

## Abgrenzung (nicht Teil dieses REQ)

- Speichern des Buches über „Hinzufügen“ (REQ-031).
- Funktion von „Cover hinzufügen“ (REQ-032).
- Speicherung von Jahr und Erscheinungsdatum in den Buchdaten (REQ-033).
- Eingabe des Erscheinungsdatums (To-do-Liste).
- Konkrete Farbwerte und Maße als Akzeptanzkriterium.

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-029:** öffnet das Blatt.
- **REQ-024:** Vorbild der X-Schaltfläche; „Sichern“-Pille als Vorbild der Pille „Hinzufügen“.
- **REQ-025:** „SEITEN“ ist die Seitenanzahl.
- **REQ-031, REQ-032, REQ-033.**

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-10 | Erstellt (Entwurf aus der CEO-Vorgabe „Buch anlegen“, Referenzbild 02) | Anforderungsmanager |
| 2026-11-10 | CEO-Antworten eingearbeitet. F1: Pille „Hinzufügen“ immer aktiv, volles Bordeaux (AK-9). F2: Jahr = Erscheinungsjahr; „+ Erscheinungsdatum hinzufügen“ ohne Funktion, auf To-do-Liste (AK-6; frühere Anforderung „Erscheinungsdatum eintragen“ entfällt). F3: SEITEN = Seitenanzahl. F5: Schließen nur über X (ohne Speichern) oder „Hinzufügen“ (AK-7, AK-8). F7: Farbzuordnung. Priorität Must (Bestätigung ausstehend). Status „Abgestimmt“ auf Weisung des Scrum Masters nach den übermittelten CEO-Antworten | Anforderungsmanager |
| 2026-11-10 | CEO-Ergänzung: Schließen auch per Android-Zurück-Taste und Herunterziehen am Ziehgriff, jeweils ohne Speichern (neu AK-10, AK-11; AK-8 auf bloßes Antippen des Ziehgriffs reduziert). Platzhaltertexte verschwinden bei allen Feldern (AK-3 erweitert). Vom CEO mit „Ja“ bestätigt: nach X Seite „Bücher“, Jahr nur Ziffern, höchstens vier (neu AK-12). Priorität Must vom CEO bestätigt („ja“). Status bleibt „Abgestimmt“ | Anforderungsmanager |
| 2026-11-10 | Verweis ergänzt: 1–3 Ziffern im Feld „JAHR“ sind ungültig, Hervorhebung in Primär und Verhalten beim Anlegen in REQ-031 (AK-12, AK-13). Status bleibt „Abgestimmt“ | Anforderungsmanager |
