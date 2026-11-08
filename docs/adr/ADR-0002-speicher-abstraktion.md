# ADR-0002: Speicher hinter Repository-Schnittstellen

- **Status:** Angenommen
- **Datum:** 2026-11-08
- **Entscheider:** CEO

## Kontext
Phase 1 speichert lokal (SQLite auf dem Handy), Phase 2 auf einem Server. Der Wechsel darf kein freigegebenes Verhalten verändern.

## Entscheidung
- UI und Fachlogik greifen **nur** über Schnittstellen (`BookRepository`, später `ImageStore`) auf Daten zu.
- Die Auswahl der Implementierung passiert an genau einer Stelle: `src/storage/index.ts`.
- Jede Implementierung muss denselben **Vertragstest** bestehen (`tests/contract/`).
- IDs sind UUIDs; Datenbankänderungen nur über versionierte Migrationen.
- Ein Export/Import (JSON + Bilder als ZIP) dient als Backup und als Umzugsweg auf den Server.

## Konsequenzen
- Akzeptanztests prüfen Verhalten über die Schnittstelle → beim Web-Umbau laufen dieselben Regressionstests gegen den neuen Speicher.
- Etwas mehr Code als direkter Datenbankzugriff.
