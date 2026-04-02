import React, { useState, useEffect } from 'react';
import Hero3D from '../components/Hero3D';

import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, Globe, Filter, X } from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';
import SEOHead from '../components/SEOHead';

const categories = ["All", "Education", "Healthcare", "Environment", "Crisis Relief", "Sustainability"];

export default function Works() {
  const { docs: projects, loading } = useFirestore('projects');
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);

  const filteredProjects = projects.filter(project => {
    const matchesFilter = activeFilter === "All" || project.category === activeFilter;
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          project.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <>
      <SEOHead title="Our Global Initiatives" description="Explore the impact of HopeBridge NGO around the world. Filter by education, healthcare, environment, and more." />

      {/* --- HERO SECTION --- */}
      <section className="bg-primary pt-48 pb-32 text-center relative overflow-hidden">
        <Hero3D />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.h1 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-5xl md:text-8xl font-black text-white mb-6 uppercase tracking-tight">
            Our Global <span className="text-accent italic font-serif lowercase">Initiatives</span>
          </motion.h1>
          <p className="text-white/60 text-lg md:text-xl font-medium max-w-2xl mx-auto">
            Measurable impact on the ground across 15 countries and 4 continents.
          </p>
        </div>
      </section>

      {/* --- FILTER BAR --- */}
      <section className="sticky top-[72px] z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar w-full lg:w-auto pb-4 lg:pb-0">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveFilter(cat)} className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeFilter === cat ? "bg-accent text-white" : "bg-bg text-primary hover:bg-primary/5"}`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
            <input type="text" placeholder="Search initiatives..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-bg border-none rounded-full py-4 pl-14 pr-6 text-sm focus:ring-2 focus:ring-accent transition-all font-medium" />
          </div>
        </div>
      </section>

      {/* --- PROJECTS GRID --- */}
      <section className="py-24 bg-bg min-h-[600px]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project) => (
                <motion.div key={project.id} layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} whileHover={{ y: -12 }} className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-transparent hover:border-accent/10 group cursor-pointer" onClick={() => setSelectedProject(project)}>
                  <div className="h-64 overflow-hidden relative">
                    <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000 grayscale-[0.2] group-hover:grayscale-0" />
                    <div className="absolute top-6 left-6 z-20">
                      <span className="px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full">{project.category}</span>
                    </div>
                  </div>
                  <div className="p-10 space-y-4">
                    <h3 className="text-2xl font-serif font-black text-primary leading-tight italic group-hover:text-accent transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-text-muted text-sm leading-relaxed line-clamp-3">{project.description}</p>
                    <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                      <button className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">Learn More <ArrowRight size={14} /></button>
                      <span className="text-sm font-medium text-text-muted flex items-center gap-2 underline underline-offset-4 decoration-accent/30">{project.country}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredProjects.length === 0 && !loading && (
            <div className="py-40 text-center space-y-6">
              <h4 className="text-2xl font-serif italic text-primary">No matching initiatives found</h4>
              <button onClick={() => { setActiveFilter("All"); setSearchQuery(""); }} className="text-accent font-bold uppercase tracking-widest text-sm underline">Clear all filters</button>
            </div>
          )}
        </div>
      </section>

      {/* --- MODAL --- */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-primary/90 backdrop-blur-sm" onClick={() => setSelectedProject(null)}>
            <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }} className="bg-white rounded-[3rem] p-10 md:p-14 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
              <button className="absolute top-8 right-10 text-primary/40 hover:text-primary transition-colors" onClick={() => setSelectedProject(null)}><X size={32} /></button>
              <div className="flex flex-col md:flex-row gap-12">
                <div className="md:w-1/2 rounded-[2rem] overflow-hidden sticky top-0"><img src={selectedProject.imageUrl} className="w-full h-full object-cover" /></div>
                <div className="md:w-1/2 space-y-6">
                  <span className="text-accent font-bold uppercase tracking-widest text-xs underline decoration-accent/30">{selectedProject.category}</span>
                  <h3 className="text-4xl font-serif font-black text-primary italic leading-tight">{selectedProject.title}</h3>
                  <p className="text-text-muted leading-relaxed">{selectedProject.description}</p>
                  <div className="pt-6 border-t border-gray-100 grid grid-cols-2 gap-8">
                    <div><h4 className="text-[10px] font-black uppercase text-primary/40 tracking-[0.2em] mb-2">Impact</h4><p className="font-bold text-primary">{selectedProject.impact}</p></div>
                    <div><h4 className="text-[10px] font-black uppercase text-primary/40 tracking-[0.2em] mb-2">Location</h4><p className="font-bold text-primary">{selectedProject.country}</p></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
