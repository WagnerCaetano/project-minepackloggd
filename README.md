# Minecraft Modpack Tracker

A web application for tracking Minecraft modpacks with local browser storage.

## Features

- **Modpack Management**: Add, edit, delete, and track the status of Minecraft modpacks
- **Status Tracking**: Mark modpacks as "Not Played", "In Progress", or "Completed"
- **Local Storage**: All data is automatically saved to your browser's localStorage
- **Responsive Design**: Works on desktop and mobile devices
- **Privacy First**: No external services required, all data stays in your browser

## Getting Started

### Prerequisites

- Node.js 18+ and npm

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
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

## Usage

### Adding a Modpack

1. Click the "+ Add Modpack" button
2. Fill in the required fields:
   - **Name**: The modpack name
   - **Version**: The modpack version (e.g., 1.20.1)
3. Optionally add:
   - **Description**: A brief description of the modpack
   - **Image URL**: A URL to the modpack's image
   - **Status**: Initial status (Not Played, In Progress, Completed)
4. Click "Add Modpack"

### Managing Modpacks

- **Edit**: Click the "Edit" button on any modpack card to modify its details
- **Delete**: Click the "Delete" button (with confirmation) to remove a modpack
- **Change Status**: Use the dropdown to change the status (Not Played, In Progress, Completed)

### Data Storage

All data is automatically saved to your browser's localStorage. Your modpacks will persist between sessions as long as you don't clear your browser data.

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS
- **State Management**: React Context API
- **Storage**: localStorage

## Project Structure

```
src/
├── components/          # React components
│   ├── ModpackCard/    # Individual modpack display
│   ├── ModpackForm/    # Add/edit form
│   └── ModpackList/    # Grid of modpacks
├── contexts/           # React context providers
├── services/           # Storage services
├── types/              # TypeScript type definitions
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Data Model

### Modpack

```typescript
interface Modpack {
  id: string;
  name: string;
  version: string;
  description: string;
  imageUrl: string;
  status: 'not-played' | 'in-progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}
```

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
