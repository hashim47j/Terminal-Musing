import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

/* ─────────────── Paths ─────────────── */
const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const likesDir   = path.join(__dirname, '..', 'data', 'likes');
const ipLogPath  = path.join(__dirname, '..', 'data', 'iplogs', 'visitors.json');

fs.ensureDirSync(likesDir);

/* Helper: real client IP */
const clientIP = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
  req.socket?.remoteAddress ||
  req.ip ||
  'unknown';

/* ─────────────── GET  /api/dailythoughts/likes ─────────────── */
router.get('/', async (_req, res) => {
  try {
    const files = await fs.readdir(likesDir);
    const all   = await Promise.all(
      files.map(async (f) => {
        const data = await fs.readJson(path.join(likesDir, f));
        return { id: f.replace('.json', ''), count: data.count || 0 };
      })
    );
    res.json(all);
  } catch (err) {
    console.error('❌ Failed to read likes:', err);
    res.status(500).json({ error: 'Failed to read likes' });
  }
});

/* ─────────────── POST /api/dailythoughts/likes/:id ─────────────── */
router.post('/:id', async (req, res) => {
  const thoughtId = req.params.id;
  const ip        = clientIP(req);
  const likeFile  = path.join(likesDir, `${thoughtId}.json`);

  try {
    /* 1. Ensure IP is in visitors.json */
    const visitors = (await fs.readJson(ipLogPath, { throws: false })) || {};
    if (!visitors[ip]) {
      return res.status(403).json({ message: 'IP not logged. Cannot like.' });
    }

    /* 2. Load or initialize like data safely */
    let data = await fs.readJson(likeFile, { throws: false });
    if (!data || typeof data !== 'object') data = { count: 0, ips: [] };
    if (!Array.isArray(data.ips)) data.ips = [];
    if (typeof data.count !== 'number') data.count = 0;

    /* 3. Prevent multiple likes from same IP */
    if (data.ips.includes(ip)) {
      return res.status(429).json({
        message:
          "You can't love some-thing/one more than once and forget about trying to unlove them.",
      });
    }

    /* 4. Register like */
    data.count += 1;
    data.ips.push(ip);
    await fs.writeJson(likeFile, data, { spaces: 2 });

    res.status(200).json({ count: data.count });
  } catch (err) {
    console.error('❌ Failed to register like:', err);
    res.status(500).json({ error: 'Failed to register like.' });
  }
});

export default router;
