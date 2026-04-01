import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Send, Mail, MapPin, Phone, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'newsletter'), {
        email,
        subscribedAt: serverTimestamp()
      });
      setSubscribed(true);
      setEmail("");
    } catch (err) {
      console.error(err);
      toast.error("Subscription failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-[#0a2d22] text-white pt-20 pb-10 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-b border-white/10 pb-16">
        {/* Column 1: Brand */}
        <div className="space-y-6">
          <Link to="/" className="flex items-center gap-2 group">
            <Shield className="w-8 h-8 text-accent fill-current" />
            <span className="text-2xl font-serif font-bold tracking-tight">HopeBridge</span>
          </Link>
          <p className="text-white/60 text-sm leading-relaxed max-w-xs">Empowering communities, protecting health, and building a more equitable world for all.</p>
          <div className="flex gap-4">
            {[FacebookIcon, TwitterIcon, InstagramIcon, LinkedinIcon].map((Icon, idx) => (
              <motion.a key={idx} href="#" whileHover={{ scale: 1.1, textShadow: "0 0 10px rgba(201, 168, 76, 0.8)" }} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center transition-all hover:bg-accent border border-white/10"><Icon size={18} width={18} height={18} /></motion.a>
            ))}
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4 className="text-accent font-serif text-lg font-semibold mb-6 uppercase tracking-wider">Explore</h4>
          <ul className="space-y-4 text-sm text-white/60">
            {['About', 'Works', 'Gallery', 'Volunteer', 'Contact'].map((link) => (
              <li key={link}><Link to={`/${link.toLowerCase()}`} className="hover:text-accent transition-colors">{link}</Link></li>
            ))}
          </ul>
        </div>

        {/* Column 3: Contact */}
        <div>
          <h4 className="text-accent font-serif text-lg font-semibold mb-6 uppercase tracking-wider">Contact</h4>
          <ul className="space-y-4 text-sm text-white/60">
            <li className="flex items-center gap-3"><MapPin className="w-4 h-4 text-accent shrink-0" /> 123 Mercy St, NY 10001</li>
            <li className="flex items-center gap-3"><Phone className="w-4 h-4 text-accent shrink-0" /> +1 (234) 567-8900</li>
            <li className="flex items-center gap-3"><Mail className="w-4 h-4 text-accent shrink-0" /> contact@hopebridge.org</li>
          </ul>
        </div>

        {/* Column 4: Newsletter */}
        <div>
          <h4 className="text-accent font-serif text-lg font-semibold mb-6 uppercase tracking-wider">Stay Informed</h4>
          <AnimatePresence mode="wait">
            {!subscribed ? (
              <motion.form key="form" exit={{ opacity: 0, y: -20 }} onSubmit={handleSubscribe} className="relative">
                <p className="text-sm text-white/60 mb-6">Join our monthly newsletter for impact updates.</p>
                <div className="relative">
                  <input type="email" required placeholder="Your email..." value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-5 text-sm focus:outline-none focus:border-accent" />
                  <button type="submit" disabled={loading} className="absolute right-1 top-1 bottom-1 w-10 bg-accent text-white rounded-full flex items-center justify-center hover:bg-accent-light transition-colors shadow-lg">
                    {loading ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 text-accent font-bold text-sm bg-accent/10 p-4 rounded-2xl">
                <CheckCircle size={18} /> Subscribed!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-white/40 font-medium">
        <p>&copy; 2026 HopeBridge NGO. All Rights Reserved.</p>
        <div className="flex gap-8 mt-4 md:mt-0">
          <a href="#" className="hover:text-accent">Privacy Policy</a>
          <a href="#" className="hover:text-accent">Terms</a>
        </div>
      </div>
    </footer>
  );
}
