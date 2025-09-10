import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  FaFileAlt, 
  FaEye, 
  FaUsers, 
  FaGlobe, 
  FaCheckCircle, 
  FaTrashAlt, 
  FaPlus, 
  FaTimes 
} from "react-icons/fa";
import styles from "./AdminDashboard.module.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, logout } = useAuth();

  const [totalPosts, setTotalPosts] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [postsByCategory, setPostsByCategory] = useState({});
  const [viewsByCategory, setViewsByCategory] = useState({});
  const [viewsPerPost, setViewsPerPost] = useState({});
  const [dailyRequests, setDailyRequests] = useState([]);
  const [postsByAuthor, setPostsByAuthor] = useState({});
  const [totalAuthors, setTotalAuthors] = useState(0);
  const [recentPosts, setRecentPosts] = useState([]);
  const [visitorStats, setVisitorStats] = useState({
    totalVisits: 0,
    uniqueIPs: 0,
    osCounts: {},
    browserCounts: {},
  });
  const [showAllBlogsModal, setShowAllBlogsModal] = useState(false);
  const [allBlogs, setAllBlogs] = useState({});
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const categories = ["Philosophy", "History", "Writings", "Legal & Social Issues", "Tech"];

  const categoryMapping = {
    Philosophy: "philosophy",
    History: "history",
    Writings: "writings",
    "Legal & Social Issues": "lsconcern",
    Tech: "tech",
  };

  const displayCategoryMapping = {
    philosophy: "Philosophy",
    history: "History",
    writings: "Writings",
    lsconcern: "Legal & Social Issues",
    tech: "Tech",
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/admin/login");
    }
  }, [isAuthenticated, loading, navigate]);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logout();
      navigate("/admin/login");
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchStats = async () => {
      try {
        const res = await fetch("/api/dashboard/stats", { credentials: "include" });
        if (!res.ok) throw new Error(`Failed with status ${res.status}`);
        const data = await res.json();
        setTotalPosts(data.totalPosts || 0);
        setTotalViews(data.totalViews || 0);
        setPostsByCategory(data.postsByCategory || {});
        setViewsByCategory(data.viewsByCategory || {});
        setViewsPerPost(data.viewsPerPost || {});
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      }
    };

    const fetchBlogStats = async () => {
      try {
        const res = await fetch("/api/blogs", { credentials: "include" });
        if (!res.ok) throw new Error(`Failed with status ${res.status}`);
        const blogs = await res.json();

        if (Array.isArray(blogs)) {
          const authorCounts = {};
          const uniqueAuthors = new Set();
          blogs.forEach((blog) => {
            const author = blog.author || "Terminal Musing";
            authorCounts[author] = (authorCounts[author] || 0) + 1;
            uniqueAuthors.add(author);
          });
          setPostsByAuthor(authorCounts);
          setTotalAuthors(uniqueAuthors.size);

          const sortedBlogs = blogs
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5)
            .map((blog) => ({
              id: blog.id,
              title: blog.title,
              category: blog.category,
              author: blog.author || "Terminal Musing",
              date: new Date(blog.date).toLocaleDateString(),
            }));
          setRecentPosts(sortedBlogs);
        }
      } catch (err) {
        console.error("Failed to fetch blog stats:", err);
      }
    };

    const fetchDailyRequests = async () => {
      try {
        const res = await fetch("/api/dailythoughts/manage/pending", { credentials: "include" });
        if (!res.ok) throw new Error(`Failed with status ${res.status}`);
        setDailyRequests(await res.json());
      } catch {
        setDailyRequests([]);
      }
    };

    const fetchVisitorStats = async () => {
      try {
        const res = await fetch("/api/visitorstats", { credentials: "include" });
        if (!res.ok) throw new Error(`Failed with status ${res.status}`);
        const data = await res.json();
        setVisitorStats({
          totalVisits: data.totalVisits || 0,
          uniqueIPs: data.uniqueIPs || 0,
          osCounts: data.osDistribution || {},
          browserCounts: data.browserDistribution || {},
        });
      } catch (err) {
        console.error("Failed to fetch visitor stats:", err);
      }
    };

    fetchStats();
    fetchBlogStats();
    fetchDailyRequests();
    fetchVisitorStats();
  }, [isAuthenticated]);

  const fetchAllBlogs = async () => {
    setIsLoadingBlogs(true);
    try {
      const res = await fetch("/api/blogs", { credentials: "include" });
      if (!res.ok) throw new Error(`Failed with status ${res.status}`);
      const blogs = await res.json();

      if (Array.isArray(blogs)) {
        const grouped = {};
        blogs.forEach((blog) => {
          const cat = blog.category || "uncategorized";
          grouped[cat] = grouped[cat] || [];
          grouped[cat].push({
            id: blog.id,
            title: blog.title,
            author: blog.author || "Terminal Musing",
            date: new Date(blog.date || blog.updatedAt).toLocaleDateString(),
            category: blog.category,
          });
        });

        Object.keys(grouped).forEach((cat) =>
          grouped[cat].sort((a, b) => new Date(b.date) - new Date(a.date))
        );

        setAllBlogs(grouped);
      }
    } catch {
      setAllBlogs({});
    } finally {
      setIsLoadingBlogs(false);
    }
  };

  const handleDeleteBlog = async (category, blogId, blogTitle) => {
    if (!window.confirm(`Delete "${blogTitle}"?`)) return;
    try {
      const res = await fetch(`/api/blogs/${category}/${blogId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      setAllBlogs((prev) => {
        const updated = { ...prev };
        updated[category] = updated[category].filter((b) => b.id !== blogId);
        if (!updated[category].length) delete updated[category];
        return updated;
      });
    } catch {
      alert("Failed to delete blog");
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`/api/dailythoughts/process/approve/${id}`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        setDailyRequests((prev) => prev.filter((req) => req.id !== id));
        setShowPopup(false);
      }
    } catch {
      console.error("Approval failed");
    }
  };

  if (loading) return <div className={styles.loading}><h2>Loading...</h2></div>;
  if (!isAuthenticated) return <div className={styles.loading}><h2>Redirecting...</h2></div>;

  return (
    <div className={styles.dashboardContainer}>
      {/* HEADER */}
      <div className={styles.header}>
        <h1>Admin Dashboard</h1>
        <div className={styles.headerButtons}>
          <button className={styles.postBtn} onClick={() => navigate("/admin/")}>
            <FaPlus /> Create Post
          </button>
          <button className={styles.allBlogsBtn} onClick={() => { setShowAllBlogsModal(true); fetchAllBlogs(); }}>
            <FaFileAlt /> All Blogs
          </button>
          <button onClick={handleLogout}>
            <FaTimes /> Logout
          </button>
        </div>
      </div>

      {/* TOP STATS */}
      <div className={styles.topRow}>
        <div className={styles.box}><h2><FaFileAlt /> Posts</h2><p>{totalPosts}</p></div>
        <div className={styles.box}><h2><FaEye /> Views</h2><p>{totalViews}</p></div>
        <div className={styles.box}><h2><FaUsers /> Authors</h2><p>{totalAuthors}</p></div>
        <div className={styles.box}><h2><FaGlobe /> Visitors</h2><p>{visitorStats.uniqueIPs}</p></div>
      </div>

      {/* DAILY THOUGHTS APPROVAL */}
      <div className={styles.bottomRow}>
        <h2>Pending Daily Thoughts</h2>
        <div className={styles.requestsList}>
          {dailyRequests.length ? dailyRequests.map(req => (
            <div 
              key={req.id} 
              className={styles.requestItem} 
              onClick={() => { setSelectedRequest(req); setShowPopup(true); }}
            >
              <p className={styles.requestName}>{req.author}</p>
              <p className={styles.requestPreview}>{req.content.slice(0, 100)}...</p>
            </div>
          )) : <p>No pending requests.</p>}
        </div>
      </div>

      {/* POPUP FOR DAILY THOUGHTS */}
      {showPopup && selectedRequest && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupCard}>
            <div className={styles.popupHeader}>
              <h2>{selectedRequest.author}</h2>
              <button className={styles.closeBtn} onClick={() => setShowPopup(false)}><FaTimes /></button>
            </div>
            <div className={styles.popupContent}>
              <p>{selectedRequest.content}</p>
            </div>
            <div className={styles.popupActions}>
              <button className={styles.approveBtn} onClick={() => handleApprove(selectedRequest.id)}>
                <FaCheckCircle /> Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALL BLOGS MODAL */}
      {showAllBlogsModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h2>All Blogs</h2>
              <button className={styles.closeBtn} onClick={() => setShowAllBlogsModal(false)}><FaTimes /></button>
            </div>
            <div className={styles.modalContent}>
              {isLoadingBlogs ? <p>Loading...</p> : (
                Object.keys(allBlogs).map(cat => (
                  <div key={cat} className={styles.categorySection}>
                    <h3 className={styles.categoryTitle}>{displayCategoryMapping[cat] || cat}</h3>
                    <div className={styles.blogsInCategory}>
                      {allBlogs[cat].map(blog => (
                        <div key={blog.id} className={styles.blogItem}>
                          <div className={styles.blogInfo}>
                            <p className={styles.blogTitle}>{blog.title}</p>
                            <div className={styles.blogMeta}>
                              <span>{blog.author}</span>
                              <span>{blog.date}</span>
                            </div>
                          </div>
                          <button className={styles.deleteBtn} onClick={() => handleDeleteBlog(cat, blog.id, blog.title)}>
                            <FaTrashAlt /> Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
