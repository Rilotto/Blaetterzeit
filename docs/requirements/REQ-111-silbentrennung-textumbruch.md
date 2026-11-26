---
id: REQ-111
titel: App-weit – deutsche Silbentrennung und Textumbruch, kein Text über seine Box hinaus, mit automatischer Prüfung
status: In Umsetzung
prioritaet: Must
art: qualitaet
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **dass Texte, die nicht in eine Zeile passen, an sinnvollen Stellen mit Trennstrich umbrechen und nie aus ihrer Box laufen**, damit **die App auch auf schmalen Handys sauber lesbar ist**.

CEO (wörtlich, 2026-11-25): „Allgemein muss bitte eine Prüfung Appweit eingebaut werden, bezüglich der Silbentrennung und Textumbrüchen, wenn der Platz ausgeht.“
Zur Kennzahlen-Box in den Buchdetails (wörtlich, 2026-11-25): „Wenn der Text nicht in die Boxen passt, sollen sinnvolle Zeilenumbrüche mit Silbentrennung entstehen.“

Anlass (Fehler, 2026-11-25): In der Rezension bricht das Kriterium „Hauptfiguren“ als „Hauptfigur / en“ um, ohne Trennstrich und an falscher Stelle. Richtig wäre „Haupt- / figuren“. In den Buchdetails läuft die Beschriftung unter der Flamme über die Box hinaus und überlappt „gelesen“.

Beauftragt vom CEO (wörtlich, 2026-11-25): „okay, setze bitte Sprint 11 um als Prototypen“. Die Auslegungen unten hat er ohne Gegenrede stehen lassen.

## Anforderung (Satzschablone)

- Das System muss die Sprache aller Texte der App als Deutsch auszeichnen (**Auslegung**: Dokumentsprache `de`), damit die Silbentrennung nach deutschen Regeln erfolgt.
- Das System muss für Fließtext und Beschriftungen app-weit die automatische Silbentrennung anwenden. Bricht ein Wort um, steht am Zeilenende ein Trennstrich (**Auslegung**: eine zentrale, globale Trennregel).
- Das System darf Wörter nicht ohne Trennstrich mitten im Wort umbrechen. Regeln, die Wörter an beliebiger Stelle umbrechen, sind nicht erlaubt (**Auslegung**: kein `word-break: break-all`, kein `word-break: break-word`, kein `overflow-wrap: anywhere`).
- Das System darf Text nie über die Grenzen seiner Box hinaus darstellen und keine benachbarte Beschriftung überdecken. Das gilt besonders für die Beschriftungen in Kennzahlen-Boxen (**Auslegung**: Statistik-Pille der Buchdetails REQ-026, Kacheln der Seite „Statistik“ REQ-081, Kacheln der Startseite REQ-101 bis REQ-104 und REQ-108).
- Das System muss die Einhaltung dieser Regeln durch eine automatische Prüfung im Testlauf absichern, die bei jedem `npm run verify` (CI) mitläuft (**Auslegung**: Prüfung von Dokumentsprache, globaler Trennregel und Fehlen der verbotenen Umbruchregeln im gesamten Quellcode der App).

## Akzeptanzkriterien

### AK-1 Dokumentsprache Deutsch
- **Gegeben** die App ist geladen (Web-Build und APK verwenden dieselbe Startseite)
- **Wenn** die Sprachauszeichnung des Dokuments geprüft wird
- **Dann** ist sie „de“

### AK-2 Globale Trennregel
- **Gegeben** die zentrale Stildefinition der App
- **Wenn** geprüft wird, welche Trennregel für Texte gilt
- **Dann** ist für das gesamte Dokument die automatische Silbentrennung eingeschaltet
- **Und** keine Stilregel der App schaltet sie für Text- oder Beschriftungselemente wieder aus

### AK-3 Keine verbotenen Umbruchregeln
- **Gegeben** der gesamte Quellcode der App (Stylesheets und Stilangaben in Komponenten)
- **Wenn** die automatische Prüfung läuft
- **Dann** kommt keine der Regeln `word-break: break-all`, `word-break: break-word` oder `overflow-wrap: anywhere` vor (auch nicht in gleichwertiger Schreibweise in Komponenten-Stilen)
- **Und** baut ein Entwickler eine solche Regel ein, schlägt die Prüfung fehl

### AK-4 Kennzahlen-Boxen brechen um statt überzulaufen
- **Gegeben** die Beschriftungen in den Kennzahlen-Boxen (Statistik-Pille der Buchdetails, Kacheln der Seite „Statistik“, Kacheln der Startseite)
- **Wenn** ihre Darstellungsregeln geprüft werden
- **Dann** dürfen sie in mehrere Zeilen umbrechen (kein erzwungenes Einzeilen-Verhalten, kein Abschneiden) und verwenden die globale Trennregel aus AK-2
- **Und** bei einer Bildschirmbreite von 320 px liegt die Beschriftung „Längste Serie“ (REQ-109) vollständig innerhalb ihrer Box und überlappt „gelesen“ nicht (Sichtprüfung des CEO im Prototyp; automatisch nur, soweit die Testumgebung Layout berechnet)

### AK-5 Beispiel „Hauptfiguren“
- **Gegeben** im Reiter „Rezension“ ist für das Kriterium „Hauptfiguren“ (REQ-044) weniger Platz als für das ganze Wort
- **Wenn** der Name umbricht
- **Dann** gilt für ihn dieselbe globale Trennregel wie in AK-2, und er ist von keiner verbotenen Umbruchregel aus AK-3 betroffen (erwartete Darstellung „Haupt-“ / „figuren“; Sichtprüfung des CEO im Prototyp)

## Abgrenzung (nicht Teil dieses REQ)

- Kürzen von Texten mit „…“ (nicht gewünscht).
- Andere Sprachen als Deutsch.
- Wortlaut einzelner Beschriftungen (z. B. „Längste Serie“: REQ-109).

## Qualitätsanforderungen

- Gilt in allen Farbdesigns, Schriften und Stilen (REQ-068, REQ-069, REQ-071).
- Die Trennstellen selbst bestimmt die Silbentrennung der Plattform (Browser bzw. Android-WebView). Die genaue Trennstelle ist kein Akzeptanzkriterium.

## Abhängigkeiten

- **Querschnittlich:** gilt für alle Ansichten der App.
- **REQ-003, REQ-065** (zentrale Schrift- und Stildefinition), **REQ-026, REQ-044, REQ-081, REQ-101 bis REQ-104, REQ-108, REQ-109.**

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-25 | Erstellt aus den gesammelten Punkten für Sprint 11 (Fehler „Hauptfigur / en“ und Kennzahlen-Box). CEO (wörtlich): „Allgemein muss bitte eine Prüfung Appweit eingebaut werden, bezüglich der Silbentrennung und Textumbrüchen, wenn der Platz ausgeht.“ Beauftragt (wörtlich): „okay, setze bitte Sprint 11 um als Prototypen“. Auslegungen vom CEO ohne Gegenrede. Status „Abgestimmt“ | Anforderungsmanager |
