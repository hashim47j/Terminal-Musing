import express from 'express';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import sanitize from 'sanitize-filename';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BLOGS_ROOT = path.join(__dirname, '..', 'blogs');

// ✅ UPDATED: Configuration constants - Added 'writings' category
const VALID_CATEGORIES = ['history', 'philosophy', 'tech', 'lsconcern', 'writings'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB max blog size
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// ✅ FIXED: Secure rate limiting configuration
const createSecureRateLimit = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message,
  keyGenerator: (req) => {
    const ip = req.ip || req.socket.remoteAddress || req.connection.remoteAddress || '';
    return ip.replace(/:\d+[^:]*$/, '');
  },
  validate: {
    trustProxy: false,
    xForwardedForHeader: false,
    ip: false
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn('🚨 Rate limit exceeded:', {
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
      userAgent: req.get('User-Agent')
    });
    res.status(429).json(typeof message === 'string' ? { error: message } : message);
  }
});

// Rate limiting for different operations
const readRateLimit = createSecureRateLimit(
  15 * 60 * 1000, // 15 minutes
  200, // Max 200 requests per window (increased for better UX)
  { error: 'Too many read requests, please try again later.' }
);

const writeRateLimit = createSecureRateLimit(
  15 * 60 * 1000, // 15 minutes
  20, // Max 20 writes per window (increased slightly)
  { error: 'Too many write requests, please try again later.' }
);

// Simple in-memory cache
const cache = new Map();

/**
 * Normalize and validate category parameter
 */
const normalizeCategory = (category) => {
  if (!category || typeof category !== 'string') return null;
  const normalized = category.toLowerCase().trim();
  return VALID_CATEGORIES.includes(normalized) ? normalized : null;
};

/**
 * Sanitize and validate blog ID
 */
const sanitizeId = (id) => {
  if (!id || typeof id !== 'string') return null;
  const sanitized = sanitize(id.toString()).replace(/[^a-zA-Z0-9\-_]/g, '');
  return sanitized.length > 0 && sanitized.length <= 100 ? sanitized : null;
};

/**
 * ✅ NEW: Sanitize and validate author name
 */
const sanitizeAuthor = (author) => {
  if (!author || typeof author !== 'string') return 'Terminal Musing'; // Default author
  const sanitized = author.trim().replace(/[<>]/g, ''); // Remove dangerous characters
  return sanitized.length > 0 && sanitized.length <= 100 ? sanitized : 'Terminal Musing';
};

/**
 * Async helper to safely check if directory exists
 */
const dirExists = async (dirPath) => {
  try {
    const stats = await fs.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
};

/**
 * Async helper to safely read and parse JSON file
 */
const readJsonFile = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    
    if (stats.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds limit');
    }
    
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error('FILE_NOT_FOUND');
    }
    if (error.name === 'SyntaxError') {
      throw new Error('INVALID_JSON');
    }
    throw error;
  }
};

/**
 * Cache management
 */
const getCacheKey = (category, id = null) => id ? `${category}:${id}` : `${category}:list`;

const getFromCache = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
  if (cache.size > 1000) {
    const oldest = [...cache.entries()]
      .sort(([,a], [,b]) => a.timestamp - b.timestamp)
      .slice(0, 100);
    oldest.forEach(([key]) => cache.delete(key));
  }
};

// ===== POST: Save blog (Enhanced with Author Field) =====
router.post('/', writeRateLimit, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const blog = req.body;

    // ✅ UPDATED: Validate required fields (author is now optional)
    if (!blog?.id || !blog?.category || !blog?.title || !blog?.content) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['id', 'category', 'title', 'content'] 
      });
    }

    // Validate and sanitize inputs
    const category = normalizeCategory(blog.category);
    const sanitizedId = sanitizeId(blog.id);
    const sanitizedAuthor = sanitizeAuthor(blog.author); // ✅ NEW: Sanitize author

    if (!category) {
      return res.status(400).json({ 
        error: 'Invalid category', 
        validCategories: VALID_CATEGORIES 
      });
    }

    if (!sanitizedId) {
      return res.status(400).json({ error: 'Invalid or unsafe blog ID' });
    }

    // Additional validation
    if (typeof blog.title !== 'string' || blog.title.length > 200) {
      return res.status(400).json({ error: 'Title must be a string under 200 characters' });
    }

    // ✅ NEW: Validate author field
    if (blog.author && (typeof blog.author !== 'string' || blog.author.length > 100)) {
      return res.status(400).json({ error: 'Author name must be a string under 100 characters' });
    }

    // ✅ FIXED: Simple content validation
    if (!blog.content || (!Array.isArray(blog.content) && typeof blog.content !== 'string')) {
      return res.status(400).json({ error: 'Invalid content format' });
    }

    // Ensure directory exists
    const categoryDir = path.join(BLOGS_ROOT, category);
    if (!(await dirExists(categoryDir))) {
      await fs.mkdir(categoryDir, { recursive: true });
    }

    // Save blog with normalized data
    const blogPath = path.join(categoryDir, `${sanitizedId}.json`);
    const blogData = {
      ...blog,
      id: sanitizedId,
      category,
      author: sanitizedAuthor, // ✅ NEW: Include sanitized author
      updatedAt: new Date().toISOString(),
      version: blog.version ? blog.version + 1 : 1
    };

    await fs.writeFile(blogPath, JSON.stringify(blogData, null, 2));

    // Clear related cache
    cache.delete(getCacheKey(category));
    cache.delete(getCacheKey(category, sanitizedId));
    cache.delete('all:blogs');

    console.log(`✅ Blog saved successfully: ${category}/${sanitizedId} by ${sanitizedAuthor} (${Date.now() - startTime}ms)`);
    
    res.status(201).json({ 
      message: 'Blog saved successfully', 
      id: sanitizedId,
      category,
      author: sanitizedAuthor, // ✅ NEW: Return author in response
      path: blogPath 
    });
  } catch (error) {
    console.error('❌ Failed to save blog:', {
      error: error.message,
      stack: error.stack,
      duration: Date.now() - startTime
    });
    res.status(500).json({ error: 'Failed to save blog' });
  }
});

// ===== GET: Individual blog post =====
router.get('/:category/:id', readRateLimit, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const category = normalizeCategory(req.params.category);
    const id = sanitizeId(req.params.id);

    if (!category) {
      return res.status(400).json({ 
        error: 'Invalid category',
        validCategories: VALID_CATEGORIES 
      });
    }

    if (!id) {
      return res.status(400).json({ error: 'Invalid blog ID' });
    }

    // Check cache first
    const cacheKey = getCacheKey(category, id);
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }

    const categoryDir = path.join(BLOGS_ROOT, category);
    const blogPath = path.join(categoryDir, `${id}.json`);

    const blog = await readJsonFile(blogPath);
    blog.category = category;
    blog.id = id;
    
    // ✅ NEW: Ensure author field exists with fallback
    if (!blog.author) {
      blog.author = 'Terminal Musing';
    }

    // Cache the result
    setCache(cacheKey, blog);

    console.log(`✅ Blog fetched: ${category}/${id} by ${blog.author} (${Date.now() - startTime}ms)`);
    res.json(blog);

  } catch (error) {
    if (error.message === 'FILE_NOT_FOUND') {
      return res.status(404).json({ 
        error: 'Blog post not found',
        category: req.params.category,
        id: req.params.id 
      });
    }
    
    if (error.message === 'INVALID_JSON') {
      return res.status(500).json({ 
        error: 'Blog file corrupted or contains invalid JSON' 
      });
    }

    console.error(`❌ Failed to fetch blog [${req.params.category}/${req.params.id}]:`, {
      error: error.message,
      duration: Date.now() - startTime
    });
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
});

// ===== GET: All blogs in category (FIXED - Always returns array) =====
router.get('/:category', readRateLimit, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const category = normalizeCategory(req.params.category);
    const { limit = 50, offset = 0, sortBy = 'date', order = 'desc' } = req.query;

    if (!category) {
      return res.status(400).json({ 
        error: 'Invalid category',
        validCategories: VALID_CATEGORIES 
      });
    }

    // Validate pagination params
    const limitNum = Math.min(parseInt(limit) || 50, 100);
    const offsetNum = Math.max(parseInt(offset) || 0, 0);

    // Check cache
    const cacheKey = getCacheKey(category);
    let blogs = getFromCache(cacheKey);

    if (!blogs) {
      const categoryDir = path.join(BLOGS_ROOT, category);
      
      if (!(await dirExists(categoryDir))) {
        return res.json([]);
      }

      const files = await fs.readdir(categoryDir);
      blogs = [];

      const jsonFiles = files.filter(f => f.endsWith('.json'));
      const processFile = async (fileName) => {
        try {
          const blogPath = path.join(categoryDir, fileName);
          const blog = await readJsonFile(blogPath);
          blog.category = category;
          blog.id = path.basename(fileName, '.json');
          
          // ✅ NEW: Ensure author field exists with fallback
          if (!blog.author) {
            blog.author = 'Terminal Musing';
          }
          
          return blog;
        } catch (error) {
          console.warn(`⚠️ Skipping corrupted blog file: ${fileName}`, error.message);
          return null;
        }
      };

      const results = await Promise.allSettled(
        jsonFiles.map(processFile)
      );
      
      blogs = results
        .filter(r => r.status === 'fulfilled' && r.value)
        .map(r => r.value);

      setCache(cacheKey, blogs);
    }

    // Sort blogs
    const validSortFields = ['date', 'title', 'updatedAt', 'author']; // ✅ NEW: Added author to sort fields
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'date';
    
    blogs.sort((a, b) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      const comparison = order === 'asc' ? 
        aVal.localeCompare && bVal.localeCompare ? aVal.localeCompare(bVal) : 0 :
        bVal.localeCompare && aVal.localeCompare ? bVal.localeCompare(aVal) : 0;
      return comparison;
    });

    // Apply pagination
    const total = blogs.length;
    const paginatedBlogs = blogs.slice(offsetNum, offsetNum + limitNum);

    console.log(`✅ Category blogs fetched: ${category} (${total} total, ${Date.now() - startTime}ms)`);
    
    res.json(paginatedBlogs);
    
  } catch (error) {
    console.error(`❌ Failed to fetch category blogs [${req.params.category}]:`, {
      error: error.message,
      duration: Date.now() - startTime
    });
    res.status(500).json([]);
  }
});

// ===== GET: All blogs from all categories (FIXED - Always returns array) =====
router.get('/', readRateLimit, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { limit = 50, offset = 0, categories, search, author } = req.query; // ✅ NEW: Added author filter
    
    // Check cache
    const cacheKey = 'all:blogs';
    let allBlogs = getFromCache(cacheKey);

    if (!allBlogs) {
      allBlogs = [];
      
      const processCategory = async (category) => {
        const categoryDir = path.join(BLOGS_ROOT, category);
        const blogs = [];
        
        if (await dirExists(categoryDir)) {
          const files = await fs.readdir(categoryDir);
          const jsonFiles = files.filter(f => f.endsWith('.json'));
          
          for (const fileName of jsonFiles) {
            try {
              const blogPath = path.join(categoryDir, fileName);
              const blog = await readJsonFile(blogPath);
              blog.category = category;
              blog.id = path.basename(fileName, '.json');
              
              // ✅ NEW: Ensure author field exists with fallback
              if (!blog.author) {
                blog.author = 'Terminal Musing';
              }
              
              blogs.push(blog);
            } catch (error) {
              console.warn(`⚠️ Skipping corrupted blog: ${category}/${fileName}`, error.message);
            }
          }
        }
        return blogs;
      };

      const results = await Promise.allSettled(
        VALID_CATEGORIES.map(processCategory)
      );
      
      allBlogs = results
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => r.value);

      setCache(cacheKey, allBlogs);
    }

    // Apply filters
    let filteredBlogs = allBlogs;

    // Category filter
    if (categories) {
      const categoryList = categories.split(',').map(c => c.trim().toLowerCase());
      filteredBlogs = filteredBlogs.filter(blog => 
        categoryList.includes(blog.category)
      );
    }

    // ✅ NEW: Author filter
    if (author) {
      const authorFilter = author.toLowerCase();
      filteredBlogs = filteredBlogs.filter(blog =>
        blog.author?.toLowerCase().includes(authorFilter)
      );
    }

    // Search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredBlogs = filteredBlogs.filter(blog =>
        blog.title?.toLowerCase().includes(searchTerm) ||
        blog.content?.toLowerCase().includes(searchTerm) ||
        blog.author?.toLowerCase().includes(searchTerm) // ✅ NEW: Search by author too
      );
    }

    // Sort by date (newest first)
    filteredBlogs.sort((a, b) => {
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);
      return dateB - dateA;
    });

    // Apply pagination
    const limitNum = Math.min(parseInt(limit) || 50, 100);
    const offsetNum = Math.max(parseInt(offset) || 0, 0);
    const total = filteredBlogs.length;
    const paginatedBlogs = filteredBlogs.slice(offsetNum, offsetNum + limitNum);

    console.log(`✅ All blogs fetched (${total} total, ${Date.now() - startTime}ms)`);
    
    res.json(paginatedBlogs);
    
  } catch (error) {
    console.error('❌ Failed to fetch all blogs:', {
      error: error.message,
      duration: Date.now() - startTime
    });
    res.status(500).json([]);
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    cache: { size: cache.size, maxAge: CACHE_DURATION },
    categories: VALID_CATEGORIES,
    rateLimit: {
      readMax: 200,
      writeMax: 20,
      windowMs: 15 * 60 * 1000
    }
  });
});

export default router;
