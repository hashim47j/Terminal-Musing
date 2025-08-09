import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import styles from './LsconcernBlog.module.css';
import { useDarkMode } from '../../context/DarkModeContext';
import BlogRenderer from '../../components/BlogRenderer';
import { PageContext } from '../../context/PageContext'; // ADD: Import PageContext

const LsconcernBlog = () => {
  const { id } = useParams();
  const { darkMode } = useDarkMode();
  const { setPageTitle } = useContext(PageContext); // ADD: Get setPageTitle from context

  const [blog, setBlog] = useState(null);
  const [blogCategory, setCategory] = useState(null);   // 'legal' or 'social issues'
  const [comments, setComments] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', comment: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- helper to try a category ---
  const fetchBlogByCategory = async (cat) => {
    const url = `/api/blogs/${encodeURIComponent(cat)}/${id}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Not found');
    return { data: await res.json(), cat };
  };

  // --- load blog ---
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      setBlog(null);
      setCategory(null);

      try {
        // 1) legal
        const { data } = await fetchBlogByCategory('legal');
        setBlog(data);
        setCategory('legal');
        // ADD: Set page title for navbar
        if (data && data.title) {
          setPageTitle(data.title);
        }
        fetch(`/api/views/legal/${id}`, { method: 'POST' }).catch(() => {});
      } catch {
        try {
          // 2) social issues
          const { data } = await fetchBlogByCategory('social issues');
          setBlog(data);
          setCategory('social issues');
          // ADD: Set page title for navbar
          if (data && data.title) {
            setPageTitle(data.title);
          }
          fetch(`/api/views/${encodeURIComponent('social issues')}/${id}`, { method: 'POST' }).catch(() => {});
        } catch {
          setError('Blog not found.');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
    
    // ADD: Cleanup function to reset page title when component unmounts
    return () => {
      setPageTitle(null);
    };
  }, [id, setPageTitle]);

  // --- load comments whenever category known ---
  useEffect(() => {
    const loadComments = async () => {
      if (!blogCategory) { setComments([]); return; }
      try {
        const url = `/api/comments/${encodeURIComponent(blogCategory)}/${id}`;
        const res = await fetch(url);
        setComments(res.ok ? await res.json() : []);
      } catch {
        setComments([]);
      }
    };
    loadComments();
  }, [blogCategory, id]);

  // --- submit comment ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.comment) {
      alert('Please fill in all fields.'); return;
    }
    if (!blogCategory) { alert('Unknown category for this blog.'); return; }

    const newComment = { ...form, timestamp: new Date().toISOString() };
    try {
      const url = `/api/comments/${encodeURIComponent(blogCategory)}/${id}`;
      const res = await fetch(url, {
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

  // --- conditional renders ---
  if (loading) {
    return (
      <div className={`${styles.blogPageOuterContainer} ${darkMode ? styles.darkMode : ''}`}>
        <div className={styles.mainContentWrapper}><p>Loading blog post...</p></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className={`${styles.blogPageOuterContainer} ${darkMode ? styles.darkMode : ''}`}>
        <div className={styles.mainContentWrapper}><p style={{ color: 'red' }}>{error}</p></div>
      </div>
    );
  }
  if (!blog) {
    return (
      <div className={`${styles.blogPageOuterContainer} ${darkMode ? styles.darkMode : ''}`}>
        <div className={styles.mainContentWrapper}><p>Blog not found.</p></div>
      </div>
    );
  }

  // --- meta ---
  const formattedDate = new Date(blog.date).toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  const metaText = `On ${formattedDate}${blog.author ? `, By ${blog.author}` : ''}`;

  // --- render ---
  return (
    <div 
      className={`${styles.blogPageOuterContainer} ${darkMode ? styles.darkMode : ''}`}
      style={{ position: 'relative', zIndex: 1, paddingTop: '120px' }} // ADD: z-index fix and padding
    >
      {/* ADD: COLOR SENSOR - invisible div to trigger navbar color change */}
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
        {/* post */}
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
            <BlogRenderer content={blog.content} />
          </div>
        </section>

        {/* comments */}
        <section className={styles.commentSection}>
          <div className={styles.commentList}>
            {comments.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>No comments yet. Be the first!</p>
            ) : (
              comments.map((c, i) => (
                <div key={i} className={styles.commentBox}>
                  <strong>{c.name} says:</strong>
                  <div className={styles.commentMeta}>{new Date(c.timestamp).toLocaleString()}</div>
                  <p>{c.comment}</p>
                </div>
              ))
            )}
          </div>

          <form className={styles.commentForm} onSubmit={handleSubmit}>
            <h3>Share your thoughts</h3>
            <label>Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <label>Comment</label>
            <textarea
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

export default LsconcernBlog;
