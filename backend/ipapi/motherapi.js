import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import useragent from 'express-useragent';

const router = express.Router();
router.use(useragent.express());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ipLogDir  = path.join(__dirname, '..', 'data', 'iplogs');
const ipLogPath = path.join(ipLogDir, 'visitors.json');

// Ensure file exists on startup
await fs.ensureDir(ipLogDir);
if (!await fs.pathExists(ipLogPath)) {
  await fs.writeJson(ipLogPath, {}, { spaces: 2 });
  console.log('📊 visitors.json created');
}

// ─── Paths that should NEVER be counted as a visit ───
const IGNORED_PREFIXES = [
  '/api/',
  '/uploads/',
  '/blogs/',
];

const IGNORED_EXTENSIONS = /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|webp|map|json|txt|xml)$/i;

const shouldIgnore = (path) => {
  if (IGNORED_EXTENSIONS.test(path)) return true;
  if (IGNORED_PREFIXES.some(prefix => path.startsWith(prefix))) return true;
  return false;
};

// ─── Safe read with corruption fallback ───
const readLog = async () => {
  try {
    const data = await fs.readJson(ipLogPath);
    if (typeof data === 'object' && !Array.isArray(data)) return data;
    throw new Error('Invalid shape');
  } catch {
    console.warn('⚠️ visitors.json corrupted — resetting');
    await fs.writeJson(ipLogPath, {}, { spaces: 2 });
    return {};
  }
};

// ─── Logging middleware ───
router.use(async (req, _res, next) => {
  next(); // always call next immediately — don't block the request

  if (shouldIgnore(req.path)) return;

  try {
    // req.ip is already correctly resolved via trust proxy in server.js
    const ip = req.ip || 'unknown';
    const { browser, version, os, platform } = req.useragent;
    const ts = new Date().toISOString();

    const log = await readLog();

    if (!log[ip]) {
      log[ip] = {
        visitCount: 1,
        firstVisit: ts,
        lastVisit: ts,
        browser,
        version,
        os,
        platform,
      };
      console.log(`✅ New visitor: ${ip} [${os} / ${browser}]`);
    } else {
      log[ip].visitCount += 1;
      log[ip].lastVisit = ts;
      // update browser/os in case user switched device
      log[ip].browser = browser;
      log[ip].os = os;
    }

    await fs.writeJson(ipLogPath, log, { spaces: 2 });

  } catch (err) {
    console.error('❌ Visitor logging error:', err);
  }
});

// ─── GET /api/visitorstats (protected in server.js via verifyAdminSession) ───
router.get('/api/visitorstats', async (_req, res) => {
  try {
    const log = await readLog();
    const entries = Object.values(log);

    const osDistribution = {};
    const browserDistribution = {};
    let totalVisits = 0;

    for (const v of entries) {
      totalVisits += v.visitCount;
      osDistribution[v.os]         = (osDistribution[v.os]         || 0) + 1;
      browserDistribution[v.browser] = (browserDistribution[v.browser] || 0) + 1;
    }

    return res.json({
      uniqueIPs:           entries.length,
      totalVisits,
      osDistribution,
      browserDistribution,
    });

  } catch (err) {
    console.error('❌ Failed to fetch visitor stats:', err);
    return res.status(500).json({ error: 'Failed to fetch visitor stats' });
  }
});

export default router;