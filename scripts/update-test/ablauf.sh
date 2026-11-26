#!/usr/bin/env bash
# Update-Test im Android-Emulator (CI-Job „update-test“, .github/workflows/ci.yml).
#
# Ablauf:
#  1. Basis-APK installieren und einmal starten: Die alte App legt ihre SQLite-Datei an und migriert sie.
#  2. Datei per run-as holen, Testdaten (Buch mit Sitzung, Liste, Zitat) mit den Repositories der BASIS-Quellen
#     eintragen (node:sqlite, scripts/update-test/updatetest.ts), Datei zurückspielen.
#  3. Neue APK mit `adb install -r` darüber installieren und starten: Die neue App öffnet und migriert die Datei.
#  4. Datei erneut holen und mit den Repositories der AKTUELLEN Quellen prüfen (Schemaversion + alle Daten).
#
# Aufruf: ablauf.sh <basis.apk> <neu.apk> <basis-src-Ordner>
set -euo pipefail

BASIS_APK="$1"
NEU_APK="$2"
BASIS_SRC="$3"
PKG="de.blaetterzeit"
DB="databases/blaetterzeitSQLite.db"
ARBEIT="$(mktemp -d)"
WURZEL="$(cd "$(dirname "$0")/../.." && pwd)"

log() { echo "== $*"; }

diagnose() {
  echo "---- Diagnose (logcat, gekürzt) ----"
  adb logcat -d 2>/dev/null | grep -i -E "blaetterzeit|Capacitor|SQLite|chromium|AndroidRuntime" | tail -n 200 || true
}
trap 'diagnose' ERR

# Zählt Absturzmeldungen für $PKG im logcat: FATAL EXCEPTION (AndroidRuntime, Folgezeile „Process: $PKG, PID …“),
# „Process $PKG (pid …) has died“ (ActivityManager) und native Abstürze (Tombstone-Zeile „>>> $PKG <<<“).
absturz_zahl() {
  local log n m t
  log="$(adb logcat -d 2>/dev/null | tr -d '\r')"
  n="$(grep -A3 "FATAL EXCEPTION" <<<"$log" | grep -c -F "Process: $PKG," || true)"
  m="$(grep -c -E "Process ${PKG//./\\.} \(pid [0-9]+\) has died" <<<"$log" || true)"
  t="$(grep -c -F ">>> $PKG <<<" <<<"$log" || true)"
  echo $(( ${n:-0} + ${m:-0} + ${t:-0} ))
}

# Zählt Beendigungen von $PKG durch das System (ActivityManager „Killing <pid>:$PKG/…“), z. B. wenn im Emulator
# der Google-Play-Dienst stirbt, von dessen FontsProvider die WebView abhängt („depends on provider … in dying proc“).
# Das ist kein Absturz der App; laeuft() startet sie dann einmal neu.
kill_zahl() {
  adb logcat -d 2>/dev/null | tr -d '\r' | grep -c -E "ActivityManager: Killing [0-9]+:${PKG//./\\.}/" || true
}

ABSTURZ_BASIS=0
KILL_BASIS=0

starten() {
  adb shell am force-stop "$PKG" || true
  sleep 1
  # Stand vor dem Start merken, damit Meldungen früherer Phasen (und das force-stop) nicht mitzählen.
  ABSTURZ_BASIS="$(absturz_zahl)"
  KILL_BASIS="$(kill_zahl)"
  adb shell am start -W -n "$PKG/.MainActivity" >/dev/null
}

beenden() {
  adb shell am force-stop "$PKG"
  sleep 1
}

# Wartet, bis die App ihre Datenbankdatei angelegt hat (höchstens 120 s), dann noch kurz für die Migrationen.
warte_auf_datei() {
  for _ in $(seq 1 60); do
    if adb shell run-as "$PKG" test -f "$DB" 2>/dev/null; then
      sleep 10
      return 0
    fi
    sleep 2
  done
  echo "Datenbankdatei $DB wurde nicht angelegt"
  return 1
}

# Läuft die App (kein Absturz beim Start)? Prüft wiederholt bis zum Zeitlimit ($1 Sekunden, Standard 60).
# Fehler, wenn logcat seit dem letzten Start einen Absturz von $PKG zeigt oder die App im Zeitlimit nicht läuft.
# Wurde die App vom System beendet (kill_zahl gestiegen, kein Absturz), wird sie genau einmal neu gestartet.
# Erfolg erst, wenn der Prozess bei zwei Prüfungen im Abstand von 5 s mit derselben PID läuft.
laeuft() {
  local limit="${1:-60}" ende pid pid2 neustart=0
  ende=$(( SECONDS + limit ))
  while :; do
    if [ "$(absturz_zahl)" -gt "$ABSTURZ_BASIS" ]; then
      echo "App $PKG ist abgestürzt (logcat: FATAL EXCEPTION, has died bzw. Tombstone)"
      return 1
    fi
    pid="$(adb shell pidof "$PKG" 2>/dev/null | tr -d '\r' || true)"
    if [ -n "$pid" ]; then
      sleep 5
      pid2="$(adb shell pidof "$PKG" 2>/dev/null | tr -d '\r' || true)"
      if [ "$pid2" = "$pid" ] && [ "$(absturz_zahl)" -le "$ABSTURZ_BASIS" ]; then
        return 0
      fi
      continue
    fi
    if [ "$(kill_zahl)" -gt "$KILL_BASIS" ]; then
      if [ "$neustart" -eq 0 ]; then
        echo "Hinweis: $PKG wurde vom System beendet (kein Absturz):"
        adb logcat -d 2>/dev/null | tr -d '\r' | grep -E "ActivityManager: Killing [0-9]+:${PKG//./\\.}/" | tail -n 1 || true
        echo "Starte $PKG einmal neu"
        neustart=1
        KILL_BASIS="$(kill_zahl)"
        adb shell am start -W -n "$PKG/.MainActivity" >/dev/null
        ende=$(( SECONDS + limit ))
        sleep 8
        continue
      fi
      echo "App $PKG wurde auch nach dem Neustart vom System beendet"
      return 1
    fi
    if [ "$SECONDS" -ge "$ende" ]; then
      echo "App $PKG lief innerhalb von ${limit} s nicht (Absturz?)"
      return 1
    fi
    sleep 2
  done
}

holen() {
  rm -f "$ARBEIT"/bz.db*
  adb exec-out run-as "$PKG" cat "$DB" >"$ARBEIT/bz.db"
  # WAL-Datei mitnehmen, falls vorhanden (node:sqlite übernimmt sie beim Öffnen).
  if adb shell run-as "$PKG" test -f "$DB-wal" 2>/dev/null; then
    adb exec-out run-as "$PKG" cat "$DB-wal" >"$ARBEIT/bz.db-wal"
  fi
  [ -s "$ARBEIT/bz.db" ] || { echo "Datenbankdatei leer oder nicht lesbar"; return 1; }
}

zurueckspielen() {
  adb push "$ARBEIT/bz.db" /data/local/tmp/bz.db >/dev/null
  adb shell "run-as $PKG sh -c 'cat > $DB' < /data/local/tmp/bz.db"
  adb shell run-as "$PKG" rm -f "$DB-wal" "$DB-shm" "$DB-journal"
  adb shell rm -f /data/local/tmp/bz.db
}

daten() { # $1 = anlegen|pruefen, $2 = src-Ordner
  (cd "$WURZEL" && UPDATE_TEST_MODUS="$1" UPDATE_TEST_DB="$ARBEIT/bz.db" UPDATE_TEST_SRC="$2" \
    npx vitest run --config scripts/update-test/vitest.config.mts --reporter=verbose)
}

log "Sauberer Ausgangszustand"
adb uninstall "$PKG" >/dev/null 2>&1 || true
adb logcat -c || true

log "1. Basisversion installieren und starten"
adb install "$BASIS_APK"
starten
warte_auf_datei
laeuft
beenden

log "2. Testdaten mit der Basisversion anlegen"
holen
daten anlegen "$BASIS_SRC"
zurueckspielen

log "Kontrollstart der Basisversion mit den Testdaten"
starten
sleep 8
laeuft
beenden

log "3. Update: neue Version mit adb install -r darüber installieren"
adb install -r "$NEU_APK"
starten
sleep 15
laeuft
beenden

log "4. Daten nach dem Update prüfen"
holen
daten pruefen "$WURZEL/src"

log "Update-Test bestanden: Buch, Sitzung, Liste und Zitat sind nach dem Update erhalten"
