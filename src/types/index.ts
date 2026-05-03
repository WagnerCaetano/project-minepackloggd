export type ModpackStatus = 'not-played' | 'in-progress' | 'completed';

export interface Modpack {
  id: string;
  name: string;
  version: string;
  description: string;
  imageUrl: string;
  categories: string[];
  status: ModpackStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppData {
  modpacks: Modpack[];
}

export interface CurseForgeSearchResult {
  id: number;
  name: string;
  summary: string;
  imageUrl: string;
  categories: string[];
  latestFileVersion: string;
  downloadCount: number;
}

export interface CurseForgeCacheEntry {
  query: string;
  results: CurseForgeSearchResult[];
  timestamp: number;
}
