import React, { useEffect, useState, useRef } from 'react';
import Hero3D from '../components/Hero3D';

import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence, useInView, useSpring } from 'framer-motion';
import { ArrowRight, Shield, Heart, Globe, Users, CheckCircle, Quote } from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import SEOHead from '../components/SEOHead';

const statsTicker = [
  "50,000+ FAMILIES HELPED",
  "10,000+ VOLUNTEERS WORLDWIDE",
  "15+ ACTIVE COUNTRIES",
  "120+ HEALTH CLINICS BUILT",
  "$2M+ CRISIS RELIEF RAISED",
  "15 YEARS OF DEDICATION",
  "5,000+ CHILDREN EDUCATED"
];

const testimonials = [
  {
    name: "Dr. Sarah Jenkins",
    role: "MEDICAL VOLUNTEER",
    text: "HopeBridge doesn't just provide aid; they build sustainable systems that empower local communities to take charge of their own future.",
    initials: "SJ"
  },
  {
    name: "Michael Chen",
    role: "COMMUNITY PARTNER",
    text: "The level of transparency and dedication from the team is what makes HopeBridge a world-class organization in the non-profit sector.",
    initials: "MC"
  },
  {
    name: "Elena Rodriguez",
    role: "PROJECT COORDINATOR",
    text: "Seeing the direct impact of our educational programs on thousands of children across three continents is truly life-changing.",
    initials: "ER"
  }
];

const Counter = ({ value, label }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const target = parseInt(value.replace(/,/g, '').replace(/\+/g, ''));
      const duration = 2000;
      const increment = target / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(start).toLocaleString() + (value.includes('+') ? '+' : ''));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <div ref={ref} className="flex flex-col items-center group">
      <motion.span 
        className="text-4xl md:text-5xl font-black text-white mb-2"
      >
        {displayValue || 0}
      </motion.span>
      <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-white/50 group-hover:text-accent transition-colors">
        {label}
      </span>
    </div>
  );
};

export default function Home() {
  const { docs: projects } = useFirestore('projects');
  const [settings, setSettings] = useState(null);
  const featuredWorks = projects.slice(0, 3);

  useEffect(() => {
    const fetchSettings = async () => {
      const docRef = doc(db, 'settings', 'global');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      }
    };
    fetchSettings();
  }, []);

  return (
    <>
      <SEOHead 
        title="Creating Lasting Change" 
        description="Join HopeBridge NGO in empowering communities through sustainable health, education, and crisis relief." 
      />

      {/* --- HERO SECTION --- */}
      <section id="hero-section" className="relative h-auto min-h-screen md:min-h-screen flex items-center justify-center overflow-hidden mesh-gradient pt-32 pb-24">
        <Hero3D />

        <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <motion.path
              d="M0,50 Q25,30 50,50 T100,50"
              fill="none"
              stroke="white"
              strokeWidth="0.1"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.3 } } }}
            className="space-y-8"
          >
            <div className="overflow-hidden">
              <motion.h1 
                variants={{
                  hidden: { y: 100, opacity: 0 },
                  visible: { y: 0, opacity: 1, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } }
                }}
                className="text-6xl md:text-9xl font-black text-white leading-tight mb-4"
              >
                Building <br className="hidden md:block" />
                <span className="text-accent italic font-serif">Bridges</span>
              </motion.h1>
            </div>
            
            <div className="overflow-hidden">
              <motion.h1
                variants={{
                  hidden: { y: 100, opacity: 0 },
                  visible: { y: 0, opacity: 1, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } }
                }}
                className="text-6xl md:text-9xl font-black text-white leading-tight"
              >
                Changing <br className="hidden md:block" />
                <span className="text-white">Lives</span>
              </motion.h1>
            </div>

            <motion.p 
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 1.2 } } }}
              className="text-white/60 text-lg md:text-xl font-medium max-w-2xl mx-auto"
            >
              {settings?.heroSubtitle || "Join thousands of volunteers and donors dedicated to making a tangible impact on the lives of those who need it most."}
            </motion.p>

            <motion.div 
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 1.5 } } }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12"
            >
              <Link to="/works" className="px-10 py-4 border-2 border-white/20 text-white rounded-full font-bold uppercase tracking-widest text-sm hover:bg-white/10 transition-colors">
                Explore Our Work
              </Link>
              <Link to="/volunteer" className="px-10 py-4 bg-accent text-white rounded-full font-bold uppercase tracking-widest text-sm hover:bg-accent-light transition-colors shadow-xl shadow-black/10">
                Volunteer Now
              </Link>
            </motion.div>

            {/* Counters */}
            <motion.div 
              variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { delay: 2 } } }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 pt-24 border-t border-white/10 mt-24"
            >
              <Counter value={settings?.stats?.families || "50,000+"} label="Families Helped" />
              <Counter value={settings?.stats?.volunteers || "10,000+"} label="Volunteers" />
              <Counter value={settings?.stats?.countries || "15+"} label="Countries" />
              <Counter value={settings?.stats?.years || "15"} label="Years Active" />
            </motion.div>
          </motion.div>
        </div>
      </section>



      {/* --- IMPACT STATS BAR (Ticker) --- */}
      <div className="bg-accent py-4 overflow-hidden border-y border-accent-light/30">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...statsTicker, ...statsTicker].map((stat, i) => (
            <span key={i} className="text-white text-xs font-bold tracking-[0.3em] mx-12 flex items-center gap-4">
              <Shield size={12} className="fill-white" /> {stat}
            </span>
          ))}
        </div>
      </div>

      {/* --- MISSION HIGHLIGHT --- */}
      <section className="py-32 bg-bg">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-8">
            <h3 className="text-4xl md:text-5xl font-serif italic text-primary leading-tight">
              "{settings?.missionText || "We believe that a community's greatest asset is its resilience, and our mission is to provide the bridge to unlock it."}"
            </h3>
            <Link to="/about" className="inline-block relative group text-primary font-bold uppercase tracking-widest text-sm">
              Our Full Story →
              <span className="absolute -bottom-2 left-0 w-full h-px bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="grid gap-8">
            {[
              { title: "Universal Healthcare", desc: "Providing essential medical services to remote and underserved regions." },
              { title: "Empowering Education", desc: "Building schools and providing vocational training for the next generation." },
              { title: "Crisis Resilience", desc: "Immediate disaster relief and long-term recovery support." }
            ].map((pillar, i) => (
              <div key={i} className="flex gap-6 p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="text-primary w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-primary mb-2 uppercase tracking-wide">{pillar.title}</h4>
                  <p className="text-text-muted text-sm leading-relaxed">{pillar.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- FEATURED PROJECTS --- */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="space-y-4">
              <span className="text-accent font-bold uppercase tracking-[0.2em] text-xs">Our Global Footprint</span>
              <h2 className="text-4xl md:text-6xl font-black text-primary">Featured Work</h2>
            </div>
            <Link to="/works" className="flex items-center gap-3 text-primary font-bold uppercase tracking-widest text-xs group">
              View All Works <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredWorks.map((work, i) => (
              <motion.div
                key={work.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative h-[500px] overflow-hidden rounded-[2rem] cursor-pointer"
              >
                <img src={work.imageUrl} alt={work.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-[2px]" />
                <div className="absolute inset-0 flex flex-col justify-end p-10 translate-y-8 group-hover:translate-y-0 transition-all duration-500">
                  <span className="text-accent font-bold uppercase tracking-widest text-xs mb-3">{work.category}</span>
                  <h4 className="text-3xl font-serif text-white leading-tight group-hover:opacity-100 transition-opacity">{work.title}</h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section className="py-32 bg-bg overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-16 text-center space-y-4">
          <span className="text-accent font-bold uppercase tracking-[0.2em] text-xs">Impact Stories</span>
          <h2 className="text-4xl md:text-6xl font-black text-primary">Voices of Change</h2>
        </div>

        <div className="flex gap-8 px-6 md:px-[calc((100vw-80rem)/2)] overflow-x-auto no-scrollbar snap-x snap-mandatory">
          {testimonials.map((t, i) => (
            <div key={i} className="min-w-[320px] md:min-w-[450px] bg-white p-12 rounded-[2.5rem] shadow-sm flex flex-col gap-8 snap-center border border-gray-50">
              <Quote className="text-accent w-12 h-12 opacity-50" />
              <p className="text-xl text-primary font-medium leading-relaxed italic">"{t.text}"</p>
              <div className="mt-auto flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">{t.initials}</div>
                <div>
                  <h5 className="font-bold text-primary uppercase tracking-wide text-sm">{t.name}</h5>
                  <p className="text-[10px] text-accent font-bold tracking-widest">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- CTA BANNER --- */}
      <section className="bg-primary pt-32 pb-48 relative overflow-hidden diagonal-cut -mt-20">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12 relative z-10">
          <h2 className="text-5xl md:text-7xl font-serif text-white leading-tight font-black">
            Ready to Make a <br />
            <span className="text-accent italic">Real Difference?</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/volunteer" className="px-10 py-5 border-2 border-white/20 text-white rounded-full font-bold uppercase tracking-widest text-sm hover:bg-white/10 transition-colors w-full sm:w-auto text-center">
              Join as Volunteer
            </Link>
            <Link to="/contact" className="px-10 py-5 bg-accent text-white rounded-full font-bold uppercase tracking-widest text-sm hover:bg-accent-light transition-colors w-full sm:w-auto text-center shadow-xl shadow-black/20">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 40s linear infinite; }
      `}} />
    </>
  );
}
