import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Calendar, DollarSign, MapPin, Users, Globe, Lock, Eye,
  Edit3, Trash2, Share2, Copy, Plane, Map, Package,
  BookOpen, BarChart2, ArrowLeft, Clock, Star, ChevronRight,
  CheckCircle2, Circle, Zap
} from 'lucide-react';
import { useTripStore, useItineraryStore, useExpenseStore, usePackingStore } from '../store';

export default function TripDetailPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { trips, deleteTrip } = useTripStore();
  const { getStops } = useItineraryStore();
  const { getByTrip, getTotalByTrip } = useExpenseStore();
  const { getByTrip: getPackingByTrip } = usePackingStore();

  const trip = trips.find(t => t.id === tripId);
  if (!trip) return (
    <div className="page-container text-center py-20">
      <Plane className="w-16 h-16 text-white/10 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-white/50">Trip not found</h2>
      <Link to="/trips" className="btn-primary mt-4 inline-flex items-center gap-2"><ArrowLeft size={16} /> Back to Trips</Link>
    </div>
  );

  const stops = getStops(tripId!);
  const expenses = getByTrip(tripId!);
  const totalSpent = getTotalByTrip(tripId!);
  const packingLists = getPackingByTrip(tripId!);
  const totalItems = packingLists.reduce((s, l) => s + l.items.length, 0);
  const packedItems = packingLists.reduce((s, l) => s + l.items.filter(i => i.isPacked).length, 0);
  const budgetPct = trip.totalBudget ? Math.round((totalSpent / trip.totalBudget) * 100) : 0;
  const duration = Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000);
  const daysLeft = Math.ceil((new Date(trip.endDate).getTime() - Date.now()) / 86400000);
  const totalActivities = stops.reduce((s, stop) => s + stop.activities.length, 0);

  const handleDelete = () => {
    if (confirm('Delete this trip? This cannot be undone.')) {
      deleteTrip(trip.id);
      navigate('/trips');
    }
  };

  const STATUS_COLOR: Record<string, string> = {
    DRAFT: 'badge-amber', PLANNING: 'badge-indigo', CONFIRMED: 'badge-teal',
    ACTIVE: 'badge-green', COMPLETED: 'badge-purple', CANCELLED: 'badge-red',
  };

  const quickLinks = [
    { to: `/trips/${tripId}/itinerary`, icon: Map, label: 'Itinerary Builder', desc: `${stops.length} stops, ${totalActivities} activities`, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { to: `/trips/${tripId}/budget`, icon: BarChart2, label: 'Budget & Costs', desc: `$${totalSpent.toLocaleString()} spent`, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { to: `/trips/${tripId}/packing`, icon: Package, label: 'Packing List', desc: `${packedItems}/${totalItems} packed`, color: 'text-teal-400', bg: 'bg-teal-500/10' },
    { to: `/trips/${tripId}/journal`, icon: BookOpen, label: 'Trip Journal', desc: 'Notes & memories', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { to: `/trips/${tripId}/roadmap`, icon: Zap, label: 'Road Map', desc: 'Visual journey', color: 'text-pink-400', bg: 'bg-pink-500/10' },
  ];

  return (
    <div className="page-container space-y-6">
      {/* Back */}
      <button onClick={() => navigate('/trips')} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
        <ArrowLeft size={16} /> My Trips
      </button>

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden h-56">
        {trip.coverPhotoUrl ? (
          <img src={trip.coverPhotoUrl} alt={trip.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-900/50 to-teal-900/50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={STATUS_COLOR[trip.status] + ' badge'}>{trip.status}</span>
                {trip.visibility === 'PUBLIC' && <span className="badge badge-teal"><Globe size={10} /> Public</span>}
                {trip.visibility === 'PRIVATE' && <span className="badge badge-amber"><Lock size={10} /> Private</span>}
              </div>
              <h1 className="text-3xl font-bold text-white">{trip.name}</h1>
              {trip.description && <p className="text-white/60 mt-1 text-sm">{trip.description}</p>}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => navigator.clipboard?.writeText(window.location.href)} className="btn-secondary flex items-center gap-2 text-sm">
                <Share2 size={14} /> Share
              </button>
              <Link to={`/trips/${tripId}/itinerary`} className="btn-primary flex items-center gap-2 text-sm">
                <Edit3 size={14} /> Edit
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Calendar, label: 'Duration', value: `${duration} days`, sub: `${format(new Date(trip.startDate), 'MMM d')} – ${format(new Date(trip.endDate), 'MMM d')}`, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { icon: MapPin, label: 'Stops', value: stops.length, sub: `${totalActivities} activities`, color: 'text-teal-400', bg: 'bg-teal-500/10' },
          { icon: DollarSign, label: 'Budget', value: trip.totalBudget ? `$${trip.totalBudget.toLocaleString()}` : 'Not set', sub: `$${totalSpent.toLocaleString()} spent`, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { icon: Clock, label: daysLeft > 0 ? 'Days Away' : 'Status', value: daysLeft > 0 ? daysLeft : trip.status, sub: daysLeft > 0 ? 'until departure' : '', color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-4">
            <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={stat.color} size={18} />
            </div>
            <div className="text-xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-white/40 mt-0.5">{stat.label}</div>
            <div className="text-xs text-white/30">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Links */}
          <div className="glass-card p-5">
            <h2 className="section-title mb-4">Trip Sections</h2>
            <div className="space-y-2">
              {quickLinks.map(link => (
                <Link key={link.to} to={link.to} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group">
                  <div className={`w-10 h-10 rounded-xl ${link.bg} flex items-center justify-center flex-shrink-0`}>
                    <link.icon className={link.color} size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white group-hover:text-indigo-300 transition-colors">{link.label}</div>
                    <div className="text-xs text-white/40">{link.desc}</div>
                  </div>
                  <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Stops Preview */}
          {stops.length > 0 && (
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title mb-0">Itinerary Stops</h2>
                <Link to={`/trips/${tripId}/itinerary`} className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                  Edit <ChevronRight size={14} />
                </Link>
              </div>
              <div className="space-y-3">
                {stops.map((stop, idx) => (
                  <div key={stop.id} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300">
                        {idx + 1}
                      </div>
                      {idx < stops.length - 1 && <div className="w-px h-8 bg-white/10 mt-1" />}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{stop.cityName}</span>
                        <span className="text-xs text-white/40">{stop.activities.length} activities</span>
                      </div>
                      <div className="text-xs text-white/40 mt-0.5">
                        {format(new Date(stop.arrivalDate), 'MMM d')} – {format(new Date(stop.departureDate), 'MMM d')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Budget Overview */}
          {trip.totalBudget && (
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <DollarSign size={16} className="text-amber-400" /> Budget Overview
              </h3>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-white">${totalSpent.toLocaleString()}</div>
                <div className="text-sm text-white/40">of ${trip.totalBudget.toLocaleString()} budget</div>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                <div className={`h-full rounded-full transition-all ${budgetPct > 90 ? 'bg-red-500' : budgetPct > 70 ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min(budgetPct, 100)}%` }} />
              </div>
              <div className="flex justify-between text-xs text-white/40">
                <span>{budgetPct}% used</span>
                <span>${(trip.totalBudget - totalSpent).toLocaleString()} left</span>
              </div>
              <Link to={`/trips/${tripId}/budget`} className="btn-secondary w-full mt-4 text-sm flex items-center justify-center gap-2">
                <BarChart2 size={14} /> View Breakdown
              </Link>
            </div>
          )}

          {/* Packing Progress */}
          {totalItems > 0 && (
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Package size={16} className="text-teal-400" /> Packing Progress
              </h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl font-bold text-white">{packedItems}/{totalItems}</div>
                <div className="text-sm text-white/40">items packed</div>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: `${totalItems ? (packedItems / totalItems) * 100 : 0}%` }} />
              </div>
              <Link to={`/trips/${tripId}/packing`} className="btn-secondary w-full mt-4 text-sm flex items-center justify-center gap-2">
                <Package size={14} /> Manage Packing
              </Link>
            </div>
          )}

          {/* Trip Info */}
          <div className="glass-card p-5 space-y-3">
            <h3 className="font-semibold text-white">Trip Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/40">Type</span>
                <span className="text-white">{trip.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Currency</span>
                <span className="text-white">{trip.currency}</span>
              </div>
              {trip.companions.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-white/40">Companions</span>
                  <span className="text-white flex items-center gap-1"><Users size={12} />{trip.companions.length}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-white/40">Views</span>
                <span className="text-white">{trip.viewCount}</span>
              </div>
              {trip.tags.length > 0 && (
                <div className="pt-2">
                  <div className="flex flex-wrap gap-1">
                    {trip.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-white/5 text-white/40 text-xs">#{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="glass-card p-5 border border-red-500/10">
            <h3 className="font-semibold text-red-400 mb-3">Danger Zone</h3>
            <button onClick={handleDelete} className="btn-danger w-full flex items-center justify-center gap-2 text-sm">
              <Trash2 size={14} /> Delete Trip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}