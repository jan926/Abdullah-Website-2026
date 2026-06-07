interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_RAWG_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  interface Window {
    electronAPI?: {
      downloadGame: (payload: { id: string; url: string; fileName: string }) => Promise<any>;
      launchGame: (executablePath: string) => Promise<any>;
      getInstalledGames: () => Promise<any[]>;
      onDownloadProgress: (callback: (payload: {
        id: string;
        path: string;
        percent: number;
        downloadedBytes: number;
        totalBytes: number;
        speedMbps: number;
        status: 'downloading' | 'complete' | 'error';
      }) => void) => void;
    };
  }
}

export {};
