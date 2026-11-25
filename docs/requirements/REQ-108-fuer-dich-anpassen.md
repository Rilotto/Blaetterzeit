---
id: REQ-108
titel: Blatt „„Für dich“ anpassen“ – Abschnitte der Filterpille „Für dich“ ein- und ausblenden
status: Implementiert
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **festlegen, welche Abschnitte der Seite „Bücher“ in der Filterpille „Für dich“ erscheinen**, damit **ich nur die Abschnitte sehe, die mich interessieren**.

CEO (2026-11-25, sinngemäß im Chat festgelegt): Die Filter-/Einstellungen-Schaltfläche neben dem „+“ öffnet von unten ein Fenster mit dem Titel „„Für dich“ anpassen“. Darin je Abschnitt ein Haken, ob er in „Für dich“ angezeigt wird; künftige Abschnitte erscheinen automatisch und sind neu sichtbar; mindestens ein Haken bleibt immer aktiv; „Speichern“ übernimmt dauerhaft, Schließen ohne Speichern ändert nichts. Löst die To-do-Einträge „Fenster der Filter-/Einstellungen-Schaltfläche“ und „Filterpille ‚Für dich‘ personalisierbar“ ab.

## Anforderung (Satzschablone)

**Öffnen und Aufbau**
- Wenn der Nutzer auf der Seite „Bücher“ die Filter-/Einstellungen-Schaltfläche (REQ-005) antippt, muss das System von unten ein Blatt im Stil der übrigen Blätter der App öffnen (**Auslegung**: Ziehgriff und X wie Fenster „Design“, REQ-067).
- Das System muss als Titel genau „„Für dich“ anpassen“ anzeigen (deutsche Anführungszeichen um „Für dich“).
- Das System muss je Abschnitt der Seite „Bücher“ eine Zeile mit dem Abschnittsnamen und einem Haken (an/aus) anzeigen. Heutige Abschnitte: „Noch zu lesen“, „Sagas“, „Sammlungen“, „Alle Bücher“.
- Das System muss die Zeilen in der Reihenfolge der Abschnitte auf der Seite „Bücher“ anzeigen (**Auslegung**).
- Das System muss die Liste aus den vorhandenen Abschnitten der Seite „Bücher“ erzeugen, sodass ein künftig angelegter Abschnitt ohne weitere Änderung im Blatt erscheint.
- Das System muss einen Abschnitt, für den noch keine gespeicherte Auswahl besteht, als sichtbar (Haken gesetzt) behandeln. Ohne gespeicherte Auswahl sind damit alle Abschnitte sichtbar (**Auslegung**: Standard).
- Das System muss die Schaltfläche „Speichern“ anzeigen.

**Haken setzen**
- Wenn der Nutzer einen Haken antippt, muss das System ihn im Blatt umschalten; die Seite „Bücher“ ändert sich dadurch noch nicht.
- Wenn nur noch ein Haken gesetzt ist und der Nutzer ihn antippt, muss das System ihn gesetzt lassen und kurz den Hinweis „Mindestens ein Abschnitt muss sichtbar sein“ anzeigen.

**Speichern und Schließen**
- Wenn der Nutzer „Speichern“ antippt, muss das System die Auswahl dauerhaft über die Repository-Schnittstelle (ADR-0002) speichern, das Blatt schließen und die Seite „Bücher“ beim Filter „Für dich“ nur mit den angehakten Abschnitten in unveränderter Reihenfolge anzeigen.
- Das System muss die gespeicherte Auswahl nach einem Neustart der App wieder anwenden.
- Wenn der Nutzer das Blatt ohne „Speichern“ schließt (**Auslegung**: X, Android-Zurück-Taste oder Herunterziehen am Ziehgriff wie bei den übrigen Blättern), muss das System die Änderungen im Blatt verwerfen; die gespeicherte Auswahl und die Seite „Bücher“ bleiben unverändert. Beim nächsten Öffnen zeigt das Blatt die gespeicherte Auswahl.
- Das System darf das Blatt nicht durch bloßes Antippen des Ziehgriffs schließen (**Auslegung**, wie REQ-030).

## Akzeptanzkriterien

### AK-1 Blatt öffnet sich mit Titel und allen Abschnitten
- **Gegeben** die Seite „Bücher“ wird angezeigt, es gibt keine gespeicherte Auswahl
- **Wenn** der Nutzer die Filter-/Einstellungen-Schaltfläche antippt
- **Dann** ist von unten ein Blatt mit dem Titel „„Für dich“ anpassen“ geöffnet
- **Und** es enthält die Zeilen „Noch zu lesen“, „Sagas“, „Sammlungen“, „Alle Bücher“ in dieser Reihenfolge, jeweils mit gesetztem Haken
- **Und** die Schaltfläche „Speichern“

### AK-2 Speichern blendet Abschnitte aus
- **Gegeben** das Blatt ist geöffnet, alle Haken sind gesetzt
- **Wenn** der Nutzer die Haken bei „Sagas“ und „Sammlungen“ entfernt und „Speichern“ antippt
- **Dann** ist das Blatt geschlossen
- **Und** die Seite „Bücher“ zeigt beim Filter „Für dich“ nur noch „Noch zu lesen“ und „Alle Bücher“ in dieser Reihenfolge

### AK-3 Erst „Speichern“ wirkt
- **Gegeben** das Blatt ist geöffnet
- **Wenn** der Nutzer einen Haken entfernt, aber noch nicht „Speichern“ antippt
- **Dann** ist der betroffene Abschnitt auf der Seite „Bücher“ weiterhin vorhanden

### AK-4 Schließen ohne Speichern ändert nichts
- **Gegeben** gespeichert ist „alle sichtbar“, das Blatt ist geöffnet und der Nutzer hat den Haken bei „Sagas“ entfernt
- **Wenn** er das Blatt über X, die Android-Zurück-Taste oder Herunterziehen am Ziehgriff schließt
- **Dann** zeigt die Seite „Bücher“ bei „Für dich“ weiterhin alle vier Abschnitte
- **Und** beim erneuten Öffnen ist der Haken bei „Sagas“ gesetzt

### AK-5 Mindestens ein Haken
- **Gegeben** das Blatt ist geöffnet und nur der Haken bei „Alle Bücher“ ist gesetzt
- **Wenn** der Nutzer diesen Haken antippt
- **Dann** bleibt er gesetzt
- **Und** kurz erscheint der Hinweis „Mindestens ein Abschnitt muss sichtbar sein“

### AK-6 Dauerhaft gespeichert
- **Gegeben** der Nutzer hat „Sagas“ ausgeblendet und gespeichert
- **Wenn** die App neu gestartet und die Seite „Bücher“ mit „Für dich“ angezeigt wird
- **Dann** fehlt „Sagas“ weiterhin
- **Und** im Blatt ist der Haken bei „Sagas“ nicht gesetzt

### AK-7 Neuer Abschnitt erscheint automatisch und sichtbar
- **Gegeben** eine gespeicherte Auswahl ohne „Sagas“, und in der Entwicklung wird ein weiterer Abschnitt der Seite „Bücher“ ergänzt
- **Wenn** der Nutzer das Blatt öffnet
- **Dann** enthält es auch den neuen Abschnitt mit gesetztem Haken, ohne dass das Blatt selbst geändert wurde
- **Und** der neue Abschnitt wird bei „Für dich“ angezeigt, „Sagas“ bleibt ausgeblendet

### AK-8 Ziehgriff antippen schließt nicht
- **Gegeben** das Blatt ist geöffnet
- **Wenn** der Nutzer den Ziehgriff nur antippt
- **Dann** bleibt das Blatt geöffnet

## Abgrenzung (nicht Teil dieses REQ)

- Reihenfolge der Abschnitte ändern (bleibt unverändert).
- Andere Filterpillen und ihre Übersichten (REQ-036 bis REQ-042); die Auswahl wirkt nur bei „Für dich“.
- Bearbeiten der Filterkonfiguration (bleibt nach REQ-007 AK-9 ausgeschlossen).
- Gestaltung über die genannten Inhalte hinaus; Optik und Wortlaut außer Titel und Hinweis prüft der CEO im Prototyp.

## Qualitätsanforderungen

- Dauerhafte Speicherung über Neustarts hinweg (AK-6).

## Abhängigkeiten

- REQ-005 (Schaltfläche), REQ-006/REQ-007 (Filterpille „Für dich“), REQ-009, REQ-012, REQ-035 (Abschnitte), REQ-067 (Muster Blatt), ADR-0002.

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-25 | Erstellt. Inhalte vom CEO am 2026-11-25 im Chat festgelegt, Umsetzung beauftragt. Auslegungen markiert. Status „Abgestimmt“ | Anforderungsmanager |
