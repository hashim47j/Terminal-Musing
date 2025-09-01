import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import PageTransition from './components/pageanim/PageTransition';

import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage/AdminPage'; 
import PhilosophyPage from './pages/PhilosophyPage';
import HistoryPage from './pages/HistoryPage/HistoryPage';
import AdminLogin from './pages/AdminPage/AdminLogin';
import LsconcernPage from './pages/LsconcernPage/LsconcernPage';
import WritingsPage from './pages/WritingsPage/WritingsPage';
import TechPage from './pages/TechPage/TechPage';
import AdminDashboard from './pages/AdminPage/AdminDashboard';
import DailythoughtsReader from './pages/DailythoughtsPage/DailythoughtsReader';
import DailythoughtsUI from './pages/DailythoughtsPage/DailythoughtsUI';
import Uniblog from './pages/UniblogPage/Uniblog';

import { PageProvider } from './context/PageContext'; 
import { PageTransitionProvider } from './components/pageanim/PageTransitionContext';

// NEW: Wrapper to prevent immediate route content swap
function DelayedRouteRenderer({ children }) {
  const location = useLocation();
  const [displayedChildren, setDisplayedChildren] = useState(children);
  const [currentPath, setCurrentPath] = useState(location.pathname);

  useEffect(() => {
    if (location.pathname !== currentPath) {
      // Small delay to prevent flicker
      const timer = setTimeout(() => {
        setDisplayedChildren(children);
        setCurrentPath(location.pathname);
      }, 16); // One frame delay
      
      return () => clearTimeout(timer);
    } else {
      setDisplayedChildren(children);
    }
  }, [children, location.pathname, currentPath]);

  return <>{displayedChildren}</>;
}

function App() {
  return (
    <PageTransitionProvider>
      <PageProvider>
        <Navbar />
        <main>
          <PageTransition>
            <DelayedRouteRenderer>
              <Routes>
                {/* Static Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                
                {/* Category Pages */}
                <Route path="/philosophy" element={<PhilosophyPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/tech" element={<TechPage />} />
                <Route path="/legal-social" element={<LsconcernPage />} />
                <Route path="/writings" element={<WritingsPage />} />
                
                {/* Daily Thoughts */}
                <Route path="/daily-thoughts" element={<DailythoughtsReader />} />
                <Route path="/dailythoughts/submit" element={<DailythoughtsUI />} />
                <Route path="/admin/dailythoughts/edit" element={<DailythoughtsUI />} />
                
                {/* Blog Routes */}
                <Route path="/blog/:category/:id" element={<Uniblog />} />
                
                {/* Redirects */}
                <Route path="/blogs/philosophy/:id" element={<Navigate to="/blog/philosophy/:id" replace />} />
                <Route path="/blogs/history/:id" element={<Navigate to="/blog/history/:id" replace />} />
                <Route path="/blogs/tech/:id" element={<Navigate to="/blog/tech/:id" replace />} />
                <Route path="/blogs/legal-social/:id" element={<Navigate to="/blog/lsconcern/:id" replace />} />
                <Route path="/blogs/writings/:id" element={<Navigate to="/blog/writings/:id" replace />} />
                
                {/* 404 */}
                <Route path="*" element={<div>404 - Page Not Found</div>} />
              </Routes>
            </DelayedRouteRenderer>
          </PageTransition>
        </main>
        <Footer />
      </PageProvider>
    </PageTransitionProvider>
  );
}

export default App;
