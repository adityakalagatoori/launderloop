import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search, Star, Clock, DollarSign, Filter, Compass,
  MapPin, Plus, X
} from 'lucide-react';
import { useCityStore, useTripStore, useItineraryStore } from '../store';
import type { Activity, ActivityCategory } from '../types';

const CATEGORY_CONFIG: Record<ActivityCategory, { label: string; emoji: string }> = {
  SIGHTSEEING: { label: 'Sightseeing', emoji: '🏛️' },
  ADVENTURE: { label: 'Adventure', emoji: '🧗' },
  FOOD_DINING: { label: 'Food & Dining', emoji: '🍜' },
  CULTURE_ARTS: { label: 'Culture & Arts', emoji: '🎨' },
  NATURE: { label: 'Nature', emoji: '🌿' },
  SHOPPING: { label: 'Shopping', emoji: '🛍️' },
  NIGHTLIFE: { label: 'Nightlife', emoji: '🎉' },
  WELLNESS_SPA: { label: 'Wellness', emoji: '🧘' },
  SPORTS: { label: 'Sports', emoji: '⚽' },
  WATER_SPORTS: { label: 'Water Sports', emoji: '🏄' },
  PHOTOGRAPHY: { label: 'Photography', emoji: '📸' },
  LOCAL_EXPERIENCE: { label: 'Local Experience', emoji: '🤝' },
  OTHER: { label: 'Other', emoji: '✨' },
};

export default function ActivitiesPage() {
  const [searchParams] = useSearchParams();
  const { cities, activities } = useCityStore();
  const { trips } = useTripStore();
  const { getStops, addActivity } = useItineraryStore();

  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState(searchParams.get('city') || 'all');
  const [categoryFilter, setCategoryFilter] = useState<ActivityCategory | 'all'>('all');
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [hiddenGemsOnly, setHiddenGemsOnly] = useState(false);
  const [freeOnly, setFreeOnly] = useState(false);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [selectedTrip, setSelectedTrip] = useState('');
  const [selectedStop, setSelectedStop] = useState('');
  const [addedActivities, setAddedActivities] = useState<Set<string>>(new Set());

  const filtered = activities.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description?.toLowerCase().includes(search.toLowerCase()) ||
      a.cityName.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchCity = cityFilter === 'all' || a.cityId === cityFilter;
    const matchCat = categoryFilter === 'all' || a.category === categoryFilter;
    const matchPrice = maxPrice === null || (a.priceMin || 0) <= maxPrice;
    const matchHidden = !hiddenGemsOnly || a.isHiddenGem;
    const matchFree = !freeOnly || a.priceMin === 0;
    return matchSearch && matchCity && matchCat && matchPrice && matchHidden && matchFree;
  });

  const activePlanningTrips = trips.filter(t => ['PLANNING', 'DRAFT', 'CONFIRMED'].includes(t.status));
  const stops = selectedTrip ? getStops(selectedTrip) : [];

  const handleAddToTrip = (activityId: string) => {
    if (!selectedTrip || !selectedStop) return;
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;
    addActivity(selectedTrip, selectedStop, {
      stopId: selectedStop,
      activityId: activity.id,
      name: activity.name,
      description: activity.description,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      cost: activity.priceMin,
      currency: activity.currency,
      orderIndex: 0,
      isBooked: false,
      isCompleted: false,
      weatherAlert: activity.weatherDependent,
    });
    setAddedActivities(prev => new Set([...prev, activityId]));
    setAddingTo(null);
  };

  const featuredActivities = activities.filter(a => a.isFeatured);
  const hiddenGems = activities.filter(a => a.isHiddenGem);

  return (
    <div className="page-container space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Activity Search</h1>
        <p className="text-white/50 mt-1">Discover {activities.length} experiences across {cities.length} cities</p>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search activities, cities, or tags..."
              className="input-field pl-10"
            />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"><X size={14} /></button>}
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`btn-secondary flex items-center gap-2 ${showFilters ? 'border-indigo-500/40 text-indigo-300' : ''}`}>
            <Filter size={15} /> Filters
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${categoryFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
          >
            All
          </button>
          {(Object.keys(CATEGORY_CONFIG) as ActivityCategory[]).map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${categoryFilter === cat ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
            >
              {CATEGORY_CONFIG[cat].emoji} {CATEGORY_CONFIG[cat].label}
            </button>
          ))}
        </div>

        {showFilters && (
          <div className="glass-card p-4 space-y-4">
            <div>
              <label className="text-xs text-white/50 mb-2 block">City</label>
              <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} className="input-field text-sm py-2">
                <option value="all" className="bg-[#1c1c26]">All Cities</option>
                {cities.map(c => <option key={c.id} value={c.id} className="bg-[#1c1c26]">{c.name}, {c.country}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-2 block">Max Price: {maxPrice === null ? 'Any' : `$${maxPrice}`}</label>
              <input type="range" min="0" max="200" step="10" value={maxPrice ?? 200} onChange={e => setMaxPrice(e.target.value === '200' ? null : parseInt(e.target.value))} className="w-full accent-indigo-500" />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <div onClick={() => setHiddenGemsOnly(!hiddenGemsOnly)} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${hiddenGemsOnly ? 'bg-amber-500 border-amber-500' : 'border-white/20'}`}>
                  {hiddenGemsOnly && <span className="text-white text-xs">✓</span>}
                </div>
                <span className="text-sm text-white/60">💎 Hidden Gems only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <div onClick={() => setFreeOnly(!freeOnly)} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${freeOnly ? 'bg-green-500 border-green-500' : 'border-white/20'}`}>
                  {freeOnly && <span className="text-white text-xs">✓</span>}
                </div>
                <span className="text-sm text-white/60">Free activities only</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Hidden Gems Section */}
      {!search && categoryFilter === 'all' && hiddenGems.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">💎</span>
            <h2 className="section-title mb-0">Hidden Gems</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {hiddenGems.slice(0, 3).map(activity => (
              <ActivityCard key={activity.id} activity={activity} onAdd={() => setAddingTo(activity.id)} isAdded={addedActivities.has(activity.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">
            {search ? `Results for "${search}"` : 'All Activities'}
            <span className="text-white/30 text-sm font-normal ml-2">({filtered.length})</span>
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <Compass className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white/50 mb-2">No activities found</h3>
            <p className="text-white/30">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(activity => (
              <ActivityCard key={activity.id} activity={activity} onAdd={() => setAddingTo(activity.id)} isAdded={addedActivities.has(activity.id)} />
            ))}
          </div>
        )}
      </div>

      {/* Add to Trip Modal */}
      {addingTo && (
        <div className="modal-overlay" onClick={() => setAddingTo(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Add to Trip</h3>
              <button onClick={() => setAddingTo(null)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>
            <div className="mb-3 p-3 rounded-xl bg-white/5">
              <div className="font-medium text-white text-sm">{activities.find(a => a.id === addingTo)?.name}</div>
              <div className="text-xs text-white/40">{activities.find(a => a.id === addingTo)?.cityName}</div>
            </div>
            {activePlanningTrips.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-white/50 mb-4">No active trips</p>
                <Link to="/trips/new" className="btn-primary inline-flex items-center gap-2"><Plus size={16} /> Create Trip</Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Select Trip</label>
                  <select value={selectedTrip} onChange={e => { setSelectedTrip(e.target.value); setSelectedStop(''); }} className="input-field">
                    <option value="" className="bg-[#1c1c26]">Choose a trip...</option>
                    {activePlanningTrips.map(t => <option key={t.id} value={t.id} className="bg-[#1c1c26]">{t.name}</option>)}
                  </select>
                </div>
                {selectedTrip && (
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Select Stop</label>
                    {stops.length === 0 ? (
                      <p className="text-sm text-white/40">No stops in this trip yet</p>
                    ) : (
                      <select value={selectedStop} onChange={e => setSelectedStop(e.target.value)} className="input-field">
                        <option value="" className="bg-[#1c1c26]">Choose a stop...</option>
                        {stops.map(s => <option key={s.id} value={s.id} className="bg-[#1c1c26]">{s.cityName}</option>)}
                      </select>
                    )}
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => handleAddToTrip(addingTo!)} disabled={!selectedTrip || !selectedStop} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                    <Plus size={16} /> Add Activity
                  </button>
                  <button onClick={() => setAddingTo(null)} className="btn-secondary px-6">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ActivityCard({ activity, onAdd, isAdded }: {
  activity: Activity;
  onAdd: () => void;
  isAdded: boolean;
}) {
  const catConfig = CATEGORY_CONFIG[activity.category as ActivityCategory] || CATEGORY_CONFIG.OTHER;
  return (
    <div className="glass-card overflow-hidden card-hover group">
      {activity.imageUrl && (
        <div className="relative h-36 overflow-hidden">
          <img src={activity.imageUrl} alt={activity.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-2 left-2 flex gap-1">
            {activity.isHiddenGem && <span className="badge badge-amber text-xs">💎</span>}
            {activity.isFeatured && <span className="badge badge-indigo text-xs">Featured</span>}
          </div>
          <div className="absolute bottom-2 right-2">
            <span className="text-xs bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full text-white/70">
              {catConfig.emoji} {catConfig.label}
            </span>
          </div>
        </div>
      )}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-white text-sm leading-tight">{activity.name}</h3>
          <span className="text-xs text-amber-400 flex items-center gap-0.5 flex-shrink-0"><Star size={10} />{activity.rating}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-white/40">
          <MapPin size={10} />{activity.cityName}
        </div>
        {activity.description && (
          <p className="text-xs text-white/40 line-clamp-2">{activity.description}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-white/50">
          {activity.duration && <span className="flex items-center gap-0.5"><Clock size={10} />{activity.duration}min</span>}
          {activity.priceMin !== undefined && (
            <span className="flex items-center gap-0.5 text-amber-400">
              <DollarSign size={10} />
              {activity.priceMin === 0 ? 'Free' : `$${activity.priceMin}${activity.priceMax && activity.priceMax !== activity.priceMin ? `–$${activity.priceMax}` : ''}`}
            </span>
          )}
          {activity.weatherDependent && <span className="text-blue-400">☁️ Weather</span>}
        </div>
        <button
          onClick={onAdd}
          disabled={isAdded}
          className={`w-full py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${isAdded ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-600/30'}`}
        >
          {isAdded ? <><span>✓</span> Added</> : <><Plus size={12} /> Add to Trip</>}
        </button>
      </div>
    </div>
  );
}