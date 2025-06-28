import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === MIDDLEWARE ===
app.use(cors());
app.use(bodyParser.json());

// === POST /api/blogs ===
// Save a blog post under /blogs/:category/:id.json
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

// === GET /api/blogs?category=philosophy ===
// Return preview data of all blogs in the given category
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

// === Test Route ===
app.get('/', (req, res) => {
  res.send('✅ Blog server is running.');
});

app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
