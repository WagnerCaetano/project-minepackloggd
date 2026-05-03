import { AppData, Modpack } from '../types';

const STORAGE_KEY = 'modpack-tracker-data';
const IMAGE_DB_NAME = 'modpack-tracker-images';
const IMAGE_DB_VERSION = 1;
const IMAGE_STORE = 'images';

// IndexedDB for image caching
const openImageDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IMAGE_DB_NAME, IMAGE_DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(IMAGE_STORE)) {
        db.createObjectStore(IMAGE_STORE);
      }
    };
  });
};

const saveImage = async (key: string, dataUrl: string): Promise<void> => {
  const db = await openImageDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(IMAGE_STORE, 'readwrite');
    const store = transaction.objectStore(IMAGE_STORE);
    const request = store.put(dataUrl, key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

const getImage = async (key: string): Promise<string | undefined> => {
  const db = await openImageDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(IMAGE_STORE, 'readonly');
    const store = transaction.objectStore(IMAGE_STORE);
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

const deleteImage = async (key: string): Promise<void> => {
  const db = await openImageDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(IMAGE_STORE, 'readwrite');
    const store = transaction.objectStore(IMAGE_STORE);
    const request = store.delete(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

// localStorage for app data
const loadAppData = (): AppData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Convert date strings back to Date objects
      parsed.modpacks = parsed.modpacks.map((m: Modpack) => ({
        ...m,
        categories: m.categories || [],
        createdAt: new Date(m.createdAt),
        updatedAt: new Date(m.updatedAt),
      }));
      if (parsed.lastSync) {
        parsed.lastSync = new Date(parsed.lastSync);
      }
      return parsed;
    }
  } catch (error) {
    console.error('Error loading app data:', error);
  }
  return {
    modpacks: [],
  };
};

const saveAppData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving app data:', error);
  }
};

const exportData = (data: AppData): string => {
  return JSON.stringify(data, null, 2);
};

const importData = (jsonString: string): AppData => {
  const parsed = JSON.parse(jsonString);
  parsed.modpacks = parsed.modpacks.map((m: Modpack) => ({
    ...m,
    categories: m.categories || [],
    createdAt: new Date(m.createdAt),
    updatedAt: new Date(m.updatedAt),
  }));
  if (parsed.lastSync) {
    parsed.lastSync = new Date(parsed.lastSync);
  }
  return parsed;
};

export const storageService = {
  loadAppData,
  saveAppData,
  exportData,
  importData,
  saveImage,
  getImage,
  deleteImage,
};
