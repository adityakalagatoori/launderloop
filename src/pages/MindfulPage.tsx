import { useState } from 'react';
import { Brain, Leaf, Timer, Trophy, Zap, Moon, Sun, Wind, Heart, Star } from 'lucide-react';
import { useAuthStore } from '../store';

const MINDFUL_ACTIVITIES = [
  { id: 1, title: 'Phone-Free Sunrise', desc: 'Watch the sunrise without your phone for 30 minutes', points: 50, duration: 30, icon: Sun, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { id: 2, title: 'Mindful Walk', desc: 'Take a 20-minute walk observing your surroundings', points: 30, duration: 20, icon: Wind, color: 'text-teal-400', bg: 'bg-teal-500/10' },
  { id: 3, title: 'Journaling Session', desc: 'Write about your travel experiences for 15 minutes', points: 25, duration: 15, icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { id: 4, title: 'Digital Detox Hour', desc: 'One hour completely offline exploring your destination', points: 100, duration: 60, icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { id: 5, title: 'Local Connection', desc: 'Have a meaningful conversation with a local', points: 75, duration: 0, icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  { id: 6, title: 'Nature Immersion', desc: 'Spend 45 minutes in nature without devices', points: 60, duration: 45, icon: Leaf, color: 'text-green-400', bg: 'bg-green-500/10' },
];

export default function MindfulPage() {
  const { user, updateUser } = useAuthStore();
  const [activeTimer, setActiveTimer] = useState<number | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [completedActivities, setCompletedActivities] = useState<Set<number>>(new Set());
  const [timerInterval, setTimerInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  const totalPoints = user?.mindfulPoints || 0;
  const level = Math.floor(totalPoints / 200) + 1;
  const nextLevelPoints = level * 200;
  const progressPct = Math.round(((totalPoints % 200) / 200) * 100);

  const startTimer = (activityId: number, duration: number) => {
    if (timerInterval) clearInterval(timerInterval);
    setActiveTimer(activityId);
    setTimerSeconds(duration * 60);
    const interval = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setTimerInterval(interval);
  };

  const completeActivity = (activity: typeof MINDFUL_ACTIVITIES[0]) => {
    if (completedActivities.has(activity.id)) return;
    setCompletedActivities(prev => new Set([...prev, activity.id]));
    updateUser({ mindfulPoints: (user?.mindfulPoints || 0) + activity.points });
    if (timerInterval) clearInterval(timerInterval);
    setActiveTimer(null);
    setTimerSeconds(0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Brain className="text-purple-400" size={24} /> Mindful Explorer
        </h1>
        <p className="text-white/50 mt-1">Earn points by being present and disconnecting</p>
      </div>

      {/* Level Card */}
      <div className="glass-card p-6 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-white/50">Mindful Level</div>
            <div className="text-3xl font-bold text-white">Level {level}</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-400">{totalPoints.toLocaleString()}</div>
            <div className="text-xs text-white/40">mindful points</div>
          </div>
        </div>
        <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="flex justify-between text-xs text-white/30 mt-1.5">
          <span>{totalPoints % 200} / 200 pts to Level {level + 1}</span>
          <span>{progressPct}%</span>
        </div>
      </div>

      {/* Active Timer */}
      {activeTimer !== null && (
        <div className="glass-card p-6 text-center border border-indigo-500/20">
          <div className="text-5xl font-bold text-white mb-2 font-mono">{formatTime(timerSeconds)}</div>
          <div className="text-white/50 text-sm mb-4">
            {MINDFUL_ACTIVITIES.find(a => a.id === activeTimer)?.title}
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => completeActivity(MINDFUL_ACTIVITIES.find(a => a.id === activeTimer)!)}
              className="btn-primary flex items-center gap-2"
            >
              <Trophy size={16} /> Complete & Earn Points
            </button>
            <button onClick={() => { if (timerInterval) clearInterval(timerInterval); setActiveTimer(null); }} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Activities */}
      <div>
        <h2 className="section-title">Mindful Activities</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MINDFUL_ACTIVITIES.map(activity => {
            const Icon = activity.icon;
            const isCompleted = completedActivities.has(activity.id);
            const isActive = activeTimer === activity.id;
            return (
              <div key={activity.id} className={`glass-card p-5 space-y-3 transition-all ${isCompleted ? 'opacity-60' : ''} ${isActive ? 'border border-indigo-500/30' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl ${activity.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={activity.color} size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{activity.title}</h3>
                    <p className="text-xs text-white/40 mt-0.5">{activity.desc}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-white/40">
                    {activity.duration > 0 && <span className="flex items-center gap-1"><Timer size={10} />{activity.duration}min</span>}
                  </div>
                  <span className="text-purple-400 font-semibold">+{activity.points} pts</span>
                </div>
                {isCompleted ? (
                  <div className="w-full py-2 rounded-xl bg-green-500/20 text-green-400 text-xs font-medium text-center border border-green-500/20">
                    ✓ Completed
                  </div>
                ) : isActive ? (
                  <button onClick={() => completeActivity(activity)} className="w-full py-2 rounded-xl bg-indigo-600/30 text-indigo-300 text-xs font-medium border border-indigo-500/30 hover:bg-indigo-600/40 transition-all">
                    Mark Complete
                  </button>
                ) : (
                  <button
                    onClick={() => activity.duration > 0 ? startTimer(activity.id, activity.duration) : completeActivity(activity)}
                    className="w-full py-2 rounded-xl bg-white/5 text-white/60 text-xs font-medium border border-white/10 hover:bg-white/10 transition-all"
                  >
                    {activity.duration > 0 ? 'Start Timer' : 'Mark Complete'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tips */}
      <div className="glass-card p-5">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Star size={16} className="text-amber-400" /> Mindful Travel Tips</h3>
        <div className="space-y-2">
          {[
            'Put your phone away during meals and truly taste the local cuisine',
            'Wake up early to experience destinations before the crowds arrive',
            'Talk to locals without looking up reviews first – trust your instincts',
            'Spend at least one hour per day without any digital devices',
            'Write in a journal instead of posting on social media',
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-white/60">
              <span className="text-indigo-400 mt-0.5">•</span>
              {tip}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}