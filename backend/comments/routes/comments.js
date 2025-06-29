// backend/comments/routes/comments.js
import express from 'express';
import fs from 'fs-extra';
import path from 'path';

const router = express.Router();
const commentBaseDir = path.join(process.cwd(), 'backend', 'comments'); // ✅ Absolute path

// GET /api/comments/:category/:id
router.get('/:category/:id', async (req, res) => {
  const { category, id } = req.params;
  const filePath = path.join(commentBaseDir, category, `${id}.json`);

  try {
    if (!(await fs.pathExists(filePath))) {
      return res.status(404).json({ message: 'No comments yet.' });
    }

    const comments = await fs.readJson(filePath);
    res.json(comments);
  } catch (err) {
    console.error('❌ Error reading comments:', err);
    res.status(500).json({ message: 'Failed to load comments.' });
  }
});

// POST /api/comments/:category/:id
router.post('/:category/:id', async (req, res) => {
  const { category, id } = req.params;
  const { name, email, comment, timestamp } = req.body;

  if (!name || !email || !comment) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const commentData = { name, email, comment, timestamp };
  const commentDir = path.join(commentBaseDir, category);
  const filePath = path.join(commentDir, `${id}.json`);

  try {
    await fs.ensureDir(commentDir);

    let existing = [];
    if (await fs.pathExists(filePath)) {
      existing = await fs.readJson(filePath);
    }

    existing.push(commentData);
    await fs.writeJson(filePath, existing, { spaces: 2 });

    res.status(200).json(commentData);
  } catch (err) {
    console.error('❌ Error saving comment:', err);
    res.status(500).json({ message: 'Failed to save comment.' });
  }
});

export default router;
