// /home/hash/Documents/Terminal-Musing/backend/dailythougthsapi/processapi.js

import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pendingPath = path.join(__dirname, '..', 'data', 'pending');
const approvedPath = path.join(__dirname, '..', 'data', 'approved');

fs.ensureDirSync(pendingPath);
fs.ensureDirSync(approvedPath);

// ─────────────────────────────────────────────
// Test route
router.get('/test', (req, res) => {
  res.status(200).json({ message: '✅ Process API is working!' });
});

// Submit a thought
router.post('/submit', async (req, res) => {
  const { name, contact, content, type } = req.body;

  if (!name || !content || !type || !['short', 'long'].includes(type)) {
    return res.status(400).json({ message: 'Missing or invalid fields.' });
  }

  try {
    const id = uuidv4();
    const date = new Date().toISOString();
    const thought = { id, name, contact: contact || '', content, type, date, likes: 0 };

    const filePath = path.join(pendingPath, `${id}.json`);
    await fs.writeJson(filePath, thought, { spaces: 2 });

    res.status(200).json({ message: '✅ Thought submitted for review.', id });
  } catch (err) {
    console.error('❌ Error submitting thought:', err);
    res.status(500).json({ message: 'Failed to submit thought.' });
  }
});

// Get all approved thoughts
router.get('/getapproved', async (req, res) => {
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

// Approve a thought
router.post('/approve/:id', async (req, res) => {
  const { id } = req.params;
  const source = path.join(pendingPath, `${id}.json`);
  const target = path.join(approvedPath, `${id}.json`);

  try {
    if (!(await fs.pathExists(source))) {
      return res.status(404).json({ message: 'Thought not found in pending list.' });
    }

    const data = await fs.readJson(source);
    await fs.writeJson(target, data, { spaces: 2 });
    await fs.remove(source);

    res.status(200).json({ message: '✅ Thought approved.', id });
  } catch (err) {
    console.error('❌ Error approving thought:', err);
    res.status(500).json({ message: 'Failed to approve thought.' });
  }
});

export default router;