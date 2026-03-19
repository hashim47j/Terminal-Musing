import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import sanitize from 'sanitize-filename';
import validator from 'validator';

const router = express.Router();
const commentBaseDir = path.join(process.cwd(), 'backend', 'comments');

// ── Configuration ──
const VALID_CATEGORIES = ['history', 'philosophy', 'tech', 'lsconcern'];
const MAX_COMMENT_LENGTH = 2000;
const MAX_NAME_LENGTH = 100;
const MAX_REPLY_DEPTH = 3;

// ── Rate Limiters ──
const createSecureRateLimit = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message,
  keyGenerator: (req) => {
    const ip = req.ip || req.socket.remoteAddress || req.connection.remoteAddress || '';
    return ip.replace(/:\d+[^:]*$/, '');
  },
  validate: {
    trustProxy: false,
    xForwardedForHeader: false,
    ip: false
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn('🚨 Rate limit exceeded:', {
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
      userAgent: req.get('User-Agent')
    });
    res.status(429).json(typeof message === 'string' ? { error: message } : message);
  }
});

const readLimiter     = createSecureRateLimit(15 * 60 * 1000, 200, { error: 'Too many comment requests, please try again later.' });
const writeLimiter    = createSecureRateLimit(15 * 60 * 1000, 30,  { error: 'Too many comments posted, please try again later.' });
const moderateLimiter = createSecureRateLimit(15 * 60 * 1000, 50,  { error: 'Too many moderation actions, please try again later.' });

// ── Helpers ──
const validateAndSanitizeParams = (category, id) => {
  if (!category || !id) return { valid: false, error: 'Missing category or blog ID' };

  const sanitizedCategory = category.toLowerCase().trim();
  const sanitizedId = sanitize(id.toString()).replace(/[^a-zA-Z0-9\-_]/g, '');

  if (!VALID_CATEGORIES.includes(sanitizedCategory)) {
    return { valid: false, error: `Invalid category. Valid: ${VALID_CATEGORIES.join(', ')}` };
  }
  if (!sanitizedId) return { valid: false, error: 'Invalid or unsafe blog ID' };

  return { valid: true, category: sanitizedCategory, id: sanitizedId };
};

const validateCommentData = (data) => {
  const { name, email, comment } = data;

  if (!name || !email || !comment) {
    return { valid: false, error: 'All fields (name, email, comment) are required.' };
  }
  if (typeof name !== 'string' || name.trim().length === 0 || name.length > MAX_NAME_LENGTH) {
    return { valid: false, error: `Name must be 1–${MAX_NAME_LENGTH} characters.` };
  }
  if (!validator.isEmail(email)) {
    return { valid: false, error: 'Please provide a valid email address.' };
  }
  if (typeof comment !== 'string' || comment.trim().length === 0 || comment.length > MAX_COMMENT_LENGTH) {
    return { valid: false, error: `Comment must be 1–${MAX_COMMENT_LENGTH} characters.` };
  }

  return {
    valid: true,
    data: {
      name:    validator.escape(name.trim()),
      email:   email.toLowerCase().trim(),
      comment: validator.escape(comment.trim())
    }
  };
};

const generateCommentId = () =>
  `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// ✅ NEW: Secure token generator
const generateToken = () => crypto.randomBytes(32).toString('hex');

const findCommentById = (comments, targetId) => {
  for (let i = 0; i < comments.length; i++) {
    if (comments[i].id === targetId) return { comment: comments[i], path: [i] };
    if (comments[i].replies?.length > 0) {
      const found = findCommentById(comments[i].replies, targetId);
      if (found) return { comment: found.comment, path: [i, ...found.path] };
    }
  }
  return null;
};

const getReplyDepth = (comments, path) => {
  let depth = 0;
  let current = comments;
  for (let i = 0; i < path.length - 1; i++) {
    if (current[path[i]]?.replies) {
      current = current[path[i]].replies;
      depth++;
    }
  }
  return depth;
};

const readCommentsFile = async (filePath) => {
  try {
    if (!(await fs.pathExists(filePath))) return [];
    const data = await fs.readJson(filePath);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn(`⚠️ Error reading comments: ${filePath}`, err.message);
    return [];
  }
};

const writeCommentsFile = async (filePath, comments) => {
  try {
    if (await fs.pathExists(filePath)) {
      await fs.copy(filePath, `${filePath}.backup`);
    }
    await fs.writeJson(filePath, comments, { spaces: 2 });
    return true;
  } catch (err) {
    console.error(`❌ Error writing comments: ${filePath}`, err.message);
    throw err;
  }
};

// ✅ NEW: Token verification helper
const verifyCommentToken = async (filePath, commentId, providedToken) => {
  if (!providedToken) return { valid: false, error: 'Token is required.' };
  const comments = await readCommentsFile(filePath);
  const found = findCommentById(comments, commentId);
  if (!found) return { valid: false, error: 'Comment not found.' };
  if (!found.comment.token || found.comment.token !== providedToken) {
    return { valid: false, error: 'Invalid or expired token.' };
  }
  return { valid: true, found, comments };
};

// ── Strip token before sending to client ──
const stripToken = (comment) => {
  const { token, ...rest } = comment;
  return {
    ...rest,
    replies: rest.replies?.map(stripToken) || []
  };
};

// ═══════════════════════════════════════
// ✅ FIXED ROUTE ORDER: specific routes BEFORE dynamic ones
// ═══════════════════════════════════════

// ── Health Check ──
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    validCategories: VALID_CATEGORIES,
    features: ['nested_replies', 'rate_limiting', 'input_validation', 'edit_history', 'guest_tokens'],
    limits: { maxCommentLength: MAX_COMMENT_LENGTH, maxNameLength: MAX_NAME_LENGTH, maxReplyDepth: MAX_REPLY_DEPTH },
    rateLimit: { readMax: 200, writeMax: 30, moderateMax: 50, windowMs: 15 * 60 * 1000 }
  });
});

// ── GET Stats ──  ✅ FIXED: must be before /:category/:id
router.get('/:category/:id/stats', readLimiter, async (req, res) => {
  const startTime = Date.now();
  const { category: rawCategory, id: rawId } = req.params;

  try {
    const validation = validateAndSanitizeParams(rawCategory, rawId);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    const { category, id } = validation;
    const filePath = path.join(commentBaseDir, category, `${id}.json`);
    const comments = await readCommentsFile(filePath);

    const stats = {
      totalComments: 0,
      totalReplies: 0,
      maxDepth: 0,
      uniqueCommenters: 0,
      recentActivity: []
    };
    const commenters = new Set();

    // ✅ FIXED: correct counting (top-level vs replies separated)
    const analyzeComments = (commentList, depth = 0) => {
      stats.maxDepth = Math.max(stats.maxDepth, depth);
      commentList.forEach(comment => {
        if (depth === 0) stats.totalComments++;
        else stats.totalReplies++;
        commenters.add(comment.email);
        stats.recentActivity.push({
          type: depth === 0 ? 'comment' : 'reply',
          name: comment.name,
          timestamp: comment.timestamp,
          depth
        });
        if (comment.replies?.length > 0) analyzeComments(comment.replies, depth + 1);
      });
    };

    analyzeComments(comments);
    stats.uniqueCommenters = commenters.size;
    stats.recentActivity = stats.recentActivity
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    console.log(`✅ Stats fetched: ${category}/${id} (${Date.now() - startTime}ms)`);
    res.json({ stats, category, blogId: id });

  } catch (err) {
    console.error(`❌ Stats error [${rawCategory}/${rawId}]:`, err.message);
    res.status(500).json({ error: 'Failed to fetch comment statistics.' });
  }
});

// ── GET Comments ──
router.get('/:category/:id', readLimiter, async (req, res) => {
  const startTime = Date.now();
  const { category: rawCategory, id: rawId } = req.params;

  try {
    const validation = validateAndSanitizeParams(rawCategory, rawId);
    if (!validation.valid) return res.status(400).json({ error: validation.error });

    const { category, id } = validation;
    const filePath = path.join(commentBaseDir, category, `${id}.json`);
    const comments = await readCommentsFile(filePath);

    // ✅ FIXED: correct stats counting
    const stats = { totalComments: 0, totalReplies: 0 };
    const countComments = (list, isReply = false) => {
      list.forEach(c => {
        if (isReply) stats.totalReplies++;
        else stats.totalComments++;
        if (c.replies?.length > 0) countComments(c.replies, true);
      });
    };
    countComments(comments);

    console.log(`✅ Comments fetched: ${category}/${id} (${stats.totalComments} comments, ${Date.now() - startTime}ms)`);

    // ✅ Strip tokens before sending to client
    res.json({
      comments: comments.map(stripToken),
      stats,
      category,
      blogId: id
    });

  } catch (err) {
    console.error(`❌ GET comments error [${rawCategory}/${rawId}]:`, err.message);
    res.status(500).json({ error: 'Failed to load comments.' });
  }
});

// ── POST New Comment ──
router.post('/:category/:id', writeLimiter, async (req, res) => {
  const startTime = Date.now();
  const { category: rawCategory, id: rawId } = req.params;
  const { name, email, comment, timestamp } = req.body;

  try {
    const paramValidation = validateAndSanitizeParams(rawCategory, rawId);
    if (!paramValidation.valid) return res.status(400).json({ error: paramValidation.error });

    const contentValidation = validateCommentData({ name, email, comment });
    if (!contentValidation.valid) return res.status(400).json({ error: contentValidation.error });

    const { category, id } = paramValidation;
    const { data: sanitizedData } = contentValidation;

    // ✅ NEW: Generate token and store it with comment
    const token = generateToken();

    const commentData = {
      id: generateCommentId(),
      ...sanitizedData,
      timestamp: timestamp || new Date().toISOString(),
      token, // stored in file, never sent back in GET
      replies: []
    };

    const commentDir = path.join(commentBaseDir, category);
    const filePath = path.join(commentDir, `${id}.json`);
    await fs.ensureDir(commentDir);

    const existing = await readCommentsFile(filePath);
    existing.push(commentData);
    await writeCommentsFile(filePath, existing);

    console.log(`✅ Comment posted: ${category}/${id} by ${sanitizedData.name} (${Date.now() - startTime}ms)`);

    res.status(201).json({
      message: 'Comment posted successfully',
      comment: stripToken(commentData), // ✅ no token in comment object
      token                             // ✅ token sent separately for localStorage
    });

  } catch (err) {
    console.error(`❌ POST comment error [${rawCategory}/${rawId}]:`, err.message);
    res.status(500).json({ error: 'Failed to save comment.' });
  }
});

// ── POST Reply ──
router.post('/:category/:id/reply/:commentId', writeLimiter, async (req, res) => {
  const startTime = Date.now();
  const { category: rawCategory, id: rawId, commentId } = req.params;
  const { name, email, comment, timestamp } = req.body;

  try {
    const paramValidation = validateAndSanitizeParams(rawCategory, rawId);
    if (!paramValidation.valid) return res.status(400).json({ error: paramValidation.error });

    const contentValidation = validateCommentData({ name, email, comment });
    if (!contentValidation.valid) return res.status(400).json({ error: contentValidation.error });

    if (!commentId) return res.status(400).json({ error: 'Comment ID is required for replies.' });

    const { category, id } = paramValidation;
    const { data: sanitizedData } = contentValidation;

    const filePath = path.join(commentBaseDir, category, `${id}.json`);
    const comments = await readCommentsFile(filePath);

    const found = findCommentById(comments, commentId);
    if (!found) return res.status(404).json({ error: 'Parent comment not found.' });

    const depth = getReplyDepth(comments, found.path);
    if (depth >= MAX_REPLY_DEPTH) {
      return res.status(400).json({ error: `Maximum reply depth of ${MAX_REPLY_DEPTH} exceeded.` });
    }

    // ✅ NEW: Generate token for reply too
    const token = generateToken();

    const replyData = {
      id: generateCommentId(),
      ...sanitizedData,
      timestamp: timestamp || new Date().toISOString(),
      parentId: commentId,
      token, // stored in file
      replies: []
    };

    if (!found.comment.replies) found.comment.replies = [];
    found.comment.replies.push(replyData);
    await writeCommentsFile(filePath, comments);

    console.log(`✅ Reply posted: ${category}/${id} → ${commentId} by ${sanitizedData.name} (${Date.now() - startTime}ms)`);

    res.status(201).json({
      message: 'Reply posted successfully',
      reply: stripToken(replyData), // ✅ no token in reply object
      token,                        // ✅ token sent separately
      parentId: commentId
    });

  } catch (err) {
    console.error(`❌ POST reply error [${rawCategory}/${rawId}/${commentId}]:`, err.message);
    res.status(500).json({ error: 'Failed to save reply.' });
  }
});

// ── PUT Edit Comment/Reply ──
router.put('/:category/:id/:commentId', moderateLimiter, async (req, res) => {
  const startTime = Date.now();
  const { category: rawCategory, id: rawId, commentId } = req.params;
  const { comment } = req.body;
  // ✅ NEW: Token from header
  const providedToken = req.headers['x-comment-token'];

  try {
    const paramValidation = validateAndSanitizeParams(rawCategory, rawId);
    if (!paramValidation.valid) return res.status(400).json({ error: paramValidation.error });

    const { category, id } = paramValidation;
    const filePath = path.join(commentBaseDir, category, `${id}.json`);

    // ✅ Verify token before allowing edit
    const tokenCheck = await verifyCommentToken(filePath, commentId, providedToken);
    if (!tokenCheck.valid) return res.status(403).json({ error: tokenCheck.error });

    const { found, comments } = tokenCheck;

    // Only validate the comment text for edits (name/email stay the same)
    if (!comment || typeof comment !== 'string' || comment.trim().length === 0 || comment.length > MAX_COMMENT_LENGTH) {
      return res.status(400).json({ error: `Comment must be 1–${MAX_COMMENT_LENGTH} characters.` });
    }

    const sanitizedComment = validator.escape(comment.trim());
    const originalComment = found.comment.comment;

    found.comment.comment  = sanitizedComment;
    found.comment.editedAt = new Date().toISOString();

    if (!found.comment.editHistory) found.comment.editHistory = [];
    found.comment.editHistory.push({
      editedAt:        found.comment.editedAt,
      originalComment: originalComment
    });

    await writeCommentsFile(filePath, comments);

    console.log(`✅ Comment edited: ${category}/${id}/${commentId} (${Date.now() - startTime}ms)`);

    res.status(200).json({
      message: 'Comment updated successfully',
      updated: stripToken(found.comment)
    });

  } catch (err) {
    console.error(`❌ PUT comment error [${rawCategory}/${rawId}/${commentId}]:`, err.message);
    res.status(500).json({ error: 'Failed to update comment.' });
  }
});

// ── DELETE Comment/Reply ──
router.delete('/:category/:id/:commentId', moderateLimiter, async (req, res) => {
  const startTime = Date.now();
  const { category: rawCategory, id: rawId, commentId } = req.params;
  // ✅ NEW: Token from header
  const providedToken = req.headers['x-comment-token'];

  try {
    const paramValidation = validateAndSanitizeParams(rawCategory, rawId);
    if (!paramValidation.valid) return res.status(400).json({ error: paramValidation.error });

    const { category, id } = paramValidation;
    const filePath = path.join(commentBaseDir, category, `${id}.json`);

    // ✅ Verify token before allowing delete
    const tokenCheck = await verifyCommentToken(filePath, commentId, providedToken);
    if (!tokenCheck.valid) return res.status(403).json({ error: tokenCheck.error });

    const { found, comments } = tokenCheck;

    // Navigate to parent array and remove
    let parentArray = comments;
    const targetIndex = found.path[found.path.length - 1];
    for (let i = 0; i < found.path.length - 1; i++) {
      parentArray = parentArray[found.path[i]].replies;
    }

    const removed = parentArray.splice(targetIndex, 1)[0];
    await writeCommentsFile(filePath, comments);

    console.log(`✅ Comment deleted: ${category}/${id}/${commentId} (${Date.now() - startTime}ms)`);

    res.status(200).json({
      message: 'Comment deleted successfully',
      deleted: { id: removed.id, name: removed.name, deletedAt: new Date().toISOString() }
    });

  } catch (err) {
    console.error(`❌ DELETE comment error [${rawCategory}/${rawId}/${commentId}]:`, err.message);
    res.status(500).json({ error: 'Failed to delete comment.' });
  }
});

export default router;
