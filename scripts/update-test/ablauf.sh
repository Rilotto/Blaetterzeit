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

# Zählt Absturzmeldungen für $PKG im logcat: FATAL EXCEPTION (AndroidRuntime, Folgezeile „Process: $PKG, PID …“)
# und „Process $PKG (pid …) has died“ (ActivityManager).
absturz_zahl() {
  local n
  n="$(adb logcat -d 2>/dev/null | tr -d '\r' \
    | grep -A3 "FATAL EXCEPTION" | grep -c -F "Process: $PKG," || true)"
  local m
  m="$(adb logcat -d 2>/dev/null | tr -d '\r' \
    | grep -c -E "Process ${PKG//./\\.} \(pid [0-9]+\) has died" || true)"
  echo $(( ${n:-0} + ${m:-0} ))
}

ABSTURZ_BASIS=0

starten() {
  adb shell am force-stop "$PKG" || true
  sleep 1
  # Stand vor dem Start merken, damit Meldungen früherer Phasen nicht mitzählen.
  ABSTURZ_BASIS="$(absturz_zahl)"
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
# Fehler nur, wenn logcat seit dem letzten Start einen Absturz von $PKG zeigt oder die App im Zeitlimit nie lief.
laeuft() {
  local limit="${1:-60}" ende pid aktuell
  ende=$(( SECONDS + limit ))
  while :; do
    aktuell="$(absturz_zahl)"
    if [ "$aktuell" -gt "$ABSTURZ_BASIS" ]; then
      echo "App $PKG ist abgestürzt (logcat: FATAL EXCEPTION bzw. has died)"
      return 1
    fi
    pid="$(adb shell pidof "$PKG" 2>/dev/null | tr -d '\r' || true)"
    if [ -n "$pid" ]; then
      return 0
    fi
    if [ "$SECONDS" -ge "$ende" ]; then
      echo "App $PKG lief innerhalb von ${limit} s nie (Absturz?)"
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
