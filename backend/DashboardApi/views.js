import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import sanitize from 'sanitize-filename';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const viewsFile = path.join(__dirname, 'views.json');

// ─── Single source of truth for categories ───
const VALID_CATEGORIES = ['philosophy', 'history', 'writings', 'lsconcern', 'tech'];

// ─── In-memory cache ───
const viewsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ─── Rate limiters ───
const createSecureRateLimit = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message,
  keyGenerator: (req) => (req.ip || '').replace(/:\d+[^:]*$/, ''),
  validate: {
    trustProxy: false,
    xForwardedForHeader: false,
    ip: false,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn('🚨 Views rate limit exceeded:', {
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
    });
    res.status(429).json(typeof message === 'string' ? { error: message } : message);
  },
});

const readLimiter  = createSecureRateLimit(15 * 60 * 1000, 500, { error: 'Too many view requests, please try again later.' });
const writeLimiter = createSecureRateLimit(15 * 60 * 1000, 200, { error: 'Too many views being recorded, please try again later.' });

// ─── Initialize views file on startup ───
const initializeViewsFile = async () => {
  try {
    await fs.ensureFile(viewsFile);
    try {
      const data = await fs.readJson(viewsFile);
      if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        await fs.writeJson(viewsFile, {}, { spaces: 2 });
        console.log('📊 Views file initialized with empty object');
      }
    } catch {
      console.warn('⚠️ Invalid JSON in views file, reinitializing...');
      await fs.writeJson(viewsFile, {}, { spaces: 2 });
    }
  } catch (error) {
    console.error('❌ Failed to initialize views file:', error);
    throw error;
  }
};

await initializeViewsFile();

// ─── Validate category only ───
const validateCategory = (category) => {
  if (!category || typeof category !== 'string') return false;
  return VALID_CATEGORIES.includes(category.toLowerCase().trim());
};

// ─── Validate category + blogId ───
const validateAndSanitizeParams = (category, blogId) => {
  if (!category || !blogId) {
    return { valid: false, error: 'Missing category or blogId' };
  }

  if (typeof category !== 'string' || typeof blogId !== 'string') {
    return { valid: false, error: 'Invalid parameter types' };
  }

  const sanitizedCategory = category.toLowerCase().trim();
  const sanitizedBlogId = sanitize(blogId.toString()).replace(/[^a-zA-Z0-9\-_]/g, '');

  if (!VALID_CATEGORIES.includes(sanitizedCategory)) {
    return {
      valid: false,
      error: `Invalid category. Valid categories: ${VALID_CATEGORIES.join(', ')}`,
    };
  }

  if (!sanitizedBlogId || sanitizedBlogId.length === 0) {
    return { valid: false, error: 'Invalid or unsafe blog ID' };
  }

  return { valid: true, category: sanitizedCategory, blogId: sanitizedBlogId };
};

// ─── Cache helpers ───
const getCachedViews = (blogId) => {
  const cached = viewsCache.get(blogId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.count;
  viewsCache.delete(blogId);
  return null;
};

const setCachedViews = (blogId, count) => {
  viewsCache.set(blogId, { count, timestamp: Date.now() });

  if (viewsCache.size > 500) {
    const oldest = [...viewsCache.entries()]
      .sort(([, a], [, b]) => a.timestamp - b.timestamp)
      .slice(0, 100);
    oldest.forEach(([key]) => viewsCache.delete(key));
  }
};

// ─── Safe read ───
const readViewsData = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const data = await fs.readJson(viewsFile);
      return typeof data === 'object' && !Array.isArray(data) ? data : {};
    } catch {
      if (i === retries - 1) return {};
      await new Promise(r => setTimeout(r, 100 * (i + 1)));
    }
  }
  return {};
};

// ─── Safe write ───
const writeViewsData = async (data, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      await fs.writeJson(viewsFile, data, { spaces: 2 });
      return true;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 100 * (i + 1)));
    }
  }
};

// ─────────────────────────────────────────
// POST /api/views/:category/:blogId
// ─────────────────────────────────────────
router.post('/:category/:blogId', writeLimiter, async (req, res) => {
  const startTime = Date.now();
  const { category: rawCategory, blogId: rawBlogId } = req.params;

  try {
    const validation = validateAndSanitizeParams(rawCategory, rawBlogId);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    const { category, blogId } = validation;
    const views = await readViewsData();

    if (!views[blogId]) {
      views[blogId] = {
        count: 1,
        category,
        firstViewed: new Date().toISOString(),
        lastViewed: new Date().toISOString(),
      };
    } else {
      views[blogId].count += 1;
      views[blogId].lastViewed = new Date().toISOString();
      views[blogId].category = category;
    }

    await writeViewsData(views);
    setCachedViews(blogId, views[blogId].count);

    console.log(`✅ View recorded: ${category}/${blogId} (count: ${views[blogId].count}, ${Date.now() - startTime}ms)`);
    return res.status(200).json({
      message: '✅ View recorded successfully',
      count: views[blogId].count,
      category,
      blogId,
    });

  } catch (error) {
    console.error(`❌ Failed to record view [${rawCategory}/${rawBlogId}]:`, error.message);
    return res.status(500).json({ error: 'Failed to record view' });
  }
});

// ─────────────────────────────────────────
// GET /api/views/:category/:blogId
// ─────────────────────────────────────────
router.get('/:category/:blogId', readLimiter, async (req, res) => {
  const startTime = Date.now();
  const { category: rawCategory, blogId: rawBlogId } = req.params;

  try {
    const validation = validateAndSanitizeParams(rawCategory, rawBlogId);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    const { category, blogId } = validation;

    const cachedCount = getCachedViews(blogId);
    if (cachedCount !== null) {
      return res.status(200).json({ views: cachedCount, category, blogId, cached: true });
    }

    const views = await readViewsData();
    const viewData = views[blogId];
    const count = viewData?.count || 0;

    setCachedViews(blogId, count);

    console.log(`✅ View count fetched: ${category}/${blogId} (${count} views, ${Date.now() - startTime}ms)`);
    return res.status(200).json({
      views: count,
      category,
      blogId,
      firstViewed: viewData?.firstViewed || null,
      lastViewed: viewData?.lastViewed || null,
      cached: false,
    });

  } catch (error) {
    console.error(`❌ Failed to read view count [${rawCategory}/${rawBlogId}]:`, error.message);
    return res.status(500).json({ error: 'Failed to read view data' });
  }
});

// ─────────────────────────────────────────
// GET /api/views/:category
// ─────────────────────────────────────────
router.get('/:category', readLimiter, async (req, res) => {
  const startTime = Date.now();
  const { category: rawCategory } = req.params;

  try {
    const category = rawCategory.toLowerCase().trim();

    if (!validateCategory(category)) {
      return res.status(400).json({
        error: `Invalid category. Valid categories: ${VALID_CATEGORIES.join(', ')}`,
      });
    }

    const views = await readViewsData();

    const categoryViews = Object.entries(views)
      .filter(([, data]) => data.category === category)
      .reduce((acc, [blogId, data]) => {
        acc[blogId] = {
          count: data.count,
          firstViewed: data.firstViewed,
          lastViewed: data.lastViewed,
        };
        return acc;
      }, {});

    const totalViews = Object.values(categoryViews).reduce((sum, d) => sum + d.count, 0);

    console.log(`✅ Category views fetched: ${category} (${Object.keys(categoryViews).length} blogs, ${totalViews} total, ${Date.now() - startTime}ms)`);
    return res.status(200).json({
      category,
      blogs: categoryViews,
      blogCount: Object.keys(categoryViews).length,
      totalViews,
    });

  } catch (error) {
    console.error(`❌ Failed to read category views [${rawCategory}]:`, error.message);
    return res.status(500).json({ error: 'Failed to read category view data' });
  }
});

// ─────────────────────────────────────────
// GET /api/views
// ─────────────────────────────────────────
router.get('/', readLimiter, async (req, res) => {
  const startTime = Date.now();

  try {
    const views = await readViewsData();

    const stats = {
      totalBlogs: Object.keys(views).length,
      totalViews: Object.values(views).reduce((sum, d) => sum + d.count, 0),
      categoryCounts: {},
      topBlogs: [],
    };

    for (const category of VALID_CATEGORIES) {
      const categoryBlogs = Object.entries(views).filter(([, d]) => d.category === category);
      stats.categoryCounts[category] = {
        blogCount: categoryBlogs.length,
        totalViews: categoryBlogs.reduce((sum, [, d]) => sum + d.count, 0),
      };
    }

    stats.topBlogs = Object.entries(views)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 10)
      .map(([blogId, data]) => ({
        blogId,
        category: data.category,
        views: data.count,
        firstViewed: data.firstViewed,
        lastViewed: data.lastViewed,
      }));

    console.log(`✅ Global view stats fetched (${stats.totalBlogs} blogs, ${stats.totalViews} total views, ${Date.now() - startTime}ms)`);
    return res.status(200).json({
      stats,
      cacheSize: viewsCache.size,
      validCategories: VALID_CATEGORIES,
    });

  } catch (error) {
    console.error('❌ Failed to read global view stats:', error.message);
    return res.status(500).json({ error: 'Failed to read view statistics' });
  }
});

// ─────────────────────────────────────────
// GET /api/views/health
// ─────────────────────────────────────────
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    cache: { size: viewsCache.size, ttl: CACHE_TTL },
    validCategories: VALID_CATEGORIES,
    rateLimit: { readMax: 500, writeMax: 200, windowMs: 15 * 60 * 1000 },
  });
});

export default router;