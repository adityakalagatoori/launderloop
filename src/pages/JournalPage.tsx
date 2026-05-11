import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft, Plus, Trash2, Edit3, BookOpen, Search,
  Smile, Star, Zap, Heart, Coffee, AlertCircle, X, Check,
  Hash, Lock, Globe, Users
} from 'lucide-react';
import { useTripStore, useNoteStore } from '../store';
import type { NoteCategory, MoodType } from '../types';

const MOOD_CONFIG: Record<MoodType, { emoji: string; label: string; color: string }> = {
  AMAZING: { emoji: '🤩', label: 'Amazing', color: 'text-yellow-400' },
  GREAT: { emoji: '😄', label: 'Great', color: 'text-green-400' },
  GOOD: { emoji: '🙂', label: 'Good', color: 'text-teal-400' },
  OKAY: { emoji: '😐', label: 'Okay', color: 'text-blue-400' },
  TIRED: { emoji: '😴', label: 'Tired', color: 'text-purple-400' },
  STRESSED: { emoji: '😰', label: 'Stressed', color: 'text-red-400' },
};

const CATEGORY_CONFIG: Record<NoteCategory, { label: string; icon: React.ElementType; color: string }> = {
  MEMORY: { label: 'Memory', icon: Heart, color: 'text-pink-400' },
  TIP: { label: 'Travel Tip', icon: Star, color: 'text-amber-400' },
  THOUGHT: { label: 'Thought', icon: Coffee, color: 'text-blue-400' },
  TODO: { label: 'To-Do', icon: Check, color: 'text-green-400' },
  BUDGET: { label: 'Budget Note', icon: AlertCircle, color: 'text-orange-400' },
  GENERAL: { label: 'General', icon: BookOpen, color: 'text-white/50' },
};

const PRIVACY_ICONS = { PRIVATE: Lock, SHARED: Users, PUBLIC: Globe };

export default function JournalPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { trips } = useTripStore();
  const { getByTrip, addNote, updateNote, deleteNote } = useNoteStore();

  const trip = trips.find(t => t.id === tripId);
  const notes = getByTrip(tripId!);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<NoteCategory | 'ALL'>('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedNote, setExpandedNote] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'MEMORY' as NoteCategory,
    mood: 'GREAT' as MoodType,
    privacy: 'PRIVATE' as 'PRIVATE' | 'SHARED' | 'PUBLIC',
    date: new Date().toISOString().split('T')[0],
    hashtags: [] as string[],
    hashtagInput: '',
  });

  const resetForm = () => setForm({
    title: '', content: '', category: 'MEMORY', mood: 'GREAT',
    privacy: 'PRIVATE', date: new Date().toISOString().split('T')[0],
    hashtags: [], hashtagInput: '',
  });

  const handleSubmit = () => {
    if (!form.content.trim()) return;
    if (editingId) {
      updateNote(editingId, {
        title: form.title || undefined,
        content: form.content,
        category: form.category,
        mood: form.mood,
        privacy: form.privacy,
        date: form.date,
        hashtags: form.hashtags,
      });
      setEditingId(null);
    } else {
      addNote({
        tripId: tripId!,
        userId: 'user-1',
        title: form.title || undefined,
        content: form.content,
        category: form.category,
        mood: form.mood,
        privacy: form.privacy,
        date: form.date,
        hashtags: form.hashtags,
        photos: [],
      });
    }
    resetForm();
    setShowForm(false);
  };

  const handleEdit = (note: typeof notes[0]) => {
    setForm({
      title: note.title || '',
      content: note.content,
      category: note.category,
      mood: note.mood || 'GREAT',
      privacy: note.privacy,
      date: note.date,
      hashtags: note.hashtags,
      hashtagInput: '',
    });
    setEditingId(note.id);
    setShowForm(true);
  };

  const addHashtag = (tag: string) => {
    const t = tag.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (t && !form.hashtags.includes(t)) {
      setForm(p => ({ ...p, hashtags: [...p.hashtags, t], hashtagInput: '' }));
    } else {
      setForm(p => ({ ...p, hashtagInput: '' }));
    }
  };

  const filtered = notes.filter(n => {
    const matchSearch = n.content.toLowerCase().includes(search.toLowerCase()) ||
      n.title?.toLowerCase().includes(search.toLowerCase()) ||
      n.hashtags.some(h => h.includes(search.toLowerCase()));
    const matchCat = categoryFilter === 'ALL' || n.category === categoryFilter;
    return matchSearch && matchCat;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (!trip) return (
    <div className="page-container text-center py-20">
      <h2 className="text-xl text-white/50">Trip not found</h2>
      <Link to="/trips" className="btn-primary mt-4 inline-flex">Back to Trips</Link>
    </div>
  );

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to={`/trips/${tripId}`} className="flex items-center gap-2 text-white/50 hover:text-white mb-2 transition-colors text-sm">
            <ArrowLeft size={14} /> {trip.name}
          </Link>
          <h1 className="text-2xl font-bold text-white">Trip Journal</h1>
          <p className="text-white/50 mt-1">{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { resetForm(); setEditingId(null); setShowForm(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Note
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={15} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..." className="input-field pl-9 py-2 text-sm" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {(['ALL', ...Object.keys(CATEGORY_CONFIG)] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat as NoteCategory | 'ALL')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${categoryFilter === cat ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
            >
              {cat === 'ALL' ? 'All' : CATEGORY_CONFIG[cat as NoteCategory].label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      {filtered.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <BookOpen className="w-16 h-16 text-white/10 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white/50 mb-2">No notes yet</h3>
          <p className="text-white/30 mb-6">Start journaling your travel memories</p>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} /> Write First Note
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(note => {
            const catConfig = CATEGORY_CONFIG[note.category];
            const CatIcon = catConfig.icon;
            const moodConfig = note.mood ? MOOD_CONFIG[note.mood] : null;
            const PrivIcon = PRIVACY_ICONS[note.privacy];
            const isExpanded = expandedNote === note.id;

            return (
              <div key={note.id} className="glass-card overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CatIcon size={16} className={catConfig.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {note.title && <h3 className="font-semibold text-white">{note.title}</h3>}
                        <span className="text-xs text-white/30">{format(new Date(note.date), 'MMM d, yyyy')}</span>
                        {moodConfig && <span className="text-sm">{moodConfig.emoji}</span>}
                        <PrivIcon size={12} className="text-white/20 ml-auto" />
                      </div>
                      <p className={`text-sm text-white/60 mt-2 leading-relaxed ${!isExpanded && note.content.length > 200 ? 'line-clamp-3' : ''}`}>
                        {note.content}
                      </p>
                      {note.content.length > 200 && (
                        <button onClick={() => setExpandedNote(isExpanded ? null : note.id)} className="text-xs text-indigo-400 hover:text-indigo-300 mt-1">
                          {isExpanded ? 'Show less' : 'Read more'}
                        </button>
                      )}
                      {note.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {note.hashtags.map(tag => (
                            <span key={tag} className="flex items-center gap-0.5 text-xs text-indigo-400/70 hover:text-indigo-400 cursor-pointer">
                              <Hash size={10} />{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/8">
                    <span className={`badge text-xs ${catConfig.color} bg-white/5`}>{catConfig.label}</span>
                    <div className="ml-auto flex gap-2">
                      <button onClick={() => handleEdit(note)} className="btn-ghost p-1.5 text-white/40 hover:text-white">
                        <Edit3 size={13} />
                      </button>
                      <button onClick={() => { if (confirm('Delete this note?')) deleteNote(note.id); }} className="btn-ghost p-1.5 text-red-400/50 hover:text-red-400">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Note Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => { setShowForm(false); setEditingId(null); }}>
          <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">{editingId ? 'Edit Note' : 'New Journal Entry'}</h3>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className="input-field"
                placeholder="Title (optional)"
              />

              <textarea
                value={form.content}
                onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                className="input-field resize-none"
                rows={6}
                placeholder="Write your thoughts, memories, tips..."
                autoFocus
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/50 mb-2 block">Category</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(Object.keys(CATEGORY_CONFIG) as NoteCategory[]).map(cat => {
                      const config = CATEGORY_CONFIG[cat];
                      const Icon = config.icon;
                      return (
                        <button
                          key={cat}
                          onClick={() => setForm(p => ({ ...p, category: cat }))}
                          className={`flex items-center gap-1.5 p-2 rounded-lg text-xs transition-all ${form.category === cat ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-300' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
                        >
                          <Icon size={12} className={config.color} />
                          {config.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-white/50 mb-2 block">Mood</label>
                    <div className="flex flex-wrap gap-1.5">
                      {(Object.keys(MOOD_CONFIG) as MoodType[]).map(mood => (
                        <button
                          key={mood}
                          onClick={() => setForm(p => ({ ...p, mood }))}
                          className={`text-xl p-1.5 rounded-lg transition-all ${form.mood === mood ? 'bg-white/15 scale-110' : 'opacity-50 hover:opacity-80'}`}
                          title={MOOD_CONFIG[mood].label}
                        >
                          {MOOD_CONFIG[mood].emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-white/50 mb-2 block">Privacy</label>
                    <div className="flex gap-2">
                      {(['PRIVATE', 'SHARED', 'PUBLIC'] as const).map(p => {
                        const Icon = PRIVACY_ICONS[p];
                        return (
                          <button
                            key={p}
                            onClick={() => setForm(prev => ({ ...prev, privacy: p }))}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${form.privacy === p ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-300' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
                          >
                            <Icon size={11} /> {p}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-white/50 mb-2 block">Date</label>
                    <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="input-field text-sm py-2" />
                  </div>
                </div>
              </div>

              {/* Hashtags */}
              <div>
                <label className="text-xs text-white/50 mb-2 block">Hashtags</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.hashtags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs">
                      #{tag}
                      <button onClick={() => setForm(p => ({ ...p, hashtags: p.hashtags.filter(t => t !== tag) }))}><X size={10} /></button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={form.hashtagInput}
                  onChange={e => setForm(p => ({ ...p, hashtagInput: e.target.value }))}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); addHashtag(form.hashtagInput); } }}
                  className="input-field text-sm py-2"
                  placeholder="Add hashtag and press Enter"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={handleSubmit} disabled={!form.content.trim()} className="btn-primary flex-1 py-3">
                  {editingId ? 'Update Note' : 'Save Note'}
                </button>
                <button onClick={() => { setShowForm(false); setEditingId(null); }} className="btn-secondary px-6">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}