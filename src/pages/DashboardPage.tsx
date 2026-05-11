import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Plane, MapPin, DollarSign, TrendingUp, Star, Globe, Zap, ArrowRight, Calendar, Users, Leaf, Brain, ChevronRight, Flame, Trophy, Clock, Plus } from 'lucide-react';
import { useAuthStore, useTripStore, useExpenseStore } from '../store';
import { SEED_CITIES, SEED_ACHIEVEMENTS } from '../data/seed';

const HOUR = new Date().getHours();
const GREETING = HOUR < 12 ? 'Good morning' : HOUR < 17 ? 'Good afternoon' : 'Good evening';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { trips } = useTripStore();
  const { expenses } = useExpenseStore();
  const activeTrips = trips.filter(t => ['ACTIVE','PLANNING','CONFIRMED'].includes(t.status));
  const completedTrips = trips.filter(t => t.status === 'COMPLETED');
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBudget = trips.reduce((sum, t) => sum + (t.totalBudget || 0), 0);
  const featuredCities = SEED_CITIES.filter(c => c.isFeatured).slice(0, 4);
  const earnedAchievements = SEED_ACHIEVEMENTS.filter(a => a.earned);

  return (
    <div className="page-container space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{GREETING}, <span className="text-gradient">{user?.name?.split(' ')[0]}</span>! 👋</h1>
          <p className="text-white/50 mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')} · {activeTrips.length} active trip{activeTrips.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/trips/new" className="btn-primary flex items-center gap-2"><Plus size={16} /> New Trip</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Plane, label: 'Total Trips', value: user?.totalTrips || 0, sub: `${completedTrips.length} completed`, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { icon: Globe, label: 'Countries', value: user?.totalCountries || 0, sub: 'visited', color: 'text-teal-400', bg: 'bg-teal-500/10' },
          { icon: DollarSign, label: 'Total Spent', value: `$${totalSpent.toLocaleString()}`, sub: `of $${totalBudget.toLocaleString()} budget`, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { icon: Brain, label: 'Mindful Points', value: (user?.mindfulPoints || 0).toLocaleString(), sub: 'exploration points', color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-5">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}><stat.icon className={stat.color} size={20} /></div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-white/50 mt-0.5">{stat.label}</div>
            <div className="text-xs text-white/30 mt-1">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0">Active Trips</h2>
              <Link to="/trips" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">View all <ChevronRight size={14} /></Link>
            </div>
            {activeTrips.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <Plane className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/50 mb-4">No active trips yet</p>
                <Link to="/trips/new" className="btn-primary inline-flex items-center gap-2"><Plus size={16} /> Plan your first trip</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {activeTrips.map(trip => {
                  const spent = expenses.filter(e => e.tripId === trip.id).reduce((s, e) => s + e.amount, 0);
                  const budgetPct = trip.totalBudget ? Math.round((spent / trip.totalBudget) * 100) : 0;
                  const daysLeft = Math.ceil((new Date(trip.endDate).getTime() - Date.now()) / 86400000);
                  return (
                    <Link key={trip.id} to={`/trips/${trip.id}`} className="glass-card p-4 flex gap-4 card-hover block">
                      <div className="w-16 h-16 rounded-xl bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url(${trip.coverPhotoUrl})` }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-white truncate">{trip.name}</h3>
                          <span className={`badge flex-shrink-0 ${trip.status === 'ACTIVE' ? 'badge-green' : trip.status === 'PLANNING' ? 'badge-indigo' : 'badge-amber'}`}>{trip.status}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
                          <span className="flex items-center gap-1"><Calendar size={11} />{format(new Date(trip.startDate), 'MMM d')} – {format(new Date(trip.endDate), 'MMM d')}</span>
                          {daysLeft > 0 && <span className="flex items-center gap-1"><Clock size={11} />{daysLeft}d left</span>}
                        </div>
                        {trip.totalBudget && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-white/40 mb-1"><span>${spent.toLocaleString()} spent</span><span>{budgetPct}%</span></div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${budgetPct > 90 ? 'bg-red-500' : budgetPct > 70 ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min(budgetPct, 100)}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0">Trending Destinations</h2>
              <Link to="/cities" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">Explore <ChevronRight size={14} /></Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {featuredCities.map(city => (
                <Link key={city.id} to={`/cities/${city.id}`} className="relative overflow-hidden rounded-xl h-32 card-hover block group">
                  <img src={city.imageUrl} alt={city.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="font-semibold text-white text-sm">{city.name}</div>
                    <div className="flex items-center gap-1 text-xs text-white/60"><MapPin size={10} />{city.country}<span className="ml-auto flex items-center gap-0.5"><Star size={10} className="text-amber-400" />{city.rating}</span></div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center"><Flame className="text-amber-400" size={20} /></div>
              <div><div className="font-semibold text-white">{user?.loginStreak} Day Streak 🔥</div><div className="text-xs text-white/40">Keep it up!</div></div>
            </div>
            <div className="flex gap-1">{Array.from({ length: 7 }).map((_, i) => (<div key={i} className={`flex-1 h-2 rounded-full ${i < (user?.loginStreak || 0) ? 'bg-amber-500' : 'bg-white/10'}`} />))}</div>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-teal-400" /> Travel Stats</h3>
            <div className="space-y-3">
              {[
                { label: 'Countries', value: user?.totalCountries || 0, max: 195, color: 'bg-teal-500' },
                { label: 'Cities', value: user?.totalCities || 0, max: 500, color: 'bg-indigo-500' },
                { label: 'Trips', value: user?.totalTrips || 0, max: 50, color: 'bg-purple-500' },
              ].map(stat => (
                <div key={stat.label}>
                  <div className="flex justify-between text-sm mb-1"><span className="text-white/60">{stat.label}</span><span className="text-white font-medium">{stat.value}</span></div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden"><div className={`h-full ${stat.color} rounded-full`} style={{ width: `${Math.min((stat.value / stat.max) * 100, 100)}%` }} /></div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Trophy size={16} className="text-amber-400" /> Achievements</h3>
            <div className="space-y-2">
              {earnedAchievements.slice(0, 3).map(ach => (
                <div key={ach.id} className="flex items-center gap-3 p-2 rounded-xl bg-white/5">
                  <span className="text-xl">{ach.icon}</span>
                  <div><div className="text-sm font-medium text-white">{ach.name}</div><div className="text-xs text-white/40">+{ach.points} pts</div></div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Zap size={16} className="text-indigo-400" /> Quick Actions</h3>
            <div className="space-y-1">
              {[
                { to: '/trips/new', icon: Plane, label: 'Plan New Trip', color: 'text-indigo-400' },
                { to: '/cities', icon: Globe, label: 'Explore Cities', color: 'text-teal-400' },
                { to: '/buddies', icon: Users, label: 'Find Buddies', color: 'text-purple-400' },
                { to: '/carbon', icon: Leaf, label: 'Track Carbon', color: 'text-green-400' },
              ].map(action => (
                <Link key={action.to} to={action.to} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group">
                  <action.icon className={action.color} size={16} />
                  <span className="text-sm text-white/70 group-hover:text-white">{action.label}</span>
                  <ArrowRight size={12} className="ml-auto text-white/20 group-hover:text-white/50" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}