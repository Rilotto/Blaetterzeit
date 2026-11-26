# Sprint 13 – Review

**Stand:** 2026-11-26 · `npm run verify` lokal grün (273 Testdateien, 3351 Tests, Traceability OK).

## Umgesetzt
| Thema | REQs | Status | Test |
|---|---|---|---|
| S13-1 Cover online suchen | REQ-118, REQ-015, REQ-032 (REQ-016 Hinweis) | Implementiert | Tester grün, Gegenprobe 5/5 (mit REQ-119) |
| S13-2 Sprachfilter | REQ-119, REQ-116 | Implementiert | s. o. |
| S13-3 15 Treffer | REQ-117 | Implementiert | Mini, Alttests vom Tester gegengelesen |
| S13-4 App-Logo | REQ-120 | **In Umsetzung** – AK-1–7 grün, AK-8 Geräteprüfung durch den CEO offen | Gegenprobe 3/3 |
| S13-5 Profil volle Breite | REQ-066 (REQ-107 Hinweis) | Implementiert | Mini |
| S13-6 Deine Bibliothek | REQ-121 | Implementiert | Tester grün, Gegenprobe 3/3 |

## Auf dem Gerät zu prüfen
- REQ-120 AK-8: Icon auf Startbildschirm, App-Übersicht, Einstellungen → Apps (ggf. App neu installieren/Launcher neu starten wegen Icon-Cache); auf leicht dunkleren Pergament-Fleck um das Motiv achten.
- Sprachfilter mit echten Diensten: DNB-Index `spr` ungeprüft; Open Library liefert Werk-Sprachen, Cover kann von einer anderssprachigen Ausgabe stammen.
- Cover-Suche lädt bis zu 40 Cover je Suche – Tempo im Mobilnetz.
- Profil-Breite optisch.

## Auslegungen (Anforderungsmanager/Entwickler)
- „Cover online suchen“ nur beim Cover, nicht bei Rücken/Schnitt.
- Treffer ohne Sprachangabe entfallen.
- Icon-Hintergrund `#FEE8C8` (aufgehellter Logo-Grund `#FDDCAE`).
- Wertzeile zeigt „0,00 €“, auch wenn das Lesen der Bücher fehlschlägt (Hinweis nur in der Konsole).
