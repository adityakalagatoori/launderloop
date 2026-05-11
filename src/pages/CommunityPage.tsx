import { useState } from 'react';
import { format } from 'date-fns';
import {
  Heart, MessageCircle, Share2, Plus, Search, Hash,
  TrendingUp, Users, Globe, X, Image, Send
} from 'lucide-react';
import { useCommunityStore, useAuthStore } from '../store';

const TRENDING_TAGS = ['japan', 'bali', 'budget-travel', 'solo-female', 'hidden-gems', 'food-tour', 'backpacking', 'luxury'];

export default function CommunityPage() {
  const { posts, addPost, toggleLike } = useCommunityStore();
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', tags: [] as string[], tagInput: '' });

  const filtered = posts.filter(p => {
    const matchSearch = p.content.toLowerCase().includes(search.toLowerCase()) ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.userName.toLowerCase().includes(search.toLowerCase());
    const matchTag = !activeTag || p.tags.includes(activeTag);
    return matchSearch && matchTag;
  });

  const handlePost = () => {
    if (!newPost.content.trim()) return;
    addPost({
      userId: user?.id || 'user-1',
      userName: user?.name || 'Anonymous',
      userAvatar: user?.avatar,
      title: newPost.title || undefined,
      content: newPost.content,
      images: [],
      tags: newPost.tags,
      isLiked: false,
    });
    setNewPost({ title: '', content: '', tags: [], tagInput: '' });
    setShowNewPost(false);
  };

  const addTag = (tag: string) => {
    const t = tag.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (t && !newPost.tags.includes(t)) setNewPost(p => ({ ...p, tags: [...p.tags, t], tagInput: '' }));
    else setNewPost(p => ({ ...p, tagInput: '' }));
  };

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Community</h1>
          <p className="text-white/50 mt-1">Share experiences with fellow travelers</p>
        </div>
        <button onClick={() => setShowNewPost(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Share Story
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={15} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts..." className="input-field pl-9 py-2 text-sm" />
          </div>

          {/* Posts */}
          {filtered.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <Globe className="w-16 h-16 text-white/10 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white/50">No posts found</h3>
            </div>
          ) : (
            filtered.map(post => (
              <div key={post.id} className="glass-card p-5 space-y-4">
                {/* Author */}
                <div className="flex items-center gap-3">
                  <img src={post.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.userName}`} alt="" className="w-10 h-10 rounded-full border border-white/20" />
                  <div>
                    <div className="font-medium text-white text-sm">{post.userName}</div>
                    <div className="text-xs text-white/40">{format(new Date(post.createdAt), 'MMM d, yyyy')}</div>
                  </div>
                </div>

                {/* Content */}
                {post.title && <h3 className="font-bold text-white">{post.title}</h3>}
                <p className="text-white/70 text-sm leading-relaxed">{post.content}</p>

                {/* Images */}
                {post.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {post.images.map((img, i) => (
                      <img key={i} src={img} alt="" className="w-full h-40 object-cover rounded-xl" />
                    ))}
                  </div>
                )}

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map(tag => (
                      <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)} className={`text-xs px-2 py-0.5 rounded-full transition-all ${activeTag === tag ? 'bg-indigo-600 text-white' : 'text-indigo-400/70 hover:text-indigo-400'}`}>
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 pt-2 border-t border-white/8">
                  <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-1.5 text-sm transition-colors ${post.isLiked ? 'text-red-400' : 'text-white/40 hover:text-red-400'}`}>
                    <Heart size={15} fill={post.isLiked ? 'currentColor' : 'none'} />
                    {post.likeCount}
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors">
                    <MessageCircle size={15} />
                    {post.commentCount}
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors ml-auto">
                    <Share2 size={15} />
                    Share
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-indigo-400" /> Trending Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {TRENDING_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all ${activeTag === tag ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
                >
                  <Hash size={11} />{tag}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Users size={16} className="text-teal-400" /> Community Stats
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Total Posts', value: posts.length },
                { label: 'Active Members', value: '2,847' },
                { label: 'Countries Covered', value: '89' },
                { label: 'Tips Shared', value: '1,240' },
              ].map(stat => (
                <div key={stat.label} className="flex justify-between text-sm">
                  <span className="text-white/50">{stat.label}</span>
                  <span className="text-white font-medium">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* New Post Modal */}
      {showNewPost && (
        <div className="modal-overlay" onClick={() => setShowNewPost(false)}>
          <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Share Your Story</h3>
              <button onClick={() => setShowNewPost(false)} className="text-white/40 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} alt="" className="w-10 h-10 rounded-full" />
                <div className="text-sm font-medium text-white">{user?.name}</div>
              </div>
              <input type="text" value={newPost.title} onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))} className="input-field" placeholder="Title (optional)" />
              <textarea value={newPost.content} onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))} className="input-field resize-none" rows={5} placeholder="Share your travel experience, tips, or story..." autoFocus />
              <div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {newPost.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs">
                      #{tag}
                      <button onClick={() => setNewPost(p => ({ ...p, tags: p.tags.filter(t => t !== tag) }))}><X size={10} /></button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={newPost.tagInput}
                  onChange={e => setNewPost(p => ({ ...p, tagInput: e.target.value }))}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); addTag(newPost.tagInput); } }}
                  className="input-field text-sm py-2"
                  placeholder="Add tags (press Enter)"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handlePost} disabled={!newPost.content.trim()} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                  <Send size={14} /> Post Story
                </button>
                <button onClick={() => setShowNewPost(false)} className="btn-secondary px-6">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}