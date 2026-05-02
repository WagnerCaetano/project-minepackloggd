import React, { useState } from 'react';
import { ModpackProvider, useModpacks } from './contexts/ModpackContext';
import { ModpackList } from './components/ModpackList';
import { ModpackForm } from './components/ModpackForm';
import { GoogleAuthButton } from './components/Auth';
import { ImportExport } from './components/Sync';
import { Modpack } from './types';
import './App.css';

const AppContent: React.FC = () => {
  const { modpacks, addModpack, updateModpack, deleteModpack, updateModpackStatus, isLoading, error, syncToDrive, loadFromDrive } = useModpacks();
  const [showForm, setShowForm] = useState(false);
  const [editingModpack, setEditingModpack] = useState<Modpack | undefined>();
  const [authStatus, setAuthStatus] = useState(false);

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
          <GoogleAuthButton onAuthChange={setAuthStatus} />
          {authStatus && (
            <>
              <button onClick={syncToDrive} disabled={isLoading} className="app__button app__button--sync">
                {isLoading ? 'Syncing...' : 'Sync to Drive'}
              </button>
              <button onClick={loadFromDrive} disabled={isLoading} className="app__button app__button--load">
                {isLoading ? 'Loading...' : 'Load from Drive'}
              </button>
            </>
          )}
          <ImportExport />
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
