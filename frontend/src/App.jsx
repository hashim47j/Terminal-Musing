import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

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

// ✅ Fixed import path
import Uniblog from './pages/UniblogPage/Uniblog';

import { PageProvider } from './context/PageContext'; 
import { PageTransitionProvider } from './components/pageanim/PageTransitionContext';

function App() {
  return (
    <PageTransitionProvider>
      <PageProvider>
        <Navbar />
        <main>
          <PageTransition>
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
              
              {/* ✅ UNIFIED BLOG ROUTE (Primary) */}
              <Route path="/blog/:category/:id" element={<Uniblog />} />
              
              {/* ✅ REDIRECT OLD ROUTES TO NEW UNIFIED FORMAT */}
              <Route path="/blogs/philosophy/:id" element={<Navigate to="/blog/philosophy/:id" replace />} />
              <Route path="/blogs/history/:id" element={<Navigate to="/blog/history/:id" replace />} />
              <Route path="/blogs/tech/:id" element={<Navigate to="/blog/tech/:id" replace />} />
              <Route path="/blogs/legal-social/:id" element={<Navigate to="/blog/lsconcern/:id" replace />} />
              <Route path="/blogs/writings/:id" element={<Navigate to="/blog/writings/:id" replace />} />
              
              {/* ❌ REMOVE OR MAKE MORE SPECIFIC */}
              {/* <Route path="/blogs/:id" element={<BlogPage />} /> */}
              
              {/* ✅ 404 Catch-All Route */}
              <Route path="*" element={<div>404 - Page Not Found</div>} />
            </Routes>
          </PageTransition>
        </main>
        <Footer />
      </PageProvider>
    </PageTransitionProvider>
  );
}

export default App;
