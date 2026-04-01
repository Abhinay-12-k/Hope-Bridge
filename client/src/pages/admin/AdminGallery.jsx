import React, { useState } from 'react';
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../../firebase/config';
import { useFirestore } from '../../hooks/useFirestore';
import { Plus, Trash2, X, Loader2, Camera, Image as ImageIcon, ChevronRight, LayoutGrid, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';

const categories = ["Education", "Health", "Crisis", "Environment"];

export default function AdminGallery() {
  const { docs: gallery, loading } = useFirestore('gallery', 'uploadedAt');
  const [modalOpen, setModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({ imageUrl: '', caption: '', category: 'Education' });

  const handleImageUpload = (file) => {
    const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
      (err) => toast.error('Upload failed'),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        setFormData(prev => ({ ...prev, imageUrl: url }));
        toast.success('Asset Uploaded');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.imageUrl) return toast.error('Asset required');
    try {
      await addDoc(collection(db, 'gallery'), { ...formData, uploadedAt: serverTimestamp() });
      toast.success('Gallery updated');
      setModalOpen(false);
      setFormData({ imageUrl: '', caption: '', category: 'Education' });
      setUploadProgress(0);
    } catch (err) { toast.error('Upload failed'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove asset?')) {
      try {
        await deleteDoc(doc(db, 'gallery', id));
        toast.success('Asset removed');
      } catch (err) { toast.error('Removal failed'); }
    }
  };

  return (
    <div className="w-full">
        <header className="mb-12 flex justify-between items-end">
          <div className="space-y-4">
            <span className="text-accent font-bold uppercase tracking-[0.2em] text-[10px]">Visual Storytelling</span>
            <h1 className="text-4xl md:text-5xl font-serif font-black text-primary italic">Media <span className="text-accent">Library</span></h1>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setModalOpen(true)} className="px-8 py-5 bg-primary text-white font-black rounded-full text-xs uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-primary/20 transition-all"><Camera size={18} /> New Asset</motion.button>
        </header>

        <section className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-12 text-primary/5 pointer-events-none group-hover:scale-110 transition-all duration-1000"><Sparkles size={80} /></div>
           <div className="flex justify-between items-center mb-12 relative z-10">
              <div className="space-y-1">
                 <h3 className="text-sm font-bold text-primary uppercase tracking-widest">Global Assets</h3>
                 <p className="text-[10px] text-primary/40 font-black uppercase tracking-[0.2em]">{gallery.length} Images in Repository</p>
              </div>
              <div className="bg-bg rounded-full p-1.5 border border-primary/5 shadow-inner"><LayoutGrid size={18} className="text-primary/40 m-2" /></div>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              <AnimatePresence mode="popLayout">
                {gallery.map((item) => (
                  <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative aspect-square group/item cursor-pointer overflow-hidden rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100">
                    <img src={item.imageUrl} alt={item.caption} className="w-full h-full object-cover transition-transform duration-1000 group-hover/item:scale-110 grayscale-[0.3] group-hover/item:grayscale-0" />
                    <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover/item:opacity-100 transition-all duration-500 backdrop-blur-[2px] flex flex-col items-center justify-center p-6">
                       <span className="text-accent font-black uppercase tracking-[0.3em] text-[8px] mb-2">{item.category}</span>
                       <h4 className="text-white text-sm font-serif italic text-center mb-6">{item.caption}</h4>
                       <button onClick={() => handleDelete(item.id)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-white scale-0 group-hover/item:scale-100 transition-all shadow-xl"><Trash2 size={16} /></button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
           </div>

           {gallery.length === 0 && !loading && (
             <div className="py-40 flex flex-col items-center gap-6">
                <ImageIcon size={60} className="text-primary/5" />
                <p className="text-[10px] font-black uppercase text-primary/20 tracking-widest">No assets discovered</p>
                <button onClick={() => setModalOpen(true)} className="text-accent font-bold uppercase tracking-widest text-[10px] underline underline-offset-8">Capture first moment</button>
             </div>
           )}

           {loading && (
             <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary/20" size={40} /></div>
           )}
        </section>


      {/* --- ADD MODAL --- */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-primary/90 backdrop-blur-sm">
            <motion.form initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }} onSubmit={handleSubmit} className="bg-white rounded-[3.5rem] p-12 max-w-xl w-full relative overflow-hidden group/modal">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover/modal:scale-105 transition-transform duration-700" />
               <button type="button" onClick={() => setModalOpen(false)} className="absolute top-10 right-12 text-primary/20 hover:text-primary transition-all"><X size={32} /></button>
               
               <div className="text-center mb-10">
                  <h3 className="text-3xl font-serif font-black text-primary italic mb-2">New Media Asset</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Visual impact synchronization</p>
               </div>

               <div className="space-y-6">
                  <div className="bg-bg rounded-[2.5rem] p-8 border-2 border-dashed border-primary/10 relative overflow-hidden group/up min-h-64 flex flex-col items-center justify-center">
                     {formData.imageUrl ? (
                        <div className="absolute inset-0 group/img">
                           <img src={formData.imageUrl} className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center"><p className="text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2"><ImageIcon size={14} /> Replace Image</p><input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleImageUpload(e.target.files[0])} /></div>
                        </div>
                     ) : (
                        <>
                          {uploadProgress > 0 && uploadProgress < 100 ? (
                            <div className="w-48 bg-primary/5 h-1.5 rounded-full overflow-hidden mb-4"><motion.div initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} className="bg-accent h-full" /></div>
                          ) : <Plus size={40} className="text-primary/10 mb-4 group-hover/up:scale-110 transition-transform" />}
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary/30">Drop or Click to Upload</p>
                          <input type="file" required className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleImageUpload(e.target.files[0])} />
                        </>
                     )}
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-primary/40 ml-4 tracking-widest">Asset Caption</label>
                     <input type="text" required value={formData.caption} onChange={e => setFormData(p => ({ ...p, caption: e.target.value }))} className="w-full bg-bg border-none rounded-full py-4 px-8 text-sm focus:ring-2 focus:ring-primary font-medium" placeholder="Ex: Medical mission in Kenya" />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-primary/40 ml-4 tracking-widest">Global Sector</label>
                     <select required value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))} className="w-full bg-bg border-none rounded-full py-4 px-8 text-sm focus:ring-2 focus:ring-primary font-medium appearance-none">
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                  </div>

                  <button type="submit" disabled={uploadProgress > 0 && uploadProgress < 100} className="w-full bg-primary hover:bg-black text-white font-black py-5 rounded-full uppercase tracking-widest text-xs transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-3">Authorize Asset</button>
               </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
