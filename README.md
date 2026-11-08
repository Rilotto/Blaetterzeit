# Blätterzeit 📚

Persönliche Buch-Tracking-App: zuerst Android-APK (Capacitor), später Web-App.

Entwickelt von einem Agenten-Team (Scrum Master, Anforderungsmanager nach IREB, Entwickler, Tester) unter Leitung des CEO. Spielregeln: [`CLAUDE.md`](CLAUDE.md).

## Schnellstart

```bash
npm install
npm run dev        # im Browser
npm run verify     # Typecheck + Lint + Tests + Traceability
```

## Wie verhindert wird, dass Funktionen verloren gehen

| Mechanismus | Wo |
|---|---|
| Jede Anforderung hat eine ID und einen Status-Lebenszyklus | `docs/requirements/` |
| Jedes Akzeptanzkriterium braucht einen grünen Test mit Tag `[REQ-xxx/AK-n]` | `tests/acceptance/` |
| Beim Release werden die Tests eingefroren (SHA-256-Manifest) | `tests/regression/` |
| Freigegebene REQ-Texte werden ebenfalls per Hash eingefroren | `tests/regression/manifest.json` |
| Append-only-Ledger aller Releases | `docs/releases.json` |
| Hook blockiert Agenten beim Ändern eingefrorener Dateien | `scripts/hooks/protect-frozen.mjs` |
| CI blockiert Merge und APK-Bau, wenn etwas davon verletzt ist | `.github/workflows/` |

Freigegebenes Verhalten ändert sich nur über einen **neuen** REQ mit `ersetzt: [REQ-xxx]`.

## Struktur

```
CLAUDE.md                 Spielregeln, Scrum-Master-Rolle
.claude/agents/           requirements-engineer, developer, tester
docs/vision.md            Produktvision (CEO)
docs/requirements/        REQ-Dateien + _VORLAGE.md
docs/adr/                 Architekturentscheidungen
docs/traceability.md      REQ ↔ Test (generiert)
docs/release-prozess.md   Release + Signaturschlüssel
sprints/                  Sprintpläne, Testberichte, Reviews
src/domain/               Fachmodell
src/storage/              Speicher-Schnittstellen + Implementierungen
tests/                    unit, contract, acceptance, regression, retired
android/                  Capacitor-Android-Projekt
```
