import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './TechBlog.module.css';
import { useDarkMode } from '../../context/DarkModeContext';
import BlogRenderer from '../../components/BlogRenderer';

const TechBlog = () => {
  const { id } = useParams();
  const { darkMode } = useDarkMode();

  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', comment: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const categoryFolder = 'android & linux'; // exact backend folder

  const blogApiUrl = `${API_BASE}/blogs/${categoryFolder}/${id}.json`;
  const commentsApiUrl = `${API_BASE}/api/comments/${categoryFolder}/${id}`;
  const viewsApiUrl = `${API_BASE}/api/views/${categoryFolder}/${id}`;

  useEffect(() => {
    const fetchAndTrackBlog = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(blogApiUrl);
        if (!res.ok) throw new Error(`Blog fetch failed with status ${res.status}`);
        const data = await res.json();
        setBlog(data);

        // Increment view count (fire and forget)
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

  // Comment submission handler omitted for brevity (same as your existing pattern)

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
          <p>Blog not found.</p>
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
        <section className={styles.postContentSection}>
          <h1 className={styles.title}>{blog.title}</h1>
          <p className={styles.date}>{metaText}</p>

          {blog.coverImage && (
            <img
              src={blog.coverImage}
              alt="Cover"
              className={styles.inlineImage}
              style={{ marginBottom: '20px' }}
              onError={e => (e.target.style.display = 'none')}
            />
          )}

          <div className={styles.contentBodyPlaceholder}>
            <BlogRenderer content={blog.content} />
          </div>
        </section>

        {/* Comments section and comment form here (unchanged) */}
      </div>
    </div>
  );
};

export default TechBlog;
