# Sprint 02 – Seite „Bücher“ (Grundgerüst)

**Sprintziel (CEO, 2026-11-09):** Grundgerüst der Seite „Bücher“ mit Platzhaltern. Dazu gehören die Überschrift „Deine Bücher“, der Filter-/Einstellungen-Button, der Plus-Button und eine dynamisch konfigurierbare, horizontal scrollbare Filterleiste. Das Referenzbild dient als grobe Orientierung.
Außerdem wird der Platzhaltertext „under construction :)“ in der Farbrubrik Tertiär lesbar gemacht.

**Sprintende:** Lieferung des Prototyps. Das Sprintende legt der CEO mit dem Scrum Master fest.

**Basis:** Branch `sprint-02/buecher-grundgeruest`, abgezweigt von `sprint-01/prototyp-basis`, dessen PR noch offen ist.

## Entscheidungen des CEO
- Das Einfrieren über ein Release erfolgt erst später (2026-11-09).
- Prioritäten werden nach MoSCoW vergeben, wie es IREB vorsieht.

## REQs
_Werden vom Anforderungsmanager mit dem CEO abgestimmt. Erst danach beginnt die Umsetzung._

## Schnittstellen-Absprache Entwickler ↔ Tester

### REQ-004 (Platzhaltertext Tertiär)
- Der Platzhaltertext „under construction :)“ steht in einem Element innerhalb von `<main>`.
- Dieses Element setzt seine Textfarbe per Inline-Style über `var(--bz-farbe-tertiaer)`, also direkt aus der Farbrubrik Tertiär.
- Die Farbe ist nur dort gesetzt und wird nicht über die App-Wurzel vererbt.
