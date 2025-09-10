import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to stored hashed key
const ADMIN_KEY_PATH = path.join(__dirname, '../admin/adminKey.hash');

// Middleware function
export const adminAuth = async (req, res, next) => {
  try {
    // Get admin key from request header or body
    const clientKey = req.headers['x-admin-key'] || req.body.adminKey;
    if (!clientKey) {
      return res.status(401).json({ message: 'Admin key required' });
    }

    // Read hashed key
    if (!fs.existsSync(ADMIN_KEY_PATH)) {
      return res.status(500).json({ message: 'Admin key not found on server' });
    }

    const storedHash = fs.readFileSync(ADMIN_KEY_PATH, 'utf8');

    // Compare provided key with stored hash
    const isMatch = await bcrypt.compare(clientKey, storedHash);
    if (!isMatch) {
      return res.status(403).json({ message: 'Invalid admin key' });
    }

    // If valid → grant access
    next();
  } catch (error) {
    console.error('Admin auth error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};
