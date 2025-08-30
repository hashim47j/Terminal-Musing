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
  
  // Author-related stats
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
  
  // ✅ NEW: All Blogs Modal States
  const [showAllBlogsModal, setShowAllBlogsModal] = useState(false);
  const [allBlogs, setAllBlogs] = useState({});
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(false);

  // Categories list with proper mapping
  const categories = [
    'Philosophy',
    'History', 
    'Writings',
    'Legal & Social Issues',
    'Tech',
  ];

  const categoryMapping = {
    'Philosophy': 'philosophy',
    'History': 'history',
    'Writings': 'writings',
    'Legal & Social Issues': 'lsconcern',
    'Tech': 'tech'
  };

  // Reverse mapping for display
  const displayCategoryMapping = {
    'philosophy': 'Philosophy',
    'history': 'History',
    'writings': 'Writings',
    'lsconcern': 'Legal & Social Issues',
    'tech': 'Tech'
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
    fetchBlogStats();
    fetchDailyRequests();
    fetchVisitorStats();
  }, []);

  // ✅ NEW: Fetch all blogs for the modal
  const fetchAllBlogs = async () => {
    setIsLoadingBlogs(true);
    try {
      const res = await fetch('/api/blogs');
      if (!res.ok) throw new Error(`Failed with status ${res.status}`);
      const blogs = await res.json();

      if (Array.isArray(blogs)) {
        // Group blogs by category
        const groupedBlogs = {};
        blogs.forEach(blog => {
          const category = blog.category || 'uncategorized';
          if (!groupedBlogs[category]) {
            groupedBlogs[category] = [];
          }
          groupedBlogs[category].push({
            id: blog.id,
            title: blog.title,
            author: blog.author || 'Terminal Musing',
            date: new Date(blog.date || blog.updatedAt).toLocaleDateString(),
            category: blog.category
          });
        });

        // Sort blogs within each category by date (newest first)
        Object.keys(groupedBlogs).forEach(category => {
          groupedBlogs[category].sort((a, b) => new Date(b.date) - new Date(a.date));
        });

        setAllBlogs(groupedBlogs);
      }
    } catch (err) {
      console.error('❌ Failed to fetch all blogs:', err);
      setAllBlogs({});
    } finally {
      setIsLoadingBlogs(false);
    }
  };

  // ✅ NEW: Handle blog deletion
  const handleDeleteBlog = async (category, blogId, blogTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${blogTitle}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/blogs/${category}/${blogId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error(`Failed to delete blog: ${res.status}`);
      }

      const result = await res.json();
      console.log('✅ Blog deleted:', result);

      // Remove the blog from the local state
      setAllBlogs(prev => {
        const updated = { ...prev };
        if (updated[category]) {
          updated[category] = updated[category].filter(blog => blog.id !== blogId);
          // Remove category if empty
          if (updated[category].length === 0) {
            delete updated[category];
          }
        }
        return updated;
      });

      // Refresh stats
      window.location.reload(); // Simple way to refresh all data

    } catch (err) {
      console.error('❌ Failed to delete blog:', err);
      alert('Failed to delete blog. Please try again.');
    }
  };

  const handlePostClick = () => navigate('/admin/');
  const handleEdit = () => navigate('/admin/dailythoughts/edit');

  // ✅ NEW: Handle All Blogs modal
  const handleAllBlogsClick = () => {
    setShowAllBlogsModal(true);
    fetchAllBlogs();
  };

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
        <div className={styles.headerButtons}>
          <button className={styles.postBtn} onClick={handlePostClick}>
            ✍️ Create New Post
          </button>
          <button className={styles.allBlogsBtn} onClick={handleAllBlogsClick}>
            📚 All Blogs
          </button>
        </div>
      </div>

      {/* Top stats row */}
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

      {/* Author statistics */}
      <div className={styles.bottomRow}>
        <div className={styles.box}>
          <h3>✍️ Posts by Author</h3>
          <div className={styles.statsList}>
            {Object.entries(postsByAuthor).length > 0 ? (
              Object.entries(postsByAuthor)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
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

        {/* Recent posts */}
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
              .sort(([,a], [,b]) => b - a)
              .slice(0, 10)
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

      {/* ✅ NEW: All Blogs Modal */}
      {showAllBlogsModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAllBlogsModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>📚 All Published Blogs</h2>
              <button 
                className={styles.closeBtn}
                onClick={() => setShowAllBlogsModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className={styles.modalContent}>
              {isLoadingBlogs ? (
                <div className={styles.loading}>Loading blogs...</div>
              ) : (
                <div className={styles.blogsList}>
                  {Object.keys(allBlogs).length > 0 ? (
                    Object.entries(allBlogs).map(([category, blogs]) => (
                      <div key={category} className={styles.categorySection}>
                        <h3 className={styles.categoryTitle}>
                          {displayCategoryMapping[category] || category} ({blogs.length})
                        </h3>
                        <div className={styles.blogsInCategory}>
                          {blogs.map((blog) => (
                            <div key={`${category}-${blog.id}`} className={styles.blogItem}>
                              <div className={styles.blogInfo}>
                                <div className={styles.blogTitle}>{blog.title}</div>
                                <div className={styles.blogMeta}>
                                  <span>by {blog.author}</span>
                                  <span>{blog.date}</span>
                                </div>
                              </div>
                              <button
                                className={styles.deleteBtn}
                                onClick={() => handleDeleteBlog(category, blog.id, blog.title)}
                                title="Delete this blog"
                              >
                                🗑️
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No blogs found.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Popup Modal for Daily Thoughts */}
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
