import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, MapPin, Star, Globe, Filter, TrendingUp,
  DollarSign, Shield, ChevronRight, Sparkles, X
} from 'lucide-react';
import { useCityStore } from '../store';

const REGIONS = ['All', 'Europe', 'Asia', 'Americas', 'Middle East', 'Oceania', 'Africa'];
const BUDGET_LEVELS = ['All', 'Budget', 'Mid-Range', 'Luxury'];

export default function CitiesPage() {
  const { cities } = useCityStore();
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('All');
  const [budgetLevel, setBudgetLevel] = useState('All');
  const [sortBy, setSortBy] = useState<'rating' | 'name' | 'safety'>('rating');
  const [showFilters, setShowFilters] = useState(false);

  const getRegion = (city: typeof cities[0]) => {
    const regionMap: Record<string, string> = {
      FR: 'Europe', ES: 'Europe', IT: 'Europe', DE: 'Europe', GB: 'Europe',
      JP: 'Asia', ID: 'Asia', IN: 'Asia', TH: 'Asia', SG: 'Asia', CN: 'Asia',
      US: 'Americas', CA: 'Americas', BR: 'Americas', MX: 'Americas',
      AE: 'Middle East', SA: 'Middle East', QA: 'Middle East',
      AU: 'Oceania', NZ: 'Oceania',
    };
    return regionMap[city.countryCode] || 'Other';
  };

  const getBudgetLevel = (city: typeof cities[0]) => {
    const avg = (city.costs.accommodation.midRange + city.costs.food.midRange) / 2;
    if (avg < 50) return 'Budget';
    if (avg < 150) return 'Mid-Range';
    return 'Luxury';
  };

  const filtered = cities
    .filter(c => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.country.toLowerCase().includes(search.toLowerCase()) ||
        c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchRegion = region === 'All' || getRegion(c) === region;
      const matchBudget = budgetLevel === 'All' || getBudgetLevel(c) === budgetLevel;
      return matchSearch && matchRegion && matchBudget;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'safety') return b.safetyScore - a.safetyScore;
      return b.rating - a.rating;
    });

  const featuredCities = cities.filter(c => c.isFeatured);
  const popularCities = cities.filter(c => c.isPopular);

  return (
    <div className="page-container space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Explore Cities</h1>
        <p className="text-white/50 mt-1">Discover {cities.length} destinations worldwide</p>
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
              placeholder="Search cities, countries, or tags..."
              className="input-field pl-10"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 ${showFilters ? 'border-indigo-500/40 text-indigo-300' : ''}`}
          >
            <Filter size={15} /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="glass-card p-4 space-y-4">
            <div>
              <label className="text-xs text-white/50 mb-2 block">Region</label>
              <div className="flex flex-wrap gap-2">
                {REGIONS.map(r => (
                  <button key={r} onClick={() => setRegion(r)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${region === r ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-2 block">Budget Level</label>
              <div className="flex gap-2">
                {BUDGET_LEVELS.map(b => (
                  <button key={b} onClick={() => setBudgetLevel(b)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${budgetLevel === b ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                    {b}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-2 block">Sort By</label>
              <div className="flex gap-2">
                {[{ value: 'rating', label: 'Rating' }, { value: 'name', label: 'Name' }, { value: 'safety', label: 'Safety' }].map(s => (
                  <button key={s.value} onClick={() => setSortBy(s.value as typeof sortBy)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sortBy === s.value ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Featured Cities */}
      {!search && region === 'All' && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-amber-400" />
            <h2 className="section-title mb-0">Featured Destinations</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredCities.map(city => (
              <Link key={city.id} to={`/cities/${city.id}`} className="relative overflow-hidden rounded-2xl h-44 card-hover block group">
                <img src={city.imageUrl} alt={city.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="font-bold text-white">{city.name}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-white/60 flex items-center gap-1"><MapPin size={10} />{city.country}</span>
                    <span className="text-xs text-amber-400 flex items-center gap-0.5"><Star size={10} />{city.rating}</span>
                  </div>
                </div>
                {city.isFeatured && (
                  <div className="absolute top-3 left-3">
                    <span className="badge badge-amber text-xs">Featured</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All Cities Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">
            {search ? `Results for "${search}"` : 'All Destinations'}
            <span className="text-white/30 text-sm font-normal ml-2">({filtered.length})</span>
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <Globe className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white/50 mb-2">No cities found</h3>
            <p className="text-white/30">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(city => {
              const budgetLvl = getBudgetLevel(city);
              const dailyCost = city.costs.accommodation.midRange + city.costs.food.midRange + city.costs.transport.midRange;

              return (
                <Link key={city.id} to={`/cities/${city.id}`} className="glass-card overflow-hidden card-hover block group">
                  <div className="relative h-36 overflow-hidden">
                    <img src={city.imageUrl} alt={city.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-2 right-2 flex gap-1">
                      {city.isPopular && <span className="badge badge-indigo text-xs">Popular</span>}
                    </div>
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="font-bold text-white text-sm">{city.name}</div>
                    </div>
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/50 flex items-center gap-1"><MapPin size={10} />{city.country}</span>
                      <span className="text-xs text-amber-400 flex items-center gap-0.5"><Star size={10} />{city.rating}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-white/40"><DollarSign size={10} />~${dailyCost}/day</span>
                      <span className="flex items-center gap-1 text-white/40"><Shield size={10} />{city.safetyScore}/10</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {city.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-1.5 py-0.5 rounded-full bg-white/5 text-white/30 text-xs">#{tag}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}