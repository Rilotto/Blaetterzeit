---
id: REQ-008
titel: Buchdaten und zentrale Definition der Lesestatus
status: Entwurf
prioritaet: offen
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **CEO** möchte ich **Bücher mit einheitlichen Grunddaten und zentral definierten Lesestatus führen**, damit **Abschnitte wie „Noch zu lesen“ Bücher anhand ihres Status anzeigen können und ich die Status später selbst festlegen kann**.

Vorgabe des CEO (wörtlich, Auszug aus [referenzen/CEO-vorgabe-noch-zu-lesen.txt](referenzen/CEO-vorgabe-noch-zu-lesen.txt)): „Jedes Buch sollte mindestens folgende Informationen unterstützen: Eindeutige ID, Buchtitel, Buchcover (optional), Buchstatus. Die Datenstruktur soll später erweiterbar sein, beispielsweise um Autor, Saga, Bewertung oder andere Informationen, ohne dass diese Felder bereits jetzt angezeigt werden müssen.“ – „Die möglichen Buchstatus darfst du nicht selbst endgültig festlegen. Frage mich zuerst, welche Buchstatus es in meiner App geben soll. Die Status sollen anschließend zentral definiert werden und nicht als verstreute Textvergleiche im Code stehen.“

## Anforderung (Satzschablone)

**Buchdaten**
- Das System muss zu jedem Buch eine eindeutige ID speichern.
- Das System muss zu jedem Buch einen Buchtitel speichern.
- Das System muss zu jedem Buch optional ein Buchcover speichern können; ein Buch ohne Buchcover ist zulässig.
- Das System muss zu jedem Buch genau einen Lesestatus speichern.
- Das System muss die Buchdaten so führen, dass weitere Angaben (z. B. Autor, Saga, Bewertung) ergänzt werden können, ohne bestehende Bücher oder bestehende Anzeigen zu verändern.
- Das System muss Buchdaten ausschließlich über die Repository-Schnittstelle lesen und speichern (ADR-0002).

**Lesestatus**
- Das System muss die möglichen Lesestatus an genau einer zentralen Stelle definieren.
- Das System muss als Lesestatus ausschließlich die vom CEO festgelegten Werte anbieten: *(Liste wird nach Bestätigung durch den CEO eingetragen, siehe Offene Fragen)*.
- Das System darf an keiner anderen Stelle als der zentralen Definition Lesestatus über ihre Bezeichnungstexte vergleichen oder festlegen.

## Akzeptanzkriterien

### AK-1 Buch mit Pflichtangaben ohne Cover
- **Gegeben** ein Buch mit ID, Buchtitel und Lesestatus, aber ohne Buchcover
- **Wenn** es über die Repository-Schnittstelle gespeichert und wieder gelesen wird
- **Dann** sind ID, Buchtitel und Lesestatus unverändert vorhanden
- **Und** das Buch hat kein Buchcover

### AK-2 Buch mit Cover
- **Gegeben** ein Buch mit ID, Buchtitel, Lesestatus und Buchcover
- **Wenn** es über die Repository-Schnittstelle gespeichert und wieder gelesen wird
- **Dann** ist das Buchcover unverändert vorhanden

### AK-3 IDs sind eindeutig
- **Gegeben** mehrere gespeicherte Bücher, auch mit gleichem Buchtitel
- **Wenn** ihre IDs verglichen werden
- **Dann** hat jedes Buch eine andere ID

### AK-4 Nur die festgelegten Lesestatus
- **Gegeben** die zentrale Definition der Lesestatus
- **Wenn** die verfügbaren Lesestatus abgefragt werden
- **Dann** sind es genau die vom CEO festgelegten Werte, in der vom CEO genannten Schreibweise

### AK-5 Lesestatus nur zentral definiert
- **Gegeben** der Quellcode der App
- **Wenn** nach Stellen gesucht wird, die Lesestatus über ihre Bezeichnungstexte festlegen oder vergleichen
- **Dann** gibt es solche Stellen nur in der zentralen Definition

## Abgrenzung (nicht Teil dieses REQ)

- Anlegen, Bearbeiten und Löschen von Büchern durch den Nutzer (Plus-Schaltfläche, REQ-005: später).
- Anzeige weiterer Angaben wie Autor, Saga oder Bewertung.
- Ändern des Lesestatus in den Buchdetails.
- Welche Lesestatus zum Abschnitt „Noch zu lesen“ gehören (REQ-009).

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **ADR-0002:** Speicherzugriff nur über Repository-Schnittstellen.
- **Glossar „Lesestatus“:** vom CEO zuvor genannte Werte, deren Bestätigung offen ist.
- **REQ-007 (Filterlogik):** soll später auf den Lesestatus aufbauen (Glossar).
- **REQ-009, REQ-010:** nutzen Buchdaten und Lesestatus.

## Offene Fragen

- F1: Bestätigung der Lesestatus-Liste und ob „Buchstatus“ (Vorgabe) dasselbe ist wie „Lesestatus“ (Glossar).
- F7: Priorität.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-09 | Erstellt (Entwurf aus der CEO-Vorgabe „Noch zu lesen“, Abschnitt „Buchdaten“ und „Dynamische Buchauswahl“) | Anforderungsmanager |
