---
id: REQ-078
titel: 3D-Ansicht – Hinweis bei Hörbüchern
status: Implementiert
prioritaet: Could
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **bei einem Hörbuch erfahren, dass die 3D-Ansicht dafür noch fehlt**, damit **ein Doppeltipp nicht wirkungslos bleibt**.

CEO (2026-11-21): „Gilt nicht für Hörbücher!“ Antwort (über den Scrum Master): Doppeltipp zeigt den Hinweis „Diese Funktion ist noch nicht umgesetzt“; die 3D-Ansicht für Hörbücher kommt auf die To-do-Liste (Could).

## Anforderung (Satzschablone)

- Wenn der Nutzer in den Buchdetails eines Buches mit Format „Hörbuch“ doppelt auf den Bereich „Cover“ tippt, muss das System den Hinweis „Diese Funktion ist noch nicht umgesetzt“ anzeigen und darf die 3D-Ansicht (REQ-074) nicht öffnen.
- Bei einem Doppeltipp darf auch hier das Auswahlmenü (REQ-015) nicht erscheinen.

## Akzeptanzkriterien

### AK-1 Hinweis statt 3D-Ansicht
- **Gegeben** die Buchdetails eines Buches mit Format „Hörbuch“
- **Wenn** der Nutzer doppelt auf den Bereich „Cover“ tippt
- **Dann** erscheint der Hinweis „Diese Funktion ist noch nicht umgesetzt“
- **Und** weder die 3D-Ansicht noch das Auswahlmenü öffnen sich

## Abgrenzung (nicht Teil dieses REQ)

- 3D-Ansicht für Hörbücher (To-do-Liste, Could).
- Dauer und Form des Hinweises; der CEO prüft sie im Prototyp.

## Qualitätsanforderungen

- Keine.

## Abhängigkeiten

- REQ-058 (Format), REQ-074.

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-21 | Erstellt aus CEO-Antwort (über den Scrum Master); Inhalt vom CEO bestätigt. Status „Abgestimmt“ | Anforderungsmanager |
