# Minecraft Modpack Tracker - Agent Documentation

## Project Overview

A web application for tracking Minecraft modpacks with local browser storage and CurseForge API integration.

**Tech Stack:**
- Frontend: React 19 with TypeScript
- Build Tool: Vite
- Styling: CSS
- State Management: React Context API
- Storage: localStorage
- API Proxy: Vercel Serverless Functions
- External API: CurseForge Core API

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
│   ├── ModpackForm/            # Add/edit form with CurseForge search
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
│   ├── storageService.ts       # localStorage operations
│   └── curseforgeService.ts    # CurseForge API client with cache + rate limit
├── types/
│   └── index.ts                # Main type definitions
├── App.tsx                     # Main app component
├── App.css                     # Global styles
└── main.tsx                    # Entry point
api/
└── curseforge.ts               # Vercel serverless function (CurseForge proxy)
api-dev.ts                      # Local dev API proxy (run with tsx)
```

### Data Flow

```
CurseForge Search → curseforgeService → /api/curseforge (Vercel) → CurseForge API
                        ↓ (cached)
                  ModpackForm (auto-fill)
                        ↓
                  ModpackContext → Storage Service → localStorage
                        ↓
                  ModpackList Display

Manual Entry → ModpackForm → ModpackContext → Storage Service → localStorage
                                                    ↓
                                              ModpackList Display
```

---

## Features

### Core Features

1. **Modpack Management**
   - Add modpacks via CurseForge search or manual entry
   - Edit existing modpacks
   - Delete modpacks with confirmation
   - Track status: Not Played, In Progress, Completed
   - Categories displayed as tags on modpack cards

2. **CurseForge Integration**
   - Search CurseForge modpacks by name (min 2 characters)
   - 500ms debounce on search input to prevent API spam
   - Auto-fill form fields from search result (name, version, description, image, categories)
   - Results cached in localStorage for 24 hours
   - Client-side rate limit: 10 requests per 60 seconds
   - Server-side rate limit: 10 requests per 60 seconds per IP
   - Vercel serverless function proxies API to avoid CORS issues

3. **Data Backup**
   - Export all modpacks as a JSON file
   - Import modpacks from a previously exported JSON file
   - Confirmation dialog before replacing data on import

4. **Local Storage**
   - Automatic save to localStorage
   - Debounced saving (500ms) to optimize performance
   - Data persists between browser sessions
   - Migration support for schema changes (e.g., added `categories` field)

---

## Implementation Details

### CurseForge API Proxy

**File:** [`api/curseforge.ts`](api/curseforge.ts)

Vercel serverless function that proxies requests to the CurseForge Core API.

**Route:** `GET /api/curseforge?search=<query>`

**Features:**
- Reads `CURSEFORGE_API_KEY` from Vercel environment variable
- Server-side rate limiting (10 req/min per IP, in-memory)
- Maps CurseForge response to simplified `CurseForgeSearchResult` format
- Extracts game version from `latestFiles[].gameVersions`
- Error handling for missing API key, rate limits, and upstream errors

**For local development:** [`api-dev.ts`](api-dev.ts) is a standalone Node HTTP server (port 3001) with the same logic. Run with `npm run dev:api`.

### CurseForge Client Service

**File:** [`src/services/curseforgeService.ts`](src/services/curseforgeService.ts)

**Features:**
- Client-side rate limiting (10 requests per 60 seconds, tracked in localStorage)
- 24-hour search result cache in localStorage (`cf-cache:*` keys)
- Prunes expired cache entries on service initialization
- Minimum 2-character query validation

**Functions:**
```typescript
curseforgeService.searchModpacks(query: string): Promise<CurseForgeSearchResult[]>
```

### Storage Service

**File:** [`src/services/storageService.ts`](src/services/storageService.ts)

**Features:**
- localStorage for app data (modpacks)
- IndexedDB for image caching (optional, for future use)
- Date serialization/deserialization
- Schema migration: defaults `categories` to `[]` for existing data
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

### Modpack Form

**File:** [`src/components/ModpackForm/ModpackForm.tsx`](src/components/ModpackForm/ModpackForm.tsx)

**Features:**
- Dual-mode form: "Search CurseForge" and "Manual Entry" tabs
- Mode toggle only shown when adding new (not when editing existing)
- Search mode: debounced input (500ms), result list with image/name/summary/downloads/categories
- Selecting a result auto-fills all form fields and switches to manual mode for editing
- Manual mode: standard form with all fields including category display

---

## Files and Their Purposes

### Core Application Files

| File | Purpose |
|-------|----------|
| [`index.html`](index.html) | HTML entry point |
| [`src/main.tsx`](src/main.tsx) | React app mount point |
| [`src/App.tsx`](src/App.tsx) | Main app component with export/import buttons |
| [`src/App.css`](src/App.css) | Global styles and responsive design |
| [`vite.config.ts`](vite.config.ts) | Vite configuration with API proxy |
| [`tsconfig.json`](tsconfig.json) | TypeScript compiler options |
| [`package.json`](package.json) | Dependencies and scripts |

### Component Files

| File | Purpose |
|-------|----------|
| [`src/components/ModpackCard/ModpackCard.tsx`](src/components/ModpackCard/ModpackCard.tsx) | Display modpack with status, categories, edit, delete |
| [`src/components/ModpackList/ModpackList.tsx`](src/components/ModpackList/ModpackList.tsx) | Grid display of all modpacks |
| [`src/components/ModpackForm/ModpackForm.tsx`](src/components/ModpackForm/ModpackForm.tsx) | Add/edit form with CurseForge search and manual entry |

### Service Files

| File | Purpose |
|-------|----------|
| [`src/services/storageService.ts`](src/services/storageService.ts) | localStorage, IndexedDB, export/import |
| [`src/services/curseforgeService.ts`](src/services/curseforgeService.ts) | CurseForge API client with cache and rate limiting |

### API Files

| File | Purpose |
|-------|----------|
| [`api/curseforge.ts`](api/curseforge.ts) | Vercel serverless function — CurseForge API proxy |
| [`api-dev.ts`](api-dev.ts) | Local dev API proxy server (run with `npm run dev:api`) |

### Context Files

| File | Purpose |
|-------|----------|
| [`src/contexts/ModpackContext.tsx`](src/contexts/ModpackContext.tsx) | Global state management for modpacks |

### Type Definition Files

| File | Purpose |
|-------|----------|
| [`src/types/index.ts`](src/types/index.ts) | TypeScript interfaces (Modpack, CurseForgeSearchResult, etc.) |
| [`src/vite-env.d.ts`](src/vite-env.d.ts) | Vite type definitions |

### Configuration Files

| File | Purpose |
|-------|----------|
| [`vercel.json`](vercel.json) | Vercel routing configuration |
| [`vite.config.ts`](vite.config.ts) | Vite config with `/api` proxy to localhost:3001 |
| [`tsconfig.json`](tsconfig.json) | TypeScript compiler options |
| [`.gitignore`](.gitignore) | Git ignore rules (includes `.env`, `.env.local`) |

### Documentation Files

| File | Purpose |
|-------|----------|
| [`README.md`](README.md) | User guide and setup instructions |
| [`AGENTS.md`](AGENTS.md) | This file - Agent documentation |

---

## Development Instructions

### Prerequisites

1. Node.js 18+ and npm
2. A CurseForge API key (set as environment variable)

### Local Development

You need two terminals:

**Terminal 1** (Frontend — port 3000):
```bash
npm install
npm run dev
```

**Terminal 2** (API proxy — port 3001):
```bash
# Windows
set CURSEFORGE_API_KEY=your-api-key
npm run dev:api

# Linux/macOS
CURSEFORGE_API_KEY=your-api-key npm run dev:api
```

The Vite dev server proxies `/api/*` requests to `localhost:3001` automatically.

App will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
```

The built files will be in the `dist` directory.

### Deploying to Vercel

1. Push to GitHub
2. Import in Vercel
3. Set `CURSEFORGE_API_KEY` in Vercel dashboard (Settings > Environment Variables)
4. The `api/curseforge.ts` function is auto-detected by Vercel

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
  categories: string[];
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

### CurseForge Types

```typescript
interface CurseForgeSearchResult {
  id: number;
  name: string;
  summary: string;
  imageUrl: string;
  categories: string[];
  latestFileVersion: string;
  downloadCount: number;
}

interface CurseForgeCacheEntry {
  query: string;
  results: CurseForgeSearchResult[];
  timestamp: number;
}
```

---

## Future Enhancements

### Potential Features to Add

1. **Search and Filter**
   - Search modpacks by name in the local list
   - Filter by status
   - Filter by category
   - Sort by name, date, status

2. **Dark Mode**
   - Toggle between light/dark themes
   - Persist preference in localStorage

3. **PWA Capabilities**
   - Service worker for offline support
   - Install as desktop app
   - Background sync

4. **Statistics Dashboard**
   - Charts showing completion rates
   - Time spent per modpack
   - Monthly/yearly statistics

5. **Backup History**
   - Keep multiple backup versions
   - Restore from specific date
   - Compare changes between versions

6. **Import/Export Improvements**
   - Export to CSV
   - Import from CSV
   - Multiple backup slots

---

## Development Commands

```bash
# Install dependencies
npm install

# Start frontend dev server (port 3000)
npm run dev

# Start API dev proxy (port 3001) — requires CURSEFORGE_API_KEY env var
npm run dev:api

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npx tsc --noEmit

# Lint
npm run lint
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
   - All modpack data stored client-side
   - No server-side data collection
   - CurseForge API key stored as Vercel environment variable (never exposed to client)

3. **API Security**
   - Server-side rate limiting (10 req/min per IP)
   - Client-side rate limiting (10 req/min per 60s)
   - Search results cached for 24 hours to reduce API calls
   - 500ms debounce on search input

---

## Performance Optimizations

1. **Debounced Saving**
   - 500ms debounce on localStorage writes
   - Reduces write operations

2. **Debounced Search**
   - 500ms debounce on CurseForge search input
   - Prevents excessive API calls during typing

3. **Search Result Caching**
   - 24-hour cache in localStorage
   - Avoids duplicate API requests for same query
   - Expired entries pruned on service initialization

4. **Code Splitting**
   - Vite automatically splits code
   - Faster initial load times

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

### CurseForge Search Not Working

**Symptoms:** No search results or errors

**Solutions:**
1. Verify `CURSEFORGE_API_KEY` is set correctly
2. For local dev: ensure `npm run dev:api` is running on port 3001
3. Check browser console for CORS or network errors
4. Verify the API key is valid at [CurseForge Console](https://console.curseforge.com/)

---

## Version History

### v3.0.0 (Current)
- Added CurseForge API integration via Vercel serverless function
- Dual-mode modpack form (Search CurseForge + Manual Entry)
- Categories field on modpacks (auto-filled from CurseForge)
- Export/Import JSON backup buttons
- Client-side search result cache (24h TTL)
- Client-side and server-side rate limiting
- 500ms debounce on search input
- Local dev API proxy (`api-dev.ts` + `npm run dev:api`)

### v2.0.0
- Simplified to local-only storage
- Updated to React 19
- Removed CurseForge HTML scraping
- Removed Google Drive integration
- Removed unnecessary dependencies (axios)
- Removed serverless function requirements

### v1.0.0
- Initial implementation with React + Vite
- CurseForge HTML scraping with rate limiting
- Google Drive integration
- Local storage + IndexedDB
- Import/Export functionality
