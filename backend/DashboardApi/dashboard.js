import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const blogsDir  = path.join(__dirname, '../blogs');
const viewsFile = path.join(__dirname, 'views.json');

// ─── Must match VALID_CATEGORIES in views.js exactly ───
const CATEGORIES = ['philosophy', 'history', 'writings', 'lsconcern', 'tech'];

// ─── Count blog JSON files in a category folder ───
const countBlogsInCategory = async (category) => {
  const dir = path.join(blogsDir, category);
  try {
    const files = await fs.readdir(dir);
    return files.filter(f => f.endsWith('.json')).length;
  } catch {
    return 0;
  }
};

// ─── Load views safely ───
const loadViews = async () => {
  try {
    const data = await fs.readJson(viewsFile);
    return typeof data === 'object' && !Array.isArray(data) ? data : {};
  } catch {
    return {};
  }
};

// ─────────────────────────────────────────
// GET /api/dashboard/stats
// ─────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    // Run all category counts in parallel
    const counts = await Promise.all(CATEGORIES.map(countBlogsInCategory));

    const postsByCategory = {};
    let totalPosts = 0;

    CATEGORIES.forEach((cat, i) => {
      postsByCategory[cat] = counts[i];
      totalPosts += counts[i];
    });

    // Aggregate views
    const views = await loadViews();

    let totalViews = 0;
    const viewsByCategory = {};
    const viewsPerPost = {};

    for (const [postId, data] of Object.entries(views)) {
      const { count, category } = data;
      totalViews += count;
      viewsByCategory[category] = (viewsByCategory[category] || 0) + count;
      viewsPerPost[postId] = count;
    }

    return res.json({
      totalPosts,
      postsByCategory,
      totalViews,
      viewsByCategory,
      viewsPerPost,
    });

  } catch (err) {
    console.error('❌ Error fetching dashboard stats:', err);
    return res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;