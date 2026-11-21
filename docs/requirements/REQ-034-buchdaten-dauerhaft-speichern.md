---
id: REQ-034
titel: Buchdaten dauerhaft speichern
status: Implementiert
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich, **dass alle von mir angelegten Bücher mit allen Angaben und dem Cover dauerhaft gespeichert bleiben**, damit **ich sie nach einem Neuladen oder Neustart der App nicht erneut eintragen muss**.

Vorgabe des CEO (wörtlich, 2026-11-10): „Alle angelegten Bücher sollen im Prototypen aber bitte dauerhaft gespeichert werden mit allem drum und dran.“

Die Priorität „Must“ und der Status „Abgestimmt“ stützen sich auf diese ausdrückliche Anweisung des CEO.

## Anforderung (Satzschablone)

- Wenn der Nutzer ein Buch anlegt (REQ-031), muss das System das Buch mit allen seinen Angaben dauerhaft speichern. Dazu gehören die eindeutige ID, der Titel, der Autor, das Erscheinungsjahr, das Erscheinungsdatum, die Seitenanzahl und der Lesestatus (REQ-008, REQ-033).
- Wenn der Nutzer beim Anlegen ein Cover hinterlegt (REQ-032), muss das System dieses Cover dauerhaft zusammen mit seiner Zuordnung zum Buch speichern (REQ-019).
- Das System muss angelegte Bücher nach einem Neuladen oder Neustart der App mit unveränderten Angaben und Cover anzeigen, sowohl in den Buchlisten als auch in den Buchdetails.
- Wenn der Nutzer eine Angabe eines angelegten Buches ändert, muss das System dauerhaft den geänderten Wert speichern, zum Beispiel beim Lesestatus (REQ-022).
- Das System muss die dauerhafte Speicherung im Web-Prototyp im Browser und in der Android-App (APK) bieten.
- Wenn im Web-Prototyp der Browser die dauerhafte Speicherung nicht zulässt, muss das System funktionsfähig bleiben und die Bücher mindestens bis zum nächsten Neuladen vorhalten.
- Das System muss Buchdaten ausschließlich über die Repository-Schnittstelle speichern und laden (ADR-0002).

## Randbedingungen

- Im Artefakt, also im Web-Prototyp für den CEO, kann der Browser-Speicher gesperrt sein. In diesem Fall bleiben die Bücher nur bis zum Neuladen erhalten. Für die Prüfung über einen Neustart ist dann die APK oder ein normaler Browser maßgeblich.
- Die Speichertechnik legt der Entwickler fest (ADR-0002).

## Akzeptanzkriterien

### AK-1 Angelegtes Buch übersteht Neuladen/Neustart mit allen Angaben
- **Gegeben** der Nutzer hat ein Buch mit Titel, Autor, Erscheinungsjahr und Seitenanzahl angelegt
- **Wenn** die App neu geladen bzw. neu gestartet wird
- **Dann** ist das Buch mit derselben ID und unveränderten Angaben (Titel, Autor, Erscheinungsjahr, Seitenanzahl, Lesestatus *ungelesen*) vorhanden

### AK-2 Buch nur mit Pflichtangabe
- **Gegeben** der Nutzer hat ein Buch nur mit Titel angelegt
- **Wenn** die App neu geladen bzw. neu gestartet wird
- **Dann** ist das Buch mit seinem Titel vorhanden, und die optionalen Angaben fehlen weiterhin, ohne dass Ersatzwerte erscheinen

### AK-3 Erscheinungsdatum bleibt erhalten
- **Gegeben** ein angelegtes Buch hat ein Erscheinungsdatum im Format TT.MM.JJJJ
- **Wenn** die App neu geladen bzw. neu gestartet wird
- **Dann** hat das Buch dasselbe Erscheinungsdatum

### AK-4 Cover bleibt erhalten
- **Gegeben** der Nutzer hat beim Anlegen eines Buches ein Cover hinterlegt
- **Wenn** die App neu geladen bzw. neu gestartet wird
- **Dann** zeigen die Buchlisten und die Buchdetails dieses Buches dasselbe Cover

### AK-5 Mehrere Bücher, richtige Zuordnung
- **Gegeben** der Nutzer hat mehrere Bücher mit unterschiedlichen Angaben angelegt
- **Wenn** die App neu geladen bzw. neu gestartet wird
- **Dann** sind alle diese Bücher vorhanden, und jedes hat genau seine eigenen Angaben und sein eigenes Cover

### AK-6 Geänderte Angabe bleibt geändert
- **Gegeben** der Nutzer hat eine Angabe eines angelegten Buches geändert, zum Beispiel den Lesestatus
- **Wenn** die App neu geladen bzw. neu gestartet wird
- **Dann** hat das Buch den geänderten Wert

### AK-7 Gesperrter Browser-Speicher
- **Gegeben** im Web-Prototyp lässt der Browser keine dauerhafte Speicherung zu
- **Wenn** der Nutzer ein Buch anlegt und die App verwendet
- **Dann** wird das Buch angelegt und angezeigt, und die App bleibt ohne Fehlermeldung und ohne Absturz bedienbar

### AK-8 Speicherzugriff nur über das Repository
- **Gegeben** der Quellcode der App
- **Wenn** geprüft wird, wo Buchdaten gespeichert und geladen werden
- **Dann** geschieht das ausschließlich über die Repository-Schnittstelle (ADR-0002)

## Abgrenzung (nicht Teil dieses REQ)

- Erhalt der Daten bei einem Update der APK auf eine neue Version. Das kommt in einen eigenen Sprint „APK-Updates ohne Datenverlust“ und steht auf der To-do-Liste.
- Sicherung, Export oder Synchronisation der Buchdaten.
- Löschen von Büchern, weil es dafür noch keine Funktion gibt.
- Die Frage, ob Demodaten bzw. Testbücher dauerhaft gespeichert werden. Darüber entscheidet der CEO später (To-do).

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-008:** Buchdaten mit eindeutiger ID. **REQ-033:** Erscheinungsjahr und Erscheinungsdatum. **REQ-025:** Seitenanzahl.
- **REQ-031:** Anlegen eines Buches. **REQ-032:** Cover beim Anlegen.
- **REQ-019:** Bildspeicherung. REQ-034 erweitert die dauerhafte Speicherung auf die Buchdaten und ändert REQ-019 nicht.
- **REQ-022:** Änderung des Lesestatus.
- **ADR-0002:** Speicher-Abstraktion.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-10 | Erstellt nach CEO-Anweisung (Sprint 04, Teil A). Status „Abgestimmt“ auf ausdrückliche CEO-Anweisung | Anforderungsmanager |
