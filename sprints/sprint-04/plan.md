# Sprint 04 – Buchdetails Teil 2

**Sprintziel (CEO, 2026-11-10):** Erweiterung der Buchdetails unter dem Titel:
- Statusauswahl-Pille,
- Lesefortschritt mit Menü „Aktuelle Seite“,
- Statistik-Pille mit Streak, Fortschritt in % und Sitzungen.

Das Zitat entfällt.

**Referenzen:** `REF-buchdetails-01.png` (Pille, Fortschritt, Statistik) und `REF-buchdetails-03-aktuelle-seite.png` (Menü „Aktuelle Seite“).

## REQs
_Folgen nach der Abstimmung mit dem CEO._

## Freigabe CEO 2026-11-10 (Teil A)
„Starte mit der Umsetzung der Funktion, ein Buch anzulegen. Es sollen im neuen Prototypen KEINE Testbücher vorhanden sein.“
- **Umfang Teil A:** REQ-029 bis REQ-033, dazu REQ-005 (Plus-Schaltfläche und Menü) und REQ-008 AK-6 (Feld Autor).
- **Später (Teil B):** REQ-021 bis REQ-028.
- **Prototyp ohne Testbücher:** Ein Build-Schalter `VITE_DEMODATEN=aus` schaltet die Demodaten ab. Die Tests nutzen weiter die Demodaten bzw. eigene Testdaten. Die Entscheidung über Testbücher in der echten App trifft der CEO später (siehe To-do).
- **Speicherung neuer Bücher:** dauerhaft laut REQ-034 (CEO-Ergänzung 2026-11-10), siehe unten.

## Schnittstellen-Absprache Teil A (verbindlich, Abweichungen melden)

**Plus-Menü (REQ-005, REQ-029)**
- Ein Tipp auf `aria-label="Buch hinzufügen"` öffnet ein `role="menu"` mit `aria-label="Buch hinzufügen"`.
- Darin steht genau ein `role="menuitem"` mit dem Text „Von Hand eintragen“, dem Untertitel „Wenn deine Ausgabe fehlt“ und `data-icon="icon-hand-eintragen.png"`.
- Solange das Menü offen ist, trägt die Schaltfläche `aria-label="Menü schließen"` und `data-icon="icon-x.png"`. Ein Tipp darauf oder auf `data-menue-hintergrund` schließt das Menü.

**Blatt „Manueller Eintrag“ (REQ-030)**
- `role="dialog"` mit `aria-label="Manueller Eintrag"`.
- Elemente:
  - `<button aria-label="Schließen">`
  - der Ziehgriff `data-ziehgriff`
  - `<button data-cover-hinzufuegen>` mit dem Text „Cover hinzufügen“
  - die Eingabefelder per `<label>`: Titel, Autor, Jahr, Seiten. Die Platzhalter lauten „Buchtitel“, „Autor“, „2024“ und „496“.
  - `<button>` „+ Erscheinungsdatum hinzufügen“ ohne Funktion
  - `<button>` „Hinzufügen“
- Die Android-Zurück-Taste wird über eine Funktion `onZurueck` der Ansicht abgebildet, testbar per Prop bzw. Ereignis. Das Herunterziehen am Griff kann der Tester per Pointer-Ereignissen auslösen.

**Validierung (REQ-031)**
- Fehlt der Titel (leer oder nur Leerzeichen), erscheint `role="alert"` mit „Bitte gib einen Titel ein“.
- Ein ungültiges Jahr (1–3 Ziffern) markiert das Feld mit `data-fehler="true"` und Farbe `primaer`.
- In beiden Fällen wird nichts gespeichert. Die Markierung verschwindet bei der nächsten Eingabe im jeweiligen Feld.

**Anlegen (REQ-031)**
- Gespeichert wird über `BookRepository.save` mit `status` `ungelesen`.
- Danach erscheinen die Buchdetails des neuen Buchs (`section aria-label="Buchdetails"`).
- `BuecherAnsicht` nimmt optional `repository` als Prop entgegen, damit Tests einen eigenen Speicher übergeben können.

**Cover (REQ-032)**
- Der Bildfluss entspricht REQ-015 bis REQ-017 (gleiche Bildquelle-Prop). Das Bild wird vorgemerkt und beim Anlegen als Frontcover im `ImageStore` gespeichert. Der Zuschnitt startet mit `data-startformat="cover"`.

**Daten (REQ-008, REQ-033)**
- `Buch` bekommt die optionalen Felder `autor?: string`, `erscheinungsjahr?: number` und `erscheinungsdatum?: string` (Format TT.MM.JJJJ) sowie `seitenanzahl?: number`. Für die Seitenanzahl ist der Name abgestimmt mit REQ-025, das in Teil B umgesetzt wird.

## Ergänzung CEO 2026-11-10 (Teil A)
„Alle angelegten Bücher sollen im Prototypen aber bitte dauerhaft gespeichert werden mit allem drum und dran.“ → neuer REQ-034 „Buchdaten dauerhaft speichern“ (Anforderungsmanager).

**Absprache**
- `BookRepository` bekommt dauerhafte Implementierungen:
  - Web/Artefakt: IndexedDB, mit Rückfall auf den Arbeitsspeicher, wenn IndexedDB gesperrt ist.
  - Gerät: SQLite mit versionierter Migration.
- Diese Implementierungen bestehen denselben Vertragstest wie InMemory, einschließlich eines „Neustarts“ (neue Instanz auf denselben Speicher).
- Gespeichert werden alle Felder des Buchs (Titel, Autor, Jahr, Erscheinungsdatum, Seitenanzahl, Status). Die Cover bleiben im `ImageStore`.
- **Test-Seam:** `BuecherAnsicht` nimmt `repository` als Prop entgegen (unverändert). Für Persistenz-Tests übergibt der Tester zwei Ansichten mit derselben Repository-Instanz bzw. demselben Speicher.
