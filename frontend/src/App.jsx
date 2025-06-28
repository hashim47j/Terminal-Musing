// Terminal-Musing/src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';

import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage/AdminPage'; // ✅ Admin Page
import PhilosophyPage from './pages/PhilosophyPage';

import BlogPage from './pages/BlogPage/BlogPage'; // ✅ Make sure the path matches your file


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
          <Route path="/admin" element={<AdminPage />} /> {/* ✅ Admin */}
          <Route path="/blogs/:id" element={<BlogPage />} />
          <Route path="/philosophy" element={<PhilosophyPage />} />


          {/* Placeholder routes (uncomment as you implement them) */}
          {/* <Route path="/law" element={<LawPage />} /> */}
          {/* <Route path="/social-issues" element={<SocialIssuesPage />} /> */}
          {/* <Route path="/poems" element={<PoemsPage />} /> */}
          {/* <Route path="/photography" element={<PhotographyPage />} /> */}
          {/* <Route path="/philosophy" element={<PhilosophyPage />} /> */}
          {/* <Route path="/history" element={<HistoryPage />} /> */}
          {/* <Route path="/short-stories" element={<ShortStoriesPage />} /> */}
          {/* <Route path="/android-linux" element={<AndroidLinuxPage />} /> */}

          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;