import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Access Granted');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error('Invalid Credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-gray-100 max-w-md w-full relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="flex flex-col items-center gap-6 mb-12">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20"><Shield className="text-accent fill-accent" size={32} /></div>
          <div className="text-center">
            <h1 className="text-3xl font-serif font-black text-primary italic">Admin Portal</h1>
            <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mt-2">HopeBridge NGO Headquarters</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-4">Email Address</label>
            <div className="relative">
              <User className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/20" size={18} />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-bg border-none rounded-full py-4 pl-14 pr-8 text-sm focus:ring-2 focus:ring-primary transition-all font-medium" placeholder="admin@hopebridge.org" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-4">Password</label>
            <div className="relative">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/20" size={18} />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-bg border-none rounded-full py-4 pl-14 pr-8 text-sm focus:ring-2 focus:ring-primary transition-all font-medium" placeholder="••••••••" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-black text-white font-bold py-5 rounded-full uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 shadow-2xl shadow-primary/20 mt-8 disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Authorize Access'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
