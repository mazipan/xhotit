/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PACKAGE_VERSION: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}