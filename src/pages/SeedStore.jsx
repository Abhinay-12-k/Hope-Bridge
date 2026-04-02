import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp, setDoc, doc, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Shield, Sparkles, Loader2, CheckCircle, Database, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const demoProjects = [
  {
    title: "Clean Water Initiative",
    category: "Sustainability",
    country: "Sub-Saharan Africa",
    description: "Providing sustainable clean water access to 50+ villages in remote areas.",
    impact: "25,000+ lives impacted",
    year: 2023,
    imageUrl: "https://images.unsplash.com/photo-1541810270634-31ed213e877b?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Digital Schools Program",
    category: "Education",
    country: "Rural India",
    description: "Equipping rural schools with solar-powered computer labs and internet connectivity.",
    impact: "10,000+ students educated",
    year: 2024,
    imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Mother & Child Care",
    category: "Healthcare",
    country: "Kenya",
    description: "Specialized healthcare support for expectant mothers and young children.",
    impact: "35% reduction in infant mortality",
    year: 2022,
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Emergency Food Relief",
    category: "Crisis Relief",
    country: "Middle East",
    description: "Rapid deployment of food supplies and medical kits to conflict zones.",
    impact: "5,000+ tons of food delivered",
    year: 2024,
    imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop"
  },
  {
    title: "Reforestation Project",
    category: "Environment",
    country: "Amazon Rainforest",
    description: "Native tree planting initiatives to restore biodiversity in devastated areas.",
    impact: "1M+ trees planted",
    year: 2023,
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb773b09?q=80&w=800&auto=format&fit=crop"
  }
];

const demoGallery = [
  { caption: "Village Well Kickoff", category: "Sustainability", imageUrl: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?q=80&w=600&auto=format&fit=crop" },
  { caption: "First Day of School", category: "Education", imageUrl: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=600&auto=format&fit=crop" },
  { caption: "Mobile Health Camp", category: "Healthcare", imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dad99a01?q=80&w=600&auto=format&fit=crop" },
  { caption: "Emergency Supplies Arrival", category: "Crisis Relief", imageUrl: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=600&auto=format&fit=crop" },
  { caption: "River Cleanup Drives", category: "Environment", imageUrl: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=600&auto=format&fit=crop" },
  { caption: "Community Meeting", category: "Sustainability", imageUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=600&auto=format&fit=crop" }
];

const demoTeam = [
  { name: "Dr. Sarah Jenkins", role: "Medical Director", order: 1, bio: "Sarah has led our mobile medical teams across 12 countries for over a decade.", imageUrl: "https://images.unsplash.com/photo-1559839734-2b71f1e59816?q=80&w=400&auto=format&fit=crop" },
  { name: "Michael Chen", role: "Program Manager", order: 2, bio: "Michael coordinates our local partnerships and infrastructure logistics.", imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop" },
  { name: "Elena Rodriguez", role: "Logistics Lead", order: 3, bio: "Elena ensures all relief supplies reach the most remote locations during crises.", imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop" }
];

const initialSettings = {
  heroSubtitle: "Join thousands of volunteers and donors dedicated to making a tangible impact on the lives of those who need it most.",
  missionText: "We believe that a community's greatest asset is its resilience, and our mission is to provide the bridge to unlock it.",
  visionText: "A world where every human being has the resources and support to lead a healthy, dignified, and fulfilling life.",
  stats: {
    families: "50,000+",
    volunteers: "10,000+",
    countries: "15+",
    years: "15"
  }
};

export default function SeedStore() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState("");

  const clearCollection = async (collectionName) => {
    setProgress(`Clearing ${collectionName}...`);
    const q = collection(db, collectionName);
    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(d => deleteDoc(doc(db, collectionName, d.id)));
    await Promise.all(deletePromises);
  };

  const seedDatabase = async () => {
    setLoading(true);
    try {
      // Clear data first to avoid duplicates
      await clearCollection('projects');
      await clearCollection('gallery');
      await clearCollection('team');

      // 1. Seed Global Settings
      setProgress("Setting organizational defaults...");
      await setDoc(doc(db, 'settings', 'global'), initialSettings);
      
      // 2. Seed Projects
      setProgress("Registering Global Initiatives...");
      for (const project of demoProjects) {
        await addDoc(collection(db, 'projects'), { ...project, createdAt: serverTimestamp() });
      }

      // 3. Seed Gallery
      setProgress("Populating Visual Assets...");
      for (const item of demoGallery) {
        await addDoc(collection(db, 'gallery'), { ...item, uploadedAt: serverTimestamp() });
      }

      // 4. Seed Team
      setProgress("Onboarding Leadership Team...");
      for (const member of demoTeam) {
        await addDoc(collection(db, 'team'), { ...member, createdAt: serverTimestamp() });
      }

      setSuccess(true);
      toast.success("HopeBridge Repository Cleaned & Rebuilt!");
    } catch (err) {
      console.error(err);
      toast.error(`Sync Failed: ${err.message}`);
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-6" style={{ backgroundImage: 'linear-gradient(rgba(13, 59, 46, 0.94), rgba(13, 59, 46, 0.94)), url("https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200")' }}>
      <div className="max-w-md w-full bg-white rounded-[3.5rem] p-12 text-center shadow-2xl space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="w-20 h-20 bg-primary rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-primary/20">
          <Database className="text-accent fill-accent" size={40} />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-serif font-black text-primary italic">Initialization HQ</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/30">Force-Rebuild Utility v2.0</p>
        </div>

        {!success ? (
          <div className="space-y-8">
            <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100">
               <p className="text-xs text-amber-700/80 leading-relaxed font-bold">This version will <span className="text-amber-800">WIPE</span> existing entries before re-syncing to solve duplicates. Verified clean-load images only.</p>
            </div>
            
            <div className="space-y-4">
              <button onClick={seedDatabase} disabled={loading} className="w-full bg-primary hover:bg-black text-white font-black py-5 rounded-full uppercase tracking-widest text-xs transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-3">
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={18} />}
                {loading ? "Wiping & Loading..." : "Clean & Authorize Sync"}
              </button>
              {progress && <p className="text-[10px] font-bold text-accent uppercase tracking-widest animate-pulse">{progress}</p>}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={28} className="text-emerald-500" />
            </div>
            <div className="space-y-2">
              <p className="font-serif italic font-black text-primary text-xl">Repository Synchronized!</p>
              <p className="text-xs text-primary/40 font-bold uppercase tracking-widest leading-loose">3 Team Members<br />5 Global Projects<br />6 Gallery Items</p>
            </div>
            <a href="/" className="inline-block px-10 py-4 bg-primary text-white rounded-full font-bold uppercase text-[10px] tracking-widest hover:bg-black transition-colors">Launch Portal</a>
          </div>
        )}
      </div>
    </div>
  );
}
