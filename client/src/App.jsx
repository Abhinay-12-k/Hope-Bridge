import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import PrivateRoute from './components/PrivateRoute';

// Public Pages
const Home      = lazy(() => import('./pages/Home'));
const About     = lazy(() => import('./pages/About'));
const Works     = lazy(() => import('./pages/Works'));
const Gallery   = lazy(() => import('./pages/Gallery'));
const Contact   = lazy(() => import('./pages/Contact'));
const Volunteer = lazy(() => import('./pages/Volunteer'));

// Admin Pages
const AdminLogin      = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard  = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProjects   = lazy(() => import('./pages/admin/AdminProjects'));
const AdminGallery    = lazy(() => import('./pages/admin/AdminGallery'));
const AdminVolunteers = lazy(() => import('./pages/admin/AdminVolunteers'));
const AdminContacts   = lazy(() => import('./pages/admin/AdminContacts'));
const SeedStore       = lazy(() => import('./pages/SeedStore'));

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();

  // Scroll to top on route change
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname === '/seed';

  return (
    <div className="min-h-screen flex flex-col bg-bg selection:bg-accent selection:text-white">
      <Toaster position="top-center" reverseOrder={false} />
      {!isAdminRoute && <Navbar />}
      
      <main className={`flex-1 overflow-x-hidden ${!isAdminRoute ? 'pt-0' : ''}`}>
        <Suspense fallback={<LoadingSpinner />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* Public Routes */}
              <Route path="/"          element={<PageWrapper><Home      /></PageWrapper>} />
              <Route path="/about"     element={<PageWrapper><About     /></PageWrapper>} />
              <Route path="/works"     element={<PageWrapper><Works     /></PageWrapper>} />
              <Route path="/volunteer" element={<PageWrapper><Volunteer /></PageWrapper>} />
              <Route path="/gallery"   element={<PageWrapper><Gallery   /></PageWrapper>} />
              <Route path="/contact"   element={<PageWrapper><Contact   /></PageWrapper>} />
              <Route path="/seed"      element={<PageWrapper><SeedStore /></PageWrapper>} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<PageWrapper><AdminLogin /></PageWrapper>} />
              
              <Route element={<PrivateRoute />}>
                <Route path="/admin"            element={<PageWrapper><AdminDashboard  /></PageWrapper>} />
                <Route path="/admin/dashboard"  element={<PageWrapper><AdminDashboard  /></PageWrapper>} />
                <Route path="/admin/projects"   element={<PageWrapper><AdminProjects   /></PageWrapper>} />
                <Route path="/admin/gallery"    element={<PageWrapper><AdminGallery    /></PageWrapper>} />
                <Route path="/admin/volunteers" element={<PageWrapper><AdminVolunteers /></PageWrapper>} />
                <Route path="/admin/contacts"   element={<PageWrapper><AdminContacts   /></PageWrapper>} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<PageWrapper><Home /></PageWrapper>} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>

      {!isAdminRoute && <Footer />}
    </div>
  );
}
