import React, { useState } from 'react';
import { updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useFirestore } from '../../hooks/useFirestore';
import AdminSidebar from './AdminSidebar';
import { Search, Download, Trash2, X, Loader2, ChevronRight, Filter, Users, UserCheck, UserX, MessageSquare, Briefcase, MapPin, Calendar, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AdminVolunteers() {
  const { docs: volunteers, loading } = useFirestore('volunteers');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);

  const filteredVolunteers = volunteers.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          v.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || v.status === activeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateDoc(doc(db, 'volunteers', id), { status, updatedAt: serverTimestamp() });
      toast.success(`Application ${status}`);
    } catch (err) { toast.error('Update failed'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete registration?')) {
      try {
        await deleteDoc(doc(db, 'volunteers', id));
        toast.success('Registration removed');
      } catch (err) { toast.error('Delete failed'); }
    }
  };

  const exportCSV = () => {
    const headers = ["Name,Email,Phone,City,Availability,Status,AppliedAt"];
    const rows = filteredVolunteers.map(v => 
      `"${v.name}","${v.email}","${v.phone}","${v.city}","${v.availability}","${v.status}","${new Date(v.createdAt?.toDate()).toLocaleDateString()}"`
    );
    const content = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(content);
    link.download = `volunteers_report_${new Date().toISOString()}.csv`;
    link.click();
  };

  return (
    <div className="flex bg-[#fcfcfc] min-h-screen">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-12">
        <header className="mb-12 flex justify-between items-end">
          <div className="space-y-4">
            <span className="text-accent font-bold uppercase tracking-[0.2em] text-[10px]">Human Resources</span>
            <h1 className="text-4xl md:text-5xl font-serif font-black text-primary italic">Volunteer <span className="text-accent">HQ</span></h1>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={exportCSV} className="px-8 py-5 bg-white text-primary border border-primary/5 font-black rounded-full text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-black/[0.03] transition-all"><Download size={18} /> Export CSV</motion.button>
        </header>

        <section className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden group">
           <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 relative z-10">
              <div className="relative w-full md:w-96 group/search">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/20 group-hover/search:text-primary/40 transition-colors" size={18} />
                <input type="text" placeholder="Search applications..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-bg border-none rounded-full py-4 pl-14 pr-8 text-sm focus:ring-2 focus:ring-primary transition-all font-medium" />
              </div>
              <div className="flex items-center gap-2 bg-bg p-1.5 rounded-full border border-primary/5 shadow-inner">
                 {['All', 'Pending', 'Approved', 'Rejected'].map(f => (
                    <button key={f} onClick={() => setActiveFilter(f)} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === f ? 'bg-white text-primary shadow-sm' : 'text-primary/40 hover:text-primary'}`}>{f}</button>
                 ))}
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-[10px] uppercase font-black text-primary/30 tracking-[0.2em] border-b border-primary/5">
                       <th className="px-6 py-6 font-black">Candidate</th>
                       <th className="px-6 py-6 font-black">Location</th>
                       <th className="px-6 py-6 font-black">Availability</th>
                       <th className="px-6 py-6 font-black">Status</th>
                       <th className="px-6 py-6 font-black">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-primary/5">
                    {filteredVolunteers.map((v) => (
                      <tr key={v.id} className="group hover:bg-bg transition-all cursor-pointer" onClick={() => setSelectedVolunteer(v)}>
                        <td className="px-6 py-8">
                           <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center font-serif italic font-black text-primary text-xl shadow-inner">{v.name[0]}</div>
                             <div>
                                <p className="text-sm font-serif font-black text-primary italic leading-tight">{v.name}</p>
                                <p className="text-[10px] text-primary/30 font-bold uppercase tracking-widest mt-1">{v.email}</p>
                             </div>
                           </div>
                        </td>
                        <td className="px-6 py-8">
                           <div className="flex items-center gap-2 text-xs font-bold text-primary/60"><MapPin size={14} className="text-accent" /> {v.city}</div>
                        </td>
                        <td className="px-6 py-8">
                           <div className="flex items-center gap-2 text-xs font-bold text-primary/60"><Clock size={14} className="text-secondary" /> {v.availability}</div>
                        </td>
                        <td className="px-6 py-8">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                             v.status === 'pending' ? 'bg-orange-50 text-orange-500 border-orange-100' : 
                             v.status === 'approved' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'
                           }`}>{v.status}</span>
                        </td>
                        <td className="px-6 py-8" onClick={e => e.stopPropagation()}>
                           <div className="flex gap-2">
                             <button onClick={() => handleStatusUpdate(v.id, 'approved')} className="w-10 h-10 rounded-full flex items-center justify-center text-emerald-300 hover:text-emerald-500 hover:bg-white transition-all shadow-sm"><UserCheck size={16} /></button>
                             <button onClick={() => handleStatusUpdate(v.id, 'rejected')} className="w-10 h-10 rounded-full flex items-center justify-center text-orange-300 hover:text-orange-500 hover:bg-white transition-all shadow-sm"><UserX size={16} /></button>
                             <button onClick={() => handleDelete(v.id)} className="w-10 h-10 rounded-full flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-white transition-all shadow-sm ml-4"><Trash2 size={16} /></button>
                           </div>
                        </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           {filteredVolunteers.length === 0 && !loading && (
             <div className="py-40 flex flex-col items-center gap-6">
                <Users size={60} className="text-primary/5" />
                <p className="text-[10px] font-black uppercase text-primary/20 tracking-widest">No applications encountered</p>
             </div>
           )}

           {loading && (
             <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary/20" size={40} /></div>
           )}
        </section>
      </main>

      {/* --- DETAIL MODAL --- */}
      <AnimatePresence>
        {selectedVolunteer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-primary/90 backdrop-blur-sm" onClick={() => setSelectedVolunteer(null)}>
            <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }} className="bg-white rounded-[3.5rem] p-12 md:p-16 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
               <button onClick={() => setSelectedVolunteer(null)} className="absolute top-10 right-12 text-primary/20 hover:text-primary transition-all shadow-xl"><X size={32} /></button>
               
               <div className="flex flex-col items-center gap-6 mb-12 text-center">
                  <div className="w-24 h-24 rounded-[2rem] bg-bg flex items-center justify-center font-serif italic font-black text-primary text-5xl shadow-xl">{selectedVolunteer.name[0]}</div>
                  <div>
                    <h3 className="text-4xl font-serif font-black text-primary italic leading-tight">{selectedVolunteer.name}</h3>
                    <p className="text-xs font-bold text-accent uppercase tracking-widest mt-2">{selectedVolunteer.email} • {selectedVolunteer.phone}</p>
                  </div>
               </div>

               <div className="space-y-10">
                  <div className="grid grid-cols-2 gap-8 border-y border-primary/5 py-10">
                     <div className="space-y-2"><h4 className="text-[10px] font-black uppercase text-primary/40 tracking-[0.2em] mb-2 flex items-center gap-2"><MapPin size={12} className="text-accent" /> Origin</h4><p className="font-bold text-primary">{selectedVolunteer.city}</p></div>
                     <div className="space-y-2"><h4 className="text-[10px] font-black uppercase text-primary/40 tracking-[0.2em] mb-2 flex items-center gap-2"><Clock size={12} className="text-accent" /> Availability</h4><p className="font-bold text-primary">{selectedVolunteer.availability}</p></div>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                     <h4 className="text-[10px] font-black uppercase text-primary/40 tracking-[0.2em] mb-2 flex items-center gap-2"><Briefcase size={12} className="text-accent" /> Skillsets & Expertise</h4>
                     <p className="text-sm font-medium text-primary/70 leading-relaxed bg-bg p-8 rounded-[2.5rem]">{selectedVolunteer.skills}</p>
                  </div>

                  <div className="space-y-4 pt-4">
                     <h4 className="text-[10px] font-black uppercase text-primary/40 tracking-[0.2em] mb-2 flex items-center gap-2"><MessageSquare size={12} className="text-accent" /> Professional Motivation</h4>
                     <p className="text-sm font-medium text-primary/70 leading-relaxed bg-bg p-8 rounded-[2.5rem] italic">"{selectedVolunteer.motivation}"</p>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-4 pt-10">
                     <button onClick={() => { handleStatusUpdate(selectedVolunteer.id, 'approved'); setSelectedVolunteer(null); }} className="w-full px-8 py-5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-full text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20">Approve Application</button>
                     <button onClick={() => { handleStatusUpdate(selectedVolunteer.id, 'rejected'); setSelectedVolunteer(null); }} className="w-full px-8 py-5 border-2 border-primary/5 text-primary/40 hover:text-red-500 hover:border-red-500/20 font-black rounded-full text-xs uppercase tracking-widest transition-all">Reject Membership</button>
                  </div>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
