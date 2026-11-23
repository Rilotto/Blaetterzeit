---
id: REQ-074
titel: 3D-Ansicht – Öffnen per Doppeltipp aufs Cover, Aufbau und Schließen
status: Implementiert
prioritaet: Should
art: funktional
quelle: CEO
ersetzt: []
ersetzt_durch:
freigegeben_in:
---

## Ziel / Nutzen

Als **Nutzer** möchte ich **mein Buch aus den Buchdetails heraus in einer 3D-Ansicht öffnen**, damit **ich es mir als Objekt ansehen kann und von dort schnell zum Bearbeiten komme**.

CEO (2026-11-21, wörtlich): „Ich möchte mein Buch auch in einer frei drehbaren 3D Ansicht betrachten können. […] der Hintergrund ist das zuletzt geöffnete Fenster aber verschwommen. Es werden Titel, Autor und eine Pille zum Bearbeiten des Buches angezeigt. Beim Klick auf diese Pille komme ich in die Buchdetails -> Reiter "Details". […] Die 3D Ansicht öffnet sich, wenn ich ein geöffnetes Buchmenü habe und ich mit einem Doppeltippen aufs Cover klicke.“

Antworten des CEO (2026-11-21, über den Scrum Master): Öffnen in den Buchdetails per Doppeltipp auf das Cover; ein einfacher Tipp öffnet weiter das Auswahlmenü, die App wartet dafür kurz, ob ein zweiter Tipp folgt. Schließen per X oder Zurück-Taste führt zurück in die Buchdetails. Unten Titel, darunter Autor (nicht die Seitenzahl wie im Referenzbild), darunter die Pille „Bearbeiten“ mit Icon.

Referenzbild: [referenzen/REF-3d-01-ansicht.png](referenzen/REF-3d-01-ansicht.png). Die optische Übereinstimmung prüft der CEO im Prototyp; sie ist kein Akzeptanzkriterium.

## Anforderung (Satzschablone)

- Wenn der Nutzer in den Buchdetails (REQ-013) doppelt auf den Bereich „Cover“ der Buchdarstellung (REQ-014) tippt und das Buch nicht das Format „Hörbuch“ hat, muss das System die 3D-Ansicht dieses Buches öffnen.
- Wenn der Nutzer den Bereich „Cover“ einfach antippt, muss das System nach einer kurzen Wartezeit ohne zweiten Tipp das Auswahlmenü (REQ-015) öffnen. Bei einem Doppeltipp darf das Auswahlmenü nicht erscheinen.
- Das System muss die Wartezeit für den Doppeltipp zentral führen. Standardwert etwa 0,3 s, auf Zuruf des CEO änderbar; der Wert ist kein Akzeptanzkriterium.
- Das System muss als Hintergrund der 3D-Ansicht die zuvor geöffneten Buchdetails verschwommen darstellen.
- Das System muss in der 3D-Ansicht das 3D-Modell des Buches (REQ-076) darstellen.
- Das System muss unterhalb des Modells den Buchtitel und darunter den Autor darstellen. Ohne Autor entfällt diese Zeile (wie REQ-028).
- Das System muss darunter die Pille „Bearbeiten“ mit Icon darstellen.
- Wenn der Nutzer die Pille „Bearbeiten“ antippt, muss das System die 3D-Ansicht schließen und die Buchdetails dieses Buches mit aktivem Reiter „Details“ (REQ-043) zeigen.
- Das System muss eine X-Schaltfläche zum Schließen darstellen.
- Wenn der Nutzer X oder die Android-Zurück-Taste verwendet, muss das System die 3D-Ansicht schließen und die Buchdetails im vorherigen Zustand zeigen.

## Akzeptanzkriterien

### AK-1 Öffnen per Doppeltipp
- **Gegeben** die Buchdetails eines Taschenbuchs
- **Wenn** der Nutzer doppelt auf den Bereich „Cover“ tippt
- **Dann** öffnet sich die 3D-Ansicht dieses Buches
- **Und** das Auswahlmenü erscheint nicht

### AK-2 Einfacher Tipp öffnet weiter das Auswahlmenü
- **Gegeben** die Buchdetails eines Buches
- **Wenn** der Nutzer einmal auf den Bereich „Cover“ tippt und kein zweiter Tipp folgt
- **Dann** öffnet sich nach der Wartezeit das Auswahlmenü (REQ-015)
- **Und** die 3D-Ansicht öffnet sich nicht

### AK-3 Nur das Cover
- **Gegeben** die Buchdetails eines Buches
- **Wenn** der Nutzer doppelt auf den Bereich „Buchrücken“ oder „Schnitt“ tippt
- **Dann** öffnet sich die 3D-Ansicht nicht

### AK-4 Aufbau
- **Gegeben** ein Buch mit Titel „Der Hobbit“ und Autor „J. R. R. Tolkien“
- **Wenn** die 3D-Ansicht geöffnet ist
- **Dann** sind das 3D-Modell, darunter „Der Hobbit“, darunter „J. R. R. Tolkien“, darunter die Pille „Bearbeiten“ mit Icon sowie eine X-Schaltfläche sichtbar
- **Und** die Seitenzahl wird nicht angezeigt
- **Und** im Hintergrund sind die Buchdetails verschwommen zu sehen

### AK-5 Ohne Autor
- **Gegeben** ein Buch ohne Autor
- **Wenn** die 3D-Ansicht geöffnet ist
- **Dann** steht unter dem Titel direkt die Pille „Bearbeiten“, ohne leere Autorzeile

### AK-6 „Bearbeiten“ führt zum Reiter „Details“
- **Gegeben** die 3D-Ansicht ist geöffnet, in den Buchdetails war zuvor der Reiter „Rezension“ aktiv
- **Wenn** der Nutzer „Bearbeiten“ antippt
- **Dann** ist die 3D-Ansicht geschlossen und die Buchdetails dieses Buches zeigen den Reiter „Details“

### AK-7 Schließen per X oder Zurück-Taste
- **Gegeben** die 3D-Ansicht ist geöffnet
- **Wenn** der Nutzer X bzw. die Android-Zurück-Taste verwendet
- **Dann** ist die 3D-Ansicht geschlossen und die Buchdetails desselben Buches sind sichtbar

## Abgrenzung (nicht Teil dieses REQ)

- Drehen des Modells (REQ-075), Gestalt des Modells (REQ-076), Standardmaße (REQ-077).
- Verhalten bei Hörbüchern (REQ-078).
- Öffnen aus Buchlisten oder anderen Fenstern.

## Qualitätsanforderungen

- Keine.

## Abhängigkeiten

- REQ-013, REQ-014, REQ-015 (einfacher Tipp wird um die Wartezeit verzögert), REQ-028, REQ-043, REQ-075, REQ-076, REQ-078.

## Offene Fragen

- Keine.

## Änderungshistorie

| Datum | Änderung | durch |
|---|---|---|
| 2026-11-21 | Erstellt aus CEO-Beschreibung und CEO-Antworten (über den Scrum Master); Inhalt vom CEO bestätigt. Status „Abgestimmt“ | Anforderungsmanager |
| 2026-11-21 | CEO (wörtlich): „ja passt.“ Standardwert der Doppeltipp-Wartezeit etwa 0,3 s (auf Zuruf) eingetragen | Anforderungsmanager |
