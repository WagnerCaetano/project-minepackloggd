# Minecraft Modpack Tracker - Agent Documentation

## Project Overview

A web application for tracking Minecraft modpacks with local browser storage.

**Tech Stack:**
- Frontend: React 19 with TypeScript
- Build Tool: Vite
- Styling: CSS
- State Management: React Context API
- Storage: localStorage

**Project URL:** `c:/Users/Wagner Caetano/git/project-minepackloggd`

---

## Architecture

### Component Structure

```
src/
├── components/
│   ├── ModpackCard/            # Individual modpack display
│   │   ├── ModpackCard.tsx
│   │   ├── ModpackCard.css
│   │   └── index.ts
│   ├── ModpackForm/            # Add/edit form
│   │   ├── ModpackForm.tsx
│   │   ├── ModpackForm.css
│   │   └── index.ts
│   └── ModpackList/            # Grid of modpacks
│       ├── ModpackList.tsx
│       ├── ModpackList.css
│       └── index.ts
├── contexts/
│   └── ModpackContext.tsx      # Global state management
├── services/
│   └── storageService.ts        # localStorage operations
├── types/
│   └── index.ts                 # Main type definitions
├── App.tsx                     # Main app component
├── App.css                      # Global styles
└── main.tsx                     # Entry point
```

### Data Flow

```
User Input → ModpackForm → ModpackContext → Storage Service → localStorage
                                                    ↓
                                              ModpackList Display
```

---

## Features

### Core Features

1. **Modpack Management**
   - Add modpacks via manual entry
   - Edit existing modpacks
   - Delete modpacks with confirmation
   - Track status: Not Played, In Progress, Completed

2. **Local Storage**
   - Automatic save to localStorage
   - Debounced saving (500ms) to optimize performance
   - Data persists between browser sessions

---

## Implementation Details

### Storage Service

**File:** [`src/services/storageService.ts`](src/services/storageService.ts)

**Features:**
- localStorage for app data (modpacks)
- IndexedDB for image caching (optional, for future use)
- Date serialization/deserialization
- JSON export/import functionality

**Functions:**
```typescript
loadAppData(): AppData          // Load modpacks from localStorage
saveAppData(data: AppData): void // Save modpacks to localStorage
exportData(data: AppData): string // Export to JSON string
importData(jsonString: string): AppData // Import from JSON string
```

### Modpack Context

**File:** [`src/contexts/ModpackContext.tsx`](src/contexts/ModpackContext.tsx)

**Features:**
- Global state management for modpacks
- Auto-load from localStorage on mount
- Auto-save to localStorage on changes (debounced)
- CRUD operations for modpacks
- Error handling and loading states

**Context Interface:**
```typescript
interface ModpackContextType {
  modpacks: Modpack[];
  addModpack: (modpack: Omit<Modpack, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateModpack: (id: string, updates: Partial<Modpack>) => void;
  deleteModpack: (id: string) => void;
  updateModpackStatus: (id: string, status: ModpackStatus) => void;
  isLoading: boolean;
  error: string | null;
}
```

---

## Files and Their Purposes

### Core Application Files

| File | Purpose |
|-------|----------|
| [`index.html`](index.html) | HTML entry point |
| [`src/main.tsx`](src/main.tsx) | React app mount point |
| [`src/App.tsx`](src/App.tsx) | Main app component with routing and state |
| [`src/App.css`](src/App.css) | Global styles and responsive design |
| [`vite.config.ts`](vite.config.ts) | Vite configuration |
| [`tsconfig.json`](tsconfig.json) | TypeScript compiler options |
| [`package.json`](package.json) | Dependencies and scripts |

### Component Files

| File | Purpose |
|-------|----------|
| [`src/components/ModpackCard/ModpackCard.tsx`](src/components/ModpackCard/ModpackCard.tsx) | Display individual modpack with status, edit, delete |
| [`src/components/ModpackList/ModpackList.tsx`](src/components/ModpackList/ModpackList.tsx) | Grid display of all modpacks |
| [`src/components/ModpackForm/ModpackForm.tsx`](src/components/ModpackForm/ModpackForm.tsx) | Add/edit form with manual entry |

### Service Files

| File | Purpose |
|-------|----------|
| [`src/services/storageService.ts`](src/services/storageService.ts) | localStorage and IndexedDB operations |

### Context Files

| File | Purpose |
|-------|----------|
| [`src/contexts/ModpackContext.tsx`](src/contexts/ModpackContext.tsx) | Global state management for modpacks |

### Type Definition Files

| File | Purpose |
|-------|----------|
| [`src/types/index.ts`](src/types/index.ts) | TypeScript interfaces for app data |
| [`src/vite-env.d.ts`](src/vite-env.d.ts) | Vite type definitions |

### Documentation Files

| File | Purpose |
|-------|----------|
| [`README.md`](README.md) | User guide and setup instructions |
| [`agents.md`](agents.md) | This file - Agent documentation |

### Configuration Files

| File | Purpose |
|-------|----------|
| [`.gitignore`](.gitignore) | Git ignore rules |

---

## Development Instructions

### Prerequisites

1. Node.js 18+ and npm

### Local Development

```bash
npm install
npm run dev
```

App will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
```

The built files will be in the `dist` directory.

---

## Data Models

### Modpack Interface

```typescript
interface Modpack {
  id: string;
  name: string;
  version: string;
  description: string;
  imageUrl: string;
  status: ModpackStatus;
  createdAt: Date;
  updatedAt: Date;
}

type ModpackStatus = 'not-played' | 'in-progress' | 'completed';
```

### AppData Interface

```typescript
interface AppData {
  modpacks: Modpack[];
}
```

---

## Future Enhancements

### Potential Features to Add

1. **Search and Filter**
   - Search modpacks by name
   - Filter by status
   - Sort by name, date, status

2. **Categories/Tags**
   - Add custom categories to modpacks
   - Filter by category
   - Multiple tags per modpack

3. **Dark Mode**
   - Toggle between light/dark themes
   - Persist preference in localStorage

4. **PWA Capabilities**
   - Service worker for offline support
   - Install as desktop app
   - Background sync

5. **Statistics Dashboard**
   - Charts showing completion rates
   - Time spent per modpack
   - Monthly/yearly statistics

6. **Backup History**
   - Keep multiple backup versions
   - Restore from specific date
   - Compare changes between versions

7. **Import/Export Improvements**
   - Export to CSV
   - Import from CSV
   - Multiple backup slots

---

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npx tsc --noEmit
```

---

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Modern mobile browsers

---

## Security Considerations

1. **XSS Prevention**
   - React's built-in escaping
   - No dangerouslySetInnerHTML used

2. **Data Privacy**
   - All data stored client-side
   - No server-side data collection
   - No external API calls

---

## Performance Optimizations

1. **Debounced Saving**
   - 500ms debounce on localStorage writes
   - Reduces write operations

2. **Code Splitting**
   - Vite automatically splits code
   - Faster initial load times

3. **Lazy Loading**
   - Components load on demand
   - Better perceived performance

---

## Troubleshooting

### Data Not Persisting

**Symptoms:** Modpacks disappear after browser refresh

**Solutions:**
1. Check browser localStorage is enabled
2. Check browser console for errors
3. Verify storage quota is not exceeded
4. Try clearing browser cache and re-adding data

### Build Errors

**Symptoms:** TypeScript compilation errors

**Solutions:**
1. Run `npm install` to ensure dependencies
2. Clear node_modules and reinstall
3. Check TypeScript version: `npx tsc --version`
4. Verify tsconfig.json paths

---

## Contact & Support

For issues or questions:
1. Check [README.md](README.md) for basic setup
2. Check browser console for error messages
3. Verify Node.js and npm versions

---

## Version History

### v2.0.0 (Current)
- Removed CurseForge integration
- Removed Google Drive integration
- Simplified to local-only storage
- Updated to React 19
- Removed unnecessary dependencies (axios)
- Removed serverless function requirements

### v1.0.0
- Initial implementation with React + Vite
- CurseForge HTML scraping with rate limiting
- Google Drive integration
- Local storage + IndexedDB
- Import/Export functionality
