# Sprint 00 – Projekt-Grundgerüst

**Sprintziel:** Arbeitsfähiges Grundgerüst, mit dem das Agenten-Team Anforderungen sicher umsetzen und freigeben kann.

## Ergebnis
- [x] Agenten-Team: `CLAUDE.md` (Scrum Master) + `.claude/agents/` (Anforderungsmanager, Entwickler, Tester)
- [x] Schutz eingefrorener Artefakte: Hook `scripts/hooks/protect-frozen.mjs` + CI-Prüfung
- [x] REQ-Vorlage mit Status-Lebenszyklus, Glossar, Definition of Done
- [x] Traceability-Check und Release-Skript (`npm run trace`, `npm run release:freeze`)
- [x] App-Skelett: React + Vite + Capacitor (Android), Speicher-Schnittstelle mit Vertragstest
- [x] CI (`ci.yml`) und APK-Release (`release.yml`)

## Offen für den CEO
- [ ] Signaturschlüssel erzeugen und als GitHub-Secrets hinterlegen (`docs/release-prozess.md`)
- [ ] Branch Protection für `main` aktivieren (Status-Check „verify“ erforderlich)
- [ ] Grundanforderungen in `docs/vision.md` eintragen → Sprint 01 mit dem Anforderungsmanager
