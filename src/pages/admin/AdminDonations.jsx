import React, { useState } from 'react';
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useFirestore } from '../../hooks/useFirestore';
import { useAuth } from '../../hooks/useAuth';
import { Search, Download, Trash2, X, Loader2, ChevronRight, Heart, DollarSign, Target, CheckCircle, Clock, AlertCircle, Eye, CreditCard, RefreshCw, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AdminDonations() {
  const { docs: donations, loading } = useFirestore('donations');
  const { docs: campaigns } = useFirestore('campaigns');
  const { adminData } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedDonation, setSelectedDonation] = useState(null);

  const filteredDonations = donations.filter(d => {
    const search = searchQuery.toLowerCase();
    const matchesSearch = 
      (d.donorName || '').toLowerCase().includes(search) || 
      (d.email || '').toLowerCase().includes(search) ||
      (d.donationId || '').toLowerCase().includes(search);
    
    if (activeFilter === 'All') return matchesSearch;
    return matchesSearch && (d.status === activeFilter.toLowerCase() || (activeFilter === 'Acknowledged' && d.status === 'acknowledged'));
  });

  const totalRaised = donations.filter(d => d.status !== 'refunded' && d.status !== 'failed').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const pendingCount = donations.filter(d => d.status === 'pending').length;
  const completedCount = donations.filter(d => d.status === 'acknowledged').length;

  const handleAcknowledge = async (id, e) => {
    e?.stopPropagation();
    try {
      await updateDoc(doc(db, 'donations', id), { 
        status: 'acknowledged', 
        acknowledgedByAdmin: true,
        acknowledgedAt: serverTimestamp(),
        acknowledgedBy: adminData.uid
      });
      toast.success('Donation acknowledged');
    } catch (err) { toast.error('Update failed'); }
  };

  const handleRefund = async (id) => {
    if (window.confirm('Issue refund? This action marks the donation as refunded.')) {
      try {
        await updateDoc(doc(db, 'donations', id), { 
          status: 'refunded',
          refundedAt: serverTimestamp(),
          refundedBy: adminData.uid
        });
        toast.success('Donation marked as refunded');
        setSelectedDonation(null);
      } catch (err) { toast.error('Refund failed'); }
    }
  };

  const exportCSV = () => {
    const headers = ["Donation ID,Donor Name,Email,Amount,Cause,Method,Frequency,Status,Date"];
    const rows = filteredDonations.map(d => 
      `"${d.donationId}","${d.donorName}","${d.email}","${d.amount}","${d.causeName}","${d.paymentMethod}","${d.frequency}","${d.status}","${new Date(d.createdAt?.toDate()).toLocaleDateString()}"`
    );
    const content = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(content);
    link.download = `donations_export_${new Date().toISOString()}.csv`;
    link.click();
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 min-h-[80vh]">
      <div className="flex-1 space-y-8">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
          <div className="space-y-4">
            <span className="text-accent font-bold uppercase tracking-[0.2em] text-[10px]">Financial Operations</span>
            <h1 className="text-4xl md:text-5xl font-serif font-black text-primary italic">Donations <span className="text-accent">Ledger</span></h1>
          </div>
          <div className="flex gap-4">
             <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary"><DollarSign size={20} /></div>
                <div>
                  <p className="text-[10px] font-black uppercase text-primary/40 tracking-widest">Total Volume</p>
                  <p className="text-xl font-bold text-primary">${totalRaised.toLocaleString()}</p>
                </div>
             </div>
             <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={exportCSV} className="px-6 py-4 bg-primary text-white font-black rounded-2xl text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-primary/20"><Download size={16} /> Export</motion.button>
          </div>
        </header>

        <section className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
           <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
              <div className="relative w-full md:w-80 group/search">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/20 transition-colors" size={16} />
                <input type="text" placeholder="Search ID, name, email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-bg border-none rounded-full py-3 pl-12 pr-6 text-xs focus:ring-2 focus:ring-primary transition-all font-medium" />
              </div>
              <div className="flex flex-wrap items-center gap-2 bg-bg p-1.5 rounded-[2rem] border border-primary/5 shadow-inner">
                 {['All', 'Pending', 'Acknowledged', 'Refunded'].map(f => (
                    <button key={f} onClick={() => setActiveFilter(f)} className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeFilter === f ? 'bg-white text-primary shadow-sm' : 'text-primary/40 hover:text-primary'}`}>{f}</button>
                 ))}
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-[9px] uppercase font-black text-primary/30 tracking-[0.2em] border-b border-primary/5">
                       <th className="px-5 py-5 font-black">ID & Donor</th>
                       <th className="px-5 py-5 font-black">Amount</th>
                       <th className="px-5 py-5 font-black">Cause</th>
                       <th className="px-5 py-5 font-black">Status</th>
                       <th className="px-5 py-5 font-black">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-primary/5">
                    {filteredDonations.map((d) => (
                      <tr key={d.id} className="group hover:bg-bg transition-all cursor-pointer" onClick={() => setSelectedDonation(d)}>
                        <td className="px-5 py-6">
                           <p className="text-xs font-serif font-black text-primary italic leading-tight truncate max-w-[150px]">{d.donorName}</p>
                           <p className="text-[9px] text-primary/40 font-bold uppercase mt-1">{d.donationId}</p>
                        </td>
                        <td className="px-5 py-6">
                           <p className="text-sm font-bold text-accent">${(Number(d.amount)||0).toLocaleString()}</p>
                           <p className="text-[8px] text-primary/30 font-black uppercase tracking-widest mt-1">{d.paymentMethod} • {d.frequency}</p>
                        </td>
                        <td className="px-5 py-6">
                           <p className="text-[10px] font-bold text-primary/60 truncate max-w-[120px]">{d.causeName}</p>
                        </td>
                        <td className="px-5 py-6">
                           <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border flex items-center gap-1 w-fit ${
                             d.status === 'pending' ? 'bg-orange-50 text-orange-500 border-orange-100' : 
                             d.status === 'acknowledged' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'
                           }`}>
                             {d.status === 'pending' && <Clock size={10} />}
                             {d.status === 'acknowledged' && <CheckCircle size={10} />}
                             {d.status === 'refunded' && <XCircle size={10} />}
                             {d.status}
                           </span>
                        </td>
                        <td className="px-5 py-6">
                           <div className="flex gap-2">
                             <button onClick={(e) => { e.stopPropagation(); setSelectedDonation(d); }} className="w-8 h-8 rounded-full flex items-center justify-center text-primary/40 hover:text-primary transition-all bg-white shadow-sm border border-primary/5"><Eye size={14} /></button>
                             {d.status === 'pending' && (
                               <button onClick={(e) => handleAcknowledge(d.id, e)} className="w-8 h-8 rounded-full flex items-center justify-center text-emerald-400 hover:text-white hover:bg-emerald-500 transition-all bg-white shadow-sm border border-primary/5"><CheckCircle size={14} /></button>
                             )}
                           </div>
                        </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
           
           {filteredDonations.length === 0 && !loading && (
             <div className="py-20 flex flex-col items-center gap-4">
                <p className="text-[10px] font-black uppercase text-primary/20 tracking-widest">No transactions found</p>
             </div>
           )}
           {loading && <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary/20" size={32} /></div>}
        </section>
      </div>

      {/* Campaign Summary Panel */}
      <div className="w-full xl:w-96 space-y-8">
        <div className="bg-primary text-white p-8 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 scale-0 group-hover:scale-100 transition-transform opacity-10 duration-700 pointer-events-none"><Target size={120} /></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-serif font-black italic mb-2">Campaigns</h3>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-accent mb-8">Live Progress Tracking</p>
            
            <div className="space-y-6">
              {campaigns.filter(c => c.isActive !== false).map(camp => {
                const progress = Math.min(100, Math.round(((camp.raisedAmount || 0) / (camp.goal || 1)) * 100));
                return (
                  <div key={camp.id} className="bg-white/5 p-5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{camp.icon || '🎗️'}</span>
                        <h4 className="text-sm font-bold">{camp.title}</h4>
                      </div>
                      <span className="text-[10px] font-black bg-accent px-2 py-1 flex items-center gap-1 rounded uppercase min-w-[3rem] justify-center shadow-lg"><DollarSign size={10} /> {progress}%</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] uppercase font-bold text-white/40 tracking-widest">
                        <span>Raised: ${(camp.raisedAmount || 0).toLocaleString()}</span>
                        <span>Goal: ${(camp.goal || 0).toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden shadow-inner">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: `${progress}%` }} className="h-full bg-accent relative">
                           <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick View Drawer / Modal */}
      <AnimatePresence>
        {selectedDonation && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex justify-end bg-primary/20 backdrop-blur-sm" onClick={() => setSelectedDonation(null)}>
             <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="w-full max-w-md bg-white h-full shadow-2xl p-8 overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-primary/5">
                   <div>
                     <span className="text-[10px] font-black uppercase text-primary/40 tracking-widest border border-primary/10 rounded px-2 py-1">Receipt Viewer</span>
                     <h3 className="text-2xl font-serif font-black text-primary italic mt-2">Transaction</h3>
                   </div>
                   <button onClick={() => setSelectedDonation(null)} className="p-3 bg-bg rounded-full text-primary/40 hover:text-primary transition-all hover:bg-primary/5"><X size={18} /></button>
                </div>

                <div className="space-y-8">
                   <div className="text-center p-8 bg-bg rounded-[2.5rem] relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                      <p className="text-[9px] font-black uppercase tracking-widest text-primary/40 mb-2">Total Amount</p>
                      <h4 className="text-6xl font-serif font-black text-primary italic hover:scale-105 transition-transform">${(Number(selectedDonation.amount)||0).toLocaleString()}</h4>
                      <p className="text-[10px] font-bold text-accent uppercase tracking-widest mt-4 flex justify-center items-center gap-2">
                        {selectedDonation.status === 'pending' ? <Clock size={12} /> : selectedDonation.status === 'acknowledged' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        Status: {selectedDonation.status}
                      </p>
                   </div>

                   <div className="space-y-6">
                      <div className="space-y-2"><h5 className="text-[10px] font-black uppercase tracking-widest text-primary/40">Donor Profile</h5><p className="font-bold text-sm bg-bg px-5 py-3 rounded-2xl border border-primary/5">{selectedDonation.donorName}</p></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><h5 className="text-[10px] font-black uppercase tracking-widest text-primary/40">Email</h5><p className="font-bold text-xs bg-bg px-4 py-3 rounded-xl border border-primary/5 truncate" title={selectedDonation.email}>{selectedDonation.email}</p></div>
                        <div className="space-y-2"><h5 className="text-[10px] font-black uppercase tracking-widest text-primary/40">Phone</h5><p className="font-bold text-xs bg-bg px-4 py-3 rounded-xl border border-primary/5">{selectedDonation.phone || 'N/A'}</p></div>
                      </div>
                      <div className="space-y-2"><h5 className="text-[10px] font-black uppercase tracking-widest text-primary/40">Target Application</h5><p className="font-bold text-xs text-primary bg-primary/5 px-5 py-3 rounded-2xl">{selectedDonation.causeName}</p></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><h5 className="text-[10px] font-black uppercase tracking-widest text-primary/40">Method</h5><p className="font-bold text-xs uppercase bg-bg px-4 py-3 rounded-xl border border-primary/5">{selectedDonation.paymentMethod}</p></div>
                        <div className="space-y-2"><h5 className="text-[10px] font-black uppercase tracking-widest text-primary/40">Date</h5><p className="font-bold text-xs bg-bg px-4 py-3 rounded-xl border border-primary/5">{new Date(selectedDonation.createdAt?.toDate()).toLocaleDateString()}</p></div>
                      </div>

                      {selectedDonation.message && (
                        <div className="space-y-2 pt-2">
                          <h5 className="text-[10px] font-black uppercase tracking-widest text-primary/40 flex items-center gap-2"><Heart size={10} className="text-secondary" /> Donor Dedication</h5>
                          <p className="text-sm font-md text-primary/70 italic bg-accent/5 p-6 rounded-[2rem] border border-accent/20">"{selectedDonation.message}"</p>
                        </div>
                      )}
                   </div>

                   <div className="flex flex-col gap-3 pt-6 border-t border-primary/5">
                      {selectedDonation.status === 'pending' && (
                        <button onClick={() => handleAcknowledge(selectedDonation.id)} className="w-full py-5 bg-primary hover:bg-black text-white font-black rounded-full uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"><CheckCircle size={14} /> Acknowledge Payment</button>
                      )}
                      {selectedDonation.status !== 'refunded' && (
                        <button onClick={() => handleRefund(selectedDonation.id)} className="w-full py-4 border-2 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white font-black rounded-full uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2">Issue Refund</button>
                      )}
                   </div>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
