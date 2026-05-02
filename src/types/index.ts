export type ModpackStatus = 'not-played' | 'in-progress' | 'completed';

export interface Modpack {
  id: string;
  name: string;
  version: string;
  description: string;
  imageUrl: string;
  status: ModpackStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppData {
  modpacks: Modpack[];
}
