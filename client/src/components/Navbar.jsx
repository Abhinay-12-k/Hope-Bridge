import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Menu, X, ArrowRight, LayoutDashboard, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Works', path: '/works' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAdmin, user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-md shadow-sm py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <Shield className={`w-8 h-8 transition-colors ${scrolled ? 'text-primary' : 'text-primary'}`} fill="currentColor" />
          <span className={`text-2xl font-serif font-bold tracking-tight ${scrolled ? 'text-primary' : 'text-primary'}`}>
            HopeBridge
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`relative group text-sm font-medium transition-colors ${
                scrolled ? 'text-text' : 'text-text'
              }`}
            >
              {link.name}
              <span
                className={`absolute left-0 bottom-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full ${
                  location.pathname === link.path ? 'w-full' : ''
                }`}
              />
            </Link>
          ))}
          <Link
            to="/donate"
            className="flex items-center gap-2 border-2 border-accent text-accent px-5 py-2 rounded-full font-medium transition-all hover:bg-primary hover:text-white hover:border-primary group"
          >
            Donate
          </Link>
          
          <Link
            to={isAdmin ? "/admin/dashboard" : "/admin/login"}
            className="flex items-center gap-2 border border-primary/10 bg-white/50 backdrop-blur-sm text-primary px-5 py-2 rounded-full font-medium transition-all hover:bg-primary hover:text-white group"
          >
            {isAdmin ? <LayoutDashboard className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
            {isAdmin ? 'Dashboard' : 'Admin'}
          </Link>

          <Link
            to="/volunteer"
            className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-full font-medium transition-all hover:bg-accent group"
          >
            Volunteer
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-primary"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="flex flex-col gap-4 p-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-lg font-medium ${
                    location.pathname === link.path ? 'text-accent' : 'text-text'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/donate"
                className="flex items-center justify-center gap-2 border-2 border-accent text-accent px-6 py-3 rounded-full font-medium"
              >
                Donate
              </Link>

              <Link
                to={isAdmin ? "/admin/dashboard" : "/admin/login"}
                className="flex items-center justify-center gap-2 bg-gray-50 border border-gray-100 text-primary px-6 py-3 rounded-full font-medium"
              >
                {isAdmin ? 'Admin Dashboard' : 'Admin Login'}
              </Link>

              <Link
                to="/volunteer"
                className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-medium"
              >
                Volunteer
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
