import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import PageTransition from "./components/pageanim/PageTransition";

import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage/AdminPage";
import AdminLogin from "./pages/AdminPage/AdminLogin";
import AdminDashboard from "./pages/AdminPage/AdminDashboard";
import DailythoughtsReader from "./pages/DailythoughtsPage/DailythoughtsReader";
import DailythoughtsUI from "./pages/DailythoughtsPage/DailythoughtsUI";
import Uniblog from "./pages/UniblogPage/Uniblog";
import UniformPage from "./pages/UniformPages/UniformPage";

import { BlogProvider } from "./context/BlogContext";
import { PageProvider } from "./context/PageContext";
import { PageTransitionProvider } from "./components/pageanim/PageTransitionContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Dynamic Uniform Page Loader
function UniformPageWrapper() {
  const { category } = useParams();
  return <UniformPage key={category} />;
}

// Delay route swapping for smooth transitions
function DelayedRouteRenderer({ children }) {
  const location = useLocation();
  const [displayedChildren, setDisplayedChildren] = useState(children);
  const [currentPath, setCurrentPath] = useState(location.pathname);

  useEffect(() => {
    if (location.pathname !== currentPath) {
      const timer = setTimeout(() => {
        setDisplayedChildren(children);
        setCurrentPath(location.pathname);
      }, 16);
      return () => clearTimeout(timer);
    } else {
      setDisplayedChildren(children);
    }
  }, [children, location.pathname, currentPath]);

  return <>{displayedChildren}</>;
}

function App() {
  return (
    <AuthProvider>
      <BlogProvider>
        <PageTransitionProvider>
          <PageProvider>
            <Navbar />
            <main>
              <PageTransition>
                <DelayedRouteRenderer>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/admin/login" element={<AdminLogin />} />

                    {/* Protected Admin Routes */}
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute>
                          <AdminPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/dashboard"
                      element={
                        <ProtectedRoute>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />

                    {/* Blogs */}
                    <Route path="/blog/:category" element={<UniformPageWrapper />} />
                    <Route path="/blog/:category/:id" element={<Uniblog />} />

                    {/* Daily Thoughts */}
                    <Route path="/daily-thoughts" element={<DailythoughtsReader />} />
                    <Route path="/dailythoughts/submit" element={<DailythoughtsUI />} />
                    <Route
                      path="/admin/dailythoughts/edit"
                      element={
                        <ProtectedRoute>
                          <DailythoughtsUI />
                        </ProtectedRoute>
                      }
                    />

                    {/* Legacy Redirects */}
                    <Route path="/philosophy" element={<Navigate to="/blog/philosophy" replace />} />
                    <Route path="/history" element={<Navigate to="/blog/history" replace />} />
                    <Route path="/tech" element={<Navigate to="/blog/tech" replace />} />
                    <Route path="/legal-social" element={<Navigate to="/blog/lsconcern" replace />} />
                    <Route path="/writings" element={<Navigate to="/blog/writings" replace />} />

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
    </AuthProvider>
  );
}

export default App;
