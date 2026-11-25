---
id: REQ-033
titel: Buchdaten – Erscheinungsjahr und Erscheinungsdatum
status: Implementiert
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **zu einem Buch Erscheinungsjahr und Erscheinungsdatum speichern**, damit **sie beim Buch erhalten bleiben**.

Grundlage: CEO-Vorgabe 2026-11-10 „Kopiere … die darauffolgende Seite 'Manueller Eintrag'“; das Referenzbild [referenzen/REF-buch-anlegen-02-manueller-eintrag.png](referenzen/REF-buch-anlegen-02-manueller-eintrag.png) enthält beide Felder. Erweiterung der Buchdaten aus REQ-008 (dort ausdrücklich als erweiterbar vorgesehen).

CEO (wörtlich, 2026-11-10): „Das Jahr ist das Erscheinungsjahr. Das Erscheinungsdatum ist das exakte Datum in TT.MM.JJJJ. 'Erscheinungsdatum hinzufügen' bekommt noch keine Funktion.“

Priorität: Must (vom CEO bestätigt, 2026-11-10).

## Anforderung (Satzschablone)

- Das System muss zu jedem Buch optional ein Erscheinungsjahr speichern können (eingetragen im Feld „JAHR“, REQ-030/REQ-031); ein Buch ohne Erscheinungsjahr ist zulässig.
- Das System muss zu jedem Buch optional ein Erscheinungsdatum als exaktes Kalenderdatum (Tag, Monat, Jahr; Darstellung TT.MM.JJJJ) speichern können; ein Buch ohne Erscheinungsdatum ist zulässig.
- ~~Eine Eingabemöglichkeit für das Erscheinungsdatum gibt es derzeit nicht.~~ Abgelöst: Eingabe von Datum oder Jahr nur über „Erschienen“ (REQ-060, REQ-092). Das Feld „JAHR“ entfällt, vorhandene Jahr-Werte bleiben gespeichert.
- Das System muss bestehende Bücher ohne diese Angaben unverändert weiterführen.
- Das System muss beide Angaben ausschließlich über die Repository-Schnittstelle lesen und speichern (ADR-0002).

## Akzeptanzkriterien

### AK-1 Mit und ohne Erscheinungsjahr/Erscheinungsdatum
- **Gegeben** ein Buch mit Erscheinungsjahr 2019 und Erscheinungsdatum 03.09.2019 und ein Buch ohne beide Angaben
- **Wenn** beide über die Repository-Schnittstelle gespeichert und wieder gelesen werden
- **Dann** hat das erste Buch unverändert Erscheinungsjahr 2019 und Erscheinungsdatum 03.09.2019
- **Und** das zweite Buch hat keine dieser Angaben und ist ansonsten vollständig vorhanden

### AK-2 Bestehende Bücher unverändert
- **Gegeben** Bücher, die vor Einführung dieser Angaben gespeichert wurden
- **Wenn** die App sie lädt
- **Dann** sind sie mit allen bisherigen Angaben vorhanden

### AK-3 Neues Buch ohne Angabe bei „Erschienen“
- **Gegeben** der Nutzer legt im Blatt „Manueller Eintrag“ ein Buch an und lässt „Erschienen“ leer
- **Wenn** die Buchdaten gelesen werden
- **Dann** hat das Buch weder Erscheinungsdatum noch Erscheinungsjahr (Eingabe nur über „Erschienen“, REQ-060, REQ-092)

## Abgrenzung (nicht Teil dieses REQ)

- Eingabe im Blatt (REQ-030), Eingabe des Erscheinungsdatums (To-do-Liste), Anzeige in den Buchdetails (nicht beauftragt).

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-008** (Buchdaten), **REQ-030**, **REQ-031**, **ADR-0002**.
- **REQ-092 (Entwurf):** Das Feld „JAHR“ entfällt. Vorhandene Erscheinungsjahre bleiben gespeichert und werden ohne Datum als Jahr angezeigt. Dieser REQ wird nach der Abstimmung angepasst.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-10 | Erstellt (Entwurf, Erweiterung der Buchdaten aus REQ-008) | Anforderungsmanager |
| 2026-11-10 | CEO-Antworten eingearbeitet. F2: Jahr = Erscheinungsjahr, Erscheinungsdatum = exaktes Datum TT.MM.JJJJ, noch ohne Eingabe (neu AK-3, AK-1 präzisiert, Titel angepasst). Priorität Must (Bestätigung ausstehend). Status „Abgestimmt“ auf Weisung des Scrum Masters nach den übermittelten CEO-Antworten | Anforderungsmanager |
| 2026-11-10 | Priorität Must vom CEO bestätigt („ja“). Status bleibt „Abgestimmt“ | Anforderungsmanager |
| 2026-11-23 | An REQ-060 und REQ-092 angepasst (REQ-092 Abgestimmt, CEO: „okay, freigegeben. Starte mit dem nächsten Prototypen“): Eingabe nur über „Erschienen“, kein Feld „JAHR“ (Anforderung, AK-3). Status unverändert | Anforderungsmanager |
