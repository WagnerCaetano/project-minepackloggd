import React, { useRef } from 'react';
import { storageService } from '../../services/storageService';
import { useModpacks } from '../../contexts/ModpackContext';
import './ImportExport.css';

export const ImportExport: React.FC = () => {
  const { addModpack, deleteModpack, modpacks } = useModpacks();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = storageService.exportData({
      modpacks,
      syncSource: 'local',
    });

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modpack-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonString = event.target?.result as string;
        const data = storageService.importData(jsonString);

        // Clear existing modpacks and import new ones
        // Use Promise.all to ensure all deletions complete before adding
        await Promise.all(modpacks.map((m) => deleteModpack(m.id)));
        
        // Add new modpacks sequentially to avoid race conditions
        for (const m of data.modpacks) {
          const { id, createdAt, updatedAt, ...modpackData } = m;
          await new Promise(resolve => setTimeout(resolve, 0)); // Allow React to update
          addModpack(modpackData);
        }

        alert('Import successful!');
      } catch (error) {
        alert('Failed to import data. Please check the file format.');
        console.error(error);
      }
    };
    reader.readAsText(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="import-export">
      <button onClick={handleExport} className="import-export__button import-export__button--export">
        Export JSON
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        style={{ display: 'none' }}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="import-export__button import-export__button--import"
      >
        Import JSON
      </button>
    </div>
  );
};
