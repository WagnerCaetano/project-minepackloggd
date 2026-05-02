import React from 'react';
import { Modpack, ModpackStatus } from '../../types';
import { ModpackCard } from '../ModpackCard';
import './ModpackList.css';

interface ModpackListProps {
  modpacks: Modpack[];
  onEdit: (modpack: Modpack) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: ModpackStatus) => void;
}

export const ModpackList: React.FC<ModpackListProps> = ({
  modpacks,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  if (modpacks.length === 0) {
    return (
      <div className="modpack-list modpack-list--empty">
        <div className="modpack-list__empty">
          <h2>No modpacks yet</h2>
          <p>Click "Add Modpack" to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modpack-list">
      {modpacks.map((modpack) => (
        <ModpackCard
          key={modpack.id}
          modpack={modpack}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
};
