# Sprint 08 – 3D-Ansicht des Buches

Freigabe CEO 2026-11-21: „yes, starte bitte mit sprint 08“. Branch: sprint-08/3d-ansicht (von sprint-07, PR noch offen). Teil A: REQ-077 + Anpassungen REQ-072/073; Teil B: REQ-074–076, 078.

Planung beauftragt vom CEO 2026-11-21: „Bitte plane nun die nächste Umsetzung und gebe mir Bescheid. Freigegeben zur Umsetzung ist noch nichts.“
Start erst nach ausdrücklicher Freigabe. Basis: Branch von Sprint 07 bzw. main nach dessen Merge.

## REQs
- REQ-074 Öffnen/Schließen (Doppeltipp aufs Cover in den Buchdetails, Einfachtipp verzögert → Kamera/Galerie-Menü; X/Zurück-Taste) – Should, Abgestimmt
- REQ-075 Frei drehen mit Schwung, kein Zoom, Startansicht schräg von vorne – Should, Abgestimmt
- REQ-076 Gestalt: Maße, Texturen (Cover/Rücken/Schnitt), Akzentfarbe + Titel ohne Bild, Seitenmuster, Hardcover-Deckel, verschwommener Hintergrund, Titel/Autor, Pille „Bearbeiten“ → Details – Should, Abgestimmt
- REQ-077 Standardmaße je Format + Dicke aus Seitenzahl, Vorschlag „ca. …“ bei Maße; ohne Format/Print ohne Unterformat/Hörbuch = Taschenbuch; Hardcover-Maße = Außenmaße der Deckel – Should, Abgestimmt
- REQ-078 Hörbuch-Hinweis – Could, Abgestimmt
- Folgeänderungen: REQ-072/073 (Vorschlagswerte, formatabhängige Standards)

## Machbarkeit (Entwickler)
CSS-3D-Transforms ohne neue Abhängigkeit (Quaternion-Trackball + Trägheit, ca. 6–12 Flächen); Blur per backdrop-filter (Ausweichlösung filter:blur); Bilder auf ~1024 px verkleinern. jsdom prüft Mathematik, Daten-Modell, Tipp-Logik, Overlay; Optik/Flüssigkeit nur am Gerät.
Größe: ca. 12–16 % Nutzungslimit (+ Standardmaße/Vorschlag ca. 3–5 %).

## Risiken
Einfachtipp-Verzögerung 0,3 s (vom CEO bestätigt); Flackern bei sehr dünnen Büchern; Blur-Performance in der WebView.
