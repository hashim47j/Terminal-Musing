// /backend/DashboardApi/views.js

import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const viewsFile = path.join(__dirname, 'views.json');

// 🛡️ Ensure views.json exists
fs.ensureFileSync(viewsFile);
try {
  const data = fs.readJsonSync(viewsFile);
  if (typeof data !== 'object' || data === null) {
    fs.writeJsonSync(viewsFile, {});
  }
} catch {
  fs.writeJsonSync(viewsFile, {});
}

// 🚀 POST /api/views/:category/:blogId - Increment view count
router.post('/:category/:blogId', async (req, res) => {
  const { category, blogId } = req.params;

  if (!category || !blogId) {
    return res.status(400).json({ error: 'Missing category or blogId' });
  }

  try {
    const views = await fs.readJson(viewsFile).catch(() => ({}));

    // Add or update view data
    if (!views[blogId]) {
      views[blogId] = { count: 1, category };
    } else {
      views[blogId].count += 1;
    }

    await fs.writeJson(viewsFile, views, { spaces: 2 });
    res.status(200).json({ message: '✅ View recorded' });
  } catch (err) {
    console.error('❌ Failed to record view:', err);
    res.status(500).json({ error: 'Failed to write view data' });
  }
});

// 👁️ GET /api/views/:category/:blogId - Get view count for one blog
router.get('/:category/:blogId', async (req, res) => {
  const { blogId } = req.params;

  try {
    const views = await fs.readJson(viewsFile);
    const count = views[blogId]?.count || 0;
    res.status(200).json({ views: count });
  } catch (err) {
    console.error('❌ Failed to read view data:', err);
    res.status(500).json({ error: 'Failed to read view data' });
  }
});

export default router;