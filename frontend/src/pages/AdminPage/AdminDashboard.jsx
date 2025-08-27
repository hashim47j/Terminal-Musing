import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [totalPosts, setTotalPosts] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [postsByCategory, setPostsByCategory] = useState({});
  const [viewsByCategory, setViewsByCategory] = useState({});
  const [viewsPerPost, setViewsPerPost] = useState({});
  const [dailyRequests, setDailyRequests] = useState([]);
  
  // ✅ NEW: Author-related stats
  const [postsByAuthor, setPostsByAuthor] = useState({});
  const [totalAuthors, setTotalAuthors] = useState(0);
  const [recentPosts, setRecentPosts] = useState([]);

  const [visitorStats, setVisitorStats] = useState({
    totalVisits: 0,
    uniqueIPs: 0,
    osCounts: {},
    browserCounts: {},
  });

  const [showPopup, setShowPopup] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // ✅ UPDATED: Categories list with proper mapping
  const categories = [
    'Philosophy',
    'History', 
    'Writings',
    'Legal & Social Issues', // ✅ UPDATED: Better display name
    'Tech',
  ];

  const categoryMapping = {
    'Philosophy': 'philosophy',
    'History': 'history',
    'Writings': 'writings',
    'Legal & Social Issues': 'lsconcern',
    'Tech': 'tech'
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/stats');
        if (!res.ok) throw new Error(`Failed with status ${res.status}`);
        const data = await res.json();
        setTotalPosts(data.totalPosts ?? 0);
        setTotalViews(data.totalViews ?? 0);
        setPostsByCategory(data.postsByCategory ?? {});
        setViewsByCategory(data.viewsByCategory ?? {});
        setViewsPerPost(data.viewsPerPost ?? {});
      } catch (err) {
        console.error('❌ Failed to load dashboard stats:', err);
      }
    };

    // ✅ NEW: Fetch author and recent posts statistics
    const fetchBlogStats = async () => {
      try {
        const res = await fetch('/api/blogs');
        if (!res.ok) throw new Error(`Failed with status ${res.status}`);
        const blogs = await res.json();

        if (Array.isArray(blogs)) {
          // Calculate author statistics
          const authorCounts = {};
          let uniqueAuthors = new Set();

          blogs.forEach(blog => {
            const author = blog.author || 'Terminal Musing';
            authorCounts[author] = (authorCounts[author] || 0) + 1;
            uniqueAuthors.add(author);
          });

          setPostsByAuthor(authorCounts);
          setTotalAuthors(uniqueAuthors.size);

          // Get recent posts (last 5)
          const sortedBlogs = blogs
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5)
            .map(blog => ({
              id: blog.id,
              title: blog.title,
              category: blog.category,
              author: blog.author || 'Terminal Musing',
              date: new Date(blog.date).toLocaleDateString(),
            }));

          setRecentPosts(sortedBlogs);
        }
      } catch (err) {
        console.error('❌ Failed to fetch blog stats:', err);
      }
    };

    const fetchDailyRequests = async () => {
      try {
        const res = await fetch('/api/dailythoughts/manage/pending');
        if (!res.ok) throw new Error(`Failed with status ${res.status}`);
        const thoughts = await res.json();
        setDailyRequests(Array.isArray(thoughts) ? thoughts : []);
      } catch (err) {
        console.error('❌ Failed to fetch pending thoughts:', err);
        setDailyRequests([]);
      }
    };

    const fetchVisitorStats = async () => {
      try {
        const res = await fetch('/api/visitorstats');
        if (!res.ok) throw new Error(`Failed with status ${res.status}`);
        const data = await res.json();
        setVisitorStats({
          totalVisits: data.totalVisits ?? 0,
          uniqueIPs: data.uniqueIPs ?? 0,
          osCounts: data.osDistribution ?? {},
          browserCounts: data.browserDistribution ?? {},
        });
      } catch (err) {
        console.error('❌ Failed to fetch visitor stats:', err);
      }
    };

    fetchStats();
    fetchBlogStats(); // ✅ NEW: Fetch blog statistics
    fetchDailyRequests();
    fetchVisitorStats();
  }, []);

  const handlePostClick = () => navigate('/admin/');
  const handleEdit = () => navigate('/admin/dailythoughts/edit');

  const handleApprove = async (id) => {
    if (!id) return console.error('❌ No ID provided for approval');

    try {
      const res = await fetch(`/api/dailythoughts/process/approve/${id}`, {
        method: 'POST',
      });
      const result = await res.json();
      console.log('✅ Approval result:', result);
      setDailyRequests(prev => prev.filter(req => req.id !== id));
      if (selectedRequest?.id === id) {
        setShowPopup(false);
        setSelectedRequest(null);
      }
    } catch (err) {
      console.error('❌ Approval failed:', err);
    }
  };

  const getCount = (map, category) => {
    const backendCategory = categoryMapping[category] || category.toLowerCase();
    return map?.[backendCategory] || 0;
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <h1>📊 Admin Dashboard</h1>
        <button className={styles.postBtn} onClick={handlePostClick}>
          ✍️ Create New Post
        </button>
      </div>

      {/* ✅ ENHANCED: Top stats row */}
      <div className={styles.topRow}>
        <div className={styles.box}>
          <h2>📝 Total Posts</h2>
          <p className={styles.bigNumber}>{totalPosts}</p>
        </div>
        <div className={styles.box}>
          <h2>👀 Total Views</h2>
          <p className={styles.bigNumber}>{totalViews}</p>
        </div>
        <div className={styles.box}>
          <h2>👥 Total Authors</h2>
          <p className={styles.bigNumber}>{totalAuthors}</p>
        </div>
        <div className={styles.box}>
          <h2>🌍 Unique Visitors</h2>
          <p className={styles.bigNumber}>{visitorStats.uniqueIPs}</p>
        </div>
      </div>

      <div className={styles.middleRow}>
        <div className={styles.box}>
          <h3>📊 Posts by Category</h3>
          <div className={styles.statsList}>
            {categories.map((cat) => (
              <div key={cat} className={styles.statItem}>
                <span className={styles.statLabel}>{cat}</span>
                <span className={styles.statValue}>{getCount(postsByCategory, cat)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.box}>
          <h3>📈 Views by Category</h3>
          <div className={styles.statsList}>
            {categories.map((cat) => (
              <div key={cat} className={styles.statItem}>
                <span className={styles.statLabel}>{cat}</span>
                <span className={styles.statValue}>{getCount(viewsByCategory, cat)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ NEW: Author statistics */}
      <div className={styles.bottomRow}>
        <div className={styles.box}>
          <h3>✍️ Posts by Author</h3>
          <div className={styles.statsList}>
            {Object.entries(postsByAuthor).length > 0 ? (
              Object.entries(postsByAuthor)
                .sort(([,a], [,b]) => b - a) // Sort by post count
                .slice(0, 10) // Show top 10 authors
                .map(([author, count]) => (
                  <div key={author} className={styles.statItem}>
                    <span className={styles.statLabel}>{author}</span>
                    <span className={styles.statValue}>{count}</span>
                  </div>
                ))
            ) : (
              <p>No author data yet.</p>
            )}
          </div>
        </div>

        {/* ✅ NEW: Recent posts */}
        <div className={styles.box}>
          <h3>🕐 Recent Posts</h3>
          <div className={styles.recentPostsList}>
            {recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <div key={post.id} className={styles.recentPost}>
                  <div className={styles.postTitle}>{post.title}</div>
                  <div className={styles.postMeta}>
                    <span className={styles.postAuthor}>by {post.author}</span>
                    <span className={styles.postCategory}>{post.category}</span>
                    <span className={styles.postDate}>{post.date}</span>
                  </div>
                </div>
              ))
            ) : (
              <p>No recent posts found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Views per post */}
      <div className={styles.box}>
        <h3>📊 Top Performing Posts</h3>
        <div className={styles.statsList}>
          {Object.entries(viewsPerPost).length > 0 ? (
            Object.entries(viewsPerPost)
              .sort(([,a], [,b]) => b - a) // Sort by views descending
              .slice(0, 10) // Show top 10
              .map(([postId, count]) => (
                <div key={postId} className={styles.statItem}>
                  <span className={styles.statLabel}>{postId}</span>
                  <span className={styles.statValue}>{count} views</span>
                </div>
              ))
          ) : (
            <p>No view data yet.</p>
          )}
        </div>
      </div>

      {/* Visitor Stats */}
      <div className={styles.box}>
        <h3>🌐 Visitor Analytics</h3>
        <div className={styles.visitorStats}>
          <div className={styles.statGroup}>
            <h4>Total Visits: {visitorStats.totalVisits}</h4>
            <h4>Unique IPs: {visitorStats.uniqueIPs}</h4>
          </div>
          
          <div className={styles.distributionStats}>
            <div className={styles.distributionGroup}>
              <h4>🖥️ OS Distribution</h4>
              <div className={styles.statsList}>
                {Object.entries(visitorStats.osCounts).map(([os, count]) => (
                  <div key={os} className={styles.statItem}>
                    <span className={styles.statLabel}>{os}</span>
                    <span className={styles.statValue}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className={styles.distributionGroup}>
              <h4>🌐 Browser Distribution</h4>
              <div className={styles.statsList}>
                {Object.entries(visitorStats.browserCounts).map(([browser, count]) => (
                  <div key={browser} className={styles.statItem}>
                    <span className={styles.statLabel}>{browser}</span>
                    <span className={styles.statValue}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Thoughts */}
      <div className={styles.box}>
        <h3>💭 Daily Thoughts Requests ({dailyRequests.length})</h3>
        <div className={styles.requestsList}>
          {dailyRequests.length > 0 ? (
            dailyRequests.map((req) => (
              <div
                key={req._id || req.id}
                className={styles.requestItem}
                onClick={() => {
                  setSelectedRequest(req);
                  setShowPopup(true);
                }}
              >
                <div className={styles.requestName}>{req.name}</div>
                <div className={styles.requestPreview}>
                  {req.content?.substring(0, 100)}...
                </div>
              </div>
            ))
          ) : (
            <p>No pending thoughts found.</p>
          )}
        </div>
      </div>

      {/* Popup Modal */}
      {showPopup && selectedRequest && (
        <div className={styles.popupOverlay} onClick={() => setShowPopup(false)}>
          <div className={styles.popupCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.popupHeader}>
              <h2>{selectedRequest.name}</h2>
              <button 
                className={styles.closeBtn}
                onClick={() => setShowPopup(false)}
              >
                ✕
              </button>
            </div>
            
            <div className={styles.popupContent}>
              <div className={styles.popupField}>
                <strong>Author:</strong> {selectedRequest.authorName || selectedRequest.name}
              </div>
              <div className={styles.popupField}>
                <strong>Thought:</strong>
                <p>{selectedRequest.content}</p>
              </div>
              <div className={styles.popupField}>
                <strong>Email:</strong> {selectedRequest.contact}
              </div>
              {selectedRequest.social && (
                <div className={styles.popupField}>
                  <strong>Social:</strong> {selectedRequest.social}
                </div>
              )}
            </div>
            
            <div className={styles.popupActions}>
              <button 
                className={styles.approveBtn} 
                onClick={() => handleApprove(selectedRequest.id)}
              >
                ✅ Approve
              </button>
              <button className={styles.editBtn} onClick={handleEdit}>
                ✏️ Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
