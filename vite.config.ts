/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
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
