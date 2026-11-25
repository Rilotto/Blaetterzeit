---
id: REQ-113
titel: Seite „Profil“ – Zeile „Versionsinfo“ im Abschnitt „App“, nur Anzeige, aus einer einzigen Versionsquelle
status: In Umsetzung
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **in der App sehen, welche Version installiert ist**, damit **ich bei Rückmeldungen und Updates weiß, auf welchem Stand ich bin**.

CEO (wörtlich, 2026-11-25): „in dieser ist immer die jeweilige Appversion fest hinterlegt und kann auch nicht geändert werden manuell. Die App hat aktuell 0.11“. Die Zeile heißt „Versionsinfo“ und steht in Profil › App.

Beauftragt vom CEO (wörtlich, 2026-11-25): „okay, setze bitte Sprint 11 um als Prototypen“. Die Auslegungen unten hat er ohne Gegenrede stehen lassen.

## Anforderung (Satzschablone)

- Das System muss in der Karte des Abschnitts „App“ der Seite „Profil“ (REQ-066) unter der Zeile „Design“ eine Zeile „Versionsinfo“ darstellen (**Auslegung**: Position unter „Design“). Sie ist gestaltet wie die übrigen Zeilen der Karte, aber ohne Pfeil.
- Das System muss in der Zeile rechts die Version der laufenden App anzeigen.
- Die Zeile dient nur der Anzeige. Wenn der Nutzer sie antippt, darf das System nichts öffnen und nichts verändern. Der Nutzer kann die Version in der App nicht ändern.
- Anzeigeformat (**Auslegung**): „<Hauptversion>.<Nebenversion>“, z. B. „0.11“. Die dritte Stelle (Patch) wird nur angezeigt, wenn sie größer als 0 ist, z. B. „0.11.2“.

**Randbedingung: eine einzige Versionsquelle (Auslegung)**
- Die Version wird an genau einer Stelle im Projekt gepflegt: im Feld `version` der `package.json`. Die angezeigte Version, der `versionName` der Android-APK und das Release-Tag werden daraus abgeleitet, damit sie nie auseinanderlaufen.
- Aktueller Stand: 0.11.0, angezeigt „0.11“.

## Akzeptanzkriterien

### AK-1 Zeile „Versionsinfo“ unter „Design“
- **Gegeben** die App ist geöffnet
- **Wenn** der Nutzer den Menüpunkt „Profil“ antippt
- **Dann** enthält die Karte im Abschnitt „App“ die Zeilen „Design“ und darunter „Versionsinfo“
- **Und** die Zeile „Versionsinfo“ hat keinen Pfeil „›“

### AK-2 Aktuelle Version 0.11
- **Gegeben** die zentrale Versionsquelle enthält 0.11.0
- **Wenn** die Seite „Profil“ angezeigt wird
- **Dann** zeigt die Zeile „Versionsinfo“ rechts genau „0.11“

### AK-3 Anzeigeformat
- **Gegeben** die zentrale Versionsquelle enthält 0.12.0 bzw. 0.11.2 bzw. 1.0.0
- **Wenn** die Seite „Profil“ angezeigt wird
- **Dann** zeigt die Zeile „0.12“ bzw. „0.11.2“ bzw. „1.0“

### AK-4 Nur Anzeige
- **Gegeben** die Seite „Profil“ ist geöffnet
- **Wenn** der Nutzer die Zeile „Versionsinfo“ antippt
- **Dann** öffnet sich kein Blatt, kein Fenster und kein Eingabefeld, und nichts ändert sich

### AK-5 Eine einzige Quelle
- **Gegeben** das Projekt
- **Wenn** geprüft wird, woher die Versionsangaben stammen
- **Dann** sind die angezeigte Version und der `versionName` der Android-Konfiguration aus dem Feld `version` der `package.json` abgeleitet, und keine der beiden ist an anderer Stelle fest eingetragen
- **Und** ändert man nur `package.json` auf 0.12.0, zeigt die Zeile nach dem nächsten Build „0.12“

## Abgrenzung (nicht Teil dieses REQ)

- Build-Nummer, Datum oder Änderungsprotokoll in der App.
- Prüfung auf neuere Versionen.

## Qualitätsanforderungen

- Darstellung in allen Farbdesigns und Stilen (REQ-068, REQ-071).

## Abhängigkeiten

- **REQ-066:** Die Karte „App“ enthält künftig zwei Zeilen (AK-1 dort angepasst).
- **Release-Prozess** (`docs/release-prozess.md`, `npm run release:freeze -- <version> …`): Die dort übergebene Version soll zur Versionsquelle passen. Wie das abgesichert wird, legt der Entwickler fest.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-25 | Erstellt aus den gesammelten Punkten für Sprint 11. CEO (wörtlich): „in dieser ist immer die jeweilige Appversion fest hinterlegt und kann auch nicht geändert werden manuell. Die App hat aktuell 0.11“. Auslegungen (nur Anzeige ohne Pfeil, eine Quelle `package.json`, Anzeige ohne Patch-Stelle 0) vom CEO ohne Gegenrede. Eigene Auslegung: Position unter „Design“. Beauftragt (wörtlich): „okay, setze bitte Sprint 11 um als Prototypen“. Status „Abgestimmt“ | Anforderungsmanager |
