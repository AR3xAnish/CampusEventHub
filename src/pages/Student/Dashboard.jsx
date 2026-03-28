import React, { useEffect, useState, useContext, useMemo } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import EventCard from '../../components/EventCard';
import Navbar from '../../components/Navbar';
import RegisterModal from '../../components/RegisterModal';
import TicketModal from '../../components/TicketModal';
import { CalendarDays, CheckCircle, Sparkles, Compass, Search, X, SlidersHorizontal } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('date-asc');

  useEffect(() => {
    fetchEvents();
    fetchMyRegistrations();
  }, [user]);

  const fetchEvents = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/api/events', config);
      setEvents(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyRegistrations = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/api/registrations/my-events', config);
      // Store full registration objects so we can display tickets
      setMyRegistrations(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegister = (event) => {
    setSelectedEvent(event);
  };

  const registeredEventsList = events.filter(e => myRegistrations.some(r => r.event?._id === e._id));
  const baseAvailable = events.filter(e => !myRegistrations.some(r => r.event?._id === e._id) && e.status !== 'Completed');

  // Filtered + sorted available list
  const availableEventsList = useMemo(() => {
    let list = [...baseAvailable];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(e =>
        e.title?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q) ||
        e.venue?.toLowerCase().includes(q)
      );
    }
    if (filterCategory !== 'All') list = list.filter(e => e.category === filterCategory);
    if (filterStatus !== 'All') list = list.filter(e => e.status === filterStatus);
    list.sort((a, b) => {
      if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'name') return a.title?.localeCompare(b.title);
      return 0;
    });
    return list;
  }, [baseAvailable, searchQuery, filterCategory, filterStatus, sortBy]);

  const hasActiveFilters = searchQuery || filterCategory !== 'All' || filterStatus !== 'All' || sortBy !== 'date-asc';
  const clearFilters = () => { setSearchQuery(''); setFilterCategory('All'); setFilterStatus('All'); setSortBy('date-asc'); };

  const handleModalClose = () => setSelectedEvent(null);
  const handleModalSuccess = () => { fetchMyRegistrations(); };

  return (
    <div className="min-h-screen bg-dark bg-grid-pattern relative">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>

      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative z-10">
        
        {/* Welcome Hero Section */}
        <div className="glass-panel p-10 md:p-14 mb-12 flex flex-col md:flex-row items-center justify-between overflow-hidden relative border-primary/20 bg-gradient-to-br from-white/5 to-transparent">
          <div className="absolute -right-20 -top-20 text-primary/10 rotate-12 pointer-events-none">
             <Sparkles size={250} />
          </div>
          <div className="relative z-10 w-full overflow-hidden">
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-4 tracking-tight truncate pb-1">
              Welcome, {user.name.split(' ')[0]}!
            </h1>
            <p className="text-lg text-indigo-300 max-w-xl leading-relaxed break-words">
              Ready for your next adventure? Discover trending campus events, workshops, and hackathons all in one place.
            </p>
          </div>
          <div className="mt-8 md:mt-0 relative z-10 hidden md:block">
            <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center p-1 shadow-[0_0_30px_rgba(99,102,241,0.5)]">
               <div className="w-full h-full bg-dark/80 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Compass size={48} className="text-white" />
               </div>
            </div>
          </div>
        </div>

        {/* Custom Premium Tabs */}
        <div className="flex space-x-2 bg-dark/50 p-1.5 rounded-2xl border border-white/10 w-fit mb-10 shadow-xl backdrop-blur-md">
          <button 
            onClick={() => setActiveTab('upcoming')}
            className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'upcoming' 
              ? 'bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <CalendarDays size={18} className="mr-2" /> Discover Events
          </button>
          <button 
            onClick={() => setActiveTab('registered')}
            className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'registered' 
              ? 'bg-gradient-to-r from-secondary to-pink-600 text-white shadow-lg' 
              : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <CheckCircle size={18} className="mr-2" /> My Tickets ({registeredEventsList.length})
          </button>
        </div>

        {/* Content Render */}
        <div className="animate-fade-in transition-all duration-500">
          {activeTab === 'upcoming' ? (
            <div>
              {/* Header + search bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-primary rounded-full"></div>
                  <h2 className="text-2xl font-bold text-white tracking-wide">Available Events</h2>
                </div>
                {/* Search input */}
                <div className="relative flex-1 max-w-sm">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search events by name, venue..."
                    className="glass-input w-full pl-9 py-2.5 text-sm"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter pills row */}
              <div className="flex flex-wrap gap-2 mb-6 items-center">
                <SlidersHorizontal size={15} className="text-slate-500 flex-shrink-0" />

                {/* Category pills */}
                {['All','Technical','Cultural','Workshop','Seminar','Sports','Other'].map(cat => (
                  <button key={cat} onClick={() => setFilterCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                      filterCategory === cat
                        ? 'bg-primary/30 text-indigo-300 border-primary/50'
                        : 'bg-white/5 text-slate-500 border-white/10 hover:border-white/20 hover:text-slate-300'
                    }`}>
                    {cat}
                  </button>
                ))}

                <div className="w-px h-4 bg-white/10 mx-1" />

                {/* Status pills */}
                {['All','Upcoming','Ongoing'].map(st => (
                  <button key={st} onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                      filterStatus === st
                        ? st === 'Ongoing' ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-primary/30 text-indigo-300 border-primary/50'
                        : 'bg-white/5 text-slate-500 border-white/10 hover:border-white/20 hover:text-slate-300'
                    }`}>
                    {st}
                  </button>
                ))}

                <div className="w-px h-4 bg-white/10 mx-1" />

                {/* Sort */}
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="text-xs bg-white/5 border border-white/10 text-slate-400 rounded-full px-3 py-1.5 focus:outline-none hover:border-white/20">
                  <option value="date-asc" className="bg-[#0d0f1a]">↑ Date (Soonest)</option>
                  <option value="date-desc" className="bg-[#0d0f1a]">↓ Date (Latest)</option>
                  <option value="name" className="bg-[#0d0f1a]">A–Z Name</option>
                </select>

                {/* Clear filters */}
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="ml-auto text-xs text-slate-500 hover:text-white flex items-center gap-1 transition-colors">
                    <X size={12} /> Clear
                  </button>
                )}
              </div>
              
              {availableEventsList.length === 0 ? (
                <div className="glass-panel text-center py-20 text-slate-400 border-dashed border-2 border-white/5">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CalendarDays size={40} className="text-slate-500" />
                  </div>
                  {hasActiveFilters ? (
                    <>
                      <p className="text-xl font-medium text-white mb-2">No events match your filters</p>
                      <p className="text-slate-400 mb-4">Try adjusting your search or filters</p>
                      <button onClick={clearFilters} className="px-4 py-2 rounded-xl bg-primary/20 text-indigo-300 border border-primary/30 text-sm hover:bg-primary/30 transition-all">
                        Clear All Filters
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-xl font-medium text-white mb-2">You're all caught up!</p>
                      <p className="text-slate-400">There are no new events posted right now. Check back later.</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableEventsList.map(event => {
                    const isFull = event.capacity > 0 && (event.registrationCount ?? 0) >= event.capacity;
                    return (
                      <EventCard 
                        key={event._id} 
                        event={event} 
                        onAction={isFull ? undefined : handleRegister} 
                        actionLabel={isFull ? 'Event is Full' : 'Register Now'} 
                        actionColor="primary"
                        disabled={isFull}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center mb-6">
                <div className="w-2 h-8 bg-secondary rounded-full mr-3"></div>
                <h2 className="text-2xl font-bold text-white tracking-wide">Your Registered Events</h2>
              </div>

              {registeredEventsList.length === 0 ? (
                <div className="glass-panel text-center py-20 text-slate-400 border-dashed border-2 border-white/5">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} className="text-slate-500" />
                  </div>
                  <p className="text-xl font-medium text-white mb-2">No tickets yet.</p>
                  <p className="text-slate-400">Discover events from the other tab to register!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {registeredEventsList.map(event => {
                    const reg = myRegistrations.find(r => r.event?._id === event._id);
                    return (
                      <EventCard 
                        key={event._id} 
                        event={event} 
                        onAction={() => setSelectedTicket(reg)} 
                        actionLabel="View Ticket" 
                        actionColor="secondary" 
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Register Modal */}
      {selectedEvent && (
        <RegisterModal
          event={selectedEvent}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Ticket Modal */}
      {selectedTicket && (
        <TicketModal
          registration={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
