---
id: REQ-005
titel: Seite „Bücher“ – Kopfbereich mit Überschrift und zwei runden Schaltflächen
status: Entwurf
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

<!-- Priorität "Must": vorläufig, Bestätigung durch den CEO ausstehend (MoSCoW ist CEO-Entscheidung, siehe Offene Fragen). -->

## Ziel / Nutzen

Als **Nutzer** möchte ich **auf der Seite „Bücher“ oben die Überschrift „Deine Bücher“ und zwei Schaltflächen (Filter/Einstellungen und Plus) sehen**, damit **das Grundgerüst der Seite steht und die späteren Funktionen (Filtern/Einstellen, Buch hinzufügen) dort angebunden werden können**.

Vorgabe des CEO (wörtlich, Auszug): „Für den nächsten Sprint möchte ich die Seite "Bücher" aufbauen. Erstmal nur das Grundgerüst mit Platzhaltern. Wir nehmen hier wieder das Referenzbild als grobe Orientierung. Im oberen Bereich befindet sich links die große Überschrift: „Deine Bücher“. Rechts daneben befinden sich zwei Schaltflächen.“

Referenzbild: [referenzen/REQ-002-referenz-hauptnavigation.png](referenzen/REQ-002-referenz-hauptnavigation.png). Relevant für diesen REQ ist nur der obere Bereich (Überschrift und die zwei runden Schaltflächen). Das Bild ist laut CEO „grobe Orientierung“. Maßgeblich ist die Beschreibung des CEO in diesem REQ.

## Anforderung (Satzschablone)

**Seite „Bücher“**
- Wenn der Menüpunkt „Bücher“ aktiv ist, muss das System im Inhaltsbereich die Seite „Bücher“ darstellen.

**Überschrift**
- Das System muss im oberen Bereich der Seite „Bücher“ links die Überschrift „Deine Bücher“ darstellen.
- Das System muss die Überschrift als große Überschrift darstellen (Größe: Orientierung am Referenzbild).

**Schaltflächen**
- Das System muss rechts neben der Überschrift zwei Schaltflächen darstellen, von links nach rechts: 1. Filter-/Einstellungen-Schaltfläche, 2. Plus-Schaltfläche.
- Das System muss Größe, Position und Abstände beider Schaltflächen am Referenzbild orientieren (CEO: „Beide Buttons sollen sich in Größe, Position und Abständen am Screenshot orientieren.“).

*Filter-/Einstellungen-Schaltfläche*
- Das System muss die Filter-/Einstellungen-Schaltfläche kreisförmig mit heller Hintergrundfarbe darstellen.
- Das System muss die Filter-/Einstellungen-Schaltfläche mit einem dezenten, beigefarbenen Rahmen darstellen.
- Das System muss in der Filter-/Einstellungen-Schaltfläche ein Icon mit stilisierten Reglern darstellen, ähnlich dem Referenzbild.
- Das spätere Verhalten der Schaltfläche wird geklärt, bevor die Funktion implementiert wird (CEO). Es ist nicht Teil dieses REQ.

*Plus-Schaltfläche*
- Das System muss die Plus-Schaltfläche kreisförmig mit bordeauxrotem Hintergrund darstellen.
- Das System muss in der Plus-Schaltfläche mittig ein weißes Pluszeichen darstellen.
- Die Plus-Schaltfläche soll später zum Hinzufügen eines neuen Buches dienen. Die konkrete Funktion bzw. Zielansicht wird später definiert (CEO). Sie ist nicht Teil dieses REQ.

**Farben**
- Das System muss alle Farben dieses REQ aus zentral definierten Farbrubriken beziehen (REQ-002, Abschnitt „Farben“; CLAUDE.md, „Farben auf Zuruf“). Welche Farbrubrik welche Farbrolle dieses REQ speist, ist offen (siehe Offene Fragen).

**Orientierungswerte aus dem Referenzbild (kein Akzeptanzkriterium)**
Vom Scrum Master gemessen (Bildbreite 1080 px ≈ 412 dp, Faktor ≈ 2,6). Sie dienen nur der Orientierung, die Prüfung erfolgt durch den CEO im Prototyp:

| Element | Orientierungswert |
|---|---|
| Überschrift „Deine Bücher“ | Großbuchstabenhöhe ≈ 19 dp (Schriftgrad grob 28–32 dp) |
| Durchmesser beider Schaltflächen | ≈ 40 dp |
| Abstand zwischen den Schaltflächen | ≈ 11 dp |

## Akzeptanzkriterien

### AK-1 Seite „Bücher“ beim aktiven Menüpunkt „Bücher“
- **Gegeben** die App ist geöffnet
- **Wenn** der Nutzer den Menüpunkt „Bücher“ antippt
- **Dann** zeigt der Inhaltsbereich die Seite „Bücher“ mit der Überschrift „Deine Bücher“

### AK-2 Überschrift links im oberen Bereich
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** der Nutzer den oberen Bereich betrachtet
- **Dann** steht dort links genau der Text „Deine Bücher“ als Überschrift

### AK-3 Zwei Schaltflächen rechts neben der Überschrift in fester Reihenfolge
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** der Nutzer den oberen Bereich betrachtet
- **Dann** befinden sich rechts neben der Überschrift genau zwei Schaltflächen
- **Und** links steht die Filter-/Einstellungen-Schaltfläche, rechts davon die Plus-Schaltfläche

### AK-4 Filter-/Einstellungen-Schaltfläche
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** die Filter-/Einstellungen-Schaltfläche betrachtet wird
- **Dann** ist sie kreisförmig
- **Und** hat einen Rahmen
- **Und** enthält ein Icon mit stilisierten Reglern
- **Und** ihre Farben stammen aus zentral definierten Farbrubriken

### AK-5 Plus-Schaltfläche
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** die Plus-Schaltfläche betrachtet wird
- **Dann** ist sie kreisförmig
- **Und** enthält mittig ein Pluszeichen
- **Und** ihre Farben stammen aus zentral definierten Farbrubriken

### AK-6 Beide Schaltflächen gleich groß
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** die Größen beider Schaltflächen verglichen werden
- **Dann** haben beide denselben Durchmesser

<!-- Weitere AKs (Farbrollen je Element, Verhalten beim Antippen, Icons) werden nach Beantwortung der Offenen Fragen ergänzt. -->

## Abgrenzung (nicht Teil dieses REQ)

- Die Filterleiste unterhalb der Überschrift (REQ-006, REQ-007).
- Das Verhalten der Filter-/Einstellungen-Schaltfläche und die Funktion bzw. Zielansicht der Plus-Schaltfläche (CEO: werden später definiert).
- Alle Abschnitte des Referenzbilds unterhalb der Filterleiste (z. B. „Noch zu lesen“, „Sagas“, „Sammlungen“).
- Konkrete Farbwerte, Maße und Schriftgrößen als Akzeptanzkriterium.

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-002 (Hauptnavigation, Implementiert):** Menüpunkt „Bücher“, Inhaltsbereich, Farbrubriken, Seitenhintergrund = Farbrubrik „Hintergrund“ (AK-13, bleibt unverändert). REQ-002 legt fest, dass „under construction :)“ angezeigt wird, *solange* die Zielansicht nicht definiert ist. Mit diesem REQ wird die Zielansicht „Bücher“ definiert. Ob und wo der Platzhaltertext auf der Seite „Bücher“ erhalten bleibt, ist offen (siehe Offene Fragen).
- **REQ-003 (App-Schrift, Implementiert):** Überschrift wird in der App-Schrift dargestellt.
- **REQ-004 (Platzhaltertext Tertiär).**

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. Nummern entsprechen der Fragenliste an den CEO vom 2026-11-09. -->

- F1: Priorität (MoSCoW) dieses REQ?
- F2: Für die Navigation hast du eigene Icons geliefert und Icons aus Bibliotheken ausgeschlossen. Wie soll es beim Regler-Icon der Filter-/Einstellungen-Schaltfläche und beim Pluszeichen sein?
- F3: Aus welchen Farbrubriken sollen die Farben dieser Seite kommen, und soll es dafür neue Farbrubriken geben (wenn ja: wie heißen sie)? Betroffen hier: Überschrift; Filter-/Einstellungen-Schaltfläche (Hintergrund, Rahmen, Icon); Plus-Schaltfläche (Hintergrund, Pluszeichen).
- F4: Was soll passieren, wenn der Nutzer eine der beiden Schaltflächen antippt, solange ihre Funktion noch nicht definiert ist?
- F5: Was soll im Grundgerüst unterhalb der Filterleiste zu sehen sein?

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-09 | Erstellt (Entwurf aus der Vorgabe des CEO für die Seite „Bücher“, oberer Bereich). Orientierungswerte des Scrum Masters aus dem Referenzbild als Nicht-AK aufgenommen | Anforderungsmanager |
