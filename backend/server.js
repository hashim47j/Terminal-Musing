// ─── Core & Third-party ────────────────────────────────────────────
import express           from 'express';
import cors              from 'cors';
import bodyParser        from 'body-parser';
import fs                from 'fs-extra';
import path              from 'path';
import multer            from 'multer';
import bcrypt            from 'bcrypt';
import { fileURLToPath } from 'url';
import dotenv            from 'dotenv';
dotenv.config();

// ─── API Routers ──────────────────────────────────────────────────
import commentRoutes    from './comments/routes/comments.js';
import dashboardRoutes  from './DashboardApi/dashboard.js';
import viewRoutes       from './DashboardApi/views.js';
import blogRoutes       from './blogapi/blog.js';
import visitorStatsApi  from './ipapi/visitorStats.js';

import dtapiRoutes      from './dailythougthsapi/dtapi.js';
import processRoutes    from './dailythougthsapi/processapi.js';
import manageRoutes     from './dailythougthsapi/thoughtmanageapi.js';
import likeRoutes       from './dailythougthsapi/getlikes.js';

import userviewAPI      from './ipapi/userviewapi.js';
import ipLogger         from './ipapi/motherapi.js';

// ─── Init ─────────────────────────────────────────────────────────
const app      = express();
const PORT     = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const rootDir    = path.resolve(__dirname, '..');      // project root

// ─── Middleware ───────────────────────────────────────────────────
app.use(cors());
app.use(bodyParser.json({ limit: '2mb' }));

// ─── Static folders (served by Express) ───────────────────────────
app.use('/blogs',   express.static(path.join(__dirname, 'blogs')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
fs.ensureDirSync(uploadDir);

// ─── Multer (file uploads) ────────────────────────────────────────
const storage = multer.diskStorage({
  destination:  (req, file, cb) => cb(null, uploadDir),
  filename:     (req, file, cb) => {
    const ts       = Date.now();
    const ext      = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    cb(null, `${baseName}-${ts}${ext}`);
  }
});
const upload = multer({ storage });

// ─── Simple Upload Route ──────────────────────────────────────────
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.status(200).json({ imageUrl: `/uploads/${req.file.filename}` });
});

// ─── Blog CRUD (file-based) ───────────────────────────────────────
app.post('/api/blogs', async (req, res) => {
  const blog = req.body;

  if (!blog.id || !blog.category) {
    return res.status(400).json({ message: 'Missing blog ID or category.' });
  }

  try {
    const dir  = path.join(__dirname, 'blogs', blog.category);
    await fs.ensureDir(dir);
    await fs.writeJson(path.join(dir, `${blog.id}.json`), blog, { spaces: 2 });
    res.status(200).json({ message: '✅ Blog saved successfully.' });
  } catch (err) {
    console.error('❌ Error saving blog:', err);
    res.status(500).json({ message: '❌ Failed to save blog.' });
  }
});

app.get('/api/blogs', async (req, res) => {
  const { category } = req.query;
  if (!category) return res.status(400).json({ error: 'Category required.' });

  try {
    const dir      = path.join(__dirname, 'blogs', category);
    const files    = await fs.readdir(dir);
    const previews = await Promise.all(files.map(async f => {
      const data = await fs.readJson(path.join(dir, f));
      return {
        id: data.id,
        title: data.title,
        subheading: data.subheading,
        date: data.date,
        coverImage: data.coverImage || null
      };
    }));
    res.json(previews);
  } catch (err) {
    console.error('❌ Failed to load blogs:', err);
    res.status(500).json({ error: '❌ Failed to load blog previews.' });
  }
});

// ─── Admin Login ──────────────────────────────────────────────────
const adminHashFile = path.join(__dirname, 'admin', 'adminKey.hash');

app.post('/api/admin/login', async (req, res) => {
  const { key } = req.body;
  if (!key) return res.status(400).json({ message: 'Key is required' });

  try {
    const hashed = await fs.readFile(adminHashFile, 'utf8');
    const ok     = await bcrypt.compare(key, hashed);
    res.status(ok ? 200 : 401).json({
      success: ok,
      message: ok ? 'Authentication successful' : 'Invalid key'
    });
  } catch (err) {
    console.error('❌ Admin login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ─── Global / Analytics Middlewares ───────────────────────────────
app.use('/',          userviewAPI);      // logs each visit
app.use(ipLogger);                       // extra IP logic
app.use('/api',       visitorStatsApi);  // stats JSON

// ─── Mount Modular Routers ────────────────────────────────────────
app.use('/api/comments',          commentRoutes);
app.use('/api/dashboard',         dashboardRoutes);
app.use('/api/views',             viewRoutes);
app.use('/api/blogs',             blogRoutes);

// Daily Thoughts suite
app.use('/api/dailythoughts',           dtapiRoutes);
app.use('/api/dailythoughts/process',   processRoutes);
app.use('/api/dailythoughts/manage',    manageRoutes);
app.use('/api/dailythoughts/likes',     likeRoutes);

// ─── Serve built React frontend ───────────────────────────────────
const distDir = path.join(rootDir, 'dist');
app.use(express.static(distDir));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: '🚫 Route not found' });
  }
  res.sendFile(path.join(distDir, 'index.html'));
});

// ─── Fire it up ───────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () =>
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`)
);
