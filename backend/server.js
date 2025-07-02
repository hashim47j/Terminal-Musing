import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs-extra';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import commentRoutes from './comments/routes/comments.js';

const app = express();
const PORT = 5000;

// Convert ES module paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === MIDDLEWARE ===
app.use(cors());
app.use(bodyParser.json({ limit: '2mb' })); // Limit to prevent abuse

// === STATIC FILES ===
app.use('/blogs', express.static(path.join(__dirname, 'blogs')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/comments', commentRoutes);

// === IMAGE UPLOAD SETUP ===
const uploadDir = path.join(__dirname, 'uploads');
fs.ensureDirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    cb(null, `${baseName}-${timestamp}${ext}`);
  },
});

const upload = multer({ storage });

// === ROUTES ===

// ✅ Upload image
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({ imageUrl });
});

// ✅ Save blog post
app.post('/api/blogs', async (req, res) => {
  try {
    const blogData = req.body;

    if (!blogData.id || !blogData.category) {
      return res.status(400).json({ message: 'Missing blog ID or category.' });
    }

    const blogDir = path.join(__dirname, 'blogs', blogData.category);
    await fs.ensureDir(blogDir);

    const filePath = path.join(blogDir, `${blogData.id}.json`);
    await fs.writeJson(filePath, blogData, { spaces: 2 });

    res.status(200).json({ message: '✅ Blog saved successfully.' });
  } catch (error) {
    console.error('❌ Error saving blog:', error);
    res.status(500).json({ message: '❌ Failed to save blog.' });
  }
});

// ✅ Get all blog previews by category
app.get('/api/blogs', async (req, res) => {
  const category = req.query.category;
  if (!category) {
    return res.status(400).json({ error: 'Category is required in query.' });
  }

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

// ✅ Root test route
app.get('/', (req, res) => {
  res.send('✅ Terminal Musing blog backend is running.');
});

// ✅ Fallback route (optional)
app.use((req, res) => {
  res.status(404).json({ error: '🚫 Route not found' });
});

// === START SERVER ===
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running at http://0.0.0.0:${PORT}`);
});
