import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Maximize2, Camera } from 'lucide-react';
import { useFirestore } from '../hooks/useFirestore';
import SEOHead from '../components/SEOHead';

const categories = ["All", "Education", "Health", "Crisis", "Environment"];

export default function Gallery() {
  const { docs: galleryItems, loading } = useFirestore('gallery', 'uploadedAt');
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedId, setSelectedId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(null);

  const filteredItems = galleryItems.filter(item => 
    activeFilter === "All" || item.category === activeFilter
  );

  const openLightbox = (item) => {
    const index = galleryItems.findIndex(i => i.id === item.id);
    setCurrentIndex(index);
    setSelectedId(item.id);
  };

  const closeLightbox = () => {
    setSelectedId(null);
    setCurrentIndex(null);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    const nextIdx = (currentIndex + 1) % galleryItems.length;
    setCurrentIndex(nextIdx);
    setSelectedId(galleryItems[nextIdx].id);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    const prevIdx = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    setCurrentIndex(prevIdx);
    setSelectedId(galleryItems[prevIdx].id);
  };

  return (
    <>
      <SEOHead title="Photo Gallery" description="A visual journey through our global initiatives. See the faces of change and the impact of your support." />

      {/* --- HERO SECTION --- */}
      <section className="bg-primary pt-48 pb-32 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/5 pointer-events-none select-none">
          <Camera size={400} />
        </div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.h1 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-5xl md:text-8xl font-black text-white mb-6 uppercase tracking-tight">
            Seeing is <span className="text-accent italic font-serif lowercase">Believing</span>
          </motion.h1>
          <p className="text-white/60 text-lg md:text-xl font-medium max-w-2xl mx-auto">
            A window into the lives we've touched and the progress we've forged together.
          </p>
        </div>
      </section>

      {/* --- FILTER BAR --- */}
      <section className="bg-bg py-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center gap-4 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveFilter(cat)} className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeFilter === cat ? "bg-primary text-white" : "bg-white text-primary border border-gray-100 hover:border-accent hover:text-accent"}`}>
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* --- MASONRY GRID --- */}
      <section className="py-20 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-6">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} whileHover={{ y: -5 }} className="relative break-inside-avoid cursor-pointer group rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100" onClick={() => openLightbox(item)}>
                  <img src={item.imageUrl} alt={item.caption} className="w-full h-auto transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-[2px] flex flex-col items-center justify-center p-8">
                    <span className="text-accent font-bold uppercase tracking-[0.3em] text-[10px] mb-4 translate-y-4 group-hover:translate-y-0 transition-transform">{item.category}</span>
                    <h3 className="text-white text-2xl font-serif italic text-center translate-y-4 group-hover:translate-y-0 transition-transform delay-75">{item.caption}</h3>
                    <div className="mt-8 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform delay-150"><Maximize2 size={18} /></div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {filteredItems.length === 0 && !loading && (
             <div className="py-40 text-center space-y-6">
              <h4 className="text-2xl font-serif italic text-primary">No images in this folder</h4>
              <button onClick={() => { setActiveFilter("All"); }} className="text-accent font-bold uppercase tracking-widest text-sm underline">Clear all filters</button>
            </div>
          )}
        </div>
      </section>

      {/* --- LIGHTBOX MODAL --- */}
      <AnimatePresence>
        {selectedId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-primary/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 md:p-20" onClick={closeLightbox}>
            <button className="absolute top-10 right-10 text-white/50 hover:text-white transition-colors" onClick={closeLightbox}><X size={40} /></button>
            <div className="relative max-w-6xl w-full h-full flex flex-col items-center justify-center gap-10">
              <motion.div key={currentIndex} initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 1.1, y: -20 }} className="relative max-h-[70vh] w-full flex justify-center" onClick={e => e.stopPropagation()}>
                <img src={galleryItems[currentIndex].imageUrl} alt={galleryItems[currentIndex].caption} className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl shadow-black/50" />
              </motion.div>
              <motion.div key={`title-${currentIndex}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2 pointer-events-none">
                <span className="text-accent font-bold uppercase tracking-[0.3em] text-xs">{galleryItems[currentIndex].category}</span>
                <h4 className="text-white text-3xl font-serif italic">{galleryItems[currentIndex].caption}</h4>
              </motion.div>
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none px-4 md:px-0">
                <button className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all pointer-events-auto shadow-xl" onClick={prevImage}><ChevronLeft size={32} /></button>
                <button className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all pointer-events-auto shadow-xl" onClick={nextImage}><ChevronRight size={32} /></button>
              </div>
            </div>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40 text-xs font-black tracking-widest">{currentIndex + 1} / {galleryItems.length}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
