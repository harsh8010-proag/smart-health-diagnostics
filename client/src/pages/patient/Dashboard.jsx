import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { connectSocket, joinBookingRoom } from '../../services/socket';
import { StatusBadge, StatusTimeline } from '../../components/StatusBadge';
import LiveMap from '../../components/LiveMap';
import Navbar from '../../components/Navbar';
import { QRCodeSVG } from 'qrcode.react';
import {
  Search,
  Calendar,
  Clock,
  TestTube2,
  IndianRupee,
  Droplets,
  ArrowRight,
  X,
  CheckCircle2,
  FileText,
  MapPin,
  Loader2,
  Beaker,
  Activity,
  History,
  Sparkles,
  User,
  ShieldCheck,
} from 'lucide-react';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTest, setSelectedTest] = useState(null);
  const [slotDate, setSlotDate] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('catalog');
  const [phlebLocations, setPhlebLocations] = useState({});
  const [loadingData, setLoadingData] = useState(true);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const [testsRes, bookingsRes] = await Promise.all([
        api.get('/tests'),
        api.get('/bookings/my'),
      ]);
      setTests(testsRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Socket.io listeners
  useEffect(() => {
    const socket = connectSocket();

    bookings
      .filter((b) => b.status !== 'completed')
      .forEach((b) => joinBookingRoom(b._id));

    socket.on('STATUS_CHANGED', ({ bookingId, status }) => {
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status } : b))
      );
    });

    socket.on('PHLEBOTOMIST_LOCATION', ({ bookingId, lat, lng }) => {
      setPhlebLocations((prev) => ({ ...prev, [bookingId]: { lat, lng } }));
    });

    socket.on('SAMPLE_ATTACHED', ({ bookingId, barcode }) => {
      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, sampleBarcode: barcode, status: 'sample_collected' } : b
        )
      );
    });

    socket.on('REPORT_READY', ({ bookingId, reportUrl }) => {
      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, reportUrl, status: 'completed' } : b
        )
      );
    });

    return () => {
      socket.off('STATUS_CHANGED');
      socket.off('PHLEBOTOMIST_LOCATION');
      socket.off('SAMPLE_ATTACHED');
      socket.off('REPORT_READY');
    };
  }, [bookings.length]);

  // Book a test
  const handleBook = async () => {
    if (!selectedTest || !slotDate) return;
    setBookingLoading(true);
    try {
      await api.post('/bookings/book', {
        testId: selectedTest._id,
        slot: slotDate,
        location: {
          coordinates: user.location?.coordinates || [72.8777, 19.076],
        },
      });
      setSelectedTest(null);
      setSlotDate('');
      await fetchData();
      setActiveTab('active');
    } catch (err) {
      console.error('Booking failed:', err);
    } finally {
      setBookingLoading(false);
    }
  };

  const filteredTests = tests.filter(
    (t) =>
      t.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeBookings = bookings.filter((b) => b.status !== 'completed');
  const completedBookings = bookings.filter((b) => b.status === 'completed');

  return (
    <div className="min-h-screen bg-bg-primary pb-16">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        {/* Welcome Header */}
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
              Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              Book home sample collection tests, track agent real-time status, and access certified reports.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-bg-secondary p-3 border border-border-custom text-xs text-text-secondary">
            <ShieldCheck className="h-5 w-5 text-accent-primary" />
            <span>NABL Certified Diagnostic Partner</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mb-10 grid grid-cols-2 gap-5 sm:grid-cols-4">
          <div className="glass-card flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-primary/15 border border-accent-primary/20">
              <Activity className="h-6 w-6 text-accent-primary" />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-text-primary">{activeBookings.length}</p>
              <p className="text-xs font-medium text-text-muted mt-0.5">Active Requests</p>
            </div>
          </div>
          <div className="glass-card flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-secondary/15 border border-accent-secondary/20">
              <CheckCircle2 className="h-6 w-6 text-accent-secondary" />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-text-primary">{completedBookings.length}</p>
              <p className="text-xs font-medium text-text-muted mt-0.5">Completed Tests</p>
            </div>
          </div>
          <div className="glass-card flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-purple/15 border border-accent-purple/20">
              <Beaker className="h-6 w-6 text-accent-purple" />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-text-primary">{tests.length}</p>
              <p className="text-xs font-medium text-text-muted mt-0.5">Tests Available</p>
            </div>
          </div>
          <div className="glass-card flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-warm/15 border border-accent-warm/20">
              <FileText className="h-6 w-6 text-accent-warm" />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-text-primary">
                {completedBookings.filter((b) => b.reportUrl).length}
              </p>
              <p className="text-xs font-medium text-text-muted mt-0.5">PDF Reports</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 flex gap-2 rounded-2xl bg-bg-secondary p-1.5 border border-border-custom">
          {[
            { key: 'catalog', label: 'Test Catalog', icon: Beaker },
            { key: 'active', label: 'Active Bookings', icon: Activity, count: activeBookings.length },
            { key: 'history', label: 'Test History & Reports', icon: History, count: completedBookings.length },
          ].map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex flex-1 items-center justify-center gap-2.5 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 ${
                activeTab === key
                  ? 'bg-bg-card text-accent-primary shadow-md border border-accent-primary/30'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-card/50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              {count > 0 && (
                <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent-primary/20 px-1.5 text-xs font-bold text-accent-primary border border-accent-primary/30">
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {loadingData ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-accent-primary" />
            <p className="text-sm font-medium text-text-muted">Loading your diagnostic dashboard...</p>
          </div>
        ) : (
          <>
            {/* ─── TEST CATALOG TAB ─── */}
            {activeTab === 'catalog' && (
              <div className="animate-fade-in space-y-6">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-styled py-3.5 pl-12 text-base shadow-sm"
                    placeholder="Search blood tests by name (e.g., CBC, Thyroid, HbA1c, Lipid)..."
                  />
                </div>

                {/* Test Cards Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredTests.map((test) => {
                    const isSelected = selectedTest?._id === test._id;
                    return (
                      <div
                        key={test._id}
                        className={`glass-card flex flex-col justify-between p-6 cursor-pointer transition-all duration-300 ${
                          isSelected
                            ? 'border-accent-primary ring-2 ring-accent-primary/20 shadow-glow-primary scale-[1.01]'
                            : ''
                        }`}
                        onClick={() => setSelectedTest(isSelected ? null : test)}
                      >
                        <div>
                          <div className="mb-4 flex items-start justify-between">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-primary/10 border border-accent-primary/20">
                              <TestTube2 className="h-6 w-6 text-accent-primary" />
                            </div>
                            <span className="rounded-full bg-bg-secondary border border-border-custom px-3 py-1 text-xs font-semibold text-text-secondary">
                              {test.category}
                            </span>
                          </div>
                          <h3 className="mb-2 text-lg font-bold text-text-primary leading-tight">
                            {test.testName}
                          </h3>
                          <p className="mb-5 text-xs text-text-muted leading-relaxed line-clamp-2">
                            {test.description}
                          </p>
                        </div>

                        <div className="border-t border-border-custom pt-4 flex items-center justify-between">
                          <div className="flex items-center text-xl font-extrabold text-accent-primary">
                            <IndianRupee className="h-4 w-4 stroke-[3]" />
                            {test.price}
                          </div>
                          <div className="flex items-center gap-3 text-xs font-medium text-text-muted">
                            {test.fastingHours > 0 && (
                              <span className="flex items-center gap-1 rounded-md bg-bg-secondary px-2 py-1 border border-border-custom">
                                <Clock className="h-3.5 w-3.5 text-accent-warm" />
                                {test.fastingHours}h fast
                              </span>
                            )}
                            <span className="flex items-center gap-1 rounded-md bg-bg-secondary px-2 py-1 border border-border-custom">
                              <Droplets className="h-3.5 w-3.5 text-accent-secondary" />
                              {test.sampleType}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Test Booking Panel */}
                {selectedTest && (
                  <div className="animate-fade-in glass-card p-8 border-accent-primary/40 shadow-glow-primary">
                    <div className="flex items-center justify-between mb-6 border-b border-border-custom pb-4">
                      <div>
                        <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-accent-primary" />
                          Book Appointment: {selectedTest.testName}
                        </h3>
                        <p className="text-xs text-text-muted mt-1">
                          Sample Type: <strong className="text-text-secondary">{selectedTest.sampleType}</strong> • Price: <strong className="text-accent-primary">₹{selectedTest.price}</strong>
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedTest(null)}
                        className="rounded-xl p-2 text-text-muted hover:bg-bg-card hover:text-text-primary transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                      <div className="flex-1">
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-text-secondary">
                          <Calendar className="mr-1.5 inline h-4 w-4 text-accent-primary" />
                          Preferred Slot Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          value={slotDate}
                          onChange={(e) => setSlotDate(e.target.value)}
                          className="input-styled py-3"
                          min={new Date().toISOString().slice(0, 16)}
                        />
                      </div>
                      <button
                        onClick={handleBook}
                        disabled={!slotDate || bookingLoading}
                        className="btn-glow py-3.5 px-8 flex items-center justify-center gap-2.5 text-sm"
                      >
                        {bookingLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            Confirm Home Collection
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── ACTIVE BOOKINGS TAB ─── */}
            {activeTab === 'active' && (
              <div className="animate-fade-in space-y-6">
                {activeBookings.length === 0 ? (
                  <div className="glass-card flex flex-col items-center justify-center py-20 text-center p-8">
                    <Activity className="mb-4 h-14 w-14 text-text-muted/30" />
                    <h3 className="text-xl font-bold text-text-primary">No Active Bookings</h3>
                    <p className="mt-1 text-sm text-text-muted max-w-sm">
                      You don't have any ongoing blood sample collection appointments.
                    </p>
                    <button
                      onClick={() => setActiveTab('catalog')}
                      className="btn-glow mt-6 px-6 py-3"
                    >
                      Book a Test Now
                    </button>
                  </div>
                ) : (
                  activeBookings.map((booking) => (
                    <div key={booking._id} className="glass-card p-6 sm:p-8 space-y-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border-custom pb-5">
                        <div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-xl font-bold text-text-primary">
                              {booking.test?.testName}
                            </h3>
                            <StatusBadge status={booking.status} />
                          </div>
                          <p className="mt-1 text-xs text-text-muted flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-accent-primary" />
                            Slot: {new Date(booking.slot).toLocaleString()}
                          </p>
                          {booking.phlebotomist && (
                            <p className="mt-1 text-xs text-text-secondary flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-accent-secondary" />
                              Phlebotomist Agent: <strong className="text-accent-secondary">{booking.phlebotomist.name}</strong>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Status Timeline */}
                      <div className="overflow-x-auto py-2">
                        <StatusTimeline currentStatus={booking.status} />
                      </div>

                      {/* QR & Map Layout */}
                      <div className="grid gap-6 lg:grid-cols-3 pt-2">
                        {/* QR Code Card */}
                        <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-6 shadow-md">
                          <p className="mb-3 text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Patient Verification QR
                          </p>
                          <QRCodeSVG
                            value={booking.qrCodeToken}
                            size={150}
                            level="H"
                          />
                          <p className="mt-3 text-center text-[11px] font-mono font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-md">
                            {booking.qrCodeToken}
                          </p>
                          <p className="mt-2 text-center text-[10px] text-gray-400">
                            Show this QR code to the phlebotomist upon arrival
                          </p>
                        </div>

                        {/* Live Map */}
                        <div className="lg:col-span-2 flex flex-col">
                          <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
                            <MapPin className="h-4 w-4 text-accent-primary" />
                            Real-Time Agent Location
                          </p>
                          <LiveMap
                            patientLocation={booking.patientLocation?.coordinates}
                            phlebotomistLocation={phlebLocations[booking._id]}
                            height="240px"
                          />
                        </div>
                      </div>

                      {/* Barcode display if attached */}
                      {booking.sampleBarcode && (
                        <div className="flex items-center gap-3 rounded-xl bg-accent-primary/10 border border-accent-primary/30 p-4">
                          <TestTube2 className="h-5 w-5 text-accent-primary" />
                          <div>
                            <p className="text-xs text-text-muted">Sample Tube Barcode Attached</p>
                            <p className="font-mono text-sm font-bold text-accent-primary">
                              {booking.sampleBarcode}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ─── HISTORY TAB ─── */}
            {activeTab === 'history' && (
              <div className="animate-fade-in space-y-4">
                {completedBookings.length === 0 ? (
                  <div className="glass-card flex flex-col items-center justify-center py-20 text-center p-8">
                    <History className="mb-4 h-14 w-14 text-text-muted/30" />
                    <h3 className="text-xl font-bold text-text-primary">No Completed Tests</h3>
                    <p className="mt-1 text-sm text-text-muted">
                      Your completed test reports will appear here.
                    </p>
                  </div>
                ) : (
                  completedBookings.map((booking) => (
                    <div key={booking._id} className="glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-text-primary">
                            {booking.test?.testName}
                          </h3>
                          <StatusBadge status="completed" />
                        </div>
                        <p className="mt-1 text-xs text-text-muted">
                          Date: {new Date(booking.slot).toLocaleDateString()} • Sample: {booking.test?.sampleType} • Price: ₹{booking.test?.price}
                        </p>
                      </div>

                      {booking.reportUrl && (
                        <a
                          href={booking.reportUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-glow px-5 py-2.5 text-xs flex items-center gap-2 self-start sm:self-auto"
                        >
                          <FileText className="h-4 w-4" />
                          Download Report PDF
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
