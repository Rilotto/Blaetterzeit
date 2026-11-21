# Sprint 07 – Lupe, Maße, Proportionen, Stil Feuilleton

Start auf CEO-Zeichen 2026-11-21: „oki doki, dann starte bitte mit der erstellung des nächsten Prototypen“.
Branch: sprint-07/lupe-masse-feuilleton (von main nach Merge von Sprint 04–06).

## REQs (Should, In Umsetzung)
- Teil A: REQ-070 Lupe + Feinjustierung beim Zuschneiden; REQ-072 Maße (Zeile, Blatt, Scan-Übernahme); REQ-073 Proportionen aus Maßen (Cover/Rücken/Schnitt, Startrahmen Zuschnitt)
- Teil B: REQ-071 Design-Pille „Stil“ mit Klassisch/Feuilleton (app-weit)

## Vorgehen / Testvorgabe
Teil A, dann Teil B (beide berühren viele Ansichten, daher nacheinander). Lokal nur Tests der Sprint-REQs + betroffene alte Tests, Typecheck/Lint; Gegenprobe minimal (3–5 Kernfehler); Sicherheitsnetz CI. Prototyp und APK am Ende (vom CEO beauftragt).

## Risiken
- Feuilleton betrifft alle Ansichten → viele alte Darstellungstests (Rahmen/Flächen) müssen auf Stil-abhängige Prüfung umgestellt werden.
- Proportionen ändern feste Größen aus REQ-014/017.
- Aufwand geschätzt 20–28 % Nutzungslimit.
