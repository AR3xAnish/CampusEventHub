import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
  AreaChart, Area,
} from 'recharts';
import { Users, CalendarDays, CheckCircle, TrendingUp, TrendingDown, Award, Activity } from 'lucide-react';

const CATEGORY_COLORS = {
  Technical: '#6366f1',
  Cultural: '#ec4899',
  Workshop: '#f59e0b',
  Seminar: '#10b981',
  Sports: '#3b82f6',
  Other: '#8b5cf6',
};

const STATUS_COLORS = {
  Upcoming: '#6366f1',
  Ongoing: '#10b981',
  Completed: '#64748b',
};

// Custom tooltip for bar chart
const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d0f1a] border border-white/10 rounded-xl p-3 text-sm shadow-xl">
      <p className="text-white font-semibold mb-2">{payload[0]?.payload?.fullName || label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }}></span>
          {p.name}: <span className="font-bold ml-1">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d0f1a] border border-white/10 rounded-xl p-3 text-sm shadow-xl">
      <p style={{ color: payload[0].payload.fill }} className="font-semibold">{payload[0].name}</p>
      <p className="text-white">{payload[0].value} event{payload[0].value !== 1 ? 's' : ''}</p>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, sub, color, gradient }) => (
  <div className={`relative overflow-hidden bg-white/[0.02] border border-white/10 rounded-2xl p-5 flex items-start gap-4`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${gradient}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-slate-500 text-xs mt-0.5">{sub}</p>}
    </div>
    {/* Subtle glow */}
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-2xl ${gradient}`}></div>
  </div>
);

const OrganizerAnalytics = ({ stats }) => {
  if (!stats || !stats.perEvent) return null;

  const {
    totalEvents, totalRegistrations, totalCheckedIn, checkInRate,
    perEvent, categoryBreakdown, statusBreakdown, timeline, peakCheckinTimes
  } = stats;

  const hasData = perEvent.length > 0;
  const hasCategoryData = categoryBreakdown.some(c => c.value > 0);

  // Calculate Most Popular Category by total registrations
  const categoryRegs = {};
  perEvent.forEach(e => {
    categoryRegs[e.category] = (categoryRegs[e.category] || 0) + e.registered;
  });
  let topCategory = 'None';
  let topCategoryRegs = 0;
  Object.entries(categoryRegs).forEach(([cat, count]) => {
    if (count > topCategoryRegs) {
      topCategoryRegs = count;
      topCategory = cat;
    }
  });

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="w-2 h-8 bg-gradient-to-b from-primary to-indigo-700 rounded-full"></div>
        <h2 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
          <Activity size={22} className="text-primary" /> Analytics Overview
        </h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={CalendarDays} label="Total Events" value={totalEvents}
          color="text-indigo-400" gradient="bg-gradient-to-br from-indigo-500 to-blue-600"
        />
        <StatCard
          icon={Users} label="Registrations" value={totalRegistrations}
          sub={`across ${totalEvents} event${totalEvents !== 1 ? 's' : ''}`}
          color="text-pink-400" gradient="bg-gradient-to-br from-pink-500 to-rose-600"
        />
        <StatCard
          icon={CheckCircle} label="Checked In" value={totalCheckedIn}
          sub={`${totalRegistrations - totalCheckedIn} still pending`}
          color="text-emerald-400" gradient="bg-gradient-to-br from-emerald-500 to-green-600"
        />
        <StatCard
          icon={TrendingDown} label="Drop-off Rate" value={`${100 - checkInRate}%`}
          sub={100 - checkInRate <= 30 ? '🔥 Great turnout!' : 100 - checkInRate <= 60 ? 'Moderate drop-off' : 'High drop-off'}
          color="text-amber-400" gradient="bg-gradient-to-br from-amber-500 to-orange-600"
        />
        <StatCard
          icon={Award} label="Top Category" value={topCategory}
          sub={`${topCategoryRegs} total registrations`}
          color="text-purple-400" gradient="bg-gradient-to-br from-purple-500 to-violet-600"
        />
      </div>

      {/* Charts Row 1: Area + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Registration Timeline */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-400" /> Registrations — Last 7 Days
          </h3>
          <p className="text-slate-500 text-xs mb-4">Daily registration activity across all your events</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={timeline} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="regGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#0d0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} labelStyle={{ color: '#fff' }} itemStyle={{ color: '#a5b4fc' }} />
              <Area type="monotone" dataKey="registrations" stroke="#6366f1" strokeWidth={2} fill="url(#regGradient)" dot={{ fill: '#6366f1', strokeWidth: 0, r: 3 }} activeDot={{ r: 5, fill: '#818cf8' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
            <Award size={16} className="text-pink-400" /> By Category
          </h3>
          <p className="text-slate-500 text-xs mb-3">Event distribution across categories</p>
          {hasCategoryData ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                    paddingAngle={3} dataKey="value" stroke="none">
                    {categoryBreakdown.map((entry, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[entry.name] || '#8b5cf6'} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                {categoryBreakdown.map((c, i) => (
                  <span key={i} className="flex items-center gap-1 text-xs text-slate-400">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[c.name] || '#8b5cf6' }}></span>
                    {c.name} ({c.value})
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[160px] flex items-center justify-center text-slate-600 text-sm">No events yet</div>
          )}
        </div>
      </div>

      {/* Charts Row 2: Per-event Bar + Peak Times Area */}
      {hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
              <Users size={16} className="text-emerald-400" /> Registrations vs Check-ins per Event
            </h3>
            <p className="text-slate-500 text-xs mb-5">Compare total registrations with actual attendance for each event</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={perEvent} margin={{ top: 5, right: 10, left: -20, bottom: 10 }} barSize={18} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Legend iconType="circle" iconSize={8}
                  wrapperStyle={{ fontSize: 12, color: '#94a3b8', paddingTop: 12 }} />
                <Bar dataKey="registered" name="Registered" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="checkedIn" name="Checked In" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
              <CalendarDays size={16} className="text-amber-400" /> Peak Check-in Times (Real-time)
            </h3>
            <p className="text-slate-500 text-xs mb-5">Hourly check-in volume across all your events combined</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={peakCheckinTimes} margin={{ top: 5, right: 10, left: -20, bottom: 10 }}>
                <defs>
                  <linearGradient id="peakGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ background: '#0d0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} 
                  labelStyle={{ color: '#fff' }} 
                  itemStyle={{ color: '#fcd34d' }} 
                  cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 2 }}
                />
                <Area type="monotone" dataKey="checkins" name="Check-ins" stroke="#f59e0b" strokeWidth={2} fill="url(#peakGradient)" dot={{ fill: '#f59e0b', strokeWidth: 0, r: 3 }} activeDot={{ r: 5, fill: '#fbbf24' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Status breakdown pills */}
      <div className="grid grid-cols-3 gap-4">
        {statusBreakdown.map(({ name, value }) => (
          <div key={name} className="bg-white/[0.02] border border-white/10 rounded-xl p-4 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[name] || '#64748b' }}></div>
            <div>
              <p className="text-slate-500 text-xs">{name}</p>
              <p className="text-white font-bold text-xl">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrganizerAnalytics;
