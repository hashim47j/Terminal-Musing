// ─────────────── CORE & THIRD-PARTY ───────────────
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

// ─────────────── API ROUTERS (OTHER MODULES) ─────
import commentRoutes    from './comments/routes/comments.js';
import dashboardRoutes  from './DashboardApi/dashboard.js';
import viewRoutes       from './DashboardApi/views.js';
import visitorStatsApi  from './ipapi/visitorStats.js';

// ✅ Daily-Thoughts routes (folder really is “dailythougthsapi”)
import dtapiRoutes      from './dailythougthsapi/dtapi.js';
import processRoutes    from './dailythougthsapi/processapi.js';
import manageRoutes     from './dailythougthsapi/thoughtmanageapi.js';
import likeRoutes       from './dailythougthsapi/getlikes.js';

import userviewAPI      from './ipapi/userviewapi.js';
import ipLogger         from './ipapi/motherapi.js';

// ─────────────── INIT ───────────────
const app  = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const rootDir    = path.resolve(__dirname, '..');   // repo root

// ─────────────── MIDDLEWARE ───────────────
app.use(cors());
app.use(bodyParser.json({ limit: '2mb' }));

// ─────────────── STATIC FOLDERS ───────────────
app.use('/blogs',   express.static(path.join(__dirname, 'blogs')));   // raw JSON (legacy links)
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
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});


// ─────────────── /api/upload ───────────────
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.status(200).json({ imageUrl: `/uploads/${req.file.filename}` });  // relative path
});

// ─────────────── BLOG HELPERS ───────────────
const blogDir = (cat) => path.join(__dirname, 'blogs', cat);

// ─────────────── POST /api/blogs  (create) ───
app.post('/api/blogs', async (req, res) => {
  try {
    const blog = req.body;
    if (!blog.id || !blog.category) {
      return res.status(400).json({ message: 'Missing blog ID or category.' });
    }
    if (blog.coverImage) {
      blog.coverImage = blog.coverImage.replace(/^https?:\/\/[^/]+/i, ''); // ensure relative
    }

    const dir = blogDir(blog.category);
    await fs.ensureDir(dir);
    await fs.writeJson(path.join(dir, `${blog.id}.json`), blog, { spaces: 2 });

    res.status(200).json({ message: '✅ Blog saved successfully.' });
  } catch (err) {
    console.error('❌ Error saving blog:', err);
    res.status(500).json({ message: '❌ Failed to save blog.' });
  }
});

// ─────────────── GET /api/blogs  (list) ──────
app.get('/api/blogs', async (req, res) => {
  const { category } = req.query;
  if (!category) return res.status(400).json([]);         // always array

  try {
    const dir   = blogDir(category);
    const files = await fs.readdir(dir);
    const list  = await Promise.all(files.map(async f => {
      const data = await fs.readJson(path.join(dir, f));
      return {
        id:         data.id,
        title:      data.title,
        subheading: data.subheading,
        date:       data.date,
        coverImage: data.coverImage || null
      };
    }));
    res.json(list);
  } catch (err) {
    console.error('❌ Failed to load blogs:', err);
    res.json([]);                                        // never break React .map
  }
});

// ─────────────── GET /api/blogs/:cat/:id  (single) ───
app.get('/api/blogs/:category/:id', async (req, res) => {
  const { category, id } = req.params;
  try {
    const file = path.join(blogDir(category), `${id}.json`);
    const data = await fs.readJson(file);
    res.json(data);
  } catch (err) {
    console.error('❌ Blog not found:', err);
    res.status(404).json({ message: 'Blog not found' });
  }
});

// ─────────────── ADMIN LOGIN ───────────────
const adminHashPath = path.join(__dirname, 'admin', 'adminKey.hash');
app.post('/api/admin/login', async (req, res) => {
  const { key } = req.body;
  if (!key) return res.status(400).json({ message: 'Key is required' });
  try {
    const hash  = await fs.readFile(adminHashPath, 'utf8');
    const match = await bcrypt.compare(key, hash);
    res.status(match ? 200 : 401).json({
      success: match,
      message: match ? 'Authentication successful' : 'Invalid key'
    });
  } catch (err) {
    console.error('❌ Admin login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ─────────────── GLOBAL / OTHER ROUTES ───────
app.use('/',    userviewAPI);
app.use(ipLogger);
app.use('/api', visitorStatsApi);

app.use('/api/comments',          commentRoutes);
app.use('/api/dashboard',         dashboardRoutes);
app.use('/api/views',             viewRoutes);
app.use('/api/dailythoughts',           dtapiRoutes);
app.use('/api/dailythoughts/process',   processRoutes);
app.use('/api/dailythoughts/manage',    manageRoutes);
app.use('/api/dailythoughts/likes',     likeRoutes);

// ─────────────── FRONTEND ───────────────
app.use(express.static(path.join(rootDir, 'dist')));      // SPA assets

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
