---
id: REQ-001
titel: Theme in den Einstellungen auswählen
status: Entwurf
prioritaet: Could
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

<!-- Priorität "Could": Der CEO sagt, die konkrete Ausarbeitung von Themes "ist für einen späteren Prototypen angedacht und hat erstmal keine Priorität". -->

## Ziel / Nutzen

Als **Nutzer** möchte ich **in den Einstellungen ein Theme aus einer vom CEO bereitgestellten Auswahl wählen**, damit **sich das Aussehen der App entsprechend ändert**.

Grundlage ist ausschließlich diese Aussage des CEO (2026-11-09):
> „Später möchte ich aber über den Reiter Profil zu den Einstellungen kommen, in welchen es eine Rubrik mit 'Themes' gibt. Hier soll später eine wachsende Auswahl von Themes bereitgestellt werden von mir. Diese ändern bei deren Auswahl das Aussehen entsprechend der App. […] Die konkrete Ausarbeitung von Themes ist für einen späteren Prototypen angedacht und hat erstmal keine Priorität.“

## Anforderung (Satzschablone)

- Das System muss dem Nutzer die Möglichkeit bieten, über den Menüpunkt „Profil“ die Einstellungen zu öffnen.
- Das System muss in den Einstellungen eine Rubrik „Themes“ darstellen.
- Das System muss dem Nutzer in der Rubrik „Themes“ die Möglichkeit bieten, ein Theme aus der vom CEO bereitgestellten Auswahl zu wählen.
- Wenn der Nutzer ein Theme auswählt, muss das System das Aussehen der App entsprechend diesem Theme ändern.
- Die Auswahl an Themes wird vom CEO bereitgestellt und kann im Laufe der Zeit wachsen.

## Akzeptanzkriterien

<!-- Vorläufig. Werden beim späteren Prototyp nach Klärung der Offenen Fragen konkretisiert. -->

### AK-1 Einstellungen über „Profil“ erreichbar
- **Gegeben** die App ist geöffnet
- **Wenn** der Nutzer über den Menüpunkt „Profil“ die Einstellungen aufruft
- **Dann** werden die Einstellungen angezeigt

### AK-2 Rubrik „Themes“ mit Auswahl des CEO
- **Gegeben** die Einstellungen sind geöffnet
- **Wenn** der Nutzer die Rubrik „Themes“ öffnet
- **Dann** werden alle vom CEO bereitgestellten Themes zur Auswahl angezeigt

### AK-3 Auswahl ändert das Aussehen
- **Gegeben** die Rubrik „Themes“ ist geöffnet
- **Wenn** der Nutzer ein Theme auswählt
- **Dann** stellt die App ihr Aussehen entsprechend dem gewählten Theme dar

## Abgrenzung (nicht Teil dieses REQ)

- Die Änderung der aktuellen Standardfarben durch den CEO über den Chat. Das ist in REQ-002 (Abschnitt „Farben“) und im Prozess „Farben auf Zuruf“ (CLAUDE.md) geregelt.
- Alle Festlegungen, die der CEO noch nicht getroffen hat (siehe Offene Fragen). Sie werden erst beim späteren Prototyp erhoben.

## Qualitätsanforderungen

- Keine. Der CEO hat bisher keine Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-002 (Hauptnavigation):** Menüpunkt „Profil“ als Zugang zu den Einstellungen. Die zentral definierten Farben aus REQ-002 sind die Grundlage für Themes.
- Setzt eine Einstellungsansicht voraus, die als Ziel des Menüpunkts „Profil“ noch nicht definiert ist.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. Diese Fragen werden laut CEO erst beim späteren Prototyp gestellt. -->

- F1: Woraus besteht ein Theme (welche Farben bzw. welche Aspekte des Aussehens legt es fest)?
- F2: Welche Themes stellst du zum Start bereit, und welches ist ohne Auswahl aktiv?
- F3: Soll der Nutzer neben der Auswahl auch eigene Themes erstellen oder bestehende anpassen können?
- F4: Soll das gewählte Theme nach einem Neustart der App erhalten bleiben?
- F5: Wie gelangt der Nutzer vom Reiter „Profil“ zu den Einstellungen (direkt oder über eine Profilansicht)?

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-08 | Erstellt (Entwurf aus Grundanforderung des CEO) | Anforderungsmanager |
| 2026-11-09 | Vollständig neu geschrieben, ausschließlich auf Basis der CEO-Aussage vom 2026-11-09 (Profil → Einstellungen → Rubrik „Themes“, wachsende Auswahl vom CEO, Auswahl ändert das Aussehen). Entfernt wurden alle nicht vom CEO stammenden Inhalte (vier frei wählbare Farbrollen, Farbwahl je Rolle, Zurücksetzen auf Standard, Persistenz, Kontrastprüfung, Zeitvorgaben). Priorität von „Should“ auf „Could“ (CEO: „hat erstmal keine Priorität“) | Anforderungsmanager |
