---
id: REQ-107
titel: Seite „Profil“ – eigenen Namen hinterlegen, ändern und leeren
status: Implementiert
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **meinen Namen im Profil hinterlegen**, damit **die Startseite mich persönlich begrüßt**.

CEO (wörtlich, 2026-11-24) auf die Frage, ob der Name fest oder einstellbar sein soll: „Im Profil selbst anlegen können“.

## Anforderung (Satzschablone)

- Das System muss auf der Seite „Profil“ eine Zeile „Name“ im Stil der Karte „Ausgabe“ (wie die Zeile „Design“, REQ-066) mit dem hinterlegten Namen rechts und Pfeil „›“ anzeigen. Ohne Namen ist die rechte Seite leer.
- Die Zeile „Name“ steht in einem eigenen Abschnitt „Du“ oberhalb des Abschnitts „App“ (**Auslegung**: Lage und Abschnittsname nicht festgelegt, kein Akzeptanzkriterium).
- Wenn der Nutzer die Zeile antippt, muss das System ein Blatt nach dem Muster „Verlag“ (REQ-063) mit einem Textfeld (vorbefüllt mit dem Namen) und „Sichern“ anzeigen.
- „Sichern“ speichert den Namen dauerhaft über die Repository-Schnittstelle (ADR-0002). Führende und folgende Leerzeichen werden entfernt (**Auslegung**). Ein leeres Feld bzw. nur Leerzeichen entfernt den Namen (REQ-093). Schließen ohne „Sichern“ verwirft.
- Der Name erscheint im Gruß der Startseite (REQ-101). Ohne Namen zeigt die Startseite nur den Gruß.
- In einer neu installierten App ist kein Name hinterlegt (**Auslegung**).

## Akzeptanzkriterien

### AK-1 Zeile „Name“ im Profil
- **Gegeben** kein Name hinterlegt
- **Wenn** der Nutzer den Menüpunkt „Profil“ öffnet
- **Dann** gibt es eine Zeile „Name“ mit Pfeil und leerer rechter Seite

### AK-2 Name hinterlegen
- **Gegeben** das Blatt „Name“ ist geöffnet
- **Wenn** der Nutzer „Christine“ einträgt und „Sichern“ antippt
- **Dann** zeigt die Zeile „Christine“, und die Startseite grüßt mit „…, Christine“, auch nach einem Neustart

### AK-3 Name leeren
- **Gegeben** der Name „Christine“ ist hinterlegt
- **Wenn** der Nutzer im Blatt das Feld leert und „Sichern“ antippt
- **Dann** ist kein Name hinterlegt, und die Startseite zeigt nur den Gruß ohne Namen

### AK-4 Schließen ohne Sichern verwirft
- **Gegeben** im Blatt ist ein geänderter Name eingetragen
- **Wenn** der Nutzer es ohne „Sichern“ schließt
- **Dann** ist der Name unverändert

## Abgrenzung (nicht Teil dieses REQ)

- Weitere Profilangaben (z. B. Profilbild).

## Qualitätsanforderungen

- Darstellung in allen Farbdesigns und Stilen (REQ-068, REQ-071).

## Abhängigkeiten

- **REQ-066** (Seite „Profil“, Zeilenstil), **REQ-063, REQ-093, REQ-101, ADR-0002.**

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-24 | Erstellt aus CEO-Antwort „Im Profil selbst anlegen können“, Entwurf | Anforderungsmanager |
| 2026-11-24 | Vom CEO bestätigt (wörtlich): „sieht alles super aus! Danke!“, einschließlich Abschnitt „Du“ mit Zeile „Name“. Status „Abgestimmt“ | Anforderungsmanager |
