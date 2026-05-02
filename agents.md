# Minecraft Modpack Tracker - Agent Documentation

## Project Overview

A web application for tracking Minecraft modpacks with support for Google Drive sync, local browser caching, and CurseForge integration.

**Tech Stack:**
- Frontend: React 18 with TypeScript
- Build Tool: Vite
- Styling: CSS
- State Management: React Context API
- Storage: localStorage, IndexedDB, Google Drive API
- External APIs: CurseForge (via HTML scraping)

**Project URL:** `c:/Users/Wagner Caetano/git/minecraft-modpack-aggregator`

---

## Architecture

### Component Structure

```
src/
├── components/
│   ├── Auth/                    # Google Drive authentication
│   │   ├── GoogleAuthButton.tsx   # One-click auth UI
│   │   └── GoogleAuthButton.css
│   ├── ModpackCard/            # Individual modpack display
│   │   ├── ModpackCard.tsx
│   │   ├── ModpackCard.css
│   │   └── index.ts
│   ├── ModpackForm/            # Add/edit form
│   │   ├── ModpackForm.tsx        # CurseForge URL + Manual Entry
│   │   ├── ModpackForm.css
│   │   └── index.ts
│   ├── ModpackList/            # Grid of modpacks
│   │   ├── ModpackList.tsx
│   │   ├── ModpackList.css
│   │   └── index.ts
│   └── Sync/                   # Import/Export functionality
│       ├── ImportExport.tsx
│       ├── ImportExport.css
│       └── index.ts
├── contexts/
│   └── ModpackContext.tsx      # Global state management
├── services/
│   ├── storageService.ts        # localStorage + IndexedDB
│   ├── curseForgeScraper.ts    # HTML parser for CurseForge
│   └── googleDriveService.ts     # Google Drive API wrapper
├── types/
│   ├── index.ts                 # Main type definitions
│   └── vite-env.d.ts            # Vite + Google types
├── App.tsx                     # Main app component
├── App.css                      # Global styles
└── main.tsx                     # Entry point
```

### Data Flow

```
User Input → ModpackForm → ModpackContext → Storage Service → localStorage/IndexedDB/Google Drive
                                                    ↓
                                              ModpackList Display
```

---

## Features

### Core Features

1. **Modpack Management**
   - Add modpacks via CurseForge URL or manual entry
   - Edit existing modpacks
   - Delete modpacks with confirmation
   - Track status: Not Played, In Progress, Completed

2. **CurseForge Integration** (HTML Scraping)
    - Paste CurseForge URL to auto-fetch modpack data
    - Extracts: name, description, image URL, versions
    - Uses Vercel serverless function to bypass CORS
    - Rate limiting: 10 requests/minute per IP
    - Caching: 1 hour cache per URL

3. **Storage Options**
   - **Local Storage**: Automatic save to localStorage
   - **IndexedDB**: Image caching for better performance
   - **Google Drive**: Cloud backup and sync
   - **Import/Export**: JSON file backup

4. **Google Drive Integration** (Simplified)
    - One-click authorization using Google Identity Services
    - Simple save/load file from Google Drive
    - Token stored in sessionStorage
    - No complex OAuth flow needed

---

## Implementation Details

### CurseForge HTML Scraping

**File:** [`src/services/curseForgeScraper.ts`](src/services/curseForgeScraper.ts)

**How it works:**
1. User pastes CurseForge URL
2. App calls Vercel serverless function
3. Function fetches HTML from CurseForge (bypasses CORS)
4. Parses HTML using DOMParser API
5. Extracts data from meta tags and page elements

**Data Extraction:**
```typescript
// Extract name from multiple sources
const name = 
  doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
  doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content') ||
  doc.querySelector('h1')?.textContent?.trim() ||
  doc.querySelector('title')?.textContent?.trim() ||
  'Unknown Modpack';

// Extract description
const description = 
  doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
  doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content') ||
  doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
  '';

// Extract image
const imageUrl = 
  doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
  doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') ||
  '';
```

**Serverless Function:** [`api/curseforge-proxy.js`](api/curseforge-proxy.js)

**Features:**
- Rate limiting: 10 requests/minute per IP
- Caching: 1 hour TTL per URL
- CORS headers enabled
- URL validation (only CurseForge URLs allowed)
- User-Agent header for proper scraping

### Google Drive Integration

**File:** [`src/services/googleDriveService.ts`](src/services/googleDriveService.ts)

**How it works:**
1. User clicks "Connect Google Drive"
2. Google Identity Services popup appears
3. User authorizes with one click
4. Token stored in sessionStorage
5. Use token for Drive API operations

**Google Identity Services:**
```typescript
// Initialize token client
tokenClient = google.accounts.oauth2.initTokenClient({
  client_id: OAUTH2_CLIENT_ID,
  scope: OAUTH2_SCOPE,
  callback: (response: any) => {
    if (response.access_token) {
      setAccessToken(response.access_token);
    }
  },
});

// One-click auth
const requestAccessToken = () => {
  tokenClient.requestAccessToken();
};
```

**File Operations:**
- Save data to Drive (create or update)
- Load data from Drive
- Find existing data file
- Create app data folder if needed

### Storage Service

**File:** [`src/services/storageService.ts`](src/services/storageService.ts)

**Features:**
- localStorage for app data (modpacks, settings)
- IndexedDB for image caching
- JSON export functionality
- JSON import functionality
- Date serialization/deserialization

**IndexedDB Structure:**
```typescript
const IMAGE_DB_NAME = 'modpack-tracker-images';
const IMAGE_DB_VERSION = 1;
const IMAGE_STORE = 'images';

// Store images by modpack ID
saveImage(key: string, dataUrl: string): Promise<void>
getImage(key: string): Promise<string | undefined>
deleteImage(key: string): Promise<void>
```

---

## Files and Their Purposes

### Core Application Files

| File | Purpose |
|-------|----------|
| [`index.html`](index.html) | HTML entry point, includes Google Identity Services script |
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
| [`src/components/ModpackForm/ModpackForm.tsx`](src/components/ModpackForm/ModpackForm.tsx) | Add/edit form with CurseForge URL input |
| [`src/components/Auth/GoogleAuthButton.tsx`](src/components/Auth/GoogleAuthButton.tsx) | One-click Google Drive auth button |
| [`src/components/Sync/ImportExport.tsx`](src/components/Sync/ImportExport.tsx) | JSON import/export functionality |

### Service Files

| File | Purpose |
|-------|----------|
| [`src/services/storageService.ts`](src/services/storageService.ts) | localStorage and IndexedDB operations |
| [`src/services/curseForgeScraper.ts`](src/services/curseForgeScraper.ts) | CurseForge HTML parser |
| [`src/services/googleDriveService.ts`](src/services/googleDriveService.ts) | Google Drive API wrapper |
| [`src/services/curseForgeService.ts`](src/services/curseForgeService.ts) | Legacy CurseForge API (deprecated) |

### Context Files

| File | Purpose |
|-------|----------|
| [`src/contexts/ModpackContext.tsx`](src/contexts/ModpackContext.tsx) | Global state management for modpacks |

### Type Definition Files

| File | Purpose |
|-------|----------|
| [`src/types/index.ts`](src/types/index.ts) | TypeScript interfaces for app data |
| [`src/vite-env.d.ts`](src/vite-env.d.ts) | Vite and Google Identity Services types |

### Serverless Functions

| File | Purpose |
|-------|----------|
| [`api/curseforge-proxy.js`](api/curseforge-proxy.js) | CurseForge HTML proxy with rate limiting |

### Documentation Files

| File | Purpose |
|-------|----------|
| [`README.md`](README.md) | User guide and setup instructions |
| [`IMPLEMENTATION_SUMMARY.md`](IMPLEMENTATION_SUMMARY.md) | Implementation details and deployment guide |
| [`plans/modpack-tracker-architecture.md`](plans/modpack-tracker-architecture.md) | Original architecture plan |
| [`plans/curseforge-scraping-plan.md`](plans/curseforge-scraping-plan.md) | CurseForge scraping plan |

### Configuration Files

| File | Purpose |
|-------|----------|
| [`.env.example`](.env.example) | Environment variable template |
| [`.gitignore`](.gitignore) | Git ignore rules |

---

## Deployment Instructions

### Prerequisites

1. Node.js 18+ and npm
2. Google Cloud Console account (for Google Drive)
3. Vercel or Netlify account (for CurseForge scraping)

### Environment Setup

Create `.env` file:
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

Get Google Client ID:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to APIs & Services > Credentials
4. Create OAuth 2.0 Client ID (Web application)
5. Add your app's URL to Authorized JavaScript origins
6. Copy the Client ID

### Local Development

```bash
npm install
npm run dev
```

App will be available at `http://localhost:3000`

### Production Deployment

#### Option 1: Vercel (Recommended)

1. Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "functions": {
    "api/*.js": {
      "runtime": "nodejs18.x"
    }
  }
}
```

2. Deploy:
```bash
npm install -g vercel
vercel
```

3. The serverless function will be automatically deployed to `/api/curseforge-proxy`

#### Option 2: Netlify

1. Create `netlify.toml`:
```toml
[functions]
  directory = "api"
```

2. Deploy:
```bash
npm install -g netlify-cli
netlify deploy --prod
```

---

## Known Issues and Solutions

### Issue 1: CurseForge API Returns 403 Forbidden

**Cause:** Invalid or missing API key

**Solution:** Use HTML scraping instead (implemented)

### Issue 2: CORS Errors When Fetching CurseForge

**Cause:** Browser blocks cross-origin requests

**Solution:** Use Vercel/Netlify serverless function (implemented)

### Issue 3: TypeScript Errors for Google Types

**Cause:** Missing type definitions for Google Identity Services

**Solution:** Created [`src/vite-env.d.ts`](src/vite-env.d.ts) with proper type declarations

### Issue 4: Rate Limiting Concerns

**Cause:** Potential abuse of CurseForge proxy

**Solution:** Implemented rate limiting (10 req/min per IP) and caching (1 hour TTL)

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
  curseForgeUrl?: string;
  curseForgeId?: string;
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
  lastSync?: Date;
  syncSource: 'local' | 'gdrive';
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

7. **Multi-User Support**
   - Separate modpack lists per user
   - Shared modpacks
   - Collaborative tracking

8. **Advanced CurseForge Features**
   - Fetch modpack changelog
   - Show latest version updates
   - Download button for modpack files

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

2. **CORS**
   - Serverless function validates URLs
   - Only CurseForge URLs allowed

3. **Rate Limiting**
   - Prevents abuse of CurseForge proxy
   - Per-IP limits implemented

4. **Data Privacy**
   - All data stored client-side
   - No server-side data collection
   - Google Drive uses user's own account

---

## Performance Optimizations

1. **Image Caching**
   - IndexedDB stores images locally
   - Reduces external requests

2. **HTML Caching**
   - CurseForge pages cached for 1 hour
   - Reduces serverless function calls

3. **Code Splitting**
   - Vite automatically splits code
   - Faster initial load times

4. **Lazy Loading**
   - Components load on demand
   - Better perceived performance

---

## Troubleshooting

### CurseForge Scraping Not Working

**Symptoms:** "Failed to fetch modpack data" error

**Solutions:**
1. Ensure app is deployed to Vercel/Netlify
2. Check browser console for specific errors
3. Verify CurseForge URL is correct
4. Check rate limit (wait 1 minute if exceeded)
5. Try manual entry as fallback

### Google Drive Not Working

**Symptoms:** "Not authenticated" error

**Solutions:**
1. Check VITE_GOOGLE_CLIENT_ID in .env
2. Verify Client ID is correct
3. Check Google Cloud Console for authorized origins
4. Ensure popup is not blocked
5. Try disconnecting and reconnecting

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
2. Review [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for deployment details
3. Check browser console for error messages
4. Verify environment variables are set correctly

---

## Version History

### v1.0.0 (Current)
- Initial implementation with React + Vite
- CurseForge HTML scraping with rate limiting
- Simplified Google Drive integration
- Local storage + IndexedDB
- Import/Export functionality
