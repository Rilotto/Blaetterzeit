---
id: REQ-019
titel: Buchdetails – Bilder dauerhaft speichern
status: In Umsetzung
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich, **dass die Bilder meiner Bücher (Buchrücken, Cover, Schnitt) dauerhaft gespeichert bleiben**, damit **ich meine Bücher nicht jedes Mal neu gestalten muss**.

Antwort des CEO (wörtlich, Auszug, 2026-11-09): „Ja, die Bilder sollen bitte zwingend gespeichert werden! Ich möchte doch nicht jedes Mal meine Bücher neu gestalten...“

Priorität „Must“ aus der Aussage des CEO „zwingend“.

## Anforderung (Satzschablone)

- Wenn der Nutzer für einen Bereich eines Buches („Buchrücken“, „Cover“, „Schnitt“) ein Bild hinterlegt (REQ-017), muss das System dieses Bild und seine Zuordnung zu Buch und Bereich dauerhaft speichern.
- Das System muss gespeicherte Bilder nach einem Neustart der App unverändert dem jeweiligen Buch und Bereich zugeordnet anzeigen.
- Wenn der Nutzer ein Bild durch ein neues ersetzt (REQ-017), muss das System dauerhaft nur noch das neue Bild für diesen Bereich führen.
- Wenn der Nutzer ein Bild über „Foto entfernen“ (REQ-015) löscht, muss das System es auch aus der dauerhaften Speicherung entfernen, sodass es nach einem Neustart nicht wieder erscheint.
- Das System muss Bilder ausschließlich über die Repository-Schnittstelle speichern und laden (ADR-0002).

## Randbedingungen

- Bisher werden Bücher nur im Arbeitsspeicher gehalten (Demodaten); eine dauerhafte lokale Speicherung gibt es noch nicht (sprints/sprint-03/plan.md). Laut ADR-0002 ist dafür eine lokale Speicherung hinter der Repository-Schnittstelle nötig; die Technik legt der Entwickler fest.
- Die Zuordnung Bild → Buch setzt voraus, dass ein Buch über einen Neustart hinweg dieselbe eindeutige ID behält (REQ-008), auch bei Demodaten.
- Im Web-Prototyp (Artefakt) ist eine Prüfung über einen Neustart nur eingeschränkt möglich; maßgeblich ist die APK.

## Akzeptanzkriterien

### AK-1 Bild übersteht Neustart
- **Gegeben** der Nutzer hat für den Bereich „Cover“ eines Buches ein Bild hinterlegt
- **Wenn** die App beendet und neu gestartet wird und er die Buchdetails dieses Buches öffnet
- **Dann** zeigt der Bereich „Cover“ dasselbe Bild

### AK-2 Alle drei Bereiche, richtige Zuordnung
- **Gegeben** für zwei verschiedene Bücher sind Bilder in unterschiedlichen Bereichen hinterlegt
- **Wenn** die App neu gestartet wird
- **Dann** zeigt jedes Buch genau seine Bilder in genau den Bereichen, in denen sie hinterlegt wurden

### AK-3 Ersetztes Bild bleibt ersetzt
- **Gegeben** der Nutzer hat das Bild eines Bereichs durch ein neues ersetzt
- **Wenn** die App neu gestartet wird
- **Dann** zeigt der Bereich das neue Bild

### AK-4 Entferntes Bild bleibt entfernt
- **Gegeben** der Nutzer hat das Bild eines Bereichs über „Foto entfernen“ gelöscht
- **Wenn** die App neu gestartet wird
- **Dann** wird der Bereich ohne Bild dargestellt (REQ-014)

### AK-5 Speicherzugriff nur über das Repository
- **Gegeben** der Quellcode der App
- **Wenn** geprüft wird, wo Bilder gespeichert und geladen werden
- **Dann** geschieht das ausschließlich über die Repository-Schnittstelle (ADR-0002)

## Abgrenzung (nicht Teil dieses REQ)

- Dauerhafte Speicherung weiterer Buchdaten (z. B. Anlegen eigener Bücher); vom CEO in diesem Zusammenhang nicht gefordert.
- Sicherung, Export oder Synchronisation der Bilder.

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-008:** Buchdaten, eindeutige ID. **REQ-014, REQ-015, REQ-017:** Bereiche, Entfernen, Hinterlegen. **REQ-020:** Frontcover in Buchlisten.
- **ADR-0002:** Speicher-Abstraktion.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-09 | Erstellt aus CEO-Antwort 6 (Sprint 03) | Anforderungsmanager |
| 2026-11-09 | Priorität Must vom CEO bestätigt. Status „Abgestimmt“ (CEO 2026-11-09) | Anforderungsmanager |
