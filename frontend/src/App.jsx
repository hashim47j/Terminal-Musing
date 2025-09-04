import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';

import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import PageTransition from './components/pageanim/PageTransition';

import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage/AdminPage'; 
import AdminLogin from './pages/AdminPage/AdminLogin';
import AdminDashboard from './pages/AdminPage/AdminDashboard';
import DailythoughtsReader from './pages/DailythoughtsPage/DailythoughtsReader';
import DailythoughtsUI from './pages/DailythoughtsPage/DailythoughtsUI';
import Uniblog from './pages/UniblogPage/Uniblog';
import { BlogProvider } from './context/BlogContext';

// NEW: Import the unified blog component
import UniformPage from './pages/UniformPages/UniformPage';

import { PageProvider } from './context/PageContext'; 
import { PageTransitionProvider } from './components/pageanim/PageTransitionContext';

// NEW: Wrapper component to force remount on category change
function UniformPageWrapper() {
  const { category } = useParams();
  console.log('UniformPageWrapper - Category changed to:', category);
  return <UniformPage key={category} />; // Key forces remount on category change
}

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
    <BlogProvider>
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
                  
                  {/* NEW: Single dynamic route with wrapper for category-based remounting */}
                  <Route path="/blog/:category" element={<UniformPageWrapper />} />
                  
                  {/* Legacy Category Page Redirects */}
                  <Route path="/philosophy" element={<Navigate to="/blog/philosophy" replace />} />
                  <Route path="/history" element={<Navigate to="/blog/history" replace />} />
                  <Route path="/tech" element={<Navigate to="/blog/tech" replace />} />
                  <Route path="/legal-social" element={<Navigate to="/blog/lsconcern" replace />} />
                  <Route path="/writings" element={<Navigate to="/blog/writings" replace />} />
                  
                  {/* Daily Thoughts */}
                  <Route path="/daily-thoughts" element={<DailythoughtsReader />} />
                  <Route path="/dailythoughts/submit" element={<DailythoughtsUI />} />
                  <Route path="/admin/dailythoughts/edit" element={<DailythoughtsUI />} />
                  
                  {/* Blog Post Routes */}
                  <Route path="/blog/:category/:id" element={<Uniblog />} />
                  
                  {/* Legacy Blog Post Redirects */}
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
    </BlogProvider>
  );
}

export default App;
