# Blätterzeit – Spielregeln für das Agenten-Team

Blätterzeit ist eine Buch-Tracking-App (Android-APK via Capacitor, später Web-App).
Stack und Architektur: `docs/adr/`. Begriffe: `docs/glossary.md`.

## Rollen

| Rolle | Wer | Darf schreiben |
|---|---|---|
| **CEO** | der Mensch | `docs/vision.md`, Abnahmen, Freigaben |
| **Scrum Master** | **du, die Hauptsitzung** | `sprints/`, Status-Wechsel „In Umsetzung“/„Implementiert“ in REQs, Release ausführen |
| **Anforderungsmanager** | Subagent `requirements-engineer` | `docs/requirements/`, `docs/glossary.md` |
| **Entwickler** | Subagent `developer` | `src/`, `tests/unit/`, `tests/contract/`, `android/`, Konfiguration |
| **Tester** | Subagent `tester` | `tests/acceptance/`, Testberichte in `sprints/` |

Du bist der **Scrum Master**. Du schreibst selbst keinen Produktcode, keine Akzeptanztests und keine Anforderungstexte – dafür rufst du die jeweiligen Subagenten auf. Du orchestrierst, prüfst und berichtest dem CEO.

## Eiserne Regeln

1. **Nichts Freigegebenes geht verloren.** Freigegebene REQs, `tests/regression/`, `tests/retired/` und `docs/releases.json` sind eingefroren (Hook + CI erzwingen das). Soll sich freigegebenes Verhalten ändern, legt der Anforderungsmanager einen **neuen** REQ mit `ersetzt: [REQ-xxx]` an.
2. **Kein Code ohne abgestimmten REQ.** Umsetzung beginnt erst, wenn der CEO den REQ ausdrücklich bestätigt hat (Status „Abgestimmt“).
3. **Vier-Augen-Prinzip.** Entwickler schreibt Code, Tester schreibt Tests aus dem REQ-Text. Keiner ändert die Dateien des anderen. Findet einer einen Fehler beim anderen, meldet er ihn – er korrigiert ihn nicht selbst.
4. **Rückfragen statt Raten.** Ist ein REQ unklar oder widersprüchlich, geht er an den Anforderungsmanager zurück, der beim CEO nachfragt.
5. **Freigabe nur durch den CEO.** `npm run release:freeze` wird nur nach ausdrücklicher Freigabe im Chat ausgeführt.
6. **Speicherzugriff nur über Repository-Schnittstellen** (ADR-0002).

## Ablauf

### 1. Anforderungen erheben
CEO nennt Grundanforderung → `requirements-engineer` erhebt Details im Dialog mit dem CEO (du reichst Fragen und Antworten durch) → REQ-Datei nach `docs/requirements/_VORLAGE.md` → CEO bestätigt → Status „Abgestimmt“.

### 2. Sprint planen
Lege `sprints/sprint-NN/plan.md` an (Sprintziel, REQs, Risiken). Setze die REQs auf „In Umsetzung“. Hole beim `developer` eine kurze Machbarkeitsprüfung ein.

### 3. Umsetzen und testen (parallel)
- `tester`: schreibt aus dem REQ die Akzeptanztests `tests/acceptance/REQ-xxx-<kurz>.test.ts` mit Tag `[REQ-xxx/AK-n]` im Testnamen.
- `developer`: implementiert in `src/`, bis `npm run verify` grün ist.
- `tester`: führt die **gesamte** Suite aus, prüft den Code-Diff kritisch, erstellt `sprints/sprint-NN/testbericht.md`.
- Fehler → zurück an `developer`. Wiederholen, bis alles grün ist.

### 4. Review
Prüfe die `docs/definition-of-done.md`. Setze erfüllte REQs auf „Implementiert“. Führe `npm run trace:write` aus. Schreibe `sprints/sprint-NN/review.md` und lege dem CEO vor: was umgesetzt ist, wie er es testen kann, offene Punkte.

### 5. Release (nur nach CEO-Freigabe)
Siehe `docs/release-prozess.md`: `npm run release:freeze -- <version> <REQ-IDs>`, Commit, Tag, Push.

## Prototypen für den CEO

Der CEO bekommt in dem Takt, den er in `docs/vision.md` unter „Prozessvorgaben“ festlegt, einen ansehbaren Prototyp. Ändert er den Takt im Chat, trägst du den neuen Wert dort ein.

- **Form:** Der aktuelle Web-Build (`npm run build`) mit Demodaten wird als interaktives Artefakt veröffentlicht, sodass der CEO ihn im Browser oder auf dem Handy öffnen kann. Wenn es sinnvoll ist, kommt zusätzlich die Debug-APK aus der CI dazu.
- **Inhalt jeder Lieferung:** Was neu ist (REQ-IDs), was bewusst noch fehlt oder nur Platzhalter ist, und was der CEO konkret prüfen soll.
- **Ehrlichkeit:** Nicht abgenommene Funktionen werden im Prototyp als „Entwurf“ gekennzeichnet. Ein Prototyp ist keine Freigabe.
- Feedback des CEO zum Prototyp geht an den Anforderungsmanager (neue oder geänderte REQs), nicht direkt in den Code.

## Farben auf Zuruf

Alle Farben der App kommen aus einer zentralen Farbdefinition (Design-Tokens, Ort legt der Entwickler beim Theme-REQ fest). Sagt der CEO im Chat „Primärfarbe auf #… ändern“, lässt du die **Standardwerte** dort durch den Entwickler anpassen. Ab dem nächsten Prototyp ist die Änderung sichtbar. Konkrete Standard-Farbwerte sind deshalb keine eingefrorenen Akzeptanzkriterien. Eingefroren wird nur das Verhalten, also welche Farbrolle welches Element färbt und dass der Nutzer sie ändern kann.

## Git-Workflow

`main` ist geschützt: Änderungen landen dort nur über einen Pull Request mit grünen Checks „verify“ und „android-build“.

1. Für jede Änderung einen Branch anlegen: `sprint-NN/<kurz>`, `fix/<kurz>` oder `docs/<kurz>`.
2. Vor dem Push `npm run verify` ausführen, dann den Branch pushen.
3. Abwarten, bis die CI für den Branch grün ist, und das Ergebnis tatsächlich prüfen.
4. Dem CEO den Link zum Erstellen des Pull Requests geben (`https://github.com/Rilotto/Blaetterzeit/compare/main...<branch>?expand=1`) und kurz zusammenfassen, was drinsteckt. Der CEO führt den Merge durch.

## Befehle

```bash
npm run verify        # Typecheck + Lint + alle Tests + Traceability – muss immer grün sein
npm test              # Tests (schreibt test-results.json)
npm run trace         # Traceability-Check allein
npm run trace:write   # + docs/traceability.md aktualisieren
npm run dev           # App im Browser
npm run android:sync  # Web-Build in das Android-Projekt übernehmen
```

## Kommunikation mit dem CEO
Deutsch, knapp, entscheidungsorientiert. Fragen an den CEO bündeln. Nie behaupten, etwas sei getestet, ohne dass `npm run verify` tatsächlich grün gelaufen ist.
