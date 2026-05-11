import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star, Clock, DollarSign, Copy, Search, Filter,
  Sparkles, TrendingUp, Check, X
} from 'lucide-react';
import { SEED_TEMPLATES } from '../data/seed';
import { useTripStore, useAuthStore } from '../store';

const THEMES = ['All', 'europe', 'asia', 'beach', 'adventure', 'luxury'];
const BUDGET_LEVELS = ['All', 'budget', 'mid-range', 'luxury'];

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { addTrip } = useTripStore();
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState('All');
  const [budget, setBudget] = useState('All');
  const [usingTemplate, setUsingTemplate] = useState<string | null>(null);
  const [usedTemplates, setUsedTemplates] = useState<Set<string>>(new Set());

  const filtered = SEED_TEMPLATES.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    const matchTheme = theme === 'All' || t.theme === theme;
    const matchBudget = budget === 'All' || t.budgetLevel === budget;
    return matchSearch && matchTheme && matchBudget;
  });

  const handleUseTemplate = (templateId: string) => {
    const template = SEED_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 30);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + template.duration);
    const trip = addTrip({
      userId: user?.id || 'user-1',
      name: template.name,
      description: template.description,
      type: 'SOLO',
      status: 'PLANNING',
      visibility: 'PRIVATE',
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      currency: 'USD',
      tags: template.tags,
      companions: [],
    });
    setUsedTemplates(prev => new Set([...prev, templateId]));
    setUsingTemplate(null);
    navigate(`/trips/${trip.id}/itinerary`);
  };

  const BUDGET_COLORS: Record<string, string> = {
    'budget': 'badge-green',
    'mid-range': 'badge-indigo',
    'luxury': 'badge-amber',
  };

  const THEME_IMAGES: Record<string, string> = {
    europe: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600',
    asia: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600',
    beach: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600',
    adventure: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600',
    luxury: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600',
  };

  return (
    <div className="page-container space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Trip Templates</h1>
        <p className="text-white/50 mt-1">Start with a curated itinerary and customize it</p>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates..." className="input-field pl-10" />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1 text-xs text-white/40 mr-2"><Filter size={12} /> Theme:</div>
          {THEMES.map(t => (
            <button key={t} onClick={() => setTheme(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${theme === t ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1 text-xs text-white/40 mr-2"><DollarSign size={12} /> Budget:</div>
          {BUDGET_LEVELS.map(b => (
            <button key={b} onClick={() => setBudget(b)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${budget === b ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Featured */}
      {!search && theme === 'All' && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-amber-400" />
            <h2 className="section-title mb-0">Most Popular</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SEED_TEMPLATES.sort((a, b) => b.useCount - a.useCount).slice(0, 3).map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                imageUrl={THEME_IMAGES[template.theme]}
                budgetColor={BUDGET_COLORS[template.budgetLevel]}
                isUsed={usedTemplates.has(template.id)}
                onUse={() => setUsingTemplate(template.id)}
                featured
              />
            ))}
          </div>
        </div>
      )}

      {/* All Templates */}
      <div>
        <h2 className="section-title">
          {search ? `Results for "${search}"` : 'All Templates'}
          <span className="text-white/30 text-sm font-normal ml-2">({filtered.length})</span>
        </h2>
        {filtered.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <TrendingUp className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white/50">No templates found</h3>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                imageUrl={THEME_IMAGES[template.theme]}
                budgetColor={BUDGET_COLORS[template.budgetLevel]}
                isUsed={usedTemplates.has(template.id)}
                onUse={() => setUsingTemplate(template.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Use Template Confirm Modal */}
      {usingTemplate && (
        <div className="modal-overlay" onClick={() => setUsingTemplate(null)}>
          <div className="modal-content max-w-sm" onClick={e => e.stopPropagation()}>
            {(() => {
              const template = SEED_TEMPLATES.find(t => t.id === usingTemplate);
              if (!template) return null;
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Use Template</h3>
                    <button onClick={() => setUsingTemplate(null)} className="text-white/40 hover:text-white"><X size={18} /></button>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="font-semibold text-white">{template.name}</div>
                    <div className="text-sm text-white/50 mt-1">{template.description}</div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
                      <span className="flex items-center gap-1"><Clock size={10} />{template.duration} days</span>
                      <span className="flex items-center gap-1"><Star size={10} className="text-amber-400" />{template.rating}</span>
                      <span className="flex items-center gap-1"><Copy size={10} />{template.useCount.toLocaleString()} uses</span>
                    </div>
                  </div>
                  <p className="text-sm text-white/50">This will create a new trip based on this template. You can customize it afterwards.</p>
                  <div className="flex gap-3">
                    <button onClick={() => handleUseTemplate(usingTemplate)} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                      <Copy size={14} /> Use Template
                    </button>
                    <button onClick={() => setUsingTemplate(null)} className="btn-secondary px-6">Cancel</button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

function TemplateCard({ template, imageUrl, budgetColor, isUsed, onUse, featured }: {
  template: typeof SEED_TEMPLATES[0];
  imageUrl?: string;
  budgetColor: string;
  isUsed: boolean;
  onUse: () => void;
  featured?: boolean;
}) {
  return (
    <div className={`glass-card overflow-hidden card-hover group ${featured ? 'ring-1 ring-indigo-500/20' : ''}`}>
      <div className="relative h-36 overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={template.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-900/50 to-teal-900/50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute top-2 left-2 flex gap-1">
          {template.isOfficial && <span className="badge badge-indigo text-xs">Official</span>}
          <span className={`badge text-xs ${budgetColor}`}>{template.budgetLevel}</span>
        </div>
        <div className="absolute bottom-2 right-2 flex items-center gap-1 text-xs text-amber-400">
          <Star size={10} fill="currentColor" />{template.rating}
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-white text-sm">{template.name}</h3>
          {template.description && <p className="text-xs text-white/40 mt-0.5 line-clamp-2">{template.description}</p>}
        </div>
        <div className="flex items-center gap-3 text-xs text-white/40">
          <span className="flex items-center gap-1"><Clock size={10} />{template.duration} days</span>
          <span className="flex items-center gap-1"><Copy size={10} />{template.useCount.toLocaleString()}</span>
          {template.season && <span className="capitalize">{template.season}</span>}
        </div>
        <div className="flex flex-wrap gap-1">
          {template.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-1.5 py-0.5 rounded-full bg-white/5 text-white/30 text-xs">#{tag}</span>
          ))}
        </div>
        <button
          onClick={onUse}
          disabled={isUsed}
          className={`w-full py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${isUsed ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-600/30'}`}
        >
          {isUsed ? <><Check size={12} /> Used</> : <><Copy size={12} /> Use Template</>}
        </button>
      </div>
    </div>
  );
}