---
id: REQ-110
titel: Fenster „Design“ – Farbdesigns nach Pillen „Hell“ und „Dunkel“ getrennt
status: In Umsetzung
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **die Farbdesigns nach hellen und dunklen getrennt sehen**, damit **ich in einer wachsenden Sammlung schnell das passende Design finde**.

CEO (2026-11-23, wörtlich): „in der Farbauswahl zwei Pillen ‚Hell‘ und ‚Dunkel‘, darunter die jeweiligen Paletten einsortiert“. Bestätigt am 2026-11-25 (wörtlich): „hätten nicht noch neue Farbpaletten und die Trennung von Hell und Dunkel mit in den Prototypen sollen?“

Erweitert REQ-068 (Liste der Farbdesigns) im Fenster „Design“ (REQ-067). Welches Design hell und welches dunkel ist, legt REQ-068 fest.

## Anforderung (Satzschablone)

- Wenn im Fenster „Design“ „Farben“ aktiv ist, muss das System über der Liste der Farbdesigns zwei Pillen „Hell“ und „Dunkel“ in dieser Reihenfolge darstellen. Genau eine davon ist aktiv.
- Das System muss unter den Pillen nur die Farbdesigns anzeigen, die nach REQ-068 zur aktiven Pille gehören:
  - „Hell“: Klassisch, Salbei, Raureif, Minztraube
  - „Dunkel“: Nachtlektüre, Polarnacht, Traubennacht
- **Auslegung:** Beim Öffnen des Fensters „Design“ und bei jedem Wechsel zurück auf „Farben“ muss das System die Pille aktiv setzen, zu der das aktive Farbdesign gehört. Ohne gewähltes Farbdesign gilt „Klassisch“ (REQ-068), also „Hell“. Die Wahl der Pille wird nicht gespeichert.
- **Auslegung:** Wenn der Nutzer eine Pille antippt, muss das System nur die angezeigte Liste wechseln. Das aktive Farbdesign bleibt unverändert, und es wird nichts gespeichert.
- Das System muss beim aktiven Farbdesign ein Häkchen darstellen. Ist es nicht in der angezeigten Liste, tragen dort alle Designs einen leeren Kreis.
- Wenn der Nutzer ein Farbdesign aus der angezeigten Liste antippt, gilt das Verhalten aus REQ-068: Das Design wird sofort angewendet und dauerhaft gespeichert.
- **Auslegung:** Die Pillen „Hell“ / „Dunkel“ müssen genauso aussehen und sich genauso verhalten wie die übrigen Umschaltpillen der App (Umschaltpille im Fenster „Design“, REQ-067, Mechanik der Reiterleiste REQ-043) und dem gewählten Stil folgen (REQ-071): bei „Klassisch“ als Pille, bei „Feuilleton“ als Text mit Unterstrich (Regel F4).

## Akzeptanzkriterien

### AK-1 Pillen „Hell“ und „Dunkel“
- **Gegeben** das Fenster „Design“ ist offen und „Farben“ ist aktiv
- **Wenn** der Nutzer den Bereich unter der Umschaltpille betrachtet
- **Dann** stehen dort die Pillen „Hell“ und „Dunkel“ in dieser Reihenfolge, genau eine ist aktiv
- **Und** darunter stehen nur die Farbdesigns der aktiven Pille
- **Und** bei „Schriftart“ oder „Stil“ sind die Pillen „Hell“ / „Dunkel“ nicht zu sehen

### AK-2 Zuordnung der Designs
- **Gegeben** das Fenster „Design“ mit aktivem „Farben“
- **Wenn** der Nutzer „Hell“ antippt und danach „Dunkel“
- **Dann** stehen unter „Hell“ genau „Klassisch“, „Salbei“, „Raureif“ und „Minztraube“
- **Und** unter „Dunkel“ stehen genau „Nachtlektüre“, „Polarnacht“ und „Traubennacht“

### AK-3 Beim Öffnen die Pille des aktiven Designs (Auslegung)
- **Gegeben** das aktive Farbdesign ist „Polarnacht“
- **Wenn** der Nutzer das Fenster „Design“ öffnet
- **Dann** ist „Dunkel“ aktiv und „Polarnacht“ trägt ein Häkchen
- **Und** hat der Nutzer noch nie ein Farbdesign gewählt, ist beim Öffnen „Hell“ aktiv und „Klassisch“ trägt ein Häkchen

### AK-4 Pille wechselt nur die Liste (Auslegung)
- **Gegeben** „Klassisch“ ist aktiv und „Hell“ ist ausgewählt
- **Wenn** der Nutzer „Dunkel“ antippt
- **Dann** zeigt die Liste die dunklen Designs, alle mit leerem Kreis
- **Und** die App zeigt weiterhin die Farben von „Klassisch“, auch nach einem Neustart

### AK-5 Design aus der anderen Gruppe wählen
- **Gegeben** „Klassisch“ ist aktiv und „Dunkel“ ist ausgewählt
- **Wenn** der Nutzer „Traubennacht“ antippt
- **Dann** färbt sich die App sofort in „Traubennacht“ und „Traubennacht“ trägt ein Häkchen
- **Und** nach einem Wechsel auf „Hell“ trägt „Klassisch“ einen leeren Kreis

### AK-6 Aussehen nach Stil (Auslegung)
- **Gegeben** das Fenster „Design“ mit aktivem „Farben“
- **Wenn** der Stil „Klassisch“ bzw. „Feuilleton“ (REQ-071) aktiv ist
- **Dann** sehen die Pillen „Hell“ / „Dunkel“ aus wie die Umschaltpille „Farben | Schriftart | Stil“ im selben Stil
- **Und** bei „Feuilleton“ sind sie reiner Text ohne Pillenfläche, die inaktive in Tertiär, die aktive in Primär mit Unterstrich

## Abgrenzung (nicht Teil dieses REQ)

- Welche Farbdesigns es gibt, ihre Werte und ihre Einordnung hell/dunkel (REQ-068).
- Ein automatischer Wechsel nach Tageszeit oder nach der Systemeinstellung des Geräts (hell/dunkel).

## Qualitätsanforderungen

- Tippflächen der Pillen mindestens 44 px (REQ-065, REQ-071).

## Abhängigkeiten

- REQ-068 (Farbdesigns und Einordnung hell/dunkel), REQ-067 (Fenster „Design“, Umschaltpille), REQ-043 (Mechanik der wandernden Pille), REQ-071 (Stil, Regel F4).

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-25 | Erstellt aus dem CEO-Wunsch vom 2026-11-23 und der Bestätigung vom 2026-11-25. Auslegungen: Pille des aktiven Designs beim Öffnen, Tipp auf die Pille wechselt nur die Liste, Aussehen wie die übrigen Umschaltpillen und nach Stil. Status „Abgestimmt“ | Anforderungsmanager |
