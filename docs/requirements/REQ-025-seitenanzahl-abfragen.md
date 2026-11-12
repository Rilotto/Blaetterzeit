---
id: REQ-025
titel: Buchdetails – Menü „Buchlänge“ zur einmaligen Eingabe der Seitenanzahl
status: In Umsetzung
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **vor dem ersten Eintragen meines Fortschritts einmalig die Seitenanzahl des Buches festlegen**, damit **der Fortschritt berechnet und angezeigt werden kann**.

Vorgabe des CEO (wörtlich, 2026-11-10): „WICHTIG: Rufe ich dieses Menü auf, ohne dass eine Seitenanzahl für das Buch hinterlegt ist, werde ich in einem kleinen Zusatzfeld danach gefragt. Die Zahl kann ich nur in den späteren Buchdetails ändern (ist eine weitere Erweiterung, kommt später noch dazu).“

Präzisierung des CEO (wörtlich, 2026-11-10, ersetzt das frühere Zusatzfeld im Menü „Aktuelle Seite“): „[…] wie sich das Menü öffnen soll, zur einmaligen Eingabe der Seitenanzahlen. Setze dies bitte genauso um. Sichern, das X, die Überschrift etc. kannst du dir von bisher besprochenen ableiten. Erst wenn ich hier auf Sichern klicke, geht dieses Menü weg und genau darunter erscheint das 'Aktuelle Seite'-Menü.“

Antworten des CEO (2026-11-10):
- „Ja, auch beim %-Modus muss ich die Seitenanzahl angeben.“
- Schließen über X oder Tippen außerhalb: „richtig“ – alles schließt, das Menü „Aktuelle Seite“ erscheint nicht, nichts wird gespeichert.

Referenzbild: [referenzen/REF-buchdetails-04-buchlaenge.png](referenzen/REF-buchdetails-04-buchlaenge.png). Der Hintergrund des Referenzbilds (fremde App) ist nicht Teil der Vorgabe. Die optische Übereinstimmung prüft der CEO im Prototyp; sie ist kein Akzeptanzkriterium.

## Anforderung (Satzschablone)

**Seitenanzahl als Voraussetzung**
- Das System muss zu jedem Buch optional eine Seitenanzahl speichern können (Erweiterung der Buchdaten aus REQ-008).
- Wenn der Nutzer den Lesefortschritt (Herz-Icon, REQ-023) eines Buches ohne Seitenanzahl antippt, muss das System statt des Menüs „Aktuelle Seite“ zuerst das Menü „Buchlänge“ öffnen – unabhängig vom Fortschrittsmodus.
- Das System darf das Menü „Aktuelle Seite“ (REQ-024) für ein Buch ohne Seitenanzahl nicht öffnen.

**Aufbau des Menüs „Buchlänge“**
- Das System muss das Menü „Buchlänge“ von unten einblenden und die Buchdetails dahinter mit der Abdunklung überdecken (wie REQ-024).
- Das System muss die Grundfläche des Menüs in Farbrubrik „Hintergrund“ darstellen (wie REQ-024).
- Das System muss oben mittig im Menü einen Ziehgriff darstellen.
- Das System muss die Überschrift „Buchlänge“ in Farbrubrik „Dunkelbraun“ darstellen.
- Das System muss oben rechts eine X-Schaltfläche mit Hintergrund „Ghost“, Rahmen „GhostFrame“ und X in „Dunkelbraun“ darstellen.
- Das System muss unter der Überschrift den Untertitel „Leg die Länge dieses Buches fest“ darstellen.
- Das System muss darunter ein Eingabefeld für die Seitenanzahl mit Hintergrund „Ghost“, Rahmen „GhostFrame“ und zentrierter Schrift in „Dunkelbraun“ darstellen.
- Das System muss darunter eine Pille „Sichern“ mit Hintergrund in Farbrubrik „Primär“ und Schrift in Farbrubrik „Hintergrund“ darstellen.

**Werte, Sichern, Schließen**
- Das System muss als Seitenanzahl nur ganze Zahlen ab 1 annehmen.
- Ist das Eingabefeld leer oder ungültig, darf das System nicht sichern; bei leerem Feld muss es unter dem Eingabefeld einen kurzen Hinweis anzeigen.
- Wenn der Nutzer „Sichern“ mit gültiger Seitenanzahl antippt, muss das System die Seitenanzahl dauerhaft als Seitenanzahl des Buches speichern (ADR-0002), das Menü „Buchlänge“ schließen und unmittelbar an seiner Stelle das Menü „Aktuelle Seite“ (REQ-024) für dieses Buch anzeigen.
- Wenn der Nutzer im Menü „Buchlänge“ die X-Schaltfläche antippt oder außerhalb des Menüs tippt, muss das System das Menü schließen, ohne die Seitenanzahl zu speichern, und darf das Menü „Aktuelle Seite“ nicht anzeigen.
- Wenn für das Buch eine Seitenanzahl hinterlegt ist, darf das System das Menü „Buchlänge“ nicht anzeigen; die Seitenanzahl ist im Menü „Aktuelle Seite“ nicht änderbar.

**Annahmen (nicht blockierend, vom CEO im Prototyp zu prüfen)**
- Untertitel in Farbrubrik „Tertiär“ (aus den bestehenden Farbrubriken nach dem Referenzbild abgeleitet).
- Ziehgriff nur als optisches Element, Farbe nach dem Referenzbild; Ziehen bewirkt nichts.
- Eingabefeld beim Öffnen leer.

## Akzeptanzkriterien

### AK-1 Ohne Seitenanzahl öffnet „Buchlänge“
- **Gegeben** ein Buch ohne Seitenanzahl (Fortschrittsmodus „Seite“ bzw. in einem zweiten Durchlauf „%“)
- **Wenn** der Nutzer in den Buchdetails das Herz-Icon antippt
- **Dann** wird das Menü „Buchlänge“ von unten eingeblendet, die Buchdetails dahinter sind abgedunkelt
- **Und** das Menü „Aktuelle Seite“ ist nicht sichtbar

### AK-2 Aufbau und Farben
- **Gegeben** das Menü „Buchlänge“ ist geöffnet
- **Wenn** es betrachtet wird
- **Dann** gibt es einen Ziehgriff, die Überschrift „Buchlänge“ in „Dunkelbraun“, oben rechts eine X-Schaltfläche (Hintergrund „Ghost“, Rahmen „GhostFrame“, X „Dunkelbraun“) und den Untertitel „Leg die Länge dieses Buches fest“
- **Und** die Grundfläche ist „Hintergrund“, das Eingabefeld „Ghost“ mit Rahmen „GhostFrame“ und zentrierter Schrift in „Dunkelbraun“, die Pille „Sichern“ „Primär“ mit Schrift „Hintergrund“

### AK-3 Sichern speichert und öffnet „Aktuelle Seite“
- **Gegeben** ein Buch ohne Seitenanzahl, das Menü „Buchlänge“ ist geöffnet
- **Wenn** der Nutzer 400 eingibt und „Sichern“ antippt
- **Dann** ist das Menü „Buchlänge“ geschlossen und das Menü „Aktuelle Seite“ wird angezeigt
- **Und** das Buch hat die Seitenanzahl 400, auch nach Neustart

### AK-4 Ungültige oder leere Eingabe
- **Gegeben** ein Buch ohne Seitenanzahl, das Menü „Buchlänge“ ist geöffnet
- **Wenn** der Nutzer bei leerem Feld bzw. mit 0 „Sichern“ antippt
- **Dann** wird nichts gespeichert, das Menü „Buchlänge“ bleibt offen und „Aktuelle Seite“ erscheint nicht
- **Und** bei leerem Feld erscheint unter dem Eingabefeld ein kurzer Hinweis

### AK-5 Schließen ohne Sichern
- **Gegeben** ein Buch ohne Seitenanzahl, der Nutzer hat im Menü „Buchlänge“ 400 eingegeben
- **Wenn** er die X-Schaltfläche antippt bzw. (in einem zweiten Durchlauf) außerhalb des Menüs tippt
- **Dann** sind alle Menüs geschlossen und das Menü „Aktuelle Seite“ erscheint nicht
- **Und** das Buch hat weiterhin keine Seitenanzahl, die Buchdetails zeigen weiterhin das Herz-Icon

### AK-6 Kein Menü „Buchlänge“ bei vorhandener Seitenanzahl
- **Gegeben** ein Buch mit Seitenanzahl
- **Wenn** der Nutzer den Lesefortschritt antippt
- **Dann** öffnet sich direkt das Menü „Aktuelle Seite“ ohne Menü „Buchlänge“
- **Und** die Seitenanzahl ist dort nicht änderbar

## Abgrenzung (nicht Teil dieses REQ)

- Ändern der Seitenanzahl in den Buchdetails (spätere Erweiterung laut CEO).
- Inhalt und Verhalten des Menüs „Aktuelle Seite“ (REQ-024).
- Wortlaut des kurzen Hinweises (kein Akzeptanzkriterium; prüft der CEO im Prototyp).

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-008, REQ-023, REQ-024.** **ADR-0002.**

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-10 | Erstellt (Entwurf aus CEO-Beschreibung, Erweiterung 2) | Anforderungsmanager |
| 2026-11-10 | CEO-Antworten eingearbeitet: F4 Zusatzfeld „Seitenanzahl des Buches“ über dem Eingabefeld, nur im Modus „Seite“, Farben, Sichern nur mit beiden Feldern, Speicherung erst mit „Sichern“ (AK-1, AK-2 geändert, neu AK-3, AK-4, AK-5; AK-3 alt → AK-6). Priorität Must. Status „Abgestimmt“ (CEO 2026-11-10) | Anforderungsmanager |
| 2026-11-10 | Umgestellt auf eigenes Menü „Buchlänge“ vor „Aktuelle Seite“ (CEO: „Erst wenn ich hier auf Sichern klicke, geht dieses Menü weg und genau darunter erscheint das 'Aktuelle Seite'-Menü.“; „Ja, auch beim %-Modus muss ich die Seitenanzahl angeben.“; X/außerhalb: „richtig“). Zusatzfeld und Ausnahme für Modus „%“ entfallen. Alle AKs neu gefasst: AK-1 bis AK-6 geändert (AK-4 alt „aktuelle Seite nicht über Seitenanzahl“ entfällt, abgedeckt durch REQ-024 AK-6). Annahmen: Untertitel Tertiär, Ziehgriff nur optisch, Feld leer. Status „Abgestimmt“ (CEO 2026-11-10) | Anforderungsmanager |
