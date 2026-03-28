import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { X, Plus, Trash2, CheckCircle, Users, Hash, UserCheck } from 'lucide-react';

const RegisterModal = ({ event, onClose, onSuccess }) => {
  const { user } = useContext(AuthContext);
  const [leaderUSN, setLeaderUSN] = useState('');
  const [teamMembers, setTeamMembers] = useState([{ name: '', usn: '' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successState, setSuccessState] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape' && !successState) onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, successState]);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const addTeamMember = () => {
    if (event.maxTeamSize && teamMembers.length >= event.maxTeamSize - 1) return;
    setTeamMembers([...teamMembers, { name: '', usn: '' }]);
  };

  const removeTeamMember = (index) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const updateTeamMember = (index, field, value) => {
    const updated = [...teamMembers];
    updated[index][field] = value;
    setTeamMembers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = {
        leaderUSN,
        teamMembers: event.isTeamEvent ? teamMembers.filter(m => m.name || m.usn) : []
      };
      await axios.post(`/api/registrations/${event._id}`, payload, config);
      setSuccessState(true);
      // Auto-close after 2.5s and notify parent
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-dark/80 backdrop-blur-sm"
        onClick={() => !successState && onClose()}
      />

      {/* Modal Panel */}
      <div className="relative w-full sm:max-w-lg bg-[#0d0f1a] border border-white/10 rounded-t-3xl sm:rounded-2xl shadow-2xl z-10 overflow-hidden animate-slide-up">
        
        {/* Top gradient accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-indigo-400 to-secondary"></div>

        {/* Success State */}
        {successState ? (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
            <div className="w-24 h-24 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mb-6 animate-success-scale">
              <CheckCircle size={48} className="text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">You're Registered! 🎉</h3>
            <p className="text-slate-400 text-sm">
              {event.isTeamEvent
                ? `Your team has been registered for <strong>${event.title}</strong>!`
                : `You've successfully registered for <strong>${event.title}</strong>.`}
            </p>
            <p className="text-slate-500 text-xs mt-4">This window will close automatically...</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between p-6 pb-4">
              <div className="flex-1 overflow-hidden pr-4">
                <div className="flex items-center gap-2 mb-1">
                  {event.isTeamEvent ? (
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-secondary/20 text-secondary border border-secondary/30">
                      Team Event
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-primary/20 text-indigo-300 border border-primary/30">
                      Individual Event
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white truncate">{event.title}</h2>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Leader Section */}
              <div className="p-4 bg-white/[0.02] rounded-xl border border-white/10">
                <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <UserCheck size={16} className="text-primary" />
                  Team Leader
                </h3>
                <div className="space-y-3">
                  <div className="relative">
                    <label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1.5">Name</label>
                    <input
                      type="text"
                      value={user.name}
                      readOnly
                      className="glass-input w-full bg-white/[0.03] text-slate-400 cursor-not-allowed"
                    />
                  </div>
                  <div className="relative">
                    <label className="text-xs text-slate-500 uppercase tracking-wider font-medium block mb-1.5">USN / Roll Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Hash size={16} />
                      </div>
                      <input
                        type="text"
                        value={leaderUSN}
                        onChange={(e) => setLeaderUSN(e.target.value.toUpperCase())}
                        placeholder="e.g. 1XX23CS000"
                        required
                        className="glass-input w-full pl-10 uppercase tracking-widest"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Members Section (only for team events) */}
              {event.isTeamEvent && (
                <div className="p-4 bg-white/[0.02] rounded-xl border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                      <Users size={16} className="text-secondary" />
                      Team Members
                      <span className="text-xs text-slate-500 font-normal">
                        ({teamMembers.length}/{(event.maxTeamSize || 4) - 1} added)
                      </span>
                    </h3>
                    {teamMembers.length < (event.maxTeamSize || 4) - 1 && (
                      <button
                        type="button"
                        onClick={addTeamMember}
                        className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-indigo-300 bg-primary/10 hover:bg-primary/20 border border-primary/20 px-3 py-1.5 rounded-lg transition-all"
                      >
                        <Plus size={14} />
                        Add Member
                      </button>
                    )}
                  </div>

                  {teamMembers.map((member, index) => (
                    <div key={index} className="flex gap-2 mb-3 items-start">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                          placeholder={`Member ${index + 1} Name`}
                          required
                          className="glass-input w-full text-sm py-2.5"
                        />
                        <input
                          type="text"
                          value={member.usn}
                          onChange={(e) => updateTeamMember(index, 'usn', e.target.value.toUpperCase())}
                          placeholder="USN / Roll Number"
                          required
                          className="glass-input w-full text-sm py-2.5 uppercase tracking-widest"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTeamMember(index)}
                        className="mt-1 p-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Confirming...
                  </span>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Confirm Registration
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default RegisterModal;
