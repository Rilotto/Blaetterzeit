# Sprint 11 – Streak und Feinschliff

Grundlage: Der CEO hat am 2026-11-25 entschieden: „die Streak änderung soll erst für den nächsten Prototypen im Sprint 11 erfolgen“ und „auch diese Änderungen sollen erst im nächsten Prototypen eingebaut werden“.
Branch: sprint-11/streak-und-feinschliff, abgezweigt von sprint-10/abschluss. Der Code für REQ-108/109 kommt über Revert-of-Revert zurück.

## REQs
- REQ-108 Gesamt-Streak: Flamme angezündet, ausgegraut oder 0. Bereits umgesetzt und getestet (Sprint 10, Teil D).
- REQ-109 Buch-Streak „Längster Streak für dieses Buch“ als Rekord. Bereits umgesetzt und getestet.

## Mini-Änderungen (leichter Weg, CLAUDE.md Punkt 4)
1. Hauptleiste unten tiefer setzen: Abstand Schriftunterkante–Bildschirmrand halbieren (REQ-002).
2. Zitate in Anführungszeichen „…“, im Notizbuch und beim Zitat des Tages (REQ-105/106).
3. Karte „Gerade am Lesen“ (REQ-102): Cover ca. 1,5-mal so groß, Seitenzahl bzw. % rechts neben dem Balken, Balken linksbündig und volle Restbreite. Konzept vom CEO bestätigt.

## Ablauf
Start erst, wenn der CEO es sagt. Danach CI und Prototyp.

## Technische Aufgabe: Update-Test in der CI (CEO 2026-11-25: „ja bitte“)
Die CI baut die vorherige und die neue Version, signiert beide mit demselben Testschlüssel und installiert sie nacheinander im Android-Emulator. Dabei werden Daten angelegt, und es wird geprüft, dass Bücher, Sitzungen, Listen und Zitate nach dem Update erhalten sind. Ziel: Updates ohne Neuinstallation und ohne Datenverlust absichern (To-do vom 2026-11-10).
