import { useState } from 'react';
import { Shield, AlertTriangle, MapPin, Phone, Heart, Info, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { SEED_SAFETY_ALERTS, SEED_SCAM_REPORTS } from '../data/seed';

const EMERGENCY_NUMBERS: Record<string, { police: string; ambulance: string; fire: string }> = {
  France: { police: '17', ambulance: '15', fire: '18' },
  Spain: { police: '091', ambulance: '061', fire: '080' },
  Japan: { police: '110', ambulance: '119', fire: '119' },
  Indonesia: { police: '110', ambulance: '118', fire: '113' },
  USA: { police: '911', ambulance: '911', fire: '911' },
  UAE: { police: '999', ambulance: '998', fire: '997' },
  India: { police: '100', ambulance: '108', fire: '101' },
};

const SEVERITY_CONFIG = {
  LOW: { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', badge: 'badge-green' },
  MEDIUM: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', badge: 'badge-amber' },
  HIGH: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', badge: 'badge-red' },
  CRITICAL: { color: 'text-red-600', bg: 'bg-red-600/10', border: 'border-red-600/20', badge: 'badge-red' },
};

export default function TripSafePage() {
  const [search, setSearch] = useState('');
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'alerts' | 'scams' | 'emergency'>('alerts');

  const filteredAlerts = SEED_SAFETY_ALERTS.filter(a =>
    a.cityName?.toLowerCase().includes(search.toLowerCase()) ||
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  const filteredScams = SEED_SCAM_REPORTS.filter(s =>
    s.cityName.toLowerCase().includes(search.toLowerCase()) ||
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="text-green-400" size={24} /> TripSafe Shield
        </h1>
        <p className="text-white/50 mt-1">Stay informed and safe during your travels</p>
      </div>

      {/* Safety Score Banner */}
      <div className="glass-card p-5 bg-gradient-to-r from-green-900/20 to-teal-900/20 border border-green-500/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center">
            <Shield size={32} className="text-green-400" />
          </div>
          <div>
            <div className="text-lg font-bold text-white">Your Safety Status</div>
            <div className="text-sm text-white/60 mt-0.5">Stay aware of {SEED_SAFETY_ALERTS.filter(a => a.isActive).length} active alerts in your destinations</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-3xl font-bold text-green-400">7.8</div>
            <div className="text-xs text-white/40">avg safety score</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={15} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by city or alert type..." className="input-field pl-9 py-2 text-sm" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1">
        {[
          { id: 'alerts', label: 'Safety Alerts', count: SEED_SAFETY_ALERTS.length },
          { id: 'scams', label: 'Scam Reports', count: SEED_SCAM_REPORTS.length },
          { id: 'emergency', label: 'Emergency', count: null },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-white/50 hover:text-white'}`}
          >
            {tab.label}
            {tab.count !== null && <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20' : 'bg-white/10'}`}>{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Safety Alerts */}
      {activeTab === 'alerts' && (
        <div className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="glass-card p-10 text-center text-white/30">No alerts found</div>
          ) : filteredAlerts.map(alert => {
            const config = SEVERITY_CONFIG[alert.severity];
            const isExpanded = expandedAlert === alert.id;
            return (
              <div key={alert.id} className={`glass-card overflow-hidden border ${config.border}`}>
                <div
                  className="flex items-start gap-4 p-4 cursor-pointer hover:bg-white/3 transition-colors"
                  onClick={() => setExpandedAlert(isExpanded ? null : alert.id)}
                >
                  <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <AlertTriangle className={config.color} size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-white text-sm">{alert.title}</h3>
                      <span className={`badge text-xs flex-shrink-0 ${config.badge}`}>{alert.severity}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-white/40">
                      {alert.cityName && <span className="flex items-center gap-1"><MapPin size={10} />{alert.cityName}</span>}
                      <span className="capitalize">{alert.category.replace('_', ' ')}</span>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={16} className="text-white/30 flex-shrink-0" /> : <ChevronDown size={16} className="text-white/30 flex-shrink-0" />}
                </div>
                {isExpanded && (
                  <div className={`px-4 pb-4 pt-0 border-t border-white/8`}>
                    <p className="text-sm text-white/60 leading-relaxed mt-3">{alert.description}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Scam Reports */}
      {activeTab === 'scams' && (
        <div className="space-y-3">
          {filteredScams.length === 0 ? (
            <div className="glass-card p-10 text-center text-white/30">No scam reports found</div>
          ) : filteredScams.map(scam => (
            <div key={scam.id} className="glass-card p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <Info size={18} className="text-red-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-white text-sm">{scam.title}</h3>
                    {scam.isVerified && <span className="badge badge-green text-xs flex-shrink-0">Verified</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-white/40">
                    <span className="flex items-center gap-1"><MapPin size={10} />{scam.cityName}</span>
                    <span>{scam.reportCount} reports</span>
                    <span className="capitalize">{scam.scamType.replace('_', ' ')}</span>
                  </div>
                  <p className="text-sm text-white/60 mt-2 leading-relaxed">{scam.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Emergency Numbers */}
      {activeTab === 'emergency' && (
        <div className="space-y-4">
          <div className="glass-card p-4 border border-red-500/20 bg-red-500/5">
            <div className="flex items-center gap-2 text-red-400 font-semibold mb-2">
              <Phone size={16} /> In case of emergency
            </div>
            <p className="text-sm text-white/60">Always save local emergency numbers before traveling. These numbers are for reference only.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {Object.entries(EMERGENCY_NUMBERS).map(([country, numbers]) => (
              <div key={country} className="glass-card p-4">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <MapPin size={14} className="text-indigo-400" />{country}
                </h3>
                <div className="space-y-2">
                  {[
                    { label: 'Police', number: numbers.police, color: 'text-blue-400' },
                    { label: 'Ambulance', number: numbers.ambulance, color: 'text-red-400' },
                    { label: 'Fire', number: numbers.fire, color: 'text-orange-400' },
                  ].map(service => (
                    <div key={service.label} className="flex items-center justify-between">
                      <span className="text-sm text-white/50">{service.label}</span>
                      <span className={`font-bold text-lg ${service.color}`}>{service.number}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* General Safety Tips */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Heart size={16} className="text-red-400" /> General Safety Tips</h3>
            <div className="space-y-2">
              {[
                'Always share your itinerary with someone you trust',
                'Keep digital and physical copies of important documents',
                'Register with your country\'s embassy when traveling abroad',
                'Purchase comprehensive travel insurance before departure',
                'Keep emergency cash in a separate location from your wallet',
                'Research local laws and customs before visiting',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-white/60">
                  <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}