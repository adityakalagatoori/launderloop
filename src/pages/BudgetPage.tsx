import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft, Plus, Trash2, DollarSign, TrendingUp, TrendingDown,
  AlertTriangle, PieChart, BarChart2, ShoppingBag, Utensils,
  Plane, Hotel, Activity, Heart, Music, FileText, Shield, HelpCircle
} from 'lucide-react';
import {
  PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useTripStore, useExpenseStore, useItineraryStore } from '../store';
import type { ExpenseCategory } from '../types';

const CATEGORY_CONFIG: Record<ExpenseCategory, { label: string; icon: React.ElementType; color: string }> = {
  ACCOMMODATION: { label: 'Accommodation', icon: Hotel, color: '#6366f1' },
  FOOD_DINING: { label: 'Food & Dining', icon: Utensils, color: '#f59e0b' },
  TRANSPORTATION: { label: 'Transportation', icon: Plane, color: '#14b8a6' },
  ACTIVITIES: { label: 'Activities', icon: Activity, color: '#8b5cf6' },
  SHOPPING: { label: 'Shopping', icon: ShoppingBag, color: '#ec4899' },
  HEALTH_MEDICAL: { label: 'Health', icon: Heart, color: '#ef4444' },
  ENTERTAINMENT: { label: 'Entertainment', icon: Music, color: '#f97316' },
  VISA_FEES: { label: 'Visa & Fees', icon: FileText, color: '#06b6d4' },
  INSURANCE: { label: 'Insurance', icon: Shield, color: '#10b981' },
  MISCELLANEOUS: { label: 'Miscellaneous', icon: HelpCircle, color: '#6b7280' },
};

const EXPENSE_CATEGORIES = Object.keys(CATEGORY_CONFIG) as ExpenseCategory[];

export default function BudgetPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { trips } = useTripStore();
  const { getByTrip, addExpense, deleteExpense } = useExpenseStore();
  const { getStops } = useItineraryStore();

  const trip = trips.find(t => t.id === tripId);
  const expenses = getByTrip(tripId!);
  const stops = getStops(tripId!);

  const [showAddForm, setShowAddForm] = useState(false);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const [newExpense, setNewExpense] = useState({
    category: 'FOOD_DINING' as ExpenseCategory,
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
  });

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const totalBudget = trip?.totalBudget || 0;
  const remaining = totalBudget - totalSpent;
  const budgetPct = totalBudget ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const duration = trip ? Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000) : 1;
  const avgPerDay = totalSpent / Math.max(duration, 1);

  // Category breakdown
  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryTotals).map(([cat, amount]) => ({
    name: CATEGORY_CONFIG[cat as ExpenseCategory]?.label || cat,
    value: amount,
    color: CATEGORY_CONFIG[cat as ExpenseCategory]?.color || '#6b7280',
  }));

  // Daily spending
  const dailySpending = expenses.reduce((acc, e) => {
    const day = e.date.split('T')[0];
    acc[day] = (acc[day] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.entries(dailySpending)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({
      date: format(new Date(date), 'MMM d'),
      amount,
    }));

  // Itinerary cost estimate
  const itineraryCost = stops.reduce((s, stop) => {
    const transport = stop.transportCost || 0;
    const accommodation = stop.accommodationCost || 0;
    const activities = stop.activities.reduce((as, a) => as + (a.cost || 0), 0);
    return s + transport + accommodation + activities;
  }, 0);

  const handleAddExpense = () => {
    if (!newExpense.amount || !newExpense.description) return;
    addExpense({
      tripId: tripId!,
      userId: 'user-1',
      category: newExpense.category,
      amount: parseFloat(newExpense.amount),
      currency: trip?.currency || 'USD',
      description: newExpense.description,
      date: newExpense.date,
      location: newExpense.location || undefined,
      isShared: false,
    });
    setShowAddForm(false);
    setNewExpense({ category: 'FOOD_DINING', amount: '', description: '', date: new Date().toISOString().split('T')[0], location: '' });
  };

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
          <h1 className="text-2xl font-bold text-white">Budget & Costs</h1>
        </div>
        <button onClick={() => setShowAddForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: 'Total Budget', value: totalBudget ? `$${totalBudget.toLocaleString()}` : 'Not set', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { icon: TrendingUp, label: 'Total Spent', value: `$${totalSpent.toLocaleString()}`, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { icon: remaining >= 0 ? TrendingDown : AlertTriangle, label: remaining >= 0 ? 'Remaining' : 'Over Budget', value: `$${Math.abs(remaining).toLocaleString()}`, color: remaining >= 0 ? 'text-green-400' : 'text-red-400', bg: remaining >= 0 ? 'bg-green-500/10' : 'bg-red-500/10' },
          { icon: BarChart2, label: 'Avg / Day', value: `$${avgPerDay.toFixed(0)}`, color: 'text-teal-400', bg: 'bg-teal-500/10' },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-4">
            <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={stat.color} size={18} />
            </div>
            <div className="text-xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-white/40 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Budget Progress */}
      {totalBudget > 0 && (
        <div className="glass-card p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-white">Budget Usage</h3>
            <span className={`text-sm font-bold ${budgetPct > 90 ? 'text-red-400' : budgetPct > 70 ? 'text-amber-400' : 'text-green-400'}`}>{budgetPct}%</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${budgetPct > 90 ? 'bg-red-500' : budgetPct > 70 ? 'bg-amber-500' : 'bg-indigo-500'}`}
              style={{ width: `${Math.min(budgetPct, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/40 mt-2">
            <span>${totalSpent.toLocaleString()} spent</span>
            <span>${totalBudget.toLocaleString()} total</span>
          </div>
          {budgetPct > 90 && (
            <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertTriangle size={14} className="text-red-400" />
              <span className="text-sm text-red-300">You're close to your budget limit!</span>
            </div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Charts */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Spending Breakdown</h3>
            <div className="flex gap-1 bg-white/5 rounded-lg p-1">
              <button onClick={() => setChartType('pie')} className={`p-1.5 rounded-md text-xs transition-all ${chartType === 'pie' ? 'bg-indigo-600 text-white' : 'text-white/40'}`}>
                <PieChart size={14} />
              </button>
              <button onClick={() => setChartType('bar')} className={`p-1.5 rounded-md text-xs transition-all ${chartType === 'bar' ? 'bg-indigo-600 text-white' : 'text-white/40'}`}>
                <BarChart2 size={14} />
              </button>
            </div>
          </div>

          {expenses.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-white/30 text-sm">No expenses yet</div>
          ) : chartType === 'pie' ? (
            <ResponsiveContainer width="100%" height={220}>
              <RechartsPie>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`$${v.toFixed(0)}`, '']} contentStyle={{ background: '#1c1c26', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>{v}</span>} />
              </RechartsPie>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => [`$${v.toFixed(0)}`, 'Spent']} contentStyle={{ background: '#1c1c26', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-4">By Category</h3>
          <div className="space-y-3">
            {Object.entries(categoryTotals).sort(([, a], [, b]) => b - a).map(([cat, amount]) => {
              const config = CATEGORY_CONFIG[cat as ExpenseCategory];
              const Icon = config?.icon || HelpCircle;
              const pct = totalSpent ? Math.round((amount / totalSpent) * 100) : 0;
              return (
                <div key={cat}>
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${config?.color}20` }}>
                      <Icon size={14} style={{ color: config?.color }} />
                    </div>
                    <span className="text-sm text-white/70 flex-1">{config?.label || cat}</span>
                    <span className="text-sm font-medium text-white">${amount.toLocaleString()}</span>
                    <span className="text-xs text-white/40 w-8 text-right">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden ml-10">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: config?.color }} />
                  </div>
                </div>
              );
            })}
            {Object.keys(categoryTotals).length === 0 && (
              <div className="text-center py-8 text-white/30 text-sm">No expenses recorded yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Itinerary Cost Estimate */}
      {itineraryCost > 0 && (
        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-4">Itinerary Cost Estimate</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {stops.map(stop => {
              const transport = stop.transportCost || 0;
              const accommodation = stop.accommodationCost || 0;
              const activities = stop.activities.reduce((s, a) => s + (a.cost || 0), 0);
              const total = transport + accommodation + activities;
              return (
                <div key={stop.id} className="p-4 rounded-xl bg-white/5">
                  <div className="font-medium text-white mb-2">{stop.cityName}</div>
                  <div className="space-y-1 text-xs text-white/50">
                    {transport > 0 && <div className="flex justify-between"><span>Transport</span><span>${transport}</span></div>}
                    {accommodation > 0 && <div className="flex justify-between"><span>Stay</span><span>${accommodation}</span></div>}
                    {activities > 0 && <div className="flex justify-between"><span>Activities</span><span>${activities}</span></div>}
                  </div>
                  <div className="border-t border-white/10 mt-2 pt-2 flex justify-between text-sm font-semibold">
                    <span className="text-white/70">Total</span>
                    <span className="text-white">${total.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expense List */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">All Expenses ({expenses.length})</h3>
          <button onClick={() => setShowAddForm(true)} className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            <Plus size={14} /> Add
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="text-center py-8 text-white/30 text-sm">No expenses recorded yet</div>
        ) : (
          <div className="space-y-2">
            {expenses.map(expense => {
              const config = CATEGORY_CONFIG[expense.category];
              const Icon = config?.icon || HelpCircle;
              return (
                <div key={expense.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 group transition-colors">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${config?.color}20` }}>
                    <Icon size={16} style={{ color: config?.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{expense.description}</div>
                    <div className="text-xs text-white/40">{config?.label} · {format(new Date(expense.date), 'MMM d, yyyy')}</div>
                  </div>
                  <div className="text-sm font-semibold text-white">${expense.amount.toLocaleString()}</div>
                  <button onClick={() => deleteExpense(expense.id)} className="opacity-0 group-hover:opacity-100 btn-ghost p-1.5 text-red-400/60 hover:text-red-400 transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-5">Add Expense</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/60 mb-2 block">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {EXPENSE_CATEGORIES.map(cat => {
                    const config = CATEGORY_CONFIG[cat];
                    const Icon = config.icon;
                    return (
                      <button
                        key={cat}
                        onClick={() => setNewExpense(p => ({ ...p, category: cat }))}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm transition-all ${newExpense.category === cat ? 'border-indigo-500/40 bg-indigo-600/20 text-indigo-300' : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'}`}
                      >
                        <Icon size={14} />
                        <span className="truncate">{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-2 block">Description *</label>
                <input type="text" value={newExpense.description} onChange={e => setNewExpense(p => ({ ...p, description: e.target.value }))} className="input-field" placeholder="e.g. Dinner at local restaurant" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Amount *</label>
                  <input type="number" value={newExpense.amount} onChange={e => setNewExpense(p => ({ ...p, amount: e.target.value }))} className="input-field" placeholder="0.00" min="0" step="0.01" />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Date</label>
                  <input type="date" value={newExpense.date} onChange={e => setNewExpense(p => ({ ...p, date: e.target.value }))} className="input-field" />
                </div>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-2 block">Location (optional)</label>
                <input type="text" value={newExpense.location} onChange={e => setNewExpense(p => ({ ...p, location: e.target.value }))} className="input-field" placeholder="e.g. Paris, France" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleAddExpense} disabled={!newExpense.amount || !newExpense.description} className="btn-primary flex-1 py-3">Add Expense</button>
                <button onClick={() => setShowAddForm(false)} className="btn-secondary px-6">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}