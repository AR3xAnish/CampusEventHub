import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import EventCard from '../../components/EventCard';
import Navbar from '../../components/Navbar';
import QRScannerModal from '../../components/QRScannerModal';
import EventParticipantsModal from '../../components/EventParticipantsModal';
import OrganizerAnalytics from '../../components/OrganizerAnalytics';
import { PlusCircle, Trash2, Users, Calendar, Sparkles, Activity, Camera, BarChart2 } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ totalEvents: 0, totalRegistrations: 0, events: [] });
  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', venue: '', capacity: '', isTeamEvent: false, maxTeamSize: 4, category: 'Other' });
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scanEvent, setScanEvent] = useState(null);
  const [viewEvent, setViewEvent] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/api/registrations/organizer/stats', config);
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/events', newEvent, config);
      setNewEvent({ title: '', description: '', date: '', venue: '', capacity: '', isTeamEvent: false, maxTeamSize: 4, category: 'Other' });
      setShowForm(false);
      fetchStats();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (event) => {
    if (window.confirm(`Are you sure you want to delete ${event.title}? This cannot be undone.`)) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`/api/events/${event._id}`, config);
        fetchStats();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleStatusChange = async (eventId, newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/events/${eventId}`, { status: newStatus }, config);
      fetchStats();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  return (
    <div className="min-h-screen bg-dark bg-grid-pattern relative">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-secondary/10 blur-[100px] rounded-full pointer-events-none"></div>

      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative z-10">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-secondary to-pink-500 mb-2 tracking-tight">Organizer HQ</h1>
            <p className="text-lg text-slate-400">Manage your events and track engagements</p>
          </div>
          <div className="flex items-center gap-3 mt-6 md:mt-0">
            <button
              onClick={() => setShowAnalytics(v => !v)}
              className={`flex items-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all border ${
                showAnalytics
                  ? 'bg-primary/20 text-indigo-300 border-primary/40'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'
              }`}
            >
              <BarChart2 size={16} /> Analytics
            </button>
            <button 
              onClick={() => setShowForm(!showForm)} 
              className={`flex items-center py-3 px-6 rounded-xl font-bold transition-all duration-300 shadow-lg active:scale-95 ${
                showForm 
                  ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' 
                  : 'bg-gradient-to-r from-primary to-indigo-600 text-white hover:shadow-indigo-500/30'
              }`}
            >
              {showForm ? 'Cancel Creation' : <><PlusCircle size={20} className="mr-2" /> Launch New Event</>}
            </button>
          </div>
        </div>

        {/* Analytics Section */}
        {showAnalytics && stats.events.length > 0 && (
          <div className="mb-12">
            <OrganizerAnalytics stats={stats} />
          </div>
        )}
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="glass-panel p-8 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 bg-primary/20 w-32 h-32 rounded-full blur-2xl group-hover:bg-primary/30 transition-all"></div>
            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="min-w-0 pr-2">
                <p className="text-slate-400 mb-1 font-medium flex items-center whitespace-nowrap"><Activity size={16} className="mr-2 text-primary flex-shrink-0"/> <span className="truncate">Hosted Events</span></p>
                <h3 className="text-5xl font-black text-white truncate" title={stats.totalEvents}>{stats.totalEvents}</h3>
              </div>
              <div className="h-16 w-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform flex-shrink-0">
                <Calendar size={28} className="text-primary" />
              </div>
            </div>
          </div>

          <div className="glass-panel p-8 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 bg-secondary/20 w-32 h-32 rounded-full blur-2xl group-hover:bg-secondary/30 transition-all"></div>
            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="min-w-0 pr-2">
                <p className="text-slate-400 mb-1 font-medium flex items-center whitespace-nowrap"><Users size={16} className="mr-2 text-secondary flex-shrink-0"/> <span className="truncate">Global Tickets</span></p>
                <h3 className="text-5xl font-black text-white truncate" title={stats.totalRegistrations}>{stats.totalRegistrations}</h3>
              </div>
              <div className="h-16 w-16 bg-secondary/10 border border-secondary/20 rounded-2xl flex items-center justify-center transform group-hover:-rotate-6 transition-transform flex-shrink-0">
                <Users size={28} className="text-secondary" />
              </div>
            </div>
          </div>
          
          {/* Quick Tip Widget */}
          <div className="glass-panel p-8 hidden lg:flex flex-col justify-center border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-transparent">
            <div className="flex items-center mb-3">
              <Sparkles className="text-yellow-400 mr-2" size={20} />
              <h4 className="font-bold text-white text-lg">Pro Tip</h4>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Events with clear descriptions and capacities gather 40% more sign-ups within the first 24 hours of publishing.
            </p>
          </div>
        </div>

        {/* Create Event Form - Animated Reveal */}
        <div className={`transition-all duration-500 overflow-hidden ${showForm ? 'max-h-[1000px] opacity-100 mb-12' : 'max-h-0 opacity-0 mb-0'}`}>
          <div className="glass-panel p-8 md:p-10 border-t-4 border-t-primary relative">
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center">
              <PlusCircle className="text-primary mr-3" size={28} />
              Define Your Event
            </h3>
            
            <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-slate-300 text-sm font-medium ml-1">Event Title</label>
                <input type="text" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="glass-input w-full" placeholder="e.g. Winter Hackathon 2026" required />
              </div>
              <div className="space-y-1">
                <label className="text-slate-300 text-sm font-medium ml-1">Date</label>
                <input type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="glass-input w-full" required />
              </div>
              <div className="space-y-1">
                <label className="text-slate-300 text-sm font-medium ml-1">Venue</label>
                <input type="text" value={newEvent.venue} onChange={e => setNewEvent({...newEvent, venue: e.target.value})} className="glass-input w-full" placeholder="e.g. Main Auditorium" required />
              </div>
              <div className="space-y-1">
                <label className="text-slate-300 text-sm font-medium ml-1">Max Capacity <span className="text-slate-500 font-normal">(Leave empty for unlimited)</span></label>
                <input type="number" value={newEvent.capacity} onChange={e => setNewEvent({...newEvent, capacity: e.target.value})} className="glass-input w-full" placeholder="e.g. 500" min="0" />
              </div>
              <div className="space-y-1">
                <label className="text-slate-300 text-sm font-medium ml-1">Category</label>
                <select value={newEvent.category} onChange={e => setNewEvent({...newEvent, category: e.target.value})} className="glass-input w-full">
                  {['Technical','Cultural','Workshop','Seminar','Sports','Other'].map(c => (
                    <option key={c} value={c} className="bg-[#0d0f1a]">{c}</option>
                  ))}
                </select>
              </div>

              {/* Team Event Toggle */}
              <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/10">
                <div>
                  <h4 className="text-slate-200 font-semibold">Team Participation</h4>
                  <p className="text-slate-500 text-sm mt-0.5">Allow teams to register instead of individuals</p>
                </div>
                <div className="flex items-center gap-4">
                  {newEvent.isTeamEvent && (
                    <div className="flex items-center gap-2">
                      <label className="text-slate-400 text-sm whitespace-nowrap">Max team size</label>
                      <input
                        type="number"
                        value={newEvent.maxTeamSize}
                        onChange={e => setNewEvent({...newEvent, maxTeamSize: parseInt(e.target.value) || 4})}
                        className="glass-input w-20 text-center py-2"
                        min="2"
                        max="10"
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setNewEvent({...newEvent, isTeamEvent: !newEvent.isTeamEvent})}
                    className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-300 focus:outline-none ${
                      newEvent.isTeamEvent ? 'bg-secondary border-secondary/50' : 'bg-white/10 border-white/20'
                    }`}
                  >
                    <span className={`inline-block h-5 w-5 mt-0.5 rounded-full bg-white shadow-lg transform transition-transform duration-300 ${
                      newEvent.isTeamEvent ? 'translate-x-7' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-slate-300 text-sm font-medium ml-1">Description</label>
                <textarea value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} className="glass-input w-full resize-none" rows="4" placeholder="Tell students what this event is all about..." required></textarea>
              </div>
              
              <div className="md:col-span-2 flex justify-end mt-4">
                <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center w-full md:w-auto px-10">
                  {isSubmitting ? 'Publishing...' : <><Sparkles size={18} className="mr-2"/> Publish Event Live</>}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Event List */}
        <div>
          <div className="flex items-center mb-6">
            <div className="w-2 h-8 bg-indigo-500 rounded-full mr-3"></div>
            <h2 className="text-2xl font-bold text-white tracking-wide">Live Catalog</h2>
          </div>

          {stats.events.length === 0 ? (
            <div className="glass-panel text-center py-24 text-slate-400 border-dashed border-2 border-white/5">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar size={40} className="text-slate-500" />
              </div>
              <p className="text-xl font-medium text-white mb-2">No events published</p>
              <p className="text-slate-400 max-w-sm mx-auto">Your catalog is currently empty. Click "Launch New Event" to start organizing!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.events.map(event => (
                <div key={event._id} className="relative">
                  {/* Clicking the card body opens participants view */}
                  <div onClick={() => setViewEvent(event)} className="cursor-pointer">
                    <EventCard 
                      event={event} 
                      onAction={handleDeleteEvent}
                      onStatusChange={handleStatusChange}
                      actionLabel={
                        <span
                          className="flex items-center justify-center"
                          onClick={e => e.stopPropagation()}
                        >
                          <Trash2 size={16} className="mr-2"/> Delete Event
                        </span>
                      } 
                      actionColor="red" 
                    />
                  </div>
                  {/* Check-in Camera Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setScanEvent(event); }}
                    title="Scan QR to check in participants"
                    className="absolute top-4 right-4 w-9 h-9 bg-secondary/20 hover:bg-secondary/40 border border-secondary/30 rounded-xl flex items-center justify-center text-secondary hover:scale-110 transition-all duration-200 z-10"
                  >
                    <Camera size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QR Scanner Modal */}
      {scanEvent && (
        <QRScannerModal
          event={scanEvent}
          onClose={() => setScanEvent(null)}
        />
      )}

      {/* Participants View Modal */}
      {viewEvent && (
        <EventParticipantsModal
          event={viewEvent}
          onClose={() => setViewEvent(null)}
          onOpenScanner={(ev) => setScanEvent(ev)}
        />
      )}
    </div>
  );
};

export default Dashboard;
