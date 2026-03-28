import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Zap, ArrowRight, Sparkles } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-dark bg-grid-pattern relative overflow-hidden flex flex-col justify-center items-center">
      {/* Background Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/30 rounded-full mix-blend-screen filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-secondary/30 rounded-full mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-indigo-500/30 rounded-full mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="z-10 text-center max-w-4xl px-4 flex flex-col items-center">
        <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-8 backdrop-blur-md text-sm text-indigo-300">
          <Sparkles size={16} />
          <span>The future of college events</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight break-words hyphens-auto max-w-full">
          Campus Life <br/>
          <span className="text-gradient pb-2 inline-block">Fully Amplified</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto break-words px-2">
          Discover, organize, and experience the best college events and hackathons. All your campus activities in one beautiful place.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link to="/register" className="btn-primary flex items-center justify-center group text-lg">
            Get Started
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
          </Link>
          <Link to="/login" className="btn-outline flex items-center justify-center text-lg">
            Sign In
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="z-10 grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-6xl px-4 w-full">
        <div className="glass-panel p-8 hover:-translate-y-2 transition-transform duration-300">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-6">
            <Calendar size={24} />
          </div>
          <h3 className="text-xl font-bold mb-3">Discover Events</h3>
          <p className="text-slate-400">Explore hackathons, cultural fests, and workshops happening around campus.</p>
        </div>
        
        <div className="glass-panel p-8 hover:-translate-y-2 transition-transform duration-300">
          <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary mb-6">
            <Users size={24} />
          </div>
          <h3 className="text-xl font-bold mb-3">Join Communities</h3>
          <p className="text-slate-400">Connect with like-minded students, form teams, and collaborate effortlessly.</p>
        </div>
        
        <div className="glass-panel p-8 hover:-translate-y-2 transition-transform duration-300">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
            <Zap size={24} />
          </div>
          <h3 className="text-xl font-bold mb-3">Organize Easily</h3>
          <p className="text-slate-400">Manage registrations, track attendance, and host successful events fast.</p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
