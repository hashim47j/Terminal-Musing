// Terminal-Musing/src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import core components that appear on all pages
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';

// Import your page components
import HomePage from './pages/HomePage'; // This will import src/pages/HomePage/index.jsx

// You'll create these pages later for your specific topics
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
      <Navbar /> {/* Your navigation bar */}
      <main>
        <Routes>
          {/* Define your routes here */}
          <Route path="/" element={<HomePage />} /> {/* Homepage */}

          {/* Placeholders for your topic pages */}
          {/* <Route path="/law" element={<LawPage />} /> */}
          {/* <Route path="/social-issues" element={<SocialIssuesPage />} /> */}
          {/* <Route path="/poems" element={<PoemsPage />} /> */}
          {/* <Route path="/photography" element={<PhotographyPage />} /> */}
          {/* <Route path="/philosophy" element={<PhilosophyPage />} /> */}
          {/* <Route path="/history" element={<HistoryPage />} /> */}
          {/* <Route path="/short-stories" element={<ShortStoriesPage />} /> */}
          {/* <Route path="/android-linux" element={<AndroidLinuxPage />} /> */}

          {/* Add a 404 Not Found page route later if desired */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
      </main>
      <Footer /> {/* Your footer */}
    </>
  );
}

export default App;