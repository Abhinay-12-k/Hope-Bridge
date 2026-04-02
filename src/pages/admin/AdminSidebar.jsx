import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Image as ImageIcon, Users, Mail, LogOut, Shield } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import toast from 'react-hot-toast';

const navLinks = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Projects', path: '/admin/projects', icon: FolderKanban },
  { name: 'Gallery', path: '/admin/gallery', icon: ImageIcon },
  { name: 'Volunteers', path: '/admin/volunteers', icon: Users },
  { name: 'Contacts', path: '/admin/contacts', icon: Mail },
];

export default function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin/login');
      toast.success('Logged out successfully');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  return (
    <div className="w-64 min-h-screen bg-primary text-white p-6 flex flex-col fixed left-0 top-0">
      <div className="flex items-center gap-3 mb-12 px-2">
        <Shield className="text-accent w-8 h-8 fill-accent" />
        <span className="text-xl font-serif font-black tracking-tight">Admin HQ</span>
      </div>

      <nav className="flex-1 space-y-2">
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => 
              `flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold uppercase tracking-widest text-[10px] ${
                isActive ? 'bg-accent text-white scale-105 shadow-xl shadow-black/20' : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <link.icon size={18} />
            {link.name}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-4 px-4 py-3 rounded-xl text-white/60 hover:bg-red-500/20 hover:text-red-400 transition-all font-bold uppercase tracking-widest text-[10px] mt-auto"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );
}
