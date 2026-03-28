import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Sparkles } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="glass-panel sticky top-0 z-50 rounded-none border-t-0 border-x-0 bg-dark/70 backdrop-blur-xl mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center cursor-pointer" onClick={() => navigate(`/${user.role}`)}>
            <Sparkles className="text-secondary mr-2" size={20} />
            <div className="font-extrabold text-xl tracking-tight text-white flex items-center">
              EventHub
              <span className="ml-2 px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-semibold uppercase tracking-wider">
                {user.role}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <span className="text-slate-300 hidden md:inline text-sm">
              Hey, <span className="font-semibold text-white">{user.name}</span>
            </span>
            <button 
              onClick={handleLogout} 
              className="flex items-center justify-center text-sm font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-red-500/20 hover:border-red-500/50 border border-white/10 px-4 py-2 rounded-lg transition-all"
            >
              <LogOut size={16} className="mr-2" /> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
