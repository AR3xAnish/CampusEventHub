import React from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';

const EventCard = ({ event, onAction, actionLabel, actionColor, disabled, onStatusChange }) => {
  return (
    <div className="group relative bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-white/20 rounded-2xl p-6 flex flex-col h-full transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 overflow-hidden">
      {/* Top subtle gradient line */}
      <div className={`absolute top-0 left-0 w-full h-1 ${
        event.status === 'Upcoming' ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
        event.status === 'Ongoing' ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
        'bg-gradient-to-r from-slate-500 to-slate-400'
      }`}></div>

      <div className="flex justify-between items-start mb-3 mt-2 gap-3">
        <h3 className="text-xl font-bold text-white leading-tight group-hover:text-primary transition-colors duration-300 break-words line-clamp-2">{event.title}</h3>
        {onStatusChange ? (
          <select 
            value={event.status || 'Upcoming'} 
            onChange={(e) => onStatusChange(event._id, e.target.value)}
            disabled={disabled}
            onClick={e => e.stopPropagation()}
            className={`px-3 py-1 text-xs font-semibold rounded-full border cursor-pointer focus:outline-none appearance-none ${
              event.status === 'Upcoming' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
              event.status === 'Ongoing' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
              'bg-slate-500/10 text-slate-400 border-slate-500/20'
            }`}
          >
            <option value="Upcoming" className="bg-[#0d0f1a] text-blue-400">Upcoming</option>
            <option value="Ongoing" className="bg-[#0d0f1a] text-green-400">Ongoing</option>
            <option value="Completed" className="bg-[#0d0f1a] text-slate-400">Completed</option>
          </select>
        ) : (
          <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap border ${
            event.status === 'Upcoming' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
            event.status === 'Ongoing' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
            'bg-slate-500/10 text-slate-400 border-slate-500/20'
          }`}>
            {event.status || 'Upcoming'}
          </span>
        )}
      </div>

      {/* Team badge */}
      {event.isTeamEvent && (
        <div className="flex items-center gap-1.5 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-secondary/10 text-secondary border border-secondary/20">
            <Users size={12} />
            Team Event · Up to {event.maxTeamSize} members
          </span>
        </div>
      )}
      
      <p className="text-slate-400 mb-6 flex-grow text-sm leading-relaxed break-words line-clamp-3">{event.description}</p>
      
      <div className="text-sm text-slate-300 mb-6 space-y-3 p-4 rounded-xl bg-dark/40 border border-white/5 w-full overflow-hidden">
        <div className="flex items-center">
          <Calendar size={16} className="text-primary mr-3 flex-shrink-0" />
          <span className="truncate">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
        </div>
        <div className="flex items-center">
          <MapPin size={16} className="text-secondary mr-3 flex-shrink-0" />
          <span className="truncate" title={event.venue}>{event.venue}</span>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center">
              <Users size={16} className="text-indigo-400 mr-3 flex-shrink-0" />
              {event.capacity > 0 ? (
                <span className="truncate text-slate-300">
                  {event.registrationCount ?? 0} / {event.capacity} registered
                </span>
              ) : (
                <span className="truncate text-slate-300">Unlimited Capacity</span>
              )}
            </div>
            {event.capacity > 0 && event.registrationCount >= event.capacity && (
              <span className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">FULL</span>
            )}
          </div>
          {event.capacity > 0 && (
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  event.registrationCount >= event.capacity ? 'bg-red-500' :
                  event.registrationCount / event.capacity > 0.7 ? 'bg-amber-400' :
                  'bg-emerald-400'
                }`}
                style={{ width: `${Math.min((event.registrationCount ?? 0) / event.capacity * 100, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {onAction && (
        <button 
          onClick={() => onAction(event)} 
          disabled={disabled}
          className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center mt-auto
            ${disabled ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/10' :
              actionColor === 'red' ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 
              actionColor === 'secondary' ? 'bg-secondary/10 hover:bg-secondary/20 text-pink-400 border border-secondary/20 hover:border-secondary/50 hover:shadow-[0_0_15px_rgba(244,63,94,0.2)]' :
              'bg-primary/20 hover:bg-primary/30 text-indigo-300 border border-primary/30 hover:border-primary/60 hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]'
            }`}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EventCard;
