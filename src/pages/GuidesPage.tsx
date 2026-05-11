import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, MapPin, Globe, Filter, CheckCircle, MessageCircle, Calendar, DollarSign, ChevronRight, Users, Award, Zap } from 'lucide-react';
import { SEED_GUIDES } from '../data/seed';

const LANGUAGES = ['All', 'English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'French', 'Spanish', 'Japanese'];
const SPECIALTIES = ['All', 'Heritage & Culture', 'Food Tours', 'Adventure', 'Photography', 'Spiritual', 'Wildlife', 'Nightlife', 'Shopping'];
const BUDGET_RANGES = ['All', 'Under ₹500/hr', '₹500–₹1500/hr', '₹1500–₹3000/hr', '₹3000+/hr'];

export default function GuidesPage() {
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedBudget, setSelectedBudget] = useState('All');
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'reviews'>('rating');
  const [showFilters, setShowFilters] = useState(false);

  const cities = ['All', ...Array.from(new Set(SEED_GUIDES.map(g => g.city)))];

  const filtered = SEED_GUIDES
    .filter(g => {
      const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.city.toLowerCase().includes(search.toLowerCase()) ||
        g.specialties.some(s => s.toLowerCase().includes(search.toLowerCase()));
      const matchCity = selectedCity === 'All' || g.city === selectedCity;
      const matchLang = selectedLanguage === 'All' || g.languages.includes(selectedLanguage);
      const matchSpec = selectedSpecialty === 'All' || g.specialties.includes(selectedSpecialty);
      return matchSearch && matchCity && matchLang && matchSpec;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price') return a.pricePerHour - b.pricePerHour;
      return b.reviewCount - a.reviewCount;
    });

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Local Guide Marketplace</h1>
          <p className="text-white/50 mt-1">Connect with verified local experts across India</p>
        </div>
        <Link to="/guides/register" className="btn-primary flex items-center gap-2 self-start">
          <Zap size={16} /> Become a Guide
        </Link>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Users, value: `${SEED_GUIDES.length}+`, label: 'Verified Guides', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { icon: MapPin, value: '20+', label: 'Cities Covered', color: 'text-teal-400', bg: 'bg-teal-500/10' },
          { icon: Star, value: '4.8★', label: 'Avg Rating', color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
              <stat.icon className={stat.color} size={18} />
            </div>
            <div>
              <div className="font-bold text-white">{stat.value}</div>
              <div className="text-xs text-white/40">{stat.label}</div>
            </div>
          </div>
        ))}
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
              placeholder="Search guides by name, city, or specialty..."
              className="input-field pl-10 w-full"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-ghost flex items-center gap-2 px-4 ${showFilters ? 'border-indigo-500/50 text-indigo-300' : ''}`}
          >
            <Filter size={16} /> Filters
          </button>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="input-field w-auto"
          >
            <option value="rating">Top Rated</option>
            <option value="price">Lowest Price</option>
            <option value="reviews">Most Reviews</option>
          </select>
        </div>

        {showFilters && (
          <div className="glass-card p-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">City</label>
              <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} className="input-field w-full text-sm">
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Language</label>
              <select value={selectedLanguage} onChange={e => setSelectedLanguage(e.target.value)} className="input-field w-full text-sm">
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Specialty</label>
              <select value={selectedSpecialty} onChange={e => setSelectedSpecialty(e.target.value)} className="input-field w-full text-sm">
                {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Budget</label>
              <select value={selectedBudget} onChange={e => setSelectedBudget(e.target.value)} className="input-field w-full text-sm">
                {BUDGET_RANGES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div>
        <p className="text-sm text-white/40 mb-4">{filtered.length} guides found</p>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(guide => (
            <Link key={guide.id} to={`/guides/${guide.id}`} className="glass-card overflow-hidden card-hover block group">
              {/* Cover */}
              <div className="relative h-40 overflow-hidden">
                <img src={guide.coverPhoto} alt={guide.city} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                {guide.isVerified && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-teal-500/90 text-white text-xs font-medium">
                    <CheckCircle size={11} /> Verified
                  </div>
                )}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                  <img src={guide.avatar} alt={guide.name} className="w-10 h-10 rounded-full border-2 border-white/30" />
                  <div>
                    <div className="text-white font-semibold text-sm">{guide.name}</div>
                    <div className="flex items-center gap-1 text-white/70 text-xs"><MapPin size={10} />{guide.city}</div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                    <span className="text-white font-semibold text-sm">{guide.rating}</span>
                    <span className="text-white/40 text-xs">({guide.reviewCount} reviews)</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold text-sm">₹{guide.pricePerHour.toLocaleString()}</div>
                    <div className="text-white/40 text-xs">per hour</div>
                  </div>
                </div>

                <p className="text-white/60 text-xs line-clamp-2">{guide.bio}</p>

                <div className="flex flex-wrap gap-1.5">
                  {guide.specialties.slice(0, 3).map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 text-xs">{s}</span>
                  ))}
                </div>

                <div className="flex items-center gap-3 text-xs text-white/40 pt-1 border-t border-white/8">
                  <span className="flex items-center gap-1"><Globe size={11} />{guide.languages.slice(0, 2).join(', ')}</span>
                  <span className="flex items-center gap-1 ml-auto"><Calendar size={11} />{guide.totalTours} tours</span>
                  <span className="flex items-center gap-1"><Award size={11} />{guide.experience}yr exp</span>
                </div>

                <div className="flex gap-2 pt-1">
                  <button className="flex-1 btn-primary text-xs py-2 flex items-center justify-center gap-1">
                    <Calendar size={12} /> Book Now
                  </button>
                  <button className="btn-ghost text-xs py-2 px-3 flex items-center gap-1">
                    <MessageCircle size={12} /> Chat
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="glass-card p-12 text-center">
            <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/50 mb-2">No guides found</p>
            <p className="text-white/30 text-sm">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* CTA Banner */}
      <div className="glass-card p-6 bg-gradient-to-r from-indigo-500/10 to-teal-500/10 border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-lg">Are you a local expert?</h3>
          <p className="text-white/50 text-sm mt-1">Join 500+ guides earning on TravelLoop. Set your own rates, manage bookings, and grow your business.</p>
        </div>
        <Link to="/guides/register" className="btn-primary flex items-center gap-2 flex-shrink-0">
          Register as Guide <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}