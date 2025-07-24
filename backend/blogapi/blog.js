import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BLOGS_ROOT = path.join(__dirname, '..', 'blogs');

router.post('/', async (req, res) => {
  try {
    const blog = req.body;

    if (!blog.id || !blog.category || !blog.title || !blog.content) {
      return res.status(400).json({ error: 'Missing required blog fields.' });
    }

    const categoryDir = path.join(BLOGS_ROOT, blog.category.toLowerCase());

    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    const blogPath = path.join(categoryDir, `${blog.id}.json`);
    fs.writeFileSync(blogPath, JSON.stringify(blog, null, 2));

    res.status(201).json({ message: 'Blog saved successfully', path: blogPath });
  } catch (err) {
    console.error('❌ Failed to save blog:', err);
    res.status(500).json({ error: 'Failed to save blog' });
  }
});

export default router;