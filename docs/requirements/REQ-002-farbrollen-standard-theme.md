---
id: REQ-002
titel: Farbrollen und Standard-Theme
status: Entwurf
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

<!-- Herausgelöst aus REQ-001 (Entwurf, 2026-11-09): Farbrollen-Definition, Zuordnung und Standard-Theme
     werden für den ersten Prototyp benötigt; die Anpassbarkeit in den Einstellungen (REQ-001) kommt später. -->

## Ziel / Nutzen

Als **Nutzer** möchte ich **eine App mit einem einheitlichen, über vier Farbrollen gesteuerten Farbbild**, damit **die App stimmig aussieht und ihre Farben später zentral (CEO im Chat) bzw. in den Einstellungen (REQ-001) geändert werden können, ohne dass einzelne Elemente vergessen werden**.

## Anforderung (Satzschablone)

- Das System muss genau vier Farbrollen kennen: Primärfarbe, Sekundärfarbe, Hintergrundfarbe, Textfarbe _(Namen vorläufig, F1)_.
- Das System muss jedem farbigen UI-Element genau eine der vier Farbrollen gemäß der Zuordnungstabelle (unten) zuordnen.
- Das System muss die Farbe jedes UI-Elements ausschließlich aus der ihm zugeordneten Farbrolle des aktiven Themes beziehen.
- Das System muss ein Standard-Theme mitbringen, das beim Start der App aktiv ist.
- Randbedingung: Die Werte des Standard-Themes müssen an genau einer zentralen Stelle definiert sein, sodass eine Änderung dort ohne weitere Anpassungen in der gesamten App wirkt (vgl. CLAUDE.md „Farben auf Zuruf“).

### Zuordnungstabelle Element → Farbrolle _(vorläufig, Bestätigung durch CEO offen – F1)_

| UI-Element | Farbrolle |
|---|---|
| Hintergrund aller Seiten | Hintergrundfarbe |
| Hintergrund der Hauptleiste | Hintergrundfarbe |
| Alle Texte (Seitentitel, Fließtext, Beschriftungen) außer aktiver Hauptleisten-Eintrag | Textfarbe |
| Icons und Beschriftungen nicht aktiver Hauptleisten-Einträge | Textfarbe |
| Icon und Beschriftung des aktiven Hauptleisten-Eintrags | Primärfarbe |
| Markierung (Indikator) des aktiven Hauptleisten-Eintrags | Sekundärfarbe |
| Symbol auf Platzhalterseiten (falls vorhanden, siehe REQ-005) | Sekundärfarbe |

Die Tabelle wird um weitere Elemente ergänzt, sobald neue Seiten/Elemente per REQ hinzukommen.

### Standardwerte (Information, **kein** Akzeptanzkriterium)

Konkrete Standard-Farbwerte sind bewusst nicht Teil der Akzeptanzkriterien; sie werden vom CEO auf Zuruf zentral geändert. Aktueller Vorschlag (Bestätigung offen – F2):

| Farbrolle | Vorschlag |
|---|---|
| Primärfarbe | #2E5E4E |
| Sekundärfarbe | #C8963E |
| Hintergrundfarbe | #FAF7F2 |
| Textfarbe | #1F1F1F |

## Akzeptanzkriterien

### AK-1 Standard-Theme beim Start aktiv
- **Gegeben** die App wurde frisch installiert bzw. im Browser ohne gespeicherte Daten geöffnet
- **Wenn** der Nutzer die App startet
- **Dann** sind alle vier Farbrollen mit den Werten des zentral definierten Standard-Themes belegt
- **Und** jedes UI-Element der Zuordnungstabelle wird in der Farbe seiner Farbrolle dargestellt

### AK-2 Zentrale Änderung wirkt auf alle zugeordneten Elemente
- **Gegeben** im zentral definierten Standard-Theme ist der Wert genau einer Farbrolle geändert
- **Wenn** die App gestartet wird
- **Dann** werden alle dieser Farbrolle zugeordneten UI-Elemente im neuen Wert dargestellt
- **Und** die den anderen drei Farbrollen zugeordneten UI-Elemente bleiben unverändert

### AK-3 Keine Farben außerhalb der Farbrollen
- **Gegeben** die App ist gestartet
- **Wenn** eine beliebige Hauptseite angezeigt wird
- **Dann** entspricht jede auf der Seite und in der Hauptleiste verwendete Farbe einem der vier Werte des aktiven Themes _(Umgang mit abgeleiteten Tönen, z. B. abgeschwächter Textfarbe, siehe F3)_

## Abgrenzung (nicht Teil dieses REQ)

- Änderung der Farben durch den Nutzer in den Einstellungen, Speichern und Zurücksetzen eines Themes → REQ-001.
- Hell-/Dunkel-Modus und vordefinierte Themes (REQ-001, F2/F3).
- Konkrete Standard-Farbwerte als prüfbare Vorgabe.

## Qualitätsanforderungen

- Lesbarkeit _(vorläufig, F4)_: Im Standard-Theme soll das Kontrastverhältnis Textfarbe zu Hintergrundfarbe mindestens 4,5 : 1 betragen (WCAG 2.1 AA). Hinweis: Die vorgeschlagene Sekundärfarbe erreicht auf der vorgeschlagenen Hintergrundfarbe nur ca. 2,5 : 1 und eignet sich deshalb nicht für Text, nur für Markierungen/Symbole.

## Abhängigkeiten

- Wird genutzt von REQ-004 (Hauptleiste), REQ-005 (Platzhalterseiten); Grundlage für REQ-001 (Anpassbarkeit in den Einstellungen).

## Offene Fragen

- F1: Bestätigung der Farbrollen-Namen und der Zuordnungstabelle (entspricht REQ-001, F1; hier eingeschränkt auf die Elemente des Prototyps).
- F2: Bestätigung oder Änderung der vorgeschlagenen Standardwerte (kein AK, nur Startwert).
- F3: Dürfen abgeleitete Töne einer Farbrolle verwendet werden (z. B. Textfarbe mit reduzierter Deckkraft für nicht aktive Hauptleisten-Einträge oder Trennlinien), oder nur die vier reinen Werte?
- F4: Soll die Kontrast-Mindestanforderung für das Standard-Theme verbindlich (prüfbar) sein? Folge: Ein Farbwechsel auf Zuruf mit zu geringem Kontrast würde dann den Test rot machen.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-09 | Erstellt; Farbrollen, Zuordnung und Standard-Theme aus REQ-001 herausgelöst (für ersten Prototyp) | Anforderungsmanager |
