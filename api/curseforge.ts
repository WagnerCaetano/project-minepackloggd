import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_KEY = process.env.CURSEFORGE_API_KEY;
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 10;

const ipRequests = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const requests = ipRequests.get(ip)?.filter((t) => now - t < RATE_LIMIT_WINDOW) || [];
  ipRequests.set(ip, requests);

  if (requests.length >= RATE_LIMIT_MAX) {
    return true;
  }

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!API_KEY) {
    return res.status(500).json({ error: 'CurseForge API key not configured' });
  }

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';

  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
  }

  const search = req.query.search as string;
  if (!search || search.trim().length < 2) {
    return res.status(400).json({ error: 'Search query must be at least 2 characters' });
  }

  try {
    const url = `https://api.curseforge.com/v1/mods/search?gameId=432&classId=4471&searchFilter=${encodeURIComponent(search.trim())}&sortOrder=desc&pageSize=10`;

    const response = await fetch(url, {
      headers: {
        'x-api-key': API_KEY,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`CurseForge API error: ${response.status}`, text);
      return res.status(response.status === 403 ? 401 : 502).json({
        error: `CurseForge API returned ${response.status}`,
      });
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

    return res.status(200).json({ results });
  } catch (error) {
    console.error('CurseForge proxy error:', error);
    return res.status(502).json({ error: 'Failed to fetch from CurseForge API' });
  }
}
