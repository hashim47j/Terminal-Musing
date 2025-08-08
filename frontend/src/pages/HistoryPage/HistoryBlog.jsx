// src/pages/HistoryPage/HistoryBlog.jsx
import React, { useEffect, useState, useContext } from 'react'; // Add useContext
import { useParams } from 'react-router-dom';
import styles from './HistoryBlog.module.css';
import { useDarkMode } from '../../context/DarkModeContext';
import BlogRenderer from '../../components/BlogRenderer';
import { PageContext } from '../../context/PageContext'; // 1. Import our shared context

const HistoryBlog = () => {
  const { id }          = useParams();
  const { darkMode }    = useDarkMode();
  const { setPageTitle } = useContext(PageContext); // 2. Get the function to set the title

  const [blog, setBlog]       = useState(null);
  const [comments, setComments] = useState([]);
  const [form, setForm]       = useState({ name: '', email: '', comment: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  // ----------- ENDPOINTS -----------
  const blogApiUrl     = `/api/blogs/history/${id}`;
  const commentsApiUrl = `/api/comments/history/${id}`;
  const viewsApiUrl    = `/api/views/history/${id}`;

  // ----------- FETCH BLOG + REGISTER VIEW -----------
  useEffect(() => {
    const fetchAndTrackBlog = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(blogApiUrl);
        if (!res.ok) throw new Error(`Blog fetch failed: HTTP ${res.status}`);
        const data = await res.json();
        setBlog(data);

        // 3. SET THE TITLE in the shared context after fetching the blog
        if (data && data.title) {
          setPageTitle(data.title);
        }

        // fire-and-forget view count
        fetch(viewsApiUrl, { method: 'POST' }).catch(() => {});
      } catch (err) {
        setError(err.message || 'Failed to load blog');
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAndTrackBlog();

    // 4. CLEAN UP when the user navigates away
    // This resets the title so the next page doesn't show it.
    return () => {
      setPageTitle(null);
    };
  }, [id, blogApiUrl, viewsApiUrl, setPageTitle]); // Add setPageTitle to dependencies

  // ... (The rest of your component, including fetching comments, submitting, and all JSX, remains completely unchanged) ...

  // ----------- FETCH COMMENTS -----------
  useEffect(() => {
    // ... no changes here ...
  }, [id, commentsApiUrl]);

  // ----------- SUBMIT COMMENT -----------
  const handleSubmit = async (e) => {
    // ... no changes here ...
  };

  // ----------- CONDITIONAL RENDERS -----------
  if (loading) {
    // ... no changes here ...
  }
  if (error) {
    // ... no changes here ...
  }
  if (!blog) {
    // ... no changes here ...
  }

  const formattedDate = new Date(blog.date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const metaText = `On ${formattedDate}${blog.author ? `, By ${blog.author}` : ''}`;

  // ----------- MAIN RENDER -----------
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
              style={{ marginBottom: 20 }}
              onError={(e) => (e.target.style.display = 'none')}
            />
          )}

          <div className={styles.contentBodyPlaceholder}>
            <BlogRenderer content={blog.content} />
          </div>
        </section>

        {/* Comments */}
        <section className={styles.commentSection}>
          {/* ... no changes here ... */}
        </section>
      </div>
    </div>
  );
};

export default HistoryBlog;
