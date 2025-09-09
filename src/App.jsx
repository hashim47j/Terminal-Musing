import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import core components that appear on all pages
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';

// Import your page components
import HomePage from './pages/HomePage'; // This will import src/pages/HomePage/index.jsx
import AdminLogin from './pages/AdminPage/AdminLogin';
import AdminDashboard from './pages/AdminPage/AdminDashboard';

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
    <AuthProvider>
      <Router>
        <>
          <Navbar /> {/* Your navigation bar */}
          <main>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} /> {/* Homepage */}

              {/* Admin authentication routes */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Protected admin routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protect all other admin routes */}
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute>
                    <div>Other Admin Pages</div>
                  </ProtectedRoute>
                } 
              />

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
      </Router>
    </AuthProvider>
  );
}

export default App;
