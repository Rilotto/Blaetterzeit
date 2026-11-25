---
id: REQ-049
titel: Reiter „Rezension“ – Schreibfenster für die eigene Rezension
status: Implementiert
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **meine Rezension in einem eigenen Fenster schreiben, sichern und später bearbeiten**, damit **ich genug Platz zum Schreiben habe und sie dauerhaft behalte**.

Antwort des CEO (wörtlich, 2026-11-15): „Wenn ich da rein klicke, öffnet sich ein neues Fenster und ich kann hier meine Meinung reinschreiben (siehe Screenshots). Das mit öffentlich und enthält Spoiler muss nicht umgesetzt werden. Der Kreis und das "noch nicht geschrieben" entfällt ebenfalls. Es gibt keine Längenbegrenzung. Die volle Rezensionslänge wird nach "sichern" angezeigt.“

Weitere Antworten des CEO (wörtlich, 2026-11-15):
- Schließen ohne „Sichern“: „Es wird nichts gespeichert, der Text geht verloren“
- Erneutes Antippen bei vorhandener Rezension öffnet sie zum Bearbeiten: „ja“
- Leeres Feld sichern: „nichts“
- Dauerhaft nach Neustart: „sehr gut, ist richtig!“
- Sterne im Schreibfenster: „sind nur eine Anzeige gemäß der entsprechenden Bewertung“; ohne Sterne-Bewertung: „Nichts“
- Kreis / „Noch nicht geschrieben“ auch im Schreibfenster weglassen: „ja, weglassen.“

Referenzbilder: [referenzen/REF-rezension-03-schreiben-tastatur.png](referenzen/REF-rezension-03-schreiben-tastatur.png), [referenzen/REF-rezension-04-schreiben.png](referenzen/REF-rezension-04-schreiben.png). Die optische Übereinstimmung prüft der CEO im Prototyp; sie ist kein Akzeptanzkriterium.

## Anforderung (Satzschablone)

- Wenn der Nutzer das Schreibfeld (REQ-047) antippt, muss das System das Schreibfenster zu diesem Buch öffnen; liegt eine gesicherte Rezension vor, steht ihr Text bearbeitbar im Eingabefeld.
- Das System muss im Schreibfenster oben einen Ziehgriff, darunter zentriert Buchtitel und Autor (REQ-028; ohne Autor entfällt die Zeile) und rechts daneben eine X-Schaltfläche darstellen.
- Wenn „Sterne“ (REQ-045) einen Wert hat, muss das System rechts unter der Kopfzeile die Sterne-Bewertung klein und nur als Anzeige darstellen; ohne Sterne-Bewertung stellt es dort nichts dar.
- Das System muss ein Eingabefeld mit dem Platzhaltertext „Wie fandest du es?“ darstellen, in das der Nutzer beliebig langen, mehrzeiligen Text eingeben kann.
- Das System muss unten eine Schaltfläche „Sichern“ in Farbrubrik „Primär“ darstellen.
- Wenn der Nutzer bei nicht leerem Eingabefeld „Sichern“ antippt, muss das System den Text als Rezension dieses Buches dauerhaft speichern (über Neustart hinweg, Repository-Schnittstelle, ADR-0002), das Schreibfenster schließen und den vollständigen Text im Schreibfeld (REQ-047) anzeigen.
- Wenn der Nutzer bei leerem Eingabefeld „Sichern“ antippt und keine Rezension gespeichert ist, darf das System nichts tun. Ist eine Rezension gespeichert, entfernt das System sie (REQ-093).
- Wenn der Nutzer das Schreibfenster ohne „Sichern“ schließt (X, Herunterziehen am Griff, Tippen außerhalb, Android-Zurück-Taste), darf das System nichts speichern; der eingegebene Text geht verloren und eine zuvor gesicherte Rezension bleibt unverändert.
- Das System darf im Schreibfenster weder Kreis noch „Noch nicht geschrieben“ noch „Enthält Spoiler“ noch „Öffentlich“ darstellen.
- Das System muss Elemente und Farben wie in den Referenzbildern darstellen, mit Farben aus zentralen Farbrubriken.

## Akzeptanzkriterien

### AK-1 Öffnen
- **Gegeben** die Buchdetails eines Buches mit Titel und Autor, Reiter „Rezension“
- **Wenn** der Nutzer das Schreibfeld antippt
- **Dann** öffnet sich das Schreibfenster mit Ziehgriff, Buchtitel und Autor, X-Schaltfläche, Eingabefeld „Wie fandest du es?“ und „Sichern“

### AK-2 Sterne nur als Anzeige
- **Gegeben** „Sterne“ hat für das Buch den Wert 4
- **Wenn** das Schreibfenster geöffnet ist und der Nutzer die Sterne antippt
- **Dann** zeigt es vier volle und einen blassen Stern
- **Und** der Wert von „Sterne“ bleibt 4

### AK-3 Ohne Sterne-Bewertung keine Sterne
- **Gegeben** „Sterne“ hat für das Buch keine Bewertung
- **Wenn** das Schreibfenster geöffnet ist
- **Dann** werden keine Sterne angezeigt

### AK-4 Keine Längenbegrenzung
- **Gegeben** das Schreibfenster ist geöffnet
- **Wenn** der Nutzer einen Text mit 10 000 Zeichen und Zeilenumbrüchen eingibt und sichert
- **Dann** ist der gesamte Text ungekürzt gespeichert

### AK-5 Sichern
- **Gegeben** der Nutzer hat im Schreibfenster einen Text eingegeben
- **Wenn** er „Sichern“ antippt
- **Dann** schließt sich das Schreibfenster
- **Und** das Schreibfeld in den Buchdetails zeigt den vollständigen Text

### AK-6 Dauerhaft gespeichert
- **Gegeben** für ein Buch wurde eine Rezension gesichert
- **Wenn** die App neu gestartet und die Buchdetails dieses Buches geöffnet werden
- **Dann** zeigt das Schreibfeld die Rezension vollständig

### AK-7 Bearbeiten
- **Gegeben** für ein Buch ist eine Rezension gesichert
- **Wenn** der Nutzer das Schreibfeld antippt, den Text ändert und „Sichern“ antippt
- **Dann** stand beim Öffnen der bisherige Text im Eingabefeld
- **Und** danach zeigt das Schreibfeld den geänderten Text

### AK-8 Leeres Feld sichern ohne gespeicherte Rezension bewirkt nichts
- **Gegeben** für das Buch ist keine Rezension gespeichert, und das Eingabefeld ist leer
- **Wenn** der Nutzer „Sichern“ antippt
- **Dann** bleibt das Schreibfenster offen und es wird nichts gespeichert
- **Und** hat er stattdessen den Text einer gesicherten Rezension vollständig gelöscht, entfernt „Sichern“ die Rezension (REQ-093, AK-8)

### AK-9 Schließen ohne Sichern verwirft
- **Gegeben** der Nutzer hat im Schreibfenster Text eingegeben, ohne zu sichern
- **Wenn** er das Fenster über X, Herunterziehen am Griff, Tippen außerhalb bzw. die Android-Zurück-Taste schließt
- **Dann** ist der eingegebene Text verloren
- **Und** das Schreibfeld zeigt den vorherigen Stand (zuvor gesicherte Rezension bzw. „Wie fandest du es?“)

### AK-10 Entfallene Elemente
- **Gegeben** das Schreibfenster ist geöffnet
- **Wenn** es vollständig betrachtet wird
- **Dann** gibt es keinen Kreis, kein „Noch nicht geschrieben“, kein „Enthält Spoiler“ und kein „Öffentlich“

## Abgrenzung (nicht Teil dieses REQ)

- Bereich „Deine Rezension“ in den Buchdetails (REQ-047). Teilen (REQ-050).

## Qualitätsanforderungen

- Keine Längenbegrenzung (CEO).

## Abhängigkeiten

- **REQ-028, REQ-045, REQ-047.** ADR-0002.

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-15 | Erstellt aus CEO-Antwort 6 und Referenzbildern 03/04 | Anforderungsmanager |
| 2026-11-15 | CEO-Antworten eingearbeitet: Verwerfen ohne Sichern, Bearbeiten, leeres Feld bewirkt nichts, dauerhafte Speicherung, Sterne nur Anzeige bzw. ohne Bewertung nichts, Kreis/„Noch nicht geschrieben“ entfällt (neu AK-3, AK-6 bis AK-9) | Anforderungsmanager |
| 2026-11-15 | Status „Abgestimmt“ (CEO 2026-11-15, über den Scrum Master: „Der Rest ist in Ordnung.“) | Anforderungsmanager |
| 2026-11-23 | An REQ-093 angepasst (Abgestimmt, CEO: „okay, freigegeben. Starte mit dem nächsten Prototypen“): Leeres Feld sichern entfernt eine gespeicherte Rezension (Anforderung, AK-8). Status unverändert | Anforderungsmanager |
