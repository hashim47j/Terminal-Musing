import React, { useEffect, useState, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import styles from './PhiloBlog.module.css';
import { useDarkMode } from '../../context/DarkModeContext';
import { PageContext } from '../../context/PageContext'; // ADD: Import PageContext

const PhiloBlog = () => {
  const { id } = useParams();
  const { darkMode } = useDarkMode();
  const { setPageTitle } = useContext(PageContext); // ADD: Get setPageTitle from context

  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', comment: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navbarBgRef = useRef(null);

  // ---------------- API ENDPOINTS ----------------
  const blogApiUrl = `/api/blogs/philosophy/${id}`;
  const commentsApiUrl = `/api/comments/philosophy/${id}`;
  const viewsApiUrl = `/api/views/philosophy/${id}`;

  // ---------------- FETCH BLOG (and record view) --------------
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(blogApiUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setBlog(data);

        // ADD: Set page title for navbar
        if (data && data.title) {
          setPageTitle(data.title);
        }

        // register a view but ignore errors
        fetch(viewsApiUrl, { method: 'POST' }).catch(() => {});
      } catch (err) {
        console.error('❌ Blog fetch error:', err);
        setError('Blog not found or an error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
    
    // ADD: Cleanup function
    return () => {
      setPageTitle(null);
    };
  }, [id, setPageTitle]);

  // ---------------- FETCH COMMENTS ----------------
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(commentsApiUrl);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setComments(data);
        }
      } catch (err) {
        console.error('❌ Comment fetch error:', err);
      }
    };
    fetchComments();
  }, [id]);

  // ---------------- SUBMIT COMMENT ----------------
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

  // ---------------- RENDER ----------------
  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>❌ {error}</div>;
  if (!blog) return <div className={styles.error}>❌ Blog not found.</div>;

  const formattedDate = new Date(blog.date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
  });
  const metaText = `On ${formattedDate}${blog.author ? `, By ${blog.author}` : ''}`;

  return (
    <div 
      className={`${styles.blogPageOuterContainer} ${darkMode ? styles.darkMode : ''}`}
      style={{ position: 'relative', zIndex: 1, paddingTop: '120px' }} // ADD: z-index fix and padding
    >
      {/* UPDATED: Better positioned color sensor */}
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

      <div className={styles.mainContentWrapper}>
        {/* ---------- POST CONTENT ---------- */}
        <section className={styles.postContentSection}>
          <h1 className={styles.title}>{blog.title}</h1>
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
            {(blog.content || []).map((block, index) => {
              if (block.type === 'paragraph') {
                return (
                  <p key={index} className={styles.paragraph}>
                    {block.text}
                  </p>
                );
              }
              if (block.type === 'image') {
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

        {/* ---------- COMMENTS ---------- */}
        <section className={styles.commentSection}>
          <div className={styles.commentList}>
            {comments.length === 0 ? (
              <p className={styles.noComments}>No comments yet. Be the first!</p>
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
