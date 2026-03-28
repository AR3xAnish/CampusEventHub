import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import EventCard from '../../components/EventCard';
import Navbar from '../../components/Navbar';
import RegisterModal from '../../components/RegisterModal';
import TicketModal from '../../components/TicketModal';
import { CalendarDays, CheckCircle, Sparkles, Compass } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

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
  const availableEventsList = events.filter(e => !myRegistrations.some(r => r.event?._id === e._id) && e.status !== 'Completed');

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
              <div className="flex items-center mb-6">
                <div className="w-2 h-8 bg-primary rounded-full mr-3"></div>
                <h2 className="text-2xl font-bold text-white tracking-wide">Available Events</h2>
              </div>
              
              {availableEventsList.length === 0 ? (
                <div className="glass-panel text-center py-20 text-slate-400 border-dashed border-2 border-white/5">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CalendarDays size={40} className="text-slate-500" />
                  </div>
                  <p className="text-xl font-medium text-white mb-2">You're all caught up!</p>
                  <p className="text-slate-400">There are no new events posted right now. Check back later.</p>
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
