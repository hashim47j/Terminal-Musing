// /backend/DashboardApi/dashboard.js

import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Required to resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set blogs directory
const blogsDir = path.join(__dirname, '../blogs');
const viewsFile = path.join(__dirname, 'views.json');

// List of categories
const categories = ['philosophy', 'history', 'writings', 'legal', 'tech'];

// Helper: Count all blog files in a category
const countBlogsInCategory = async (category) => {
  const dir = path.join(blogsDir, category);
  try {
    const files = await fs.readdir(dir);
    return files.filter(file => file.endsWith('.json')).length;
  } catch {
    return 0;
  }
};

// Helper: Load views JSON
const loadViews = async () => {
  try {
    const data = await fs.readFile(viewsFile, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {}; // Return empty object if file doesn't exist
  }
};

// === ROUTE: /api/dashboard/stats ===
router.get('/stats', async (req, res) => {
  try {
    const views = await loadViews();

    // Total Posts and Per Category
    let totalPosts = 0;
    const postsByCategory = {};

    for (const cat of categories) {
      const count = await countBlogsInCategory(cat);
      postsByCategory[cat] = count;
      totalPosts += count;
    }

    // Views per category and overall
    let totalViews = 0;
    const viewsByCategory = {};
    const viewsPerPost = {};

    for (const [postId, data] of Object.entries(views)) {
      const { count, category } = data;
      totalViews += count;

      // Group by category
      if (!viewsByCategory[category]) {
        viewsByCategory[category] = 0;
      }
      viewsByCategory[category] += count;

      // Views per post
      viewsPerPost[postId] = count;
    }

    return res.json({
      totalPosts,
      postsByCategory,
      totalViews,
      viewsByCategory,
      viewsPerPost
    });
  } catch (err) {
    console.error('❌ Error fetching dashboard stats:', err);
    res.status(500).json({ error: '❌ Failed to fetch dashboard stats' });
  }
});

export default router;