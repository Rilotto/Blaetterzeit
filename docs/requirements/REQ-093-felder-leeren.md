---
id: REQ-093
titel: Gespeicherte Angaben durch Leeren des Feldes entfernen
status: In Umsetzung
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **eine gespeicherte Angabe wieder entfernen, indem ich das Feld leere**, damit **ich falsche oder unerwünschte Angaben loswerde, ohne einen Ersatzwert eintragen zu müssen**.

CEO (wörtlich, 2026-11-23), gefragt im Zusammenhang mit „Erschienen“ (REQ-092): „Ja, ich möchte alles wieder leeren können, indem ich das Feld einfach mit der Löschen Taste leere. Soll für alle Text und Zahlenfelder gelten.“

CEO-Antworten (wörtlich, 2026-11-23), Runde 2:
- Zu den Datumsfeldern „Hinzugefügt“ und „Beendet am“: „ja soll auch leerbar sein“
- Zu Pflichtangaben und weiteren Feldern: „Nein diese bleiben als Pflichtfeld. Autor und die aktuelle Seite und den Prozentwert und die eigene Rezension sollen leerbar sein.“

## Anforderung (Satzschablone)

**Grundregel**
- Wenn der Nutzer das Feld einer gespeicherten leerbaren Angabe mit der Löschtaste vollständig leert und „Sichern“ antippt, muss das System die Angabe dauerhaft entfernen (ADR-0002) und das Fenster bzw. Blatt schließen.
- Ein geleertes Feld gilt bei leerbaren Angaben nicht als ungültig. Die Hervorhebung für ungültige Eingaben darf dann nicht erscheinen, zum Beispiel bei ISBN oder Datum.
- Danach muss das System die Angabe so anzeigen, wie es für ein Buch ohne diese Angabe festgelegt ist.
- Schließen ohne „Sichern“ verwirft auch das Leeren, wie in den jeweiligen REQs.

**Leerbare Angaben und Anzeige danach**
- Verlag, ISBN (REQ-063): Die Zeile ist rechts leer (REQ-056).
- Preis (REQ-059): Die Zeile zeigt „Trag ein, was du bezahlt hast“ (REQ-056).
- Maße (REQ-072), je Einzelwert Breite, Höhe und Dicke: Der Einzelwert gilt als nicht hinterlegt (REQ-072/REQ-077).
- Hinzugefügt (REQ-064): Das Buch hat kein Eintragungsdatum, und die Zeile ist rechts leer (Regel für Zeilen ohne Wert, REQ-056). Im Abschnitt „Alle Bücher“ (REQ-035) steht ein Buch ohne Eintragungsdatum an erster Stelle, also dort, wo sonst das zuletzt eingetragene Buch steht (CEO, wörtlich: „ganz oben.“). Mehrere Bücher ohne Eintragungsdatum stehen untereinander A–Z nach Titel (CEO, wörtlich: „erstmal A-Z.“). Die Übersicht „Alle Bücher“ sortiert weiter A–Z und ist nicht betroffen.
- Beendet am (REQ-085): Das Buch hat kein „Beendet am“, und die Zeile ist rechts leer (REQ-056). Für die Statistik gilt das Buch dann als Buch ohne „Beendet am“ (REQ-081, REQ-084). Wechselt der Status später erneut auf *gelesen*, gilt REQ-085.
- Aktuelle Seite bzw. Prozentwert (Menü „Aktuelle Seite“, REQ-024): Das Buch hat keinen gespeicherten Fortschritt, und der Lesefortschritt wird wie ohne Fortschritt angezeigt (REQ-023). Das Leeren erhöht den Fortschritt nicht und erzeugt deshalb keine Sitzung (REQ-024, REQ-026). Bereits gespeicherte Sitzungen bleiben unverändert.
- Eigene Rezension (Schreibfenster, REQ-049): Das Buch hat keine eigene Rezension, und „Deine Rezension“ zeigt den Zustand ohne Rezension („Noch nicht geschrieben“, REQ-047).
- Erschienen: geregelt in REQ-092.
- Autor: Das Bearbeiten und Leeren ist in REQ-094 geregelt (Blatt wie „Verlag“). Danach steht in den Buchdetails der Platzhalter „unbekannter Autor“.

**Pflichtangaben, nicht leerbar**
- Titel und Seitenanzahl bleiben Pflichtangaben (CEO: „Nein diese bleiben als Pflichtfeld.“). Ein geleertes Feld gilt bei ihnen weiterhin als ungültig, so wie es die bestehenden REQs regeln (REQ-031, REQ-060, REQ-025, REQ-057).

## Akzeptanzkriterien

### AK-1 Verlag leeren
- **Gegeben** ein Buch mit Verlag „Carlsen“
- **Wenn** der Nutzer im Blatt „Verlag“ das Feld leert und „Sichern“ antippt
- **Dann** ist das Blatt geschlossen, das Buch hat keinen Verlag, und die Zeile „Verlag“ ist rechts leer, auch nach einem Neustart

### AK-2 ISBN leeren ohne Hervorhebung
- **Gegeben** ein Buch mit gültiger ISBN
- **Wenn** der Nutzer im Blatt „ISBN“ das Feld leert und „Sichern“ antippt
- **Dann** ist das Feld nicht hervorgehoben, das Blatt ist geschlossen, und das Buch hat keine ISBN

### AK-3 Preis leeren
- **Gegeben** ein Buch mit Preis 12,99 €
- **Wenn** der Nutzer im Menü „Preis“ das Feld leert und „Sichern“ antippt
- **Dann** hat das Buch keinen Preis, und die Zeile „Preis“ zeigt „Trag ein, was du bezahlt hast“, auch nach einem Neustart

### AK-4 Einzelnes Maß leeren
- **Gegeben** ein Buch mit hinterlegter Breite, Höhe und Dicke
- **Wenn** der Nutzer im Blatt „Maße“ nur das Feld „Dicke“ leert und „Sichern“ antippt
- **Dann** sind Breite und Höhe unverändert, und die Dicke gilt als nicht hinterlegt (REQ-072/REQ-077)

### AK-5 Hinzugefügt leeren
- **Gegeben** ein Buch mit Eintragungsdatum 14.10.2026
- **Wenn** der Nutzer im Blatt „Hinzugefügt“ das Feld leert und „Sichern“ antippt
- **Dann** ist das Feld nicht hervorgehoben, das Buch hat kein Eintragungsdatum, und die Zeile „Hinzugefügt“ ist rechts leer, auch nach einem Neustart

### AK-11 Ohne Eintragungsdatum ganz oben in „Alle Bücher“
- **Gegeben** drei Bücher mit Eintragungsdatum und ein Buch, dessen „Hinzugefügt“ geleert wurde
- **Wenn** der Abschnitt „Alle Bücher“ auf der Seite „Bücher“ angezeigt wird
- **Dann** steht das Buch ohne Eintragungsdatum an erster Stelle, danach die übrigen wie bisher (REQ-035)

### AK-12 Mehrere Bücher ohne Eintragungsdatum A–Z
- **Gegeben** die Bücher „Zorn“ und „Asche“ haben kein Eintragungsdatum, weitere Bücher haben eines
- **Wenn** der Abschnitt „Alle Bücher“ angezeigt wird
- **Dann** stehen zuerst „Asche“, dann „Zorn“, danach die übrigen wie bisher

### AK-6 Beendet am leeren
- **Gegeben** ein Buch mit Status *gelesen* und „Beendet am“ 22.11.2026
- **Wenn** der Nutzer im Blatt „Beendet am“ das Feld leert und „Sichern“ antippt
- **Dann** hat das Buch kein „Beendet am“, die Zeile ist rechts leer, und der Status bleibt *gelesen*

### AK-7 Aktuelle Seite leeren
- **Gegeben** ein Buch mit 400 Seiten und aktueller Seite 120
- **Wenn** der Nutzer im Menü „Aktuelle Seite“ (Modus „Seite“ bzw. im zweiten Durchlauf Modus „%“) das Feld leert und „Sichern“ antippt
- **Dann** hat das Buch keinen gespeicherten Fortschritt, und der Lesefortschritt wird wie bei einem Buch ohne Fortschritt angezeigt (REQ-023)
- **Und** es ist keine neue Sitzung entstanden, und die bisherigen Sitzungen sind unverändert

### AK-8 Eigene Rezension leeren
- **Gegeben** ein Buch mit eigener Rezension
- **Wenn** der Nutzer im Schreibfenster den Text vollständig löscht und „Sichern“ antippt
- **Dann** hat das Buch keine eigene Rezension, und „Deine Rezension“ zeigt „Noch nicht geschrieben“ (REQ-047), auch nach einem Neustart

### AK-9 Pflichtangaben bleiben Pflicht
- **Gegeben** ein Buch mit 400 Seiten
- **Wenn** der Nutzer im Menü „Buchlänge“ über die Zeile „Seiten“ das Feld leert und „Sichern“ antippt
- **Dann** wird nichts gespeichert, und die Seitenanzahl bleibt 400 (REQ-057)

### AK-10 Schließen ohne Sichern verwirft das Leeren
- **Gegeben** ein Buch mit Verlag „Carlsen“, und im Blatt „Verlag“ ist das Feld geleert
- **Wenn** der Nutzer das Blatt schließt, ohne „Sichern“ anzutippen
- **Dann** hat das Buch weiterhin den Verlag „Carlsen“

## Abgrenzung (nicht Teil dieses REQ)

- Leeren von „Erschienen“ (REQ-092).
- Leere Felder im Blatt „Manueller Eintrag“ vor „Hinzufügen“. Leer gelassene optionale Angaben werden dort schon heute nicht gespeichert (REQ-060). Bleibt „Hinzugefügt“ dort leer, wird das Datum automatisch gesetzt (REQ-060, AK-8).

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

Folgende Inhalte bestehender REQs werden mit Umsetzung dieses REQ abgelöst. Alle stehen auf „Implementiert“ und sind nicht eingefroren, deshalb ist kein `ersetzt` nötig. Sie werden nach der Bestätigung durch den CEO nachgezogen.
- **REQ-049:** „Leeres Feld sichern bewirkt nichts“ gilt nur noch, wenn keine Rezension gespeichert ist. Bei gespeicherter Rezension entfernt Sichern mit leerem Feld die Rezension.
- **REQ-063:** Die ISBN-Prüfung gilt nur für nicht leere Felder.
- **REQ-064, REQ-085:** Ein leeres Datumsfeld ist nicht mehr ungültig, sondern entfernt das Datum.
- **REQ-024:** Ein leeres Feld entfernt den Fortschritt.
- **REQ-041:** Das Eintragungsdatum kann künftig fehlen.
- **REQ-035** (Abschnitt „Alle Bücher“, zuletzt eingetragene zuerst), Sortierknopf „Zuletzt“ (To-do-Liste): Diese Funktionen sind von Büchern ohne Eintragungsdatum betroffen, siehe Offene Fragen.
- **REQ-023, REQ-025, REQ-031, REQ-047, REQ-056, REQ-057, REQ-059, REQ-060, REQ-072, REQ-077, REQ-081, REQ-084, REQ-092, ADR-0002.**

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-23 | Erstellt aus CEO-Antwort vom 2026-11-23 („Soll für alle Text und Zahlenfelder gelten.“), Entwurf | Anforderungsmanager |
| 2026-11-23 | CEO-Antworten Runde 2 eingearbeitet: „Hinzugefügt“ und „Beendet am“ leerbar, außerdem aktuelle Seite bzw. Prozentwert, eigene Rezension und Autor. Titel und Seitenanzahl bleiben Pflicht. AK-5 bis AK-9 neu, abgelöste Inhalte vermerkt. Status Entwurf | Anforderungsmanager |
| 2026-11-23 | CEO-Antworten Runde 3 eingearbeitet: Der Autor wird unter dem Cover bearbeitet und geleert (REQ-094). Bücher ohne Eintragungsdatum stehen in „Alle Bücher“ ganz oben (AK-11 neu). Neu offen: Reihenfolge mehrerer Bücher ohne Eintragungsdatum. Status Entwurf | Anforderungsmanager |
| 2026-11-23 | CEO: „erstmal A-Z.“ Mehrere Bücher ohne Eintragungsdatum stehen untereinander A–Z (AK-12 neu). Autor nach dem Leeren mit Platzhalter (REQ-094). Keine offenen Fragen. Status Entwurf | Anforderungsmanager |
| 2026-11-23 | Vom CEO bestätigt (wörtlich): „okay, freigegeben. Starte mit dem nächsten Prototypen“. Status „Abgestimmt“ | Anforderungsmanager |
