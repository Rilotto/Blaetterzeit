# Sprint 02 – Seite „Bücher“ (Grundgerüst)

**Sprintziel (CEO, 2026-11-09):** Grundgerüst der Seite „Bücher“ mit Platzhaltern. Dazu gehören die Überschrift „Deine Bücher“, der Filter-/Einstellungen-Button, der Plus-Button und eine dynamisch konfigurierbare, horizontal scrollbare Filterleiste. Das Referenzbild dient als grobe Orientierung.
Außerdem wird der Platzhaltertext „under construction :)“ in der Farbrubrik Tertiär lesbar gemacht.

**Sprintende:** Lieferung des Prototyps. Das Sprintende legt der CEO mit dem Scrum Master fest.

**Basis:** Branch `sprint-02/buecher-grundgeruest`, abgezweigt von `sprint-01/prototyp-basis`, dessen PR noch offen ist.

## Entscheidungen des CEO
- Das Einfrieren über ein Release erfolgt erst später (2026-11-09).
- Prioritäten werden nach MoSCoW vergeben, wie es IREB vorsieht.

## REQs
| REQ | Titel | Status |
|---|---|---|
| REQ-004 | Platzhaltertext in Tertiär | In Umsetzung (umgesetzt und getestet, Sichtprüfung offen) |
| REQ-005 | Seite „Bücher“: Kopfbereich | Abgestimmt 2026-11-09 |
| REQ-006 | Seite „Bücher“: Filterleiste | Abgestimmt 2026-11-09 |
| REQ-007 | Filterkonfiguration | Abgestimmt 2026-11-09 |
| REQ-008 | Buchdaten und Lesestatus | Abgestimmt 2026-11-09 |
| REQ-009 | Abschnitt „Noch zu lesen“ | Abgestimmt 2026-11-09 |
| REQ-010 | Cover-Platzhalter (Herz) | Abgestimmt 2026-11-09 |
| REQ-011 | Platzhalter bei leerer Liste | Abgestimmt 2026-11-09 |
| REQ-012 | Abschnitte „Sagas“ und „Sammlungen“ | Abgestimmt 2026-11-09 |

Testbücher: Auf Wunsch des CEO recherchiert der Tester drei Fantasy-Bücher (nur Titel und Status). Ablage: `demo/testbuecher.json`, außerhalb von `src/`, damit die Rollentrennung erhalten bleibt. Der Entwickler bindet die Datei als Demodaten ein.

**CEO-Vorgabe 2026-11-09:** Den Prototyp noch nicht bauen, um das Nutzungslimit zu schonen. Die Umsetzung von REQ-005 bis REQ-012 startet erst auf Zuruf des CEO.

## Schnittstellen-Absprache Entwickler ↔ Tester

### REQ-004 (Platzhaltertext Tertiär)
- Der Platzhaltertext „under construction :)“ steht in einem Element innerhalb von `<main>`.
- Dieses Element setzt seine Textfarbe per Inline-Style über `var(--bz-farbe-tertiaer)`, also direkt aus der Farbrubrik Tertiär.
- Die Farbe ist nur dort gesetzt und wird nicht über die App-Wurzel vererbt.
