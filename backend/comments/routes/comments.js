// backend/comments/routes/comments.js
import express from 'express';
import fs from 'fs-extra';
import path from 'path';

const router = express.Router();
const commentBaseDir = path.join(process.cwd(), 'backend', 'comments');

// === GET Comments ===
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

// === POST New Comment ===
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

// === PUT Edit Comment ===
router.put('/:category/:id/:index', async (req, res) => {
  const { category, id, index } = req.params;
  const { name, email, comment, timestamp } = req.body;

  const filePath = path.join(commentBaseDir, category, `${id}.json`);
  try {
    if (!(await fs.pathExists(filePath))) {
      return res.status(404).json({ message: 'Comment file not found.' });
    }

    const comments = await fs.readJson(filePath);
    const i = parseInt(index);

    if (i < 0 || i >= comments.length) {
      return res.status(400).json({ message: 'Invalid comment index.' });
    }

    // Update comment
    comments[i] = { name, email, comment, timestamp };
    await fs.writeJson(filePath, comments, { spaces: 2 });

    res.status(200).json({ message: '✅ Comment updated successfully.', updated: comments[i] });
  } catch (err) {
    console.error('❌ Error updating comment:', err);
    res.status(500).json({ message: 'Failed to update comment.' });
  }
});

// === DELETE Comment ===
router.delete('/:category/:id/:index', async (req, res) => {
  const { category, id, index } = req.params;

  const filePath = path.join(commentBaseDir, category, `${id}.json`);
  try {
    if (!(await fs.pathExists(filePath))) {
      return res.status(404).json({ message: 'Comment file not found.' });
    }

    const comments = await fs.readJson(filePath);
    const i = parseInt(index);

    if (i < 0 || i >= comments.length) {
      return res.status(400).json({ message: 'Invalid comment index.' });
    }

    const removed = comments.splice(i, 1);
    await fs.writeJson(filePath, comments, { spaces: 2 });

    res.status(200).json({ message: '🗑️ Comment deleted successfully.', deleted: removed[0] });
  } catch (err) {
    console.error('❌ Error deleting comment:', err);
    res.status(500).json({ message: 'Failed to delete comment.' });
  }
});

export default router;