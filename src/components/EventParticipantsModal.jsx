import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  X, Users, CheckCircle, Clock, Search, Download,
  Calendar, MapPin, Hash, UserCheck, UserX, Camera
} from 'lucide-react';

const EventParticipantsModal = ({ event, onClose, onOpenScanner }) => {
  const { user } = useContext(AuthContext);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | checkedin | pending
  const isCompleted = event.status === 'Completed';
  const checkedInLabel = isCompleted ? 'Attended' : 'Checked In';

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  useEffect(() => {
    fetchParticipants();
  }, [event._id]);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/registrations/event/${event._id}`, config);
      setRegistrations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkedIn = registrations.filter(r => r.checkedIn);
  const pending = registrations.filter(r => !r.checkedIn);

  const filtered = registrations.filter(r => {
    const matchesFilter =
      filter === 'all' ? true :
      filter === 'checkedin' ? r.checkedIn :
      !r.checkedIn;

    const name = r.student?.name?.toLowerCase() || '';
    const usn = r.leaderUSN?.toLowerCase() || '';
    const q = search.toLowerCase();
    const matchesSearch = !q || name.includes(q) || usn.includes(q);

    return matchesFilter && matchesSearch;
  });

  const formatTime = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString(undefined, {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dark/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[#0d0f1a] border border-white/10 rounded-3xl shadow-2xl z-10 overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        {/* Top gradient */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-indigo-400 to-secondary"></div>

        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-white/10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 overflow-hidden">
              <p className="text-slate-500 text-xs uppercase tracking-widest font-medium mb-1">Event Participants</p>
              <h2 className="text-xl font-bold text-white leading-tight truncate">{event.title}</h2>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Calendar size={12} />{new Date(event.date).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><MapPin size={12} />{event.venue}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Open Scanner button */}
              <button
                onClick={() => { onClose(); setTimeout(() => onOpenScanner(event), 200); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-secondary/10 text-secondary border border-secondary/30 hover:bg-secondary/20 transition-all"
              >
                <Camera size={14} /> Scan QR
              </button>
              <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Stats row */}
          {!loading && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-white">{registrations.length}</p>
                <p className="text-xs text-slate-500 mt-0.5">Registered</p>
              </div>
              <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-green-400">{checkedIn.length}</p>
                <p className="text-xs text-slate-500 mt-0.5">{checkedInLabel}</p>
              </div>
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-amber-400">{pending.length}</p>
                <p className="text-xs text-slate-500 mt-0.5">Pending</p>
              </div>
            </div>
          )}
        </div>

        {/* Filter + Search bar */}
        <div className="flex-shrink-0 px-6 py-3 border-b border-white/5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or USN..."
              className="glass-input w-full pl-9 py-2.5 text-sm"
            />
          </div>
          <div className="flex gap-1 bg-white/[0.03] border border-white/10 rounded-xl p-1">
            {[['all', 'All'], ['checkedin', `✓ ${isCompleted ? 'Attended' : 'In'}`], ['pending', '• Pending']].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  filter === val
                    ? val === 'checkedin' ? 'bg-green-500/20 text-green-400'
                    : val === 'pending' ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-primary/20 text-indigo-300'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Participant List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Users size={36} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No participants found</p>
              <p className="text-xs mt-1 text-slate-600">Try adjusting your search or filter</p>
            </div>
          ) : (
            filtered.map((reg) => (
              <div
                key={reg._id}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                  reg.checkedIn
                    ? 'bg-green-500/5 border-green-500/20'
                    : 'bg-white/[0.02] border-white/10'
                }`}
              >
                {/* Status Icon */}
                <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-0.5 ${
                  reg.checkedIn ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/10 text-amber-500'
                }`}>
                  {reg.checkedIn ? <UserCheck size={18} /> : <UserX size={18} />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="font-semibold text-white truncate">{reg.student?.name}</p>
                    {reg.checkedIn ? (
                      <span className="text-xs text-green-400 flex items-center gap-1 flex-shrink-0">
                        <CheckCircle size={12} /> {formatTime(reg.checkedInAt)}
                      </span>
                    ) : (
                      <span className="text-xs text-amber-500 flex items-center gap-1 flex-shrink-0">
                        <Clock size={12} /> Not yet
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <Hash size={11} />
                    {reg.leaderUSN}
                    {reg.student?.email && <span className="ml-2 truncate">{reg.student.email}</span>}
                  </p>
                  {/* Team members */}
                  {reg.teamMembers?.length > 0 && (
                    <div className="mt-2 pl-3 border-l-2 border-white/10 space-y-1">
                      {reg.teamMembers.map((m, i) => (
                        <p key={i} className="text-xs text-slate-400">
                          {m.name} — <span className="font-mono text-slate-500">{m.usn}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {!loading && registrations.length > 0 && (
          <div className="flex-shrink-0 px-6 py-4 border-t border-white/5 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {checkedIn.length} of {registrations.length} participants {isCompleted ? 'attended' : 'checked in'}
              {event.capacity ? ` · Capacity: ${event.capacity}` : ''}
            </p>
            <button
              onClick={fetchParticipants}
              className="text-xs text-primary hover:text-indigo-300 transition-colors"
            >
              ↻ Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventParticipantsModal;
