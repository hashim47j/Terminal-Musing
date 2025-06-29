// Terminal-Musing/src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';

import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage/AdminPage'; 
import PhilosophyPage from './pages/PhilosophyPage';
import PhiloBlog from './pages/PhilosophyPage/PhiloBlog'; 


import BlogPage from './pages/BlogPage/BlogPage'; 


// Placeholder page imports (you can uncomment these as you create them)
// import LawPage from './pages/LawPage';
// import SocialIssuesPage from './pages/SocialIssuesPage';
// import PoemsPage from './pages/PoemsPage';
// import PhotographyPage from './pages/PhotographyPage';
// import PhilosophyPage from './pages/PhilosophyPage';
// import HistoryPage from './pages/HistoryPage';
// import ShortStoriesPage from './pages/ShortStoriesPage';
// import AndroidLinuxPage from './pages/AndroidLinuxPage';

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />

          {/* ⚠️ More specific route first */}
          <Route path="/blogs/philosophy/:id" element={<PhiloBlog />} />
          <Route path="/blogs/:id" element={<BlogPage />} />

          <Route path="/philosophy" element={<PhilosophyPage />} />

          {/* Add more routes as needed */}
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;