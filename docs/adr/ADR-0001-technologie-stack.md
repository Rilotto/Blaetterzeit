# ADR-0001: Technologie-Stack

- **Status:** Angenommen
- **Datum:** 2026-11-08
- **Entscheider:** CEO

## Kontext
Blätterzeit soll zunächst als installierbare Android-App (APK) auf dem Galaxy S23 Ultra laufen und später ohne Neuentwicklung zur Web-App werden.

## Entscheidung
- **Frontend:** TypeScript + React + Vite
- **Android-Hülle:** Capacitor (erzeugt APK aus der Web-App)
- **Lokaler Speicher (Phase 1):** SQLite über `@capacitor-community/sqlite`
- **Tests:** Vitest (+ Testing Library); später Playwright für UI-Ende-zu-Ende
- **CI/CD:** GitHub Actions, signierte APK bei jedem Tag `v*`

## Alternativen
- **Tauri 2:** Android-Support noch jung, kleineres Plugin-Ökosystem.
- **Flutter / Kotlin nativ:** gute Apps, aber Web-Umbau deutlich teurer.
- **Reine PWA:** keine APK, Browser kann Daten löschen.

## Konsequenzen
- Dasselbe Frontend läuft später im Browser; nur die Speicherschicht wird ergänzt (ADR-0002).
- APK-Updates erfordern immer denselben Signaturschlüssel (siehe `docs/release-prozess.md`).
