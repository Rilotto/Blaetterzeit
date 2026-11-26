/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

// App-Version (REQ-113): einzige Quelle ist package.json „version“; im Code als __APP_VERSION__ (src/plattform/version.ts).
const paket = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };

export default defineConfig({
  plugins: [react()],
  define: { __APP_VERSION__: JSON.stringify(paket.version) },
  resolve: {
    // '@' statt relativer Pfade: Tests bleiben lauffähig, wenn sie beim
    // Einfrieren von tests/acceptance nach tests/regression verschoben werden.
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.{ts,tsx}'],
    // Tests abgelöster REQs bleiben als Historie erhalten, laufen aber nicht mehr.
    exclude: ['tests/retired/**', 'node_modules/**'],
  },
});
