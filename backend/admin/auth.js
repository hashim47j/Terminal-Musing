// backend/admin/auth.js
import express from 'express';
import fs from 'fs';
import bcrypt from 'bcrypt';

const router = express.Router();

const HASHED_KEY_PATH = './admin/adminKey.hash';

router.post('/admin/login', async (req, res) => {
  const { key } = req.body;

  if (!key) {
    return res.status(400).json({ message: 'Key is required' });
  }

  try {
    const hashedKey = fs.readFileSync(HASHED_KEY_PATH, 'utf-8');

    const isMatch = await bcrypt.compare(key, hashedKey);

    if (isMatch) {
      return res.status(200).json({ success: true, message: 'Authentication successful' });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid key' });
    }
  } catch (err) {
    console.error('Error verifying key:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
