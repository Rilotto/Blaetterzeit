---
id: REQ-119
titel: Sprachfilter „Sprache“ (Deutsch/Englisch, Mehrfachauswahl) bei „Online suchen“ und „Cover online suchen“
status: In Umsetzung
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **bei der Online-Suche festlegen, in welcher Sprache die Bücher bzw. Cover sein sollen**, damit **ich nicht durch Ausgaben in anderen Sprachen blättern muss**.

CEO (2026-11-26, im Chat festgelegt): Über der Suchzeile bei „Cover online suchen“ (REQ-118) und bei „Online suchen“ (REQ-116) gibt es einen Filter „Sprache“ mit Deutsch und Englisch; beide gleichzeitig wählbar. Gesucht werden nur Bücher/Cover der gewählten Sprache(n). Standard: Deutsch. Die zuletzt gewählte Auswahl wird dauerhaft gemerkt. Mindestens eine Sprache muss aktiv bleiben.

## Anforderung (Satzschablone)

**Ort und Aufbau**
- Das System muss im Suchfenster „Online suchen“ (REQ-116) und im Fenster „Cover online suchen“ (REQ-118) jeweils über der Such- bzw. Suchzeile den Filter mit der Beschriftung „Sprache“ und den Wahlmöglichkeiten „Deutsch“ und „Englisch“ in dieser Reihenfolge anzeigen (**Auslegung**: Reihenfolge).
- Darstellung (**Auslegung**): im Stil „Klassisch“ (REQ-071) als zwei Pillen; gewählte wie ein aktiver Filter (REQ-006), nicht gewählte wie ein inaktiver Filter. Im Stil „Feuilleton“ als Text; gewählte unterstrichen, nicht gewählte ohne Unterstrich (wie REQ-071 „Text mit Unterstrich statt Pillen“). In beiden Stilen ist der gewählte Zustand zusätzlich für Bedienhilfen erkennbar (ausgewählt/nicht ausgewählt).

**Auswahl**
- Das System muss Mehrfachauswahl erlauben: Antippen einer Sprache schaltet sie zwischen gewählt und nicht gewählt um; beide Sprachen können gleichzeitig gewählt sein.
- Wenn nur noch eine Sprache gewählt ist und der Nutzer sie antippt, muss das System sie gewählt lassen und kurz den Hinweis „Mindestens eine Sprache muss ausgewählt sein“ anzeigen (**Auslegung**: Verhalten wie REQ-114).
- Ohne gespeicherte Auswahl muss das System „Deutsch“ gewählt und „Englisch“ nicht gewählt anzeigen.

**Wirkung auf die Suche**
- Das System muss bei jeder Suche in beiden Fenstern nur Bücher bzw. Cover in den gewählten Sprachen anfordern und anzeigen. Bei beiden Sprachen werden Treffer beider Sprachen berücksichtigt.
- Treffer, für die die Quelle keine Sprache angibt, gelten als nicht passend und entfallen (**Auslegung**).
- Wenn der Nutzer die Auswahl ändert, nachdem im Fenster bereits eine Suche ausgeführt wurde, muss das System die Suche mit dem aktuellen Text der Suchzeile neu starten; die neuen Ergebnisse ersetzen die bisherigen. Wurde noch nicht gesucht oder ist die Suchzeile leer, wirkt die Änderung erst bei der nächsten Suche (**Auslegung**).
- Die Regeln zu Reihenfolge, Höchstzahl und Hinweisen der beiden Fenster (REQ-116, REQ-117, REQ-118) gelten unverändert für die gefilterten Treffer.

**Merken**
- Das System muss die zuletzt gewählte Auswahl sofort bei jeder Änderung dauerhaft über die Repository-Schnittstelle (ADR-0002) speichern und beim nächsten Öffnen eines der beiden Fenster, auch nach einem Neustart der App, wieder anzeigen und anwenden.
- Die Auswahl ist für beide Fenster gemeinsam: Eine Änderung in einem Fenster gilt auch im anderen (**Auslegung**).

## Akzeptanzkriterien

### AK-1 Filter in beiden Fenstern, Standard Deutsch
- **Gegeben** es gibt keine gespeicherte Sprachauswahl
- **Wenn** der Nutzer das Suchfenster „Online suchen“ öffnet, und im zweiten Durchlauf das Fenster „Cover online suchen“
- **Dann** steht jeweils über der Suchzeile der Filter „Sprache“ mit „Deutsch“ und „Englisch“
- **Und** „Deutsch“ ist gewählt, „Englisch“ nicht

### AK-2 Nur deutsche Treffer
- **Gegeben** nur „Deutsch“ ist gewählt, die Quellen haben zum Suchtext deutsche und englische Ausgaben
- **Wenn** die Suche abgeschlossen ist
- **Dann** zeigt das Fenster nur deutsche Ausgaben bzw. deren Cover

### AK-3 Beide Sprachen gleichzeitig
- **Gegeben** nur „Deutsch“ ist gewählt
- **Wenn** der Nutzer „Englisch“ antippt
- **Dann** sind „Deutsch“ und „Englisch“ gewählt
- **Und** die Ergebnisse enthalten deutsche und englische Ausgaben

### AK-4 Nur Englisch
- **Gegeben** „Deutsch“ und „Englisch“ sind gewählt
- **Wenn** der Nutzer „Deutsch“ antippt
- **Dann** ist nur „Englisch“ gewählt
- **Und** die Ergebnisse enthalten nur englische Ausgaben

### AK-5 Mindestens eine Sprache
- **Gegeben** nur „Deutsch“ ist gewählt
- **Wenn** der Nutzer „Deutsch“ antippt
- **Dann** bleibt „Deutsch“ gewählt
- **Und** kurz erscheint der Hinweis „Mindestens eine Sprache muss ausgewählt sein“

### AK-6 Änderung nach einer Suche sucht neu
- **Gegeben** im Fenster wurden Ergebnisse zu „Fourth Wing“ mit nur „Deutsch“ angezeigt
- **Wenn** der Nutzer „Englisch“ antippt
- **Dann** gehen neue Anfragen mit „Fourth Wing“ und beiden Sprachen an beide Quellen
- **Und** die neuen Ergebnisse ersetzen die bisherigen

### AK-7 Auswahl wird dauerhaft und gemeinsam gemerkt
- **Gegeben** der Nutzer hat im Suchfenster „Online suchen“ nur „Englisch“ gewählt
- **Wenn** die App neu gestartet wird und der Nutzer das Fenster „Cover online suchen“ öffnet
- **Dann** ist dort nur „Englisch“ gewählt, und die automatische Suche fordert nur englische Ausgaben an

### AK-8 Treffer ohne Sprachangabe entfallen
- **Gegeben** eine Quelle liefert einen Treffer ohne Sprachangabe
- **Wenn** die Suche abgeschlossen ist
- **Dann** erscheint dieser Treffer nicht

### AK-9 Darstellung im Stil „Feuilleton“
- **Gegeben** der Stil „Feuilleton“ ist gewählt und nur „Deutsch“ ist gewählt
- **Wenn** der Nutzer ein Suchfenster öffnet
- **Dann** sind „Deutsch“ und „Englisch“ als Text ohne Pillenfläche dargestellt, „Deutsch“ unterstrichen, „Englisch“ nicht

## Abgrenzung (nicht Teil dieses REQ)

- Weitere Sprachen.
- Sprachfilter bei „Barcode scannen“ (REQ-062): Die Suche über eine ISBN bleibt ungefiltert (**Auslegung**: vom CEO nicht genannt).
- Speichern der Sprache als Buchangabe.

## Qualitätsanforderungen

- Dauerhafte Speicherung über Neustarts hinweg (AK-7).
- Darstellung in allen Farbdesigns und Stilen (REQ-068, REQ-071).

## Abhängigkeiten

- **REQ-116, REQ-117** (Suchfenster „Online suchen“; REQ-116 per Verweis ergänzt), **REQ-118** (Fenster „Cover online suchen“), **REQ-006** (Gestaltung aktiver/inaktiver Filter), **REQ-071** (Stil „Feuilleton“), **REQ-114** (Muster „mindestens eine Auswahl“), ADR-0002.

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-26 | Erstellt. Inhalte vom CEO am 2026-11-26 im Chat festgelegt, Umsetzung beauftragt. Auslegungen markiert (gemeinsame Auswahl, Hinweis wie REQ-114, Darstellung Pille/Unterstrich, Neu-Suche bei Änderung, Treffer ohne Sprachangabe entfallen). Status „Abgestimmt“ | Anforderungsmanager |
