# Minecraft Modpack Tracker

A web application for tracking Minecraft modpacks with support for Google Drive sync, local browser caching, and CurseForge integration.

## Features

- **Modpack Management**: Add, edit, delete, and track the status of Minecraft modpacks
- **Status Tracking**: Mark modpacks as "Not Played", "In Progress", or "Completed"
- **CurseForge Integration**: Automatically fetch modpack details from CurseForge URLs
- **Dual Storage Options**:
  - Local browser storage (localStorage + IndexedDB for images)
  - Google Drive sync for cloud backup
- **Import/Export**: Backup and restore your data via JSON files
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd minecraft-modpack-aggregator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env` file in the root directory (copy from `.env.example`):

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

To get a Google Client ID:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to APIs & Services > Credentials
4. Create a new OAuth 2.0 Client ID for a web application
5. Add your app's URL (e.g., `http://localhost:3000`) to Authorized JavaScript origins
6. Copy the Client ID to your `.env` file

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to `http://localhost:3000`

### CurseForge API Key

To use the CurseForge integration:
1. Go to [CurseForge Console](https://console.curseforge.com/)
2. Create an account and log in
3. Generate an API key
4. Enter the API key in the app when adding a modpack (it will be saved in your browser)

## Usage

### Adding a Modpack

1. Click the "+ Add Modpack" button
2. Choose between:
   - **CurseForge URL**: Paste a CurseForge modpack URL to automatically fetch details
   - **Manual Entry**: Enter modpack details manually
3. Fill in the required fields (name, version)
4. Optionally add a description, image URL, and set the initial status
5. Click "Add Modpack"

### Managing Modpacks

- **Edit**: Click the "Edit" button on any modpack card
- **Delete**: Click the "Delete" button (with confirmation)
- **Change Status**: Use the dropdown to change the status (Not Played, In Progress, Completed)

### Google Drive Sync

1. Click "Connect Google Drive" to authenticate
2. After authentication, use "Sync to Drive" to save your data to Google Drive
3. Use "Load from Drive" to restore data from Google Drive

### Import/Export

- **Export**: Click "Export JSON" to download a backup file
- **Import**: Click "Import JSON" to restore from a backup file

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS Modules
- **State Management**: React Context API
- **Storage**: localStorage, IndexedDB, Google Drive API
- **External APIs**: CurseForge API

## Project Structure

```
src/
├── components/          # React components
│   ├── Auth/           # Google authentication
│   ├── ModpackCard/    # Individual modpack display
│   ├── ModpackForm/    # Add/edit form
│   ├── ModpackList/    # Grid of modpacks
│   └── Sync/           # Import/export functionality
├── contexts/           # React context providers
├── services/           # API and storage services
├── types/              # TypeScript type definitions
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
