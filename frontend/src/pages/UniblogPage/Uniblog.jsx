import React, { useEffect, useState, useContext, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import styles from './Uniblog.module.css';
import { useDarkMode } from '../../context/DarkModeContext';
import BlogRenderer from '../../components/BlogRenderer';
import { PageContext } from '../../context/PageContext';

const THEMES = {
  history: { name: 'history', display: 'History' },
  philosophy: { name: 'philosophy', display: 'Philosophy' },
  tech: { name: 'tech', display: 'Technology' },
  lsconcern: { name: 'lsconcern', display: 'Legal & Social' }
};

const CommentBox = React.memo(({ comment, depth = 0, onReply, isReplying, replyForm, setReplyForm, handleReplySubmit }) => {
  const [showReplies, setShowReplies] = useState(true);
  
  const handleReplyClick = useCallback(() => onReply(comment.id), [onReply, comment.id]);
  
  const toggleReplies = useCallback(() => setShowReplies(prev => !prev), []);
  
  const replyFormHandlers = useMemo(() => ({
    name: (e) => setReplyForm(prev => ({ ...prev, name: e.target.value })),
    email: (e) => setReplyForm(prev => ({ ...prev, email: e.target.value })),
    comment: (e) => setReplyForm(prev => ({ ...prev, comment: e.target.value }))
  }), [setReplyForm]);

  const submitReply = useCallback((e) => {
    e.preventDefault();
    handleReplySubmit(e, comment.id);
  }, [handleReplySubmit, comment.id]);

  const cancelReply = useCallback(() => onReply(null), [onReply]);

  if (!comment) return null;

  return (
    <div 
      className={`${styles.commentBox} ${depth > 0 ? styles.replyBox : ''}`}
      style={{ marginLeft: `${depth * 15}px` }}
    >
      <div className={styles.commentHeader}>
        <strong className={styles.commenterName}>{comment.name} says:</strong>
        <div className={styles.commentMeta}>
          {new Date(comment.timestamp).toLocaleString()}
          {comment.editedAt && <span className={styles.editedIndicator}> (edited)</span>}
        </div>
      </div>
      
      <div className={styles.commentContent}>
        <p dangerouslySetInnerHTML={{ __html: comment.comment }}></p>
      </div>
      
      {depth < 3 && (
        <div className={styles.commentActions}>
          <button 
            className={styles.replyBtn}
            onClick={handleReplyClick}
            disabled={isReplying === comment.id}
          >
            {isReplying === comment.id ? 'Replying...' : 'Reply'}
          </button>
        </div>
      )}

      {isReplying === comment.id && (
        <form onSubmit={submitReply} className={styles.replyForm}>
          <div className={styles.replyFormGroup}>
            <input
              type="text"
              placeholder="Your name"
              value={replyForm.name}
              onChange={replyFormHandlers.name}
              required
              className={styles.replyInput}
            />
          </div>
          <div className={styles.replyFormGroup}>
            <input
              type="email"
              placeholder="Your email"
              value={replyForm.email}
              onChange={replyFormHandlers.email}
              required
              className={styles.replyInput}
            />
          </div>
          <div className={styles.replyFormGroup}>
            <textarea
              placeholder="Your reply..."
              value={replyForm.comment}
              onChange={replyFormHandlers.comment}
              required
              rows={3}
              className={styles.replyTextarea}
            />
          </div>
          <div className={styles.replyActions}>
            <button type="submit" className={styles.replySubmitBtn}>Post Reply</button>
            <button type="button" onClick={cancelReply} className={styles.replyCancelBtn}>Cancel</button>
          </div>
        </form>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className={styles.repliesContainer}>
          {depth < 2 && (
            <button className={styles.toggleRepliesBtn} onClick={toggleReplies}>
              {showReplies ? '▼' : '▶'} {comment.replies.length} repl{comment.replies.length === 1 ? 'y' : 'ies'}
            </button>
          )}
          
          {showReplies && comment.replies.map((reply, index) => (
            <CommentBox
              key={reply.id || `reply-${index}`}
              comment={reply}
              depth={depth + 1}
              onReply={onReply}
              isReplying={isReplying}
              replyForm={replyForm}
              setReplyForm={setReplyForm}
              handleReplySubmit={handleReplySubmit}
            />
          ))}
        </div>
      )}
    </div>
  );
});

const Uniblog = () => {
  const { category, id } = useParams();
  const { darkMode } = useDarkMode();
  const { setPageTitle } = useContext(PageContext);

  const [blog, setBlog] = useState(null);
  const [commentsData, setCommentsData] = useState({ comments: [], stats: null });
  const [form, setForm] = useState({ name: '', email: '', comment: '' });
  const [replyForm, setReplyForm] = useState({ name: '', email: '', comment: '' });
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isReplying, setIsReplying] = useState(null);
  const [viewCount, setViewCount] = useState(0);

  const currentTheme = useMemo(() => THEMES[category] || THEMES.history, [category]);
  
  const apiUrls = useMemo(() => ({
    blog: `/api/blogs/${category}/${id}`,
    comments: `/api/comments/${category}/${id}`,
    views: `/api/views/${category}/${id}`
  }), [category, id]);

  // Fetch blog and track views
  useEffect(() => {
    if (!category || !id) return;

    const fetchAndTrackBlog = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(apiUrls.blog);
        if (!res.ok) throw new Error(`Blog fetch failed: HTTP ${res.status} ${res.statusText}`);
        
        const data = await res.json();
        setBlog(data);
        if (data?.title) setPageTitle(`${data.title} - ${currentTheme.display}`);
        
        // Track view silently
        fetch(apiUrls.views, { method: 'POST' })
          .then(res => res.json())
          .then(data => data.count && setViewCount(data.count))
          .catch(() => {});
          
      } catch (err) {
        setError(err.message || 'Failed to load blog');
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAndTrackBlog();
    return () => setPageTitle(null);
  }, [category, id, apiUrls.blog, apiUrls.views, setPageTitle, currentTheme.display]);

  // ✅ FIXED: Fetch comments with proper variable and safety checks
  useEffect(() => {
    const fetchComments = async () => {
      setCommentsLoading(true);
      try {
        // ✅ FIX: Use apiUrls.comments instead of undefined commentsApiUrl
        const res = await fetch(apiUrls.comments);
        if (res.ok) {
          const data = await res.json();
          
          // ✅ DEBUG: Check what API returns
          console.log('🔍 Comments API Response:', data);
          console.log('🔍 Type:', typeof data);
          console.log('🔍 Is Array:', Array.isArray(data));
          
          // ✅ Handle different response formats with safety checks
          let commentsArray = [];
          let statsData = null;
          
          if (Array.isArray(data)) {
            // Direct array response (old format)
            commentsArray = data;
          } else if (data && typeof data === 'object') {
            // Object response with comments property (new format)
            commentsArray = Array.isArray(data.comments) ? data.comments : [];
            statsData = data.stats || null;
          } else {
            // Fallback for unexpected formats
            commentsArray = [];
          }
          
          setCommentsData({
            comments: commentsArray,
            stats: statsData
          });
        } else {
          console.log('🔍 Comments API Error:', res.status);
          setCommentsData({ comments: [], stats: null });
        }
      } catch (error) {
        console.error('🔍 Comments fetch error:', error);
        setCommentsData({ comments: [], stats: null });
      } finally {
        setCommentsLoading(false);
      }
    };

    if (category && id) {
      fetchComments();
    }
  }, [category, id, apiUrls.comments]); // ✅ Added correct dependency

  // Form handlers
  const formHandlers = useMemo(() => ({
    name: (e) => setForm(prev => ({ ...prev, name: e.target.value })),
    email: (e) => setForm(prev => ({ ...prev, email: e.target.value })),
    comment: (e) => setForm(prev => ({ ...prev, comment: e.target.value }))
  }), []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    const { name, email, comment } = form;
    if (!name.trim() || !email.trim() || !comment.trim()) {
      alert('Please fill in all fields.');
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await fetch(apiUrls.comments, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, timestamp: new Date().toISOString() }),
      });

      if (res.ok) {
        const responseData = await res.json();
        const savedComment = responseData.comment || responseData;
        
        setCommentsData(prev => ({
          comments: [...prev.comments, savedComment],
          stats: prev.stats ? { ...prev.stats, totalComments: prev.stats.totalComments + 1 } : null
        }));
        
        setForm({ name: '', email: '', comment: '' });
        alert('Comment posted successfully!');
      } else {
        const errorData = await res.json();
        alert(`Failed to post comment: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Comment submission error:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  }, [form, apiUrls.comments]);

  const handleReplySubmit = useCallback(async (e, parentId) => {
    e.preventDefault();
    
    const { name, email, comment } = replyForm;
    if (!name.trim() || !email.trim() || !comment.trim()) {
      alert('Please fill in all fields.');
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await fetch(`/api/comments/${category}/${id}/reply/${parentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...replyForm, timestamp: new Date().toISOString() }),
      });

      if (res.ok) {
        // Refresh comments to get updated structure
        const commentsRes = await fetch(apiUrls.comments);
        if (commentsRes.ok) {
          const data = await commentsRes.json();
          setCommentsData({ 
            comments: Array.isArray(data) ? data : (data.comments || []), 
            stats: data.stats || null 
          });
        }
        
        setReplyForm({ name: '', email: '', comment: '' });
        setIsReplying(null);
        alert('Reply posted successfully!');
      } else {
        const errorData = await res.json();
        alert(`Failed to post reply: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Reply submission error:', error);
      alert('Failed to post reply. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  }, [replyForm, category, id, apiUrls.comments]);

  const handleReplyClick = useCallback((commentId) => {
    setIsReplying(commentId);
    setReplyForm({ name: '', email: '', comment: '' });
  }, []);

  // Memoized date formatting
  const formattedDate = useMemo(() => {
    if (!blog?.date) return '';
    return new Date(blog.date).toLocaleDateString('en-US', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }, [blog?.date]);

  const metaText = useMemo(() => {
    if (!formattedDate) return '';
    return `On ${formattedDate}${blog?.author ? `, By ${blog.author}` : ''}`;
  }, [formattedDate, blog?.author]);

  const subtitle = useMemo(() => blog?.subtitle || blog?.subheading || '', [blog?.subtitle, blog?.subheading]);

  // Loading states
  if (loading) {
    return (
      <div className={`${styles.blogPageOuterContainer} ${styles[currentTheme.name]} ${darkMode ? styles.darkMode : ''}`}>
        <div className={styles.mainContentWrapper}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading blog post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.blogPageOuterContainer} ${styles[currentTheme.name]} ${darkMode ? styles.darkMode : ''}`}>
        <div className={styles.mainContentWrapper}>
          <div className={styles.errorContainer}>
            <h2>Oops! Something went wrong</h2>
            <p style={{ color: 'red' }}>{error}</p>
            <button onClick={() => window.location.reload()} className={styles.retryBtn}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className={`${styles.blogPageOuterContainer} ${styles[currentTheme.name]} ${darkMode ? styles.darkMode : ''}`}>
        <div className={styles.mainContentWrapper}>
          <div className={styles.notFoundContainer}>
            <h2>Blog Post Not Found</h2>
            <p>The blog post you're looking for doesn't exist or has been moved.</p>
            <button onClick={() => window.history.back()} className={styles.goBackBtn}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.blogPageOuterContainer} ${styles[currentTheme.name]} ${darkMode ? styles.darkMode : ''}`}>
      <div data-navbar-bg-detect style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '200px', pointerEvents: 'none', zIndex: -1 }} />

      {/* Hero Section */}
      {blog.coverImage && (
        <section className={styles.heroSection}>
          <div className={styles.heroImageWrapper}>
            <img
              src={blog.coverImage}
              alt={blog.title}
              className={styles.heroImage}
              onLoad={() => {}}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className={styles.heroGrain} />
            <div className={styles.heroOverlay} />
          </div>
          <div className={styles.heroContent}>
            <div className={styles.categoryBadge}>{currentTheme.display}</div>
            <h1 className={styles.title}>{blog.title}</h1>
            {subtitle && <p className={styles.subheadingText}>{subtitle}</p>}
            <div className={styles.metaInfo}>
              <p className={styles.date}>{metaText}</p>
              {viewCount > 0 && <p className={styles.viewCount}>{viewCount} views</p>}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <div className={styles.mainContentWrapper}>
  <section className={styles.postContentSection}>
    {!blog.coverImage && (
      <>
        <div className={`${styles.titleLine} ${styles[currentTheme.name]}`}></div>
        <div className={styles.categoryBadge}>{currentTheme.display}</div>
        <h1 className={styles.contentTitle}>{blog.title}</h1>
        {/* ✅ COMPLETELY REMOVED: No subtitle anywhere in content section */}
        <div className={styles.contentMeta}>
          <p className={styles.contentDate}>{metaText}</p>
          {viewCount > 0 && <p className={styles.contentViews}>{viewCount} views</p>}
        </div>
      </>
    )}
    
    <div className={styles.contentBodyPlaceholder}>
  <BlogRenderer content={blog.content} subtitle={subtitle} />
</div>

  </section>


        {/* Comments Section */}
        <section className={styles.commentSection}>
          <div className={styles.commentSectionHeader}>
            <h3>Discussion</h3>
            {commentsData.stats && (
              <div className={styles.commentStats}>
                <span>{commentsData.stats.totalComments} comment{commentsData.stats.totalComments !== 1 ? 's' : ''}</span>
                {commentsData.stats.totalReplies > 0 && (
                  <span>, {commentsData.stats.totalReplies} repl{commentsData.stats.totalReplies !== 1 ? 'ies' : 'y'}</span>
                )}
              </div>
            )}
          </div>

          <div className={styles.commentLayout}>
            {/* ✅ FIXED: Comments List with proper safety checks */}
            <div className={styles.commentList}>
              {commentsLoading ? (
                <div className={styles.commentsLoading}>
                  <p>Loading comments...</p>
                </div>
              ) : (
                // ✅ Add explicit array check before mapping
                Array.isArray(commentsData.comments) && commentsData.comments.length > 0 ? (
                  commentsData.comments.map((comment) => (
                    <CommentBox
                      key={comment.id || `comment-${Math.random()}`}
                      comment={comment}
                      depth={0}
                      onReply={handleReplyClick}
                      isReplying={isReplying}
                      replyForm={replyForm}
                      setReplyForm={setReplyForm}
                      handleReplySubmit={handleReplySubmit}
                    />
                  ))
                ) : (
                  <div className={styles.noComments}>
                    <p>No comments yet. Be the first to share your thoughts!</p>
                  </div>
                )
              )}
            </div>

            {/* Comment Form */}
            <div className={styles.commentFormContainer}>
              <form className={styles.commentForm} onSubmit={handleSubmit}>
                <h3>Share your thoughts</h3>
                
                <div className={styles.formGroup}>
                  <label htmlFor="nameInput">Name *</label>
                  <input
                    id="nameInput"
                    type="text"
                    value={form.name}
                    onChange={formHandlers.name}
                    required
                    maxLength={100}
                    disabled={submitLoading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="emailInput">Email *</label>
                  <input
                    id="emailInput"
                    type="email"
                    value={form.email}
                    onChange={formHandlers.email}
                    required
                    disabled={submitLoading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="commentTextarea">Comment *</label>
                  <textarea
                    id="commentTextarea"
                    rows={5}
                    value={form.comment}
                    onChange={formHandlers.comment}
                    required
                    maxLength={2000}
                    disabled={submitLoading}
                    placeholder="Share your thoughts, questions, or insights about this post..."
                  />
                  <div className={styles.characterCount}>
                    {form.comment.length}/2000 characters
                  </div>
                </div>

                <button type="submit" className={styles.postBtn} disabled={submitLoading}>
                  {submitLoading ? 'Posting...' : 'Post Comment'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Uniblog;
