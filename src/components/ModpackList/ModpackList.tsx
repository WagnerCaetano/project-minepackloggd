import React, { useState, useMemo } from 'react';
import { Modpack, ModpackStatus } from '../../types';
import { ModpackCard } from '../ModpackCard';
import { FilterBar, FilterState } from '../FilterBar';
import './ModpackList.css';

interface ModpackListProps {
  modpacks: Modpack[];
  onEdit: (modpack: Modpack) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: ModpackStatus) => void;
}

const initialFilters: FilterState = {
  name: '',
  status: '' as ModpackStatus | '',
  category: '',
  version: '',
};

export const ModpackList: React.FC<ModpackListProps> = ({
  modpacks,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // Extract unique categories and versions from all modpacks
  const { categories, versions } = useMemo(() => {
    const catSet = new Set<string>();
    const verSet = new Set<string>();
    modpacks.forEach((m) => {
      m.categories.forEach((c) => catSet.add(c));
      if (m.version) verSet.add(m.version);
    });
    return {
      categories: Array.from(catSet).sort(),
      versions: Array.from(verSet).sort(),
    };
  }, [modpacks]);

  // Filter modpacks
  const filteredModpacks = useMemo(() => {
    return modpacks.filter((modpack) => {
      // Name filter
      if (filters.name) {
        const nameLower = filters.name.toLowerCase();
        if (!modpack.name.toLowerCase().includes(nameLower)) {
          return false;
        }
      }

      // Status filter
      if (filters.status && modpack.status !== filters.status) {
        return false;
      }

      // Category filter
      if (filters.category && !modpack.categories.includes(filters.category)) {
        return false;
      }

      // Version filter
      if (filters.version && modpack.version !== filters.version) {
        return false;
      }

      return true;
    });
  }, [modpacks, filters]);

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
    <div className="modpack-list-wrapper">
      <FilterBar
        categories={categories}
        versions={versions}
        filters={filters}
        onFiltersChange={setFilters}
      />
      {filteredModpacks.length === 0 ? (
        <div className="modpack-list modpack-list--empty">
          <div className="modpack-list__empty">
            <h2>No modpacks match your filters</h2>
            <p>Try adjusting your search criteria</p>
          </div>
        </div>
      ) : (
        <div className="modpack-list">
          {filteredModpacks.map((modpack) => (
            <ModpackCard
              key={modpack.id}
              modpack={modpack}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};