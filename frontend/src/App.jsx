// Terminal-Musing/src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';

import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage/AdminPage'; 
import PhilosophyPage from './pages/PhilosophyPage';
import PhiloBlog from './pages/PhilosophyPage/PhiloBlog'; 
import HistoryPage from './pages/HistoryPage/HistoryPage';
import AdminLogin from './pages/AdminPage/AdminLogin';
import BlogPage from './pages/BlogPage/BlogPage'; 
import LsconcernPage from './pages/LsconcernPage/LsconcernPage';
import WritingsPage from './pages/WritingsPage/WritingsPage';
import AdminDashboard from './pages/AdminPage/AdminDashboard';
import DailythoughtsReader from './pages/DailythoughtsPage/DailythoughtsReader';
import DailythoughtsUI from './pages/DailythoughtsPage/DailythoughtsUI';


function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/blogs/philosophy/:id" element={<PhiloBlog />} />
          <Route path="/blogs/:id" element={<BlogPage />} />
          <Route path="/philosophy" element={<PhilosophyPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/writings" element={<WritingsPage />} />
          <Route path="/legal-social" element={<LsconcernPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/daily-thoughts" element={<DailythoughtsReader />} />
          <Route path="/dailythoughts/submit" element={<DailythoughtsUI />} />
          <Route path="/admin/dailythoughts/edit" element={<DailythoughtsUI />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
