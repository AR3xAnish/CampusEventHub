import React, { useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, CheckCircle, Calendar, MapPin, Users, Clock, Hash } from 'lucide-react';

const TicketModal = ({ registration, onClose }) => {
  const event = registration?.event;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  if (!registration || !event) return null;

  const checkedIn = registration.checkedIn;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-dark/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#0d0f1a] border border-white/10 rounded-3xl shadow-2xl z-10 overflow-hidden animate-slide-up">
        {/* Top gradient */}
        <div className={`absolute top-0 left-0 w-full h-1 ${checkedIn ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-primary via-indigo-400 to-secondary'}`}></div>

        {/* Header */}
        <div className="p-6 pb-4 flex items-start justify-between">
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-widest font-medium mb-1">Event Ticket</p>
            <h2 className="text-2xl font-bold text-white leading-tight truncate max-w-xs">{event.title}</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-5">
          {/* Check-in Status Banner */}
          {checkedIn ? (
            <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl">
              <CheckCircle size={20} className="flex-shrink-0" />
              <div>
                <p className="font-semibold">Checked In ✓</p>
                <p className="text-xs text-green-500/80 mt-0.5">
                  {registration.checkedInAt ? new Date(registration.checkedInAt).toLocaleString() : ''}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-3 rounded-xl">
              <Clock size={20} className="flex-shrink-0" />
              <p className="font-semibold text-sm">Show this QR code at the event entrance</p>
            </div>
          )}

          {/* QR Code */}
          <div className="flex flex-col items-center justify-center bg-white rounded-2xl p-6">
            <QRCodeSVG
              value={registration._id}
              size={180}
              bgColor="#ffffff"
              fgColor="#0a0c14"
              level="H"
            />
            <p className="text-[10px] text-slate-400 mt-3 font-mono tracking-wider">{registration._id}</p>
          </div>

          {/* Event Details */}
          <div className="bg-white/[0.02] rounded-xl border border-white/10 p-4 space-y-3 text-sm">
            <div className="flex items-center gap-3 text-slate-300">
              <Calendar size={16} className="text-primary flex-shrink-0" />
              <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <MapPin size={16} className="text-secondary flex-shrink-0" />
              <span>{event.venue}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <Hash size={16} className="text-indigo-400 flex-shrink-0" />
              <span>Leader USN: <span className="font-mono font-semibold text-white">{registration.leaderUSN}</span></span>
            </div>
            {registration.teamMembers?.length > 0 && (
              <div className="flex items-start gap-3 text-slate-300">
                <Users size={16} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Team Members</p>
                  {registration.teamMembers.map((m, i) => (
                    <p key={i} className="text-xs text-slate-400">{m.name} — <span className="font-mono">{m.usn}</span></p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
