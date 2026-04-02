import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Heart, FolderKanban, 
  Image as ImageIcon, Mail, Megaphone, 
  ShieldAlert, Settings, LogOut, Menu, X, Shield, Bell
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { adminData } = useAuth();
  const isSuper = adminData?.role === "superadmin";

  const allLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Volunteers', path: '/admin/volunteers', icon: Users },
    { name: 'Donations', path: '/admin/donations', icon: Heart },
    { name: 'Projects', path: '/admin/projects', icon: FolderKanban },
    { name: 'Gallery', path: '/admin/gallery', icon: ImageIcon },
    { name: 'Messages', path: '/admin/messages', icon: Mail },
    { name: 'Campaigns', path: '/admin/campaigns', icon: Megaphone },
  ];

  if (isSuper) {
    allLinks.push({ name: 'Admin Users', path: '/admin/users', icon: ShieldAlert });
    allLinks.push({ name: 'Settings', path: '/admin/settings', icon: Settings });
  }

  useEffect(() => {
    // Listen for unread notifications
    const q = query(collection(db, 'adminNotifications'), where('isRead', '==', false));
    const unsub = onSnapshot(q, (snap) => setUnreadCount(snap.size));
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin/login');
      toast.success('Logged out');
    } catch {
      toast.error('Logout failed');
    }
  };

  const currentPathName = allLinks.find(l => location.pathname.includes(l.path))?.name || 'Dashboard';

  return (
    <div className="min-h-screen bg-bg flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <div className="md:hidden bg-primary text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-accent" />
          <span className="font-serif font-bold text-xl">Admin Portal</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        ${mobileOpen ? 'fixed inset-0 z-40 bg-[#1a5c46] mt-16' : 'hidden md:flex'} 
        ${collapsed ? 'w-20' : 'w-64'} 
        flex-col bg-[#1a5c46] text-white transition-all duration-300 sticky top-0 h-screen overflow-y-auto border-r border-white/5 shadow-2xl
      `}>
        {!collapsed && (
           <div className="p-6 flex items-center gap-3 border-b border-white/10 hidden md:flex">
             <Shield className="w-8 h-8 text-accent fill-accent" />
             <span className="font-serif text-xl font-bold tracking-tight">HopeBridge</span>
           </div>
        )}
        {collapsed && (
           <div className="p-6 flex justify-center border-b border-white/10 hidden md:flex">
             <Shield className="w-8 h-8 text-accent fill-accent" />
           </div>
        )}

        <div className="flex-1 py-6 space-y-2 px-3">
          {allLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? link.name : ''}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-sans font-medium text-sm border-l-4 ${
                  isActive 
                    ? 'border-accent text-accent bg-accent/10 shadow-sm' 
                    : 'border-transparent text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <link.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{link.name}</span>}
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t border-white/10">
           <button 
             onClick={handleLogout}
             className="w-full flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm font-medium"
           >
             <LogOut className="w-5 h-5 flex-shrink-0" />
             {!collapsed && <span>Logout</span>}
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        
        {/* Admin Navbar (Desktop) */}
        <header className="hidden md:flex h-20 bg-primary px-8 items-center justify-between sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-4">
             <button onClick={() => setCollapsed(!collapsed)} className="text-white hover:text-accent transition-colors">
                <Menu className="w-6 h-6" />
             </button>
             <div className="bg-accent/20 text-accent px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase border border-accent/20">
               {currentPathName}
             </div>
          </div>

          <div className="flex items-center gap-6">
             <button className="relative text-white hover:text-accent transition-colors">
               <Bell className="w-6 h-6" />
               {unreadCount > 0 && (
                 <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-primary">
                   {unreadCount}
                 </span>
               )}
             </button>
             <div className="flex items-center gap-3 border-l border-white/20 pl-6">
                <div className="w-9 h-9 bg-accent text-primary rounded-full flex items-center justify-center font-bold font-serif text-lg">
                  {adminData?.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="text-left text-white hidden lg:block">
                  <div className="text-sm font-medium">{adminData?.name || 'Admin'}</div>
                  <div className="text-[10px] text-accent font-bold uppercase tracking-widest">{adminData?.role}</div>
                </div>
             </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden p-6 md:p-10 relative">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
