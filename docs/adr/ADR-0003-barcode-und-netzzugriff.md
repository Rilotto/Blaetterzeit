# ADR-0003: Barcode-Scanner und erster Netzzugriff (ISBN-Suche)

- **Status:** Entwurf
- **Datum:** 2026-11-17
- **Entscheider:** CEO (Vorschlag des Entwicklers, Sprint 06, REQ-061/REQ-062)

## Kontext
REQ-061 verlangt das Scannen des ISBN-Barcodes mit eigener Oberfläche (X, Taschenlampe, Rahmen). REQ-062 verlangt die Suche
der Angaben samt Cover bei der Deutschen Nationalbibliothek und bei Open Library. Damit greift die App zum ersten Mal auf das Internet zu.

## Entscheidung
- **Neue Abhängigkeit:** `@capacitor-mlkit/barcode-scanning` 8.2.x (passend zu Capacitor 8). Grund: `startScan` erlaubt eine
  eigene Oberfläche über dem Kamerabild und hat eine Taschenlampe. Das Erkennungsmodell ist gebündelt, Play-Dienste sind keine Pflicht.
  Die APK wird ca. 2–3 MB größer. Im Web: `getUserMedia` + `BarcodeDetector` (falls der Browser ihn kennt).
- **Netzzugriff:** nur gezielte GET-Anfragen über `CapacitorHttp` (APK, kein CORS). Kein globaler Patch von `fetch`.
  Im Web Rückfall auf `fetch`; die DNB kann dort an CORS scheitern.
- **Datenschutz:** An die Dienste geht **ausschließlich die ISBN** (bzw. eine Cover-Kennung, die Open Library selbst geliefert hat).
  Keine Nutzer- oder Buchdaten, keine eigenen Kopfzeilen, keine Kennungen. Endpunkte:
  - `services.dnb.de/sru/dnb` (SRU, MARC21-xml), Cover `portal.dnb.de/opac/mvb/cover?isbn=…`
  - `openlibrary.org/api/books?bibkeys=ISBN:…`, Cover `covers.openlibrary.org`
- **Kapselung:** Scanner (`BarcodeScanner`), HTTP (`HttpClient`) und Suche (`IsbnSuche`) liegen hinter Schnittstellen in
  `src/barcode/`, damit Tests Fakes einsetzen. Die Parser sind reine Funktionen mit Unit-Tests auf festen Beispieldaten.

## Konsequenzen
- Die Dienste können ihr Format ändern oder ausfallen; dann gibt es keine Treffer und der Nutzer landet auf der Seite „Bücher“.
- Scan und Suche sind verlässlich nur in der APK prüfbar.
- Weitere Quellen (z. B. Google Books) werden als zusätzliche Implementierung hinter `IsbnSuche` ergänzt.
