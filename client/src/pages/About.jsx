import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Target, Eye, ShieldCheck, Heart, Users, Globe, Zap, Award, Compass, Search, Sparkles } from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import SEOHead from '../components/SEOHead';

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const milestones = [
  { year: "2010", title: "The Beginning", description: "HopeBridge was founded in a small basement in Brooklyn with just 5 volunteers.", side: "left" },
  { year: "2015", title: "Global Expansion", description: "Establishing three clinics in rural Sub-Saharan Africa.", side: "right" },
  { year: "2020", title: "Crisis Resilience", description: "Rapid response teams delivered aid during the global pandemic.", side: "left" },
  { year: "NOW", title: "Growing Impact", description: "HopeBridge operates in 15 countries with 10,000+ volunteers.", side: "right" }
];

const values = [
  { icon: ShieldCheck, title: "Transparency", desc: "We maintain 100% financial accountability." },
  { icon: Users, title: "Community", desc: "Power of local leadership and community-driven solutions." },
  { icon: Heart, title: "Sustainability", desc: "Projects designed for long-term independence." },
  { icon: Zap, title: "Innovation", desc: "Using technology to solve logistical challenges." }
];

export default function About() {
  const { docs: teamMembers } = useFirestore('team', 'order');
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const docRef = doc(db, 'settings', 'global');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setSettings(docSnap.data());
    };
    fetchSettings();
  }, []);

  return (
    <>
      <SEOHead title="About Us" description="Learn about the heart behind HopeBridge NGO. Our mission, journey, and dedicated team." />

      {/* --- HERO SECTION --- */}
      <section className="bg-primary pt-48 pb-32 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-8xl font-black text-white mb-6 uppercase tracking-tight">
            Who We <span className="text-accent italic font-serif lowercase">Are</span>
          </motion.h1>
          <p className="text-white/70 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Bridging the gap between hopelessness and opportunity through radical transparency and community-led action.
          </p>
        </div>
      </section>

      {/* --- MISSION + VISION --- */}
      <section className="py-32 bg-bg">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white p-12 rounded-[2.5rem] shadow-xl border border-gray-100">
            <Target className="text-primary w-12 h-12 mb-8" />
            <h3 className="text-3xl font-serif font-black text-primary mb-6 italic">Our Mission</h3>
            <p className="text-text-muted text-lg leading-relaxed">{settings?.missionText || "To empower underserved communities by providing critical healthcare, quality education, and sustainable infrastructure."}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white p-12 rounded-[2.5rem] shadow-xl border border-gray-100">
            <Eye className="text-primary w-12 h-12 mb-8" />
            <h3 className="text-3xl font-serif font-black text-primary mb-6 italic">Our Vision</h3>
            <p className="text-text-muted text-lg leading-relaxed">{settings?.visionText || "A world where every human being has the resources and support to lead a healthy, dignified, and fulfilling life."}</p>
          </motion.div>
        </div>
      </section>

      {/* --- TIMELINE --- */}
      <section className="py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24"><h2 className="text-4xl md:text-6xl font-black text-primary font-serif">Milestones</h2></div>
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-primary/10 hidden md:block" />
            <div className="space-y-24">
              {milestones.map((m, i) => (
                <div key={i} className={`flex flex-col md:flex-row items-center justify-center gap-12 relative w-full ${m.side === 'left' ? 'md:flex-row-reverse' : ''}`}>
                  <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-accent border-4 border-white shadow-lg z-10" />
                  <motion.div initial={{ opacity: 0, x: m.side === 'left' ? 50 : -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className={`w-full md:w-[45%] text-center ${m.side === 'left' ? 'md:text-left' : 'md:text-right'}`}>
                    <span className="bg-primary text-white font-bold text-xs px-4 py-1.5 rounded-full mb-4 tracking-widest">{m.year}</span>
                    <h4 className="text-2xl font-black text-primary mb-4 italic font-serif">{m.title}</h4>
                    <p className="text-text-muted">{m.description}</p>
                  </motion.div>
                  <div className="w-full md:w-[45%] hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- VALUES --- */}
      <section className="py-32 bg-bg">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((v, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white p-10 rounded-[2rem] text-center border border-gray-100 shadow-sm hover:shadow-lg transition-all group">
              <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary transition-colors"><v.icon className="text-primary w-8 h-8 group-hover:text-white transition-colors" /></div>
              <h4 className="text-xl font-bold text-primary mb-3 uppercase">{v.title}</h4>
              <p className="text-text-muted text-sm">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- TEAM --- */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center mb-20">
          <span className="text-accent font-bold uppercase tracking-widest text-xs">The Visionaries</span>
          <h2 className="text-4xl md:text-6xl font-black text-primary font-serif">The People Behind the Mission</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-20">
            {teamMembers.map((member) => (
              <motion.div key={member.id} whileHover={{ y: -10 }} className="p-8 rounded-[3rem] border border-gray-100 bg-white shadow-sm hover:shadow-2xl">
                {member.imageUrl ? (
                  <img src={member.imageUrl} alt={member.name} className="w-full aspect-square rounded-[2rem] mb-8 object-cover" />
                ) : (
                  <div className="w-full aspect-square rounded-[2rem] mb-8 bg-primary/5 flex items-center justify-center text-primary text-4xl font-serif italic">{member.name[0]}</div>
                )}
                <h4 className="text-2xl font-serif font-black text-primary italic">{member.name}</h4>
                <p className="text-accent font-bold text-xs uppercase tracking-widest mt-1 mb-4">{member.role}</p>
                <p className="text-text-muted text-sm leading-relaxed">{member.bio}</p>
                <div className="pt-4 flex items-center justify-center">
                  <a href="#" className="text-primary/40 hover:text-primary transition-colors">
                    <LinkedinIcon size={20} />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
