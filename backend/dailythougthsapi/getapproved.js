// getapproved.js
import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const approvedPath = path.join(__dirname, '..', 'data', 'approved');

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

export default router;