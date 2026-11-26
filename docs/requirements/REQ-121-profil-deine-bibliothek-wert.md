---
id: REQ-121
titel: Seite „Profil“ – Abschnitt „Deine Bibliothek“ mit Zeile „Aktueller Wert“ (Summe der Preise ohne Wunschliste)
status: In Umsetzung
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **im Profil sehen, was meine Bücher zusammen gekostet haben**, damit **ich den Wert meiner Bibliothek kenne**.

CEO (2026-11-26, im Chat festgelegt): Im Reiter „Profil“ ein neuer Abschnitt „Deine Bibliothek“ oberhalb des Abschnitts „App“, Überschrift im selben Stil. Darin die Zeile „Aktueller Wert“ mit einer nicht bearbeitbaren Ausgabe der Summe aller hinterlegten Preise (REQ-059) aller Bücher außer denen mit Status „Wunschliste“.

## Anforderung (Satzschablone)

**Ort und Gestaltung**
- Das System muss auf der Seite „Profil“ einen Abschnitt mit der Überschrift „Deine Bibliothek“ im selben Stil wie die Überschrift „App“ (REQ-066) anzeigen.
- Der Abschnitt steht zwischen den Abschnitten „Du“ (REQ-107) und „App“ (REQ-066) (**Auslegung**: „oberhalb von App“ unmittelbar darüber).
- Das System muss darunter eine Karte im Stil der Karte „App“ mit genau einer Zeile „Aktueller Wert“ anzeigen, gestaltet wie die Zeile „Versionsinfo“ (REQ-113): ohne Pfeil.

**Wert**
- Das System muss rechts in der Zeile die Summe der gespeicherten Preise (REQ-059) aller Bücher anzeigen, deren Lesestatus nicht *Wunschliste* ist.
- Bücher mit allen anderen Lesestatus (*ungelesen*, *am lesen*, *gelesen*, *abgebrochen*) zählen mit (**Auslegung**: auch *abgebrochen*).
- Bücher ohne gespeicherten Preis zählen nicht; ein gespeicherter Preis von 0,00 € zählt als 0 (**Auslegung**).
- Die Angabe „Exemplar“ (REQ-058, z. B. „Verkauft“, „Geliehen“) spielt für die Summe keine Rolle (**Auslegung**: der CEO hat nur den Lesestatus genannt).
- Format (**Auslegung**): Euro mit zwei Nachkommastellen, Komma als Dezimaltrennzeichen, Punkt als Tausendertrennzeichen und „ €“ dahinter, wie die Preisanzeige in REQ-059, z. B. „1.234,56 €“. Ohne jeden zählenden Preis „0,00 €“.
- Das System muss ohne Rundungsfehler rechnen (Summe in Cent, **Auslegung**).
- Wenn sich der Preis oder der Lesestatus eines Buches ändert oder ein Buch angelegt wird, muss die Zeile beim nächsten Anzeigen der Seite „Profil“ den neuen Wert zeigen, ohne Neustart (**Auslegung**: sofort).

**Nur Anzeige**
- Die Zeile dient nur der Anzeige. Wenn der Nutzer sie antippt, darf das System nichts öffnen und nichts verändern (**Auslegung**).

## Akzeptanzkriterien

### AK-1 Abschnitt zwischen „Du“ und „App“
- **Gegeben** die App ist geöffnet
- **Wenn** der Nutzer den Menüpunkt „Profil“ antippt
- **Dann** stehen die Abschnitte „Du“, „Deine Bibliothek“ und „App“ in dieser Reihenfolge
- **Und** die Überschrift „Deine Bibliothek“ hat dieselbe Schriftgrößenstufe und Farbrolle wie „App“
- **Und** darunter steht eine Karte mit genau der Zeile „Aktueller Wert“ ohne Pfeil

### AK-2 Summe ohne Wunschliste
- **Gegeben** Buch A *gelesen* 12,99 €, Buch B *ungelesen* 20,00 €, Buch C *Wunschliste* 30,00 €, Buch D *abgebrochen* 5,01 €, Buch E *am lesen* ohne Preis
- **Wenn** der Nutzer die Seite „Profil“ öffnet
- **Dann** zeigt die Zeile „Aktueller Wert“ „38,00 €“

### AK-3 Kein Preis hinterlegt
- **Gegeben** kein Buch hat einen Preis, bzw. im zweiten Durchlauf haben nur Bücher mit Status *Wunschliste* einen Preis, bzw. im dritten Durchlauf gibt es keine Bücher
- **Wenn** der Nutzer die Seite „Profil“ öffnet
- **Dann** zeigt die Zeile „0,00 €“

### AK-4 Tausendertrennzeichen
- **Gegeben** die zählenden Preise ergeben zusammen 1234,56 €
- **Wenn** der Nutzer die Seite „Profil“ öffnet
- **Dann** zeigt die Zeile „1.234,56 €“

### AK-5 Aktualisierung nach Änderung
- **Gegeben** die Zeile zeigt „38,00 €“ (Bestand aus AK-2)
- **Wenn** der Nutzer den Status von Buch B auf *Wunschliste* setzt und danach den Preis von Buch E auf 7,50 € sichert und wieder die Seite „Profil“ öffnet
- **Dann** zeigt die Zeile ohne Neustart „25,50 €“

### AK-6 Nur Anzeige
- **Gegeben** die Seite „Profil“ ist geöffnet
- **Wenn** der Nutzer die Zeile „Aktueller Wert“ antippt
- **Dann** öffnet sich kein Blatt, kein Fenster und kein Eingabefeld, und nichts ändert sich

## Abgrenzung (nicht Teil dieses REQ)

- Weitere Kennzahlen der Bibliothek (Anzahl Bücher, Durchschnittspreis usw.).
- Bezug zur Liste der Art „Bibliothek“ (REQ-095, REQ-097): „Deine Bibliothek“ meint hier alle Bücher außer der Wunschliste, nicht eine benannte Liste.
- Andere Währungen.

## Qualitätsanforderungen

- Darstellung in allen Farbdesigns und Stilen (REQ-068, REQ-071).

## Abhängigkeiten

- **REQ-059** (Preis), **REQ-008, REQ-022** (Lesestatus), **REQ-066, REQ-107, REQ-113** (Seite „Profil“, Zeilenstil), ADR-0002.

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-26 | Erstellt. Inhalte vom CEO am 2026-11-26 im Chat festgelegt, Umsetzung beauftragt. Auslegungen markiert (Position zwischen „Du“ und „App“, Format mit Tausenderpunkt, Bücher ohne Preis zählen nicht, „0,00 €“, *abgebrochen* zählt, Exemplar egal, sofortige Aktualisierung, nicht antippbar). Status „Abgestimmt“ | Anforderungsmanager |
