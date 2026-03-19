// src/components/CommentSection/CommentSection.jsx
import React, { useState, useCallback, useEffect } from 'react';
import styles from './CommentSection.module.css'; // same CSS as above

// ── Token helpers ──
const saveToken = (commentId, token) => {
  try {
    localStorage.setItem(`comment_token_${commentId}`, token);
  } catch {}
};

const getToken = (commentId) => {
  try {
    return localStorage.getItem(`comment_token_${commentId}`);
  } catch { return null; }
};

const removeToken = (commentId) => {
  try {
    localStorage.removeItem(`comment_token_${commentId}`);
  } catch {}
};

// ── Comment Card ──
const CommentCard = React.memo(({ 
  comment, 
  depth = 0, 
  onReply, 
  onEdit, 
  onDelete 
}) => {
  const [showReplies, setShowReplies] = useState(true);
  const token = getToken(comment.id);
  const isOwner = !!token;

  const cardClass = depth === 0 ? styles.commentCard : styles.replyCard;

  return (
    <div className={cardClass}>
      <div className={styles.commentCardHeader}>
        <span className={styles.commentCardName}>
          {comment.name} <span>says:</span>
          {comment.editedAt && (
            <span className={styles.editedBadge}>(edited)</span>
          )}
        </span>
        <span className={styles.commentCardTime}>
          {new Date(comment.timestamp).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
          })} at {new Date(comment.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit'
          })}
        </span>
      </div>

      <div className={styles.commentCardBody}>
        {comment.comment}
      </div>

      <div className={styles.commentCardActions}>
        {depth < 3 && (
          <button 
            className={styles.replyBtn} 
            onClick={() => onReply(comment)}
          >
            Reply
          </button>
        )}
        {isOwner && (
          <>
            <button 
              className={styles.editBtn} 
              onClick={() => onEdit(comment, token)}
            >
              Edit
            </button>
            <button 
              className={styles.deleteBtn} 
              onClick={() => onDelete(comment.id, token)}
            >
              Delete
            </button>
          </>
        )}
      </div>

      {comment.replies?.length > 0 && (
        <div className={styles.repliesContainer}>
          <button 
            className={styles.toggleRepliesBtn}
            onClick={() => setShowReplies(p => !p)}
          >
            {showReplies ? '▼' : '▶'} {comment.replies.length} repl{comment.replies.length === 1 ? 'y' : 'ies'}
          </button>

          {showReplies && comment.replies.map((reply, i) => (
            <CommentCard
              key={reply.id || `reply-${i}`}
              comment={reply}
              depth={depth + 1}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
});

// ── Popup Modal ──
const CommentModal = ({ mode, parentComment, editComment, onClose, onSubmit, loading }) => {
  const [form, setForm] = useState({
    name: editComment?.name || '',
    email: '',
    comment: editComment?.comment || ''
  });

  const isEdit = mode === 'edit';
  const isReply = mode === 'reply';

  const handleChange = (field) => (e) => 
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  // Close on overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalBox}>
        <button className={styles.modalClose} onClick={onClose}>✕</button>

        <h2 className={styles.modalTitle}>
          {isEdit ? 'Edit your comment' : isReply ? 'Write a reply' : 'Share your thoughts'}
        </h2>
        <p className={styles.modalSubtitle}>
          {isEdit 
            ? 'Update your comment below.'
            : 'Your email won\'t be displayed publicly.'}
        </p>

        {/* Reply preview */}
        {isReply && parentComment && (
          <div className={styles.replyPreview}>
            <div className={styles.replyPreviewName}>
              Replying to {parentComment.name}:
            </div>
            <div className={styles.replyPreviewText}>
              {parentComment.comment}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name + Email side by side */}
          {!isEdit && (
            <div className={styles.modalFormRow}>
              <div className={styles.modalFormGroup}>
                <label>Name *</label>
                <input
                  className={styles.modalInput}
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={handleChange('name')}
                  required
                  maxLength={100}
                  disabled={loading}
                />
              </div>
              <div className={styles.modalFormGroup}>
                <label>Email *</label>
                <input
                  className={styles.modalInput}
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={handleChange('email')}
                  required
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Comment textarea */}
          <div className={styles.modalFormGroup}>
            <label>{isReply ? 'Reply *' : 'Comment *'}</label>
            <textarea
              className={styles.modalTextarea}
              placeholder={isReply ? "Write your reply..." : "Share your thoughts, questions, or insights..."}
              value={form.comment}
              onChange={handleChange('comment')}
              required
              maxLength={2000}
              disabled={loading}
            />
            <div className={styles.charCount}>{form.comment.length}/2000</div>
          </div>

          <button 
            type="submit" 
            className={styles.modalSubmitBtn}
            disabled={loading}
          >
            {loading 
              ? 'Posting...' 
              : isEdit ? 'Save Changes' 
              : isReply ? 'Post Reply' 
              : 'Post Comment'}
          </button>

          {!isEdit && (
            <p className={styles.tokenNotice}>
              🔑 You'll receive a token to edit or delete your comment later.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

// ── Main CommentSection ──
const CommentSection = ({ category, blogId }) => {
  const [commentsData, setCommentsData] = useState({ comments: [], stats: null });
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Modal state: null | { mode: 'new'|'reply'|'edit', parentComment?, editComment? }
  const [modal, setModal] = useState(null);

  // Fetch comments
  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/comments/${category}/${blogId}`);
        if (res.ok) {
          const data = await res.json();
          setCommentsData({
            comments: Array.isArray(data) ? data : (data.comments || []),
            stats: data.stats || null
          });
        }
      } catch {}
      finally { setLoading(false); }
    };
    if (category && blogId) fetch_();
  }, [category, blogId]);

  // ── Submit new comment ──
  const handleNewComment = useCallback(async (form) => {
    setSubmitLoading(true);
    try {
      const res = await fetch(`/api/comments/${category}/${blogId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, timestamp: new Date().toISOString() })
      });

      if (res.ok) {
        const { comment, token } = await res.json();
        if (token) saveToken(comment.id, token);

        setCommentsData(prev => ({
          comments: [...prev.comments, comment],
          stats: prev.stats 
            ? { ...prev.stats, totalComments: prev.stats.totalComments + 1 } 
            : null
        }));
        setModal(null);
      }
    } catch {}
    finally { setSubmitLoading(false); }
  }, [category, blogId]);

  // ── Submit reply ──
  const handleReply = useCallback(async (form, parentComment) => {
    setSubmitLoading(true);
    try {
      const res = await fetch(
        `/api/comments/${category}/${blogId}/reply/${parentComment.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, timestamp: new Date().toISOString() })
        }
      );

      if (res.ok) {
        const { reply, token } = await res.json();
        if (token) saveToken(reply.id, token);

        // Optimistic insert
        setCommentsData(prev => {
          const updated = JSON.parse(JSON.stringify(prev.comments));
          const insert = (list) => {
            for (const c of list) {
              if (c.id === parentComment.id) { c.replies.push(reply); return true; }
              if (c.replies?.length && insert(c.replies)) return true;
            }
            return false;
          };
          insert(updated);
          return { ...prev, comments: updated };
        });
        setModal(null);
      }
    } catch {}
    finally { setSubmitLoading(false); }
  }, [category, blogId]);

  // ── Submit edit ──
  const handleEdit = useCallback(async (form, editComment, token) => {
    setSubmitLoading(true);
    try {
      const res = await fetch(
        `/api/comments/${category}/${blogId}/${editComment.id}`,
        {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'x-comment-token': token
          },
          body: JSON.stringify({ 
            name: editComment.name,
            email: editComment.email,
            comment: form.comment 
          })
        }
      );

      if (res.ok) {
        const { updated } = await res.json();
        setCommentsData(prev => {
          const cloned = JSON.parse(JSON.stringify(prev.comments));
          const update = (list) => {
            for (let i = 0; i < list.length; i++) {
              if (list[i].id === editComment.id) { list[i] = { ...list[i], ...updated }; return true; }
              if (list[i].replies?.length && update(list[i].replies)) return true;
            }
            return false;
          };
          update(cloned);
          return { ...prev, comments: cloned };
        });
        setModal(null);
      }
    } catch {}
    finally { setSubmitLoading(false); }
  }, [category, blogId]);

  // ── Delete ──
  const handleDelete = useCallback(async (commentId, token) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      const res = await fetch(`/api/comments/${category}/${blogId}/${commentId}`, {
        method: 'DELETE',
        headers: { 'x-comment-token': token }
      });

      if (res.ok) {
        removeToken(commentId);
        setCommentsData(prev => {
          const cloned = JSON.parse(JSON.stringify(prev.comments));
          const remove = (list) => {
            const idx = list.findIndex(c => c.id === commentId);
            if (idx !== -1) { list.splice(idx, 1); return true; }
            for (const c of list) {
              if (c.replies?.length && remove(c.replies)) return true;
            }
            return false;
          };
          remove(cloned);
          return { ...prev, comments: cloned };
        });
      }
    } catch {}
  }, [category, blogId]);

  // ── Modal submit router ──
  const handleModalSubmit = useCallback((form) => {
    if (!modal) return;
    if (modal.mode === 'new') handleNewComment(form);
    else if (modal.mode === 'reply') handleReply(form, modal.parentComment);
    else if (modal.mode === 'edit') handleEdit(form, modal.editComment, modal.token);
  }, [modal, handleNewComment, handleReply, handleEdit]);

  const { comments, stats } = commentsData;
  const totalCount = (stats?.totalComments || 0) + (stats?.totalReplies || 0);

  return (
    <section className={styles.commentSection}>
      <div className={styles.commentSectionInner}>

        {/* Left */}
        <div className={styles.commentSectionLeft}>
          <h2 className={styles.commentSectionTitle}>Share<br />your<br />thoughts</h2>
          {totalCount > 0 && (
            <p className={styles.commentSectionMeta}>
              {totalCount} contribution{totalCount !== 1 ? 's' : ''}
            </p>
          )}
          <button 
            className={styles.leaveCommentBtn}
            onClick={() => setModal({ mode: 'new' })}
          >
            Leave a comment →
          </button>
        </div>

        {/* Right */}
        <div className={styles.commentSectionRight}>
          {loading ? (
            <div className={styles.commentsLoading}>Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className={styles.noComments}>
              No comments yet — be the first to share your thoughts.
            </div>
          ) : (
            comments.map((comment, i) => (
              <CommentCard
                key={comment.id || `c-${i}`}
                comment={comment}
                depth={0}
                onReply={(c) => setModal({ mode: 'reply', parentComment: c })}
                onEdit={(c, token) => setModal({ mode: 'edit', editComment: c, token })}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>

      </div>

      {/* Modal */}
      {modal && (
        <CommentModal
          mode={modal.mode}
          parentComment={modal.parentComment}
          editComment={modal.editComment}
          onClose={() => setModal(null)}
          onSubmit={handleModalSubmit}
          loading={submitLoading}
        />
      )}
    </section>
  );
};

export default CommentSection;
