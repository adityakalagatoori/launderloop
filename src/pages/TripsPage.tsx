import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Plus, Search, Filter, Plane, Calendar, MapPin, DollarSign,
  Eye, Edit3, Trash2, Copy, Globe, Lock, Users, MoreVertical,
  Grid3X3, List, SortAsc, ChevronDown
} from 'lucide-react';
import { useTripStore, useExpenseStore } from '../store';
import type { TripStatus, TripVisibility } from '../types';

const STATUS_COLORS: Record<TripStatus, string> = {
  DRAFT: 'badge-amber',
  PLANNING: 'badge-indigo',
  CONFIRMED: 'badge-teal',
  ACTIVE: 'badge-green',
  COMPLETED: 'badge-purple',
  CANCELLED: 'badge-red',
};

const VISIBILITY_ICONS: Record<TripVisibility, React.ElementType> = {
  PRIVATE: Lock,
  FRIENDS: Users,
  PUBLIC: Globe,
  UNLISTED: Eye,
};

export default function TripsPage() {
  const navigate = useNavigate();
  const { trips, deleteTrip, duplicateTrip } = useTripStore();
  const { getByTrip } = useExpenseStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TripStatus | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'budget'>('date');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = trips
    .filter(t => {
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'budget') return (b.totalBudget || 0) - (a.totalBudget || 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Delete this trip? This cannot be undone.')) {
      deleteTrip(id);
    }
    setOpenMenu(null);
  };

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newTrip = duplicateTrip(id);
    if (newTrip) navigate(`/trips/${newTrip.id}`);
    setOpenMenu(null);
  };

  const TripCard = ({ trip }: { trip: typeof trips[0] }) => {
    const expenses = getByTrip(trip.id);
    const spent = expenses.reduce((s, e) => s + e.amount, 0);
    const budgetPct = trip.totalBudget ? Math.round((spent / trip.totalBudget) * 100) : 0;
    const daysLeft = Math.ceil((new Date(trip.endDate).getTime() - Date.now()) / 86400000);
    const duration = Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000);
    const VisIcon = VISIBILITY_ICONS[trip.visibility];

    return (
      <div className="glass-card overflow-hidden card-hover group relative">
        {/* Cover */}
        <div className="relative h-40 overflow-hidden">
          {trip.coverPhotoUrl ? (
            <img src={trip.coverPhotoUrl} alt={trip.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-900/50 to-teal-900/50 flex items-center justify-center">
              <Plane className="text-white/20" size={48} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={STATUS_COLORS[trip.status] + ' badge text-xs'}>{trip.status}</span>
          </div>
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <VisIcon size={13} className="text-white/70" />
            </div>
            <div className="relative">
              <button
                onClick={e => { e.preventDefault(); e.stopPropagation(); setOpenMenu(openMenu === trip.id ? null : trip.id); }}
                className="w-7 h-7 rounded-lg bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
              >
                <MoreVertical size={13} className="text-white/70" />
              </button>
              {openMenu === trip.id && (
                <div className="absolute right-0 top-8 w-40 glass-card border border-white/10 rounded-xl overflow-hidden z-20 shadow-xl">
                  <button onClick={e => { e.preventDefault(); e.stopPropagation(); navigate(`/trips/${trip.id}`); setOpenMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white/70 hover:bg-white/8 hover:text-white">
                    <Eye size={14} /> View
                  </button>
                  <button onClick={e => { e.preventDefault(); e.stopPropagation(); navigate(`/trips/${trip.id}/itinerary`); setOpenMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white/70 hover:bg-white/8 hover:text-white">
                    <Edit3 size={14} /> Edit Itinerary
                  </button>
                  <button onClick={e => handleDuplicate(trip.id, e)} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white/70 hover:bg-white/8 hover:text-white">
                    <Copy size={14} /> Duplicate
                  </button>
                  <button onClick={e => handleDelete(trip.id, e)} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="font-bold text-white text-base leading-tight truncate">{trip.name}</h3>
          </div>
        </div>

        {/* Body */}
        <Link to={`/trips/${trip.id}`} className="block p-4 space-y-3">
          <div className="flex items-center gap-3 text-xs text-white/50">
            <span className="flex items-center gap-1"><Calendar size={11} />{format(new Date(trip.startDate), 'MMM d')} – {format(new Date(trip.endDate), 'MMM d, yyyy')}</span>
            <span className="flex items-center gap-1 ml-auto"><MapPin size={11} />{duration}d</span>
          </div>

          {trip.description && (
            <p className="text-xs text-white/40 line-clamp-2">{trip.description}</p>
          )}

          {trip.totalBudget && (
            <div>
              <div className="flex justify-between text-xs text-white/40 mb-1.5">
                <span className="flex items-center gap-1"><DollarSign size={10} />${spent.toLocaleString()} / ${trip.totalBudget.toLocaleString()}</span>
                <span className={budgetPct > 90 ? 'text-red-400' : budgetPct > 70 ? 'text-amber-400' : 'text-teal-400'}>{budgetPct}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${budgetPct > 90 ? 'bg-red-500' : budgetPct > 70 ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min(budgetPct, 100)}%` }} />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-1">
              {trip.tags.slice(0, 2).map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded-full bg-white/5 text-white/40 text-xs">#{tag}</span>
              ))}
            </div>
            {daysLeft > 0 && trip.status !== 'COMPLETED' && trip.status !== 'CANCELLED' && (
              <span className="text-xs text-indigo-400">{daysLeft}d away</span>
            )}
          </div>
        </Link>
      </div>
    );
  };

  const TripRow = ({ trip }: { trip: typeof trips[0] }) => {
    const expenses = getByTrip(trip.id);
    const spent = expenses.reduce((s, e) => s + e.amount, 0);
    const duration = Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000);

    return (
      <Link to={`/trips/${trip.id}`} className="glass-card p-4 flex items-center gap-4 card-hover block">
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
          {trip.coverPhotoUrl ? (
            <img src={trip.coverPhotoUrl} alt={trip.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-indigo-900/50 flex items-center justify-center">
              <Plane size={20} className="text-indigo-400" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white truncate">{trip.name}</h3>
            <span className={STATUS_COLORS[trip.status] + ' badge text-xs flex-shrink-0'}>{trip.status}</span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-white/40">
            <span className="flex items-center gap-1"><Calendar size={10} />{format(new Date(trip.startDate), 'MMM d')} – {format(new Date(trip.endDate), 'MMM d')}</span>
            <span>{duration} days</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-6 text-sm">
          <div className="text-right">
            <div className="text-white/70">${spent.toLocaleString()}</div>
            <div className="text-xs text-white/30">of ${(trip.totalBudget || 0).toLocaleString()}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={e => { e.preventDefault(); navigate(`/trips/${trip.id}/itinerary`); }} className="btn-ghost p-2 text-xs"><Edit3 size={14} /></button>
          <button onClick={e => handleDelete(trip.id, e)} className="btn-ghost p-2 text-red-400/60 hover:text-red-400"><Trash2 size={14} /></button>
        </div>
      </Link>
    );
  };

  return (
    <div className="page-container space-y-6" onClick={() => setOpenMenu(null)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Trips</h1>
          <p className="text-white/50 mt-1">{trips.length} trip{trips.length !== 1 ? 's' : ''} total</p>
        </div>
        <Link to="/trips/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Trip
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={15} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search trips..."
            className="input-field pl-9 py-2 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-white/40" />
          {(['ALL', 'PLANNING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'DRAFT'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
            >
              {s === 'ALL' ? 'All' : s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-white/40 hover:text-white'}`}>
              <Grid3X3 size={14} />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-white/40 hover:text-white'}`}>
              <List size={14} />
            </button>
          </div>

          <div className="relative">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 text-xs">
              <SortAsc size={13} />
              Sort
              <ChevronDown size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Trip Grid/List */}
      {filtered.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Plane className="w-16 h-16 text-white/10 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white/50 mb-2">No trips found</h3>
          <p className="text-white/30 mb-6">
            {search || statusFilter !== 'ALL' ? 'Try adjusting your filters' : "You haven't created any trips yet"}
          </p>
          <Link to="/trips/new" className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} /> Plan Your First Trip
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(trip => <TripCard key={trip.id} trip={trip} />)}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(trip => <TripRow key={trip.id} trip={trip} />)}
        </div>
      )}
    </div>
  );
}