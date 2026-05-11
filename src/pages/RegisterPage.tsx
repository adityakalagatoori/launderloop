import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, User, Mail, Lock, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { useAuthStore } from '../store';

const TRAVEL_STYLES = ['Solo', 'Couple', 'Family', 'Adventure', 'Luxury', 'Budget', 'Backpacker', 'Digital Nomad'];
const INTERESTS = ['Culture', 'Food', 'Nature', 'Photography', 'Adventure', 'Wellness', 'Nightlife', 'History'];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const toggleStyle = (s: string) => setSelectedStyles(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const toggleInterest = (i: string) => setSelectedInterests(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    const success = await register(name, email, password);
    if (success) navigate('/dashboard');
  };

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ['', 'bg-red-500', 'bg-amber-500', 'bg-green-500'];
  const strengthLabels = ['', 'Weak', 'Good', 'Strong'];

  return (
    <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center glow-indigo">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">TravelLoop</span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2].map(s => (
            <div key={s} className={`flex-1 h-1 rounded-full transition-all ${s <= step ? 'bg-indigo-500' : 'bg-white/10'}`} />
          ))}
        </div>

        <div className="glass-card p-8">
          {step === 1 ? (
            <>
              <h2 className="text-2xl font-bold text-white mb-2">Create your account</h2>
              <p className="text-white/50 mb-6">Join 2M+ travelers worldwide</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field pl-10" placeholder="Alex Explorer" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field pl-10" placeholder="you@example.com" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="input-field pl-10 pr-10" placeholder="••••••••" required minLength={6} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                          <div key={i} className={`flex-1 h-1 rounded-full ${i <= strength ? strengthColors[strength] : 'bg-white/10'}`} />
                        ))}
                      </div>
                      <p className="text-xs text-white/40">{strengthLabels[strength]} password</p>
                    </div>
                  )}
                </div>

                <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                  Continue <ArrowRight size={16} />
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-white mb-2">Your travel style</h2>
              <p className="text-white/50 mb-6">Help us personalize your experience</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-3">Travel Style (select all that apply)</label>
                  <div className="flex flex-wrap gap-2">
                    {TRAVEL_STYLES.map(s => (
                      <button
                        key={s}
                        onClick={() => toggleStyle(s)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedStyles.includes(s) ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                      >
                        {selectedStyles.includes(s) && <Check size={12} className="inline mr-1" />}
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-3">Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS.map(i => (
                      <button
                        key={i}
                        onClick={() => toggleInterest(i)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedInterests.includes(i) ? 'bg-teal-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                      >
                        {selectedInterests.includes(i) && <Check size={12} className="inline mr-1" />}
                        {i}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                >
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create Account <ArrowRight size={16} /></>}
                </button>

                <button onClick={() => setStep(1)} className="w-full text-center text-sm text-white/40 hover:text-white/60">
                  ← Back
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-white/50 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}