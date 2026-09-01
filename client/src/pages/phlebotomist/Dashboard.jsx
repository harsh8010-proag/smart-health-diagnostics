import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { connectSocket, joinBookingRoom, sendLocation } from '../../services/socket';
import { StatusBadge } from '../../components/StatusBadge';
import { getAddressFromCoords } from '../../services/geocoding';
import Navbar from '../../components/Navbar';
import {
  MapPin,
  Navigation,
  QrCode,
  Barcode,
  Check,
  X,
  Loader2,
  User,
  Calendar,
  TestTube2,
  ArrowRight,
  Send,
  Radio,
  Truck,
  ClipboardList,
  Radar,
  Phone,
  Building,
  Play,
  Square,
  Car,
  CheckCircle2,
} from 'lucide-react';

export default function PhlebotomistDashboard() {
  const { user } = useAuth();
  const [nearbyBookings, setNearbyBookings] = useState([]);
  const [assignedBookings, setAssignedBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('assigned');
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [loadingAssigned, setLoadingAssigned] = useState(true);

  // QR scan state
  const [scanModal, setScanModal] = useState(null);
  const [qrInput, setQrInput] = useState('');
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Barcode attach state
  const [barcodeModal, setBarcodeModal] = useState(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [barcodeLoading, setBarcodeLoading] = useState(false);

  // Location simulation
  const [simLat, setSimLat] = useState('19.080');
  const [simLng, setSimLng] = useState('72.880');

  const [simulations, setSimulations] = useState({});
  const intervalsRef = useRef({});

  useEffect(() => {
    return () => {
      // Clean up all simulation intervals on unmount
      Object.values(intervalsRef.current).forEach(clearInterval);
    };
  }, []);

  const [phlebCoords, setPhlebCoords] = useState([72.8856, 19.0896]);
  const [detectingPhleb, setDetectingPhleb] = useState(false);
  const [locationName, setLocationName] = useState('Detecting location...');

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationName('Mumbai, Maharashtra');
      return;
    }
    setDetectingPhleb(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const newCoords = [position.coords.longitude, position.coords.latitude];
        setPhlebCoords(newCoords);
        setSimLat(position.coords.latitude.toFixed(3));
        setSimLng(position.coords.longitude.toFixed(3));
        setDetectingPhleb(false);
        const name = await getAddressFromCoords(position.coords.latitude, position.coords.longitude);
        setLocationName(name);
      },
      async (err) => {
        console.error('Geolocation error:', err);
        setDetectingPhleb(false);
        const name = await getAddressFromCoords(19.0896, 72.8856);
        setLocationName(name);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, []);

  const fetchAssigned = useCallback(async () => {
    try {
      const res = await api.get('/bookings/phlebotomist/assigned');
      setAssignedBookings(res.data);
    } catch (err) {
      console.error('Fetch assigned error:', err);
    } finally {
      setLoadingAssigned(false);
    }
  }, []);

  const fetchNearby = useCallback(async () => {
    setLoadingNearby(true);
    try {
      const res = await api.get(
        `/bookings/phlebotomist/nearby?lng=${phlebCoords[0]}&lat=${phlebCoords[1]}`
      );
      setNearbyBookings(res.data);
    } catch (err) {
      console.error('Fetch nearby error:', err);
    } finally {
      setLoadingNearby(false);
    }
  }, [phlebCoords]);

  useEffect(() => {
    fetchAssigned();
    fetchNearby();
  }, [fetchAssigned, fetchNearby]);

  // Socket.io
  useEffect(() => {
    const socket = connectSocket();
    assignedBookings.forEach((b) => joinBookingRoom(b._id));

    socket.on('STATUS_CHANGED', ({ bookingId, status }) => {
      setAssignedBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status } : b))
      );
    });

    return () => {
      socket.off('STATUS_CHANGED');
    };
  }, [assignedBookings.length]);

  // Accept booking
  const acceptBooking = async (id) => {
    try {
      await api.patch(`/bookings/${id}/accept`);
      fetchNearby();
      fetchAssigned();
    } catch (err) {
      console.error('Accept error:', err);
    }
  };

  // Update status
  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}/update-status`, { status });
      fetchAssigned();
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  // Scan QR
  const handleScanQR = async () => {
    if (!scanModal || !qrInput) return;
    setScanLoading(true);
    setScanResult(null);
    try {
      await api.patch(`/bookings/${scanModal._id}/scan-qr`, {
        qrToken: qrInput,
      });
      setScanResult('success');
      setTimeout(() => {
        setScanModal(null);
        setScanResult(null);
        setQrInput('');
        fetchAssigned();
      }, 1500);
    } catch (err) {
      setScanResult('error');
    } finally {
      setScanLoading(false);
    }
  };

  // Attach barcode
  const handleAttachBarcode = async () => {
    if (!barcodeModal || !barcodeInput) return;
    setBarcodeLoading(true);
    try {
      await api.patch(`/bookings/${barcodeModal._id}/attach-barcode`, {
        barcode: barcodeInput,
      });
      setBarcodeModal(null);
      setBarcodeInput('');
      fetchAssigned();
    } catch (err) {
      console.error('Barcode error:', err);
    } finally {
      setBarcodeLoading(false);
    }
  };

  // Broadcast location
  const toggleSimulation = (booking) => {
    const bookingId = booking._id;

    if (simulations[bookingId]?.active) {
      // Stop
      clearInterval(intervalsRef.current[bookingId]);
      delete intervalsRef.current[bookingId];
      setSimulations((prev) => ({
        ...prev,
        [bookingId]: { active: false, progress: 0 },
      }));
    } else {
      // Start
      const start = [parseFloat(simLng), parseFloat(simLat)];
      const end = booking.patientLocation?.coordinates && booking.patientLocation.coordinates[0] !== 0
        ? booking.patientLocation.coordinates
        : [start[0] + 0.01, start[1] + 0.01]; // slightly offset if patient coords are [0,0]

      const totalSteps = 15;
      let step = 0;

      setSimulations((prev) => ({
        ...prev,
        [bookingId]: { active: true, progress: 0 },
      }));

      intervalsRef.current[bookingId] = setInterval(() => {
        step++;
        const ratio = step / totalSteps;
        const currentLng = start[0] + (end[0] - start[0]) * ratio;
        const currentLat = start[1] + (end[1] - start[1]) * ratio;

        // Emit Socket.io location update
        sendLocation(bookingId, currentLat, currentLng);

        // Update progress
        setSimulations((prev) => ({
          ...prev,
          [bookingId]: {
            active: true,
            progress: Math.round(ratio * 100),
            currentCoords: [currentLng, currentLat],
          },
        }));

        setSimLat(currentLat.toFixed(4));
        setSimLng(currentLng.toFixed(4));

        if (step >= totalSteps) {
          clearInterval(intervalsRef.current[bookingId]);
          delete intervalsRef.current[bookingId];
          setSimulations((prev) => ({
            ...prev,
            [bookingId]: { active: false, progress: 100, completed: true },
          }));
        }
      }, 1500); // Update coordinates every 1.5 seconds
    }
  };

  const getNextStatus = (current) => {
    return null; // Disabled manual progression to enforce QR & Barcode usage
  };

  return (
    <div className="min-h-screen bg-bg-primary pb-16">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
              Phlebotomist <span className="gradient-text">Agent Portal</span>
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              Manage assigned sample routes, verify patient QR tokens, and link blood tube barcodes.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-bg-secondary p-3 border border-border-custom text-xs">
            <div className={`h-2 w-2 rounded-full ${phlebCoords[0] !== 72.8856 ? 'bg-accent-primary animate-pulse' : 'bg-accent-warm'}`} />
            <span className="text-text-secondary">
              📍 {locationName}
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mb-8 grid grid-cols-2 sm:grid-cols-3 gap-5">
          <div className="glass-card flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-secondary/15 border border-accent-secondary/20">
              <ClipboardList className="h-6 w-6 text-accent-secondary" />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-text-primary">
                {assignedBookings.length}
              </p>
              <p className="text-xs font-medium text-text-muted mt-0.5">Assigned Routes</p>
            </div>
          </div>
          <div className="glass-card flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-primary/15 border border-accent-primary/20">
              <Radar className="h-6 w-6 text-accent-primary" />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-text-primary">
                {nearbyBookings.length}
              </p>
              <p className="text-xs font-medium text-text-muted mt-0.5">Nearby (10km)</p>
            </div>
          </div>
          <div className="glass-card flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-warm/15 border border-accent-warm/20">
              <Navigation className="h-6 w-6 text-accent-warm" />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-text-primary">
                {assignedBookings.filter((b) => b.status === 'en_route').length}
              </p>
              <p className="text-xs font-medium text-text-muted mt-0.5">Active En Route</p>
            </div>
          </div>
        </div>

        {/* Ride Simulation Controller */}
        <div className="mb-8 glass-card p-6 border-accent-primary/30 shadow-glow-primary relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-primary/20 text-accent-primary pulse-glow">
              <Car className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">En Route Transit Simulator</h3>
              <p className="text-xs text-text-muted">Simulate and stream live map movements to patients while en route.</p>
            </div>
          </div>

          {assignedBookings.filter(b => b.status === 'en_route').length === 0 ? (
            <div className="rounded-xl bg-bg-secondary/40 border border-border-custom p-4 text-center text-xs text-text-muted">
              💡 No active "En Route" collection requests. Change a job's status to <strong>"En Route"</strong> below to enable live ride tracking simulation.
            </div>
          ) : (
            <div className="space-y-4">
              {assignedBookings.filter(b => b.status === 'en_route').map(booking => {
                const sim = simulations[booking._id] || { active: false, progress: 0 };
                return (
                  <div key={booking._id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-bg-secondary border border-border-custom">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-text-secondary">{booking.test?.testName}</p>
                      <p className="text-sm font-bold text-text-primary mt-0.5">Patient: {booking.patient?.name}</p>
                      {sim.active && (
                        <div className="mt-3">
                          <div className="flex justify-between text-[10px] text-text-muted mb-1 font-mono">
                            <span>Simulating drive...</span>
                            <span>{sim.progress}% Complete</span>
                          </div>
                          <div className="w-full bg-bg-primary rounded-full h-1.5 overflow-hidden">
                            <div className="bg-accent-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${sim.progress}%` }} />
                          </div>
                        </div>
                      )}
                      {sim.completed && !sim.active && (
                        <p className="text-xs text-accent-primary font-semibold flex items-center gap-1 mt-2">
                          <CheckCircle2 className="h-4 w-4" /> Agent arrived at destination! Verify patient QR code below.
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => toggleSimulation(booking)}
                      className={`py-2 px-4 text-xs font-semibold rounded-xl flex items-center gap-2 transition ${sim.active
                        ? 'bg-accent-danger/20 border border-accent-danger/30 text-accent-danger hover:bg-accent-danger/30'
                        : 'btn-glow'
                        }`}
                    >
                      {sim.active ? (
                        <>
                          <Square className="h-3.5 w-3.5 fill-current" />
                          Stop Simulator
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5 fill-current" />
                          {sim.completed ? 'Restart Simulator' : 'Start Ride Simulation'}
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 flex gap-2 rounded-2xl bg-bg-secondary p-1.5 border border-border-custom">
          {[
            { key: 'assigned', label: 'My Assigned Routes', icon: ClipboardList, count: assignedBookings.length },
            { key: 'nearby', label: 'Available Nearby Requests', icon: Radar, count: nearbyBookings.length },
          ].map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => {
                setActiveTab(key);
                if (key === 'nearby') fetchNearby();
              }}
              className={`flex flex-1 items-center justify-center gap-2.5 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 ${activeTab === key
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

        {/* ─── ASSIGNED TAB ─── */}
        {activeTab === 'assigned' && (
          <div className="animate-fade-in space-y-6">
            {loadingAssigned ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-accent-primary" />
              </div>
            ) : assignedBookings.length === 0 ? (
              <div className="glass-card flex flex-col items-center justify-center py-20 text-center p-8">
                <ClipboardList className="mb-4 h-14 w-14 text-text-muted/30" />
                <h3 className="text-xl font-bold text-text-primary">No Assigned Routes</h3>
                <p className="mt-1 text-sm text-text-muted">
                  Accept nearby collection requests to build your schedule.
                </p>
              </div>
            ) : (
              assignedBookings.map((booking) => (
                <div key={booking._id} className="glass-card p-6 sm:p-8 space-y-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border-custom pb-4">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-xl font-bold text-text-primary">
                          {booking.test?.testName}
                        </h3>
                        <StatusBadge status={booking.status} />
                      </div>
                      <p className="mt-1.5 text-xs text-text-muted flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-accent-primary" />
                        Patient: <strong className="text-text-primary">{booking.patient?.name}</strong> ({booking.patient?.email})
                      </p>
                      <p className="mt-1 text-xs text-text-muted flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-accent-secondary" />
                        Scheduled Slot: {new Date(booking.slot).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons Toolbar */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {booking.status === 'en_route' && (
                      <button
                        onClick={() => setScanModal(booking)}
                        className="btn-glow px-5 py-2.5 text-xs flex items-center gap-2"
                      >
                        <QrCode className="h-4 w-4" />
                        Scan Patient QR Code
                      </button>
                    )}

                    {booking.status === 'arrived' && (
                      <button
                        onClick={() => setBarcodeModal(booking)}
                        className="btn-glow px-5 py-2.5 text-xs flex items-center gap-2"
                      >
                        <Barcode className="h-4 w-4" />
                        Attach Tube Barcode
                      </button>
                    )}

                    {/* Manual advance removed to enforce scanning */}

                    {booking.status === 'sample_collected' && (
                      <button
                        onClick={() => updateStatus(booking._id, 'in_transit')}
                        className="btn-secondary border-accent-warm/40 text-accent-warm hover:bg-accent-warm/10 px-5 py-2.5 text-xs flex items-center gap-2"
                      >
                        <Truck className="h-4 w-4" />
                        Dispatch Sample to Lab
                      </button>
                    )}
                  </div>

                  {/* Barcode readout */}
                  {booking.sampleBarcode && (
                    <div className="flex items-center gap-3 rounded-xl bg-accent-primary/10 border border-accent-primary/30 p-4">
                      <TestTube2 className="h-5 w-5 text-accent-primary" />
                      <div>
                        <p className="text-xs text-text-muted">Linked Barcode ID</p>
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

        {/* ─── NEARBY TAB ─── */}
        {activeTab === 'nearby' && (
          <div className="animate-fade-in space-y-4">
            {loadingNearby ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-accent-primary" />
              </div>
            ) : nearbyBookings.length === 0 ? (
              <div className="glass-card flex flex-col items-center justify-center py-20 text-center p-8">
                <Radar className="mb-4 h-14 w-14 text-text-muted/30" />
                <h3 className="text-xl font-bold text-text-primary">No Nearby Unassigned Requests</h3>
                <p className="mt-1 text-sm text-text-muted">
                  No pending patient requests found within 10km of your coordinates.
                </p>
              </div>
            ) : (
              nearbyBookings.map((booking) => (
                <div key={booking._id} className="glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-text-primary">
                      {booking.test?.testName}
                    </h3>
                    <p className="text-xs text-text-muted flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-accent-primary" />
                      Patient: {booking.patient?.name}
                    </p>
                    <p className="text-xs text-text-muted flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-accent-secondary" />
                      Slot: {new Date(booking.slot).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => acceptBooking(booking._id)}
                    className="btn-glow px-6 py-2.5 text-xs flex items-center gap-2 self-start sm:self-auto"
                  >
                    <Check className="h-4 w-4" />
                    Accept Request
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* ─── QR SCAN MODAL ─── */}
      {scanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="animate-fade-in glass-card w-full max-w-lg p-8 border-accent-primary/40 shadow-glow-primary">
            <div className="mb-6 flex items-center justify-between border-b border-border-custom pb-4">
              <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <QrCode className="h-6 w-6 text-accent-primary" />
                Patient QR Token Verification
              </h3>
              <button
                onClick={() => {
                  setScanModal(null);
                  setQrInput('');
                  setScanResult(null);
                }}
                className="rounded-xl p-2 text-text-muted hover:bg-bg-card hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-4 text-xs text-text-muted leading-relaxed">
              Enter or paste the patient's QR token code to verify arrival for:{' '}
              <strong className="text-text-primary">{scanModal.test?.testName}</strong>
            </p>

            <input
              type="text"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              className="input-styled mb-5 py-3.5 font-mono text-sm"
              placeholder="Paste QR token string..."
            />

            {scanResult === 'success' && (
              <div className="mb-5 flex items-center gap-2 rounded-xl bg-accent-primary/15 border border-accent-primary/30 p-4 text-sm font-semibold text-accent-primary">
                <Check className="h-5 w-5" />
                QR verified! Status updated to Arrived.
              </div>
            )}
            {scanResult === 'error' && (
              <div className="mb-5 rounded-xl bg-accent-danger/15 border border-accent-danger/30 p-4 text-sm font-semibold text-accent-danger">
                Invalid QR token. Verification failed.
              </div>
            )}

            <button
              onClick={handleScanQR}
              disabled={!qrInput || scanLoading}
              className="btn-glow w-full py-3.5 text-sm flex items-center justify-center gap-2"
            >
              {scanLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Verify & Mark Arrived
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ─── BARCODE MODAL ─── */}
      {barcodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="animate-fade-in glass-card w-full max-w-lg p-8 border-accent-primary/40 shadow-glow-primary">
            <div className="mb-6 flex items-center justify-between border-b border-border-custom pb-4">
              <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <Barcode className="h-6 w-6 text-accent-primary" />
                Attach Blood Tube Barcode
              </h3>
              <button
                onClick={() => {
                  setBarcodeModal(null);
                  setBarcodeInput('');
                }}
                className="rounded-xl p-2 text-text-muted hover:bg-bg-card hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-4 text-xs text-text-muted leading-relaxed">
              Scan or enter the unique tube barcode for:{' '}
              <strong className="text-text-primary">{barcodeModal.test?.testName}</strong>
            </p>

            <input
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="input-styled mb-5 py-3.5 font-mono text-sm"
              placeholder="e.g. SBT-2024-00123"
            />

            <button
              onClick={handleAttachBarcode}
              disabled={!barcodeInput || barcodeLoading}
              className="btn-glow w-full py-3.5 text-sm flex items-center justify-center gap-2"
            >
              {barcodeLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Attach Barcode & Complete Collection
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
