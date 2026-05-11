import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plane, Calendar, DollarSign, Tag, Globe, Lock, Users, Eye,
  ArrowRight, ArrowLeft, Check, Upload, X, MapPin
} from 'lucide-react';
import { useTripStore, useAuthStore } from '../store';
import type { TripType, TripVisibility } from '../types';

const TRIP_TYPES: { value: TripType; label: string; icon: string }[] = [
  { value: 'SOLO', label: 'Solo', icon: '🧳' },
  { value: 'COUPLE', label: 'Couple', icon: '💑' },
  { value: 'FAMILY', label: 'Family', icon: '👨‍👩‍👧' },
  { value: 'GROUP', label: 'Group', icon: '👥' },
  { value: 'ADVENTURE', label: 'Adventure', icon: '🏔️' },
  { value: 'LUXURY', label: 'Luxury', icon: '✨' },
  { value: 'BUDGET', label: 'Budget', icon: '💰' },
  { value: 'BACKPACKER', label: 'Backpacker', icon: '🎒' },
];

const VISIBILITY_OPTIONS: { value: TripVisibility; label: string; icon: React.ElementType; desc: string }[] = [
  { value: 'PRIVATE', label: 'Private', icon: Lock, desc: 'Only you can see this trip' },
  { value: 'FRIENDS', label: 'Friends', icon: Users, desc: 'Visible to your travel buddies' },
  { value: 'PUBLIC', label: 'Public', icon: Globe, desc: 'Anyone can discover this trip' },
  { value: 'UNLISTED', label: 'Unlisted', icon: Eye, desc: 'Only accessible via link' },
];

const COVER_PHOTOS = [
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
  'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
  'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800',
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
];

const SUGGESTED_TAGS = ['adventure', 'culture', 'food', 'beach', 'nature', 'city', 'history', 'photography', 'budget', 'luxury'];

export default function CreateTripPage() {
  const navigate = useNavigate();
  const { addTrip } = useTripStore();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tripType, setTripType] = useState<TripType>('SOLO');
  const [visibility, setVisibility] = useState<TripVisibility>('PRIVATE');
  const [totalBudget, setTotalBudget] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(COVER_PHOTOS[0]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const addTag = (tag: string) => {
    const t = tag.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t)) setTags(p => [...p, t]);
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags(p => p.filter(t => t !== tag));

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const handleSubmit = () => {
    const trip = addTrip({
      userId: user?.id || 'user-1',
      name,
      description,
      coverPhotoUrl,
      type: tripType,
      status: 'PLANNING',
      visibility,
      startDate,
      endDate,
      totalBudget: totalBudget ? parseFloat(totalBudget) : undefined,
      currency,
      tags,
      companions: [],
      carbonFootprint: 0,
    });
    navigate(`/trips/${trip.id}/itinerary`);
  };

  const canProceedStep1 = name.trim() && startDate && endDate && new Date(endDate) >= new Date(startDate);
  const canProceedStep2 = true;

  const duration = startDate && endDate
    ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000)
    : 0;

  return (
    <div className="page-container max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/trips')} className="flex items-center gap-2 text-white/50 hover:text-white mb-4 transition-colors">
          <ArrowLeft size={16} /> {step > 1 ? 'Back' : 'My Trips'}
        </button>
        <h1 className="text-2xl font-bold text-white">Plan a New Trip</h1>
        <p className="text-white/50 mt-1">Step {step} of 3</p>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${s <= step ? 'bg-indigo-500' : 'bg-white/10'}`} />
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-card p-6 space-y-5">
            <h2 className="text-lg font-semibold text-white">Trip Details</h2>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Trip Name *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="input-field"
                placeholder="e.g. European Summer Adventure"
                maxLength={80}
              />
              <div className="text-xs text-white/30 mt-1 text-right">{name.length}/80</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="input-field resize-none"
                rows={3}
                placeholder="Describe your trip..."
                maxLength={500}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  <Calendar size={13} className="inline mr-1" />Start Date *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="input-field"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  <Calendar size={13} className="inline mr-1" />End Date *
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="input-field"
                  min={startDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {duration > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <MapPin size={14} className="text-indigo-400" />
                <span className="text-sm text-indigo-300">{duration} day{duration !== 1 ? 's' : ''} trip</span>
              </div>
            )}
          </div>

          {/* Cover Photo */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Upload size={16} className="text-white/50" /> Cover Photo
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {COVER_PHOTOS.map(url => (
                <button
                  key={url}
                  onClick={() => setCoverPhotoUrl(url)}
                  className={`relative h-20 rounded-xl overflow-hidden transition-all ${coverPhotoUrl === url ? 'ring-2 ring-indigo-500 scale-105' : 'opacity-60 hover:opacity-100'}`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  {coverPhotoUrl === url && (
                    <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center">
                      <Check size={20} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!canProceedStep1}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base"
          >
            Continue <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Step 2: Type & Budget */}
      {step === 2 && (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-card p-6 space-y-5">
            <h2 className="text-lg font-semibold text-white">Trip Type</h2>
            <div className="grid grid-cols-4 gap-3">
              {TRIP_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => setTripType(type.value)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${tripType === type.value ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}
                >
                  <span className="text-2xl">{type.icon}</span>
                  <span className="text-xs font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 space-y-5">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <DollarSign size={16} className="text-amber-400" /> Budget
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-white/70 mb-2">Total Budget</label>
                <input
                  type="number"
                  value={totalBudget}
                  onChange={e => setTotalBudget(e.target.value)}
                  className="input-field"
                  placeholder="e.g. 3000"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Currency</label>
                <select value={currency} onChange={e => setCurrency(e.target.value)} className="input-field">
                  {['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'INR', 'SGD'].map(c => (
                    <option key={c} value={c} className="bg-[#1c1c26]">{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Tag size={16} className="text-teal-400" /> Tags
            </h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-sm">
                  #{tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-white ml-1"><X size={12} /></button>
                </span>
              ))}
            </div>
            <div className="relative">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="input-field pr-20"
                placeholder="Add tag and press Enter"
              />
              <button onClick={() => addTag(tagInput)} className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary text-xs px-3 py-1.5">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_TAGS.filter(t => !tags.includes(t)).map(tag => (
                <button key={tag} onClick={() => addTag(tag)} className="px-2.5 py-1 rounded-full bg-white/5 text-white/40 text-xs hover:bg-white/10 hover:text-white/70 transition-all">
                  +{tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">← Back</button>
            <button onClick={() => setStep(3)} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
              Continue <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Visibility & Review */}
      {step === 3 && (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Visibility</h2>
            <div className="space-y-3">
              {VISIBILITY_OPTIONS.map(opt => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setVisibility(opt.value)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${visibility === opt.value ? 'bg-indigo-600/20 border-indigo-500/40' : 'bg-white/5 border-white/10 hover:bg-white/8'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${visibility === opt.value ? 'bg-indigo-500/20' : 'bg-white/5'}`}>
                      <Icon size={18} className={visibility === opt.value ? 'text-indigo-400' : 'text-white/40'} />
                    </div>
                    <div>
                      <div className={`font-medium ${visibility === opt.value ? 'text-indigo-300' : 'text-white/70'}`}>{opt.label}</div>
                      <div className="text-xs text-white/40">{opt.desc}</div>
                    </div>
                    {visibility === opt.value && <Check size={16} className="text-indigo-400 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Trip Summary</h2>
            <div className="relative h-32 rounded-xl overflow-hidden">
              <img src={coverPhotoUrl} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-3 left-3">
                <div className="font-bold text-white">{name}</div>
                <div className="text-xs text-white/60">{startDate && endDate ? `${format_date(startDate)} – ${format_date(endDate)}` : ''}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-xl bg-white/5">
                <div className="text-white/40 text-xs mb-1">Type</div>
                <div className="text-white font-medium">{TRIP_TYPES.find(t => t.value === tripType)?.icon} {TRIP_TYPES.find(t => t.value === tripType)?.label}</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <div className="text-white/40 text-xs mb-1">Budget</div>
                <div className="text-white font-medium">{totalBudget ? `${currency} ${parseFloat(totalBudget).toLocaleString()}` : 'Not set'}</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <div className="text-white/40 text-xs mb-1">Duration</div>
                <div className="text-white font-medium">{duration} days</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <div className="text-white/40 text-xs mb-1">Visibility</div>
                <div className="text-white font-medium">{visibility}</div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-secondary flex-1 py-3">← Back</button>
            <button onClick={handleSubmit} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 text-base">
              <Plane size={16} /> Create Trip
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function format_date(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}