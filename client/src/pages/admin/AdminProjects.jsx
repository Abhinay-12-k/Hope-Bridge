import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../../firebase/config';
import { useFirestore } from '../../hooks/useFirestore';
import AdminSidebar from './AdminSidebar';
import { Plus, Search, Edit2, Trash2, X, Loader2, Globe, Sparkles, Filter, MoreHorizontal, ChevronRight, LayoutGrid, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';

const categories = ["Education", "Healthcare", "Environment", "Crisis Relief", "Sustainability"];

export default function AdminProjects() {
  const { docs: projects, loading } = useFirestore('projects');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const [formData, setFormData] = useState({
      title: '', category: 'Education', country: '', description: '', impact: '', year: new Date().getFullYear(), imageUrl: ''
  });

  const filteredProjects = projects.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({ title: '', category: 'Education', country: '', description: '', impact: '', year: new Date().getFullYear(), imageUrl: '' });
    setEditingProject(null);
    setUploadProgress(0);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData(project);
    setModalOpen(true);
  };

  const handleImageUpload = (file) => {
    const storageRef = ref(storage, `projects/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
      (err) => toast.error('Upload failed'),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        setFormData(prev => ({ ...prev, imageUrl: url }));
        toast.success('Image Uploaded');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.imageUrl) return toast.error('Upload an image first');
    
    try {
      if (editingProject) {
        await updateDoc(doc(db, 'projects', editingProject.id), { ...formData, updatedAt: serverTimestamp() });
        toast.success('Project updated');
      } else {
        await addDoc(collection(db, 'projects'), { ...formData, createdAt: serverTimestamp() });
        toast.success('Project created');
      }
      setModalOpen(false);
      resetForm();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this project?')) {
      try {
        await deleteDoc(doc(db, 'projects', id));
        toast.success('Project deleted');
      } catch (err) {
        toast.error('Delete failed');
      }
    }
  };

  return (
    <div className="flex bg-[#fcfcfc] min-h-screen">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-12">
        <header className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
          <div className="space-y-4">
            <span className="text-accent font-bold uppercase tracking-[0.2em] text-[10px]">Global Initiatives</span>
            <h1 className="text-4xl md:text-5xl font-serif font-black text-primary italic">Projects List <span className="text-accent">Manager</span></h1>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { resetForm(); setModalOpen(true); }} className="px-8 py-5 bg-primary text-white font-black rounded-full text-xs uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-primary/20"><Plus size={18} /> Add Initiative</motion.button>
        </header>

        <section className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-sm">
           <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
              <div className="relative w-full md:w-96 group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/20 group-hover:text-primary/40 transition-colors" size={18} />
                <input type="text" placeholder="Search initiatives..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-bg border-none rounded-full py-4 pl-14 pr-8 text-sm focus:ring-2 focus:ring-primary transition-all font-medium" />
              </div>
              <div className="flex items-center gap-2 bg-bg p-1.5 rounded-full border border-primary/5">
                 <button onClick={() => setViewMode('grid')} className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-primary/40 hover:text-primary'}`}><LayoutGrid size={14} /> Grid</button>
                 <button onClick={() => setViewMode('list')} className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-primary/40 hover:text-primary'}`}><List size={14} /> List</button>
              </div>
           </div>

           {viewMode === 'grid' ? (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
               <AnimatePresence mode="popLayout">
                 {filteredProjects.map((project) => (
                   <motion.div key={project.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-bg rounded-[2.5rem] overflow-hidden p-6 border border-primary/5 group relative hover:shadow-2xl hover:shadow-black/5 transition-all">
                     <div className="h-48 rounded-[2rem] overflow-hidden mb-6 relative">
                       <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                       <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent flex flex-col justify-end p-6">
                         <span className="bg-accent text-white font-black text-[9px] uppercase px-3 py-1 rounded-full w-fit tracking-wider">{project.category}</span>
                       </div>
                     </div>
                     <div className="space-y-4">
                       <h4 className="text-xl font-serif font-black text-primary italic font-black leading-tight">{project.title}</h4>
                       <p className="text-xs text-primary/50 font-bold uppercase tracking-widest flex items-center gap-2 underline underline-offset-4 decoration-accent/30">{project.country}</p>
                       <div className="flex items-center gap-3 pt-4 border-t border-primary/5">
                         <button onClick={() => handleEdit(project)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary/40 hover:text-primary transition-all shadow-sm"><Edit2 size={16} /></button>
                         <button onClick={() => handleDelete(project.id)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-red-300 hover:text-red-500 transition-all shadow-sm"><Trash2 size={16} /></button>
                         <div className="ml-auto flex items-center text-accent font-black uppercase tracking-widest text-[9px] gap-2">{project.year} <ChevronRight size={12} /></div>
                       </div>
                     </div>
                   </motion.div>
                 ))}
               </AnimatePresence>
             </div>
           ) : (
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] uppercase font-black text-primary/30 tracking-[0.2em] border-b border-primary/5">
                       <th className="px-6 py-6 font-black">Project Initiative</th>
                       <th className="px-6 py-6 font-black">Category</th>
                       <th className="px-6 py-6 font-black">Location</th>
                       <th className="px-6 py-6 font-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/5">
                    {filteredProjects.map((project) => (
                      <tr key={project.id} className="group hover:bg-bg transition-colors">
                        <td className="px-6 py-8">
                           <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-xl overflow-hidden shadow-xl shrink-0"><img src={project.imageUrl} className="w-full h-full object-cover" /></div>
                             <p className="text-sm font-serif font-black text-primary italic leading-tight">{project.title}</p>
                           </div>
                        </td>
                        <td className="px-6 py-8">
                           <p className="text-[10px] font-black uppercase tracking-widest text-accent">{project.category}</p>
                        </td>
                        <td className="px-6 py-8">
                           <p className="text-xs font-bold text-primary underline underline-offset-4 decoration-accent/30">{project.country}</p>
                        </td>
                        <td className="px-6 py-8">
                           <div className="flex gap-2">
                             <button onClick={() => handleEdit(project)} className="w-10 h-10 rounded-full flex items-center justify-center text-primary/40 hover:text-primary transition-all"><Edit2 size={16} /></button>
                             <button onClick={() => handleDelete(project.id)} className="w-10 h-10 rounded-full flex items-center justify-center text-red-300 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
           )}

           {loading && (
             <div className="py-40 flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-primary/20" size={40} />
                <p className="text-[10px] font-black uppercase text-primary/40 tracking-widest">Retrieving global data...</p>
             </div>
           )}
        </section>
      </main>

      {/* --- ADD/EDIT MODAL --- */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-primary/90 backdrop-blur-sm">
            <motion.form initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }} onSubmit={handleSubmit} className="bg-white rounded-[3.5rem] p-10 md:p-14 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative grid grid-cols-1 md:grid-cols-2 gap-12">
               <button type="button" onClick={() => setModalOpen(false)} className="absolute top-8 right-10 text-primary/40 hover:text-primary transition-all"><X size={32} /></button>
               
               <div className="space-y-8">
                 <div className="space-y-2">
                    <h3 className="text-3xl font-serif font-black text-primary italic">{editingProject ? 'Modify' : 'New'} Project</h3>
                    <p className="text-xs font-bold text-primary/40 uppercase tracking-widest">Define the initiative scope</p>
                 </div>
                 
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-primary/40 ml-4 tracking-widest">Title</label>
                       <input type="text" required value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} className="w-full bg-bg border-none rounded-full py-4 px-8 text-sm focus:ring-2 focus:ring-primary font-medium" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-primary/40 ml-4 tracking-widest">Category</label>
                          <select required value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))} className="w-full bg-bg border-none rounded-full py-4 px-8 text-sm focus:ring-2 focus:ring-primary font-medium">
                             {categories.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-primary/40 ml-4 tracking-widest">Year</label>
                          <input type="number" required value={formData.year} onChange={e => setFormData(p => ({ ...p, year: e.target.value }))} className="w-full bg-bg border-none rounded-full py-4 px-8 text-sm focus:ring-2 focus:ring-primary font-medium" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-primary/40 ml-4 tracking-widest">Location</label>
                       <input type="text" required value={formData.country} onChange={e => setFormData(p => ({ ...p, country: e.target.value }))} className="w-full bg-bg border-none rounded-full py-4 px-8 text-sm focus:ring-2 focus:ring-primary font-medium" />
                    </div>
                 </div>
               </div>

               <div className="space-y-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-primary/40 ml-4 tracking-widest">Description</label>
                     <textarea required rows={4} value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} className="w-full bg-bg border-none rounded-[2rem] py-6 px-8 text-sm focus:ring-2 focus:ring-primary font-medium resize-none"></textarea>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-primary/40 ml-4 tracking-widest">Metric Impact</label>
                     <input type="text" required placeholder="Ex: 5,000+ lives improved" value={formData.impact} onChange={e => setFormData(p => ({ ...p, impact: e.target.value }))} className="w-full bg-bg border-none rounded-full py-4 px-8 text-sm focus:ring-2 focus:ring-primary font-medium" />
                  </div>
                  
                  <div className="bg-bg rounded-[3rem] p-8 space-y-4 relative border border-dashed border-primary/10">
                     <h4 className="text-[10px] font-black uppercase text-primary/40 tracking-[0.2em] mb-2">Project Imagery</h4>
                     {formData.imageUrl ? (
                        <div className="relative group/img overflow-hidden rounded-2xl h-32 border-2 border-white shadow-xl">
                           <img src={formData.imageUrl} className="w-full h-full object-cover" />
                           <label className="absolute inset-0 bg-primary/60 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all cursor-pointer text-white font-black text-[10px] uppercase group-hover:scale-105 transition-transform"><Plus size={18} className="mr-2" /> Change Image<input type="file" className="hidden" onChange={e => handleImageUpload(e.target.files[0])} /></label>
                        </div>
                     ) : (
                        <div className="flex flex-col items-center gap-4 py-8 pointer-events-none">
                           {uploadProgress > 0 && uploadProgress < 100 ? (
                             <div className="w-full bg-bg rounded-full h-1"><motion.div initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} className="bg-accent h-full rounded-full" /></div>
                           ) : (
                             <Globe size={40} className="text-primary/10" />
                           )}
                           <p className="text-[10px] font-black uppercase tracking-widest text-primary/30">Storage ready</p>
                        </div>
                     )}
                     {!formData.imageUrl && (
                        <input type="file" required={!editingProject} className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleImageUpload(e.target.files[0])} />
                     )}
                  </div>
                  
                  <button type="submit" disabled={uploadProgress > 0 && uploadProgress < 100} className="w-full bg-primary hover:bg-black text-white font-black py-5 rounded-full uppercase tracking-widest text-xs transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-3">
                     <CheckCircle size={18} /> {editingProject ? 'Submit Updates' : 'Launch Initiative'}
                  </button>
               </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const CheckCircle = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);
