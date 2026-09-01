import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Droplets, Mail, Lock, Loader2, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialRole === 'patient') setEmail('patient@test.com');
    else if (initialRole === 'phlebotomist') setEmail('phlebotomist@test.com');
    else if (initialRole === 'lab_admin') setEmail('labadmin@test.com');
  }, [initialRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      const dashboardMap = {
        patient: '/patient/dashboard',
        phlebotomist: '/phlebotomist/dashboard',
        lab_admin: '/lab/dashboard',
      };
      navigate(dashboardMap[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (targetEmail) => {
    setEmail(targetEmail);
    setPassword('password123');
    setError('');
    setLoading(true);
    try {
      const user = await login(targetEmail, 'password123');
      const dashboardMap = {
        patient: '/patient/dashboard',
        phlebotomist: '/phlebotomist/dashboard',
        lab_admin: '/lab/dashboard',
      };
      navigate(dashboardMap[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4 py-12">
      {/* Background decorations */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-accent-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-accent-secondary/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-purple/5 blur-3xl" />
      </div>

      <div className="animate-fade-in w-full max-w-md relative z-10 space-y-6">
        {/* Back to Home Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-accent-primary transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Landing Page & Services</span>
        </Link>

        {/* Logo */}
        <div className="flex flex-col items-center gap-2.5 text-center">
          <Link to="/" className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary shadow-glow-primary transition hover:scale-105">
            <Droplets className="h-7 w-7 text-bg-primary" />
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Sign In to Smart<span className="gradient-text">Blood</span>
          </h1>
          <p className="text-xs text-text-muted">
            Certified home blood tests & real-time phlebotomy network
          </p>
        </div>

        {/* Login Form */}
        <div className="glass-card p-7 sm:p-8">
          {error && (
            <div className="mb-4 rounded-lg border border-accent-danger/30 bg-accent-danger/10 px-4 py-3 text-xs text-accent-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-styled pl-10 text-xs sm:text-sm"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-xs font-medium text-text-secondary">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-styled pl-10 text-xs sm:text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-glow flex w-full items-center justify-center gap-2 py-3 text-xs sm:text-sm font-semibold"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-text-muted">
            Don't have an account?{' '}
            <Link
              to={initialRole ? `/register?role=${initialRole}` : '/register'}
              className="font-semibold text-accent-primary hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>

        {/* Quick Login Buttons */}
        <div className="glass-card p-5">
          <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-wider text-text-muted flex items-center justify-center gap-1.5">
            <span>⚡ 1-Click Instant Demo Login</span>
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => quickLogin('patient@test.com')}
              disabled={loading}
              className={`btn-secondary flex flex-col items-center gap-1 py-2.5 text-xs transition ${
                initialRole === 'patient' ? 'border-accent-primary text-accent-primary bg-accent-primary/10' : ''
              }`}
            >
              <span className="text-sm">🧑</span>
              <span>Patient</span>
            </button>
            <button
              onClick={() => quickLogin('phlebotomist@test.com')}
              disabled={loading}
              className={`btn-secondary flex flex-col items-center gap-1 py-2.5 text-xs transition ${
                initialRole === 'phlebotomist' ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10' : ''
              }`}
            >
              <span className="text-sm">💉</span>
              <span>Phlebotomist</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
