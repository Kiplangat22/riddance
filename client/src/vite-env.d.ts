/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Origin of the RIDDANCE API in production builds. Unset in local dev. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
