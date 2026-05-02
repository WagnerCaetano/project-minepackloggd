import React, { useState } from 'react';
import { Modpack, ModpackStatus } from '../../types';
import { fetchModpackFromURL } from '../../services/curseForgeScraper';
import './ModpackForm.css';

interface ModpackFormProps {
  onSubmit: (modpack: Omit<Modpack, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  initialData?: Modpack;
}

type InputMode = 'curseforge' | 'manual';

export const ModpackForm: React.FC<ModpackFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [mode, setMode] = useState<InputMode>('curseforge');
  const [curseForgeUrl, setCurseForgeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [versions, setVersions] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    version: initialData?.version || '',
    description: initialData?.description || '',
    imageUrl: initialData?.imageUrl || '',
    curseForgeUrl: initialData?.curseForgeUrl || '',
    curseForgeId: initialData?.curseForgeId,
    status: initialData?.status || 'not-played' as ModpackStatus,
  });

  const handleFetchFromCurseForge = async () => {
    if (!curseForgeUrl) {
      setError('Please enter a CurseForge URL');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching from CurseForge with URL:', curseForgeUrl);
      
      const result = await fetchModpackFromURL(curseForgeUrl);

      console.log('Fetch result:', result);

      if (result.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      if (result.name) {
        setFormData((prev) => ({
          ...prev,
          name: result.name,
          description: result.description,
          imageUrl: result.imageUrl,
          curseForgeUrl: curseForgeUrl,
          version: result.versions.length > 0 ? result.versions[0] : '',
        }));

        if (result.versions.length > 0) {
          setVersions(result.versions);
        }

        // Switch to manual mode to allow editing
        setMode('manual');
      }
    } catch (err) {
      setError('Failed to fetch modpack data. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

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

        <div className="modpack-form__mode-toggle">
          <button
            type="button"
            className={`modpack-form__mode-button ${mode === 'curseforge' ? 'active' : ''}`}
            onClick={() => setMode('curseforge')}
          >
            CurseForge URL
          </button>
          <button
            type="button"
            className={`modpack-form__mode-button ${mode === 'manual' ? 'active' : ''}`}
            onClick={() => setMode('manual')}
          >
            Manual Entry
          </button>
        </div>

        {error && <div className="modpack-form__error">{error}</div>}

        {mode === 'curseforge' ? (
          <div className="modpack-form__curseforge">
            <div className="modpack-form__field">
              <label htmlFor="curseForgeUrl">CurseForge URL</label>
              <input
                id="curseForgeUrl"
                type="url"
                value={curseForgeUrl}
                onChange={(e) => setCurseForgeUrl(e.target.value)}
                placeholder="https://www.curseforge.com/minecraft/modpacks/..."
                className="modpack-form__input"
              />
            </div>

            <button
              type="button"
              onClick={handleFetchFromCurseForge}
              disabled={isLoading}
              className="modpack-form__fetch-button"
            >
              {isLoading ? 'Fetching...' : 'Fetch from CurseForge'}
            </button>
          </div>
        ) : (
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
              {versions.length > 0 ? (
                <select
                  id="version"
                  name="version"
                  value={formData.version}
                  onChange={handleInputChange}
                  required
                  className="modpack-form__input"
                >
                  {versions.map((v, index) => (
                    <option key={index} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              ) : (
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
              )}
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
        )}
      </div>
    </div>
  );
};
