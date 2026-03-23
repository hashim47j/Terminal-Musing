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

  const [totalPosts, setTotalPosts]           = useState(0);
  const [totalAuthors, setTotalAuthors]       = useState(0);
  const [dailyRequests, setDailyRequests]     = useState([]);
  const [visitorStats, setVisitorStats]       = useState({ totalVisits: 0, uniqueIPs: 0 });
  const [showAllBlogsModal, setShowAllBlogsModal] = useState(false);
  const [allBlogs, setAllBlogs]               = useState({});
  const [viewsPerPost, setViewsPerPost]       = useState({});
  const [isLoadingBlogs, setIsLoadingBlogs]   = useState(false);
  const [showPopup, setShowPopup]             = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const displayCategoryMapping = {
    philosophy: "Philosophy",
    history:    "History",
    writings:   "Writings",
    lsconcern:  "Legal & Social Issues",
    tech:       "Tech",
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate("/admin/login");
  }, [isAuthenticated, loading, navigate]);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logout();
      navigate("/admin/login");
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    // Dashboard stats — post count only
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/dashboard/stats", { credentials: "include" });
        if (!res.ok) throw new Error(`Failed with status ${res.status}`);
        const data = await res.json();
        setTotalPosts(data.totalPosts || 0);
        setViewsPerPost(data.viewsPerPost || {});
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      }
    };

    // Author count
    const fetchBlogStats = async () => {
      try {
        const res = await fetch("/api/blogs", { credentials: "include" });
        if (!res.ok) throw new Error(`Failed with status ${res.status}`);
        const blogs = await res.json();
        if (Array.isArray(blogs)) {
          const uniqueAuthors = new Set(blogs.map(b => b.author || "Terminal Musing"));
          setTotalAuthors(uniqueAuthors.size);
        }
      } catch (err) {
        console.error("Failed to fetch blog stats:", err);
      }
    };

    // Pending daily thoughts
    const fetchDailyRequests = async () => {
      try {
        const res = await fetch("/api/dailythoughts/manage/pending", { credentials: "include" });
        if (!res.ok) throw new Error(`Failed with status ${res.status}`);
        setDailyRequests(await res.json());
      } catch {
        setDailyRequests([]);
      }
    };

    // Visitor stats — website visits only
    const fetchVisitorStats = async () => {
      try {
        const res = await fetch("/api/visitorstats", { credentials: "include" });
        if (!res.ok) throw new Error(`Failed with status ${res.status}`);
        const data = await res.json();
        setVisitorStats({
          totalVisits: data.totalVisits || 0,
          uniqueIPs:   data.uniqueIPs   || 0,
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
            id:       blog.id,
            title:    blog.title,
            author:   blog.author || "Terminal Musing",
            date:     new Date(blog.date || blog.updatedAt).toLocaleDateString(),
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

  const handleReject = async (id) => {
    if (!window.confirm("Reject this thought?")) return;
    try {
      const res = await fetch(`/api/dailythoughts/process/reject/${id}`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        setDailyRequests((prev) => prev.filter((req) => req.id !== id));
        setShowPopup(false);
      }
    } catch {
      console.error("Rejection failed");
    }
  };

  if (loading)         return <div className={styles.loading}><h2>Loading...</h2></div>;
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
        <div className={styles.box}>
          <h2><FaFileAlt /> Posts</h2>
          <p className={styles.bigNumber}>{totalPosts}</p>
        </div>
        <div className={styles.box}>
          <h2><FaUsers /> Authors</h2>
          <p className={styles.bigNumber}>{totalAuthors}</p>
        </div>
        <div className={styles.box}>
          <h2><FaGlobe /> Unique Visitors</h2>
          <p className={styles.bigNumber}>{visitorStats.uniqueIPs}</p>
        </div>
        <div className={styles.box}>
          <h2><FaEye /> Total Visits</h2>
          <p className={styles.bigNumber}>{visitorStats.totalVisits}</p>
        </div>
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
              <button className={styles.rejectBtn} onClick={() => handleReject(selectedRequest.id)}>
                <FaTimes /> Reject
              </button>
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
                          {/* Views count badge */}
                          <div className={styles.viewsBadge}>
                            <FaEye />
                            <span>{viewsPerPost[blog.id] || 0}</span>
                          </div>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => handleDeleteBlog(cat, blog.id, blog.title)}
                          >
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