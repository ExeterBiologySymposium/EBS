/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY?: string;
}

declare module '*.html?raw' {
  const source: string;
  export default source;
}
