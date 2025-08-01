// src/pages/HistoryPage/HistoryBlog.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './HistoryBlog.module.css';
import { useDarkMode } from '../../context/DarkModeContext'; // adjust path if needed
import BlogRenderer from '../../components/BlogRenderer';

const HistoryBlog = () => {
  const { id } = useParams();
  const { darkMode } = useDarkMode();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', comment: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // API endpoints
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const blogApiUrl = `${API_BASE}/blogs/history/${id}.json`;
  const commentsApiUrl = `${API_BASE}/api/comments/history/${id}`;
  const viewsApiUrl = `${API_BASE}/api/views/history/${id}`;

  // Fetch blog and trigger view increment
  useEffect(() => {
    const fetchAndTrackBlog = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(blogApiUrl);
        if (!res.ok) throw new Error(`Blog fetch failed: HTTP status ${res.status}`);
        const data = await res.json();
        setBlog(data);

        // Count a view (fire and forget)
        fetch(viewsApiUrl, { method: 'POST' }).catch(() => {});
      } catch (err) {
        setError(err.message || 'Failed to load blog');
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAndTrackBlog();
  }, [id]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(commentsApiUrl);
        if (res.ok) {
          const data = await res.json();
          setComments(data);
        } else {
          setComments([]);
        }
      } catch {
        setComments([]);
      }
    };
    fetchComments();
  }, [id]);

  // Submit comment handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.comment) {
      alert('Please fill in all fields.');
      return;
    }
    const newComment = { ...form, timestamp: new Date().toISOString() };
    try {
      const res = await fetch(commentsApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComment),
      });
      if (res.ok) {
        const saved = await res.json();
        setComments((prev) => [...prev, saved]);
        setForm({ name: '', email: '', comment: '' });
      } else {
        alert('Failed to post comment.');
      }
    } catch {
      alert('Failed to post comment.');
    }
  };

  if (loading) {
    return (
      <div className={`${styles.blogPageOuterContainer} ${darkMode ? styles.darkMode : ''}`}>
        <div className={styles.mainContentWrapper}>
          <p>Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.blogPageOuterContainer} ${darkMode ? styles.darkMode : ''}`}>
        <div className={styles.mainContentWrapper}>
          <p style={{ color: 'red' }}>Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className={`${styles.blogPageOuterContainer} ${darkMode ? styles.darkMode : ''}`}>
        <div className={styles.mainContentWrapper}>
          <p>Blog post not found.</p>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(blog.date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const metaText = `On ${formattedDate}${blog.author ? `, By ${blog.author}` : ''}`;

  return (
    <div className={`${styles.blogPageOuterContainer} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.mainContentWrapper}>
        {/* Blog content */}
        <section className={styles.postContentSection}>
          <h1 className={styles.title}>{blog.title}</h1>
          <p className={styles.date}>{metaText}</p>

          {blog.coverImage && (
            <img
              src={blog.coverImage}
              alt="Cover"
              className={styles.inlineImage}
              style={{ marginBottom: '20px' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}

          <div className={styles.contentBodyPlaceholder}>
            <BlogRenderer content={blog.content} />
          </div>
        </section>

        {/* Comments */}
        <section className={styles.commentSection}>
          <div className={styles.commentList}>
            {comments.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>No comments yet. Be the first!</p>
            ) : (
              comments.map((c, i) => (
                <div key={i} className={styles.commentBox}>
                  <strong>{c.name} says:</strong>
                  <div className={styles.commentMeta}>
                    {new Date(c.timestamp).toLocaleString()}
                  </div>
                  <p>{c.comment}</p>
                  <button className={styles.replyBtn}>Reply</button>
                </div>
              ))
            )}
          </div>

          <form className={styles.commentForm} onSubmit={handleSubmit}>
            <h3>Share your thoughts</h3>

            <label htmlFor="nameInput">Name</label>
            <input
              id="nameInput"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />

            <label htmlFor="emailInput">Email</label>
            <input
              id="emailInput"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />

            <label htmlFor="commentTextarea">Comment</label>
            <textarea
              id="commentTextarea"
              rows={5}
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              required
            />

            <button type="submit" className={styles.postBtn}>Post</button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default HistoryBlog;
