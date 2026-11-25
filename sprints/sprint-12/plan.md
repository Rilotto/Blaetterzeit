# Sprint 12 – Plan

**Sprintziel:** Buch-Anlage über den Leere-Liste-Platzhalter und „Online suchen“, personalisierbare Filterpille „Für dich“, realistischere Standardmaße und Cover ohne Beschnitt.

Inhalte vom CEO am 2026-11-25 im Chat festgelegt, Umsetzung beauftragt („Bitte setze das nun um. Den Prototypen erstellst du bitte erstmal noch nicht“).

| Thema | REQs | Weg |
|---|---|---|
| S12-1 Platzhalter öffnet Menü „Buch hinzufügen“ | REQ-011 (AK-3) | Mini-Änderung (Entwickler inkl. Testanpassung) |
| S12-2 „Für dich“ anpassen | REQ-108, REQ-005 (AK-10), Verweis REQ-007 | voll (Entwickler + Tester, Gegenprobe) |
| S12-3 Standardmaße 13,8 × 21,8 cm, Cover-Zuschnitt | REQ-077, REQ-073, REQ-072 (Beispiel), REQ-109 | Maße: Mini; REQ-109: voll |
| S12-4 Online suchen | REQ-110, REQ-111 | voll |

**Reihenfolge:** S12-1 → S12-2 → S12-3 → S12-4 (S12-4 nutzt den Zuschnitt aus REQ-109). Je Thema frische Agenten.

**Risiken**
- Online-Suche hängt von DNB-SRU und Open-Library-Suche ab; in Tests nur gemockt.
- Neuzuschnitt bei Maßänderung verwirft Bildanteile (vom CEO bewusst gewählt).
- Bestehende Cover werden erst bei der nächsten Änderung von Format/Maßen zugeschnitten (Auslegung REQ-109).
- Alttests mit 12,0 × 19,0 cm bzw. „Menü mit genau einer Option“ müssen mit angepasst werden.

**Kein Prototyp** in diesem Sprint bis zur ausdrücklichen Bitte des CEO.
