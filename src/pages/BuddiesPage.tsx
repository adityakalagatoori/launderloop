import { useState } from 'react';
import {
  Users, Search, UserCheck, UserX, UserPlus, Globe,
  Plane, MapPin, Star, Shield, Filter, MessageCircle
} from 'lucide-react';
import { useCommunityStore } from '../store';

export default function BuddiesPage() {
  const { buddies, updateBuddyStatus } = useCommunityStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'ACCEPTED' | 'PENDING'>('ALL');

  const filtered = buddies.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.bio?.toLowerCase().includes(search.toLowerCase()) ||
      b.travelStyle.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchFilter = filter === 'ALL' || b.status === filter;
    return matchSearch && matchFilter;
  });

  const accepted = buddies.filter(b => b.status === 'ACCEPTED');
  const pending = buddies.filter(b => b.status === 'PENDING');

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Travel Buddies</h1>
          <p className="text-white/50 mt-1">{accepted.length} connected · {pending.length} pending</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: UserCheck, label: 'Connected', value: accepted.length, color: 'text-green-400', bg: 'bg-green-500/10' },
          { icon: Users, label: 'Pending', value: pending.length, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { icon: Globe, label: 'Total', value: buddies.length, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-4 text-center">
            <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
              <stat.icon className={stat.color} size={18} />
            </div>
            <div className="text-xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-white/40">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={15} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search buddies..." className="input-field pl-9 py-2 text-sm" />
        </div>
        <div className="flex gap-1 bg-white/5 rounded-xl p-1">
          {(['ALL', 'ACCEPTED', 'PENDING'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? 'bg-indigo-600 text-white' : 'text-white/40 hover:text-white'}`}>
              {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Buddy Cards */}
      {filtered.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Users className="w-16 h-16 text-white/10 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white/50 mb-2">No buddies found</h3>
          <p className="text-white/30">Try adjusting your search</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(buddy => (
            <div key={buddy.id} className="glass-card p-5 space-y-4">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="relative">
                  <img
                    src={buddy.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${buddy.name}`}
                    alt={buddy.name}
                    className="w-14 h-14 rounded-2xl border border-white/20"
                  />
                  {buddy.isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center border-2 border-[#1c1c26]">
                      <Shield size={10} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white">{buddy.name}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star size={11} className="text-amber-400" />
                    <span className="text-xs text-amber-400 font-medium">{buddy.matchScore}% match</span>
                  </div>
                  <span className={`badge text-xs mt-1 ${buddy.status === 'ACCEPTED' ? 'badge-green' : buddy.status === 'PENDING' ? 'badge-amber' : 'badge-red'}`}>
                    {buddy.status}
                  </span>
                </div>
              </div>

              {/* Bio */}
              {buddy.bio && <p className="text-xs text-white/50 leading-relaxed line-clamp-2">{buddy.bio}</p>}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-xl bg-white/5 text-center">
                  <div className="text-sm font-bold text-white">{buddy.totalTrips}</div>
                  <div className="text-xs text-white/40">Trips</div>
                </div>
                <div className="p-2 rounded-xl bg-white/5 text-center">
                  <div className="text-sm font-bold text-white">{buddy.totalCountries}</div>
                  <div className="text-xs text-white/40">Countries</div>
                </div>
              </div>

              {/* Travel Style */}
              <div className="flex flex-wrap gap-1.5">
                {buddy.travelStyle.map(style => (
                  <span key={style} className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 text-xs border border-indigo-500/20">{style}</span>
                ))}
                {buddy.interests.slice(0, 2).map(interest => (
                  <span key={interest} className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 text-xs border border-teal-500/20">{interest}</span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                {buddy.status === 'PENDING' ? (
                  <>
                    <button
                      onClick={() => updateBuddyStatus(buddy.id, 'ACCEPTED')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-500/20 text-green-400 border border-green-500/20 hover:bg-green-500/30 transition-all text-sm font-medium"
                    >
                      <UserCheck size={14} /> Accept
                    </button>
                    <button
                      onClick={() => updateBuddyStatus(buddy.id, 'DECLINED')}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all text-sm"
                    >
                      <UserX size={14} />
                    </button>
                  </>
                ) : buddy.status === 'ACCEPTED' ? (
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/30 transition-all text-sm font-medium">
                    <MessageCircle size={14} /> Message
                  </button>
                ) : (
                  <button
                    onClick={() => updateBuddyStatus(buddy.id, 'PENDING')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 transition-all text-sm"
                  >
                    <UserPlus size={14} /> Re-connect
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Discover Section */}
      <div className="glass-card p-5">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Globe size={16} className="text-teal-400" /> Discover Travelers
        </h3>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { name: 'Emma Wilson', countries: 31, style: 'Solo', match: 88, seed: 'Emma' },
            { name: 'Carlos Mendez', countries: 24, style: 'Adventure', match: 82, seed: 'Carlos' },
            { name: 'Yuki Tanaka', countries: 18, style: 'Culture', match: 79, seed: 'Yuki' },
          ].map(person => (
            <div key={person.name} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${person.seed}`} alt="" className="w-10 h-10 rounded-full" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{person.name}</div>
                <div className="text-xs text-white/40">{person.countries} countries · {person.style}</div>
              </div>
              <div className="text-xs text-amber-400 font-medium">{person.match}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}