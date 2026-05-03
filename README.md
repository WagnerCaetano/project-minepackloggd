# Minecraft Modpack Tracker

A web application for tracking Minecraft modpacks with local browser storage and CurseForge integration.

## Features

- **Modpack Management**: Add, edit, delete, and track the status of Minecraft modpacks
- **CurseForge Search**: Search and import modpack data directly from CurseForge API
- **Status Tracking**: Mark modpacks as "Not Played", "In Progress", or "Completed"
- **Categories**: Modpacks display categories pulled from CurseForge
- **Local Storage**: All data is automatically saved to your browser's localStorage
- **Export/Import**: Backup and restore your data as JSON files
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A [CurseForge API key](https://console.curseforge.com/) (for search functionality)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd minecraft-modpack-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:

**Terminal 1** (Frontend):
```bash
npm run dev
```

**Terminal 2** (API proxy):
```bash
# Windows
set CURSEFORGE_API_KEY=your-api-key
npm run dev:api

# Linux/macOS
CURSEFORGE_API_KEY=your-api-key npm run dev:api
```

4. Open your browser to `http://localhost:3000`

## Usage

### Adding a Modpack via CurseForge Search

1. Click the "+ Add Modpack" button
2. In the "Search CurseForge" tab, type a modpack name (e.g., "ATM10", "RLCraft")
3. Results appear after a 500ms debounce (minimum 2 characters)
4. Click a result to auto-fill name, version, description, image, and categories
5. Edit any field as needed, then click "Add Modpack"

### Adding a Modpack Manually

1. Click the "+ Add Modpack" button
2. Switch to the "Manual Entry" tab
3. Fill in the required fields:
   - **Name**: The modpack name
   - **Version**: The modpack version (e.g., 1.20.1)
4. Optionally add:
   - **Description**: A brief description of the modpack
   - **Image URL**: A URL to the modpack's image
   - **Status**: Initial status (Not Played, In Progress, Completed)
5. Click "Add Modpack"

### Managing Modpacks

- **Edit**: Click the "Edit" button on any modpack card to modify its details
- **Delete**: Click the "Delete" button (with confirmation) to remove a modpack
- **Change Status**: Use the dropdown to change the status (Not Played, In Progress, Completed)

### Exporting and Importing Data

- **Export JSON**: Click "Export JSON" to download a backup file of all your modpacks
- **Import JSON**: Click "Import JSON" to load a previously exported backup file. This replaces all current data.

### Data Storage

All data is automatically saved to your browser's localStorage. Your modpacks will persist between sessions as long as you don't clear your browser data.

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS
- **State Management**: React Context API
- **Storage**: localStorage
- **API Proxy**: Vercel Serverless Functions
- **External API**: CurseForge Core API

## Project Structure

```
src/
├── components/          # React components
│   ├── ModpackCard/    # Individual modpack display
│   ├── ModpackForm/    # Add/edit form with CurseForge search
│   └── ModpackList/    # Grid of modpacks
├── contexts/           # React context providers
├── services/           # Storage and CurseForge services
├── types/              # TypeScript type definitions
├── App.tsx             # Main app component
└── main.tsx            # Entry point
api/
└── curseforge.ts       # Vercel serverless function (CurseForge proxy)
api-dev.ts              # Local dev API proxy server
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Deploying to Vercel

1. Push the repository to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add the `CURSEFORGE_API_KEY` environment variable in Vercel dashboard (Settings > Environment Variables)
4. Deploy — the `api/curseforge.ts` serverless function is automatically detected

## Data Model

### Modpack

```typescript
interface Modpack {
  id: string;
  name: string;
  version: string;
  description: string;
  imageUrl: string;
  categories: string[];
  status: 'not-played' | 'in-progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}
```

### CurseForge Search Result

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
```

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
