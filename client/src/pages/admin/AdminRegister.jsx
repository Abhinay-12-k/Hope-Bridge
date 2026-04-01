import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { collection, doc, getDocs, setDoc, getDoc, serverTimestamp, query, limit } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, User, Lock, Mail, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export default function AdminRegister() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isFirstSetup, setIsFirstSetup] = useState(false);
  const [inviteData, setInviteData] = useState(null);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema)
  });

  useEffect(() => {
    const checkSetupOrToken = async () => {
      try {
        const adminsRef = collection(db, 'adminUsers');
        const q = query(adminsRef, limit(1));
        const snap = await getDocs(q);

        if (snap.empty) {
          setIsFirstSetup(true);
          setLoading(false);
          return;
        }

        if (token) {
          // Check if token exists in adminInvites
          const inviteRef = doc(db, 'adminInvites', token);
          const inviteSnap = await getDoc(inviteRef);
          if (inviteSnap.exists()) {
            const data = inviteSnap.data();
            if (data.isUsed) {
              toast.error('Invite link already used');
              navigate('/admin/login');
            } else {
              setInviteData({ id: inviteSnap.id, ...data });
              setValue('email', data.email);
              setLoading(false);
            }
          } else {
            toast.error('Invalid or expired invite link');
            navigate('/admin/login');
          }
        } else {
           navigate('/admin/login');
        }

      } catch (err) {
        console.error(err);
        toast.error('Error verifying registration access');
        navigate('/');
      }
    };
    checkSetupOrToken();
  }, [token, navigate, setValue]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: data.name });

      const role = isFirstSetup ? 'superadmin' : (inviteData?.role || 'moderator');
      
      await setDoc(doc(db, 'adminUsers', user.uid), {
        uid: user.uid,
        name: data.name,
        email: data.email,
        role,
        isActive: true,
        createdAt: serverTimestamp(),
        createdBy: inviteData ? inviteData.createdBy : 'system'
      });

      if (inviteData && token) {
        await setDoc(doc(db, 'adminInvites', token), { isUsed: true }, { merge: true });
      }

      // Sign out since createUserWithEmailAndPassword automatically signs in
      await auth.signOut();

      toast.success(isFirstSetup ? 'Superadmin Setup Complete' : 'Admin Account Created');
      toast('Please login with your new credentials', { icon: '🔑' });
      navigate('/admin/login');

    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
     return <div className="min-h-screen bg-bg flex justify-center items-center"><Loader2 className="animate-spin text-primary" size={40} /></div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary p-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-12 rounded-[3.5rem] shadow-2xl max-w-md w-full relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="flex flex-col items-center gap-6 mb-10 text-center relative z-10">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20">
             <Shield className="text-accent fill-accent" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-black text-primary italic">
               {isFirstSetup ? 'System Initialization' : 'Accept Invitation'}
            </h1>
            <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mt-2">
               {isFirstSetup ? 'Create Root Superadmin' : `Join as ${inviteData?.role}`}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-4">Full Name</label>
            <div className="relative">
              <User className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/20" size={18} />
              <input type="text" {...register('name')} className="w-full bg-bg border-none rounded-full py-4 pl-14 pr-8 text-sm focus:ring-2 focus:ring-primary font-medium" placeholder="John Doe" />
            </div>
            {errors.name && <p className="text-red-500 text-xs ml-4 font-bold">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-4">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/20" size={18} />
              <input type="email" {...register('email')} disabled={!!inviteData} className="w-full bg-bg border-none rounded-full py-4 pl-14 pr-8 text-sm focus:ring-2 focus:ring-primary font-medium disabled:opacity-50" placeholder="admin@hopebridge.org" />
            </div>
            {errors.email && <p className="text-red-500 text-xs ml-4 font-bold">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-4">Password</label>
            <div className="relative">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/20" size={18} />
              <input type="password" {...register('password')} className="w-full bg-bg border-none rounded-full py-4 pl-14 pr-8 text-sm focus:ring-2 focus:ring-primary font-medium" placeholder="Min 8 characters" />
            </div>
            {errors.password && <p className="text-red-500 text-xs ml-4 font-bold">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-4">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/20" size={18} />
              <input type="password" {...register('confirmPassword')} className="w-full bg-bg border-none rounded-full py-4 pl-14 pr-8 text-sm focus:ring-2 focus:ring-primary font-medium" placeholder="••••••••" />
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs ml-4 font-bold">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-black text-white font-bold py-5 rounded-full uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 shadow-2xl shadow-primary/20 mt-8 disabled:opacity-50">
            {submitting ? <Loader2 className="animate-spin" size={18} /> : (isFirstSetup ? 'Initialize System' : 'Create Account')}
          </button>
        </form>

        <div className="mt-8 text-center relative z-10">
            <button 
              onClick={() => navigate('/admin/login')}
              className="text-[10px] font-black uppercase tracking-widest text-primary/30 hover:text-primary transition-colors"
            >
              Already have an account? <span className="text-accent underline underline-offset-4">Log In</span>
            </button>
        </div>
      </motion.div>
    </div>
  );
}
