// Nur für den Update-Test in der CI (scripts/update-test/ablauf.sh). '@' zeigt je nach Schritt auf den src-Ordner
// der Basisversion (Daten anlegen) oder der aktuellen Version (Daten prüfen).
import { fileURLToPath, URL } from 'node:url';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const wurzel = fileURLToPath(new URL('../..', import.meta.url));

export default defineConfig({
  root: wurzel,
  resolve: { alias: { '@': resolve(process.env.UPDATE_TEST_SRC ?? resolve(wurzel, 'src')) } },
  test: {
    environment: 'node',
    include: ['scripts/update-test/updatetest.ts'],
  },
  server: { fs: { strict: false } },
});
