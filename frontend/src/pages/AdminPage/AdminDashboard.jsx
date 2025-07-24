// /frontend/src/pages/AdminPage/AdminDashboard.jsx

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

  const [visitorStats, setVisitorStats] = useState({
    totalVisits: 0,
    uniqueIPs: 0,
    osCounts: {},
    browserCounts: {},
  });

  const [showPopup, setShowPopup] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const categories = [
    'Philosophy',
    'History',
    'Writings',
    'Legal and Social Issues',
    'Tech',
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/dashboard/stats`);
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

    const fetchDailyRequests = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/dailythoughts/manage/pending`);
        if (!res.ok) throw new Error(`Failed with status ${res.status}`);
        const thoughts = await res.json();
        setDailyRequests(thoughts);
      } catch (err) {
        console.error('❌ Failed to fetch pending thoughts:', err);
      }
    };

    const fetchVisitorStats = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/visitorstats`);
        if (!res.ok) throw new Error(`Failed with status ${res.status}`);
        const data = await res.json();
        setVisitorStats({
          totalVisits: data.totalVisits ?? 0,
          uniqueIPs: data.uniqueIPs ?? 0,
          osCounts: data.osCounts ?? {},
          browserCounts: data.browserCounts ?? {},
        });
      } catch (err) {
        console.error('❌ Failed to fetch visitor stats:', err);
      }
    };

    fetchStats();
    fetchDailyRequests();
    fetchVisitorStats();
  }, []);

  const handlePostClick = () => navigate('/admin/');
  const handleEdit = () => navigate('/admin/dailythoughts/edit');

  const handleApprove = async (id) => {
    if (!id) return console.error("❌ No ID provided for approval");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/dailythoughts/process/approve/${id}`, {
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
    return map?.[category.toLowerCase()] || 0;
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <h1>Dashboard</h1>
        <button className={styles.postBtn} onClick={handlePostClick}>
          Post Something?
        </button>
      </div>

      <div className={styles.topRow}>
        <div className={styles.box}>
          <h2>Total Posts</h2>
          <p>{totalPosts}</p>
        </div>
        <div className={styles.box}>
          <h2>Total Views</h2>
          <p>{totalViews}</p>
        </div>
      </div>

      <div className={styles.bottomRow}>
        <div className={styles.box}>
          <h3>Posts by Category</h3>
          {categories.map((cat) => (
            <p key={cat}>{cat}: {getCount(postsByCategory, cat)}</p>
          ))}
        </div>
        <div className={styles.box}>
          <h3>Views by Category</h3>
          {categories.map((cat) => (
            <p key={cat}>{cat}: {getCount(viewsByCategory, cat)}</p>
          ))}
        </div>
      </div>

      <div className={styles.box}>
        <h3>Views per Post</h3>
        {Object.entries(viewsPerPost).length > 0 ? (
          Object.entries(viewsPerPost).map(([postId, count]) => (
            <p key={postId}>{postId}: {count}</p>
          ))
        ) : (
          <p>No view data yet.</p>
        )}
      </div>

      <div className={styles.box}>
        <h3>Visitor Stats</h3>
        <p><strong>Total Visits:</strong> {visitorStats.totalVisits}</p>
        <p><strong>Unique IPs:</strong> {visitorStats.uniqueIPs}</p>
        <p><strong>OS Distribution:</strong></p>
        <ul>
          {Object.entries(visitorStats.osCounts).map(([os, count]) => (
            <li key={os}>{os}: {count}</li>
          ))}
        </ul>
        <p><strong>Browser Distribution:</strong></p>
        <ul>
          {Object.entries(visitorStats.browserCounts).map(([browser, count]) => (
            <li key={browser}>{browser}: {count}</li>
          ))}
        </ul>
      </div>

      <div className={styles.box}>
        <h3>Daily Thoughts Requests</h3>
        {dailyRequests.length > 0 ? (
          dailyRequests.map((req) => (
            <p
              key={req._id}
              className={styles.clickableName}
              onClick={() => {
                setSelectedRequest(req);
                setShowPopup(true);
              }}
            >
              {req.name}
            </p>
          ))
        ) : (
          <p>No pending thoughts found.</p>
        )}
      </div>

      {showPopup && selectedRequest && (
        <div className={styles.popupOverlay} onClick={() => setShowPopup(false)}>
          <div className={styles.popupCard} onClick={(e) => e.stopPropagation()}>
            <h2>{selectedRequest.name}</h2>
            <p><strong>Author:</strong> {selectedRequest.authorName}</p>
            <p><strong>Thought:</strong><br />{selectedRequest.content}</p>
            <p><strong>Email:</strong> {selectedRequest.contact}</p>
            {selectedRequest.social && (
              <p><strong>Social:</strong> {selectedRequest.social}</p>
            )}
            <div className={styles.popupActions}>
              <button className={styles.approveBtn} onClick={() => handleApprove(selectedRequest.id)}>
                Approve
              </button>
              <button className={styles.editBtn} onClick={handleEdit}>Edit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
