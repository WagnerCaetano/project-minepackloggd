import { CurseForgeSearchResult, CurseForgeCacheEntry } from '../types';

const CACHE_PREFIX = 'cf-cache:';
const CACHE_TTL = 86_400_000;
const RATE_LIMIT_PREFIX = 'cf-ratelimit:';
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW = 60_000;

function cleanExpiredCache(): void {
  const now = Date.now();
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) {
      try {
        const entry: CurseForgeCacheEntry = JSON.parse(localStorage.getItem(key)!);
        if (now - entry.timestamp > CACHE_TTL) {
          localStorage.removeItem(key);
        }
      } catch {
        localStorage.removeItem(key);
      }
    }
  }
}

function getCachedResults(query: string): CurseForgeSearchResult[] | null {
  const key = `${CACHE_PREFIX}${query.toLowerCase().trim()}`;
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    const entry: CurseForgeCacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.results;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

function setCachedResults(query: string, results: CurseForgeSearchResult[]): void {
  const key = `${CACHE_PREFIX}${query.toLowerCase().trim()}`;
  const entry: CurseForgeCacheEntry = {
    query: query.toLowerCase().trim(),
    results,
    timestamp: Date.now(),
  };
  localStorage.setItem(key, JSON.stringify(entry));
}

function checkRateLimit(): boolean {
  const key = RATE_LIMIT_PREFIX + 'timestamps';
  const now = Date.now();
  let timestamps: number[] = [];

  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      timestamps = JSON.parse(raw).filter((t: number) => now - t < RATE_LIMIT_WINDOW);
    }
  } catch {
    timestamps = [];
  }

  if (timestamps.length >= RATE_LIMIT_MAX) {
    return false;
  }

  timestamps.push(now);
  localStorage.setItem(key, JSON.stringify(timestamps));
  return true;
}

async function fetchFromApi(query: string): Promise<CurseForgeSearchResult[]> {
  const response = await fetch(`/api/curseforge?search=${encodeURIComponent(query)}`);

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(data.error || `API returned ${response.status}`);
  }

  const data = await response.json();
  return data.results;
}

async function searchModpacks(query: string): Promise<CurseForgeSearchResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const cached = getCachedResults(query);
  if (cached) return cached;

  if (!checkRateLimit()) {
    throw new Error('Rate limit reached. Please wait a minute before searching again.');
  }

  const results = await fetchFromApi(query);
  setCachedResults(query, results);
  return results;
}

cleanExpiredCache();

export const curseforgeService = {
  searchModpacks,
};
