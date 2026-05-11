import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, Map, Compass, Users, MessageSquare, User, Settings,
  Shield, Leaf, Brain, ChevronLeft, ChevronRight, LogOut, Bell,
  Search, Plane, BookOpen, Package, DollarSign, Globe, Star,
  BarChart3, Menu, X, Zap
} from 'lucide-react';
import { useAuthStore, useUIStore } from '../store';
import clsx from 'clsx';

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/trips', icon: Plane, label: 'My Trips' },
    ],
  },
  {
    label: 'Discover',
    items: [
      { to: '/cities', icon: Globe, label: 'Cities' },
      { to: '/activities', icon: Compass, label: 'Activities' },
      { to: '/templates', icon: Star, label: 'Templates' },
    ],
  },
  {
    label: 'Community',
    items: [
      { to: '/community', icon: MessageSquare, label: 'Community' },
      { to: '/buddies', icon: Users, label: 'Travel Buddies' },
    ],
  },
  {
    label: 'Features',
    items: [
      { to: '/mindful', icon: Brain, label: 'Mindful Explorer' },
      { to: '/tripsafe', icon: Shield, label: 'TripSafe Shield' },
      { to: '/carbon', icon: Leaf, label: 'Carbon Tracker' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/profile', icon: User, label: 'Profile' },
      { to: '/settings', icon: Settings, label: 'Settings' },
      { to: '/admin', icon: BarChart3, label: 'Admin' },
    ],
  },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications] = useState(3);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={clsx('flex items-center gap-3 px-4 py-5 border-b border-white/8', !sidebarOpen && 'justify-center')}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center flex-shrink-0 glow-indigo">
          <Zap className="w-5 h-5 text-white" />
        </div>
        {sidebarOpen && (
          <div>
            <div className="font-bold text-white text-base leading-tight">TravelLoop</div>
            <div className="text-xs text-white/40">Plan. Explore. Loop.</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {NAV_SECTIONS.map(section => (
          <div key={section.label}>
            {sidebarOpen && (
              <div className="px-3 mb-2 text-xs font-semibold text-white/30 uppercase tracking-wider">
                {section.label}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium',
                      !sidebarOpen && 'justify-center',
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/20'
                        : 'text-white/50 hover:text-white hover:bg-white/8'
                    )
                  }
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <item.icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
                  {sidebarOpen && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="border-t border-white/8 p-3">
        {sidebarOpen ? (
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 cursor-pointer group">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
              alt={user?.name}
              className="w-8 h-8 rounded-full border border-white/20"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{user?.name}</div>
              <div className="text-xs text-white/40 truncate">{user?.email}</div>
            </div>
            <button onClick={handleLogout} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-400 text-white/40">
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button onClick={handleLogout} className="w-full flex justify-center p-2 text-white/40 hover:text-red-400 transition-colors" title="Logout">
            <LogOut size={16} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f0f13]">
      {/* Desktop Sidebar */}
      <aside className={clsx(
        'hidden lg:flex flex-col flex-shrink-0 border-r border-white/8 bg-[#13131a] transition-all duration-300',
        sidebarOpen ? 'w-60' : 'w-16'
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-[#13131a] border-r border-white/8 flex flex-col z-10">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center gap-4 px-4 sm:px-6 py-3 border-b border-white/8 bg-[#13131a]/80 backdrop-blur-xl flex-shrink-0">
          {/* Mobile menu */}
          <button onClick={() => setMobileOpen(true)} className="lg:hidden btn-ghost p-2">
            <Menu size={20} />
          </button>

          {/* Desktop sidebar toggle */}
          <button onClick={toggleSidebar} className="hidden lg:flex btn-ghost p-2" title="Toggle sidebar">
            {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              <input
                type="text"
                placeholder="Search trips, cities, activities..."
                className="w-full bg-white/5 border border-white/8 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Notifications */}
            <button className="relative btn-ghost p-2">
              <Bell size={18} />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                  {notifications}
                </span>
              )}
            </button>

            {/* Quick new trip */}
            <NavLink to="/trips/new" className="hidden sm:flex btn-primary text-sm gap-2 items-center">
              <Plane size={14} />
              New Trip
            </NavLink>

            {/* Avatar */}
            <NavLink to="/profile">
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                alt={user?.name}
                className="w-8 h-8 rounded-full border border-white/20 hover:border-indigo-500/50 transition-colors"
              />
            </NavLink>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}