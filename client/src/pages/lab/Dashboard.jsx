import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { connectSocket, joinBookingRoom } from '../../services/socket';
import { StatusBadge } from '../../components/StatusBadge';
import Navbar from '../../components/Navbar';
import {
  FlaskConical,
  Search,
  CheckCircle2,
  FileUp,
  Loader2,
  User,
  Calendar,
  TestTube2,
  ArrowRight,
  X,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export default function LabDashboard() {
  const { user } = useAuth();
  const [incomingBookings, setIncomingBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('incoming');
  const [loading, setLoading] = useState(true);

  // Barcode search lookup state
  const [barcodeSearch, setBarcodeSearch] = useState('');
  const [searchedBooking, setSearchedBooking] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  // Upload modal state
  const [uploadModal, setUploadModal] = useState(null);
  const [reportUrlInput, setReportUrlInput] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [incomingRes, allRes] = await Promise.all([
        api.get('/bookings/lab/incoming'),
        api.get('/bookings/lab/all'),
      ]);
      setIncomingBookings(incomingRes.data);
      setAllBookings(allRes.data);
    } catch (err) {
      console.error('Fetch lab error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Socket.io
  useEffect(() => {
    const socket = connectSocket();
    allBookings.forEach((b) => joinBookingRoom(b._id));

    socket.on('STATUS_CHANGED', () => fetchData());
    socket.on('SAMPLE_ATTACHED', () => fetchData());

    return () => {
      socket.off('STATUS_CHANGED');
      socket.off('SAMPLE_ATTACHED');
    };
  }, [allBookings.length, fetchData]);

  // Search by barcode
  const handleBarcodeSearch = async (e) => {
    e.preventDefault();
    if (!barcodeSearch) return;
    setSearchLoading(true);
    setSearchError('');
    setSearchedBooking(null);
    try {
      const res = await api.get(`/bookings/lab/barcode/${barcodeSearch.trim()}`);
      setSearchedBooking(res.data);
    } catch (err) {
      setSearchError(err.response?.data?.message || 'Sample not found.');
    } finally {
      setSearchLoading(false);
    }
  };

  // Process sample (move from sample_collected/in_transit to processing)
  const processSample = async (id) => {
    try {
      await api.patch(`/bookings/${id}/process`);
      fetchData();
      if (searchedBooking?._id === id) {
        setSearchedBooking((prev) => ({ ...prev, status: 'processing' }));
      }
    } catch (err) {
      console.error('Process error:', err);
    }
  };

  // Upload report PDF URL
  const handleUploadReport = async () => {
    if (!uploadModal || !reportUrlInput) return;
    setUploadLoading(true);
    try {
      await api.patch(`/bookings/${uploadModal._id}/upload-report`, {
        reportUrl: reportUrlInput,
      });
      setUploadModal(null);
      setReportUrlInput('');
      fetchData();
      if (searchedBooking?._id === uploadModal._id) {
        setSearchedBooking((prev) => ({
          ...prev,
          status: 'completed',
          reportUrl: reportUrlInput,
        }));
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploadLoading(false);
    }
  };

  const generateMockReportUrl = () => {
    setReportUrlInput(
      'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    );
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
            <span className="gradient-text">Laboratory</span> Operations
          </h1>
          <p className="mt-1 text-text-muted">
            Verify sample tube barcodes, run diagnostic analysis, and issue verified reports.
          </p>
        </div>

        {/* Barcode Verification Search Bar */}
        <div className="mb-8 glass-card p-6 border-accent-purple/30">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent-purple flex items-center gap-2">
            <TestTube2 className="h-4 w-4" />
            Barcode Verification Tool
          </h2>
          <form onSubmit={handleBarcodeSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={barcodeSearch}
                onChange={(e) => setBarcodeSearch(e.target.value)}
                className="input-styled pl-10"
                placeholder="Scan or enter sample barcode (e.g. SBT-2024-00123)..."
              />
            </div>
            <button type="submit" disabled={searchLoading} className="btn-glow flex items-center justify-center gap-2 px-6">
              {searchLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Verify Barcode
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Search Result display */}
          {searchError && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-accent-danger/10 border border-accent-danger/30 p-3 text-sm text-accent-danger">
              <ShieldAlert className="h-4 w-4" />
              {searchError}
            </div>
          )}

          {searchedBooking && (
            <div className="mt-4 animate-fade-in rounded-xl bg-bg-secondary p-4 border border-accent-purple/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-accent-primary">
                      {searchedBooking.sampleBarcode}
                    </span>
                    <StatusBadge status={searchedBooking.status} />
                  </div>
                  <h4 className="font-semibold text-text-primary mt-1">
                    {searchedBooking.test?.testName}
                  </h4>
                  <p className="text-xs text-text-muted mt-0.5">
                    Patient: {searchedBooking.patient?.name} ({searchedBooking.patient?.email})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {['sample_collected', 'in_transit'].includes(searchedBooking.status) && (
                    <button
                      onClick={() => processSample(searchedBooking._id)}
                      className="btn-secondary text-xs flex items-center gap-1.5"
                    >
                      <FlaskConical className="h-3.5 w-3.5 text-accent-purple" />
                      Start Testing
                    </button>
                  )}

                  {searchedBooking.status === 'processing' && (
                    <button
                      onClick={() => {
                        setUploadModal(searchedBooking);
                        generateMockReportUrl();
                      }}
                      className="btn-glow text-xs flex items-center gap-1.5"
                    >
                      <FileUp className="h-3.5 w-3.5" />
                      Upload Report
                    </button>
                  )}

                  {searchedBooking.status === 'completed' && (
                    <a
                      href={searchedBooking.reportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-xs flex items-center gap-1.5 text-accent-primary"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View Report
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 flex gap-1 rounded-xl bg-bg-secondary p-1">
          {[
            { key: 'incoming', label: 'Incoming & Active Samples', icon: FlaskConical, count: incomingBookings.length },
            { key: 'all', label: 'All Test Records', icon: Calendar, count: allBookings.length },
          ].map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === key
                  ? 'bg-bg-card text-accent-purple shadow-sm'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
              {count > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-purple/20 px-1.5 text-xs font-semibold text-accent-purple">
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-accent-purple" />
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {(activeTab === 'incoming' ? incomingBookings : allBookings).length === 0 ? (
              <div className="glass-card flex flex-col items-center justify-center py-16 text-center">
                <FlaskConical className="mb-3 h-12 w-12 text-text-muted/30" />
                <p className="text-lg font-medium text-text-muted">
                  No samples found
                </p>
              </div>
            ) : (
              (activeTab === 'incoming' ? incomingBookings : allBookings).map((booking) => (
                <div key={booking._id} className="glass-card p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-text-primary">
                          {booking.test?.testName}
                        </h3>
                        <StatusBadge status={booking.status} />
                        {booking.sampleBarcode && (
                          <span className="rounded-md bg-accent-primary/10 border border-accent-primary/20 px-2 py-0.5 text-xs font-mono font-semibold text-accent-primary">
                            {booking.sampleBarcode}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-text-muted flex-wrap">
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          Patient: {booking.patient?.name}
                        </span>
                        {booking.phlebotomist && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            Phleb: {booking.phlebotomist.name}
                          </span>
                        )}
                        <span>
                          Type: <strong className="text-text-secondary">{booking.test?.sampleType}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {['sample_collected', 'in_transit'].includes(booking.status) && (
                        <button
                          onClick={() => processSample(booking._id)}
                          className="btn-secondary text-xs flex items-center gap-1.5"
                        >
                          <FlaskConical className="h-3.5 w-3.5 text-accent-purple" />
                          Process Sample
                        </button>
                      )}

                      {booking.status === 'processing' && (
                        <button
                          onClick={() => {
                            setUploadModal(booking);
                            generateMockReportUrl();
                          }}
                          className="btn-glow text-xs flex items-center gap-1.5"
                        >
                          <FileUp className="h-3.5 w-3.5" />
                          Upload Report
                        </button>
                      )}

                      {booking.status === 'completed' && booking.reportUrl && (
                        <a
                          href={booking.reportUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary text-xs flex items-center gap-1.5 text-accent-primary"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Report Attached
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* ─── UPLOAD REPORT MODAL ─── */}
      {uploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="animate-fade-in glass-card w-full max-w-md p-6 border-accent-purple/40">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">
                <FileUp className="mr-2 inline h-5 w-5 text-accent-purple" />
                Publish Diagnostic Report
              </h3>
              <button
                onClick={() => {
                  setUploadModal(null);
                  setReportUrlInput('');
                }}
                className="rounded-lg p-1 text-text-muted hover:bg-bg-card"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-3 text-sm text-text-muted">
              Attaching diagnostic PDF report for:{' '}
              <span className="font-semibold text-text-primary">
                {uploadModal.test?.testName}
              </span>{' '}
              ({uploadModal.patient?.name})
            </p>

            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">
                Report PDF Document URL
              </label>
              <input
                type="url"
                value={reportUrlInput}
                onChange={(e) => setReportUrlInput(e.target.value)}
                className="input-styled text-xs font-mono"
                placeholder="https://..."
              />
              <button
                type="button"
                onClick={generateMockReportUrl}
                className="mt-2 text-xs font-medium text-accent-purple hover:underline flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" />
                Insert Sample Demo PDF Link
              </button>
            </div>

            <button
              onClick={handleUploadReport}
              disabled={!reportUrlInput || uploadLoading}
              className="btn-glow flex w-full items-center justify-center gap-2"
            >
              {uploadLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Mark Completed & Notify Patient
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
