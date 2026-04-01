import React, { useState } from 'react';
import { updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useFirestore } from '../../hooks/useFirestore';
import { Search, Trash2, X, Loader2, ChevronRight, Mail, Reply, CheckCircle, Clock, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AdminContacts() {
  const { docs: contacts, loading } = useFirestore('contacts');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedContact, setSelectedContact] = useState(null);

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || 
                          (activeFilter === 'Unread' && !c.replied) || 
                          (activeFilter === 'Replied' && c.replied);
    return matchesSearch && matchesFilter;
  });

  const handleMarkReplied = async (id, status) => {
    try {
      await updateDoc(doc(db, 'contacts', id), { replied: status, updatedAt: serverTimestamp() });
      toast.success(`Marked as ${status ? 'replied' : 'unread'}`);
    } catch (err) { toast.error('Update failed'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove message permanently?')) {
      try {
        await deleteDoc(doc(db, 'contacts', id));
        toast.success('Inquiry removed');
      } catch (err) { toast.error('Deletion failed'); }
    }
  };

  return (
    <div className="w-full">
        <header className="mb-12 flex justify-between items-end">
          <div className="space-y-4">
            <span className="text-accent font-bold uppercase tracking-[0.2em] text-[10px]">Global Relations</span>
            <h1 className="text-4xl md:text-5xl font-serif font-black text-primary italic">Inquiry <span className="text-accent">Manager</span></h1>
          </div>
          <p className="text-[10px] font-black uppercase text-primary/20 tracking-widest bg-white px-6 py-4 rounded-full border border-gray-100 shadow-sm flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Unified Messaging Pipeline</p>
        </header>

        <section className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-12 text-primary/10 pointer-events-none group-hover:scale-110 transition-transform duration-1000"><Sparkles size={80} /></div>
           <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 relative z-10">
              <div className="relative w-full md:w-96 group/search">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/20 group-hover/search:text-primary/40 transition-colors" size={18} />
                <input type="text" placeholder="Search inquiries..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-bg border-none rounded-full py-4 pl-14 pr-8 text-sm focus:ring-2 focus:ring-primary transition-all font-medium" />
              </div>
              <div className="flex items-center gap-2 bg-bg p-1.5 rounded-full border border-primary/5 shadow-inner">
                 {['All', 'Unread', 'Replied'].map(f => (
                    <button key={f} onClick={() => setActiveFilter(f)} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === f ? 'bg-white text-primary shadow-sm' : 'text-primary/40 hover:text-primary'}`}>{f}</button>
                 ))}
              </div>
           </div>

           <div className="overflow-x-auto relative z-10">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-[10px] uppercase font-black text-primary/30 tracking-[0.2em] border-b border-primary/5">
                       <th className="px-6 py-6 font-black">Contact Info</th>
                       <th className="px-6 py-6 font-black">Subject</th>
                       <th className="px-6 py-6 font-black">Status</th>
                       <th className="px-6 py-6 font-black">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-primary/5">
                    {filteredContacts.map((c) => (
                      <tr key={c.id} className="group hover:bg-bg transition-all cursor-pointer" onClick={() => setSelectedContact(c)}>
                        <td className="px-6 py-8">
                           <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-bg flex items-center justify-center font-serif italic text-primary text-xl shadow-inner">{c.name[0]}</div>
                             <div>
                                <p className="text-sm font-serif font-black text-primary italic leading-tight">{c.name}</p>
                                <p className="text-[10px] text-primary/30 font-bold uppercase tracking-widest mt-1">{c.email}</p>
                             </div>
                           </div>
                        </td>
                        <td className="px-6 py-8">
                           <div className="flex flex-col gap-1 max-w-md"><p className="text-xs font-bold text-primary truncate uppercase tracking-wide">{c.subject}</p></div>
                        </td>
                        <td className="px-6 py-8">
                           <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                             !c.replied ? 'bg-red-50 text-red-500 border-red-100 flex items-center gap-2 w-fit' : 'bg-emerald-50 text-emerald-500 border-emerald-100 flex items-center gap-2 w-fit'
                           }`}>
                             {!c.replied ? <AlertCircle size={10} /> : <CheckCircle size={10} />}
                             {!c.replied ? 'Action Required' : 'Synchronized'}
                           </span>
                        </td>
                        <td className="px-6 py-8" onClick={e => e.stopPropagation()}>
                           <div className="flex gap-2">
                             <a href={`mailto:${c.email}?subject=RE: ${c.subject}`} className="w-10 h-10 rounded-full flex items-center justify-center text-primary/40 hover:text-primary hover:bg-white transition-all shadow-sm"><Reply size={16} /></a>
                             <button onClick={() => handleMarkReplied(c.id, !c.replied)} className="w-10 h-10 rounded-full flex items-center justify-center text-accent/40 hover:text-accent hover:bg-white transition-all shadow-sm"><CheckCircle size={16} /></button>
                             <button onClick={() => handleDelete(c.id)} className="w-10 h-10 rounded-full flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-white transition-all shadow-sm ml-4"><Trash2 size={16} /></button>
                           </div>
                        </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           {filteredContacts.length === 0 && !loading && (
             <div className="py-40 flex flex-col items-center gap-6">
                <Mail size={60} className="text-primary/5" />
                <p className="text-[10px] font-black uppercase text-primary/20 tracking-widest">No communications discovered</p>
             </div>
           )}

           {loading && (
             <div className="py-40 flex justify-center"><Loader2 className="animate-spin text-primary/20" size={40} /></div>
           )}
        </section>


      {/* --- INQUIRY MODAL --- */}
      <AnimatePresence>
        {selectedContact && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-primary/90 backdrop-blur-sm" onClick={() => setSelectedContact(null)}>
            <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }} className="bg-white rounded-[3.5rem] p-12 md:p-16 max-w-3xl w-full max-h-[90vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
               <button onClick={() => setSelectedContact(null)} className="absolute top-10 right-12 text-primary/20 hover:text-primary transition-all shadow-xl"><X size={32} /></button>
               
               <div className="flex flex-col items-center gap-6 mb-12 text-center">
                  <div className="w-24 h-24 rounded-[2.5rem] bg-bg flex items-center justify-center font-serif italic font-black text-primary text-5xl shadow-xl">{selectedContact.name[0]}</div>
                  <div>
                    <h3 className="text-4xl font-serif font-black text-primary italic leading-tight">{selectedContact.name}</h3>
                    <p className="text-xs font-bold text-accent uppercase tracking-widest mt-2">{selectedContact.email}</p>
                  </div>
               </div>

               <div className="space-y-12">
                  <div className="grid grid-cols-2 gap-8 border-y border-primary/5 py-10">
                     <div className="space-y-2"><h4 className="text-[10px] font-black uppercase text-primary/40 tracking-[0.2em] mb-2 flex items-center gap-2"><Clock size={12} className="text-accent" /> Submission Date</h4><p className="font-bold text-primary font-serif italic text-lg">{new Date(selectedContact.createdAt?.toDate()).toLocaleDateString()}</p></div>
                     <div className="space-y-2"><h4 className="text-[10px] font-black uppercase text-primary/40 tracking-[0.2em] mb-2 flex items-center gap-2"><CheckCircle size={12} className="text-accent" /> Priority Level</h4><p className="font-bold text-emerald-500 uppercase tracking-widest text-[10px] bg-emerald-50 px-2 py-1 rounded w-fit">Standard Inquiry</p></div>
                  </div>
                  
                  <div className="space-y-6 pt-4">
                     <h4 className="text-[10px] font-black uppercase text-primary/40 tracking-[0.2em] mb-2 flex items-center gap-2 px-10"><MessageSquare size={12} className="text-accent" /> Global Communication Context</h4>
                     <div className="relative group/text">
                        <div className="absolute -top-10 -left-10 text-primary/5 pointer-events-none group-hover/text:scale-110 transition-transform duration-1000"><Mail size={120} /></div>
                        <p className="text-sm font-medium text-primary/70 leading-relaxed bg-bg p-12 rounded-[3.5rem] italic relative z-10 border border-primary/5">"{selectedContact.message}"</p>
                     </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-4 pt-10">
                     <a href={`mailto:${selectedContact.email}?subject=RE: ${selectedContact.subject}`} className="w-full px-10 py-6 bg-primary hover:bg-black text-white font-black rounded-full text-xs uppercase tracking-widest transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-3"><Reply size={16} /> Orchestrate Response</a>
                     <button onClick={() => { handleMarkReplied(selectedContact.id, true); setSelectedContact(null); }} className="w-full px-10 py-6 border-2 border-primary/5 text-primary/40 hover:text-emerald-500 hover:border-emerald-500/20 font-black rounded-full text-xs uppercase tracking-widest transition-all">Synchronize Internal Registry</button>
                  </div>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
