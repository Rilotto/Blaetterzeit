---
id: REQ-101
titel: Startseite – Aufbau, Kopf mit Datum, Uhrzeit, Gruß nach Tageszeit und Tageszeit-Icon
status: In Umsetzung
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **beim Öffnen der App persönlich begrüßt werden und auf einen Blick mein aktuelles Lesen sehen**, damit **die App einladend wirkt und ich schnell weiterlesen kann**.

CEO (2026-11-24, Vision und zwei abgenommene Konzeptskizzen, über den Scrum Master): Kopf mit Datum und Uhrzeit, darunter Gruß je nach Tageszeit mit Namen „Christine“ und Tageszeit-Icon. 5–10 Uhr „Guten Morgen“ (Sonnenaufgang), 10–17 Uhr „Hallo“ bzw. „Schönen Tag“ (Sonne), 17–21 Uhr „Guten Abend“ (Sonnenuntergang), 21–5 Uhr „Gute Nacht“ (Mond). Icons im Linienstil, in der Akzentfarbe.

## Anforderung (Satzschablone)

**Aufbau der Startseite**
- Das System muss im Menüpunkt „Start“ (REQ-002) die Startseite an Stelle von „under construction :)“ anzeigen.
- Die Startseite zeigt von oben nach unten: Kopf (dieser REQ), „Gerade am Lesen“ (REQ-102), „Diese Woche“ mit Lesesträhne (REQ-103), Jahresziel (REQ-104), „Zitat des Tages“ (REQ-106). Die Reihenfolge folgt der Aufzählung des CEO (**Auslegung**).

**Kopf**
- Das System muss oben das heutige Datum mit Wochentag und die aktuelle Uhrzeit (24-Stunden-Format, lokale Gerätezeit) anzeigen und die Anzeige mindestens minütlich aktualisieren (**Auslegung**: Format z. B. „Dienstag, 24. November · 14:05“).
- Darunter muss das System den Gruß nach Tageszeit mit dem Namen anzeigen, z. B. „Guten Morgen, Christine“, und daneben das Tageszeit-Icon:
  - 05:00–09:59: „Guten Morgen“, Sonnenaufgang
  - 10:00–16:59: „Hallo“, Sonne (CEO, 2026-11-24: „Hallo“)
  - 17:00–20:59: „Guten Abend“, Sonnenuntergang
  - 21:00–04:59: „Gute Nacht“, Mond
  - Die Grenzen gelten jeweils ab der vollen Stunde (**Auslegung**: „5–10 Uhr“ = 05:00 bis 09:59).
- Wechselt die Tageszeit, während die Startseite angezeigt wird, muss das System Gruß und Icon spätestens bei der nächsten Aktualisierung anpassen.
- Die Icons sind im Linienstil nachgebildet (wie die übrigen Icons, REQ-005) und in der Akzentfarbe (Farbrubrik „Primär“, **Auslegung**) eingefärbt.
- Name: Das System nimmt den im Profil hinterlegten Namen (REQ-107, CEO 2026-11-24: „Im Profil selbst anlegen können“). Ist kein Name hinterlegt, muss das System nur den Gruß ohne Komma und Namen anzeigen, z. B. „Guten Morgen“ (Ableitung des Scrum Masters, vom Anforderungsmanager übernommen).

## Akzeptanzkriterien

### AK-1 Startseite statt Platzhalter
- **Gegeben** die App wird geöffnet (Menüpunkt „Start“ ist aktiv, REQ-002)
- **Wenn** der Inhaltsbereich betrachtet wird
- **Dann** steht dort die Startseite mit Kopf und kein „under construction :)“

### AK-2 Datum und Uhrzeit
- **Gegeben** Gerätezeit Dienstag, 24.11.2026, 14:05
- **Wenn** die Startseite angezeigt wird
- **Dann** zeigt der Kopf Wochentag, Datum und „14:05“

### AK-3 Gruß und Icon je Tageszeit
- **Gegeben** die Gerätezeit ist 07:30 bzw. 12:00 bzw. 18:00 bzw. 23:00 bzw. 04:59
- **Wenn** die Startseite angezeigt wird
- **Und** im Profil ist der Name „Christine“ hinterlegt
- **Dann** steht „Guten Morgen, Christine“ mit Sonnenaufgang bzw. „Hallo, Christine“ mit Sonne bzw. „Guten Abend, Christine“ mit Sonnenuntergang bzw. „Gute Nacht, Christine“ mit Mond (zweimal)

### AK-6 Ohne Namen
- **Gegeben** im Profil ist kein Name hinterlegt, die Gerätezeit ist 12:00
- **Wenn** die Startseite angezeigt wird
- **Dann** steht nur „Hallo“, ohne Komma und Namen

### AK-4 Grenzen
- **Gegeben** die Gerätezeit ist 09:59 bzw. 10:00 bzw. 16:59 bzw. 17:00 bzw. 20:59 bzw. 21:00 bzw. 05:00
- **Wenn** die Startseite angezeigt wird
- **Dann** gilt: Morgen, Tag, Tag, Abend, Abend, Nacht, Morgen

### AK-5 Icons aus der Akzentfarbe
- **Gegeben** der Wert der Akzentfarbe wird an der zentralen Stelle bzw. durch ein anderes Farbdesign geändert
- **Wenn** die Startseite angezeigt wird
- **Dann** ist das Tageszeit-Icon im geänderten Wert eingefärbt

## Abgrenzung (nicht Teil dieses REQ)

- Inhalte der übrigen Bereiche (REQ-102 bis REQ-104, REQ-106).

## Qualitätsanforderungen

- Darstellung in allen Farbdesigns und Stilen (REQ-068, REQ-071).

## Abhängigkeiten

- **REQ-002:** AK-12 („under construction :)“ bei nicht definierter Zielansicht) gilt für „Start“ nicht mehr, weil die Zielansicht hiermit festgelegt ist. Kein Widerspruch, keine Änderung an REQ-002 nötig.
- **REQ-005, REQ-068, REQ-071, REQ-107** (Name aus dem Profil).

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->


## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-24 | Erstellt aus CEO-Vision und abgenommener Konzeptskizze, Entwurf | Anforderungsmanager |
| 2026-11-24 | CEO-Antworten: Tagesgruß „Hallo“. Name „Im Profil selbst anlegen können“ (REQ-107), ohne Namen nur der Gruß (AK-3 ergänzt, AK-6 neu). Keine offenen Fragen. Status Entwurf | Anforderungsmanager |
| 2026-11-24 | Vom CEO bestätigt (wörtlich): „sieht alles super aus! Danke!“. Status „Abgestimmt“ | Anforderungsmanager |
| 2026-11-24 | Befund des Testers: Der 24.11.2026 ist ein Dienstag. Wochentag im Beispiel von AK-2 und im Formatbeispiel der Anforderung von „Montag“ auf „Dienstag“ korrigiert. Kein geändertes Verhalten. Status unverändert | Anforderungsmanager |
