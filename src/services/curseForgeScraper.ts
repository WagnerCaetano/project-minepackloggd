// Parse CurseForge HTML to extract modpack data
export const parseCurseForgeHTML = (html: string): { name: string; description: string; imageUrl: string; versions: string[] } => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Extract name - try multiple sources
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

  // Extract image URL
  const imageUrl = 
    doc.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
    doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content') ||
    '';

  // Try to extract versions from the page
  const versions: string[] = [];
  
  // Look for version information in various places
  const versionElements = doc.querySelectorAll('[class*="version"], [class*="file-version"], [data-game-version]');
  versionElements.forEach(el => {
    const version = el.textContent?.trim();
    if (version && !versions.includes(version)) {
      versions.push(version);
    }
  });

  // If no versions found, look in file list
  if (versions.length === 0) {
    const fileRows = doc.querySelectorAll('tr[class*="file-row"], div[class*="file-item"]');
    fileRows.forEach(row => {
      const versionEl = row.querySelector('[class*="game-version"], [data-game-version]');
      const version = versionEl?.textContent?.trim();
      if (version && !versions.includes(version)) {
        versions.push(version);
      }
    });
  }

  return {
    name,
    description,
    imageUrl,
    versions: versions.slice(0, 10), // Limit to first 10 versions
  };
};

// Fetch modpack data via Vercel serverless function
export const fetchModpackFromURL = async (url: string): Promise<{
  name: string;
  description: string;
  imageUrl: string;
  versions: string[];
  error?: string;
}> => {
  try {
    // Try Vercel serverless function first (for production)
    let apiUrl = '/api/curseforge-proxy';
    
    // For local development, use a CORS proxy as fallback
    if (import.meta.env.DEV) {
      // Using cors-anywhere or similar public CORS proxy for development
      // Note: This is a temporary solution for local development
      // In production, deploy the Vercel serverless function
      apiUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    }

    const response = await fetch(apiUrl);

    if (!response.ok) {
      if (response.status === 429) {
        return {
          name: '',
          description: '',
          imageUrl: '',
          versions: [],
          error: 'Too many requests. Please wait a moment before trying again.',
        };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let html: string;
    
    if (import.meta.env.DEV) {
      // Direct HTML response from CORS proxy
      html = await response.text();
    } else {
      // JSON response from Vercel proxy
      const data = await response.json();
      
      if (!data.html) {
        return {
          name: '',
          description: '',
          imageUrl: '',
          versions: [],
          error: 'Failed to fetch modpack data. Please try again.',
        };
      }
      html = data.html;
    }

    const parsed = parseCurseForgeHTML(html);
    return parsed;
  } catch (error) {
    console.error('Error fetching modpack from URL:', error);
    return {
      name: '',
      description: '',
      imageUrl: '',
      versions: [],
      error: 'Failed to fetch modpack data. Please try again or enter details manually.',
    };
  }
};

// Parse CurseForge URL to extract slug
export const parseCurseForgeUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    // Expected format: /minecraft/modpacks/[slug]
    if (pathParts.length >= 3 && pathParts[0] === 'minecraft' && pathParts[1] === 'modpacks') {
      return pathParts[2];
    }
    
    return null;
  } catch {
    return null;
  }
};
