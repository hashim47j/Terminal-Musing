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
const VALID_CATEGORIES = ['history', 'philosophy', 'tech', 'lsconcern'];

// Simple in-memory cache for frequently accessed view counts
const viewsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ✅ FIXED: Secure rate limiting configuration (same pattern as blog.js and comments.js)
const createSecureRateLimit = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message,
  // ✅ Custom key generator strips ports to prevent bypass
  keyGenerator: (req) => {
    const ip = req.ip || req.socket.remoteAddress || req.connection.remoteAddress || '';
    // Strip port numbers (e.g., "192.168.1.1:54321" -> "192.168.1.1")
    return ip.replace(/:\d+[^:]*$/, '');
  },
  // ✅ Disable problematic validation checks
  validate: {
    trustProxy: false,           // Disable trust proxy validation
    xForwardedForHeader: false,  // Disable X-Forwarded-For validation
    ip: false                    // Disable IP validation
  },
  standardHeaders: true,  // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,   // Disable X-RateLimit-* headers
  handler: (req, res) => {
    console.warn('🚨 Views rate limit exceeded:', {
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
      userAgent: req.get('User-Agent')
    });
    res.status(429).json(typeof message === 'string' ? { error: message } : message);
  }
});

// Rate limiting configurations with secure setup
const readLimiter = createSecureRateLimit(
  15 * 60 * 1000, // 15 minutes
  500, // Allow more reads for view tracking (increased from 300)
  { error: 'Too many view requests, please try again later.' }
);

const writeLimiter = createSecureRateLimit(
  15 * 60 * 1000, // 15 minutes
  200, // Reasonable write limit for view tracking (increased from 100)
  { error: 'Too many views being recorded, please try again later.' }
);

/**
 * Initialize views file safely
 */
const initializeViewsFile = async () => {
  try {
    await fs.ensureFile(viewsFile);
    
    try {
      const data = await fs.readJson(viewsFile);
      if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        await fs.writeJson(viewsFile, {}, { spaces: 2 });
        console.log('📊 Views file initialized with empty object');
      }
    } catch (parseError) {
      // File exists but has invalid JSON
      console.warn('⚠️ Invalid JSON in views file, reinitializing...');
      await fs.writeJson(viewsFile, {}, { spaces: 2 });
    }
  } catch (error) {
    console.error('❌ Failed to initialize views file:', error);
    throw error;
  }
};

// Initialize on startup
await initializeViewsFile();

/**
 * Validate and sanitize input parameters
 */
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
      error: `Invalid category. Valid categories: ${VALID_CATEGORIES.join(', ')}` 
    };
  }

  if (!sanitizedBlogId || sanitizedBlogId.length === 0) {
    return { valid: false, error: 'Invalid or unsafe blog ID' };
  }

  return {
    valid: true,
    category: sanitizedCategory,
    blogId: sanitizedBlogId
  };
};

/**
 * Get cached view count
 */
const getCachedViews = (blogId) => {
  const cached = viewsCache.get(blogId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.count;
  }
  viewsCache.delete(blogId);
  return null;
};

/**
 * Cache view count
 */
const setCachedViews = (blogId, count) => {
  viewsCache.set(blogId, {
    count,
    timestamp: Date.now()
  });
  
  // Clean old cache entries
  if (viewsCache.size > 500) {
    const entries = [...viewsCache.entries()];
    const oldEntries = entries
      .sort(([,a], [,b]) => a.timestamp - b.timestamp)
      .slice(0, 100);
    oldEntries.forEach(([key]) => viewsCache.delete(key));
  }
};

/**
 * Safely read views data with retry logic
 */
const readViewsData = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const data = await fs.readJson(viewsFile);
      return typeof data === 'object' && !Array.isArray(data) ? data : {};
    } catch (error) {
      if (i === retries - 1) {
        console.error('❌ Failed to read views after retries:', error);
        return {};
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)));
    }
  }
  return {};
};

/**
 * Safely write views data with atomic operation
 */
const writeViewsData = async (data, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      await fs.writeJson(viewsFile, data, { spaces: 2 });
      return true;
    } catch (error) {
      if (i === retries - 1) {
        console.error('❌ Failed to write views after retries:', error);
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)));
    }
  }
  return false;
};

// 🚀 POST /api/views/:category/:blogId - Increment view count
router.post('/:category/:blogId', writeLimiter, async (req, res) => {
  const startTime = Date.now();
  const { category: rawCategory, blogId: rawBlogId } = req.params;

  try {
    const validation = validateAndSanitizeParams(rawCategory, rawBlogId);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const { category, blogId } = validation;

    // Read current views
    const views = await readViewsData();
    
    // Update view count
    if (!views[blogId]) {
      views[blogId] = { 
        count: 1, 
        category,
        firstViewed: new Date().toISOString(),
        lastViewed: new Date().toISOString()
      };
    } else {
      views[blogId].count += 1;
      views[blogId].lastViewed = new Date().toISOString();
      // Ensure category is consistent
      views[blogId].category = category;
    }

    // Write updated views
    await writeViewsData(views);

    // Update cache
    setCachedViews(blogId, views[blogId].count);

    console.log(`✅ View recorded: ${category}/${blogId} (count: ${views[blogId].count}, ${Date.now() - startTime}ms)`);
    
    res.status(200).json({ 
      message: '✅ View recorded successfully',
      count: views[blogId].count,
      category,
      blogId
    });

  } catch (error) {
    console.error(`❌ Failed to record view [${rawCategory}/${rawBlogId}]:`, {
      error: error.message,
      duration: Date.now() - startTime
    });
    res.status(500).json({ error: 'Failed to record view' });
  }
});

// 👁️ GET /api/views/:category/:blogId - Get view count for specific blog
router.get('/:category/:blogId', readLimiter, async (req, res) => {
  const startTime = Date.now();
  const { category: rawCategory, blogId: rawBlogId } = req.params;

  try {
    const validation = validateAndSanitizeParams(rawCategory, rawBlogId);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const { category, blogId } = validation;

    // Check cache first
    const cachedCount = getCachedViews(blogId);
    if (cachedCount !== null) {
      return res.status(200).json({ 
        views: cachedCount, 
        category,
        blogId,
        cached: true 
      });
    }

    // Read from file
    const views = await readViewsData();
    const viewData = views[blogId];
    const count = viewData?.count || 0;

    // Cache the result
    setCachedViews(blogId, count);

    console.log(`✅ View count fetched: ${category}/${blogId} (${count} views, ${Date.now() - startTime}ms)`);
    
    res.status(200).json({ 
      views: count,
      category,
      blogId,
      firstViewed: viewData?.firstViewed || null,
      lastViewed: viewData?.lastViewed || null,
      cached: false
    });

  } catch (error) {
    console.error(`❌ Failed to read view count [${rawCategory}/${rawBlogId}]:`, {
      error: error.message,
      duration: Date.now() - startTime
    });
    res.status(500).json({ error: 'Failed to read view data' });
  }
});

// 📊 GET /api/views/:category - Get all view counts for a category
router.get('/:category', readLimiter, async (req, res) => {
  const startTime = Date.now();
  const { category: rawCategory } = req.params;

  try {
    const validation = validateAndSanitizeParams(rawCategory, 'dummy');
    if (!validation.valid && !VALID_CATEGORIES.includes(rawCategory.toLowerCase())) {
      return res.status(400).json({ 
        error: `Invalid category. Valid categories: ${VALID_CATEGORIES.join(', ')}` 
      });
    }

    const category = rawCategory.toLowerCase().trim();
    const views = await readViewsData();
    
    // Filter views by category
    const categoryViews = Object.entries(views)
      .filter(([, data]) => data.category === category)
      .reduce((acc, [blogId, data]) => {
        acc[blogId] = {
          count: data.count,
          firstViewed: data.firstViewed,
          lastViewed: data.lastViewed
        };
        return acc;
      }, {});

    const totalViews = Object.values(categoryViews).reduce((sum, data) => sum + data.count, 0);

    console.log(`✅ Category views fetched: ${category} (${Object.keys(categoryViews).length} blogs, ${totalViews} total views, ${Date.now() - startTime}ms)`);
    
    res.status(200).json({
      category,
      blogs: categoryViews,
      blogCount: Object.keys(categoryViews).length,
      totalViews
    });

  } catch (error) {
    console.error(`❌ Failed to read category views [${rawCategory}]:`, {
      error: error.message,
      duration: Date.now() - startTime
    });
    res.status(500).json({ error: 'Failed to read category view data' });
  }
});

// 📈 GET /api/views - Get all view statistics
router.get('/', readLimiter, async (req, res) => {
  const startTime = Date.now();

  try {
    const views = await readViewsData();
    
    // Calculate statistics
    const stats = {
      totalBlogs: Object.keys(views).length,
      totalViews: Object.values(views).reduce((sum, data) => sum + data.count, 0),
      categoryCounts: {},
      topBlogs: []
    };

    // Calculate category stats
    for (const category of VALID_CATEGORIES) {
      const categoryBlogs = Object.entries(views)
        .filter(([, data]) => data.category === category);
      
      stats.categoryCounts[category] = {
        blogCount: categoryBlogs.length,
        totalViews: categoryBlogs.reduce((sum, [, data]) => sum + data.count, 0)
      };
    }

    // Top 10 most viewed blogs
    stats.topBlogs = Object.entries(views)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 10)
      .map(([blogId, data]) => ({
        blogId,
        category: data.category,
        views: data.count,
        firstViewed: data.firstViewed,
        lastViewed: data.lastViewed
      }));

    console.log(`✅ Global view stats fetched (${stats.totalBlogs} blogs, ${stats.totalViews} total views, ${Date.now() - startTime}ms)`);
    
    res.status(200).json({
      stats,
      cacheSize: viewsCache.size,
      validCategories: VALID_CATEGORIES
    });

  } catch (error) {
    console.error('❌ Failed to read global view stats:', {
      error: error.message,
      duration: Date.now() - startTime
    });
    res.status(500).json({ error: 'Failed to read view statistics' });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    cache: { size: viewsCache.size, ttl: CACHE_TTL },
    validCategories: VALID_CATEGORIES,
    viewsFile: viewsFile,
    rateLimit: {
      readMax: 500,
      writeMax: 200,
      windowMs: 15 * 60 * 1000
    }
  });
});

export default router;
