import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'de.blaetterzeit',
  appName: 'Blätterzeit',
  webDir: 'dist',
  plugins: {
    // Randlose Darstellung (Android 15+ erzwingt edge-to-edge). "css" ist der
    // Standard und stellt --safe-area-inset-* für die Web-Oberfläche bereit;
    // der Hinweis "cover" passt zu index.html und vermeidet Layoutsprünge beim Start.
    SystemBars: {
      insetsHandling: 'css',
      initialViewportFitValueHint: 'cover',
    },
  },
};

export default config;
