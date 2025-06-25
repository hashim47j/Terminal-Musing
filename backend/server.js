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

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// BLOG POST ROUTE
app.post('/api/blogs', async (req, res) => {
  try {
    const blogData = req.body;

    const blogPath = path.join(__dirname, 'blogs');
    await fs.ensureDir(blogPath);

    const filePath = path.join(blogPath, `${blogData.id}.json`);
    await fs.writeJson(filePath, blogData, { spaces: 2 });

    res.status(200).json({ message: 'Blog saved successfully.' });
  } catch (error) {
    console.error('❌ Error saving blog:', error);
    res.status(500).json({ message: 'Failed to save blog.' });
  }
});

// Test route
app.get('/', (req, res) => {
  res.send('Server is running');
});

app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
