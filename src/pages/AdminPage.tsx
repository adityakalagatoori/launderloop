import { useState } from 'react';
import { format } from 'date-fns';
import {
  BarChart2, Users, Plane, Globe, TrendingUp, Activity,
  Shield, Eye, Trash2, Search, MapPin, Star, DollarSign
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { useTripStore, useAuthStore, useCityStore } from '../store';
import { SEED_BUDDIES } from '../data/seed';

const CHART_COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#8b5cf6', '#ec4899', '#10b981'];

export default function AdminPage() {
  const { user } = useAuthStore();
  const { trips } = useTripStore();
  const { cities, activities } = useCityStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'trips' | 'cities' | 'users'>('overview');
  const [search, setSearch] = useState('');

  // Stats
  const totalUsers = SEED_BUDDIES.length + 1;
  const totalTrips = trips.length;
  const publicTrips = trips.filter(t => t.visibility === 'PUBLIC').length;
  const completedTrips = trips.filter(t => t.status === 'COMPLETED').length;

  // Trip status distribution
  const statusData = ['PLANNING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'DRAFT'].map(status => ({
    name: status,
    value: trips.filter(t => t.status === status).length,
  })).filter(d => d.value > 0);

  // City popularity
  const cityData = cities.slice(0, 6).map(c => ({
    name: c.name,
    rating: c.rating,
    reviews: Math.round(c.reviewCount / 1000),
  }));

  // Monthly trips (simulated)
  const monthlyData = [
    { month: 'Jan', trips: 2 }, { month: 'Feb', trips: 3 }, { month: 'Mar', trips: 5 },
    { month: 'Apr', trips: 4 }, { month: 'May', trips: 7 }, { month: 'Jun', trips: 6 },
  ];

  const TABS = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'trips', label: 'Trips', icon: Plane },
    { id: 'cities', label: 'Cities', icon: Globe },
    { id: 'users', label: 'Users', icon: Users },
  ] as const;

  const filteredTrips = trips.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.status.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCities = cities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-white/50 mt-1">Platform overview and management</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <Shield size={14} className="text-amber-400" />
          <span className="text-xs text-amber-300 font-medium">{user?.role}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-white/50 hover:text-white'}`}
          >
            <tab.icon size={14} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Users, label: 'Total Users', value: totalUsers, sub: '+2 this week', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
              { icon: Plane, label: 'Total Trips', value: totalTrips, sub: `${publicTrips} public`, color: 'text-teal-400', bg: 'bg-teal-500/10' },
              { icon: Globe, label: 'Cities', value: cities.length, sub: 'in database', color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { icon: Activity, label: 'Activities', value: activities.length, sub: 'available', color: 'text-purple-400', bg: 'bg-purple-500/10' },
            ].map(stat => (
              <div key={stat.label} className="glass-card p-4">
                <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                  <stat.icon className={stat.color} size={18} />
                </div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/40 mt-0.5">{stat.label}</div>
                <div className="text-xs text-white/25 mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-4">Monthly Trip Creation</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={monthlyData}>
                  <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1c1c26', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                  <Line type="monotone" dataKey="trips" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-4">Trip Status Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {statusData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1c1c26', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {statusData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-white/50">
                    <div className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    {d.name} ({d.value})
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Cities */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4">City Ratings</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={cityData}>
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[4, 5]} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1c1c26', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="rating" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Trips Tab */}
      {activeTab === 'trips' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={15} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search trips..." className="input-field pl-9 py-2 text-sm" />
          </div>
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase">Trip</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase hidden sm:table-cell">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase hidden md:table-cell">Dates</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase hidden lg:table-cell">Budget</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase">Visibility</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTrips.map(trip => (
                  <tr key={trip.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {trip.coverPhotoUrl && <img src={trip.coverPhotoUrl} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />}
                        <div>
                          <div className="text-sm font-medium text-white">{trip.name}</div>
                          <div className="text-xs text-white/30">{trip.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`badge text-xs ${trip.status === 'COMPLETED' ? 'badge-purple' : trip.status === 'ACTIVE' ? 'badge-green' : trip.status === 'PLANNING' ? 'badge-indigo' : 'badge-amber'}`}>{trip.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-white/40 hidden md:table-cell">
                      {format(new Date(trip.startDate), 'MMM d')} – {format(new Date(trip.endDate), 'MMM d, yy')}
                    </td>
                    <td className="px-4 py-3 text-sm text-white/60 hidden lg:table-cell">
                      {trip.totalBudget ? `$${trip.totalBudget.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${trip.visibility === 'PUBLIC' ? 'badge-teal' : 'badge-amber'}`}>{trip.visibility}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button className="btn-ghost p-1.5 text-white/30 hover:text-white"><Eye size={13} /></button>
                        <button className="btn-ghost p-1.5 text-red-400/40 hover:text-red-400"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cities Tab */}
      {activeTab === 'cities' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={15} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cities..." className="input-field pl-9 py-2 text-sm" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCities.map(city => (
              <div key={city.id} className="glass-card p-4 flex gap-3">
                <img src={city.imageUrl} alt={city.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white text-sm">{city.name}</div>
                  <div className="text-xs text-white/40 flex items-center gap-1"><MapPin size={10} />{city.country}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-amber-400 flex items-center gap-0.5"><Star size={10} />{city.rating}</span>
                    <span className="text-xs text-white/30">{city.reviewCount.toLocaleString()} reviews</span>
                  </div>
                  <div className="flex gap-1 mt-1">
                    {city.isFeatured && <span className="badge badge-amber text-xs">Featured</span>}
                    {city.isPopular && <span className="badge badge-indigo text-xs">Popular</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase hidden sm:table-cell">Trips</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase hidden md:table-cell">Countries</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { id: 'user-1', name: user?.name || 'Alex Explorer', email: user?.email || '', avatar: user?.avatar, trips: user?.totalTrips || 0, countries: user?.totalCountries || 0, role: user?.role || 'PREMIUM', verified: true },
                  ...SEED_BUDDIES.map(b => ({ id: b.userId, name: b.name, email: `${b.name.toLowerCase().replace(' ', '.')}@example.com`, avatar: b.avatar, trips: b.totalTrips, countries: b.totalCountries, role: 'USER', verified: b.isVerified })),
                ].map(u => (
                  <tr key={u.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} alt="" className="w-8 h-8 rounded-full" />
                        <div>
                          <div className="text-sm font-medium text-white">{u.name}</div>
                          <div className="text-xs text-white/30">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/60 hidden sm:table-cell">{u.trips}</td>
                    <td className="px-4 py-3 text-sm text-white/60 hidden md:table-cell">{u.countries}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <span className={`badge text-xs ${u.role === 'PREMIUM' ? 'badge-amber' : 'badge-indigo'}`}>{u.role}</span>
                        {u.verified && <span className="badge badge-green text-xs">✓</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}