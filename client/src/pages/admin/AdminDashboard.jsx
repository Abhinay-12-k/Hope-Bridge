import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import AdminSidebar from './AdminSidebar';
import { Users, FolderKanban, Image as ImageIcon, Mail, Clock, CheckCircle, TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    volunteers: 0,
    pendingVolunteers: 0,
    projects: 0,
    gallery: 0,
    contacts: 0,
    unreadContacts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const vSnap = await getDocs(collection(db, 'volunteers'));
        const pVSnap = await getDocs(query(collection(db, 'volunteers'), where('status', '==', 'pending')));
        const pSnap = await getDocs(collection(db, 'projects'));
        const gSnap = await getDocs(collection(db, 'gallery'));
        const cSnap = await getDocs(collection(db, 'contacts'));
        const uCSnap = await getDocs(query(collection(db, 'contacts'), where('replied', '==', false)));

        setStats({
          volunteers: vSnap.size,
          pendingVolunteers: pVSnap.size,
          projects: pSnap.size,
          gallery: gSnap.size,
          contacts: cSnap.size,
          unreadContacts: uCSnap.size
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { name: 'Total Volunteers', value: stats.volunteers, sub: `${stats.pendingVolunteers} Pending`, icon: Users, color: 'bg-blue-500' },
    { name: 'Active Projects', value: stats.projects, sub: 'Global initiatives', icon: FolderKanban, color: 'bg-emerald-500' },
    { name: 'Gallery Assets', value: stats.gallery, sub: 'Visual assets', icon: ImageIcon, color: 'bg-orange-500' },
    { name: 'Contact Inquiries', value: stats.contacts, sub: `${stats.unreadContacts} Unread`, icon: Mail, color: 'bg-purple-500' },
  ];

  return (
    <div className="flex bg-[#fcfcfc] min-h-screen">
      <AdminSidebar />
      
      <main className="flex-1 ml-64 p-12">
        <header className="mb-12 flex justify-between items-end">
          <div className="space-y-4">
            <span className="text-accent font-bold uppercase tracking-[0.2em] text-[10px]">Command Center</span>
            <h1 className="text-4xl md:text-5xl font-serif font-black text-primary italic">Welcome Back, <span className="text-accent">Admin</span></h1>
          </div>
          <div className="flex items-center gap-4 text-primary font-bold text-xs uppercase tracking-widest bg-white px-6 py-4 rounded-full border border-gray-100 shadow-sm"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> System Operational</div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {cards.map((card, i) => (
            <motion.div key={card.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-black/[0.03] transition-all group">
              <div className={`w-14 h-14 rounded-2xl ${card.color} flex items-center justify-center mb-10 shadow-lg shadow-${card.color.split('-')[1]}-500/20 group-hover:scale-110 transition-transform`}>
                <card.icon size={24} className="text-white" />
              </div>
              <p className="text-[10px] font-black uppercase text-primary/40 tracking-[0.2em] mb-2">{card.name}</p>
              <h4 className="text-4xl font-serif font-black text-primary mb-2 italic">
                {loading ? <span className="animate-pulse">...</span> : card.value}
              </h4>
              <p className="text-xs font-bold text-accent uppercase tracking-widest">{card.sub}</p>
            </motion.div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           <div className="lg:col-span-2 bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
              <div className="flex justify-between items-center mb-10 flex-wrap gap-4 relative z-10">
                <div className="space-y-2">
                  <h3 className="text-2xl font-serif font-black text-primary italic">Organization Overview</h3>
                  <p className="text-xs font-bold text-primary/40 uppercase tracking-widest">Real-time Performance Metrics</p>
                </div>
                <div className="flex bg-bg rounded-full p-1 border border-primary/5">
                   <button className="px-6 py-2 bg-white rounded-full text-xs font-black text-primary uppercase tracking-widest shadow-sm">Monthly</button>
                   <button className="px-6 py-2 rounded-full text-xs font-bold text-primary/40 uppercase tracking-widest hover:text-primary transition-colors">Yearly</button>
                </div>
              </div>
              
              <div className="h-[300px] flex items-end justify-between gap-4 py-8">
                 {[40, 70, 45, 90, 55, 80, 50, 65, 85, 60, 75, 55].map((h, i) => (
                    <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 0.5 + i * 0.05 }} className="flex-1 bg-primary/5 rounded-t-xl group/bar relative">
                       <div className="absolute inset-x-0 bottom-0 bg-primary opacity-0 group-hover/bar:h-full group-hover/bar:opacity-100 transition-all rounded-t-xl" />
                       {i === 3 && <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-accent text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-xl">Peak Growth</div>}
                    </motion.div>
                 ))}
              </div>
              <div className="flex justify-between text-[10px] uppercase font-black text-primary/30 tracking-widest px-2 mt-4">
                 <span>Jan</span><span>Dec</span>
              </div>
           </div>

           <div className="bg-primary p-12 rounded-[3.5rem] shadow-2xl shadow-primary/20 flex flex-col justify-between text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 scale-0 group-hover:scale-100 transition-transform duration-500 opacity-20"><Sparkles size={80} /></div>
              <div className="space-y-8 relative z-10">
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center shadow-xl shadow-accent/20"><TrendingUp size={20} className="text-white" /></div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-serif font-black italic">Strategic Insights</h3>
                  <p className="text-white/40 text-sm leading-relaxed">Don't forget to review the pending volunteer applications and respond to new inquiries to maintain operational momentum.</p>
                </div>
              </div>
              <div className="space-y-6 pt-12 relative z-10">
                 <div className="flex items-center justify-between border-b border-white/10 pb-4"><p className="text-[10px] font-black uppercase tracking-[.2em] text-accent">Pending Actions</p><span className="bg-accent text-white font-black text-[10px] px-3 py-1 rounded-full">{stats.pendingVolunteers + stats.unreadContacts}</span></div>
                 <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs text-white/70 hover:text-white transition-colors cursor-pointer"><div className="w-1.5 h-1.5 rounded-full bg-accent" /> Review volunteer skillsets</div>
                    <div className="flex items-center gap-3 text-xs text-white/70 hover:text-white transition-colors cursor-pointer"><div className="w-1.5 h-1.5 rounded-full bg-accent" /> Audit crisis relief funds</div>
                 </div>
              </div>
           </div>
        </section>
      </main>
    </div>
  );
}
