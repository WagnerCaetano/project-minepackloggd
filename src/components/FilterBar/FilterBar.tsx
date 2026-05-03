import React, { useState, useEffect, useCallback } from 'react';
import { ModpackStatus } from '../../types';
import './FilterBar.css';

export interface FilterState {
  name: string;
  status: ModpackStatus | '';
  category: string;
  version: string;
}

interface FilterBarProps {
  categories: string[];
  versions: string[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  versions,
  filters,
  onFiltersChange,
}) => {
  const [localName, setLocalName] = useState(filters.name);
  const [localVersion, setLocalVersion] = useState(filters.version);

  // Debounce name filter
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({ ...filters, name: localName });
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localName]);

  // Debounce version filter
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({ ...filters, version: localVersion });
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localVersion]);

  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as ModpackStatus | '';
    onFiltersChange({ ...filters, status: value });
  }, [filters, onFiltersChange]);

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, category: e.target.value });
  }, [filters, onFiltersChange]);

  const handleClearFilters = useCallback(() => {
    setLocalName('');
    setLocalVersion('');
    onFiltersChange({ name: '', status: '', category: '', version: '' });
  }, [onFiltersChange]);

  const hasActiveFilters = filters.name || filters.status || filters.category || filters.version;

  return (
    <div className="filter-bar">
      <div className="filter-bar__title">
        <span className="filter-bar__icon">🔍</span> Filter Modpacks
      </div>
      <div className="filter-bar__controls">
        <div className="filter-bar__field">
          <label className="filter-bar__label" htmlFor="filter-name">Name</label>
          <input
            id="filter-name"
            type="text"
            className="filter-bar__input"
            placeholder="Search by name..."
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
          />
        </div>

        <div className="filter-bar__field">
          <label className="filter-bar__label" htmlFor="filter-status">Status</label>
          <select
            id="filter-status"
            className="filter-bar__select"
            value={filters.status}
            onChange={handleStatusChange}
          >
            <option value="">All Statuses</option>
            <option value="not-played">Not Played</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="filter-bar__field">
          <label className="filter-bar__label" htmlFor="filter-category">Category</label>
          <select
            id="filter-category"
            className="filter-bar__select"
            value={filters.category}
            onChange={handleCategoryChange}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="filter-bar__field">
          <label className="filter-bar__label" htmlFor="filter-version">Version</label>
          <select
            id="filter-version"
            className="filter-bar__select"
            value={filters.version}
            onChange={(e) => onFiltersChange({ ...filters, version: e.target.value })}
          >
            <option value="">All Versions</option>
            {versions.map((ver) => (
              <option key={ver} value={ver}>{ver}</option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button className="filter-bar__clear" onClick={handleClearFilters}>
            ✕ Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};