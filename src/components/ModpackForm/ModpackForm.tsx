import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Modpack, ModpackStatus, CurseForgeSearchResult } from '../../types';
import { curseforgeService } from '../../services/curseforgeService';
import './ModpackForm.css';

interface ModpackFormProps {
  onSubmit: (modpack: Omit<Modpack, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  initialData?: Modpack;
}

type FormMode = 'manual' | 'search';

export const ModpackForm: React.FC<ModpackFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<FormMode>(initialData ? 'manual' : 'search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CurseForgeSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    version: initialData?.version || '',
    description: initialData?.description || '',
    imageUrl: initialData?.imageUrl || '',
    categories: initialData?.categories || [],
    status: initialData?.status || 'not-played' as ModpackStatus,
  });

  const performSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const results = await curseforgeService.searchModpacks(query);
      setSearchResults(results);
      if (results.length === 0) {
        setSearchError('No modpacks found. Try a different search term.');
      }
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search failed');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (mode !== 'search' || searchQuery.trim().length < 2) {
      return;
    }

    debounceRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, mode, performSearch]);

  const handleSelectResult = (result: CurseForgeSearchResult) => {
    setFormData({
      name: result.name,
      version: result.latestFileVersion || '',
      description: result.summary,
      imageUrl: result.imageUrl,
      categories: result.categories,
      status: formData.status,
    });
    setMode('manual');
    setSearchQuery('');
    setSearchResults([]);
    setSearchError(null);
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

  const formatDownloads = (count: number): string => {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
    return String(count);
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

        {!initialData && (
          <div className="modpack-form__mode-toggle">
            <button
              type="button"
              className={`modpack-form__mode-button${mode === 'search' ? ' active' : ''}`}
              onClick={() => setMode('search')}
            >
              Search CurseForge
            </button>
            <button
              type="button"
              className={`modpack-form__mode-button${mode === 'manual' ? ' active' : ''}`}
              onClick={() => setMode('manual')}
            >
              Manual Entry
            </button>
          </div>
        )}

        {error && <div className="modpack-form__error">{error}</div>}

        {mode === 'search' && !initialData && (
          <div className="modpack-form__search">
            <div className="modpack-form__field">
              <label htmlFor="searchQuery">Search Modpacks</label>
              <input
                id="searchQuery"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type a modpack name (e.g., ATM10, RLCraft...)"
                className="modpack-form__input"
                autoFocus
              />
              <span className="modpack-form__hint">
                Results from <a href="https://www.curseforge.com/minecraft" target="_blank" rel="noopener noreferrer">CurseForge</a>. Min 2 characters.
              </span>
            </div>

            {isSearching && (
              <div className="modpack-form__loading">
                <span className="modpack-form__spinner" /> Searching...
              </div>
            )}

            {searchError && !isSearching && (
              <div className="modpack-form__no-results">{searchError}</div>
            )}

            {searchResults.length > 0 && (
              <div className="modpack-form__search-results">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="modpack-form__search-result"
                    onClick={() => handleSelectResult(result)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') handleSelectResult(result);
                    }}
                  >
                    {result.imageUrl && (
                      <img
                        src={result.imageUrl}
                        alt={result.name}
                        className="modpack-form__search-result-image"
                      />
                    )}
                    <div className="modpack-form__search-result-info">
                      <p className="modpack-form__search-result-name">{result.name}</p>
                      <p className="modpack-form__search-result-summary">{result.summary}</p>
                      <div className="modpack-form__search-result-meta">
                        {result.latestFileVersion && <span>v{result.latestFileVersion}</span>}
                        <span>{formatDownloads(result.downloadCount)} downloads</span>
                      </div>
                      {result.categories.length > 0 && (
                        <div className="modpack-form__search-result-categories">
                          {result.categories.map((cat) => (
                            <span key={cat} className="modpack-form__search-result-tag">{cat}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {mode === 'manual' && (
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

            {formData.categories.length > 0 && (
              <div className="modpack-form__field">
                <label>Categories</label>
                <div className="modpack-form__categories">
                  {formData.categories.map((cat) => (
                    <span key={cat} className="modpack-form__category-tag">{cat}</span>
                  ))}
                </div>
              </div>
            )}

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
