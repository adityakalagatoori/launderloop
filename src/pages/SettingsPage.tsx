import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Globe, DollarSign, Moon, Sun, Shield, Trash2,
  ChevronRight, Check, LogOut, Monitor, Languages
} from 'lucide-react';
import { useAuthStore, useUIStore } from '../store';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'INR', 'SGD', 'AED'];
const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文' },
];
const TIMEZONES = ['America/Los_Angeles', 'America/New_York', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Kolkata', 'Asia/Dubai', 'Australia/Sydney'];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, updateSettings, logout } = useAuthStore();
  const { theme, setTheme } = useUIStore();
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const settings = user?.settings;

  const handleToggle = (key: 'emailNotifications' | 'pushNotifications' | 'twoFactorEnabled') => {
    if (!settings) return;
    updateSettings({ [key]: !settings[key] });
  };

  const handleSelect = (key: 'language' | 'currency' | 'timezone' | 'profileVisibility', value: string) => {
    updateSettings({ [key]: value } as Parameters<typeof updateSettings>[0]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-all ${enabled ? 'bg-indigo-600' : 'bg-white/20'}`}
    >
      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${enabled ? 'left-5.5 translate-x-0.5' : 'left-0.5'}`} />
    </button>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="glass-card overflow-hidden">
      <div className="px-5 py-3 border-b border-white/8">
        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">{title}</h3>
      </div>
      <div className="divide-y divide-white/5">{children}</div>
    </div>
  );

  const Row = ({ icon: Icon, label, desc, children, iconColor = 'text-white/40' }: {
    icon: React.ElementType; label: string; desc?: string; children?: React.ReactNode; iconColor?: string;
  }) => (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
        <Icon size={16} className={iconColor} />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-white">{label}</div>
        {desc && <div className="text-xs text-white/40 mt-0.5">{desc}</div>}
      </div>
      {children}
    </div>
  );

  return (
    <div className="page-container max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        {saved && (
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <Check size={14} /> Saved
          </div>
        )}
      </div>

      {/* Appearance */}
      <Section title="Appearance">
        <Row icon={theme === 'dark' ? Moon : Sun} label="Theme" desc="Choose your preferred theme" iconColor="text-indigo-400">
          <div className="flex gap-1 bg-white/5 rounded-lg p-1">
            {(['light', 'dark'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${theme === t ? 'bg-indigo-600 text-white' : 'text-white/40 hover:text-white'}`}
              >
                {t === 'dark' ? <Moon size={12} /> : <Sun size={12} />}
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </Row>
      </Section>

      {/* Localization */}
      <Section title="Localization">
        <Row icon={Languages} label="Language" iconColor="text-teal-400">
          <select
            value={settings?.language || 'en'}
            onChange={e => handleSelect('language', e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
          >
            {LANGUAGES.map(l => <option key={l.code} value={l.code} className="bg-[#1c1c26]">{l.label}</option>)}
          </select>
        </Row>
        <Row icon={DollarSign} label="Currency" iconColor="text-amber-400">
          <select
            value={settings?.currency || 'USD'}
            onChange={e => handleSelect('currency', e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
          >
            {CURRENCIES.map(c => <option key={c} value={c} className="bg-[#1c1c26]">{c}</option>)}
          </select>
        </Row>
        <Row icon={Globe} label="Timezone" iconColor="text-blue-400">
          <select
            value={settings?.timezone || 'America/Los_Angeles'}
            onChange={e => handleSelect('timezone', e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 max-w-[180px]"
          >
            {TIMEZONES.map(tz => <option key={tz} value={tz} className="bg-[#1c1c26]">{tz.replace('_', ' ')}</option>)}
          </select>
        </Row>
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        <Row icon={Bell} label="Email Notifications" desc="Receive trip reminders and updates" iconColor="text-purple-400">
          <ToggleSwitch enabled={settings?.emailNotifications ?? true} onToggle={() => handleToggle('emailNotifications')} />
        </Row>
        <Row icon={Bell} label="Push Notifications" desc="Browser push notifications" iconColor="text-pink-400">
          <ToggleSwitch enabled={settings?.pushNotifications ?? true} onToggle={() => handleToggle('pushNotifications')} />
        </Row>
      </Section>

      {/* Privacy */}
      <Section title="Privacy">
        <Row icon={Shield} label="Profile Visibility" desc="Who can see your profile" iconColor="text-green-400">
          <select
            value={settings?.profileVisibility || 'public'}
            onChange={e => handleSelect('profileVisibility', e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
          >
            {['public', 'friends', 'private'].map(v => <option key={v} value={v} className="bg-[#1c1c26]">{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
          </select>
        </Row>
        <Row icon={Shield} label="Two-Factor Authentication" desc="Add extra security to your account" iconColor="text-teal-400">
          <ToggleSwitch enabled={settings?.twoFactorEnabled ?? false} onToggle={() => handleToggle('twoFactorEnabled')} />
        </Row>
      </Section>

      {/* Account */}
      <Section title="Account">
        <Row icon={LogOut} label="Sign Out" desc="Sign out of your account" iconColor="text-white/40">
          <button onClick={handleLogout} className="btn-secondary text-sm flex items-center gap-2">
            <LogOut size={14} /> Sign Out
          </button>
        </Row>
        <Row icon={Trash2} label="Delete Account" desc="Permanently delete your account and data" iconColor="text-red-400">
          <button onClick={() => setShowDeleteConfirm(true)} className="btn-danger text-sm">
            Delete
          </button>
        </Row>
      </Section>

      {/* App Info */}
      <div className="glass-card p-5 text-center space-y-1">
        <div className="text-white/30 text-sm">TravelLoop v2.0.0</div>
        <div className="text-white/20 text-xs">Plan. Explore. Loop.</div>
      </div>

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                <Trash2 size={28} className="text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Delete Account?</h3>
              <p className="text-white/50 text-sm">This will permanently delete your account, all trips, and data. This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={() => { logout(); navigate('/login'); }} className="btn-danger flex-1">Delete Account</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}