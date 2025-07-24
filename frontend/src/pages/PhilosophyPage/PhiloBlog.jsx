import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import styles from './PhiloBlog.module.css';
import { useDarkMode } from '../../context/DarkModeContext';

const PhiloBlog = () => {
  const { id } = useParams();
  const { darkMode } = useDarkMode();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', comment: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navbarBgRef = useRef(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const blogApiUrl = `${API_BASE}/blogs/philosophy/${id}.json`;
  const commentsApiUrl = `${API_BASE}/api/comments/philosophy/${id}`;
  const viewsApiUrl = `${API_BASE}/api/views/philosophy/${id}`;

  // Fetch blog + count view
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(blogApiUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setBlog(data);

        // Register view
        await fetch(viewsApiUrl, { method: 'POST' });
      } catch (err) {
        console.error('❌ Blog fetch error:', err);
        setError('Blog not found or an error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(commentsApiUrl);
        if (res.ok) {
          const data = await res.json();
          setComments(data);
        }
      } catch (err) {
        console.error('❌ Comment fetch error:', err);
      }
    };
    fetchComments();
  }, [id]);

  // Submit comment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.comment) {
      alert('Please fill all fields.');
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
        setComments([...comments, saved]);
        setForm({ name: '', email: '', comment: '' });
      } else {
        const errData = await res.json();
        alert(`Failed to post comment: ${errData.message || res.statusText}`);
      }
    } catch (err) {
      console.error('❌ Comment post error:', err);
      alert('Failed to post comment.');
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>❌ {error}</div>;
  if (!blog) return <div className={styles.error}>❌ Blog not found.</div>;

  const formattedDate = new Date(blog.date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
  });
  const metaText = `On ${formattedDate}${blog.author ? `, By ${blog.author}` : ''}`;

  return (
    <div className={`${styles.blogPageOuterContainer} ${darkMode ? styles.darkMode : ''}`}>
      <div
        ref={navbarBgRef}
        data-navbar-bg-detect
        style={{
          position: 'absolute',
          top: 0,
          height: '80px',
          width: '100%',
        }}
      />

      <div className={styles.mainContentWrapper}>
        <section className={styles.postContentSection}>
          <h1 className={styles.title}>{blog.title}</h1>
          <p className={styles.date}>{metaText}</p>

          {blog.coverImage && (
            <img
              src={blog.coverImage}
              alt="Cover"
              className={styles.inlineImage}
              style={{ marginBottom: '20px' }}
              onError={(e) => (e.target.style.display = 'none')}
            />
          )}

          <div className={styles.contentBodyPlaceholder}>
            {blog.content.map((block, index) => {
              if (block.type === 'paragraph') {
                return (
                  <p key={index} className={styles.paragraph}>
                    {block.text}
                  </p>
                );
              } else if (block.type === 'image') {
                return (
                  <img
                    key={index}
                    src={block.src}
                    alt={block.alt || 'Blog image'}
                    className={styles.inlineImage}
                    onError={(e) => {
                      console.warn('Image load failed:', block.src);
                      e.target.replaceWith(document.createTextNode('[Image not found]'));
                    }}
                  />
                );
              }
              return null;
            })}
          </div>
        </section>

        <section className={styles.commentSection}>
          <div className={styles.commentList}>
            {comments.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>
                No comments yet. Be the first!
              </p>
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
            <button type="submit" className={styles.postBtn}>
              Post
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default PhiloBlog;