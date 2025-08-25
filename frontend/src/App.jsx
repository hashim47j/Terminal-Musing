import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import PageTransition from './components/pageanim/PageTransition';

import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage/AdminPage'; 
import PhilosophyPage from './pages/PhilosophyPage';
import PhiloBlog from './pages/PhilosophyPage/PhiloBlog'; 
import HistoryPage from './pages/HistoryPage/HistoryPage';
import HistoryBlog from './pages/HistoryPage/HistoryBlog';
import AdminLogin from './pages/AdminPage/AdminLogin';
import BlogPage from './pages/BlogPage/BlogPage'; 
import LsconcernPage from './pages/LsconcernPage/LsconcernPage';
import LsconcernBlog from './pages/LsconcernPage/LsconcernBlog';
import WritingsPage from './pages/WritingsPage/WritingsPage';
import WritingsBlog from './pages/WritingsPage/WritingsBlog';
import TechPage from './pages/TechPage/TechPage';
import TechBlog from './pages/TechPage/TechBlog';
import AdminDashboard from './pages/AdminPage/AdminDashboard';
import DailythoughtsReader from './pages/DailythoughtsPage/DailythoughtsReader';
import DailythoughtsUI from './pages/DailythoughtsPage/DailythoughtsUI';
import { PageProvider } from './context/PageContext'; 
import { PageTransitionProvider } from './components/pageanim/PageTransitionContext';
import Uniblog from './pages/UniblogPgae/Uniblog';

function App() {
  return (
    <PageTransitionProvider>
    <PageProvider>
      <Navbar />
      <main>
        <PageTransition>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/blogs/philosophy/:id" element={<PhiloBlog />} />
            <Route path="/blogs/:id" element={<BlogPage />} />
            <Route path="/philosophy" element={<PhilosophyPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/blogs/history/:id" element={<HistoryBlog />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/writings" element={<WritingsPage />} />
            <Route path='/blogs/writings/:id' element={<WritingsBlog />} />
            <Route path="/legal-social" element={<LsconcernPage />} />
            <Route path="/blogs/legal-social/:id" element={<LsconcernBlog />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/daily-thoughts" element={<DailythoughtsReader />} />
            <Route path="/dailythoughts/submit" element={<DailythoughtsUI />} />
            <Route path="/admin/dailythoughts/edit" element={<DailythoughtsUI />} />
            <Route path="/tech" element={<TechPage />} />
            <Route path="/blogs/tech/:id" element={<TechBlog />} />
            <Route path="/blog/:category/:id" element={<Uniblog />} />
          </Routes>
        </PageTransition>
      </main>
      <Footer />
    </PageProvider>
    </PageTransitionProvider>
  );
}

export default App;
