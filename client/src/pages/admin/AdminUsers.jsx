import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, updateDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Trash2, X, AlertCircle, ShieldAlert, Key, Loader2, CheckCircle2, UserPlus, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const { adminData } = useAuth();
  const [users, setUsers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'moderator' });

  const fetchData = async () => {
    try {
      const uSnap = await getDocs(collection(db, 'adminUsers'));
      setUsers(uSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      const iSnap = await getDocs(collection(db, 'adminInvites'));
      setInvites(iSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(i => !i.isUsed));
    } catch (err) {
      toast.error('Failed to sync authentication registry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      
      await updateDoc(doc(db, 'adminInvites', token), {
        email: inviteForm.email,
        name: inviteForm.name,
        role: inviteForm.role,
        isUsed: false,
        createdBy: adminData.uid
      }, { merge: false }).catch(async () => {
         await addDoc(collection(db, 'adminInvites'), {
             token, email: inviteForm.email, name: inviteForm.name, role: inviteForm.role, isUsed: false, createdBy: adminData.uid
         });
      }); // fallback

      toast.success('Admin Invitation Genereted');
      setModalOpen(false);
      setInviteForm({ name: '', email: '', role: 'moderator' });
      fetchData();
      
      toast((t) => (
        <div className="flex flex-col gap-2">
           <span className="font-bold text-xs uppercase text-primary tracking-widest">Share Invite Link:</span>
           <code className="text-[10px] bg-primary/5 p-2 rounded truncate block border border-primary/10">
              {window.location.origin}/admin/register?token={token}
           </code>
           <button onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/admin/register?token=${token}`);
              toast.dismiss(t.id);
              toast.success('Copied to clipboard');
           }} className="bg-primary text-white text-[9px] font-black uppercase px-3 py-1 rounded">Copy Link</button>
        </div>
      ), { duration: 10000 });

    } catch (err) { toast.error('Generation failed'); }
  };

  const handleToggleActive = async (id, currentStatus) => {
    if (id === adminData.uid) return toast.error('Self-deactivation locked');
    try {
      await updateDoc(doc(db, 'adminUsers', id), { isActive: !currentStatus });
      toast.success(currentStatus ? 'Admin Suspended' : 'Admin Reactivated');
      fetchData();
    } catch { toast.error('Protocol failed'); }
  };
  
  const handleRoleChange = async (id, newRole) => {
    if (id === adminData.uid && newRole !== 'superadmin') return toast.error('Security protocol active: Cannot demote self');
    try {
      await updateDoc(doc(db, 'adminUsers', id), { role: newRole });
      toast.success('Privileges Updated');
      fetchData();
    } catch { toast.error('Protocol failed'); }
  };

  if (adminData?.role !== 'superadmin') {
     return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
           <ShieldAlert className="w-24 h-24 text-red-500 mb-6 mx-auto opacity-20" />
           <h2 className="text-3xl font-serif font-black text-primary italic">Clearance Required</h2>
           <p className="text-xs font-bold uppercase tracking-widest text-primary/40 mt-4">Level 5 Superadmin Privileges Only</p>
        </div>
     );
  }

  return (
    <div className="w-full">
      <header className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div className="space-y-4">
          <span className="text-accent font-bold uppercase tracking-[0.2em] text-[10px]">Access Control</span>
          <h1 className="text-4xl md:text-5xl font-serif font-black text-primary italic">System <span className="text-accent">Administrators</span></h1>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setModalOpen(true)} className="px-8 py-5 bg-primary text-white font-black rounded-full text-xs uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-primary/20"><UserPlus size={18} /> Invite Admin</motion.button>
      </header>

      <section className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
         <div className="flex items-center gap-3 mb-10 pb-6 border-b border-primary/5">
            <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary"><ShieldAlert size={16} /></div>
            <div>
              <h3 className="text-sm font-bold text-primary uppercase tracking-widest">Active Personnel</h3>
              <p className="text-[9px] text-primary/40 font-black uppercase tracking-[0.2em]">Live Registry Sync</p>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-[9px] uppercase font-black text-primary/30 tracking-[0.2em] border-b border-primary/5">
                     <th className="px-6 py-5 font-black">Admin ID</th>
                     <th className="px-6 py-5 font-black">Role</th>
                     <th className="px-6 py-5 font-black">Status</th>
                     <th className="px-6 py-5 font-black text-right">Clearance Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-primary/5">
                  {users.map((u) => (
                    <tr key={u.id} className="group/row hover:bg-bg transition-all">
                      <td className="px-6 py-6">
                         <div className="flex items-center gap-4">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-serif italic font-black text-xl shadow-inner ${u.role === 'superadmin' ? 'bg-accent/10 text-accent' : 'bg-primary/5 text-primary'}`}>{u.name[0]}</div>
                           <div>
                              <p className="text-sm font-serif font-black text-primary italic leading-tight">{u.name}</p>
                              <p className="text-[9px] text-primary/40 font-bold uppercase tracking-widest mt-1">{u.email}</p>
                           </div>
                         </div>
                      </td>
                      <td className="px-6 py-6">
                         <select value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)} disabled={u.id === adminData.uid} className={`bg-transparent outline-none text-[9px] font-black uppercase tracking-widest p-2 rounded border appearance-none ${u.role === 'superadmin' ? 'text-accent border-accent/20' : 'text-primary/60 border-primary/10'}`}>
                            <option value="superadmin">Superadmin</option>
                            <option value="moderator">Moderator</option>
                         </select>
                      </td>
                      <td className="px-6 py-6">
                         <button onClick={() => handleToggleActive(u.id, u.isActive)} disabled={u.id === adminData.uid} className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border flex items-center gap-2 transition-all ${u.isActive ? 'bg-emerald-50 text-emerald-500 border-emerald-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100' : 'bg-red-50 text-red-500 border-red-100 hover:bg-emerald-50 hover:text-emerald-500 hover:border-emerald-100'}`}>
                            {u.isActive ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                            {u.isActive ? 'Active' : 'Suspended'}
                         </button>
                      </td>
                      <td className="px-6 py-6 text-right">
                         <div className="text-[8px] font-black uppercase tracking-widest text-primary/20">{u.id === adminData.uid ? 'Current User' : 'Standard'}</div>
                      </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {loading && <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary/20" size={32} /></div>}
      </section>

      {invites.length > 0 && (
         <section className="bg-bg p-8 rounded-[3.5rem] border border-primary/5 mt-8 shadow-inner">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-6 flex items-center gap-2"><Key size={14} /> Pending Invitations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {invites.map(inv => (
                  <div key={inv.id} className="bg-white p-6 rounded-2xl shadow-sm border border-primary/5 flex justify-between items-center group">
                     <div>
                        <p className="text-xs font-bold text-primary truncate max-w-[150px]">{inv.name}</p>
                        <p className="text-[9px] text-primary/40 uppercase tracking-widest truncate">{inv.email}</p>
                     </div>
                     <span className="bg-primary/5 text-primary text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border border-primary/10">Pending</span>
                  </div>
               ))}
            </div>
         </section>
      )}

      {/* INVITE MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-primary/90 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
            <motion.form initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }} onSubmit={handleInviteSubmit} className="bg-white rounded-[3.5rem] p-12 max-w-lg w-full relative" onClick={e => e.stopPropagation()}>
               <button type="button" onClick={() => setModalOpen(false)} className="absolute top-10 right-12 text-primary/20 hover:text-primary transition-all"><X size={32} /></button>
               
               <div className="flex flex-col items-center gap-6 mb-10 text-center">
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 text-white"><UserPlus size={24} /></div>
                  <div>
                    <h3 className="text-3xl font-serif font-black text-primary italic">Generate Token</h3>
                    <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] mt-2">Secure Link Generation</p>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-primary/40 ml-4 tracking-widest">Candidate Name</label>
                     <input type="text" required value={inviteForm.name} onChange={e => setInviteForm(p => ({ ...p, name: e.target.value }))} className="w-full bg-bg border-none rounded-full py-4 px-8 text-sm focus:ring-2 focus:ring-primary font-bold" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-primary/40 ml-4 tracking-widest">Candidate Email</label>
                     <input type="email" required value={inviteForm.email} onChange={e => setInviteForm(p => ({ ...p, email: e.target.value }))} className="w-full bg-bg border-none rounded-full py-4 px-8 text-sm focus:ring-2 focus:ring-primary font-bold" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-primary/40 ml-4 tracking-widest">Clearance Level</label>
                     <select value={inviteForm.role} onChange={e => setInviteForm(p => ({ ...p, role: e.target.value }))} className="w-full bg-bg border-none rounded-full py-4 px-8 text-sm focus:ring-2 focus:ring-primary font-bold appearance-none text-primary">
                        <option value="moderator">Level 2: Moderator</option>
                        <option value="superadmin">Level 5: Superadmin</option>
                     </select>
                  </div>

                  <button type="submit" className="w-full bg-primary hover:bg-black text-white font-black py-5 rounded-full uppercase tracking-widest text-xs transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 mt-8">
                     <Key size={18} /> Initialize Handshake
                  </button>
               </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
