import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import { ShieldAlert, Save, Loader2, Link2, Globe, Heart, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const { adminData, loading: authLoad } = useAuth();
  const [settings, setSettings] = useState({
    general: { heroTitle: '', heroSubtitle: '', missionText: '', visionText: '' },
    stats: { familiesHelped: 0, volunteers: 0, countries: 0, yearsActive: 0 },
    social: { instagram: '', facebook: '', twitter: '', linkedin: '' },
    payment: { upiId: '', bankName: '', accountName: '', accountNumber: '', ifsc: '' }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'global'));
        if (snap.exists()) {
           setSettings(snap.data());
        }
      } catch (err) { toast.error('Failed to sync master settings'); } 
      finally { setLoading(false); }
    };
    fetchSettings();
  }, []);

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'global'), {
        ...settings,
        updatedAt: serverTimestamp(),
        updatedBy: adminData.uid
      });
      toast.success('Core systems updated');
    } catch (err) { toast.error('Update sequence failed'); }
    finally { setSaving(false); }
  };

  if (authLoad || loading) return <div className="flex justify-center py-40"><Loader2 className="animate-spin text-primary/20" size={60} /></div>;

  if (adminData?.role !== 'superadmin') {
     return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
           <ShieldAlert className="w-24 h-24 text-red-500 mb-6 mx-auto opacity-20" />
           <h2 className="text-3xl font-serif font-black text-primary italic">Clearance Required</h2>
           <p className="text-xs font-bold uppercase tracking-widest text-primary/40 mt-4">Level 5 Superadmin Privileges Only</p>
        </div>
     );
  }

  const tabs = [
    { id: 'general', label: 'Global Data', icon: Globe },
    { id: 'stats', label: 'Impact Metrics', icon: Heart },
    { id: 'social', label: 'Social Sync', icon: Link2 },
    { id: 'payment', label: 'Fiat Settings', icon: Link2 },
  ];

  return (
    <div className="w-full">
      <header className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div className="space-y-4">
          <span className="text-accent font-bold uppercase tracking-[0.2em] text-[10px]">System Configuration</span>
          <h1 className="text-4xl md:text-5xl font-serif font-black text-primary italic">Master <span className="text-accent">Settings</span></h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="px-10 py-5 bg-primary hover:bg-black text-white font-black rounded-full text-xs uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-primary/20 transition-all disabled:opacity-50">
           {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Deploy Config
        </button>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
         {/* Tabs */}
         <div className="w-full lg:w-64 flex flex-col gap-2 relative z-10">
            {tabs.map(t => (
               <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-6 py-5 rounded-2xl flex items-center gap-3 font-bold uppercase tracking-widest text-[10px] transition-all text-left ${activeTab === t.id ? 'bg-primary text-white shadow-xl shadow-primary/20 ml-2 scale-105' : 'bg-white text-primary/40 hover:text-primary hover:bg-bg border border-primary/5'}`}>
                  <t.icon size={16} /> {t.label}
               </button>
            ))}
         </div>

         {/* Content */}
         <div className="flex-1 bg-white p-12 rounded-[3.5rem] shadow-sm border border-gray-100">
            {activeTab === 'general' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                 <h3 className="text-2xl font-serif font-black text-primary italic mb-8 border-b border-primary/5 pb-4">Brand Identity Config</h3>
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-primary/40 ml-4 tracking-widest">Hero Title</label>
                       <input type="text" value={settings.general?.heroTitle || ''} onChange={e => handleChange('general', 'heroTitle', e.target.value)} className="w-full bg-bg border-none rounded-[1.5rem] py-4 px-8 text-sm focus:ring-2 focus:ring-primary font-bold" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-primary/40 ml-4 tracking-widest">Hero Subtitle</label>
                       <textarea rows={3} value={settings.general?.heroSubtitle || ''} onChange={e => handleChange('general', 'heroSubtitle', e.target.value)} className="w-full bg-bg border-none rounded-[2rem] py-6 px-8 text-sm focus:ring-2 focus:ring-primary font-bold resize-none"></textarea>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-primary/40 ml-4 tracking-widest">Mission Statement</label>
                       <textarea rows={3} value={settings.general?.missionText || ''} onChange={e => handleChange('general', 'missionText', e.target.value)} className="w-full bg-bg border-none rounded-[2rem] py-6 px-8 text-sm focus:ring-2 focus:ring-primary font-bold resize-none"></textarea>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                 <h3 className="text-2xl font-serif font-black text-primary italic mb-8 border-b border-primary/5 pb-4 flex items-center gap-3"><Heart className="text-accent" /> Global Impact Metrics</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {Object.keys(settings.stats).map(key => (
                      <div key={key} className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-primary/40 ml-4 tracking-widest">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                         <input type="number" min="0" value={settings.stats[key] || 0} onChange={e => handleChange('stats', key, Number(e.target.value))} className="w-full bg-bg border-none rounded-[1.5rem] py-4 px-8 text-2xl text-accent focus:ring-2 focus:ring-primary font-serif italic font-black" />
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {activeTab === 'social' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                 <h3 className="text-2xl font-serif font-black text-primary italic mb-8 border-b border-primary/5 pb-4">Social Network Synchronization</h3>
                 <div className="space-y-6">
                    {Object.keys(settings.social).map(key => (
                      <div key={key} className="space-y-2 flex items-center justify-between bg-bg p-4 rounded-[1.5rem] border border-primary/5">
                         <label className="text-[10px] w-24 font-black uppercase text-primary/40 ml-4 tracking-widest">{key}</label>
                         <input type="url" placeholder={`https://${key}.com/xyz`} value={settings.social[key] || ''} onChange={e => handleChange('social', key, e.target.value)} className="w-full bg-white border border-primary/5 shadow-inner rounded-xl py-3 px-6 text-sm focus:ring-2 focus:ring-primary font-medium" />
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                 <h3 className="text-2xl font-serif font-black text-primary italic mb-8 border-b border-primary/5 pb-4 flex items-center gap-3"><ShieldAlert className="text-emerald-500" /> Financial Transfer Coordinates</h3>
                 <div className="space-y-6">
                    <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] space-y-4">
                       <h4 className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Direct Bank Transfer Details</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input type="text" placeholder="Bank Name" value={settings.payment?.bankName || ''} onChange={e => handleChange('payment', 'bankName', e.target.value)} className="w-full bg-white border border-emerald-100 rounded-xl py-3 px-6 text-sm focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-900" />
                          <input type="text" placeholder="Account Name (e.g. HopeBridge NGO)" value={settings.payment?.accountName || ''} onChange={e => handleChange('payment', 'accountName', e.target.value)} className="w-full bg-white border border-emerald-100 rounded-xl py-3 px-6 text-sm focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-900" />
                          <input type="text" placeholder="Account Number" value={settings.payment?.accountNumber || ''} onChange={e => handleChange('payment', 'accountNumber', e.target.value)} className="w-full bg-white border border-emerald-100 rounded-xl py-3 px-6 text-sm focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-emerald-900 tracking-widest" />
                          <input type="text" placeholder="IFSC / SWIFT" value={settings.payment?.ifsc || ''} onChange={e => handleChange('payment', 'ifsc', e.target.value)} className="w-full bg-white border border-emerald-100 rounded-xl py-3 px-6 text-sm focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-emerald-900 tracking-widest" />
                       </div>
                    </div>
                    
                    <div className="space-y-2 mt-8">
                       <label className="text-[10px] font-black uppercase text-primary/40 ml-4 tracking-widest">Unified Payment Interface (UPI ID)</label>
                       <input type="text" placeholder="hopebridge@bank" value={settings.payment?.upiId || ''} onChange={e => handleChange('payment', 'upiId', e.target.value)} className="w-full bg-bg border-none rounded-[1.5rem] py-4 px-8 text-sm focus:ring-2 focus:ring-primary font-bold font-mono tracking-widest text-primary" />
                    </div>
                 </div>
              </div>
            )}

         </div>
      </div>
    </div>
  );
}
