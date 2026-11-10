/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Build-Schalter: „aus“ = keine Demodaten einspielen (Sprint 04, Teil A). */
  readonly VITE_DEMODATEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
