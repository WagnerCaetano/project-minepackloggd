import React, { useEffect, useState } from 'react';
import { googleDriveService } from '../../services/googleDriveService';
import './GoogleAuthButton.css';

interface GoogleAuthButtonProps {
  onAuthChange: (isAuthenticated: boolean) => void;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ onAuthChange }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Google Identity Services on mount
  useEffect(() => {
    const init = async () => {
      await googleDriveService.initGoogleIdentity();
      setIsInitialized(true);

      // Check for existing token in session storage
      const existingToken = sessionStorage.getItem('google_access_token');
      if (existingToken) {
        googleDriveService.setAccessToken(existingToken);
        onAuthChange(true);
      }
    };

    init();
  }, [onAuthChange]);

  const handleAuth = () => {
    googleDriveService.requestAccessToken();
    // Token will be set via callback in initGoogleIdentity
  };

  const handleLogout = () => {
    googleDriveService.clearAccessToken();
    onAuthChange(false);
  };

  const isAuthenticated = googleDriveService.isAuthenticated();

  return (
    <button
      onClick={isAuthenticated ? handleLogout : handleAuth}
      disabled={!isInitialized}
      className={`google-auth-button ${isAuthenticated ? 'google-auth-button--authenticated' : ''}`}
    >
      {isAuthenticated ? 'Disconnect Google Drive' : 'Connect Google Drive'}
    </button>
  );
};
