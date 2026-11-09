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

### REQ-005 bis REQ-012 (Seite „Bücher“), Runde 1
Diese Absprache ist verbindlich. Der Entwickler darf intern frei bauen, muss aber diese von außen prüfbaren Merkmale einhalten. Abweichungen meldet er, statt sie still zu ändern.

**Daten (REQ-008)**
- `src/domain/buch.ts` exportiert:
  - den Typ `Buch` mit `{ id: string; titel: string; cover?: string; status: LesestatusId }`, später erweiterbar;
  - `LESESTATUS` als zentrale, geordnete Liste `{ id, bezeichnung }`. Die IDs sind `ungelesen`, `am_lesen`, `gelesen`, `abgebrochen`, `wunschliste`, die Bezeichnungen entsprechen der Schreibweise des CEO.
- Die alten Status in `src/domain/book.ts` werden entfernt bzw. ersetzt.
- **Testbücher:** liegen in `demo/testbuecher.json` als Array von `{ id, titel, status }`. Der Tester legt die Datei an, der Entwickler bindet sie als Demodaten ein.

**Ansicht**
- `src/views/BuecherAnsicht.tsx` (Default-Export) nimmt die optionalen Props `{ filter?: FilterDefinition[]; buecher?: Buch[] }` entgegen. Ohne Props gelten die zentrale Konfiguration und die Demodaten. Die App zeigt sie für den Menüpunkt „Bücher“.

**Kopfbereich (REQ-005)**
- Überschrift: `<h1>` mit dem Text „Deine Bücher“.
- Zwei `<button>`: `aria-label="Filter und Einstellungen"` und `aria-label="Buch hinzufügen"`.
- Icons: Je Button gibt es ein Icon-Element mit `data-icon="icon-regler.png"` bzw. `data-icon="icon-plus.png"`. Die nachgebildeten Icons liegen in `src/assets/icons/` und werden wie die Navigations-Icons eingefärbt.
- Antippen bewirkt nichts und setzt auch keinen aktiven Zustand.

**Filterleiste (REQ-006, REQ-007)**
- Konfiguration: `src/buecher/filterKonfiguration.ts` exportiert `filterKonfiguration: FilterDefinition[]`. Eine `FilterDefinition` hat mindestens `{ id, name, reihenfolge, standard?: boolean, logik?: (buecher) => … }`.
- Darstellung:
  - ein Container `role="group"` mit `aria-label="Filter"`, darin ein `<button>` je Filter, sortiert nach `reihenfolge`;
  - der aktive Filter hat `aria-pressed="true"`, alle anderen `aria-pressed="false"`;
  - der Container hat einen eigenen horizontalen Scrollbereich (Inline-Style `overflowX: 'auto'`).
- Verhalten: Beim Rendern der Ansicht ist der Standardfilter aktiv („Für dich“). Wird ein Filter aktiv, ruft das seinen Anknüpfungspunkt `logik` auf, ohne sichtbare Wirkung.

**Abschnitt „Noch zu lesen“ (REQ-009)**
- `<section aria-label="Noch zu lesen">` mit `<h2>` „Noch zu lesen“ und `<button>` „Alle ansehen ›“, das beim Antippen nichts bewirkt.
- Zuordnung der Status zum Abschnitt: `src/buecher/abschnittKonfiguration.ts`, für „Noch zu lesen“ aktuell `['ungelesen']`.
- Buchliste: `<ul aria-label="Noch zu lesen">` mit einem `<li>` je Buch.
  - Im `<li>` steckt entweder ein `<img alt="<Titel>">` (Cover) oder der Cover-Platzhalter, dazu ein Titel-Element mit `data-buchtitel`.
  - Die Liste hat einen eigenen horizontalen Scrollbereich (`overflowX: 'auto'`).

**Cover-Platzhalter (REQ-010)**
- Element mit `data-cover-platzhalter`, darin ein Icon-Element mit `data-icon="icon-herz.png"`.
- Es gibt genau eine wiederverwendbare Komponente, `src/components/CoverPlatzhalter.tsx`.

**Platzhalter bei leerer Liste (REQ-011)**
- Element mit `data-leere-liste`, darin `data-icon="icon-herz.png"` und der Text „Wie wäre es mit einem neuen Buch?“.
- Es erscheint nur, wenn der Abschnitt keine Bücher hat. Ein Buch ohne Cover zeigt dagegen `data-cover-platzhalter` mit seinem echten Titel.

**Sagas und Sammlungen (REQ-012)**
- `<section aria-label="Sagas">` und `<section aria-label="Sammlungen">`, jeweils mit `<h2>` und einem `data-cover-platzhalter` ohne Titel.

**Farben**
- Inline-Style `var(--bz-farbe-<id>)` mit den Rubrik-IDs `hintergrund`, `primaer`, `sekundaer`, `tertiaer`, `ghost`, `ghostframe`, `schrifttertiaer` und `dunkelbraun`.
- Die Werte stehen nur in `src/theme/farben.ts`.

**Bestehende Tests:** Der Tester passt die strengeren REQ-002-Tests (AK-12 „Platzhalter für alle fünf Menüpunkte“ und AK-13 „kein Element in `<main>` mit eigenem Hintergrund“) auf das an, was REQ-002 tatsächlich verlangt, und begründet das im Testbericht.
