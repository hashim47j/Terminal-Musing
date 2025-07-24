import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = path.join(__dirname, '..');
const approvedPath = path.join(baseDir, 'data', 'approved');
const pendingPath = path.join(baseDir, 'data', 'pending');
const likesDir = path.join(baseDir, 'data', 'likes');

fs.ensureDirSync(approvedPath);
fs.ensureDirSync(pendingPath);
fs.ensureDirSync(likesDir);

// ✅ GET all approved thoughts
router.get('/approved', async (req, res) => {
  try {
    const files = await fs.readdir(approvedPath);
    const thoughts = [];

    for (const file of files) {
      const data = await fs.readJson(path.join(approvedPath, file));
      thoughts.push(data);
    }

    thoughts.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.status(200).json(thoughts);
  } catch (err) {
    console.error('❌ Error fetching approved thoughts:', err);
    res.status(500).json({ message: 'Failed to fetch approved thoughts.' });
  }
});

// ✅ PUT - Edit a thought
router.put('/edit/:id', async (req, res) => {
  const { id } = req.params;
  const { name, contact, content, type } = req.body;

  if (!content || !type || !['short', 'long'].includes(type)) {
    return res.status(400).json({ message: 'Missing or invalid fields.' });
  }

  const folders = [approvedPath, pendingPath];
  try {
    for (const dir of folders) {
      const filePath = path.join(dir, `${id}.json`);
      if (await fs.pathExists(filePath)) {
        const data = await fs.readJson(filePath);
        const updated = {
          ...data,
          name: name || data.name,
          contact: contact || data.contact,
          content,
          type,
          date: new Date().toISOString(),
        };
        await fs.writeJson(filePath, updated, { spaces: 2 });
        return res.status(200).json({ message: '✅ Thought updated.' });
      }
    }

    res.status(404).json({ message: 'Thought not found.' });
  } catch (err) {
    console.error('❌ Error updating thought:', err);
    res.status(500).json({ message: 'Failed to update thought.' });
  }
});

// ✅ DELETE - Delete a thought
router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;
  const folders = [approvedPath, pendingPath];

  try {
    for (const dir of folders) {
      const filePath = path.join(dir, `${id}.json`);
      if (await fs.pathExists(filePath)) {
        await fs.remove(filePath);
        return res.status(200).json({ message: '🗑️ Thought deleted.' });
      }
    }

    res.status(404).json({ message: 'Thought not found.' });
  } catch (err) {
    console.error('❌ Error deleting thought:', err);
    res.status(500).json({ message: 'Failed to delete thought.' });
  }
});

// ✅ GET all pending thoughts
router.get('/pending', async (req, res) => {
  try {
    const files = await fs.readdir(pendingPath);
    const thoughts = [];

    for (const file of files) {
      const data = await fs.readJson(path.join(pendingPath, file));
      thoughts.push(data);
    }

    thoughts.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.status(200).json(thoughts);
  } catch (err) {
    console.error('❌ Error fetching pending thoughts:', err);
    res.status(500).json({ message: 'Failed to fetch pending thoughts.' });
  }
});

// ✅ POST - Like a thought (increments only)
router.post('/like/:id', async (req, res) => {
  const { id } = req.params;
  const likePath = path.join(likesDir, `${id}.json`);

  try {
    let data = { count: 0 };

    if (await fs.pathExists(likePath)) {
      data = await fs.readJson(likePath);
    }

    data.count = (data.count || 0) + 1;

    await fs.writeJson(likePath, data, { spaces: 2 });

    res.status(200).json({ count: data.count, liked: true });
  } catch (error) {
    console.error('❌ Error toggling like:', error);
    res.status(500).json({ message: 'Failed to process like.' });
  }
});

export default router;
