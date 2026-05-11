import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, Eye, EyeOff, Chrome, Facebook, Apple, ArrowRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store';

export default function LoginPage() {
  const [email, setEmail] = useState('demo@travelloop.app');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(email, password);
    if (success) navigate('/dashboard');
    else setError('Invalid credentials. Try demo@travelloop.app');
  };

  return (
    <div className="min-h-screen bg-[#0f0f13] flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-950 via-[#0f0f13] to-teal-950">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-600/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center glow-indigo">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">TravelLoop</span>
          </div>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm">
              <Sparkles size={14} />
              AI-Powered Travel Planning
            </div>
            <h1 className="text-5xl font-bold text-white leading-tight">
              Plan smarter.<br />
              <span className="text-gradient">Travel better.</span>
            </h1>
            <p className="text-white/60 text-lg leading-relaxed max-w-md">
              Your intelligent travel companion for creating unforgettable journeys. From Paris to Bali, plan every detail with AI precision.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { value: '2M+', label: 'Travelers' },
                { value: '150+', label: 'Countries' },
                { value: '4.9★', label: 'Rating' },
              ].map(stat => (
                <div key={stat.label} className="glass rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-white/50 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {['Paris', 'Tokyo', 'Bali', 'NYC', 'Barcelona'].map(city => (
              <span key={city} className="text-xs text-white/30 font-medium">{city}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">TravelLoop</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-white">Welcome back</h2>
            <p className="text-white/50 mt-2">Sign in to continue your journey</p>
          </div>

          {/* Demo hint */}
          <div className="glass rounded-xl p-3 border border-indigo-500/20 bg-indigo-500/5">
            <p className="text-xs text-indigo-300">
              <span className="font-semibold">Demo:</span> Use <code className="bg-indigo-500/20 px-1 rounded">demo@travelloop.app</code> with any password
            </p>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Chrome, label: 'Google', color: 'hover:border-red-500/30' },
              { icon: Facebook, label: 'Facebook', color: 'hover:border-blue-500/30' },
              { icon: Apple, label: 'Apple', color: 'hover:border-white/30' },
            ].map(({ icon: Icon, label, color }) => (
              <button
                key={label}
                onClick={() => login('demo@travelloop.app', 'demo').then(() => navigate('/dashboard'))}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 ${color} transition-all text-white/70 hover:text-white text-sm`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-sm">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-white/20 bg-white/5" />
                <span className="text-sm text-white/50">Remember me</span>
              </label>
              <button type="button" className="text-sm text-indigo-400 hover:text-indigo-300">
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center text-white/50 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}