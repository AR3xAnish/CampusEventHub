import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Sparkles, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await login(email, password);
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
      <div className="absolute top-[20%] right-[20%] w-72 h-72 bg-primary/20 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute bottom-[20%] left-[20%] w-72 h-72 bg-secondary/20 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

      <div className="glass-panel p-8 md:p-10 w-full max-w-md z-10 animate-fade-in relative">
        <div className="absolute -top-6 -left-6 text-yellow-400 rotate-12 opacity-80">
          <Sparkles size={48} />
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 mb-4">
            <LogIn size={32} className="text-white transform rotate-3 ml-1" />
          </div>
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Welcome Back</h2>
          <p className="text-slate-400 mt-2 text-center text-sm">Sign in to access your dashboard</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-center text-sm flex items-center justify-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
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

          <button type="submit" disabled={isLoading} className="btn-primary w-full mt-6 flex justify-center items-center">
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-400">
          Don't have an account? <Link to="/register" className="text-primary font-medium hover:text-indigo-400 transition-colors ml-1 border-b border-primary/30 pb-0.5">Register now</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
