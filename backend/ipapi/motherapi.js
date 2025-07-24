import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import useragent from 'express-useragent';

const router = express.Router();
router.use(useragent.express());

const ipLogDir = path.join(process.cwd(), 'data', 'ips');
const ipLogPath = path.join(ipLogDir, 'visitors.json');

// Ensure directory and file exist
await fs.ensureDir(ipLogDir);
if (!(await fs.pathExists(ipLogPath))) {
  await fs.writeJson(ipLogPath, [], { spaces: 2 });
}

// List of paths to ignore for logging
const ignoredPaths = [
  '/api/visitorstats',
  '/api/dashboard/stats',
  '/api/dailythoughts/manage/pending',
];

// ──────────────────── Logging Middleware ────────────────────
router.use(async (req, res, next) => {
  try {
    if (ignoredPaths.includes(req.path)) return next();

    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;
    const { browser, version, os, platform } = req.useragent;
    const timestamp = new Date().toISOString();

    const newVisit = { ip, timestamp, url: req.originalUrl, browser, version, os, platform };

    let visits = [];
    try {
      const raw = await fs.readFile(ipLogPath, 'utf8');
      visits = JSON.parse(raw);
      if (!Array.isArray(visits)) throw new Error('Invalid visitors.json format');
    } catch (err) {
      console.warn('⚠️ visitors.json unreadable, resetting...');
      visits = [];
    }

    const alreadyLogged = visits.some(v => v.ip === ip);
    if (!alreadyLogged) {
      visits.push(newVisit);
      await fs.writeJson(ipLogPath, visits, { spaces: 2 });
      console.log(`✅ New visit logged: ${ip}`);
    } else {
      console.log(`ℹ️ IP ${ip} already logged, skipping`);
    }
  } catch (err) {
    console.error('❌ Logging middleware error:', err);
  }

  next();
});

// ──────────────────── GET Visitor Stats ────────────────────
router.get('/api/visitorstats', async (req, res) => {
  try {
    const visits = await fs.readJson(ipLogPath);

    const totalVisits = visits.length;
    const uniqueIps = new Set(visits.map(v => v.ip)).size;

    const osDistribution = {};
    const browserDistribution = {};

    visits.forEach(v => {
      osDistribution[v.os] = (osDistribution[v.os] || 0) + 1;
      browserDistribution[v.browser] = (browserDistribution[v.browser] || 0) + 1;
    });

    res.status(200).json({
      totalVisits,
      uniqueIps,
      osDistribution,
      browserDistribution,
    });
  } catch (err) {
    console.error('❌ Failed to fetch visitor stats:', err);
    res.status(500).json({ error: 'Failed to fetch visitor stats' });
  }
});

export default router;
