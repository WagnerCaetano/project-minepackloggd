// Vercel serverless function for CurseForge HTML proxy with rate limiting and caching

// In-memory rate limiting (resets on each function deployment)
const rateLimit = new Map();
const cache = new Map();

const RATE_LIMIT = 10; // 10 requests per minute per IP
const RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds
const CACHE_TTL = 3600000; // 1 hour in milliseconds

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  // Validate URL is from CurseForge
  try {
    const urlObj = new URL(url);
    if (!urlObj.hostname.includes('curseforge.com')) {
      return res.status(400).json({ error: 'Only CurseForge URLs are allowed' });
    }
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  // Get client IP
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.headers['x-real-ip'] || 'unknown';
  const now = Date.now();

  // Rate limiting
  const userLimit = rateLimit.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };

  if (now > userLimit.resetTime) {
    userLimit.count = 0;
    userLimit.resetTime = now + RATE_LIMIT_WINDOW;
  }

  if (userLimit.count >= RATE_LIMIT) {
    const retryAfter = Math.ceil((userLimit.resetTime - now) / 1000);
    res.setHeader('Retry-After', retryAfter.toString());
    return res.status(429).json({ 
      error: 'Too many requests',
      retryAfter: `${retryAfter} seconds`
    });
  }

  userLimit.count++;
  rateLimit.set(ip, userLimit);

  // Check cache
  const cached = cache.get(url);
  if (cached && cached.expiry > now) {
    console.log(`Cache hit for URL: ${url}`);
    return res.status(200).json({ html: cached.html, cached: true });
  }

  try {
    console.log(`Fetching CurseForge URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      console.error(`CurseForge returned status: ${response.status}`);
      return res.status(response.status).json({ 
        error: `Failed to fetch from CurseForge: ${response.statusText}` 
      });
    }

    const html = await response.text();

    // Cache the result
    cache.set(url, { html, expiry: now + CACHE_TTL });

    console.log(`Successfully fetched and cached URL: ${url}`);
    return res.status(200).json({ html, cached: false });

  } catch (error) {
    console.error('Error fetching CurseForge page:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch modpack data. Please try again.' 
    });
  }
}
