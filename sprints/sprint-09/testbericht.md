# Testbericht Sprint 09 (Teil A+B, REQ-079 bis REQ-090) – Tester, 2026-11-22

**Lokal (Token sparen):** 12 neue Dateien `tests/acceptance/REQ-079…090-*.test.tsx`, 173 Tests, alle grün; jedes AK abgedeckt (Grenz-/Negativfälle, festes `jetzt`). Mit REQ-002/REQ-056 fein+grob: 263 grün, 2 rot (Befund 1). `tsc -b`, `oxlint`, `npm run trace` grün. Volle Suite nur in der CI, nicht lokal gelaufen.
**Ergebnis je REQ:** REQ-079, 080, 081, 082, 083, 084, 085, 086, 087, 088, 089, 090: alle AKs bestanden (lokal).
**Gegenprobe (5 Fehler, Kern):** Doppelzählung, Woche ab Sonntag, Vergleich ohne Minus, nachgetragenes Buch als Lesetag, „Beendet am“ nicht gesetzt: alle 5 erkannt (5/58/5/3/10 rote Tests).
**Angepasst:** REQ-002/AK-12: „Statistik“ zählt jetzt zu den definierten Zielansichten (REQ-079).
**Befund 1 (REQ-Konflikt, nicht angepasst):** REQ-056 legt in Anforderung und AK-1 weiterhin „genau elf Zeilen“ fest, REQ-085 ergänzt „Beendet am“ ohne `ersetzt`/Änderung von REQ-056. Die App zeigt zwölf Zeilen, deshalb sind `[REQ-056/AK-1]` und `[REQ-056/GROB]` rot. Der Anforderungsmanager muss REQ-056 anpassen, danach passt der Tester beide Tests an.
**Befund 1 behoben (2026-11-23):** REQ-056 verlangt jetzt zwölf Zeilen, `[REQ-056/AK-1]` und `[REQ-056/GROB]` sind angepasst, CI grün (Angabe Scrum Master).
**Hinweis 2 (REQ-090/AK-2):** Im Stil „Feuilleton“ behält die Pillenleiste ihren Rahmen in Sekundär (eckig). Der Übersicht-Umschalter hat ihn auch, die Reiterleiste nicht. Das ist nicht eindeutig aus dem REQ ableitbar und daher keine Testerwartung. Der CEO prüft es im Prototyp.
**Abweichungen laut Entwickler (nicht als Erwartung festgeschrieben):** Kennzahl in Stufe „Seite“ (24 px), Zahl in der Flamme, aktive Pille ohne Wanderanimation, Sessions je Buch auf die Seitenanzahl gedeckelt (verträglich mit REQ-084 „keine Doppelzählung“).
**Grenze jsdom:** Umrandung „heute“ und Rahmen werden am gesetzten Stil geprüft, weil jsdom `outline`/`border` mit `var()` nicht berechnet. „Volle Breite“ wird nur über die Flex-Eigenschaften geprüft.
**Empfehlung:** freigabefähig; CI (`npm run verify`, volle Suite) grün.
**Grobe Tests (2026-11-23, nach CEO-Abnahme):** `tests/grob/REQ-079…090-grob.test.tsx` neu (12 Dateien, 12 Tests, je Kern des REQ), lokal grün (dot); `tsc -b` und oxlint ohne Befund. Feine Tests unverändert. Keine Gegenprobe. Befund 1 (REQ-056, elf Zeilen) davon unberührt.
