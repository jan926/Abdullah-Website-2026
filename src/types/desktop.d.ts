export {};

declare global {
  interface Window {
    desktopWindow?: {
      minimize: () => Promise<void>;
      maximize: () => Promise<void>;
      close: () => Promise<void>;
    };
  }
}

