// /home/hash/Documents/Terminal-Musing/backend/dailythougthsapi/getlikes.js
import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const likesDir = path.join(process.cwd(), 'data', 'likes');
const ipLogPath = path.join(process.cwd(), 'data', 'iplogs', 'visitors.json');

// Ensure likes directory exists
fs.ensureDirSync(likesDir);

// Helper: Get real user IP
function getUserIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    'unknown'
  );
}

// GET: Return all likes
router.get('/likes', async (req, res) => {
  try {
    const files = await fs.readdir(likesDir);
    const likes = await Promise.all(
      files.map(async file => {
        const filePath = path.join(likesDir, file);
        const data = await fs.readJson(filePath);
        return { id: file.replace('.json', ''), count: data.count || 0 };
      })
    );
    res.json(likes);
  } catch (error) {
    console.error('Failed to read likes:', error);
    res.status(500).json({ error: 'Failed to read likes' });
  }
});

// POST: Like a thought by ID
router.post('/like/:id', async (req, res) => {
  const thoughtId = req.params.id;
  const ip = getUserIP(req);
  const likeFilePath = path.join(likesDir, `${thoughtId}.json`);

  try {
    // Check visitors.json
    const visitorLog = (await fs.readJson(ipLogPath, { throws: false })) || {};
    const ipEntry = visitorLog[ip];

    if (!ipEntry) {
      return res.status(403).json({ message: 'IP not logged. Cannot like.' });
    }

    // Load or create likes file
    let data = { count: 0, ips: [] };
    if (await fs.pathExists(likeFilePath)) {
      data = await fs.readJson(likeFilePath);
    }

    if (data.ips.includes(ip)) {
      return res.status(429).json({
        message: "You can't love some-thing/one more than once and forget about trying to unlove them."
      });
    }

    data.count += 1;
    data.ips.push(ip);

    await fs.writeJson(likeFilePath, data, { spaces: 2 });
    res.status(200).json({ message: 'Like registered successfully.' });
  } catch (error) {
    console.error('Failed to register like:', error);
    res.status(500).json({ error: 'Failed to register like.' });
  }
});

export default router;
