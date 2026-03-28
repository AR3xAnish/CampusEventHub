import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Sparkles, GraduationCap, Briefcase, Mail, Lock, User } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await register(name, email, password, role);
      if (user.role === 'organizer') navigate('/organizer');
      else navigate('/student');
    } catch (err) {
      setError(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-dark bg-grid-pattern overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[10%] left-[20%] w-72 h-72 bg-secondary/20 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute bottom-[10%] right-[20%] w-72 h-72 bg-primary/20 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

      <div className="glass-panel p-8 md:p-10 w-full max-w-xl z-10 animate-fade-in relative">
        
        <div className="absolute -top-6 -right-6 text-yellow-400 rotate-12 opacity-80">
          <Sparkles size={48} />
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 mb-4">
            <UserPlus size={32} className="text-white transform -rotate-3" />
          </div>
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Join EventHub</h2>
          <p className="text-slate-400 mt-2 text-center text-sm">Experience campus events like never before</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-center text-sm flex items-center justify-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="     Full Name"
                  className="glass-input w-full pl-11" />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="     Email Address"
                  className="glass-input w-full pl-11" />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="     Password"
                  className="glass-input w-full pl-11" />
              </div>
            </div>

            {/* Beautiful Role Selector */}
            <div className="flex flex-col space-y-3">
              <label className="text-slate-300 text-sm font-medium ml-1">I am a...</label>
              
              <div 
                onClick={() => setRole('student')}
                className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all border ${role === 'student' ? 'bg-primary/20 border-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
              >
                <GraduationCap size={28} className="mb-2" />
                <span className="font-medium">Student</span>
                <span className="text-xs opacity-70 text-center mt-1 w-full line-clamp-2">Participate in events</span>
              </div>
              
              <div 
                onClick={() => setRole('organizer')}
                className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all border ${role === 'organizer' ? 'bg-secondary/20 border-secondary text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
              >
                <Briefcase size={28} className="mb-2" />
                <span className="font-medium">Organizer</span>
                <span className="text-xs opacity-70 text-center mt-1 w-full line-clamp-2">Host and manage events</span>
              </div>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full mt-6 flex justify-center items-center">
            {isLoading ? 'Creating Account...' : 'Sign Up Now'}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-400">
          Already have an account? <Link to="/login" className="text-primary font-medium hover:text-indigo-400 transition-colors ml-1 border-b border-primary/30 pb-0.5">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
