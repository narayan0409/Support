/// <reference types="vite/client" />

declare namespace App {
  interface ImportMetaEnv {
    readonly VITE_API_BASE: string;
    // more env variables can be added here
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
