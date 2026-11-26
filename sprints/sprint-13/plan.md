# Sprint 13 – Plan

**Sprintziel:** Cover online suchen, Sprachfilter und 15 Treffer bei den Online-Suchen, App-Logo als Launcher-Icon, Profil in voller Breite mit „Deine Bibliothek / Aktueller Wert“.

Inhalte vom CEO am 2026-11-26 im Chat festgelegt, vollständige Umsetzung beauftragt („nur die aktuellen Funktionen so im Detailgrad testen, alles bisher Umgesetzte nur sehr grob“). Vorab geprüft: kein ungemergter Branch, höchste REQ-Nummer REQ-117.

| Thema | REQs | Weg | Paket |
|---|---|---|---|
| S13-1 Cover online suchen | REQ-118, REQ-015, REQ-016, REQ-032 | voll | C (Suche) |
| S13-2 Sprachfilter | REQ-119, REQ-116 | voll | C (Suche) |
| S13-3 15 Treffer | REQ-117 | Mini | C (Suche) |
| S13-4 App-Logo | REQ-120 (Logo: `assets/logo/app-logo.png`) | voll | A (Android) |
| S13-5 Profil volle Breite | REQ-066, REQ-107 | Mini | B (Profil) |
| S13-6 Deine Bibliothek | REQ-121 | voll | B (Profil) |

Pakete A, B, C laufen parallel (getrennte Dateibereiche), je mit frischem Entwickler, danach Tester nur für die neuen REQs.

**Risiken**
- Sprachangaben fehlen bei Open Library oft; Auslegung „ohne Sprachangabe entfällt“ kann die Trefferzahl deutlich senken.
- Logo-Freistellung (schwarze Ecken, Safe Zone) muss reproduzierbar per Skript erfolgen; Endkontrolle nur auf dem Gerät.
- Alttests zu „Cover online suchen ohne Funktion“, Option bei Rücken/Schnitt und 9 Treffern müssen angepasst werden.

**Prototyp:** vom CEO angefordert – nach grüner CI.
