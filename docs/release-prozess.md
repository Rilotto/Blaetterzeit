# Release-Prozess

## Ablauf

1. Scrum Master legt dem CEO die implementierten REQs im Sprint Review vor.
2. CEO gibt ausdrücklich frei („REQ-003 und REQ-004 freigegeben für 0.2.0“).
3. Scrum Master führt aus:
   ```bash
   npm run release:freeze -- 0.2.0 REQ-003 REQ-004
   git add -A && git commit -m "release: v0.2.0"
   git tag v0.2.0 && git push && git push --tags
   ```
4. GitHub Actions (`release.yml`) prüft erneut alles und baut die **signierte APK**, die als Anhang am GitHub-Release erscheint.
5. APK aufs Handy laden und über die bestehende App installieren – Daten bleiben erhalten.

## Signaturschlüssel (einmalig einrichten)

> ⚠️ Geht der Keystore verloren, kann die App nicht mehr aktualisiert werden. Die App müsste deinstalliert werden – **alle lokalen Daten wären weg.**

```bash
keytool -genkeypair -v -keystore blaetterzeit-release.jks \
  -alias blaetterzeit -keyalg RSA -keysize 4096 -validity 36500
base64 -w0 blaetterzeit-release.jks > keystore.b64
```

1. `blaetterzeit-release.jks` + Passwörter **doppelt sichern** (Passwortmanager + Offline-Kopie). Niemals committen.
2. In GitHub → Repo → *Settings → Secrets and variables → Actions* anlegen:
   - `ANDROID_KEYSTORE_BASE64` – Inhalt von `keystore.b64`
   - `ANDROID_KEYSTORE_PASSWORD`
   - `ANDROID_KEY_ALIAS` – `blaetterzeit`
   - `ANDROID_KEY_PASSWORD`
3. `keystore.b64` danach löschen.

## Erste Installation auf dem Galaxy S23 Ultra

APK im Browser oder über „Eigene Dateien“ öffnen → Android fragt einmalig, ob diese Quelle Apps installieren darf → erlauben → installieren.

## Versionierung

- SemVer `MAJOR.MINOR.PATCH`. `versionName` = Tag, `versionCode` = laufende Build-Nummer der Pipeline (steigt automatisch).
