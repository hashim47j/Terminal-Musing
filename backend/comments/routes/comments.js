import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import rateLimit from 'express-rate-limit';
import sanitize from 'sanitize-filename';
import validator from 'validator';

const router = express.Router();
const commentBaseDir = path.join(process.cwd(), 'backend', 'comments');

// Configuration
const VALID_CATEGORIES = ['history', 'philosophy', 'tech', 'lsconcern'];
const MAX_COMMENT_LENGTH = 2000;
const MAX_NAME_LENGTH = 100;
const MAX_REPLY_DEPTH = 3; // Maximum nested reply levels

// Rate limiting configurations
const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Allow more reads
  message: { error: 'Too many comment requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit comment posts to prevent spam
  message: { error: 'Too many comments posted, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

const moderateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Moderate limit for edits/deletes
  message: { error: 'Too many moderation actions, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Validate and sanitize input parameters
 */
const validateAndSanitizeParams = (category, id) => {
  if (!category || !id) {
    return { valid: false, error: 'Missing category or blog ID' };
  }

  const sanitizedCategory = category.toLowerCase().trim();
  const sanitizedId = sanitize(id.toString()).replace(/[^a-zA-Z0-9\-_]/g, '');

  if (!VALID_CATEGORIES.includes(sanitizedCategory)) {
    return { 
      valid: false, 
      error: `Invalid category. Valid categories: ${VALID_CATEGORIES.join(', ')}` 
    };
  }

  if (!sanitizedId || sanitizedId.length === 0) {
    return { valid: false, error: 'Invalid or unsafe blog ID' };
  }

  return {
    valid: true,
    category: sanitizedCategory,
    id: sanitizedId
  };
};

/**
 * Validate comment content
 */
const validateCommentData = (data, isReply = false) => {
  const { name, email, comment } = data;

  if (!name || !email || !comment) {
    return { valid: false, error: 'All fields (name, email, comment) are required.' };
  }

  // Validate name
  if (typeof name !== 'string' || name.trim().length === 0 || name.length > MAX_NAME_LENGTH) {
    return { valid: false, error: `Name must be between 1 and ${MAX_NAME_LENGTH} characters.` };
  }

  // Validate email
  if (!validator.isEmail(email)) {
    return { valid: false, error: 'Please provide a valid email address.' };
  }

  // Validate comment length
  if (typeof comment !== 'string' || comment.trim().length === 0 || comment.length > MAX_COMMENT_LENGTH) {
    return { valid: false, error: `Comment must be between 1 and ${MAX_COMMENT_LENGTH} characters.` };
  }

  // Sanitize content
  const sanitizedData = {
    name: validator.escape(name.trim()),
    email: email.toLowerCase().trim(),
    comment: validator.escape(comment.trim())
  };

  return { valid: true, data: sanitizedData };
};

/**
 * Generate unique comment ID
 */
const generateCommentId = () => {
  return `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Find comment by ID in nested structure
 */
const findCommentById = (comments, targetId) => {
  for (let i = 0; i < comments.length; i++) {
    if (comments[i].id === targetId) {
      return { comment: comments[i], path: [i] };
    }
    if (comments[i].replies && comments[i].replies.length > 0) {
      const found = findCommentById(comments[i].replies, targetId);
      if (found) {
        return { comment: found.comment, path: [i, ...found.path] };
      }
    }
  }
  return null;
};

/**
 * Count reply depth
 */
const getReplyDepth = (comments, path) => {
  let depth = 0;
  let current = comments;
  
  for (let i = 0; i < path.length - 1; i++) {
    if (current[path[i]] && current[path[i]].replies) {
      current = current[path[i]].replies;
      depth++;
    }
  }
  
  return depth;
};

/**
 * Safely read comments with error handling
 */
const readCommentsFile = async (filePath) => {
  try {
    if (!(await fs.pathExists(filePath))) {
      return [];
    }
    const data = await fs.readJson(filePath);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn(`⚠️ Error reading comments file: ${filePath}`, error.message);
    return [];
  }
};

/**
 * Safely write comments with backup
 */
const writeCommentsFile = async (filePath, comments) => {
  try {
    // Create backup before writing
    if (await fs.pathExists(filePath)) {
      const backupPath = `${filePath}.backup`;
      await fs.copy(filePath, backupPath);
    }
    
    await fs.writeJson(filePath, comments, { spaces: 2 });
    return true;
  } catch (error) {
    console.error(`❌ Error writing comments file: ${filePath}`, error.message);
    throw error;
  }
};

// ===== GET Comments =====
router.get('/:category/:id', readLimiter, async (req, res) => {
  const startTime = Date.now();
  const { category: rawCategory, id: rawId } = req.params;

  try {
    const validation = validateAndSanitizeParams(rawCategory, rawId);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const { category, id } = validation;
    const filePath = path.join(commentBaseDir, category, `${id}.json`);
    const comments = await readCommentsFile(filePath);

    // Calculate statistics
    const stats = {
      totalComments: 0,
      totalReplies: 0
    };

    const countComments = (commentList) => {
      commentList.forEach(comment => {
        stats.totalComments++;
        if (comment.replies && comment.replies.length > 0) {
          stats.totalReplies += comment.replies.length;
          countComments(comment.replies);
        }
      });
    };

    countComments(comments);

    console.log(`✅ Comments fetched: ${category}/${id} (${stats.totalComments} comments, ${Date.now() - startTime}ms)`);
    
    res.json({
      comments,
      stats,
      category,
      blogId: id
    });

  } catch (error) {
    console.error(`❌ Error reading comments [${rawCategory}/${rawId}]:`, {
      error: error.message,
      duration: Date.now() - startTime
    });
    res.status(500).json({ error: 'Failed to load comments.' });
  }
});

// ===== POST New Comment =====
router.post('/:category/:id', writeLimiter, async (req, res) => {
  const startTime = Date.now();
  const { category: rawCategory, id: rawId } = req.params;
  const { name, email, comment, timestamp } = req.body;

  try {
    const paramValidation = validateAndSanitizeParams(rawCategory, rawId);
    if (!paramValidation.valid) {
      return res.status(400).json({ error: paramValidation.error });
    }

    const contentValidation = validateCommentData({ name, email, comment });
    if (!contentValidation.valid) {
      return res.status(400).json({ error: contentValidation.error });
    }

    const { category, id } = paramValidation;
    const { data: sanitizedData } = contentValidation;

    const commentData = {
      id: generateCommentId(),
      ...sanitizedData,
      timestamp: timestamp || new Date().toISOString(),
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
      message: '✅ Comment posted successfully',
      comment: commentData
    });

  } catch (error) {
    console.error(`❌ Error saving comment [${rawCategory}/${rawId}]:`, {
      error: error.message,
      duration: Date.now() - startTime
    });
    res.status(500).json({ error: 'Failed to save comment.' });
  }
});

// ===== POST Reply to Comment =====
router.post('/:category/:id/reply/:commentId', writeLimiter, async (req, res) => {
  const startTime = Date.now();
  const { category: rawCategory, id: rawId, commentId } = req.params;
  const { name, email, comment, timestamp } = req.body;

  try {
    const paramValidation = validateAndSanitizeParams(rawCategory, rawId);
    if (!paramValidation.valid) {
      return res.status(400).json({ error: paramValidation.error });
    }

    const contentValidation = validateCommentData({ name, email, comment }, true);
    if (!contentValidation.valid) {
      return res.status(400).json({ error: contentValidation.error });
    }

    if (!commentId) {
      return res.status(400).json({ error: 'Comment ID is required for replies.' });
    }

    const { category, id } = paramValidation;
    const { data: sanitizedData } = contentValidation;

    const filePath = path.join(commentBaseDir, category, `${id}.json`);
    const comments = await readCommentsFile(filePath);

    // Find the parent comment
    const found = findCommentById(comments, commentId);
    if (!found) {
      return res.status(404).json({ error: 'Parent comment not found.' });
    }

    // Check reply depth
    const depth = getReplyDepth(comments, found.path);
    if (depth >= MAX_REPLY_DEPTH) {
      return res.status(400).json({ 
        error: `Maximum reply depth of ${MAX_REPLY_DEPTH} levels exceeded.` 
      });
    }

    const replyData = {
      id: generateCommentId(),
      ...sanitizedData,
      timestamp: timestamp || new Date().toISOString(),
      parentId: commentId,
      replies: []
    };

    // Add reply to parent comment
    if (!found.comment.replies) {
      found.comment.replies = [];
    }
    found.comment.replies.push(replyData);

    await writeCommentsFile(filePath, comments);

    console.log(`✅ Reply posted: ${category}/${id} to comment ${commentId} by ${sanitizedData.name} (${Date.now() - startTime}ms)`);
    
    res.status(201).json({
      message: '✅ Reply posted successfully',
      reply: replyData,
      parentId: commentId
    });

  } catch (error) {
    console.error(`❌ Error saving reply [${rawCategory}/${rawId}/${commentId}]:`, {
      error: error.message,
      duration: Date.now() - startTime
    });
    res.status(500).json({ error: 'Failed to save reply.' });
  }
});

// ===== PUT Edit Comment/Reply =====
router.put('/:category/:id/:commentId', moderateLimiter, async (req, res) => {
  const startTime = Date.now();
  const { category: rawCategory, id: rawId, commentId } = req.params;
  const { name, email, comment, timestamp } = req.body;

  try {
    const paramValidation = validateAndSanitizeParams(rawCategory, rawId);
    if (!paramValidation.valid) {
      return res.status(400).json({ error: paramValidation.error });
    }

    const contentValidation = validateCommentData({ name, email, comment });
    if (!contentValidation.valid) {
      return res.status(400).json({ error: contentValidation.error });
    }

    const { category, id } = paramValidation;
    const { data: sanitizedData } = contentValidation;

    const filePath = path.join(commentBaseDir, category, `${id}.json`);
    const comments = await readCommentsFile(filePath);

    const found = findCommentById(comments, commentId);
    if (!found) {
      return res.status(404).json({ error: 'Comment not found.' });
    }

    // Update comment with edit history
    const originalComment = { ...found.comment };
    found.comment.name = sanitizedData.name;
    found.comment.email = sanitizedData.email;
    found.comment.comment = sanitizedData.comment;
    found.comment.editedAt = new Date().toISOString();
    
    if (!found.comment.editHistory) {
      found.comment.editHistory = [];
    }
    found.comment.editHistory.push({
      editedAt: found.comment.editedAt,
      originalComment: originalComment.comment,
      originalName: originalComment.name
    });

    await writeCommentsFile(filePath, comments);

    console.log(`✅ Comment edited: ${category}/${id}/${commentId} (${Date.now() - startTime}ms)`);
    
    res.status(200).json({
      message: '✅ Comment updated successfully',
      updated: found.comment
    });

  } catch (error) {
    console.error(`❌ Error updating comment [${rawCategory}/${rawId}/${commentId}]:`, {
      error: error.message,
      duration: Date.now() - startTime
    });
    res.status(500).json({ error: 'Failed to update comment.' });
  }
});

// ===== DELETE Comment/Reply =====
router.delete('/:category/:id/:commentId', moderateLimiter, async (req, res) => {
  const startTime = Date.now();
  const { category: rawCategory, id: rawId, commentId } = req.params;

  try {
    const paramValidation = validateAndSanitizeParams(rawCategory, rawId);
    if (!paramValidation.valid) {
      return res.status(400).json({ error: paramValidation.error });
    }

    const { category, id } = paramValidation;
    const filePath = path.join(commentBaseDir, category, `${id}.json`);
    const comments = await readCommentsFile(filePath);

    const found = findCommentById(comments, commentId);
    if (!found) {
      return res.status(404).json({ error: 'Comment not found.' });
    }

    // Remove comment/reply
    let parentArray = comments;
    let targetIndex = found.path[found.path.length - 1];
    
    // Navigate to parent if it's a nested reply
    for (let i = 0; i < found.path.length - 1; i++) {
      parentArray = parentArray[found.path[i]].replies;
    }

    const removed = parentArray.splice(targetIndex, 1)[0];
    await writeCommentsFile(filePath, comments);

    console.log(`✅ Comment deleted: ${category}/${id}/${commentId} (${Date.now() - startTime}ms)`);
    
    res.status(200).json({
      message: '🗑️ Comment deleted successfully',
      deleted: {
        id: removed.id,
        name: removed.name,
        deletedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error(`❌ Error deleting comment [${rawCategory}/${rawId}/${commentId}]:`, {
      error: error.message,
      duration: Date.now() - startTime
    });
    res.status(500).json({ error: 'Failed to delete comment.' });
  }
});

// ===== GET Comment Statistics =====
router.get('/:category/:id/stats', readLimiter, async (req, res) => {
  const startTime = Date.now();
  const { category: rawCategory, id: rawId } = req.params;

  try {
    const validation = validateAndSanitizeParams(rawCategory, rawId);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const { category, id } = validation;
    const filePath = path.join(commentBaseDir, category, `${id}.json`);
    const comments = await readCommentsFile(filePath);

    const stats = {
      totalComments: 0,
      totalReplies: 0,
      maxDepth: 0,
      commenters: new Set(),
      recentActivity: []
    };

    const analyzeComments = (commentList, depth = 0) => {
      stats.maxDepth = Math.max(stats.maxDepth, depth);
      
      commentList.forEach(comment => {
        stats.totalComments++;
        stats.commenters.add(comment.email);
        stats.recentActivity.push({
          type: depth === 0 ? 'comment' : 'reply',
          name: comment.name,
          timestamp: comment.timestamp,
          depth
        });

        if (comment.replies && comment.replies.length > 0) {
          stats.totalReplies += comment.replies.length;
          analyzeComments(comment.replies, depth + 1);
        }
      });
    };

    analyzeComments(comments);

    // Sort recent activity by timestamp
    stats.recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    stats.recentActivity = stats.recentActivity.slice(0, 10); // Last 10 activities
    stats.uniqueCommenters = stats.commenters.size;
    delete stats.commenters; // Remove Set before JSON response

    console.log(`✅ Comment stats fetched: ${category}/${id} (${Date.now() - startTime}ms)`);
    
    res.json({
      stats,
      category,
      blogId: id
    });

  } catch (error) {
    console.error(`❌ Error fetching comment stats [${rawCategory}/${rawId}]:`, {
      error: error.message,
      duration: Date.now() - startTime
    });
    res.status(500).json({ error: 'Failed to fetch comment statistics.' });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    validCategories: VALID_CATEGORIES,
    features: ['nested_replies', 'rate_limiting', 'input_validation', 'edit_history'],
    limits: {
      maxCommentLength: MAX_COMMENT_LENGTH,
      maxNameLength: MAX_NAME_LENGTH,
      maxReplyDepth: MAX_REPLY_DEPTH
    }
  });
});

export default router;
