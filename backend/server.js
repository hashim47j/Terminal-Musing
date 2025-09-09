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

// ... your existing imports ...

// ─────────────── INIT ───────────────
const app  = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const rootDir    = path.resolve(__dirname, '..');

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
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
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

// ... your existing debug logging, static folders, multer setup ...

// ─────────────── ADMIN AUTHENTICATION ROUTES ───────────────
const adminHashPath = path.join(__dirname, 'admin', 'adminKey.hash');

app.post('/api/admin/login', async (req, res) => {
  // ... your existing login logic ...
});

app.post('/api/admin/logout', (req, res) => {
  // ... your existing logout logic ...
});

app.get('/api/admin/check-auth', (req, res) => {
  // ... your existing auth check logic ...
});

// ✅ PROTECT ADMIN ROUTES **BEFORE** OTHER ROUTES
// Protect all admin pages (except login)
app.use('/admin', (req, res, next) => {
  // Allow access to login page without authentication
  if (req.path === '/login' || req.path === '/login/') {
    return next();
  }
  // All other admin pages require authentication
  requireAdminAuth(req, res, next);
});

// ─────────────── PUBLIC API ROUTES ───────────────
app.use('/api/blogs',      blogRoutes);      
app.use('/api/comments',   commentRoutes);   
app.use('/api/views',      viewRoutes);      

// ─────────────── PROTECTED API ROUTES ───────────────
app.use('/api/dashboard',                requireAdminAuth, dashboardRoutes);
app.use('/api/dailythoughts',            dtapiRoutes);
app.use('/api/dailythoughts/process',    requireAdminAuth, processRoutes);
app.use('/api/dailythoughts/manage',     requireAdminAuth, manageRoutes);
app.use('/api/dailythoughts/likes',      likeRoutes);
app.use('/api/dailythoughts/approved',   getApprovedRoutes); 

// ─────────────── GLOBAL / VISITOR TRACKING ───────
app.use('/',    userviewAPI);
app.use(ipLogger);
app.use('/api', visitorStatsApi);

// ─────────────── FRONTEND SPA ───────────────
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
