---
id: REQ-005
titel: Seite „Bücher“ – Kopfbereich mit Überschrift und zwei runden Schaltflächen
status: Implementiert
prioritaet: Must
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **auf der Seite „Bücher“ oben die Überschrift „Deine Bücher“ und zwei Schaltflächen (Filter/Einstellungen und Plus) sehen**, damit **das Grundgerüst der Seite steht und die späteren Funktionen (Filtern/Einstellen, Buch hinzufügen) dort angebunden werden können**.

Vorgabe des CEO (wörtlich, Auszug): „Für den nächsten Sprint möchte ich die Seite "Bücher" aufbauen. Erstmal nur das Grundgerüst mit Platzhaltern. Wir nehmen hier wieder das Referenzbild als grobe Orientierung. Im oberen Bereich befindet sich links die große Überschrift: „Deine Bücher“. Rechts daneben befinden sich zwei Schaltflächen.“

Referenzbild: [referenzen/REQ-002-referenz-hauptnavigation.png](referenzen/REQ-002-referenz-hauptnavigation.png). Relevant für diesen REQ ist nur der obere Bereich (Überschrift und die zwei runden Schaltflächen). Das Bild ist laut CEO „grobe Orientierung“. Maßgeblich ist die Beschreibung des CEO in diesem REQ. Ausnahme: Die beiden Icons der Schaltflächen werden auf Wunsch des CEO aus dem Referenzbild nachgebildet (Abschnitt „Icons der Schaltflächen“).

## Anforderung (Satzschablone)

**Seite „Bücher“**
- Wenn der Menüpunkt „Bücher“ aktiv ist, muss das System im Inhaltsbereich die Seite „Bücher“ darstellen.

**Überschrift**
- Das System muss im oberen Bereich der Seite „Bücher“ links die Überschrift „Deine Bücher“ darstellen.
- Das System muss die Überschrift als große Überschrift darstellen (Größe: Orientierung am Referenzbild).
- Das System muss die Überschrift in der Farbrolle „Überschriftfarbe“ darstellen (CEO: „Die Überschrift bekommt die selbe Farbe wie die nicht aktive Schrift in der Navigationsleiste.“).

**Schaltflächen**
- Das System muss rechts neben der Überschrift zwei Schaltflächen darstellen, von links nach rechts: 1. Filter-/Einstellungen-Schaltfläche, 2. Plus-Schaltfläche.
- Das System muss Größe, Position und Abstände beider Schaltflächen am Referenzbild orientieren (CEO: „Beide Buttons sollen sich in Größe, Position und Abständen am Screenshot orientieren.“).

*Filter-/Einstellungen-Schaltfläche*
- Das System muss die Filter-/Einstellungen-Schaltfläche kreisförmig mit einem Rahmen darstellen.
- Das System muss den Hintergrund der Filter-/Einstellungen-Schaltfläche in der Farbrolle „Filterschaltfläche-Hintergrund“ darstellen (CEO: „Hintergrund wie Seitenhintergrund“).
- Das System muss Rahmen und Icon der Filter-/Einstellungen-Schaltfläche in der Farbrolle „Filterschaltfläche-Vordergrund“ darstellen (CEO: „Rahmen und Icon wie Icons in Navigationsleiste“). Diese Farbrolle bezieht ihren Wert aus der Farbrubrik „Tertiär“, also der Farbe der nicht aktiven Menüpunkte der Hauptnavigation (CEO: „inaktiv braun teritär“).
- Das System muss in der Filter-/Einstellungen-Schaltfläche das Regler-Icon darstellen (Abschnitt „Icons der Schaltflächen“).
- Die Schaltfläche soll später ein eigenes Fenster öffnen (CEO). Inhalt und Verhalten dieses Fensters werden geklärt, bevor die Funktion implementiert wird. Sie sind nicht Teil dieses REQ.

*Plus-Schaltfläche*
- Das System muss die Plus-Schaltfläche kreisförmig darstellen.
- Das System muss den Hintergrund der Plus-Schaltfläche in der Farbrolle „Plusschaltfläche-Hintergrund“ darstellen (CEO: „Hintergrund in bereits genutztem Bordeaux-Ton“).
- Das System muss in der Plus-Schaltfläche mittig das Plus-Icon (Abschnitt „Icons der Schaltflächen“) in der Farbrolle „Plusschaltfläche-Vordergrund“ darstellen (CEO: „das Plus selbst in der Farbe vom Seitenhintergrund“). Diese Aussage ersetzt die frühere Beschreibung des CEO „weißes Pluszeichen“.
- Die Wirkung der Plus-Schaltfläche beim Antippen legt REQ-029 fest (CEO 2026-11-10: „Ich möchte über das '+' in der Übersichtsseite 'Deine Bücher' ein neues Buch anlegen.“). Sie ist nicht Teil dieses REQ.

*Antippen der Schaltflächen (Grundgerüst)*
- Das System darf für keine der beiden Schaltflächen einen aktiven Zustand darstellen (CEO: „diese beiden Buttons haben keinen aktiven Status. Das entfällt bei beiden, da diese beide ein eigenes Fenster später öffnen werden.“). Einzige Ausnahme: Solange das Menü „Buch hinzufügen“ geöffnet ist, zeigt die Plus-Schaltfläche „×“ statt des Plus-Icons (REQ-029, vom CEO am 2026-11-10 bestätigt). Dies ist der einzige Zustandswechsel der Plus-Schaltfläche.
- Wenn der Nutzer die Filter-/Einstellungen-Schaltfläche antippt, darf sich in der App nichts ändern, auch nicht die Darstellung der Schaltfläche (CEO: „auf der Seite ändert sich erstmal noch nichts“). Für die Plus-Schaltfläche gilt ab 2026-11-10 REQ-029.

**Bereich unterhalb der Filterleiste**
- Der Inhalt des Bereichs unterhalb der Filterleiste (REQ-006) wird durch REQ-009 bis REQ-012 festgelegt (CEO, 2026-11-09: „Ich möchte eine weitere Funktion einbinden …“). Die frühere Vorgabe „bleibt leer“ entfällt.
- Das System darf auf der Seite „Bücher“ den Platzhaltertext „under construction :)“ (REQ-002, REQ-004) nicht darstellen.

**Icons der Schaltflächen**
Vorgabe des CEO (wörtlich): „kopiere bitte die Icons aus dem Screenshot und setze diese so um im gleichen Style wie die Navigationsleiste“.
- Das System muss für die Filter-/Einstellungen-Schaltfläche ein Regler-Icon verwenden, das dem Icon im Referenzbild nachgebildet ist (stilisierte Regler: drei waagerechte Linien mit je einem senkrechten Regler-Strich).
- Das System muss für die Plus-Schaltfläche ein Plus-Icon verwenden, das dem Pluszeichen im Referenzbild nachgebildet ist.
- Das System muss beide Icons im gleichen technischen Stil wie die Icons der Hauptnavigation (REQ-002) bereitstellen: einfarbige Linien-Icons auf transparentem Hintergrund, Strichstärke wie die Icons der Hauptnavigation.
- Das System muss beide Icons selbst in der Farbe ihrer Farbrolle einfärben (wie bei der Hauptnavigation, REQ-002).
- Das System darf für beide Icons keine Icons aus einer Icon-Bibliothek verwenden.
- Die optische Übereinstimmung mit dem Referenzbild prüft der CEO im Prototyp. Sie ist kein Akzeptanzkriterium.

**Farben**
- Das System muss alle Farben dieses REQ über Farbrollen aus zentral definierten Farbrubriken beziehen (REQ-002, Abschnitt „Farben“; CLAUDE.md, „Farben auf Zuruf“). Zuordnung:

| Farbrolle | Element | Farbrubrik | Aussage des CEO |
|---|---|---|---|
| Überschriftfarbe | Überschrift „Deine Bücher“ | Tertiär | „selbe Farbe wie die nicht aktive Schrift in der Navigationsleiste“ |
| Filterschaltfläche-Hintergrund | Hintergrund der Filter-/Einstellungen-Schaltfläche | Hintergrund | „Hintergrund wie Seitenhintergrund“ |
| Filterschaltfläche-Vordergrund | Rahmen und Icon der Filter-/Einstellungen-Schaltfläche | Tertiär | „Rahmen und Icon wie Icons in Navigationsleiste“, „inaktiv braun teritär“ |
| Plusschaltfläche-Hintergrund | Hintergrund der Plus-Schaltfläche | Primär | „bereits genutzter Bordeaux-Ton“ |
| Plusschaltfläche-Vordergrund | Plus-Icon | Hintergrund | „in der Farbe vom Seitenhintergrund“ |

- Konkrete Farbwerte sind kein Akzeptanzkriterium. Ändert der CEO den Wert einer Farbrubrik, ändern sich die zugehörigen Elemente mit.

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
- **Und** enthält das Regler-Icon
- **Und** ihr Hintergrund ist in der Farbe der Farbrubrik „Hintergrund“ dargestellt
- **Und** Rahmen und Regler-Icon sind in der Farbe der Farbrubrik „Tertiär“ dargestellt

### AK-5 Plus-Schaltfläche
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** die Plus-Schaltfläche betrachtet wird
- **Dann** ist sie kreisförmig
- **Und** enthält mittig das Plus-Icon
- **Und** ihr Hintergrund ist in der Farbe der Farbrubrik „Primär“ dargestellt
- **Und** das Plus-Icon ist in der Farbe der Farbrubrik „Hintergrund“ dargestellt

### AK-6 Beide Schaltflächen gleich groß
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** die Größen beider Schaltflächen verglichen werden
- **Dann** haben beide denselben Durchmesser

### AK-7 Überschrift in der Farbrubrik Tertiär
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** die Überschrift „Deine Bücher“ betrachtet wird
- **Dann** ist sie in der Farbe der Farbrubrik „Tertiär“ dargestellt (dieselbe Farbrubrik wie die Inaktivfarbe der Hauptnavigation, REQ-002)

### AK-8 Farben stammen aus den zentralen Farbrubriken
- **Gegeben** der Wert einer der Farbrubriken „Tertiär“, „Hintergrund“ oder „Primär“ wird an der zentralen Stelle geändert
- **Wenn** die Seite „Bücher“ angezeigt wird
- **Dann** sind alle Elemente dieses REQ, deren Farbrolle aus dieser Farbrubrik stammt (Tabelle im Abschnitt „Farben“), im geänderten Wert dargestellt
- **Und** keines dieser Elemente hat einen eigenen, davon abweichenden Farbwert

### AK-9 Icons nachgebildet und einfärbbar
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** das Regler-Icon und das Plus-Icon betrachtet werden
- **Dann** stammen beide nicht aus einer Icon-Bibliothek
- **Und** beide sind einfarbige Linien-Icons auf transparentem Hintergrund, die von der App in der Farbe ihrer Farbrolle eingefärbt werden

### AK-10 Antippen der Filter-/Einstellungen-Schaltfläche bewirkt nichts, kein aktiver Zustand
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** der Nutzer die Filter-/Einstellungen-Schaltfläche antippt
- **Dann** sieht die angetippte Schaltfläche danach genauso aus wie vorher (kein aktiver Zustand)
- **Und** in der App ändert sich nichts (kein neues Fenster, keine neue Ansicht, kein Wechsel des Menüpunkts, keine Änderung der Filterleiste)

### AK-11 Kein Platzhaltertext „under construction :)“
- **Gegeben** die Seite „Bücher“ wird angezeigt
- **Wenn** die gesamte Seite betrachtet wird
- **Dann** wird der Text „under construction :)“ nicht angezeigt

## Abgrenzung (nicht Teil dieses REQ)

- Die Filterleiste unterhalb der Überschrift (REQ-006, REQ-007).
- Das eigene Fenster der Filter-/Einstellungen-Schaltfläche (CEO: wird später definiert).
- Wirkung der Plus-Schaltfläche beim Antippen (REQ-029 bis REQ-032).
- Inhalte im Bereich unterhalb der Filterleiste (REQ-009 bis REQ-012).
- Konkrete Farbwerte, Maße und Schriftgrößen als Akzeptanzkriterium.
- Optische Übereinstimmung der Icons mit dem Referenzbild als Akzeptanzkriterium (Prüfung durch den CEO im Prototyp).

## Qualitätsanforderungen

- Keine. Der CEO hat keine messbaren Qualitätsvorgaben genannt.

## Abhängigkeiten

- **REQ-002 (Hauptnavigation, Implementiert):** Menüpunkt „Bücher“, Inhaltsbereich, Farbrubriken, Seitenhintergrund = Farbrubrik „Hintergrund“ (AK-13, bleibt unverändert), technischer Stil der Icons. REQ-002 legt fest, dass „under construction :)“ angezeigt wird, *solange* die Zielansicht nicht definiert ist. Mit diesem REQ wird die Zielansicht „Bücher“ definiert. Deshalb zeigt die Seite „Bücher“ den Platzhaltertext nicht mehr (AK-11). Für die übrigen Menüpunkte bleibt REQ-002 unverändert.
- **REQ-003 (App-Schrift, Implementiert):** Überschrift wird in der App-Schrift dargestellt.
- **REQ-004 (Platzhaltertext Tertiär, Abgestimmt):** nutzt dieselbe Farbrubrik „Tertiär“ wie die Überschrift. Der Platzhaltertext erscheint auf der Seite „Bücher“ nicht mehr, auf den übrigen Seiten gilt REQ-004 weiter.
- **REQ-006 (Filterleiste):** Antippen der Schaltflächen ändert die Filterleiste nicht.

## Offene Fragen

<!-- Muss vor Status "Abgestimmt" leer sein. -->


## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-09 | Erstellt (Entwurf aus der Vorgabe des CEO für die Seite „Bücher“, oberer Bereich). Orientierungswerte des Scrum Masters aus dem Referenzbild als Nicht-AK aufgenommen | Anforderungsmanager |
| 2026-11-09 | Antworten des CEO eingearbeitet. F1: Priorität „Must“ bestätigt („alle auf MUST“), Vorläufigkeitsvermerk entfernt. F2: Icons werden aus dem Referenzbild nachgebildet, im technischen Stil der Navigations-Icons, keine Bibliotheks-Icons (neu: Abschnitt „Icons der Schaltflächen“, AK-9). F3: Farbzuordnungen eingetragen (Überschrift Tertiär, Filterschaltfläche Hintergrund, Plus-Schaltfläche Primär / Plus in Hintergrund); „weißes Pluszeichen“ durch „Farbe vom Seitenhintergrund“ ersetzt; „dezenter, beigefarbener Rahmen“ entfällt zugunsten „wie Icons in Navigationsleiste“ (Farbrubrik offen, F8). AK-4 und AK-5 präzisiert, neu AK-7, AK-8. F4: Antippen stellt die Schaltfläche aktiv dar, sonst ändert sich nichts (neu AK-10; Aussehen und Dauer offen, F9). F5 vom CEO nicht verstanden, neu formuliert als F10; Abgrenzung „Abschnitte unterhalb der Filterleiste“ bis zur Antwort entfernt | Anforderungsmanager |
| 2026-11-09 | Antworten des CEO eingearbeitet. F8: Rahmen und Icon der Filter-/Einstellungen-Schaltfläche in Farbrubrik „Tertiär“ (Farbtabelle, AK-4 ergänzt). F9: Beide Schaltflächen haben keinen aktiven Zustand; Antippen bewirkt derzeit nichts; beide öffnen später je ein eigenes Fenster (Anforderung und AK-10 neu gefasst, Abgrenzung ergänzt). Die frühere Anforderung „angetippte Schaltfläche wird als aktiv dargestellt“ entfällt. F10: Bereich unterhalb der Filterleiste bleibt leer, kein Platzhaltertext auf der Seite „Bücher“ (neuer Abschnitt, neu AK-11, Abgrenzung und Abhängigkeiten ergänzt). Vom CEO am 2026-11-09 bestätigt, Status „Abgestimmt“ | Anforderungsmanager |
| 2026-11-09 | Neue CEO-Vorgabe „Noch zu lesen“: Bereich unterhalb der Filterleiste wird durch REQ-009 bis REQ-011 belegt. Anforderung „bleibt leer“ entfernt, AK-11 auf das Nichtanzeigen von „under construction :)“ reduziert, Abgrenzung angepasst. AK-1 bis AK-10 unverändert. Status zurück auf „Entwurf“ bis zur Bestätigung durch den CEO (F7). Begründung für Anpassung statt neuem REQ: REQ-005 ist nicht freigegeben; ein `ersetzt`-REQ ist nur für eingefrorene REQs vorgesehen und würde hier zwei widersprüchliche gültige Texte erzeugen | Anforderungsmanager |
| 2026-11-09 | F7 vom CEO bestätigt („alles unter Must, ja bestätige ich“). Verweis auf REQ-012 (Abschnitte „Sagas“/„Sammlungen“) ergänzt. Status „Abgestimmt“ | Anforderungsmanager |
| 2026-11-10 | CEO-Vorgabe „Buch anlegen“: Wirkung der Plus-Schaltfläche geht an REQ-029 über. Anforderung „Antippen bewirkt nichts“ und AK-10 gelten nur noch für die Filter-/Einstellungen-Schaltfläche; Abgrenzung angepasst. AK-1 bis AK-9 und AK-11 unverändert. Status von „Implementiert“ auf „Entwurf“ bis zur Bestätigung durch den CEO. Anpassung statt `ersetzt`-REQ, da REQ-005 nicht freigegeben ist (wie 2026-11-09) | Anforderungsmanager |
| 2026-11-10 | CEO-Antwort F5 (REQ-029): Plus-Schaltfläche öffnet das Menü „Buch hinzufügen“ und zeigt bei geöffnetem Menü „×“; als einziger Zustandswechsel der Plus-Schaltfläche vermerkt. Offene Frage entfernt. AK-1 bis AK-11 unverändert. Status „Abgestimmt“ auf Weisung des Scrum Masters nach den übermittelten CEO-Antworten | Anforderungsmanager |
