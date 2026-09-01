import { useState, useEffect, useCallback, useMemo } from 'react';
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
  BarChart2,
  Settings,
  Plus,
  Trash2,
  Edit,
  Power
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';

export default function LabDashboard() {
  const { user } = useAuth();
  const [incomingBookings, setIncomingBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [testServices, setTestServices] = useState([]);
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

  // Test Service Modal state
  const [serviceModal, setServiceModal] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    testName: '', price: '', fastingHours: '', sampleType: 'Serum', category: '', description: ''
  });
  const [serviceLoading, setServiceLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [incomingRes, allRes, servicesRes] = await Promise.all([
        api.get('/bookings/lab/incoming'),
        api.get('/bookings/lab/all'),
        api.get('/tests/admin')
      ]);
      setIncomingBookings(incomingRes.data);
      setAllBookings(allRes.data);
      setTestServices(servicesRes.data);
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

  // Handle Barcode
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
    setReportUrlInput('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
  };

  // Service CRUD
  const openServiceModal = (service = null) => {
    if (service) {
      setCurrentService(service);
      setServiceForm({
        testName: service.testName,
        price: service.price,
        fastingHours: service.fastingHours,
        sampleType: service.sampleType,
        category: service.category,
        description: service.description
      });
    } else {
      setCurrentService(null);
      setServiceForm({ testName: '', price: '', fastingHours: '', sampleType: 'Serum', category: '', description: '' });
    }
    setServiceModal(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    setServiceLoading(true);
    try {
      if (currentService) {
        await api.put(`/tests/${currentService._id}`, serviceForm);
      } else {
        await api.post('/tests', serviceForm);
      }
      setServiceModal(false);
      fetchData();
    } catch (err) {
      console.error('Save service error:', err);
    } finally {
      setServiceLoading(false);
    }
  };

  const toggleServiceActive = async (service) => {
    try {
      await api.put(`/tests/${service._id}`, { isActive: !service.isActive });
      fetchData();
    } catch (err) {
      console.error('Toggle service error:', err);
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    try {
      await api.delete(`/tests/${id}`);
      fetchData();
    } catch (err) {
      console.error('Delete service error:', err);
    }
  };

  // Analytics Data Prep
  const pieData = useMemo(() => {
    const counts = { completed: 0, processing: 0, pending: 0 };
    allBookings.forEach(b => {
      if (b.status === 'completed') counts.completed++;
      else if (b.status === 'processing') counts.processing++;
      else counts.pending++;
    });
    return [
      { name: 'Completed', value: counts.completed, color: '#06d6a0' },
      { name: 'Processing', value: counts.processing, color: '#00b4d8' },
      { name: 'Pending', value: counts.pending, color: '#f77f00' },
    ];
  }, [allBookings]);

  const barData = useMemo(() => {
    // Group by day for the last 7 days
    const days = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days[d.toLocaleDateString('en-US', { weekday: 'short' })] = { name: d.toLocaleDateString('en-US', { weekday: 'short' }), completed: 0, processing: 0 };
    }

    allBookings.forEach(b => {
      const bDate = new Date(b.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
      if (days[bDate]) {
        if (b.status === 'completed') days[bDate].completed++;
        if (b.status === 'processing') days[bDate].processing++;
      }
    });
    return Object.values(days);
  }, [allBookings]);

  return (
    <div className="min-h-screen bg-bg-primary pb-16">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-text-primary sm:text-3xl">
            <span className="gradient-text">Laboratory</span> Operations
          </h1>
          <p className="mt-1 text-text-muted">
            Verify sample tube barcodes, manage test catalogs, and track analytics.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 flex gap-2 rounded-2xl bg-bg-secondary p-1.5 border border-border-custom overflow-x-auto">
          {[
            { key: 'incoming', label: 'Incoming Samples', icon: FlaskConical, count: incomingBookings.length },
            { key: 'all', label: 'All Records', icon: Calendar, count: allBookings.length },
            { key: 'analytics', label: 'Analytics', icon: BarChart2, count: 0 },
            { key: 'services', label: 'Test Services', icon: Settings, count: testServices.length },
          ].map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex flex-1 min-w-max items-center justify-center gap-2.5 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 ${activeTab === key
                ? 'bg-bg-card text-accent-purple shadow-md border border-accent-purple/30'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-card/50'
                }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              {count > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent-purple/20 px-1.5 text-xs font-semibold text-accent-purple">
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-accent-purple" />
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">

            {/* ANALYTICS TAB */}
            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6 border-accent-purple/30">
                  <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-accent-purple" /> Overall Test Status
                  </h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5}>
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-\${index}`} fill={entry.color} stroke="transparent" />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ backgroundColor: '#1a1f35', borderColor: '#2a3050', borderRadius: '8px' }} itemStyle={{ color: '#f1f5f9' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-6 mt-4">
                    {pieData.map((entry, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-text-muted">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        {entry.name}: <strong className="text-text-primary">{entry.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-6 border-accent-secondary/30">
                  <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-accent-secondary" /> Daily Processing Activity (Last 7 Days)
                  </h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <RechartsTooltip cursor={{ fill: '#2a3050', opacity: 0.4 }} contentStyle={{ backgroundColor: '#1a1f35', borderColor: '#2a3050', borderRadius: '8px', color: '#f1f5f9' }} />
                        <Bar dataKey="completed" name="Completed" fill="#06d6a0" radius={[4, 4, 0, 0]} stackId="a" />
                        <Bar dataKey="processing" name="Processing" fill="#00b4d8" radius={[4, 4, 0, 0]} stackId="a" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* SERVICES TAB */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">Manage Test Catalog</h2>
                    <p className="text-sm text-text-muted mt-1">Create, update, and toggle services visible to patients.</p>
                  </div>
                  <button onClick={() => openServiceModal()} className="btn-glow px-5 py-2.5 flex items-center gap-2 text-sm">
                    <Plus className="h-4 w-4" /> Add New Service
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {testServices.map(test => (
                    <div key={test._id} className={`glass-card p-5 relative overflow-hidden ${!test.isActive ? 'opacity-70 grayscale-[30%]' : ''}`}>
                      {!test.isActive && <div className="absolute top-0 right-0 bg-accent-danger text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">INACTIVE</div>}
                      <h3 className="font-bold text-text-primary text-lg mb-1 pr-16">{test.testName}</h3>
                      <p className="text-xs text-accent-purple font-semibold mb-3">{test.category} • ₹{test.price}</p>
                      <p className="text-xs text-text-muted mb-4 line-clamp-2">{test.description}</p>

                      <div className="flex items-center gap-2 border-t border-border-custom pt-4">
                        <button onClick={() => toggleServiceActive(test)} className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 border ${test.isActive ? 'bg-accent-danger/10 text-accent-danger border-accent-danger/30 hover:bg-accent-danger/20' : 'bg-accent-primary/10 text-accent-primary border-accent-primary/30 hover:bg-accent-primary/20'}`}>
                          <Power className="h-3.5 w-3.5" /> {test.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => openServiceModal(test)} className="p-1.5 rounded-lg bg-bg-secondary text-text-muted hover:text-accent-secondary hover:bg-accent-secondary/10 transition border border-transparent hover:border-accent-secondary/30">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteService(test._id)} className="p-1.5 rounded-lg bg-bg-secondary text-text-muted hover:text-accent-danger hover:bg-accent-danger/10 transition border border-transparent hover:border-accent-danger/30">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
            }

            {/* INCOMING & ALL SAMPLES TAB */}
            {
              (activeTab === 'incoming' || activeTab === 'all') && (
                <>
                  <div className="mb-6 glass-card p-6 border-accent-purple/30">
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent-purple flex items-center gap-2">
                      <TestTube2 className="h-4 w-4" /> Barcode Verification Tool
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
                        {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ArrowRight className="h-4 w-4" /> Verify Barcode</>}
                      </button>
                    </form>

                    {searchError && (
                      <div className="mt-4 flex items-center gap-2 rounded-lg bg-accent-danger/10 border border-accent-danger/30 p-3 text-sm text-accent-danger">
                        <ShieldAlert className="h-4 w-4" /> {searchError}
                      </div>
                    )}

                    {searchedBooking && (
                      <div className="mt-4 animate-fade-in rounded-xl bg-bg-secondary p-4 border border-accent-purple/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-base font-bold text-accent-primary">{searchedBooking.sampleBarcode}</span>
                            <StatusBadge status={searchedBooking.status} />
                          </div>
                          <h4 className="font-semibold text-text-primary mt-1">{searchedBooking.test?.testName}</h4>
                          <p className="text-xs text-text-muted mt-0.5 flex items-center gap-2 flex-wrap">
                            Patient: {searchedBooking.patient?.name}
                            {searchedBooking.patient?.age && (
                              <span className="rounded-md bg-bg-primary border border-border-custom px-1.5 py-0.5 text-[10px] font-semibold text-text-secondary uppercase">
                                {searchedBooking.patient.age}Y • {searchedBooking.patient.gender}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {['sample_collected', 'in_transit'].includes(searchedBooking.status) && (
                            <button onClick={() => processSample(searchedBooking._id)} className="btn-secondary text-xs flex items-center gap-1.5">
                              <FlaskConical className="h-3.5 w-3.5 text-accent-purple" /> Start Testing
                            </button>
                          )}
                          {searchedBooking.status === 'processing' && (
                            <button onClick={() => { setUploadModal(searchedBooking); generateMockReportUrl(); }} className="btn-glow text-xs flex items-center gap-1.5">
                              <FileUp className="h-3.5 w-3.5" /> Upload Report
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {(activeTab === 'incoming' ? incomingBookings : allBookings).length === 0 ? (
                    <div className="glass-card flex flex-col items-center justify-center py-16 text-center">
                      <FlaskConical className="mb-3 h-12 w-12 text-text-muted/30" />
                      <p className="text-lg font-medium text-text-muted">No samples found</p>
                    </div>
                  ) : (
                    (activeTab === 'incoming' ? incomingBookings : allBookings).map((booking) => (
                      <div key={booking._id} className="glass-card p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-text-primary">{booking.test?.testName}</h3>
                              <StatusBadge status={booking.status} />
                              {booking.sampleBarcode && <span className="rounded-md bg-accent-primary/10 border border-accent-primary/20 px-2 py-0.5 text-xs font-mono font-semibold text-accent-primary">{booking.sampleBarcode}</span>}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-text-muted flex-wrap">
                              <span className="flex items-center gap-1 flex-wrap">
                                <User className="h-3.5 w-3.5" /> Patient: {booking.patient?.name}
                                {booking.patient?.age && (
                                  <span className="ml-1 rounded-md bg-bg-primary border border-border-custom px-1.5 py-0.5 text-[10px] font-semibold text-text-secondary uppercase">
                                    {booking.patient.age}Y • {booking.patient.gender}
                                  </span>
                                )}
                              </span>
                              {booking.phlebotomist && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Phleb: {booking.phlebotomist.name}</span>}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            {['sample_collected', 'in_transit'].includes(booking.status) && (
                              <button onClick={() => processSample(booking._id)} className="btn-secondary text-xs flex items-center gap-1.5">
                                <FlaskConical className="h-3.5 w-3.5 text-accent-purple" /> Process Sample
                              </button>
                            )}
                            {booking.status === 'processing' && (
                              <button onClick={() => { setUploadModal(booking); generateMockReportUrl(); }} className="btn-glow text-xs flex items-center gap-1.5">
                                <FileUp className="h-3.5 w-3.5" /> Upload Report
                              </button>
                            )}
                            {booking.status === 'completed' && booking.reportUrl && (
                              <a href={booking.reportUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs flex items-center gap-1.5 text-accent-primary">
                                <ExternalLink className="h-3.5 w-3.5" /> Report Attached
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )
            }
          </div >
        )}
      </main >

      {/* UPLOAD REPORT MODAL */}
      {
        uploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="animate-fade-in glass-card w-full max-w-md p-6 border-accent-purple/40">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary">
                  <FileUp className="mr-2 inline h-5 w-5 text-accent-purple" /> Publish Diagnostic Report
                </h3>
                <button onClick={() => { setUploadModal(null); setReportUrlInput(''); }} className="rounded-lg p-1 text-text-muted hover:bg-bg-card">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mb-3 text-sm text-text-muted">
                Attaching diagnostic PDF report for: <span className="font-semibold text-text-primary">{uploadModal.test?.testName}</span> ({uploadModal.patient?.name})
              </p>
              <div className="mb-4">
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">Report PDF Document URL</label>
                <input type="url" value={reportUrlInput} onChange={(e) => setReportUrlInput(e.target.value)} className="input-styled text-xs font-mono" placeholder="https://..." />
                <button type="button" onClick={generateMockReportUrl} className="mt-2 text-xs font-medium text-accent-purple hover:underline flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Insert Sample Demo PDF Link
                </button>
              </div>
              <button onClick={handleUploadReport} disabled={!reportUrlInput || uploadLoading} className="btn-glow flex w-full items-center justify-center gap-2">
                {uploadLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CheckCircle2 className="h-4 w-4" /> Mark Completed & Notify Patient</>}
              </button>
            </div>
          </div>
        )
      }

      {/* CREATE/EDIT SERVICE MODAL */}
      {
        serviceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="animate-fade-in glass-card w-full max-w-lg p-6 border-accent-primary/40">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary">
                  {currentService ? 'Edit Test Service' : 'Create New Test Service'}
                </h3>
                <button onClick={() => setServiceModal(false)} className="rounded-lg p-1 text-text-muted hover:bg-bg-card">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveService} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-text-secondary">Test Name</label>
                  <input required type="text" value={serviceForm.testName} onChange={e => setServiceForm({ ...serviceForm, testName: e.target.value })} className="input-styled" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-text-secondary">Price (₹)</label>
                    <input required type="number" min="0" value={serviceForm.price} onChange={e => setServiceForm({ ...serviceForm, price: e.target.value })} className="input-styled" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-text-secondary">Fasting Hours</label>
                    <input required type="number" min="0" value={serviceForm.fastingHours} onChange={e => setServiceForm({ ...serviceForm, fastingHours: e.target.value })} className="input-styled" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-text-secondary">Category</label>
                    <input required type="text" value={serviceForm.category} onChange={e => setServiceForm({ ...serviceForm, category: e.target.value })} className="input-styled" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-text-secondary">Sample Type</label>
                    <select required value={serviceForm.sampleType} onChange={e => setServiceForm({ ...serviceForm, sampleType: e.target.value })} className="input-styled">
                      <option value="Serum">Serum</option>
                      <option value="EDTA">EDTA</option>
                      <option value="Fluoride">Fluoride</option>
                      <option value="Citrate">Citrate</option>
                      <option value="Heparin">Heparin</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-text-secondary">Description</label>
                  <textarea required rows={3} value={serviceForm.description} onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })} className="input-styled resize-none" />
                </div>

                <button type="submit" disabled={serviceLoading} className="btn-glow w-full flex justify-center py-3">
                  {serviceLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Service'}
                </button>
              </form>
            </div>
          </div>
        )
      }
    </div >
  );
}
