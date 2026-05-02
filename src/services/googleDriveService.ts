import { AppData } from '../types';

const GOOGLE_API_BASE = 'https://www.googleapis.com/drive/v3';
const OAUTH2_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const OAUTH2_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const FILE_NAME = 'modpack-tracker-data.json';

// Store for OAuth2 access token
let accessToken: string | null = null;
let tokenClient: any = null;

// TypeScript types for Google Identity Services
interface GoogleTokenClient {
  requestAccessToken: () => void;
}

interface GoogleAccountsOAuth2 {
  initTokenClient: (config: {
    client_id: string;
    scope: string;
    callback: (response: { access_token?: string; error?: string }) => void;
  }) => GoogleTokenClient;
}

interface GoogleAccounts {
  accounts: {
    oauth2: GoogleAccountsOAuth2;
  };
}

declare global {
  interface Window {
    google: GoogleAccounts;
  }
}

// Load Google Identity Services script
const loadGoogleIdentityScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!OAUTH2_CLIENT_ID) {
      console.warn('Google Client ID not configured');
      resolve();
      return;
    }

    // Check if script is already loaded
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.body.appendChild(script);
  });
};

// Initialize Google Identity Services
export const initGoogleIdentity = async (): Promise<void> => {
  try {
    await loadGoogleIdentityScript();
    
    if (!window.google?.accounts?.oauth2) {
      console.error('Google Identity Services not available');
      return;
    }

    // Initialize token client
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: OAUTH2_CLIENT_ID,
      scope: OAUTH2_SCOPE,
      callback: (response: { access_token?: string; error?: string }) => {
        if (response.access_token) {
          setAccessToken(response.access_token);
        } else if (response.error === 'popup_closed_by_user') {
          // User closed popup, ignore
        } else {
          console.error('Google auth error:', response);
        }
      },
    });
  } catch (error) {
    console.error('Error initializing Google Identity Services:', error);
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return accessToken !== null;
};

// Get current access token
export const getAccessToken = (): string | null => {
  return accessToken;
};

// Set access token
export const setAccessToken = (token: string): void => {
  accessToken = token;
  sessionStorage.setItem('google_access_token', token);
};

// Clear access token (logout)
export const clearAccessToken = (): void => {
  accessToken = null;
  sessionStorage.removeItem('google_access_token');
};

// Request access token (one-click auth)
export const requestAccessToken = (): void => {
  if (!tokenClient) {
    console.error('Google token client not initialized');
    return;
  }
  tokenClient.requestAccessToken();
};

// Find existing data file in Drive
const findDataFile = async (): Promise<string | null> => {
  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  try {
    const response = await fetch(
      `${GOOGLE_API_BASE}/files?q=name='${FILE_NAME}'&spaces=appDataFolder`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();
    
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
    
    return null;
  } catch (error) {
    console.error('Error finding data file:', error);
    throw error;
  }
};

// Save data to Google Drive
export const saveToDrive = async (appData: AppData): Promise<void> => {
  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  try {
    const fileId = await findDataFile();
    const json = JSON.stringify(appData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });

    if (fileId) {
      // Update existing file
      await fetch(
        `${GOOGLE_API_BASE}/files/${fileId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: json,
        }
      );
    } else {
      // Create new file in appDataFolder
      const metadata = {
        name: FILE_NAME,
        parents: ['appDataFolder'],
      };

      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formData.append('file', blob);

      await fetch(
        `${GOOGLE_API_BASE}/files?uploadType=multipart`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );
    }
  } catch (error) {
    console.error('Error saving to Drive:', error);
    throw error;
  }
};

// Load data from Google Drive
export const loadFromDrive = async (): Promise<AppData | null> => {
  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  try {
    const fileId = await findDataFile();
    
    if (!fileId) {
      return null;
    }

    const response = await fetch(
      `${GOOGLE_API_BASE}/files/${fileId}?alt=media`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to load data from Drive');
    }

    const data = await response.json();
    
    // Convert date strings back to Date objects
    if (data.modpacks) {
      data.modpacks = data.modpacks.map((m: any) => ({
        ...m,
        createdAt: new Date(m.createdAt),
        updatedAt: new Date(m.updatedAt),
      }));
    }
    if (data.lastSync) {
      data.lastSync = new Date(data.lastSync);
    }
    
    return data;
  } catch (error) {
    console.error('Error loading from Drive:', error);
    throw error;
  }
};

export const googleDriveService = {
  isAuthenticated,
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  initGoogleIdentity,
  requestAccessToken,
  saveToDrive,
  loadFromDrive,
};
