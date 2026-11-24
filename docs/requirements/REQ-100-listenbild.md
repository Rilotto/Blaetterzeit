---
id: REQ-100
titel: Listenbild – Bild im Cover-Format für Sagas, Sammlungen und Bibliotheken
status: In Umsetzung
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **für jede Liste ein Bild hinterlegen**, damit **meine Sagas, Sammlungen und Bibliotheken ein grafisches Highlight haben und ich sie schneller erkenne**.

CEO (wörtlich, 2026-11-24): „In dem Fenster "Liste bearbeiten" soll unter dem Listentitel die Option verfügbar sein, ein Bild für die liste zu hinterlegen. Dieses Bild soll in der Listernübersicht links neben dem Litentitel sein. EInfach ein grafisches Highlight. Soll natürlich auch in den Listenübersichten zu sehen sein.“

Zur Konzeptskizze des Scrum Masters (CEO, wörtlich, 2026-11-24): „es soll immer im Cover format sein“. Darüber hinaus hat der CEO nichts beanstandet. Das Konzept gilt damit als Grundlage.

Bezug: Vorher hatte der CEO gesagt (2026-11-23): „ich möchte später individuelle "Titelbilder" für die Listen hinterlegen können“ (REQ-097, Abgrenzung).

## Anforderung (Satzschablone)

**Allgemein**
- Das System muss je Liste (Saga, Sammlung, Bibliothek) optional genau ein Listenbild führen und es dauerhaft ausschließlich über die Repository-Schnittstellen speichern (Listen- bzw. Bildablage, ADR-0002).
- Das Listenbild hat immer das Seitenverhältnis des Buchcovers (Cover-Format, REQ-008/REQ-009) und wird nie verzerrt dargestellt.

**Blatt „Liste bearbeiten“ (Stift, REQ-098)**
- Das System muss im Blatt „Liste bearbeiten“ unter dem Namensfeld ein Bildfeld darstellen. Ohne Listenbild zeigt es „Bild hinzufügen“, mit Listenbild das Bild im Cover-Format.
- Wenn der Nutzer das Bildfeld ohne Listenbild antippt, muss das System die Bildquellen wie beim Buchcover anbieten: Aufnahme in der Kameraansicht oder Auswahl aus der Galerie (REQ-015, REQ-016). „Cover online suchen“ wird hier nicht angeboten (**Auslegung**: nicht Teil des Konzepts).
- Nach Aufnahme oder Auswahl muss das System den Zuschnitt mit vier Eckpunkten, Lupe und Feinjustierung anbieten (REQ-017, REQ-070). Der Ausgangsrahmen und das Ergebnis haben das Cover-Format.
- Wenn ein Listenbild vorhanden ist und der Nutzer das Bildfeld antippt, muss das System „Ersetzen“ und „Entfernen“ anbieten. „Ersetzen“ führt durch dieselben Schritte wie „Bild hinzufügen“. „Entfernen“ leert das Bildfeld.
- Bildänderungen (Hinzufügen, Ersetzen, Entfernen) übernimmt das System erst mit „Sichern“, zusammen mit dem Namen. Schließt der Nutzer das Blatt ohne „Sichern“, muss das System die Bildänderung verwerfen (wie REQ-098).
- Wird die Liste gelöscht (REQ-098), muss das System ihr Listenbild mit löschen (**Auslegung**).
- Verweigerter Zugriff auf Kamera oder Galerie wird behandelt wie beim Buchcover (REQ-016).

**Anzeige**
- **Geöffnete Liste (REQ-098):** Mit Listenbild muss das System das Bild klein im Cover-Format links neben dem Listennamen darstellen. Ohne Listenbild steht nur der Name, ohne Platzhalter.
- **Listenübersicht (REQ-097), auch als Zielansicht des Menüpunkts „Bibliothek“:** Das System muss je Liste links neben dem Namen das Listenbild im Cover-Format darstellen. Ohne Listenbild steht dort ein schlichter Platzhalter in derselben Größe, damit die Namen bündig bleiben (Gestaltung: Muster Cover-Platzhalter, REQ-010).
- **Seite „Bücher“, Abschnitte „Sagas“ und „Sammlungen“ (REQ-097):** Mit Listenbild muss das System das Bild an Stelle des Cover-Platzhalters der Liste darstellen, wie ein Buchcover in der Buchliste (REQ-020). Ohne Listenbild bleibt der Cover-Platzhalter.

## Akzeptanzkriterien

### AK-1 Bildfeld im Blatt „Liste bearbeiten“
- **Gegeben** die Sammlung „Lieblingsbücher“ ohne Listenbild ist geöffnet
- **Wenn** der Nutzer den Stift antippt
- **Dann** steht im Blatt unter dem Namensfeld das Bildfeld „Bild hinzufügen“

### AK-2 Bild hinzufügen und sichern
- **Gegeben** das Blatt „Liste bearbeiten“ der Saga „The Empyrean“ ohne Listenbild ist geöffnet
- **Wenn** der Nutzer „Bild hinzufügen“ antippt, ein Bild aus der Galerie wählt, den Zuschnitt bestätigt und „Sichern“ antippt
- **Dann** hat die Saga ein Listenbild im Cover-Format, auch nach einem Neustart
- **Und** die geöffnete Saga zeigt es klein links neben „The Empyrean“

### AK-3 Schließen ohne Sichern verwirft
- **Gegeben** im Blatt „Liste bearbeiten“ wurde ein Bild hinzugefügt bzw. (zweiter Durchlauf) ein vorhandenes Bild entfernt
- **Wenn** der Nutzer das Blatt ohne „Sichern“ schließt
- **Dann** ist das Listenbild unverändert

### AK-4 Ersetzen und Entfernen
- **Gegeben** die Bibliothek „Zuhause“ hat ein Listenbild
- **Wenn** der Nutzer im Blatt „Liste bearbeiten“ das Bildfeld antippt
- **Dann** werden „Ersetzen“ und „Entfernen“ angeboten
- **Und** nach „Entfernen“ und „Sichern“ hat die Bibliothek kein Listenbild, und das Bildfeld zeigt wieder „Bild hinzufügen“

### AK-5 Listenübersicht mit und ohne Bild
- **Gegeben** die Sammlung „Lieblingsbücher“ mit Listenbild und die Sammlung „Sommer 2026“ ohne
- **Wenn** die Listenübersicht „Sammlungen“ angezeigt wird
- **Dann** steht links neben „Lieblingsbücher“ das Bild im Cover-Format und links neben „Sommer 2026“ ein Platzhalter gleicher Größe
- **Und** beide Namen beginnen auf derselben Höhe links

### AK-6 Seite „Bücher“
- **Gegeben** die Saga „The Empyrean“ mit Listenbild und die Saga „Crescent City“ ohne
- **Wenn** die Seite „Bücher“ angezeigt wird
- **Dann** zeigt der Abschnitt „Sagas“ für „The Empyrean“ das Listenbild und für „Crescent City“ den Cover-Platzhalter, jeweils mit dem Namen darunter

### AK-7 Geöffnete Liste ohne Bild
- **Gegeben** die Sammlung „Sommer 2026“ ohne Listenbild
- **Wenn** der Nutzer sie öffnet
- **Dann** steht neben dem Namen kein Bild und kein Platzhalter

### AK-8 Immer Cover-Format
- **Gegeben** ein Listenbild, das aus einem Quer-Foto zugeschnitten wurde
- **Wenn** es in Listenübersicht, geöffneter Liste und auf der Seite „Bücher“ angezeigt wird
- **Dann** hat es überall das Seitenverhältnis des Buchcovers und ist nicht verzerrt

## Abgrenzung (nicht Teil dieses REQ)

- „Cover online suchen“ für Listenbilder.
- Automatisches Listenbild aus den Covern der enthaltenen Bücher.

## Qualitätsanforderungen

- Darstellung in allen Farbdesigns und Stilen (REQ-068, REQ-071).

## Abhängigkeiten

- **REQ-097:** Listenübersicht und Seite „Bücher“ bekommen das Listenbild. Die Abgrenzung „Individuelle ‚Titelbilder‘ für Listen (später)“ wird mit diesem REQ abgelöst.
- **REQ-098:** Das Blatt „Liste bearbeiten“ (Stift) bekommt das Bildfeld. „Sichern“ übernimmt Name und Bild, „Liste löschen“ löscht auch das Bild.
- **REQ-010, REQ-015, REQ-016, REQ-017, REQ-019, REQ-020, REQ-070, ADR-0002.**

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-24 | Erstellt aus CEO-Wunsch und der vom CEO nicht beanstandeten Konzeptskizze („es soll immer im Cover format sein“), Entwurf | Anforderungsmanager |
| 2026-11-24 | Vom CEO bestätigt (wörtlich): „passt für mich :)“. Status „Abgestimmt“ | Anforderungsmanager |
