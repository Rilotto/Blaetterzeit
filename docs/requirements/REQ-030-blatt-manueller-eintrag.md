---
id: REQ-030
titel: Blatt „Manueller Eintrag“ – Aufbau und Eingabefelder
status: Entwurf
prioritaet: offen
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
- Das System muss Platzhaltertexte nur anzeigen, solange das jeweilige Feld leer ist; ein Platzhaltertext ist kein eingetragener Wert.

**Eingabe**
- Das System muss dem Nutzer die Möglichkeit bieten, Titel, Autor, Jahr und Seiten einzutragen.
- Das System muss dem Nutzer die Möglichkeit bieten, über „+ Erscheinungsdatum hinzufügen“ ein Erscheinungsdatum einzutragen (Art der Eingabe offen, F2).

**Icons und Gestaltung**
- Das System muss Kamera-Icon und X-Icon dem Referenzbild nachbilden, im technischen Stil der übrigen nachgebildeten Icons (REQ-005), ohne Icon-Bibliothek.
- Das System muss Form, Schrift und Anordnung am Referenzbild ausrichten.
- Das System muss alle Farben über Farbrollen aus zentralen Farbrubriken beziehen (REQ-002; „Farben auf Zuruf“). Zuordnung offen (F7).

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
- **Wenn** der Nutzer in das Feld „TITEL“ einen Text eingibt
- **Dann** wird der eingegebene Text statt „Buchtitel“ angezeigt
- **Und** wenn der Nutzer den Text wieder vollständig löscht, erscheint wieder „Buchtitel“

### AK-4 Icons nachgebildet
- **Gegeben** das Blatt ist geöffnet
- **Wenn** die Herkunft von Kamera-Icon und X-Icon geprüft wird
- **Dann** sind es im Projekt abgelegte, nachgebildete Icon-Dateien und keine Icons aus einer externen Icon-Bibliothek

### AK-5 Farben aus zentralen Farbrubriken
- **Gegeben** der Wert einer im Blatt verwendeten Farbrubrik wird an der zentralen Stelle geändert
- **Wenn** das Blatt geöffnet wird
- **Dann** sind alle Elemente mit dieser Farbrubrik im geänderten Wert dargestellt
- **Und** kein Element hat einen eigenen, davon abweichenden Farbwert

## Abgrenzung (nicht Teil dieses REQ)

- Speichern des Buches über „Hinzufügen“ (REQ-031).
- Funktion von „Cover hinzufügen“ (REQ-032).
- Speicherung von Jahr und Erscheinungsdatum in den Buchdaten (REQ-033).
- Konkrete Farbwerte und Maße als Akzeptanzkriterium.

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-029:** öffnet das Blatt.
- **REQ-031, REQ-032, REQ-033.**
- **REQ-025:** Feld „SEITEN“ – Verhältnis zur Seitenanzahl offen (F3).

## Offene Fragen

- F2: Jahr und Erscheinungsdatum – Bedeutung, beide nötig, Eingabeart des Datums.
- F3: Ist „SEITEN“ die Seitenanzahl des Buches (REQ-025)?
- F5: Schließen des Blatts (X, Ziehgriff, Zurück-Taste, Tippen außerhalb) und Umgang mit bereits eingetragenen Angaben.
- F7: Farbzuordnung und Priorität.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-10 | Erstellt (Entwurf aus der CEO-Vorgabe „Buch anlegen“, Referenzbild 02) | Anforderungsmanager |
