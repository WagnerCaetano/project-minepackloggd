import React, { useState } from 'react';
import { Modpack, ModpackStatus } from '../../types';
import './ModpackForm.css';

interface ModpackFormProps {
  onSubmit: (modpack: Omit<Modpack, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  initialData?: Modpack;
}

export const ModpackForm: React.FC<ModpackFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    version: initialData?.version || '',
    description: initialData?.description || '',
    imageUrl: initialData?.imageUrl || '',
    status: initialData?.status || 'not-played' as ModpackStatus,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.version) {
      setError('Name and version are required');
      return;
    }

    onSubmit(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="modpack-form-overlay">
      <div className="modpack-form">
        <div className="modpack-form__header">
          <h2>{initialData ? 'Edit Modpack' : 'Add New Modpack'}</h2>
          <button onClick={onCancel} className="modpack-form__close">
            ×
          </button>
        </div>

        {error && <div className="modpack-form__error">{error}</div>}

        <form onSubmit={handleSubmit} className="modpack-form__manual">
          <div className="modpack-form__field">
            <label htmlFor="name">Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="modpack-form__input"
            />
          </div>

          <div className="modpack-form__field">
            <label htmlFor="version">Version *</label>
            <input
              id="version"
              name="version"
              type="text"
              value={formData.version}
              onChange={handleInputChange}
              required
              placeholder="e.g., 1.20.1"
              className="modpack-form__input"
            />
          </div>

          <div className="modpack-form__field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="modpack-form__textarea"
            />
          </div>

          <div className="modpack-form__field">
            <label htmlFor="imageUrl">Image URL</label>
            <input
              id="imageUrl"
              name="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={handleInputChange}
              placeholder="https://..."
              className="modpack-form__input"
            />
          </div>

          <div className="modpack-form__field">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="modpack-form__input"
            >
              <option value="not-played">Not Played</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="modpack-form__actions">
            <button type="button" onClick={onCancel} className="modpack-form__button modpack-form__button--cancel">
              Cancel
            </button>
            <button type="submit" className="modpack-form__button modpack-form__button--submit">
              {initialData ? 'Update' : 'Add'} Modpack
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
