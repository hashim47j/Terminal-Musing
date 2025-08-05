import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import useragent from 'express-useragent';

const router = express.Router();
router.use(useragent.express());

/* ─────────────── Paths ─────────────── */
const ipLogDir  = path.join(process.cwd(), 'backend', 'data', 'iplogs');
const ipLogPath = path.join(ipLogDir, 'visitors.json');

/* ensure dir + file */
fs.ensureDirSync(ipLogDir);
if (!fs.existsSync(ipLogPath)) fs.writeJsonSync(ipLogPath, {}, { spaces: 2 });

/* paths to skip */
const ignored = [
  '/api/visitorstats',
  '/api/dashboard/stats',
  '/api/dailythoughts/manage/pending',
];

/* ─────────────── Logging middleware ─────────────── */
router.use(async (req, _res, next) => {
  try {
    if (ignored.includes(req.path)) return next();

    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      req.ip ||
      'unknown';

    const { browser, version, os, platform } = req.useragent;
    const ts = new Date().toISOString();

    /* load existing log (object) */
    let log = {};
    try {
      log = await fs.readJson(ipLogPath);
      if (typeof log !== 'object' || Array.isArray(log)) throw new Error();
    } catch {
      console.warn('⚠️ visitors.json corrupted – reset');
      log = {};
    }

    if (!log[ip]) {
      log[ip] = {
        visits: 1,
        firstVisit: ts,
        lastVisit: ts,
        browser,
        version,
        os,
        platform,
      };
      console.log(`✅ New IP logged: ${ip}`);
    } else {
      log[ip].visits += 1;
      log[ip].lastVisit = ts;
    }

    await fs.writeJson(ipLogPath, log, { spaces: 2 });
  } catch (err) {
    console.error('❌ IP logging error:', err);
  }

  next();
});

/* ─────────────── Visitor-stats endpoint ───────────────
   GET /api/visitorstats
   ------------------------------------------------------ */
router.get('/api/visitorstats', async (_req, res) => {
  try {
    const log = await fs.readJson(ipLogPath);
    const ips = Object.keys(log);

    const osDistribution = {};
    const browserDistribution = {};

    ips.forEach((ip) => {
      const v = log[ip];
      osDistribution[v.os]       = (osDistribution[v.os]       || 0) + 1;
      browserDistribution[v.browser] = (browserDistribution[v.browser] || 0) + 1;
    });

    res.json({
      totalVisits: ips.reduce((sum, ip) => sum + log[ip].visits, 0),
      uniqueIps: ips.length,
      osDistribution,
      browserDistribution,
    });
  } catch (err) {
    console.error('❌ Failed to fetch visitor stats:', err);
    res.status(500).json({ error: 'Failed to fetch visitor stats' });
  }
});

export default router;
