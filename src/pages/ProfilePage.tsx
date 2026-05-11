import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User, Mail, MapPin, Globe, Edit3, Camera, Trophy,
  Plane, Star, TrendingUp, Calendar, Settings, ChevronRight,
  Check, X, Shield
} from 'lucide-react';
import { useAuthStore, useTripStore } from '../store';
import { SEED_ACHIEVEMENTS } from '../data/seed';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const { trips } = useTripStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    nationality: user?.nationality || '',
    homeCity: user?.homeCity || '',
  });

  const completedTrips = trips.filter(t => t.status === 'COMPLETED');
  const earnedAchievements = SEED_ACHIEVEMENTS.filter(a => a.earned);
  const totalPoints = earnedAchievements.reduce((s, a) => s + a.points, 0);

  const handleSave = () => {
    updateUser(form);
    setEditing(false);
  };

  const STATS = [
    { icon: Plane, label: 'Total Trips', value: user?.totalTrips || 0, color: 'text-indigo-400' },
    { icon: Globe, label: 'Countries', value: user?.totalCountries || 0, color: 'text-teal-400' },
    { icon: MapPin, label: 'Cities', value: user?.totalCities || 0, color: 'text-purple-400' },
    { icon: Trophy, label: 'Points', value: totalPoints, color: 'text-amber-400' },
  ];

  return (
    <div className="page-container max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
        <Link to="/settings" className="btn-secondary flex items-center gap-2 text-sm">
          <Settings size={14} /> Settings
        </Link>
      </div>

      {/* Profile Card */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
              alt={user?.name}
              className="w-24 h-24 rounded-2xl border-2 border-white/20"
            />
            <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center border-2 border-[#1c1c26] hover:bg-indigo-500 transition-colors">
              <Camera size={13} className="text-white" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1">
            {editing ? (
              <div className="space-y-3">
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input-field text-lg font-bold" placeholder="Your name" />
                <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} className="input-field resize-none text-sm" rows={2} placeholder="Bio..." />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" value={form.nationality} onChange={e => setForm(p => ({ ...p, nationality: e.target.value }))} className="input-field text-sm" placeholder="Nationality" />
                  <input type="text" value={form.homeCity} onChange={e => setForm(p => ({ ...p, homeCity: e.target.value }))} className="input-field text-sm" placeholder="Home city" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSave} className="btn-primary flex items-center gap-2 text-sm"><Check size={14} /> Save</button>
                  <button onClick={() => setEditing(false)} className="btn-secondary text-sm"><X size={14} /></button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="badge badge-indigo text-xs">{user?.role}</span>
                      {user?.travelStyleBadge && <span className="badge badge-teal text-xs">{user.travelStyleBadge}</span>}
                    </div>
                  </div>
                  <button onClick={() => setEditing(true)} className="btn-ghost p-2 text-white/40 hover:text-white">
                    <Edit3 size={15} />
                  </button>
                </div>
                {user?.bio && <p className="text-white/60 text-sm mt-2 leading-relaxed">{user.bio}</p>}
                <div className="flex flex-wrap gap-3 mt-3 text-xs text-white/40">
                  <span className="flex items-center gap-1"><Mail size={11} />{user?.email}</span>
                  {user?.nationality && <span className="flex items-center gap-1"><Globe size={11} />{user.nationality}</span>}
                  {user?.homeCity && <span className="flex items-center gap-1"><MapPin size={11} />{user.homeCity}</span>}
                  <span className="flex items-center gap-1"><Calendar size={11} />Joined {new Date(user?.createdAt || '').getFullYear()}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/8">
          {STATS.map(stat => (
            <div key={stat.label} className="text-center">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value.toLocaleString()}</div>
              <div className="text-xs text-white/40 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Achievements */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2"><Trophy size={16} className="text-amber-400" /> Achievements</h3>
            <span className="text-xs text-white/40">{earnedAchievements.length}/{SEED_ACHIEVEMENTS.length} earned</span>
          </div>
          <div className="space-y-2">
            {SEED_ACHIEVEMENTS.map(ach => (
              <div key={ach.id} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${ach.earned ? 'bg-white/5' : 'opacity-40'}`}>
                <span className="text-2xl">{ach.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{ach.name}</div>
                  <div className="text-xs text-white/40">{ach.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-amber-400">+{ach.points}</div>
                  {ach.earned && <div className="text-xs text-green-400">✓ Earned</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Trips */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2"><Plane size={16} className="text-indigo-400" /> Recent Trips</h3>
              <Link to="/trips" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">View all <ChevronRight size={12} /></Link>
            </div>
            <div className="space-y-3">
              {trips.slice(0, 4).map(trip => (
                <Link key={trip.id} to={`/trips/${trip.id}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group">
                  {trip.coverPhotoUrl && <img src={trip.coverPhotoUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{trip.name}</div>
                    <div className="text-xs text-white/40">{trip.status}</div>
                  </div>
                  <ChevronRight size={14} className="text-white/20 group-hover:text-white/50" />
                </Link>
              ))}
            </div>
          </div>

          {/* Travel Style */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Star size={16} className="text-teal-400" /> Travel Style</h3>
            <div className="flex flex-wrap gap-2">
              {user?.preferences.travelStyle.map(style => (
                <span key={style} className="px-3 py-1.5 rounded-full bg-teal-500/10 text-teal-300 text-sm border border-teal-500/20">{style}</span>
              ))}
              {user?.preferences.interests.map(interest => (
                <span key={interest} className="px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-300 text-sm border border-indigo-500/20">{interest}</span>
              ))}
            </div>
          </div>

          {/* Security */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Shield size={16} className="text-green-400" /> Account Security</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Two-Factor Auth</span>
                <span className={`badge text-xs ${user?.settings.twoFactorEnabled ? 'badge-green' : 'badge-amber'}`}>
                  {user?.settings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Profile Visibility</span>
                <span className="badge badge-indigo text-xs">{user?.settings.profileVisibility}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Referral Code</span>
                <code className="text-xs bg-white/10 px-2 py-1 rounded-lg text-white/70">{user?.referralCode}</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}