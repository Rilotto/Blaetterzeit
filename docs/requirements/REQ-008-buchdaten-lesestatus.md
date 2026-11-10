---
id: REQ-008
titel: Buchdaten und zentrale Definition der Lesestatus
status: In Umsetzung
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **CEO** möchte ich **Bücher mit einheitlichen Grunddaten und zentral definierten Lesestatus führen**, damit **Abschnitte wie „Noch zu lesen“ Bücher anhand ihres Status anzeigen können und ich die Status später selbst festlegen kann**.

Vorgabe des CEO (wörtlich, Auszug aus [referenzen/CEO-vorgabe-noch-zu-lesen.txt](referenzen/CEO-vorgabe-noch-zu-lesen.txt)): „Jedes Buch sollte mindestens folgende Informationen unterstützen: Eindeutige ID, Buchtitel, Buchcover (optional), Buchstatus. Die Datenstruktur soll später erweiterbar sein, beispielsweise um Autor, Saga, Bewertung oder andere Informationen, ohne dass diese Felder bereits jetzt angezeigt werden müssen.“ – „Die möglichen Buchstatus darfst du nicht selbst endgültig festlegen. Frage mich zuerst, welche Buchstatus es in meiner App geben soll. Die Status sollen anschließend zentral definiert werden und nicht als verstreute Textvergleiche im Code stehen.“

Der Begriff „Buchstatus“ der Vorgabe ist gleichbedeutend mit „Lesestatus“ (Glossar).

## Anforderung (Satzschablone)

**Buchdaten**
- Das System muss zu jedem Buch eine eindeutige ID speichern.
- Das System muss zu jedem Buch einen Buchtitel speichern.
- Das System muss zu jedem Buch optional ein Buchcover speichern können; ein Buch ohne Buchcover ist zulässig.
- Das System muss zu jedem Buch genau einen Lesestatus speichern.
- Das System muss zu jedem Buch optional genau einen Autor speichern können; ein Buch ohne Autor ist zulässig (CEO 2026-11-10, Anzeige: REQ-028).
- Das System muss die Buchdaten so führen, dass weitere Angaben (z. B. Autor, Saga, Bewertung) ergänzt werden können, ohne bestehende Bücher oder bestehende Anzeigen zu verändern.
- Das System muss Buchdaten ausschließlich über die Repository-Schnittstelle lesen und speichern (ADR-0002).

**Lesestatus**
- Das System muss die möglichen Lesestatus an genau einer zentralen Stelle definieren.
- Das System muss als Lesestatus ausschließlich die vom CEO festgelegten Werte in genau dieser Schreibweise anbieten: *ungelesen*, *am lesen*, *gelesen*, *abgebrochen*, *Wunschliste* (CEO-Bestätigung 2026-11-09).
- Das System darf an keiner anderen Stelle als der zentralen Definition Lesestatus über ihre Bezeichnungstexte vergleichen oder festlegen.

## Randbedingungen

- **Demodaten für den Prototyp (kein App-Feature):** Der Tester recherchiert drei Fantasy-Bücher und legt sie als Test-/Demodaten an, nur mit Buchtitel und Lesestatus, ohne Buchcover (es erscheint der Cover-Platzhalter, REQ-010). Mindestens eines hat den Lesestatus *ungelesen*. Die Demodaten sind nicht Teil der Anforderung an die App und kein Akzeptanzkriterium.
- **Demodaten, Vorgabe CEO 2026-11-10:** „setze alle Testbücher auf den Status 'ungelesen'“. Alle Demobücher haben damit den Lesestatus *ungelesen* (verschärft die bisherige Vorgabe „mindestens eines“, kein Widerspruch).
- **Demodaten, Ergänzung 2026-11-10:** Der Tester trägt bei allen Demobüchern den echten Autor ein (REQ-028).

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
- **Dann** sind es genau die fünf Werte *ungelesen*, *am lesen*, *gelesen*, *abgebrochen*, *Wunschliste* in dieser Schreibweise

### AK-5 Lesestatus nur zentral definiert
- **Gegeben** der Quellcode der App
- **Wenn** nach Stellen gesucht wird, die Lesestatus über ihre Bezeichnungstexte festlegen oder vergleichen
- **Dann** gibt es solche Stellen nur in der zentralen Definition

### AK-6 Optionaler Autor
- **Gegeben** ein Buch mit Autor „Vorname Nachname“ und ein Buch ohne Autor
- **Wenn** beide über die Repository-Schnittstelle gespeichert und wieder gelesen werden
- **Dann** hat das erste Buch unverändert diesen Autor
- **Und** das zweite Buch hat keinen Autor und ist ansonsten vollständig vorhanden

## Abgrenzung (nicht Teil dieses REQ)

- Anlegen, Bearbeiten und Löschen von Büchern durch den Nutzer (Plus-Schaltfläche, REQ-005: später, siehe `docs/todo.md`).
- Anzeige weiterer Angaben wie Saga oder Bewertung; Anzeige des Autors regelt REQ-028.
- Mehrere Autoren je Buch (CEO: „Nur ein Autor“).
- Ändern des Lesestatus in den Buchdetails.
- Welche Lesestatus zum Abschnitt „Noch zu lesen“ gehören (REQ-009).

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **ADR-0002:** Speicherzugriff nur über Repository-Schnittstellen.
- **REQ-007 (Filterlogik):** soll später auf den Lesestatus aufbauen (Glossar).
- **REQ-009, REQ-010:** nutzen Buchdaten und Lesestatus.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-09 | Erstellt (Entwurf aus der CEO-Vorgabe „Noch zu lesen“, Abschnitt „Buchdaten“ und „Dynamische Buchauswahl“) | Anforderungsmanager |
| 2026-11-09 | CEO-Antworten eingearbeitet: F1 Lesestatus-Liste bestätigt (ungelesen, am lesen, gelesen, abgebrochen, Wunschliste), „Buchstatus“ = „Lesestatus“; AK-4 konkretisiert. F5 Demodaten als Randbedingung. F7 Priorität Must. Vom CEO bestätigt 2026-11-09, Status „Abgestimmt“ | Anforderungsmanager |
| 2026-11-10 | Randbedingung Demodaten ergänzt: CEO-Vorgabe „alle Testbücher auf 'ungelesen'“ (keine Änderung an Anforderung oder AK) | Anforderungsmanager |
| 2026-11-10 | Optionales Feld Autor ergänzt (genau ein Autor; CEO: „Nur ein Autor, auch nur ein Name wie bei Alchemised ist in Ordnung.“), neu AK-6, Abgrenzung angepasst, Demodaten mit echten Autoren. Status von „Implementiert“ auf „Abgestimmt“, da AK-6 noch umzusetzen ist (REQ war nicht eingefroren) | Anforderungsmanager |
