# Testbericht Sprint 04

## Anpassung REQ-009/AK-3 (Demodaten auf „ungelesen“)

Auf Wunsch des CEO stehen alle Testbücher in `demo/testbuecher.json` jetzt auf „ungelesen“ (IDs unverändert). Der Test „[REQ-009/AK-3] ohne Props …“ prüfte zusätzlich fest, dass „When The Moon Hatched“ fehlt. Damit prüfte er den Inhalt der Demodaten und nicht REQ-009. Die Ausschlussprüfung wird jetzt dynamisch aus den Demodaten abgeleitet: Genau die Bücher mit dem Status „ungelesen“ müssen erscheinen, alle anderen nicht. Die Filterprüfung bleibt unverändert. Die Ausschlussprüfung mit anderen Status bleibt in den übrigen AK-3-Tests mit expliziten Daten abgedeckt.
