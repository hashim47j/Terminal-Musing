import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs-extra';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

// API route imports
import commentRoutes from './comments/routes/comments.js';
import dashboardRoutes from './DashboardApi/dashboard.js';
import viewRoutes from './DashboardApi/views.js';
import blogRoutes from './blogapi/blog.js';
import visitorStatsApi from './ipapi/visitorStats.js';


// ✅ Daily Thoughts modular routes
import dtapiRoutes from './dailythougthsapi/dtapi.js';
import processRoutes from './dailythougthsapi/processapi.js';
import manageRoutes from './dailythougthsapi/thoughtmanageapi.js';
import likeRoutes from './dailythougthsapi/getlikes.js';

import userviewAPI from './ipapi/userviewapi.js';
import ipLogger from './ipapi/motherapi.js';

const app = express();
const PORT = 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─────────────── MIDDLEWARE ───────────────
app.use(cors());
app.use(bodyParser.json({ limit: '2mb' }));

// ─────────────── STATIC FILES ───────────────
app.use('/blogs', express.static(path.join(__dirname, 'blogs')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
fs.ensureDirSync(uploadDir);

// ─────────────── MULTER SETUP ───────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    cb(null, `${baseName}-${timestamp}${ext}`);
  },
});
const upload = multer({ storage });

// ─────────────── FILE UPLOAD ROUTE ───────────────
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const imageUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({ imageUrl });
});

// ─────────────── BLOG SAVE ROUTE ───────────────
app.post('/api/blogs', async (req, res) => {
  try {
    const blogData = req.body;
    if (!blogData.id || !blogData.category) {
      return res.status(400).json({ message: 'Missing blog ID or category.' });
    }

    const blogDir = path.join(__dirname, 'blogs', blogData.category);
    await fs.ensureDir(blogDir);

    const filePath = path.join(blogDir, `${blogData.id}.json`);
    await fs.writeJson(filePath, { ...blogData }, { spaces: 2 });

    res.status(200).json({ message: '✅ Blog saved successfully.' });
  } catch (error) {
    console.error('❌ Error saving blog:', error);
    res.status(500).json({ message: '❌ Failed to save blog.' });
  }
});

// ─────────────── BLOG GET ROUTE ───────────────
app.get('/api/blogs', async (req, res) => {
  const category = req.query.category;
  if (!category) return res.status(400).json({ error: 'Category is required in query.' });

  const dirPath = path.join(__dirname, 'blogs', category);
  try {
    const files = await fs.readdir(dirPath);
    const previews = [];

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const blog = JSON.parse(content);

      previews.push({
        id: blog.id,
        title: blog.title,
        subheading: blog.subheading,
        date: blog.date,
        coverImage: blog.coverImage || null,
      });
    }

    res.json(previews);
  } catch (error) {
    console.error('❌ Failed to read blogs:', error);
    res.status(500).json({ error: '❌ Failed to load blog previews.' });
  }
});

// ─────────────── ADMIN LOGIN ───────────────
const adminHashPath = path.join(__dirname, 'admin', 'adminKey.hash');
app.post('/api/admin/login', async (req, res) => {
  const { key } = req.body;
  if (!key) return res.status(400).json({ message: 'Key is required' });

  try {
    const hashedKey = await fs.readFile(adminHashPath, 'utf-8');
    const isMatch = await bcrypt.compare(key, hashedKey);
    if (isMatch) {
      res.status(200).json({ success: true, message: 'Authentication successful' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid key' });
    }
  } catch (err) {
    console.error('❌ Admin login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ─────────────── IP TRACKING MIDDLEWARE ───────────────
app.use('/', userviewAPI);  // Logs IP visit details
app.use(ipLogger);          // Mother API logic (for blocking/restriction/etc.)
app.use('/api', visitorStatsApi);


// ─────────────── MOUNT ROUTES ───────────────
app.use('/api/comments', commentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/views', viewRoutes);
app.use('/api/blogs', blogRoutes);

// ✅ Daily Thoughts Routes
app.use('/api/dailythoughts', dtapiRoutes);               // /submit, /get
app.use('/api/dailythoughts/process', processRoutes);     // /approved, /approve
app.use('/api/dailythoughts/manage', manageRoutes);       // /edit, /delete, /pending
app.use('/api/dailythoughts/likes', likeRoutes);          // /getlikes

// ─────────────── ROOT & 404 ───────────────
app.get('/', (req, res) => {
  res.send('✅ Terminal Musing blog backend is running.');
});

app.use((req, res) => {
  res.status(404).json({ error: '🚫 Route not found' });
});

// ─────────────── START SERVER ───────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running at http://0.0.0.0:${PORT}`);
});
