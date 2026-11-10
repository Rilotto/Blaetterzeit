---
id: REQ-033
titel: Buchdaten – Jahr und Erscheinungsdatum
status: Entwurf
prioritaet: offen
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **zu einem Buch die Angaben aus den Feldern „JAHR“ und „ERSCHEINUNGSDATUM“ des Blatts „Manueller Eintrag“ speichern**, damit **sie beim Buch erhalten bleiben**.

Grundlage: CEO-Vorgabe 2026-11-10 „Kopiere … die darauffolgende Seite 'Manueller Eintrag'“; das Referenzbild [referenzen/REF-buch-anlegen-02-manueller-eintrag.png](referenzen/REF-buch-anlegen-02-manueller-eintrag.png) enthält beide Felder. Erweiterung der Buchdaten aus REQ-008 (dort ausdrücklich als erweiterbar vorgesehen).

## Anforderung (Satzschablone)

- Das System muss zu jedem Buch optional ein Jahr speichern können; ein Buch ohne Jahr ist zulässig.
- Das System muss zu jedem Buch optional ein Erscheinungsdatum speichern können; ein Buch ohne Erscheinungsdatum ist zulässig.
- Das System muss bestehende Bücher ohne diese Angaben unverändert weiterführen.
- Das System muss beide Angaben ausschließlich über die Repository-Schnittstelle lesen und speichern (ADR-0002).

## Akzeptanzkriterien

### AK-1 Mit und ohne Jahr/Erscheinungsdatum
- **Gegeben** ein Buch mit Jahr und Erscheinungsdatum und ein Buch ohne beide Angaben
- **Wenn** beide über die Repository-Schnittstelle gespeichert und wieder gelesen werden
- **Dann** hat das erste Buch unverändert Jahr und Erscheinungsdatum
- **Und** das zweite Buch hat keine dieser Angaben und ist ansonsten vollständig vorhanden

### AK-2 Bestehende Bücher unverändert
- **Gegeben** Bücher, die vor Einführung dieser Angaben gespeichert wurden
- **Wenn** die App sie lädt
- **Dann** sind sie mit allen bisherigen Angaben vorhanden

## Abgrenzung (nicht Teil dieses REQ)

- Eingabe im Blatt (REQ-030), Anzeige in den Buchdetails (nicht beauftragt).

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-008** (Buchdaten), **REQ-030**, **REQ-031**, **ADR-0002**.

## Offene Fragen

- F2: Was bedeuten „Jahr“ und „Erscheinungsdatum“, braucht es beide, und welche Angaben umfasst das Erscheinungsdatum (Eingabeart)? Danach werden Wertebereiche und AKs präzisiert.
- F7: Priorität.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-10 | Erstellt (Entwurf, Erweiterung der Buchdaten aus REQ-008) | Anforderungsmanager |
