import React, { useState } from 'react';
import { collection, addDoc, deleteDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useFirestore } from '../../hooks/useFirestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, AlertCircle, TrendingUp, Sparkles, CheckCircle2, Loader2, Globe, Target } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCampaigns() {
  const { docs: campaigns, loading } = useFirestore('campaigns');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', description: '', goal: 10000, icon: '🎗️', isActive: true, raisedAmount: 0
  });

  const resetForm = () => {
    setFormData({ title: '', description: '', goal: 10000, icon: '🎗️', isActive: true, raisedAmount: 0 });
    setEditingCampaign(null);
  };

  const handleEdit = (campaign) => {
    setEditingCampaign(campaign);
    setFormData(campaign);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCampaign) {
        await updateDoc(doc(db, 'campaigns', editingCampaign.id), {
          ...formData, updatedAt: serverTimestamp()
        });
        toast.success('Campaign updated');
      } else {
        await addDoc(collection(db, 'campaigns'), {
          ...formData, createdAt: serverTimestamp()
        });
        toast.success('Campaign created');
      }
      setModalOpen(false);
      resetForm();
    } catch (err) { toast.error('Operation failed'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete campaign? Warning: Ensure there are no active donations linked to this campaign.')) {
      try {
        await deleteDoc(doc(db, 'campaigns', id));
        toast.success('Campaign removed');
      } catch (err) { toast.error('Delete failed'); }
    }
  };

  return (
    <div className="w-full">
      <header className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div className="space-y-4">
          <span className="text-accent font-bold uppercase tracking-[0.2em] text-[10px]">Fundraising Goals</span>
          <h1 className="text-4xl md:text-5xl font-serif font-black text-primary italic">Live <span className="text-accent">Campaigns</span></h1>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { resetForm(); setModalOpen(true); }} className="px-8 py-5 bg-primary hover:bg-black text-white font-black rounded-full text-xs uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-primary/20 transition-all"><Plus size={18} /> New Campaign</motion.button>
      </header>

      <section className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-12 text-primary/5 pointer-events-none group-hover:scale-110 transition-transform duration-1000"><Sparkles size={100} /></div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            <AnimatePresence mode="popLayout">
              {campaigns.map((camp) => {
                const progress = Math.min(100, Math.round(((camp.raisedAmount || 0) / (camp.goal || 1)) * 100));
                return (
                  <motion.div key={camp.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`bg-bg rounded-[2.5rem] p-8 border hover:shadow-2xl transition-all duration-300 relative group/card ${camp.isActive ? 'border-primary/5 hover:border-primary/20' : 'border-red-100 opacity-60'}`}>
                    
                    <div className="flex justify-between items-start mb-6">
                       <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-primary/5 group-hover/card:scale-110 transition-transform">{camp.icon}</div>
                       <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-1 shadow-sm ${camp.isActive ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                          {camp.isActive ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                          {camp.isActive ? 'Active' : 'Closed'}
                       </div>
                    </div>

                    <div className="space-y-4 mb-8">
                       <h3 className="text-2xl font-serif font-black text-primary italic leading-tight">{camp.title}</h3>
                       <p className="text-xs font-bold text-primary/50 uppercase tracking-widest leading-relaxed line-clamp-2">{camp.description || 'Global initiative for sustainable impact.'}</p>
                    </div>

                    <div className="space-y-4 mb-8">
                       <div className="flex justify-between text-[10px] font-black uppercase text-primary tracking-widest">
                          <span className="flex items-center gap-1"><TrendingUp size={12} className="text-accent" /> ${(camp.raisedAmount || 0).toLocaleString()}</span>
                          <span className="text-primary/40 flex items-center gap-1"><Target size={12} /> ${(camp.goal || 1).toLocaleString()}</span>
                       </div>
                       <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} whileInView={{ width: `${progress}%` }} className="h-full bg-accent relative">
                             <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                          </motion.div>
                       </div>
                    </div>

                    <div className="flex items-center gap-3 pt-6 border-t border-primary/5">
                       <button onClick={() => handleEdit(camp)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary/40 hover:text-primary transition-all shadow-sm border border-primary/5"><Edit2 size={16} /></button>
                       <button onClick={() => handleDelete(camp.id)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm border border-primary/5"><Trash2 size={16} /></button>
                       <div className="ml-auto text-accent font-black text-xs">{progress}%</div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
         </div>

         {campaigns.length === 0 && !loading && (
           <div className="py-40 flex flex-col items-center gap-6">
              <Globe size={60} className="text-primary/5" />
              <p className="text-[10px] font-black uppercase text-primary/20 tracking-widest">No global campaigns active</p>
           </div>
         )}

         {loading && (
           <div className="py-40 flex justify-center"><Loader2 className="animate-spin text-primary/20" size={40} /></div>
         )}
      </section>

      {/* MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-primary/90 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
            <motion.form initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }} onSubmit={handleSubmit} className="bg-white rounded-[3.5rem] p-12 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
               <button type="button" onClick={() => setModalOpen(false)} className="absolute top-10 right-12 text-primary/20 hover:text-primary transition-all"><X size={32} /></button>
               
               <div className="flex flex-col items-center gap-4 mb-10 text-center">
                  <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center shadow-inner text-2xl">{formData.icon}</div>
                  <div>
                    <h3 className="text-3xl font-serif font-black text-primary italic">{editingCampaign ? 'Update' : 'Launch'} Campaign</h3>
                    <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] mt-2">Strategic Initiative Matrix</p>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-primary/40 ml-4 tracking-widest">Campaign Icon (Emoji)</label>
                        <input type="text" maxLength="2" required value={formData.icon} onChange={e => setFormData(p => ({ ...p, icon: e.target.value }))} className="w-full bg-bg border-none rounded-full py-4 px-8 text-sm focus:ring-2 focus:ring-primary font-bold text-center text-xl" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-primary/40 ml-4 tracking-widest">Goal Status</label>
                        <select value={formData.isActive} onChange={e => setFormData(p => ({ ...p, isActive: e.target.value === 'true' }))} className="w-full bg-bg border-none rounded-full py-4 px-8 text-sm focus:ring-2 focus:ring-primary font-bold appearance-none">
                           <option value="true">Active & Receiving</option>
                           <option value="false">Closed / Inactive</option>
                        </select>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-primary/40 ml-4 tracking-widest">Initiative Title</label>
                     <input type="text" required value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} className="w-full bg-bg border-none rounded-full py-4 px-8 text-sm focus:ring-2 focus:ring-primary font-bold" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-primary/40 ml-4 tracking-widest">Goal Amount ($)</label>
                        <input type="number" min="1" required value={formData.goal} onChange={e => setFormData(p => ({ ...p, goal: Number(e.target.value) }))} className="w-full bg-bg border-none rounded-full py-4 px-8 text-sm focus:ring-2 focus:ring-primary font-bold text-primary" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-primary/40 ml-4 tracking-widest">Current Raised ($)</label>
                        <input type="number" min="0" required value={formData.raisedAmount} onChange={e => setFormData(p => ({ ...p, raisedAmount: Number(e.target.value) }))} className="w-full bg-bg border-none rounded-full py-4 px-8 text-sm focus:ring-2 focus:ring-primary font-bold text-accent" />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-primary/40 ml-4 tracking-widest">Description & Impact</label>
                     <textarea required rows={4} value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} className="w-full bg-bg border-none rounded-[2rem] py-6 px-8 text-sm focus:ring-2 focus:ring-primary font-bold resize-none leading-relaxed"></textarea>
                  </div>

                  <button type="submit" className="w-full bg-primary hover:bg-black text-white font-black py-5 rounded-full uppercase tracking-widest text-xs transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 mt-8">
                     <CheckCircle2 size={18} /> {editingCampaign ? 'Synchronize Data' : 'Deploy Campaign'}
                  </button>
               </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
