import React, { useState, useRef } from 'react';
import { ModpackProvider, useModpacks } from './contexts/ModpackContext';
import { ModpackList } from './components/ModpackList';
import { ModpackForm } from './components/ModpackForm';
import { Modpack } from './types';
import { storageService } from './services/storageService';
import './App.css';

const AppContent: React.FC = () => {
  const { modpacks, addModpack, updateModpack, deleteModpack, updateModpackStatus, error } = useModpacks();
  const [showForm, setShowForm] = useState(false);
  const [editingModpack, setEditingModpack] = useState<Modpack | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddModpack = () => {
    setEditingModpack(undefined);
    setShowForm(true);
  };

  const handleEditModpack = (modpack: Modpack) => {
    setEditingModpack(modpack);
    setShowForm(true);
  };

  const handleFormSubmit = (modpackData: Omit<Modpack, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingModpack) {
      updateModpack(editingModpack.id, modpackData);
    } else {
      addModpack(modpackData);
    }
    setShowForm(false);
    setEditingModpack(undefined);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingModpack(undefined);
  };

  const handleDeleteModpack = (id: string) => {
    if (window.confirm('Are you sure you want to delete this modpack?')) {
      deleteModpack(id);
    }
  };

  const handleExport = () => {
    const json = storageService.exportData({ modpacks });
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minepack-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = storageService.importData(event.target?.result as string);
        if (!window.confirm(`This will replace all your current data with ${data.modpacks.length} modpack(s) from the file. Continue?`)) {
          return;
        }
        storageService.saveAppData(data);
        window.location.reload();
      } catch {
        alert('Failed to import data. Please check the file is a valid backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Minecraft Modpack Tracker</h1>
        <div className="app__stats">
          <span className="app__stat">
            Total: {modpacks.length}
          </span>
          <span className="app__stat">
            Completed: {modpacks.filter(m => m.status === 'completed').length}
          </span>
          <span className="app__stat">
            In Progress: {modpacks.filter(m => m.status === 'in-progress').length}
          </span>
        </div>
      </header>

      <div className="app__actions">
        <button onClick={handleAddModpack} className="app__button app__button--primary">
          + Add Modpack
        </button>
        <div className="app__sync">
          <button onClick={handleExport} className="app__button app__button--sync" disabled={modpacks.length === 0}>
            Export JSON
          </button>
          <button onClick={handleImportClick} className="app__button app__button--load">
            Import JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {error && <div className="app__error">{error}</div>}

      <main className="app__main">
        <ModpackList
          modpacks={modpacks}
          onEdit={handleEditModpack}
          onDelete={handleDeleteModpack}
          onStatusChange={updateModpackStatus}
        />
      </main>

      {showForm && (
        <ModpackForm
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          initialData={editingModpack}
        />
      )}

      <footer className="app__footer">
        <p>Data is automatically saved to your browser's local storage.</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ModpackProvider>
      <AppContent />
    </ModpackProvider>
  );
};

export default App;
