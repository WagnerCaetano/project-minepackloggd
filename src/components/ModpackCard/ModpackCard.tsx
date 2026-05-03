import React from 'react';
import { Modpack, ModpackStatus } from '../../types';
import './ModpackCard.css';

interface ModpackCardProps {
  modpack: Modpack;
  onEdit: (modpack: Modpack) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: ModpackStatus) => void;
}

const statusColors: Record<ModpackStatus, string> = {
  'not-played': '#6b7280',
  'in-progress': '#f59e0b',
  'completed': '#10b981',
};

const statusLabels: Record<ModpackStatus, string> = {
  'not-played': 'Not Played',
  'in-progress': 'In Progress',
  'completed': 'Completed',
};

export const ModpackCard: React.FC<ModpackCardProps> = ({
  modpack,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  return (
    <div className="modpack-card">
      <div className="modpack-card__image">
        {modpack.imageUrl ? (
          <img src={modpack.imageUrl} alt={modpack.name} />
        ) : (
          <div className="modpack-card__placeholder">No Image</div>
        )}
        <div
          className="modpack-card__status"
          style={{ backgroundColor: statusColors[modpack.status] }}
          title={statusLabels[modpack.status]}
        />
      </div>
      <div className="modpack-card__content">
        <h3 className="modpack-card__name">{modpack.name}</h3>
        <p className="modpack-card__version">Version: {modpack.version}</p>
        <p className="modpack-card__description">{modpack.description}</p>
        {modpack.categories.length > 0 && (
          <div className="modpack-card__categories">
            {modpack.categories.map((cat) => (
              <span key={cat} className="modpack-card__category-tag">{cat}</span>
            ))}
          </div>
        )}
      </div>
      <div className="modpack-card__actions">
        <select
          value={modpack.status}
          onChange={(e) => onStatusChange(modpack.id, e.target.value as ModpackStatus)}
          className="modpack-card__status-select"
        >
          <option value="not-played">Not Played</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <button
          onClick={() => onEdit(modpack)}
          className="modpack-card__button modpack-card__button--edit"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(modpack.id)}
          className="modpack-card__button modpack-card__button--delete"
        >
          Delete
        </button>
      </div>
    </div>
  );
};
