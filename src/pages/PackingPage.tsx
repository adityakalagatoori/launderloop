import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, Check, Package, RefreshCw,
  Shirt, FileText, Zap, Heart, Coffee, MoreHorizontal, X
} from 'lucide-react';
import { useTripStore, usePackingStore } from '../store';
import type { PackingItem } from '../types';

const CATEGORIES = [
  { name: 'Documents', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { name: 'Clothing', icon: Shirt, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { name: 'Electronics', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { name: 'Health', icon: Heart, color: 'text-red-400', bg: 'bg-red-500/10' },
  { name: 'Toiletries', icon: Coffee, color: 'text-teal-400', bg: 'bg-teal-500/10' },
  { name: 'Other', icon: Package, color: 'text-white/50', bg: 'bg-white/5' },
];

const QUICK_ITEMS: { name: string; category: string; isEssential: boolean }[] = [
  { name: 'Passport', category: 'Documents', isEssential: true },
  { name: 'Travel Insurance', category: 'Documents', isEssential: true },
  { name: 'Flight Tickets', category: 'Documents', isEssential: true },
  { name: 'Hotel Booking', category: 'Documents', isEssential: true },
  { name: 'T-Shirts (5)', category: 'Clothing', isEssential: true },
  { name: 'Jeans/Pants (2)', category: 'Clothing', isEssential: true },
  { name: 'Underwear (7)', category: 'Clothing', isEssential: true },
  { name: 'Walking Shoes', category: 'Clothing', isEssential: true },
  { name: 'Phone Charger', category: 'Electronics', isEssential: true },
  { name: 'Universal Adapter', category: 'Electronics', isEssential: true },
  { name: 'Portable Charger', category: 'Electronics', isEssential: false },
  { name: 'Camera', category: 'Electronics', isEssential: false },
  { name: 'Sunscreen SPF 50', category: 'Health', isEssential: true },
  { name: 'First Aid Kit', category: 'Health', isEssential: true },
  { name: 'Prescription Meds', category: 'Health', isEssential: true },
  { name: 'Toothbrush', category: 'Toiletries', isEssential: true },
  { name: 'Shampoo', category: 'Toiletries', isEssential: true },
];

export default function PackingPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { trips } = useTripStore();
  const { getByTrip, addList, addItem, updateItem, deleteItem, togglePacked } = usePackingStore();

  const trip = trips.find(t => t.id === tripId);
  const lists = getByTrip(tripId!);

  const [activeList, setActiveList] = useState(lists[0]?.id || null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [showAddItem, setShowAddItem] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', category: 'Other', quantity: 1, isEssential: false, notes: '' });

  const currentList = lists.find(l => l.id === activeList);

  const handleCreateList = () => {
    const list = addList(tripId!, `Packing List ${lists.length + 1}`);
    setActiveList(list.id);
  };

  const handleAddItem = () => {
    if (!newItem.name || !activeList) return;
    addItem(activeList, {
      name: newItem.name,
      category: newItem.category,
      quantity: newItem.quantity,
      isPacked: false,
      isEssential: newItem.isEssential,
      notes: newItem.notes || undefined,
    });
    setNewItem({ name: '', category: 'Other', quantity: 1, isEssential: false, notes: '' });
    setShowAddItem(false);
  };

  const handleQuickAdd = (item: typeof QUICK_ITEMS[0]) => {
    if (!activeList) return;
    const existing = currentList?.items.find(i => i.name === item.name);
    if (!existing) {
      addItem(activeList, { name: item.name, category: item.category, quantity: 1, isPacked: false, isEssential: item.isEssential });
    }
  };

  const handleResetList = () => {
    if (!currentList || !confirm('Reset all items to unpacked?')) return;
    currentList.items.forEach(item => {
      if (item.isPacked) updateItem(activeList!, item.id, { isPacked: false });
    });
  };

  const filteredItems = currentList?.items.filter(item =>
    activeCategory === 'All' || item.category === activeCategory
  ) || [];

  const totalItems = currentList?.items.length || 0;
  const packedItems = currentList?.items.filter(i => i.isPacked).length || 0;
  const essentialItems = currentList?.items.filter(i => i.isEssential && !i.isPacked).length || 0;
  const packingPct = totalItems ? Math.round((packedItems / totalItems) * 100) : 0;

  const groupedItems = CATEGORIES.reduce((acc, cat) => {
    const items = filteredItems.filter(i => i.category === cat.name);
    if (items.length > 0) acc[cat.name] = items;
    return acc;
  }, {} as Record<string, PackingItem[]>);

  // Add uncategorized items
  const otherItems = filteredItems.filter(i => !CATEGORIES.find(c => c.name === i.category));
  if (otherItems.length > 0) groupedItems['Other'] = [...(groupedItems['Other'] || []), ...otherItems];

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
          <h1 className="text-2xl font-bold text-white">Packing Checklist</h1>
        </div>
        <div className="flex gap-2">
          {currentList && (
            <button onClick={handleResetList} className="btn-secondary flex items-center gap-2 text-sm">
              <RefreshCw size={14} /> Reset
            </button>
          )}
          <button onClick={() => setShowQuickAdd(!showQuickAdd)} className="btn-secondary flex items-center gap-2 text-sm">
            <Zap size={14} /> Quick Add
          </button>
          <button onClick={() => setShowAddItem(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Item
          </button>
        </div>
      </div>

      {/* No lists */}
      {lists.length === 0 && (
        <div className="glass-card p-16 text-center">
          <Package className="w-16 h-16 text-white/10 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white/50 mb-2">No packing list yet</h3>
          <p className="text-white/30 mb-6">Create a packing list to track what you need to bring</p>
          <button onClick={handleCreateList} className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} /> Create Packing List
          </button>
        </div>
      )}

      {lists.length > 0 && (
        <>
          {/* List Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {lists.map(list => (
              <button
                key={list.id}
                onClick={() => setActiveList(list.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeList === list.id ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
              >
                {list.name}
              </button>
            ))}
            <button onClick={handleCreateList} className="flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all">
              <Plus size={14} /> New List
            </button>
          </div>

          {currentList && (
            <>
              {/* Progress */}
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-2xl font-bold text-white">{packedItems}/{totalItems}</div>
                    <div className="text-sm text-white/40">items packed</div>
                  </div>
                  <div className="text-right">
                    {essentialItems > 0 && (
                      <div className="text-sm text-amber-400 font-medium">{essentialItems} essential{essentialItems !== 1 ? 's' : ''} remaining</div>
                    )}
                    <div className="text-xs text-white/30">{packingPct}% complete</div>
                  </div>
                </div>
                <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${packingPct === 100 ? 'bg-green-500' : 'bg-indigo-500'}`}
                    style={{ width: `${packingPct}%` }}
                  />
                </div>
                {packingPct === 100 && (
                  <div className="mt-3 text-center text-green-400 text-sm font-medium">🎉 All packed! Ready to go!</div>
                )}
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setActiveCategory('All')}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeCategory === 'All' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                >
                  All ({totalItems})
                </button>
                {CATEGORIES.map(cat => {
                  const count = currentList.items.filter(i => i.category === cat.name).length;
                  if (count === 0) return null;
                  return (
                    <button
                      key={cat.name}
                      onClick={() => setActiveCategory(cat.name)}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeCategory === cat.name ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                    >
                      <cat.icon size={11} />
                      {cat.name} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Items by Category */}
              <div className="space-y-4">
                {Object.entries(groupedItems).map(([catName, items]) => {
                  const catConfig = CATEGORIES.find(c => c.name === catName);
                  const Icon = catConfig?.icon || Package;
                  const packedInCat = items.filter(i => i.isPacked).length;

                  return (
                    <div key={catName} className="glass-card overflow-hidden">
                      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8">
                        <div className={`w-8 h-8 rounded-lg ${catConfig?.bg || 'bg-white/5'} flex items-center justify-center`}>
                          <Icon size={15} className={catConfig?.color || 'text-white/50'} />
                        </div>
                        <span className="font-semibold text-white/80 text-sm">{catName}</span>
                        <span className="text-xs text-white/30 ml-auto">{packedInCat}/{items.length}</span>
                      </div>
                      <div className="divide-y divide-white/5">
                        {items.map(item => (
                          <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/3 group transition-colors">
                            <button
                              onClick={() => togglePacked(activeList!, item.id)}
                              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${item.isPacked ? 'bg-green-500 border-green-500' : 'border-white/20 hover:border-white/40'}`}
                            >
                              {item.isPacked && <Check size={12} className="text-white" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-medium ${item.isPacked ? 'line-through text-white/30' : 'text-white'}`}>
                                {item.name}
                                {item.quantity > 1 && <span className="text-white/40 ml-1">×{item.quantity}</span>}
                              </div>
                              {item.notes && <div className="text-xs text-white/30 truncate">{item.notes}</div>}
                            </div>
                            {item.isEssential && !item.isPacked && (
                              <span className="badge badge-amber text-xs flex-shrink-0">Essential</span>
                            )}
                            <button
                              onClick={() => deleteItem(activeList!, item.id)}
                              className="opacity-0 group-hover:opacity-100 btn-ghost p-1.5 text-red-400/50 hover:text-red-400 transition-all"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {filteredItems.length === 0 && (
                  <div className="glass-card p-10 text-center text-white/30 text-sm">
                    No items in this category
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* Quick Add Panel */}
      {showQuickAdd && (
        <div className="glass-card p-5 border border-indigo-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Quick Add Essentials</h3>
            <button onClick={() => setShowQuickAdd(false)} className="text-white/40 hover:text-white"><X size={16} /></button>
          </div>
          {lists.length === 0 && (
            <p className="text-sm text-white/40 mb-3">Create a list first to add items</p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {QUICK_ITEMS.map(item => {
              const alreadyAdded = currentList?.items.some(i => i.name === item.name);
              return (
                <button
                  key={item.name}
                  onClick={() => handleQuickAdd(item)}
                  disabled={alreadyAdded || !activeList}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-sm text-left transition-all ${alreadyAdded ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'}`}
                >
                  {alreadyAdded ? <Check size={12} /> : <Plus size={12} />}
                  <span className="truncate">{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItem && (
        <div className="modal-overlay" onClick={() => setShowAddItem(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-5">Add Packing Item</h3>
            {lists.length === 0 && (
              <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
                No packing list found. A new list will be created.
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/60 mb-2 block">Item Name *</label>
                <input type="text" value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))} className="input-field" placeholder="e.g. Passport" autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Category</label>
                  <select value={newItem.category} onChange={e => setNewItem(p => ({ ...p, category: e.target.value }))} className="input-field">
                    {CATEGORIES.map(c => <option key={c.name} value={c.name} className="bg-[#1c1c26]">{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Quantity</label>
                  <input type="number" value={newItem.quantity} onChange={e => setNewItem(p => ({ ...p, quantity: parseInt(e.target.value) || 1 }))} className="input-field" min="1" />
                </div>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-2 block">Notes (optional)</label>
                <input type="text" value={newItem.notes} onChange={e => setNewItem(p => ({ ...p, notes: e.target.value }))} className="input-field" placeholder="Any notes..." />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setNewItem(p => ({ ...p, isEssential: !p.isEssential }))}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${newItem.isEssential ? 'bg-amber-500 border-amber-500' : 'border-white/20'}`}
                >
                  {newItem.isEssential && <Check size={12} className="text-white" />}
                </div>
                <span className="text-sm text-white/70">Mark as essential</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    if (lists.length === 0) {
                      const list = addList(tripId!);
                      setActiveList(list.id);
                    }
                    handleAddItem();
                  }}
                  disabled={!newItem.name}
                  className="btn-primary flex-1 py-3"
                >
                  Add Item
                </button>
                <button onClick={() => setShowAddItem(false)} className="btn-secondary px-6">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}