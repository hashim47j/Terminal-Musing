// /backend/ipapi/userviewapi.js
import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import useragent from 'express-useragent';

const router = express.Router();
router.use(useragent.express());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path: /backend/data/visits/visits.json
const visitsDir = path.join(__dirname, '..', 'data', 'visits');
const visitsFile = path.join(visitsDir, 'visits.json');

// Ensure directory and file exist
fs.ensureDirSync(visitsDir);
if (!fs.existsSync(visitsFile)) {
  fs.writeJsonSync(visitsFile, []);
}

// Helper to get IP
function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

// 🔘 POST /logvisit
router.post('/logvisit', async (req, res) => {
  const ip = getClientIp(req);
  const source = req.useragent;
  const timestamp = new Date().toISOString();

  const visit = {
    ip,
    os: source.os,
    browser: source.browser,
    platform: source.platform,
    source: source.source,
    timestamp,
  };

  try {
    const current = await fs.readJson(visitsFile);
    current.push(visit);
    await fs.writeJson(visitsFile, current, { spaces: 2 });
    res.status(200).json({ message: '✅ Visit logged.' });
  } catch (err) {
    console.error('❌ Error logging visit:', err);
    res.status(500).json({ message: 'Failed to log visit.' });
  }
});

// 🔘 GET /visits (for dashboard)
router.get('/visits', async (req, res) => {
  try {
    const visits = await fs.readJson(visitsFile);
    res.status(200).json(visits);
  } catch (err) {
    console.error('❌ Error reading visits:', err);
    res.status(500).json({ message: 'Failed to fetch visits.' });
  }
});

export default router;
