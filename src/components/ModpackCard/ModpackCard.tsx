import React from 'react';
import { Modpack, ModpackStatus } from '../../types';
import './ModpackCard.css';

interface ModpackCardProps {
  modpack: Modpack;
  onEdit: (modpack: Modpack) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: ModpackStatus) => void;
}

const statusConfig: Record<ModpackStatus, {
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
  icon: string;
  description: string;
}> = {
  'not-played': {
    color: '#9ca3af',
    bgColor: 'rgba(107, 114, 128, 0.15)',
    borderColor: '#6b7280',
    label: 'Not Played',
    icon: '⬜',
    description: 'Haven\'t started yet',
  },
  'in-progress': {
    color: '#fbbf24',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#f59e0b',
    label: 'In Progress',
    icon: '🎮',
    description: 'Currently playing',
  },
  'completed': {
    color: '#34d399',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10b981',
    label: 'Completed',
    icon: '✅',
    description: 'Finished playing',
  },
};

export const ModpackCard: React.FC<ModpackCardProps> = ({
  modpack,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const config = statusConfig[modpack.status];

  return (
    <div
      className="modpack-card"
      style={{ borderLeftColor: config.borderColor }}
    >
      <div className="modpack-card__image">
        {modpack.imageUrl ? (
          <img src={modpack.imageUrl} alt={modpack.name} />
        ) : (
          <div className="modpack-card__placeholder">No Image</div>
        )}
        <div
          className="modpack-card__status-banner"
          style={{ backgroundColor: config.borderColor }}
        >
          <span className="modpack-card__status-banner-icon">{config.icon}</span>
          <span className="modpack-card__status-banner-label">{config.label}</span>
        </div>
      </div>
      <div className="modpack-card__content">
        <div className="modpack-card__header">
          <h3 className="modpack-card__name">{modpack.name}</h3>
          <span
            className="modpack-card__version-badge"
            style={{
              backgroundColor: config.bgColor,
              color: config.color,
              borderColor: config.borderColor,
            }}
          >
            v{modpack.version}
          </span>
        </div>

        <div
          className="modpack-card__status-detail"
          style={{
            backgroundColor: config.bgColor,
            borderLeftColor: config.borderColor,
          }}
        >
          <span className="modpack-card__status-detail-icon">{config.icon}</span>
          <div className="modpack-card__status-detail-info">
            <span className="modpack-card__status-detail-label" style={{ color: config.color }}>
              {config.label}
            </span>
            <span className="modpack-card__status-detail-desc">{config.description}</span>
          </div>
        </div>

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
          style={{ borderColor: config.borderColor }}
        >
          <option value="not-played">⬜ Not Played</option>
          <option value="in-progress">🎮 In Progress</option>
          <option value="completed">✅ Completed</option>
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