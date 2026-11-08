---
id: REQ-000
titel: Kurzer, eindeutiger Titel
status: Entwurf
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

<!--
VORLAGE – Kopie anlegen als docs/requirements/REQ-<nnn>-<kurzname>.md
Pflege: ausschließlich durch den Anforderungsmanager (requirements-engineer).

Status-Lebenszyklus:
  Entwurf → Abgestimmt → In Umsetzung → Implementiert → Freigegeben → (Ersetzt)
  - "Abgestimmt"   setzt der Anforderungsmanager NUR nach ausdrücklicher Zustimmung des CEO.
  - "In Umsetzung" setzt der Scrum Master bei Sprintplanung.
  - "Implementiert" setzt der Scrum Master, wenn Tester alle AKs grün gemeldet hat.
  - "Freigegeben" / "Ersetzt" setzt NUR das Skript `npm run release:freeze`.
Freigegebene REQs werden nie geändert. Neues Verhalten = neuer REQ mit `ersetzt: [REQ-xxx]`.

art: funktional | qualitaet | randbedingung     (IREB-Anforderungsarten)
prioritaet: Must | Should | Could | Won't       (MoSCoW)
-->

## Ziel / Nutzen

Als **<Rolle>** möchte ich **<Funktion>**, damit **<Nutzen>**.

## Anforderung (Satzschablone)

<!-- IREB-Satzschablone, je Satz eine prüfbare Aussage:
     "Das System muss/soll/wird <wem?> die Möglichkeit bieten, <Objekt> <Prozesswort>."
     "Wenn <Bedingung>, muss das System <Objekt> <Prozesswort>." -->

- Das System muss dem Nutzer die Möglichkeit bieten, …

## Akzeptanzkriterien

<!-- Jede AK-Überschrift wird vom Traceability-Check erkannt.
     Jede AK braucht mindestens einen Test mit dem Tag [REQ-000/AK-n] im Testnamen. -->

### AK-1 <Kurzbeschreibung>
- **Gegeben** …
- **Wenn** …
- **Dann** …

### AK-2 <Kurzbeschreibung>
- **Gegeben** …
- **Wenn** …
- **Dann** …

## Abgrenzung (nicht Teil dieses REQ)

- …

## Qualitätsanforderungen

<!-- z. B. Antwortzeit, Offline-Fähigkeit, Barrierefreiheit – nur wenn prüfbar formuliert. -->

- …

## Abhängigkeiten

- …

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

- …

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| JJJJ-MM-TT | Erstellt | Anforderungsmanager |
