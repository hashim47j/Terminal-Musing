// /backend/ipapi/visitorStats.js
import express from 'express';
import fs from 'fs-extra';
import path from 'path';

const router = express.Router();

const ipLogPath = path.join(process.cwd(), 'data', 'ips', 'visitors.json');

router.get('/visitorstats', async (req, res) => {
  try {
    const data = await fs.readJson(ipLogPath);
    if (!Array.isArray(data)) {
      return res.status(500).json({ error: 'Invalid visitor log format' });
    }

    const totalVisits = data.length;

    const uniqueIPs = new Set(data.map(v => v.ip)).size;

    const osCounts = {};
    const browserCounts = {};

    data.forEach(v => {
      if (v.os) {
        osCounts[v.os] = (osCounts[v.os] || 0) + 1;
      }
      if (v.browser) {
        browserCounts[v.browser] = (browserCounts[v.browser] || 0) + 1;
      }
    });

    return res.json({
      totalVisits,
      uniqueIPs,
      osCounts,
      browserCounts,
    });
  } catch (err) {
    console.error('❌ Failed to read visitor stats:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
