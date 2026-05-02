import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Modpack, ModpackStatus } from '../types';
import { storageService } from '../services/storageService';

interface ModpackContextType {
  modpacks: Modpack[];
  addModpack: (modpack: Omit<Modpack, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateModpack: (id: string, updates: Partial<Modpack>) => void;
  deleteModpack: (id: string) => void;
  updateModpackStatus: (id: string, status: ModpackStatus) => void;
  isLoading: boolean;
  error: string | null;
}

const ModpackContext = createContext<ModpackContextType | undefined>(undefined);

export const useModpacks = () => {
  const context = useContext(ModpackContext);
  if (!context) {
    throw new Error('useModpacks must be used within a ModpackProvider');
  }
  return context;
};

interface ModpackProviderProps {
  children: React.ReactNode;
}

export const ModpackProvider: React.FC<ModpackProviderProps> = ({ children }) => {
  const [modpacks, setModpacks] = useState<Modpack[]>([]);
  const [isLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load modpacks from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const data = storageService.loadAppData();
        setModpacks(data.modpacks);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      }
    };

    loadData();
  }, []);

  // Save to localStorage whenever modpacks change (debounced)
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      try {
        storageService.saveAppData({
          modpacks,
        });
      } catch (err) {
        setError('Failed to save data');
        console.error(err);
      }
    }, 500); // Debounce for 500ms

    return () => clearTimeout(saveTimer);
  }, [modpacks]);

  const addModpack = useCallback((modpackData: Omit<Modpack, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newModpack: Modpack = {
      ...modpackData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setModpacks((prev) => [...prev, newModpack]);
    setError(null);
  }, []);

  const updateModpack = useCallback((id: string, updates: Partial<Modpack>) => {
    setModpacks((prev) =>
      prev.map((modpack) =>
        modpack.id === id
          ? { ...modpack, ...updates, updatedAt: new Date() }
          : modpack
      )
    );
    setError(null);
  }, []);

  const deleteModpack = useCallback((id: string) => {
    setModpacks((prev) => prev.filter((modpack) => modpack.id !== id));
    setError(null);
  }, []);

  const updateModpackStatus = useCallback((id: string, status: ModpackStatus) => {
    setModpacks((prev) =>
      prev.map((modpack) =>
        modpack.id === id
          ? { ...modpack, status, updatedAt: new Date() }
          : modpack
      )
    );
    setError(null);
  }, []);

  const value: ModpackContextType = {
    modpacks,
    addModpack,
    updateModpack,
    deleteModpack,
    updateModpackStatus,
    isLoading,
    error,
  };

  return <ModpackContext.Provider value={value}>{children}</ModpackContext.Provider>;
};
