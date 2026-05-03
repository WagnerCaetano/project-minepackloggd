import { createServer } from 'http';

const API_KEY = process.env.CURSEFORGE_API_KEY;
const PORT = 3001;

const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 10;
const ipRequests = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const requests = ipRequests.get(ip)?.filter((t) => now - t < RATE_LIMIT_WINDOW) || [];
  ipRequests.set(ip, requests);
  if (requests.length >= RATE_LIMIT_MAX) return true;
  requests.push(now);
  ipRequests.set(ip, requests);
  return false;
}

function extractGameVersion(latestFiles: Array<{ gameVersions?: string[] }>): string {
  const versionRegex = /^\d+\.\d+(\.\d+)?$/;
  for (const file of latestFiles) {
    if (file.gameVersions) {
      const match = file.gameVersions.find((v) => versionRegex.test(v));
      if (match) return match;
    }
  }
  return '';
}

const server = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  if (!API_KEY) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'CurseForge API key not configured. Set CURSEFORGE_API_KEY env var.' }));
    return;
  }

  const url = new URL(req.url || '/', `http://localhost:${PORT}`);
  if (url.pathname !== '/api/curseforge') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  const ip = req.socket.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    res.writeHead(429, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Too many requests. Please wait a moment.' }));
    return;
  }

  const search = url.searchParams.get('search');
  if (!search || search.trim().length < 2) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Search query must be at least 2 characters' }));
    return;
  }

  try {
    const cfUrl = `https://api.curseforge.com/v1/mods/search?gameId=432&classId=4471&searchFilter=${encodeURIComponent(search.trim())}&sortOrder=desc&pageSize=10`;

    const response = await fetch(cfUrl, {
      headers: { 'x-api-key': API_KEY, Accept: 'application/json' },
    });

    if (!response.ok) {
      console.error(`CurseForge API error: ${response.status}`);
      res.writeHead(response.status === 403 ? 401 : 502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `CurseForge API returned ${response.status}` }));
      return;
    }

    const data = await response.json();
    const results = (data.data || []).map(
      (item: {
        id: number;
        name: string;
        summary?: string;
        logo?: { thumbnailUrl?: string };
        categories?: Array<{ name: string }>;
        latestFiles?: Array<{ gameVersions?: string[] }>;
        downloadCount?: number;
      }) => ({
        id: item.id,
        name: item.name,
        summary: item.summary || '',
        imageUrl: item.logo?.thumbnailUrl || '',
        categories: (item.categories || []).map((c) => c.name),
        latestFileVersion: extractGameVersion(item.latestFiles || []),
        downloadCount: item.downloadCount || 0,
      })
    );

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ results }));
  } catch (error) {
    console.error('CurseForge proxy error:', error);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to fetch from CurseForge API' }));
  }
});

server.listen(PORT, () => {
  console.log(`[api-dev] CurseForge API proxy running on http://localhost:${PORT}`);
  console.log(`[api-dev] CURSEFORGE_API_KEY ${API_KEY ? 'is set' : 'is NOT set — set it with: set CURSEFORGE_API_KEY=your-key'}`);
});
