// src/pages/HistoryPage/HistoryBlog.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import styles from './HistoryBlog.module.css';
import { useDarkMode } from '../../context/DarkModeContext';
import BlogRenderer from '../../components/BlogRenderer';
import { PageContext } from '../../context/PageContext';

const HistoryBlog = () => {
  const { id } = useParams();
  const { darkMode } = useDarkMode();
  const { setPageTitle } = useContext(PageContext);

  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', comment: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const blogApiUrl = `/api/blogs/history/${id}`;
  const commentsApiUrl = `/api/comments/history/${id}`;
  const viewsApiUrl = `/api/views/history/${id}`;

  useEffect(() => {
    const fetchAndTrackBlog = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(blogApiUrl);
        if (!res.ok) throw new Error(`Blog fetch failed: HTTP ${res.status}`);
        const data = await res.json();
        setBlog(data);
        if (data && data.title) {
          setPageTitle(data.title);
        }
        fetch(viewsApiUrl, { method: 'POST' }).catch(() => {});
      } catch (err) {
        setError(err.message || 'Failed to load blog');
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAndTrackBlog();
    return () => {
      setPageTitle(null);
    };
  }, [id, blogApiUrl, viewsApiUrl, setPageTitle]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(commentsApiUrl);
        if (res.ok) {
          const data = await res.json();
          setComments(Array.isArray(data) ? data : []);
        } else {
          setComments([]);
        }
      } catch {
        setComments([]);
      }
    };
    fetchComments();
  }, [id, commentsApiUrl]);

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
    <div
      className={`${styles.blogPageOuterContainer} ${darkMode ? styles.darkMode : ''}`}
      style={{ position: 'relative', zIndex: 1, paddingTop: '120px' }}
    >
      {/* COLOR SENSOR: Add this invisible div at the top to trigger navbar color change */}
      <div 
        data-navbar-bg-detect 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '200px', 
          pointerEvents: 'none',
          zIndex: -1 
        }} 
      />
      <h1 className={styles.title}>{blog.title}</h1>
      <div className={styles.mainContentWrapper}>
        <section className={styles.postContentSection}>
          <div className={styles.titleLine}></div>   
          <p className={styles.date}>{metaText}</p>
          {blog.coverImage && (
            <img
              src={blog.coverImage}
              alt="Cover"
              className={styles.inlineImage}
              style={{ marginBottom: 20 }}
              onError={(e) => (e.target.style.display = 'none')}
            />
          )}
          <div className={styles.contentBodyPlaceholder}>
            <BlogRenderer content={blog.content} />
          </div>
        </section>

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
