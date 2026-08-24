import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowLeft, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Button, Logo } from '@lina/ui';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientUrl = import.meta.env.VITE_CLIENT_URL || 'https://linarestaurantandbar.com.ng';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        email: email.trim(),
        password,
      });

      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
        navigate('/', { replace: true });
      } else {
        setError(res.data.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Invalid email or password. Please check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between items-center p-6 sm:p-8">
      {/* Top Header Row */}
      <div className="w-full max-w-md flex items-center justify-between">
        <a
          href={clientUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Return to Guest Menu</span>
        </a>


      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md my-auto py-8 space-y-6">
        {/* Brand Crest */}
        <div className="text-center space-y-2.5">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
          <h1 className="font-serif font-bold text-2xl text-on-surface">
            Staff & Management Portal
          </h1>
          <p className="text-xs text-on-surface-variant max-w-xs mx-auto leading-relaxed">
            Authorized restaurant management and kitchen operations sign in.
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 sm:p-8 shadow-card space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-error-container text-on-error-container text-xs rounded-xl border border-error/20">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@linarestaurant.com"
                  autoComplete="email"
                  required
                  disabled={loading}
                  className="w-full bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/50 text-xs sm:text-sm rounded-xl pl-10 pr-4 py-2.5 border border-outline-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  className="w-full bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/50 text-xs sm:text-sm rounded-xl pl-10 pr-10 py-2.5 border border-outline-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1 transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="gold"
                size="lg"
                loading={loading}
                className="w-full justify-center text-sm font-semibold"
              >
                <span>Sign In to Dashboard</span>
              </Button>
            </div>
          </form>
        </div>


      </div>

      {/* Bottom Footer */}
      <div className="text-[11px] text-on-surface-variant/60 text-center">
        © {new Date().getFullYear()} Lina Restaurant, Bar And Street Food
      </div>
    </div>
  );
};
