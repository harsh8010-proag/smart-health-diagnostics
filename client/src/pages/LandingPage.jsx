import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Droplets,
  Syringe,
  User,
  FlaskConical,
  Activity,
  CheckCircle2,
  Clock,
  ShieldCheck,
  MapPin,
  Search,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  PhoneCall,
  FileText,
  Thermometer,
  QrCode,
  IndianRupee,
  Navigation,
  Award,
  Zap,
  Lock,
  Mail,
  Loader2,
  X,
  Menu,
  HeartPulse,
} from 'lucide-react';

const FALLBACK_TESTS = [
  {
    _id: '1',
    testName: 'Complete Blood Count (CBC)',
    price: 350,
    fastingHours: 0,
    sampleType: 'EDTA (Purple Top)',
    category: 'Hematology',
    description: 'Comprehensive analysis of RBCs, WBCs, hemoglobin, hematocrit, and platelet count for overall wellness & infection detection.',
    turnaround: 'Same-day (4-6 hrs)',
  },
  {
    _id: '2',
    testName: 'Lipid Profile (Cholesterol Panel)',
    price: 600,
    fastingHours: 12,
    sampleType: 'Serum (Gold Top)',
    category: 'Cardiology',
    description: 'Evaluates Total Cholesterol, HDL, LDL, VLDL, and Triglycerides to calculate cardiovascular health and stroke risk.',
    turnaround: 'Same-day (6-8 hrs)',
  },
  {
    _id: '3',
    testName: 'HbA1c (Glycated Hemoglobin)',
    price: 500,
    fastingHours: 0,
    sampleType: 'EDTA (Purple Top)',
    category: 'Diabetes',
    description: 'Gold standard measure of 3-month average blood glucose control for diabetic screening and ongoing management.',
    turnaround: 'Same-day (4-6 hrs)',
  },
  {
    _id: '4',
    testName: 'Thyroid Profile (T3, T4, TSH)',
    price: 800,
    fastingHours: 0,
    sampleType: 'Serum (Gold Top)',
    category: 'Endocrinology',
    description: 'Comprehensive thyroid hormone panel assessing metabolism, energy levels, hypothyroidism, and hyperthyroidism.',
    turnaround: 'Same-day (6-8 hrs)',
  },
  {
    _id: '5',
    testName: 'Liver Function Test (LFT)',
    price: 700,
    fastingHours: 10,
    sampleType: 'Serum (Gold Top)',
    category: 'Organ Panels',
    description: 'Assesses liver enzyme levels including Bilirubin, SGOT/AST, SGPT/ALT, Alkaline Phosphatase, and Protein ratio.',
    turnaround: 'Same-day (6-8 hrs)',
  },
  {
    _id: '6',
    testName: 'Kidney Function Test (KFT / RFT)',
    price: 650,
    fastingHours: 8,
    sampleType: 'Serum (Gold Top)',
    category: 'Organ Panels',
    description: 'Measures blood urea nitrogen (BUN), serum creatinine, uric acid, and key electrolytes to detect renal impairment.',
    turnaround: 'Same-day (6-8 hrs)',
  },
  {
    _id: '7',
    testName: 'Vitamin D (25-Hydroxy)',
    price: 1200,
    fastingHours: 0,
    sampleType: 'Serum (Gold Top)',
    category: 'Vitamins & Wellness',
    description: 'Vital diagnostic for bone mineral density, immunity support, muscle strength, and fatigue evaluation.',
    turnaround: 'Next-day (12-24 hrs)',
  },
  {
    _id: '8',
    testName: 'Vitamin B12 & Iron Profile',
    price: 1450,
    fastingHours: 10,
    sampleType: 'Serum (Gold Top)',
    category: 'Vitamins & Wellness',
    description: 'Checks serum ferritin, transferrin, and active B12 levels for neurological health and chronic anemia diagnosis.',
    turnaround: 'Next-day (12-24 hrs)',
  },
];

const FAQS = [
  {
    q: 'How does doorstep blood sample collection work?',
    a: 'Once you select your blood test on SmartBlood, a certified, background-checked phlebotomist near you is dispatched in real-time. You can track their live GPS location on the map. They arrive with sterile, barcode-sealed vacuum tubes, safely collect the sample, and immediately transport it in a temperature-controlled container to a NABL-certified lab.',
  },
  {
    q: 'Do I need to fast before my blood test?',
    a: 'Fasting requirements depend on the specific test. For example, a Lipid Profile or Fasting Blood Sugar requires 8 to 12 hours of overnight fasting (water is permitted). Complete Blood Count (CBC) and HbA1c require no fasting at all. Each test card clearly displays the exact fasting hours required.',
  },
  {
    q: 'How do phlebotomists benefit by joining SmartBlood?',
    a: 'Phlebotomists receive real-time nearby sample collection gig requests with upfront pricing and route navigation. With our intelligent route optimization, you spend less time travelling and earn industry-leading payouts with instant digital earnings verification.',
  },
  {
    q: 'How quickly will I receive my diagnostic report?',
    a: 'Most standard tests (such as CBC, HbA1c, Lipid, LFT, KFT) are processed within 4 to 8 hours of sample receipt at the lab. As soon as the certified lab pathologist signs off, your digital report is instantly available in your dashboard, and you receive an alert notification.',
  },
  {
    q: 'Are the partner pathology laboratories certified?',
    a: 'Yes, 100% of samples are processed in ISO 15189 and NABL-accredited diagnostic centers. All test results are validated by registered MD Pathologists and include verified digital signatures.',
  },
  {
    q: 'How is sample safety and integrity guaranteed during transport?',
    a: 'Every sample is immediately labeled with a unique tamper-evident digital barcode scanned at your doorstep. Samples are stored inside calibrated cold-chain carriers (2°C - 8°C) with real-time temperature tracking to prevent sample degradation.',
  },
];

export default function LandingPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [tests, setTests] = useState(FALLBACK_TESTS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [journeyTab, setJourneyTab] = useState('patient'); // 'patient' or 'phlebotomist'
  const [openFaq, setOpenFaq] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authRole, setAuthRole] = useState('patient'); // 'patient' | 'phlebotomist' | 'lab_admin'
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [selectedServiceIntent, setSelectedServiceIntent] = useState(null);

  // Fetch tests from API or use fallback
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await api.get('/tests');
        if (res.data && res.data.length > 0) {
          setTests(res.data);
        }
      } catch (err) {
        console.log('Using default test catalog data');
      }
    };
    fetchCatalog();
  }, []);

  const categories = ['All', 'Hematology', 'Cardiology', 'Diabetes', 'Organ Panels', 'Vitamins & Wellness', 'Endocrinology'];

  const filteredTests = tests.filter((test) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      test.category?.toLowerCase() === selectedCategory.toLowerCase() ||
      (selectedCategory === 'Organ Panels' && (test.category === 'Hepatology' || test.category === 'Nephrology')) ||
      (selectedCategory === 'Cardiology' && test.category === 'Cardiology') ||
      (selectedCategory === 'Vitamins & Wellness' && test.category === 'Nutrition');

    const matchesSearch =
      test.testName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.category?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleOpenAuth = (role = 'patient', serviceName = null) => {
    if (user) {
      const dashboardMap = {
        patient: '/patient/dashboard',
        phlebotomist: '/phlebotomist/dashboard',
        lab_admin: '/lab/dashboard',
      };
      navigate(dashboardMap[user.role] || '/');
      return;
    }
    setAuthRole(role);
    setSelectedServiceIntent(serviceName);
    setIsAuthModalOpen(true);
  };

  const handleQuickLogin = async (email, role) => {
    setLoginLoading(true);
    setLoginError('');
    try {
      const loggedUser = await login(email, 'password123');
      setIsAuthModalOpen(false);
      const dashboardMap = {
        patient: '/patient/dashboard',
        phlebotomist: '/phlebotomist/dashboard',
        lab_admin: '/lab/dashboard',
      };
      navigate(dashboardMap[loggedUser.role] || '/');
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const loggedUser = await login(loginEmail, loginPassword);
      setIsAuthModalOpen(false);
      const dashboardMap = {
        patient: '/patient/dashboard',
        phlebotomist: '/phlebotomist/dashboard',
        lab_admin: '/lab/dashboard',
      };
      navigate(dashboardMap[loggedUser.role] || '/');
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const dashboardPath = user
    ? user.role === 'phlebotomist'
      ? '/phlebotomist/dashboard'
      : user.role === 'lab_admin'
      ? '/lab/dashboard'
      : '/patient/dashboard'
    : '/login';

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      {/* Dynamic Background Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -left-48 -top-48 h-96 w-96 rounded-full bg-accent-primary/10 blur-[120px]" />
        <div className="absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-accent-secondary/10 blur-[140px]" />
        <div className="absolute bottom-10 left-1/3 h-96 w-96 rounded-full bg-accent-purple/10 blur-[130px]" />
      </div>

      {/* ================= HEADER / NAVBAR ================= */}
      <header className="sticky top-0 z-40 border-b border-border-custom bg-bg-secondary/85 backdrop-blur-xl transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-8">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary shadow-glow-primary transition-transform group-hover:scale-105">
              <Droplets className="h-6 w-6 text-bg-primary" />
            </div>
            <div>
              <div className="text-xl font-extrabold tracking-tight">
                Smart<span className="gradient-text">Blood</span>
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                Diagnostic Network
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-text-secondary">
            <a href="#how-it-works" className="transition hover:text-accent-primary">
              How It Works
            </a>
            <a href="#services" className="transition hover:text-accent-primary">
              Services Catalog
            </a>
            <a href="#roles" className="transition hover:text-accent-primary">
              For Patients & Phlebs
            </a>
            <a href="#about" className="transition hover:text-accent-primary">
              About Platform
            </a>
            <a href="#faq" className="transition hover:text-accent-primary">
              FAQ
            </a>
          </nav>

          {/* Right Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={dashboardPath}
                  className="btn-glow flex items-center gap-2 text-xs py-2 px-4"
                >
                  <Activity className="h-4 w-4" />
                  <span>Go to Dashboard</span>
                </Link>
              </div>
            ) : (
              <>
                <button
                  onClick={() => handleOpenAuth('phlebotomist')}
                  className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-2 text-xs font-semibold text-cyan-400 transition hover:bg-cyan-500/20"
                >
                  <Syringe className="mr-1.5 inline h-3.5 w-3.5" />
                  Phlebotomist Join
                </button>
                <button
                  onClick={() => handleOpenAuth('patient')}
                  className="btn-glow text-xs py-2 px-4"
                >
                  <User className="mr-1.5 inline h-3.5 w-3.5" />
                  Book Test
                </button>
                <Link
                  to="/login"
                  className="btn-secondary text-xs py-2 px-3.5 text-text-secondary hover:text-text-primary"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-border-custom bg-bg-card text-text-secondary"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-border-custom bg-bg-secondary px-6 py-5 space-y-4 animate-fade-in">
            <nav className="flex flex-col gap-3 text-sm font-medium text-text-secondary">
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-accent-primary"
              >
                How It Works
              </a>
              <a
                href="#services"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-accent-primary"
              >
                Services Catalog
              </a>
              <a
                href="#roles"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-accent-primary"
              >
                For Patients & Phlebs
              </a>
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-accent-primary"
              >
                About Platform
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-accent-primary"
              >
                FAQ
              </a>
            </nav>
            <div className="pt-3 border-t border-border-custom flex flex-col gap-2.5">
              {user ? (
                <Link
                  to={dashboardPath}
                  className="btn-glow text-center text-xs py-2.5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleOpenAuth('patient');
                    }}
                    className="btn-glow w-full text-center text-xs py-2.5"
                  >
                    Book Home Blood Test
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleOpenAuth('phlebotomist');
                    }}
                    className="btn-secondary w-full text-center text-xs py-2.5 text-cyan-400 border-cyan-500/30"
                  >
                    Phlebotomist Portal
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pt-12 pb-20 sm:px-8 sm:pt-20 sm:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-accent-primary/30 bg-accent-primary/10 px-4 py-1.5 text-xs font-semibold text-accent-primary shadow-sm">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>Doorstep Diagnostics & Live GPS Sample Tracking</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
              Hospital-Grade Blood Tests at Home,{' '}
              <span className="gradient-text">Precision Diagnostics</span> on Demand.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Empowering <span className="text-text-primary font-medium">Patients</span> with certified home phlebotomy dispatch and instant digital lab reports. Enabling <span className="text-cyan-400 font-medium">Phlebotomists</span> with smart on-demand routing and transparent payouts.
            </p>

            {/* Dual CTAs & Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => handleOpenAuth('patient')}
                className="btn-glow w-full sm:w-auto px-7 py-3.5 text-sm font-semibold shadow-lg shadow-accent-primary/20 flex items-center justify-center gap-2.5"
              >
                <User className="h-4 w-4" />
                <span>Book a Home Blood Test</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => handleOpenAuth('phlebotomist')}
                className="btn-secondary w-full sm:w-auto px-6 py-3.5 text-sm font-semibold border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 flex items-center justify-center gap-2.5"
              >
                <Syringe className="h-4 w-4" />
                <span>Join as Phlebotomist</span>
              </button>

              <a
                href="#services"
                className="text-xs font-semibold text-text-muted hover:text-text-primary transition underline underline-offset-4 px-2 py-2"
              >
                View 12+ Test Panels
              </a>
            </div>

            {/* Trust Badges Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border-custom/80">
              <div className="flex items-center gap-2.5 text-left">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-primary/10 text-accent-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-text-primary leading-tight">NABL & ISO</p>
                  <p className="text-[11px] text-text-muted">Certified Labs</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-left">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-secondary/10 text-accent-secondary">
                  <Navigation className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-text-primary leading-tight">Live GPS</p>
                  <p className="text-[11px] text-text-muted">Phlebotomist Tracker</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-left">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                  <Thermometer className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-text-primary leading-tight">Cold-Chain</p>
                  <p className="text-[11px] text-text-muted">2°C-8°C Controlled</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-left">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-text-primary leading-tight">6-Hour</p>
                  <p className="text-[11px] text-text-muted">Digital Turnaround</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Right Visual: Live Platform Simulation Card */}
          <div className="lg:col-span-5">
            <div className="relative">
              {/* Glow backdrop */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-purple opacity-30 blur-xl" />

              <div className="relative glass-card overflow-hidden border border-border-custom/90 p-6 sm:p-7 shadow-2xl">
                {/* Header of Preview Card */}
                <div className="flex items-center justify-between border-b border-border-custom pb-4 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-3 w-3 rounded-full bg-accent-primary animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-accent-primary">
                      Live Sample Tracking
                    </span>
                  </div>
                  <span className="rounded-md bg-bg-secondary px-2.5 py-1 text-[11px] font-mono text-text-muted border border-border-custom">
                    #SBT-8942
                  </span>
                </div>

                {/* Patient & Sample Info */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between rounded-xl bg-bg-secondary/70 p-4 border border-border-custom">
                    <div>
                      <span className="text-[11px] font-semibold text-text-muted uppercase">Selected Test</span>
                      <h4 className="text-sm font-bold text-text-primary">Comprehensive Lipid & CBC Panel</h4>
                      <p className="text-xs text-text-secondary mt-0.5">Includes 28 vital blood parameters</p>
                    </div>
                    <span className="rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-2.5 py-1">
                      ₹850
                    </span>
                  </div>

                  {/* Phlebotomist Live Status Pill */}
                  <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">
                          <Syringe className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-text-primary">Priya Sharma (Phlebotomist)</p>
                          <p className="text-[11px] text-cyan-300/80">4.9 ★ • 1,240+ collections</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                        4 mins away
                      </span>
                    </div>

                    {/* Step Timeline Indicator */}
                    <div className="space-y-2 pt-2 text-xs">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <CheckCircle2 className="h-3.5 w-3.5 text-accent-primary" />
                        <span>Phlebotomist Dispatched & En Route</span>
                      </div>
                      <div className="flex items-center gap-2 text-accent-primary font-medium">
                        <div className="h-2 w-2 rounded-full bg-accent-primary animate-pulse" />
                        <span>Arriving at Patient Doorstep</span>
                      </div>
                      <div className="flex items-center gap-2 text-text-muted">
                        <div className="h-2 w-2 rounded-full bg-text-muted/40" />
                        <span>Barcode Scan & Sample Sealing</span>
                      </div>
                      <div className="flex items-center gap-2 text-text-muted">
                        <div className="h-2 w-2 rounded-full bg-text-muted/40" />
                        <span>Automated Lab Report Validation</span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Trigger Button */}
                  <button
                    onClick={() => handleOpenAuth('patient', 'CBC & Lipid Profile')}
                    className="btn-glow w-full text-xs py-3 flex items-center justify-center gap-2 font-bold"
                  >
                    <span>Test This Workflow (Instant Demo)</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS COUNTER STRIP ================= */}
      <section className="border-y border-border-custom bg-bg-secondary/40 py-10 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold gradient-text">25,000+</p>
              <p className="text-xs sm:text-sm font-medium text-text-secondary">Safe Blood Samples Collected</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-cyan-400">18 Mins</p>
              <p className="text-xs sm:text-sm font-medium text-text-secondary">Average Phlebotomist Arrival</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-purple-400">100%</p>
              <p className="text-xs sm:text-sm font-medium text-text-secondary">NABL Certified Partner Labs</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold gradient-text-warm">99.8%</p>
              <p className="text-xs sm:text-sm font-medium text-text-secondary">On-Time Digital Reports</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS (FOR PATIENT & PHLEBOTOMIST) ================= */}
      <section id="how-it-works" className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-8 sm:py-28">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-accent-secondary/30 bg-accent-secondary/10 px-3.5 py-1 text-xs font-semibold text-accent-secondary">
            <Activity className="h-3.5 w-3.5" />
            <span>Clear & Transparent Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            How Smart<span className="gradient-text">Blood</span> Works
          </h2>
          <p className="text-sm sm:text-base text-text-secondary">
            Seamlessly orchestrating home collections for patients and high-efficiency route dispatch for certified phlebotomists.
          </p>

          {/* Interactive Role Switcher Tabs */}
          <div className="inline-flex rounded-xl bg-bg-card p-1.5 border border-border-custom mt-4">
            <button
              onClick={() => setJourneyTab('patient')}
              className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs sm:text-sm font-semibold transition ${
                journeyTab === 'patient'
                  ? 'bg-gradient-to-r from-accent-primary to-accent-secondary text-bg-primary shadow-md'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <User className="h-4 w-4" />
              <span>For Patients (Home Collection)</span>
            </button>
            <button
              onClick={() => setJourneyTab('phlebotomist')}
              className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs sm:text-sm font-semibold transition ${
                journeyTab === 'phlebotomist'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-bg-primary shadow-md'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Syringe className="h-4 w-4" />
              <span>For Phlebotomists (Sample Fleet)</span>
            </button>
          </div>
        </div>

        {/* Workflow Steps Display */}
        {journeyTab === 'patient' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="glass-card-interactive p-6 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
                    <FlaskConical className="h-6 w-6" />
                  </div>
                  <span className="text-3xl font-black text-border-custom">01</span>
                </div>
                <h3 className="text-base font-bold text-text-primary mb-2">1. Choose Blood Test</h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Browse over 12+ routine & specialized diagnostic panels. Review fasting instructions and upfront pricing with no hidden charges.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-border-custom/50 text-[11px] font-medium text-accent-primary">
                ✓ Instant Booking & Slot Confirmation
              </div>
            </div>

            {/* Step 2 */}
            <div className="glass-card-interactive p-6 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-secondary/10 text-accent-secondary border border-accent-secondary/20">
                    <Navigation className="h-6 w-6" />
                  </div>
                  <span className="text-3xl font-black text-border-custom">02</span>
                </div>
                <h3 className="text-base font-bold text-text-primary mb-2">2. Live Phlebotomist Dispatch</h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  The nearest verified phlebotomist is assigned immediately. Track their live GPS location and estimated arrival time on your interactive map.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-border-custom/50 text-[11px] font-medium text-accent-secondary">
                ✓ Real-Time GPS Tracking
              </div>
            </div>

            {/* Step 3 */}
            <div className="glass-card-interactive p-6 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <QrCode className="h-6 w-6" />
                  </div>
                  <span className="text-3xl font-black text-border-custom">03</span>
                </div>
                <h3 className="text-base font-bold text-text-primary mb-2">3. Safe Draw & Barcode Seal</h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Painless hygienic blood draw with single-use needles. A unique barcode is applied to your tube immediately in front of you.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-border-custom/50 text-[11px] font-medium text-purple-400">
                ✓ Tamper-Evident Cold Chain
              </div>
            </div>

            {/* Step 4 */}
            <div className="glass-card-interactive p-6 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <FileText className="h-6 w-6" />
                  </div>
                  <span className="text-3xl font-black text-border-custom">04</span>
                </div>
                <h3 className="text-base font-bold text-text-primary mb-2">4. Verified Digital Report</h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Certified NABL labs test the sample. Download official signed PDF reports in your dashboard with abnormal parameter alerts.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-border-custom/50 text-[11px] font-medium text-emerald-400">
                ✓ 4-8 Hour Fast Digital Reports
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Phleb Step 1 */}
            <div className="glass-card-interactive p-6 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Zap className="h-6 w-6" />
                  </div>
                  <span className="text-3xl font-black text-border-custom">01</span>
                </div>
                <h3 className="text-base font-bold text-text-primary mb-2">1. Receive Instant Requests</h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Get notified of new collection bookings nearby. Review patient location, required test tubes, and guaranteed payout upfront.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-border-custom/50 text-[11px] font-medium text-cyan-400">
                ✓ Choose Your Shifts & Location
              </div>
            </div>

            {/* Phleb Step 2 */}
            <div className="glass-card-interactive p-6 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Navigation className="h-6 w-6" />
                  </div>
                  <span className="text-3xl font-black text-border-custom">02</span>
                </div>
                <h3 className="text-base font-bold text-text-primary mb-2">2. In-App Navigation</h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Use built-in turn-by-turn route guidance to reach patient homes with zero delays and broadcast live location updates automatically.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-border-custom/50 text-[11px] font-medium text-blue-400">
                ✓ Smart Route Optimization
              </div>
            </div>

            {/* Phleb Step 3 */}
            <div className="glass-card-interactive p-6 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <QrCode className="h-6 w-6" />
                  </div>
                  <span className="text-3xl font-black text-border-custom">03</span>
                </div>
                <h3 className="text-base font-bold text-text-primary mb-2">3. Scan & Secure Barcode</h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Collect blood sample using standard vacuum tubes, attach the barcode, and confirm attachment with one tap in your phlebotomist app.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-border-custom/50 text-[11px] font-medium text-purple-400">
                ✓ Zero Paperwork Digital Flow
              </div>
            </div>

            {/* Phleb Step 4 */}
            <div className="glass-card-interactive p-6 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <IndianRupee className="h-6 w-6" />
                  </div>
                  <span className="text-3xl font-black text-border-custom">04</span>
                </div>
                <h3 className="text-base font-bold text-text-primary mb-2">4. Lab Drop-off & Pay</h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Hand over sample batches to partner labs. Earnings are credited instantly per completed sample with performance bonuses.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-border-custom/50 text-[11px] font-medium text-emerald-400">
                ✓ Same-Day Direct Payouts
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ================= SERVICES & TEST CATALOG ================= */}
      <section id="services" className="relative z-10 border-t border-border-custom bg-bg-secondary/30 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400">
                <FlaskConical className="h-3.5 w-3.5" />
                <span>Certified Pathology Menu</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Diagnostic Tests & Health Packages
              </h2>
              <p className="text-sm text-text-secondary max-w-xl">
                Explore our full catalog of blood tests with transparent pricing, sample requirements, and fast turnaround times.
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tests (CBC, Lipid, Sugar...)"
                className="input-styled pl-10 text-xs sm:text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-accent-primary text-bg-primary font-bold shadow-md shadow-accent-primary/20'
                    : 'bg-bg-card text-text-secondary hover:bg-bg-card-hover hover:text-text-primary border border-border-custom'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Test Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTests.map((test) => (
              <div
                key={test._id || test.testName}
                className="glass-card flex flex-col justify-between p-5 transition-all hover:border-accent-primary/50 group"
              >
                <div className="space-y-3">
                  {/* Category & Fasting Tag */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-bg-secondary px-2.5 py-1 text-[11px] font-semibold text-accent-secondary border border-border-custom">
                      {test.category || 'General'}
                    </span>
                    <span
                      className={`rounded-md px-2.5 py-1 text-[10px] font-bold ${
                        test.fastingHours > 0
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {test.fastingHours > 0 ? `🕒 Fasting ${test.fastingHours}h` : '⚡ No Fasting'}
                    </span>
                  </div>

                  {/* Test Name */}
                  <h3 className="text-base font-bold text-text-primary group-hover:text-accent-primary transition-colors leading-snug">
                    {test.testName}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed">
                    {test.description}
                  </p>

                  {/* Specifications */}
                  <div className="space-y-1.5 pt-2 border-t border-border-custom/50 text-[11px] text-text-muted">
                    <div className="flex items-center justify-between">
                      <span>Tube Type:</span>
                      <span className="font-mono text-text-secondary">{test.sampleType || 'Serum/EDTA'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Turnaround:</span>
                      <span className="text-text-secondary">{test.turnaround || 'Same-day report'}</span>
                    </div>
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="mt-5 pt-4 border-t border-border-custom flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-text-muted uppercase">Lab Price</span>
                    <p className="text-lg font-black text-text-primary flex items-center">
                      <IndianRupee className="h-4 w-4 text-accent-primary inline" />
                      {test.price}
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenAuth('patient', test.testName)}
                    className="btn-glow text-xs py-2 px-3.5 flex items-center gap-1.5"
                  >
                    <span>Book Test</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredTests.length === 0 && (
            <div className="text-center py-16 bg-bg-card/50 rounded-2xl border border-border-custom">
              <FlaskConical className="h-10 w-10 text-text-muted mx-auto mb-3 opacity-50" />
              <p className="text-base font-bold text-text-primary">No matching blood tests found</p>
              <p className="text-xs text-text-muted mt-1">Try searching for different keywords or select 'All'</p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="btn-secondary text-xs mt-4"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ================= ROLES & PLATFORM ADVANTAGES ================= */}
      <section id="roles" className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-8 sm:py-28">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold text-purple-400">
            <Award className="h-3.5 w-3.5" />
            <span>Built for the Entire Ecosystem</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Designed for Patients & Healthcare Professionals
          </h2>
          <p className="text-sm sm:text-base text-text-secondary">
            Whether you need convenient diagnostics at home or want to grow your career as a phlebotomist, SmartBlood delivers the gold standard.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* For Patients Box */}
          <div className="glass-card p-8 border-accent-primary/30 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-primary/10 text-accent-primary border border-accent-primary/30 shadow-glow-primary">
                  <User className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-primary">For Patients & Families</h3>
                  <p className="text-xs text-text-secondary">Painless diagnostics in the comfort of your living room</p>
                </div>
              </div>

              <div className="space-y-3.5 text-sm text-text-secondary">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent-primary shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-text-primary">Zero Waiting Rooms:</strong> No travelling while unwell or waiting in crowded diagnostic queues.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent-primary shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-text-primary">Live Phlebotomist ETA:</strong> Watch your phlebotomist navigate to your home on the live map.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent-primary shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-text-primary">Instant PDF Reports & Trends:</strong> View historical blood test parameters with automated critical alert flags.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent-primary shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-text-primary">Barcode-Sealed Samples:</strong> Tamper-proof tracking guarantees zero sample mix-ups.
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border-custom">
              <button
                onClick={() => handleOpenAuth('patient')}
                className="btn-glow w-full py-3 text-sm font-semibold flex items-center justify-center gap-2"
              >
                <span>Book a Home Blood Test Now</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* For Phlebotomists Box */}
          <div className="glass-card p-8 border-cyan-500/30 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Syringe className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-primary">For Certified Phlebotomists</h3>
                  <p className="text-xs text-cyan-300/80">High earnings, flexible gigs, and smart automated tools</p>
                </div>
              </div>

              <div className="space-y-3.5 text-sm text-text-secondary">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-text-primary">Flexible Gig Schedule:</strong> Accept sample collection tasks whenever you want in your preferred radius.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-text-primary">Highest Industry Payouts:</strong> Transparent compensation per sample plus peak-time bonuses.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-text-primary">Smart Route Optimization:</strong> In-app navigation reduces transit time between patient homes and drop-off labs.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-text-primary">Digital Barcode Scanning:</strong> Eliminate paper logs with 1-click mobile barcode scanning.
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border-custom">
              <button
                onClick={() => handleOpenAuth('phlebotomist')}
                className="btn-secondary w-full py-3 text-sm font-semibold border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 flex items-center justify-center gap-2"
              >
                <span>Join the Phlebotomist Network</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ABOUT SECTION (PURPOSE & QUALITY) ================= */}
      <section id="about" className="relative z-10 border-t border-border-custom bg-bg-secondary/40 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-accent-warm/30 bg-accent-warm/10 px-3.5 py-1 text-xs font-semibold text-accent-warm">
                <HeartPulse className="h-3.5 w-3.5" />
                <span>Our Mission & Quality Guarantee</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Revolutionizing Healthcare Diagnostics with <span className="gradient-text">Trust & Traceability</span>
              </h2>

              <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                SmartBlood was built to solve the most critical pain points in modern diagnostic medicine: long patient wait times, lack of real-time visibility, and improper sample handling during transit.
              </p>

              <p className="text-sm text-text-secondary leading-relaxed">
                By uniting certified phlebotomists, state-of-the-art cold-chain logistics, and NABL-accredited diagnostic laboratories on a unified digital platform, we ensure that every single blood droplet is collected safely, tested accurately, and reported swiftly.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="rounded-xl border border-border-custom bg-bg-card p-4">
                  <ShieldCheck className="h-6 w-6 text-accent-primary mb-2" />
                  <h4 className="text-sm font-bold text-text-primary">100% Certified Labs</h4>
                  <p className="text-xs text-text-muted mt-1">ISO 15189 & NABL accredited diagnostic partners.</p>
                </div>

                <div className="rounded-xl border border-border-custom bg-bg-card p-4">
                  <Thermometer className="h-6 w-6 text-accent-secondary mb-2" />
                  <h4 className="text-sm font-bold text-text-primary">Cold-Chain Assurance</h4>
                  <p className="text-xs text-text-muted mt-1">Calibrated 2°C-8°C vacuum carrier bags.</p>
                </div>
              </div>
            </div>

            {/* Right Pillars / Stats */}
            <div className="lg:col-span-6 space-y-4">
              <div className="glass-card p-6 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-primary/10 text-accent-primary">
                  <Droplets className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-text-primary">Painless & Sterile Collection</h4>
                  <p className="text-xs sm:text-sm text-text-secondary mt-1">
                    Every phlebotomist is trained in pediatric and geriatric vein access techniques with pre-packaged sterile single-use kits.
                  </p>
                </div>
              </div>

              <div className="glass-card p-6 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                  <QrCode className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-text-primary">End-to-End Barcode Verification</h4>
                  <p className="text-xs sm:text-sm text-text-secondary mt-1">
                    Unique encrypted barcodes link your sample to your secure digital profile, preventing identity errors throughout lab processing.
                  </p>
                </div>
              </div>

              <div className="glass-card p-6 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-text-primary">Critical Value Alerts</h4>
                  <p className="text-xs sm:text-sm text-text-secondary mt-1">
                    Automated smart algorithms flag severe abnormal findings (e.g. critically low platelets or high blood sugar) for immediate doctor consultation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FAQ SECTION ================= */}
      <section id="faq" className="relative z-10 mx-auto max-w-5xl px-4 py-20 sm:px-8 sm:py-28">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-accent-primary/30 bg-accent-primary/10 px-3.5 py-1 text-xs font-semibold text-accent-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-text-secondary">
            Everything you need to know about doorstep blood sample testing and our phlebotomy network.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="glass-card overflow-hidden transition-all duration-200 border-border-custom"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between p-5 sm:p-6 text-left text-sm sm:text-base font-bold text-text-primary hover:text-accent-primary transition-colors"
                >
                  <span>{faq.q}</span>
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-bg-card border border-border-custom text-text-secondary">
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 text-xs sm:text-sm text-text-secondary leading-relaxed border-t border-border-custom/50 pt-4 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= FINAL CTA SECTION ================= */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-20 sm:px-8 sm:pb-28">
        <div className="glass-card relative overflow-hidden p-8 sm:p-14 text-center border-accent-primary/40 bg-gradient-to-br from-bg-card via-bg-secondary to-bg-card shadow-2xl">
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary text-bg-primary shadow-glow-primary">
              <Droplets className="h-8 w-8" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-text-primary">
              Ready for Smarter, Faster Blood Diagnostics?
            </h2>
            <p className="text-sm sm:text-base text-text-secondary max-w-xl mx-auto">
              Book a test in under 60 seconds. A certified phlebotomist will arrive at your home with real-time GPS tracking.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={() => handleOpenAuth('patient')}
                className="btn-glow w-full sm:w-auto px-8 py-3.5 text-sm font-semibold"
              >
                <User className="mr-2 inline h-4 w-4" />
                Book Blood Test Now
              </button>
              <button
                onClick={() => handleOpenAuth('phlebotomist')}
                className="btn-secondary w-full sm:w-auto px-7 py-3.5 text-sm font-semibold border-cyan-500/40 text-cyan-400"
              >
                <Syringe className="mr-2 inline h-4 w-4" />
                Register as Phlebotomist
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-border-custom bg-bg-secondary/90 py-12 relative z-10 text-text-secondary">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-border-custom">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary text-bg-primary">
                  <Droplets className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold text-text-primary">
                  Smart<span className="gradient-text">Blood</span>
                </span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Certified on-demand pathology sample collection and real-time phlebotomist tracking network.
              </p>
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <ShieldCheck className="h-4 w-4 text-accent-primary" />
                <span>NABL & ISO 15189 Compliant</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-text-primary mb-3">Diagnostic Services</h4>
              <ul className="space-y-2 text-xs text-text-secondary">
                <li><a href="#services" className="hover:text-accent-primary transition">Complete Blood Count (CBC)</a></li>
                <li><a href="#services" className="hover:text-accent-primary transition">Lipid & Heart Profile</a></li>
                <li><a href="#services" className="hover:text-accent-primary transition">Diabetes HbA1c Monitoring</a></li>
                <li><a href="#services" className="hover:text-accent-primary transition">Liver & Kidney Functions</a></li>
                <li><a href="#services" className="hover:text-accent-primary transition">Vitamin D3 & B12 Panels</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-text-primary mb-3">Quick Navigation</h4>
              <ul className="space-y-2 text-xs text-text-secondary">
                <li><a href="#how-it-works" className="hover:text-accent-primary transition">How It Works</a></li>
                <li><a href="#roles" className="hover:text-accent-primary transition">For Phlebotomists</a></li>
                <li><a href="#about" className="hover:text-accent-primary transition">Our Purpose & Mission</a></li>
                <li><a href="#faq" className="hover:text-accent-primary transition">Frequently Asked Questions</a></li>
                <li><Link to="/login" className="hover:text-accent-primary transition">Portal Login</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-text-primary mb-3">Emergency & Support</h4>
              <p className="text-xs text-text-muted mb-2">Need assistance with home sample booking or active collection?</p>
              <div className="rounded-xl border border-border-custom bg-bg-card p-3 space-y-1 text-xs">
                <p className="font-semibold text-text-primary flex items-center gap-1.5">
                  <PhoneCall className="h-3.5 w-3.5 text-accent-primary" />
                  Helpline: +91 1800-420-BLOOD
                </p>
                <p className="text-text-muted">support@smartblood.diag</p>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-4">
            <p>© {new Date().getFullYear()} SmartBlood Diagnostic Network. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span className="hover:text-text-secondary cursor-pointer">Privacy Policy</span>
              <span className="hover:text-text-secondary cursor-pointer">Terms of Service</span>
              <span className="hover:text-text-secondary cursor-pointer">HIPAA & Security</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ================= SERVICE ACTION & QUICK LOGIN MODAL ================= */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-border-custom bg-bg-secondary p-6 sm:p-8 shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg border border-border-custom bg-bg-card text-text-muted hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal Header */}
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary text-bg-primary mb-3 shadow-glow-primary">
                {authRole === 'phlebotomist' ? (
                  <Syringe className="h-6 w-6" />
                ) : authRole === 'lab_admin' ? (
                  <FlaskConical className="h-6 w-6" />
                ) : (
                  <Droplets className="h-6 w-6" />
                )}
              </div>
              <h3 className="text-xl font-bold text-text-primary">
                {selectedServiceIntent
                  ? `Book ${selectedServiceIntent}`
                  : authRole === 'phlebotomist'
                  ? 'Phlebotomist Access'
                  : 'Get Started with SmartBlood'}
              </h3>
              <p className="text-xs text-text-muted mt-1">
                Select your portal role or sign in to continue
              </p>
            </div>

            {/* Role Selection Tabs */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <button
                type="button"
                onClick={() => setAuthRole('patient')}
                className={`flex flex-col items-center gap-1 rounded-xl p-2.5 text-xs font-semibold border transition ${
                  authRole === 'patient'
                    ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                    : 'border-border-custom bg-bg-card text-text-muted hover:text-text-primary'
                }`}
              >
                <User className="h-4 w-4" />
                <span>Patient</span>
              </button>

              <button
                type="button"
                onClick={() => setAuthRole('phlebotomist')}
                className={`flex flex-col items-center gap-1 rounded-xl p-2.5 text-xs font-semibold border transition ${
                  authRole === 'phlebotomist'
                    ? 'border-cyan-400 bg-cyan-500/10 text-cyan-400'
                    : 'border-border-custom bg-bg-card text-text-muted hover:text-text-primary'
                }`}
              >
                <Syringe className="h-4 w-4" />
                <span>Phlebotomist</span>
              </button>

              <button
                type="button"
                onClick={() => setAuthRole('lab_admin')}
                className={`flex flex-col items-center gap-1 rounded-xl p-2.5 text-xs font-semibold border transition ${
                  authRole === 'lab_admin'
                    ? 'border-purple-400 bg-purple-500/10 text-purple-400'
                    : 'border-border-custom bg-bg-card text-text-muted hover:text-text-primary'
                }`}
              >
                <FlaskConical className="h-4 w-4" />
                <span>Lab Admin</span>
              </button>
            </div>

            {loginError && (
              <div className="mb-4 rounded-lg border border-accent-danger/30 bg-accent-danger/10 px-3.5 py-2.5 text-xs text-accent-danger">
                {loginError}
              </div>
            )}

            {/* 1-Click Instant Demo Login */}
            <div className="mb-5 rounded-xl border border-border-custom bg-bg-card p-4">
              <p className="text-xs font-semibold text-text-primary mb-2 flex items-center justify-between">
                <span>⚡ Instant 1-Click Demo Login</span>
                <span className="text-[10px] text-accent-primary uppercase font-mono">No Password Needed</span>
              </p>
              {authRole === 'patient' && (
                <button
                  type="button"
                  disabled={loginLoading}
                  onClick={() => handleQuickLogin('patient@test.com', 'patient')}
                  className="btn-glow w-full text-xs py-2.5 flex items-center justify-center gap-2"
                >
                  {loginLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <User className="h-4 w-4" />}
                  <span>Sign In as Demo Patient (Arjun Patel)</span>
                </button>
              )}

              {authRole === 'phlebotomist' && (
                <button
                  type="button"
                  disabled={loginLoading}
                  onClick={() => handleQuickLogin('phlebotomist@test.com', 'phlebotomist')}
                  className="btn-secondary w-full text-xs py-2.5 text-cyan-400 border-cyan-500/40 hover:bg-cyan-500/20 flex items-center justify-center gap-2"
                >
                  {loginLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Syringe className="h-4 w-4" />}
                  <span>Sign In as Demo Phlebotomist (Priya Sharma)</span>
                </button>
              )}

              {authRole === 'lab_admin' && (
                <button
                  type="button"
                  disabled={loginLoading}
                  onClick={() => handleQuickLogin('labadmin@test.com', 'lab_admin')}
                  className="btn-secondary w-full text-xs py-2.5 text-purple-400 border-purple-500/40 hover:bg-purple-500/20 flex items-center justify-center gap-2"
                >
                  {loginLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FlaskConical className="h-4 w-4" />}
                  <span>Sign In as Demo Lab Admin (Dr. Rahul Verma)</span>
                </button>
              )}
            </div>

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border-custom" /></div>
              <span className="relative bg-bg-secondary px-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                Or Sign In with Credentials
              </span>
            </div>

            {/* Credentials Login Form */}
            <form onSubmit={handleManualLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="input-styled pl-9 text-xs py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="input-styled pl-9 text-xs py-2"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="btn-secondary w-full text-xs py-2.5 font-semibold text-text-primary hover:text-accent-primary"
              >
                {loginLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Sign In to Account'}
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-text-muted">
              Don't have an account?{' '}
              <Link
                to={`/register?role=${authRole}`}
                onClick={() => setIsAuthModalOpen(false)}
                className="font-semibold text-accent-primary hover:underline"
              >
                Create new account
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
