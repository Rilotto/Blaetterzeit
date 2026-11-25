/**
 * App-Version (REQ-113). Einzige Quelle ist das Feld `version` der package.json: Vite setzt `__APP_VERSION__` beim
 * Build (vite.config.ts), Android liest dieselbe Datei für `versionName` (android/app/build.gradle), und die
 * Release-Pipeline prüft, dass das Tag dazu passt (.github/workflows/release.yml). Nirgends sonst fest eingetragen.
 */
declare const __APP_VERSION__: string;

/** Version der laufenden App laut package.json, z. B. „0.11.0“. */
export const APP_VERSION: string = __APP_VERSION__;

/**
 * Anzeigeformat der Zeile „Versionsinfo“ (REQ-113, AK-2/AK-3): „<Haupt>.<Neben>“, die Patch-Stelle nur, wenn sie
 * größer als 0 ist: „0.11.0“ → „0.11“, „0.11.2“ → „0.11.2“, „1.0.0“ → „1.0“. Unbekannte Formate bleiben unverändert.
 */
export function versionAnzeige(version: string): string {
  const m = /^(\d+)\.(\d+)\.(\d+)(.*)$/.exec(version.trim());
  if (!m) return version.trim();
  const [, haupt, neben, patch, rest] = m;
  return Number(patch) > 0 ? `${Number(haupt)}.${Number(neben)}.${Number(patch)}${rest}` : `${Number(haupt)}.${Number(neben)}${rest}`;
}
