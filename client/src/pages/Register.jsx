import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Droplets,
  Mail,
  Lock,
  User,
  Loader2,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Syringe,
  FlaskConical,
} from 'lucide-react';

export default function Register() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'patient';

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: initialRole,
    age: '',
    gender: 'male',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('role')) {
      setForm((prev) => ({ ...prev, role: searchParams.get('role') }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        age: form.role === 'patient' ? Number(form.age) : undefined,
        gender: form.role === 'patient' ? form.gender : undefined,
        location: {
          coordinates: [0, 0],
        },
      });
      const dashboardMap = {
        patient: '/patient/dashboard',
        phlebotomist: '/phlebotomist/dashboard',
        lab_admin: '/lab/dashboard',
      };
      navigate(dashboardMap[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
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
            Join Smart<span className="gradient-text">Blood</span>
          </h1>
          <p className="text-xs text-text-muted">
            Create an account to book tests or join as a certified phlebotomist
          </p>
        </div>

        {/* Register Form */}
        <div className="glass-card p-7 sm:p-8">
          {error && (
            <div className="mb-4 rounded-lg border border-accent-danger/30 bg-accent-danger/10 px-4 py-3 text-xs text-accent-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="input-styled pl-12 text-xs sm:text-sm"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="input-styled pl-12 text-xs sm:text-sm"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="input-styled pl-12 text-xs sm:text-sm"
                  placeholder="Min. 6 characters"
                  minLength={6}
                  required
                />
              </div>
            </div>

            {form.role === 'patient' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={form.age}
                    onChange={handleChange}
                    className="input-styled text-xs sm:text-sm pl-4"
                    placeholder="Years"
                    min="1"
                    max="120"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="input-styled text-xs sm:text-sm"
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                Select Your Role
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="input-styled text-xs sm:text-sm"
              >
                <option value="patient">🧑 Patient (Home Blood Test Bookings)</option>
                <option value="phlebotomist">💉 Phlebotomist (Sample Collection Gigs)</option>
              </select>
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
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-text-muted">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-accent-primary hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
