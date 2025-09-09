// ─────────────── CORE & THIRD-PARTY ───────────────
import express           from 'express';
import cors              from 'cors';
import bodyParser        from 'body-parser';
import fs                from 'fs-extra';
import path              from 'path';
import multer            from 'multer';
import bcrypt            from 'bcrypt';
import session           from 'express-session';
import { fileURLToPath } from 'url';
import dotenv            from 'dotenv';
dotenv.config();

// ─────────────── ENHANCED API ROUTERS ─────────────
import blogRoutes       from './blogapi/blog.js';              // ✅ Enhanced unified blog API
import commentRoutes    from './comments/routes/comments.js';   // ✅ Enhanced with replies
import viewRoutes       from './DashboardApi/views.js';        // ✅ Enhanced with stats
import dashboardRoutes  from './DashboardApi/dashboard.js';
import visitorStatsApi  from './ipapi/visitorStats.js';

// ✅ Daily-Thoughts routes (folder really is "dailythougthsapi")
import dtapiRoutes      from './dailythougthsapi/dtapi.js';
import processRoutes    from './dailythougthsapi/processapi.js';
import manageRoutes     from './dailythougthsapi/thoughtmanageapi.js';
import likeRoutes       from './dailythougthsapi/getlikes.js';

import userviewAPI      from './ipapi/userviewapi.js';
import ipLogger         from './ipapi/motherapi.js';
import getApprovedRoutes from './dailythougthsapi/getapproved.js';

// ─────────────── INIT ───────────────
const app  = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const rootDir    = path.resolve(__dirname, '..');

// ✅ CRITICAL FIX: Set trust proxy FIRST, before any middleware
app.set('trust proxy', 1);

// ─────────────── MIDDLEWARE ───────────────
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// ✅ ADD SESSION MIDDLEWARE
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-secret-in-production-terminal-musing',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  },
  proxy: true // ✅ CRITICAL: Trust proxy for sessions
}));

// ✅ ADMIN AUTHENTICATION MIDDLEWARE
const requireAdminAuth = (req, res, next) => {
  const isAuthenticated = req.session?.adminAuthenticated || false;
  
  console.log('🛡️ Admin auth check for', req.path, '- Authenticated:', isAuthenticated);
  
  if (!isAuthenticated) {
    console.log('❌ Unauthorized admin access attempt');
    
    // If it's an API request, return JSON
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required. Please login first.' 
      });
    }
    
    // For web requests, redirect to login
    return res.redirect('/admin/login');
  }
  
  console.log('✅ Admin authenticated, allowing access');
  next();
};

// ✅ ADD DEBUG LOGGING MIDDLEWARE
app.use((req, res, next) => {
  const contentLength = req.headers['content-length'] || 'unknown';
  console.log(`📨 ${req.method} ${req.url} - Content-Length: ${contentLength} bytes`);
  
  // Log parsed body size after body-parser processes it
  if (req.body && Object.keys(req.body).length > 0) {
    const bodyStr = JSON.stringify(req.body);
    console.log(`📦 Parsed body size: ${Buffer.byteLength(bodyStr, 'utf8')} bytes`);
    console.log(`📋 Body keys: ${Object.keys(req.body).join(', ')}`);
  }
  next();
});

// ─────────────── STATIC FOLDERS ───────────────
app.use('/blogs',   express.static(path.join(__dirname, 'blogs')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ensure uploads/ exists
const uploadDir = path.join(__dirname, 'uploads');
fs.ensureDirSync(uploadDir);

// ─────────────── MULTER FOR IMAGES ───────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ts   = Date.now();
    const ext  = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    cb(null, `${base}-${ts}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024,     // 10MB file size
    fieldSize: 10 * 1024 * 1024,    // 10MB field size (TEXT FIELDS!)
    fieldNameSize: 1000,             // Field name length
    fields: 100,                     // Number of non-file fields
    parts: 100                       // Total parts (fields + files)
  }
});

// ✅ MOVE ERROR HANDLER AFTER MULTER SETUP
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large (max 10MB)' });
    }
    if (error.code === 'LIMIT_FIELD_VALUE') {
      return res.status(400).json({ error: 'Field value too large (max 10MB)' });
    }
    return res.status(400).json({ error: `Upload error: ${error.message}` });
  }
  next(error);
});

// ─────────────── /api/upload ───────────────
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.status(200).json({ imageUrl: `/uploads/${req.file.filename}` });
});

// ─────────────── ADMIN AUTHENTICATION ROUTES ───────────────
const adminHashPath = path.join(__dirname, 'admin', 'adminKey.hash');

app.post('/api/admin/login', async (req, res) => {
  const { key } = req.body;
  
  // Validate input
  if (!key) {
    return res.status(400).json({ 
      success: false,
      message: 'Authentication key is required' 
    });
  }
  
  try {
    // Check if admin key file exists
    if (!fs.existsSync(adminHashPath)) {
      console.error('❌ Admin key file not found at:', adminHashPath);
      return res.status(500).json({ 
        success: false,
        message: 'Admin authentication not configured. Please contact administrator.' 
      });
    }
    
    // Read the stored hash
    const storedHash = await fs.readFile(adminHashPath, 'utf8');
    const cleanHash = storedHash.trim(); // Remove any whitespace/newlines
    
    // Compare the provided key with the stored hash
    const isMatch = await bcrypt.compare(key, cleanHash);
    
    if (isMatch) {
      // ✅ SET SESSION UPON SUCCESSFUL LOGIN
      req.session.adminAuthenticated = true;
      req.session.adminLoginTime = new Date().toISOString();
      
      console.log('✅ Admin login successful - session created');
      res.status(200).json({
        success: true,
        message: 'Authentication successful'
      });
    } else {
      console.log('❌ Admin login failed - invalid key');
      res.status(401).json({
        success: false,
        message: 'Invalid authentication key'
      });
    }
    
  } catch (err) {
    console.error('❌ Admin login error:', err.message);
    
    // Check if it's a file read error
    if (err.code === 'ENOENT') {
      return res.status(500).json({ 
        success: false,
        message: 'Admin key file not found. Please run key generation.' 
      });
    }
    
    // Generic error for security
    res.status(500).json({ 
      success: false,
      message: 'Internal server error during authentication' 
    });
  }
});

// ✅ ADD ADMIN LOGOUT ROUTE
app.post('/api/admin/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('❌ Session destroy error:', err);
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    console.log('✅ Admin logged out successfully');
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// ✅ ADD AUTH CHECK ENDPOINT
app.get('/api/admin/check-auth', (req, res) => {
  const isAuthenticated = req.session?.adminAuthenticated || false;
  res.json({ 
    authenticated: isAuthenticated,
    loginTime: req.session?.adminLoginTime || null 
  });
});

// ─────────────── PROTECTED ADMIN ROUTES ───────────────
// Protect all admin pages (except login)
app.use('/admin', (req, res, next) => {
  // Allow access to login page without authentication
  if (req.path === '/login' || req.path === '/login/') {
    return next();
  }
  // All other admin pages require authentication
  requireAdminAuth(req, res, next);
});

// ─────────────── ✅ ENHANCED API ROUTES ───────────────
// These now support:
// - Unified blog routing (/api/blogs/category/id)  
// - Threaded comments with replies
// - Enhanced view tracking with statistics
// - Rate limiting and input validation (✅ Fixed X-Forwarded-For error)
// - Category-based theming support

app.use('/api/blogs',      blogRoutes);      // ✅ Unified + robust
app.use('/api/comments',   commentRoutes);   // ✅ Threaded replies + validation
app.use('/api/views',      viewRoutes);      // ✅ Enhanced stats + caching

// ─────────────── PROTECTED API ROUTES ───────────────
// Protect admin-only API routes
app.use('/api/dashboard',                requireAdminAuth, dashboardRoutes);

// ✅ FIXED: Consistent daily thoughts API paths
app.use('/api/dailythoughts',            dtapiRoutes);
app.use('/api/dailythoughts/process',    requireAdminAuth, processRoutes);
app.use('/api/dailythoughts/manage',     requireAdminAuth, manageRoutes);
app.use('/api/dailythoughts/likes',      likeRoutes);
app.use('/api/dailythoughts/approved',   getApprovedRoutes); 

// ─────────────── GLOBAL / VISITOR TRACKING ───────
app.use('/',    userviewAPI);
app.use(ipLogger);
app.use('/api', visitorStatsApi);

// ✅ MOVED TO END - FRONTEND SPA ───────────────
app.use(express.static(path.join(rootDir, 'dist')));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: '🚫 Route not found' });
  }
  res.sendFile(path.join(rootDir, 'dist', 'index.html'));
});

// ─────────────── START SERVER ───────────────
app.listen(PORT, '0.0.0.0', () =>
  console.log(`✅ Server running at http://0.0.0.0:${PORT}`)
);
