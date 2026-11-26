import { describe, expect, it } from 'vitest';
import { APP_VERSION, versionAnzeige } from '@/plattform/version';

const dateien = import.meta.glob<string>(['/package.json', '/android/app/build.gradle', '/.github/workflows/release.yml'], {
  query: '?raw',
  import: 'default',
  eager: true,
});
const datei = (pfad: string) => dateien[`/${pfad}`];

describe('Versionsinfo (REQ-113)', () => {
  it('Anzeigeformat: Patch-Stelle nur, wenn größer als 0', () => {
    expect(versionAnzeige('0.11.0')).toBe('0.11');
    expect(versionAnzeige('0.12.0')).toBe('0.12');
    expect(versionAnzeige('0.11.2')).toBe('0.11.2');
    expect(versionAnzeige('1.0.0')).toBe('1.0');
    expect(versionAnzeige(' 2.3.10 ')).toBe('2.3.10');
  });

  it('einzige Quelle package.json: App-Version und versionName der APK leiten sich daraus ab', () => {
    const paket = JSON.parse(datei('package.json')) as { version: string };
    expect(paket.version).toBe('0.11.0');
    expect(APP_VERSION).toBe(paket.version);
    const gradle = datei('android/app/build.gradle');
    const zeile = gradle.split('\n').find((z: string) => /^\s*versionName\b/.test(z));
    expect(zeile).toMatch(/package\.json/);
    expect(zeile).not.toMatch(/\d+\.\d+\.\d+/);
    expect(gradle).not.toMatch(/VERSION_NAME/);
  });

  it('Release prüft, dass das Tag zur package.json-Version passt', () => {
    const release = datei('.github/workflows/release.yml');
    expect(release).toMatch(/require\('\.\/package\.json'\)\.version/);
    expect(release).not.toMatch(/VERSION_NAME/);
  });
});
