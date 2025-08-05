import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

const __filename  = fileURLToPath(import.meta.url);
const __dirname   = path.dirname(__filename);

const pendingDir  = path.join(__dirname, '..', 'data', 'pending');
const approvedDir = path.join(__dirname, '..', 'data', 'approved');

fs.ensureDirSync(pendingDir);
fs.ensureDirSync(approvedDir);

/* POST /api/dailythoughts/submit  ---------------------------------- */
router.post('/submit', async (req, res) => {
  const { name, contact, content, type } = req.body;
  if (!name || !content || !['short', 'long'].includes(type)) {
    return res.status(400).json({ message: 'Missing or invalid fields.' });
  }

  try {
    const id   = uuidv4();
    const date = new Date().toISOString();
    const obj  = { id, name, contact: contact || '', content, type, date, likes: 0 };

    await fs.writeJson(path.join(pendingDir, `${id}.json`), obj, { spaces: 2 });
    res.status(200).json({ message: '✅ Thought submitted for review.', id });
  } catch (err) {
    console.error('❌ Error submitting thought:', err);
    res.status(500).json({ message: 'Failed to submit thought.' });
  }
});

/* GET /api/dailythoughts/process  ---------------------------------- */
router.get('/', async (_req, res) => {
  try {
    const files = await fs.readdir(approvedDir);
    const list  = await Promise.all(
      files.map((f) => fs.readJson(path.join(approvedDir, f)))
    );
    list.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(list);
  } catch (err) {
    console.error('❌ Error fetching approved thoughts:', err);
    res.json([]); // always return array
  }
});

/* POST /api/dailythoughts/process/approve/:id  ---------------------- */
router.post('/approve/:id', async (req, res) => {
  const { id } = req.params;
  const src = path.join(pendingDir,  `${id}.json`);
  const dst = path.join(approvedDir, `${id}.json`);

  try {
    if (!(await fs.pathExists(src))) {
      return res.status(404).json({ message: 'Thought not found in pending list.' });
    }

    await fs.move(src, dst, { overwrite: true });
    res.status(200).json({ message: '✅ Thought approved.', id });
  } catch (err) {
    console.error('❌ Error approving thought:', err);
    res.status(500).json({ message: 'Failed to approve thought.' });
  }
});

export default router;
