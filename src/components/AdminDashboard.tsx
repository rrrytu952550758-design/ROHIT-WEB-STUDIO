import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  ServiceItem,
  BugRequest,
  CustomerInquiry,
  CMSContentState,
  BugStatus,
  InquiryStatus
} from '../types';
import { DEFAULT_SERVICES, DEFAULT_HERO_CONTENT, DEFAULT_PORTFOLIO, DEFAULT_TESTIMONIALS } from '../data/defaultData';
import {
  ShieldCheck,
  LayoutDashboard,
  Wrench,
  Bug,
  Mail,
  Sliders,
  Users,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertTriangle,
  Clock,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  Save,
  ArrowLeft,
  ExternalLink,
  Flame,
  CheckCircle2
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToHome: () => void;
  cmsContent: CMSContentState;
  onUpdateCMS: (newCms: CMSContentState) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToHome,
  cmsContent,
  onUpdateCMS
}) => {
  const { currentUser, userProfile, isAdmin, claimAdminStatus } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'bugs' | 'inquiries' | 'cms' | 'team'>('overview');

  // Real-time Firestore state
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [bugs, setBugs] = useState<BugRequest[]>([]);
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [loading, setLoading] = useState(true);

  // Service Edit / Create Modal state
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceFeaturesInput, setServiceFeaturesInput] = useState('');

  // Bug Details / Update Modal state
  const [selectedBug, setSelectedBug] = useState<BugRequest | null>(null);
  const [bugStatus, setBugStatus] = useState<BugStatus>('pending');
  const [bugAdminNotes, setBugAdminNotes] = useState('');
  const [bugQuote, setBugQuote] = useState('');

  // Inquiry Reply state
  const [selectedInquiry, setSelectedInquiry] = useState<CustomerInquiry | null>(null);
  const [inquiryReply, setInquiryReply] = useState('');
  const [inquiryStatus, setInquiryStatus] = useState<InquiryStatus>('new');

  // Filter states
  const [bugFilter, setBugFilter] = useState<string>('all');
  const [inquiryFilter, setInquiryFilter] = useState<string>('all');

  // CMS Form local edit state
  const [localHero, setLocalHero] = useState(cmsContent.hero);
  const [announcementText, setAnnouncementText] = useState(cmsContent.announcement.text);
  const [announcementEnabled, setAnnouncementEnabled] = useState(cmsContent.announcement.enabled);
  const [cmsSaveMessage, setCmsSaveMessage] = useState<string | null>(null);

  // Sync CMS prop changes
  useEffect(() => {
    setLocalHero(cmsContent.hero);
    setAnnouncementText(cmsContent.announcement.text);
    setAnnouncementEnabled(cmsContent.announcement.enabled);
  }, [cmsContent]);

  // Firestore listeners
  useEffect(() => {
    setLoading(true);

    // 1. Services
    const unsubServices = onSnapshot(
      collection(db, 'services'),
      (snap) => {
        const items: ServiceItem[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...(d.data() as any) }));
        items.sort((a, b) => (a.orderIndex || 99) - (b.orderIndex || 99));
        setServices(items);
      },
      (err) => {
        console.warn('Services snapshot:', err);
      }
    );

    // 2. Bug Requests
    const unsubBugs = onSnapshot(
      collection(db, 'bugRequests'),
      (snap) => {
        const items: BugRequest[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...(d.data() as any) }));
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setBugs(items);
        setLoading(false);
      },
      (err) => {
        console.warn('Bugs snapshot:', err);
        setLoading(false);
      }
    );

    // 3. Inquiries
    const unsubInquiries = onSnapshot(
      collection(db, 'inquiries'),
      (snap) => {
        const items: CustomerInquiry[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...(d.data() as any) }));
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setInquiries(items);
      },
      (err) => {
        console.warn('Inquiries snapshot:', err);
      }
    );

    return () => {
      unsubServices();
      unsubBugs();
      unsubInquiries();
    };
  }, []);

  // Quick Seed Services helper if empty
  const handleSeedDefaultServices = async () => {
    try {
      for (const s of DEFAULT_SERVICES) {
        await addDoc(collection(db, 'services'), {
          title: s.title,
          category: s.category,
          description: s.description,
          price: s.price,
          turnaround: s.turnaround,
          features: s.features,
          badge: s.badge || '',
          isActive: true,
          orderIndex: s.orderIndex || 1,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Failed to seed services:', err);
      handleFirestoreError(err, OperationType.CREATE, 'services');
    }
  };

  // Service Save (Create or Update)
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    try {
      const payload = {
        title: editingService.title,
        category: editingService.category,
        description: editingService.description,
        price: editingService.price,
        turnaround: editingService.turnaround,
        features: serviceFeaturesInput
          .split('\n')
          .map(f => f.trim())
          .filter(Boolean),
        badge: editingService.badge || '',
        isActive: editingService.isActive,
        updatedAt: new Date().toISOString()
      };

      if (editingService.id) {
        await updateDoc(doc(db, 'services', editingService.id), payload);
      } else {
        await addDoc(collection(db, 'services'), payload);
      }
      setIsServiceModalOpen(false);
      setEditingService(null);
    } catch (err) {
      console.error('Save service error:', err);
      handleFirestoreError(err, OperationType.WRITE, 'services');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this studio service?')) return;
    try {
      await deleteDoc(doc(db, 'services', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `services/${id}`);
    }
  };

  const handleToggleServiceActive = async (service: ServiceItem) => {
    if (!service.id) return;
    try {
      await updateDoc(doc(db, 'services', service.id), {
        isActive: !service.isActive,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `services/${service.id}`);
    }
  };

  // Bug Update Handler
  const handleOpenBugModal = (bug: BugRequest) => {
    setSelectedBug(bug);
    setBugStatus(bug.status);
    setBugAdminNotes(bug.adminNotes || '');
    setBugQuote(bug.quoteEstimate || '');
  };

  const handleSaveBugUpdate = async () => {
    if (!selectedBug?.id) return;
    try {
      await updateDoc(doc(db, 'bugRequests', selectedBug.id), {
        status: bugStatus,
        adminNotes: bugAdminNotes,
        quoteEstimate: bugQuote,
        updatedAt: new Date().toISOString()
      });
      setSelectedBug(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `bugRequests/${selectedBug.id}`);
    }
  };

  const handleDeleteBug = async (id: string) => {
    if (!confirm('Delete this bug ticket?')) return;
    try {
      await deleteDoc(doc(db, 'bugRequests', id));
      if (selectedBug?.id === id) setSelectedBug(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `bugRequests/${id}`);
    }
  };

  // Inquiry Reply Handler
  const handleOpenInquiryModal = (inq: CustomerInquiry) => {
    setSelectedInquiry(inq);
    setInquiryReply(inq.adminReply || '');
    setInquiryStatus(inq.status);
  };

  const handleSaveInquiryReply = async () => {
    if (!selectedInquiry?.id) return;
    try {
      await updateDoc(doc(db, 'inquiries', selectedInquiry.id), {
        adminReply: inquiryReply,
        status: inquiryReply.trim() ? 'replied' : inquiryStatus
      });
      setSelectedInquiry(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `inquiries/${selectedInquiry.id}`);
    }
  };

  // Save Website CMS Changes
  const handleSaveCMS = async () => {
    try {
      const updatedCMS: CMSContentState = {
        ...cmsContent,
        hero: localHero,
        announcement: {
          ...cmsContent.announcement,
          text: announcementText,
          enabled: announcementEnabled
        }
      };

      await setDoc(doc(db, 'cmsContent', 'main'), {
        sectionId: 'main',
        content: updatedCMS,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser?.email || 'admin'
      }, { merge: true });

      onUpdateCMS(updatedCMS);
      setCmsSaveMessage('Website content saved to Firestore successfully!');
      setTimeout(() => setCmsSaveMessage(null), 4000);
    } catch (err) {
      console.error('Error saving CMS:', err);
      handleFirestoreError(err, OperationType.WRITE, 'cmsContent/main');
    }
  };

  // Urgent bugs count
  const criticalBugs = bugs.filter(b => b.urgency === 'critical' && b.status !== 'resolved' && b.status !== 'closed');
  const pendingBugs = bugs.filter(b => b.status === 'pending');
  const newInquiries = inquiries.filter(i => i.status === 'new');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Navbar in Admin */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <button
                onClick={onBackToHome}
                className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Live Studio</span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                ROHIT WEB STUDIO • Executive Admin Console
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-emerald-400 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              ADMIN VERIFIED: {currentUser?.email || 'Admin'}
            </span>
          </div>
        </div>

        {/* Urgent Critical Bug Banner if any exist */}
        {criticalBugs.length > 0 && (
          <div className="mt-6 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Flame className="w-6 h-6 text-rose-500 shrink-0 animate-bounce" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  URGENT: {criticalBugs.length} Critical Bug Ticket(s) Awaiting Resolution
                </h4>
                <p className="text-xs text-rose-200/90 mt-0.5">
                  Production downtime or broken payment flow reported by client. Immediate triage required.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveTab('bugs');
                setBugFilter('critical');
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 shadow-md shadow-rose-600/30 shrink-0 cursor-pointer"
            >
              Review Critical Tickets Now
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 gap-2 sm:gap-6 mt-6 overflow-x-auto pb-1">
          {[
            { id: 'overview', label: 'Overview & Metrics', icon: LayoutDashboard },
            { id: 'services', label: `Service Offerings (${services.length})`, icon: Wrench },
            { id: 'bugs', label: `Bug Tickets (${bugs.length})`, icon: Bug },
            { id: 'inquiries', label: `Client Inquiries (${inquiries.length})`, icon: Mail },
            { id: 'cms', label: 'Website CMS & Content', icon: Sliders },
          ].map(tab => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 px-2 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  isCurrent
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ===================== TAB 1: OVERVIEW ===================== */}
        {activeTab === 'overview' && (
          <div className="py-6 space-y-8">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs text-slate-400 font-medium">Total Bug Tickets</span>
                <div className="text-3xl font-extrabold font-mono text-white">{bugs.length}</div>
                <div className="text-[11px] text-rose-400 font-semibold">{criticalBugs.length} Critical Priority</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs text-slate-400 font-medium">Pending Triage</span>
                <div className="text-3xl font-extrabold font-mono text-amber-400">{pendingBugs.length}</div>
                <div className="text-[11px] text-slate-400">Needs Engineer Assignment</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs text-slate-400 font-medium">New Contact Inquiries</span>
                <div className="text-3xl font-extrabold font-mono text-blue-400">{newInquiries.length}</div>
                <div className="text-[11px] text-slate-400">Total {inquiries.length} Messages</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs text-slate-400 font-medium">Active Services Catalog</span>
                <div className="text-3xl font-extrabold font-mono text-cyan-400">{services.filter(s => s.isActive).length}</div>
                <div className="text-[11px] text-slate-400">Published in Studio Catalog</div>
              </div>
            </div>

            {/* Quick Actions & Recent Activity Grid */}
            <div className="grid lg:grid-cols-12 gap-8">
              {/* Quick Actions (4 cols) */}
              <div className="lg:col-span-4 bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  Quick Administration
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setEditingService({
                        title: '',
                        category: 'Bug Fixing',
                        description: '',
                        price: '$99',
                        turnaround: '2-4 Hours',
                        features: ['Deep root cause analysis', 'Tested patch', 'Warranty'],
                        isActive: true,
                        badge: 'New'
                      });
                      setServiceFeaturesInput('Deep root cause analysis\nTested patch\n14-Day Warranty');
                      setIsServiceModalOpen(true);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-between cursor-pointer"
                  >
                    <span>Add New Studio Service</span>
                    <Plus className="w-4 h-4" />
                  </button>

                  {services.length === 0 && (
                    <button
                      onClick={handleSeedDefaultServices}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30 flex items-center justify-between cursor-pointer"
                    >
                      <span>Seed Default Studio Services</span>
                      <Sparkles className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => setActiveTab('cms')}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span>Edit Hero & Website Text</span>
                    <Sliders className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('inquiries');
                      setInquiryFilter('new');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span>Reply to Unanswered Inquiries ({newInquiries.length})</span>
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Recent Bug Tickets Stream (8 cols) */}
              <div className="lg:col-span-8 bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                    Latest Bug Dispatch Feed
                  </h3>
                  <button
                    onClick={() => setActiveTab('bugs')}
                    className="text-xs text-cyan-400 hover:underline"
                  >
                    View All Tickets ({bugs.length})
                  </button>
                </div>

                {bugs.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No bug tickets submitted yet.</p>
                ) : (
                  <div className="space-y-2">
                    {bugs.slice(0, 5).map(bug => (
                      <div
                        key={bug.id}
                        onClick={() => handleOpenBugModal(bug)}
                        className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 flex items-center justify-between gap-4 cursor-pointer transition-all"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-rose-400 uppercase">
                              {bug.urgency}
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="text-[10px] text-slate-400">{bug.customerEmail}</span>
                          </div>
                          <p className="text-xs font-semibold text-white truncate mt-0.5">
                            {bug.title}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">
                          {bug.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 2: SERVICE MANAGEMENT ===================== */}
        {activeTab === 'services' && (
          <div className="py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">Studio Service Offerings Management</h2>
                <p className="text-xs text-slate-400">
                  Services created or modified here are reflected instantly on the public website catalog.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {services.length === 0 && (
                  <button
                    onClick={handleSeedDefaultServices}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Seed Default Services</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditingService({
                      title: '',
                      category: 'Full-Stack Web Development',
                      description: '',
                      price: 'Starting at $950',
                      turnaround: '1-2 Weeks',
                      features: ['Custom design', 'Responsive layout', 'SEO setup'],
                      badge: 'New Offering',
                      isActive: true
                    });
                    setServiceFeaturesInput('Custom design\nResponsive layout\nSEO setup');
                    setIsServiceModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Service</span>
                </button>
              </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(service => (
                <div
                  key={service.id}
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] uppercase font-bold text-cyan-400">
                        {service.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        service.isActive
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-500'
                      }`}>
                        {service.isActive ? 'ACTIVE' : 'DRAFT'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">
                      {service.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {service.description}
                    </p>

                    <div className="flex items-baseline gap-2 py-1 border-y border-slate-800/80">
                      <span className="text-base font-bold text-white font-mono">{service.price}</span>
                      <span className="text-[10px] text-slate-400">({service.turnaround})</span>
                    </div>

                    <ul className="text-xs text-slate-400 space-y-1">
                      {service.features.slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5 truncate">
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate">{f}</span>
                        </li>
                      ))}
                      {service.features.length > 3 && (
                        <li className="text-[10px] text-slate-500">
                          +{service.features.length - 3} more deliverables...
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleServiceActive(service)}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium border border-slate-800 hover:bg-slate-900 text-slate-300"
                    >
                      {service.isActive ? 'Deactivate' : 'Publish'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingService(service);
                          setServiceFeaturesInput(service.features.join('\n'));
                          setIsServiceModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
                        title="Edit Service"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => service.id && handleDeleteService(service.id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                        title="Delete Service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== TAB 3: BUG REQUESTS ===================== */}
        {activeTab === 'bugs' && (
          <div className="py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">Bug Fixing Request System</h2>
                <p className="text-xs text-slate-400">
                  Track, diagnose, and transition bug fixes from triage to resolution.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {['all', 'critical', 'pending', 'in_progress', 'resolved'].map(f => (
                  <button
                    key={f}
                    onClick={() => setBugFilter(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize cursor-pointer transition-colors ${
                      bugFilter === f
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {f.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Bugs List */}
            <div className="space-y-3">
              {bugs
                .filter(b => {
                  if (bugFilter === 'all') return true;
                  if (bugFilter === 'critical') return b.urgency === 'critical';
                  return b.status === bugFilter;
                })
                .map(bug => (
                  <div
                    key={bug.id}
                    onClick={() => handleOpenBugModal(bug)}
                    className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all cursor-pointer"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          bug.urgency === 'critical'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : bug.urgency === 'high'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {bug.urgency}
                        </span>
                        <span className="font-mono text-slate-400 text-[11px]">{bug.customerEmail}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400 text-[11px]">{bug.environment}</span>
                      </div>

                      <h3 className="text-sm font-bold text-white truncate">
                        {bug.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {bug.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-300 font-bold">
                        {bug.status.toUpperCase()}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          bug.id && handleDeleteBug(bug.id);
                        }}
                        className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                        title="Delete ticket"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ===================== TAB 4: CLIENT INQUIRIES ===================== */}
        {activeTab === 'inquiries' && (
          <div className="py-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">Client Contact Forms & Inquiries</h2>
                <p className="text-xs text-slate-400">
                  Direct inquiries received from potential and existing clients.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {['all', 'new', 'replied', 'archived'].map(f => (
                  <button
                    key={f}
                    onClick={() => setInquiryFilter(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize cursor-pointer transition-colors ${
                      inquiryFilter === f
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {inquiries
                .filter(i => inquiryFilter === 'all' || i.status === inquiryFilter)
                .map(inq => (
                  <div
                    key={inq.id}
                    className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                          {inq.serviceCategory} • Budget: {inq.budget || 'Custom'}
                        </span>
                        <h4 className="text-base font-bold text-white mt-0.5">
                          {inq.subject || 'Client Message'}
                        </h4>
                        <p className="text-xs text-slate-400">
                          From: <span className="text-slate-200 font-semibold">{inq.name}</span> ({inq.email})
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {inq.status.toUpperCase()}
                        </span>
                        <button
                          onClick={() => handleOpenInquiryModal(inq)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                        >
                          {inq.adminReply ? 'Edit Reply' : 'Send Reply'}
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {inq.message}
                    </p>

                    {inq.adminReply && (
                      <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800 text-xs space-y-1">
                        <span className="font-bold text-cyan-300">Studio Response Sent:</span>
                        <p className="text-slate-200 whitespace-pre-wrap">{inq.adminReply}</p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ===================== TAB 5: WEBSITE CONTENT MANAGEMENT (CMS) ===================== */}
        {activeTab === 'cms' && (
          <div className="py-6 space-y-6 max-w-3xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Website Content Management (CMS)</h2>
                <p className="text-xs text-slate-400">
                  Update your hero banners, headline copy, studio statistics, and announcement ribbon.
                </p>
              </div>

              <button
                onClick={handleSaveCMS}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Website Updates</span>
              </button>
            </div>

            {cmsSaveMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{cmsSaveMessage}</span>
              </div>
            )}

            {/* Announcement Ribbon */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Global Top Announcement Bar</span>
              </h3>
              <div className="flex items-center gap-3">
                <label className="text-xs text-slate-300 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={announcementEnabled}
                    onChange={e => setAnnouncementEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span>Enable announcement banner at top of site</span>
                </label>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Banner Text</label>
                <input
                  type="text"
                  value={announcementText}
                  onChange={e => setAnnouncementText(e.target.value)}
                  placeholder="e.g. ⚡ Rapid Bug Fixing Available Now: Get critical production issues resolved under 2 hours."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white"
                />
              </div>
            </div>

            {/* Hero Section Copy */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white">Hero Section Copy</h3>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Pill Badge Text</label>
                <input
                  type="text"
                  value={localHero.badgeText}
                  onChange={e => setLocalHero({ ...localHero, badgeText: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Main Headline Prefix</label>
                <input
                  type="text"
                  value={localHero.headline}
                  onChange={e => setLocalHero({ ...localHero, headline: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Gradient Highlighted Headline</label>
                <input
                  type="text"
                  value={localHero.highlightedText}
                  onChange={e => setLocalHero({ ...localHero, highlightedText: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Subheadline Description</label>
                <textarea
                  rows={3}
                  value={localHero.subheadline}
                  onChange={e => setLocalHero({ ...localHero, subheadline: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white"
                />
              </div>
            </div>

            {/* Studio Metrics */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white">Studio Verified Statistics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {localHero.stats.map((st, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400">Stat #{idx + 1}</span>
                    <input
                      type="text"
                      value={st.value}
                      onChange={e => {
                        const newStats = [...localHero.stats];
                        newStats[idx].value = e.target.value;
                        setLocalHero({ ...localHero, stats: newStats });
                      }}
                      placeholder="e.g. < 2 Hours"
                      className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded bg-slate-950 border border-slate-800 text-cyan-400"
                    />
                    <input
                      type="text"
                      value={st.label}
                      onChange={e => {
                        const newStats = [...localHero.stats];
                        newStats[idx].label = e.target.value;
                        setLocalHero({ ...localHero, stats: newStats });
                      }}
                      placeholder="Label e.g. Turnaround"
                      className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================== MODAL: CREATE / EDIT SERVICE ===================== */}
        {isServiceModalOpen && editingService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 max-w-lg w-full space-y-4 my-8">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white">
                  {editingService.id ? 'Edit Studio Service' : 'Create New Studio Service'}
                </h3>
                <button
                  onClick={() => setIsServiceModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveService} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Service Title *</label>
                  <input
                    type="text"
                    required
                    value={editingService.title}
                    onChange={e => setEditingService({ ...editingService, title: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Category *</label>
                    <input
                      type="text"
                      required
                      value={editingService.category}
                      onChange={e => setEditingService({ ...editingService, category: e.target.value })}
                      placeholder="e.g. Bug Fixing"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Price Label *</label>
                    <input
                      type="text"
                      required
                      value={editingService.price}
                      onChange={e => setEditingService({ ...editingService, price: e.target.value })}
                      placeholder="Starting at $99"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Turnaround Time *</label>
                    <input
                      type="text"
                      required
                      value={editingService.turnaround}
                      onChange={e => setEditingService({ ...editingService, turnaround: e.target.value })}
                      placeholder="e.g. 2 - 4 Hours"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Badge (Optional)</label>
                    <input
                      type="text"
                      value={editingService.badge || ''}
                      onChange={e => setEditingService({ ...editingService, badge: e.target.value })}
                      placeholder="e.g. Popular, Urgent"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={editingService.description}
                    onChange={e => setEditingService({ ...editingService, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Deliverables / Features (one per line)
                  </label>
                  <textarea
                    rows={4}
                    value={serviceFeaturesInput}
                    onChange={e => setServiceFeaturesInput(e.target.value)}
                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={editingService.isActive}
                    onChange={e => setEditingService({ ...editingService, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <label htmlFor="isActiveCheck" className="text-xs text-slate-300 cursor-pointer">
                    Active & visible to visitors on website
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsServiceModalOpen(false)}
                    className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                  >
                    Save Service
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===================== MODAL: BUG TICKET ADMIN UPDATE ===================== */}
        {selectedBug && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 max-w-xl w-full space-y-4 my-8">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">{selectedBug.title}</h3>
                  <p className="text-xs text-slate-400">Client: {selectedBug.customerEmail}</p>
                </div>
                <button onClick={() => setSelectedBug(null)} className="p-1.5 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Ticket Status
                    </label>
                    <select
                      value={bugStatus}
                      onChange={e => setBugStatus(e.target.value as BugStatus)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                    >
                      <option value="pending">Pending Review</option>
                      <option value="analyzing">Analyzing Code</option>
                      <option value="in_progress">Hotfix In Progress</option>
                      <option value="ready_for_test">Ready for Client Test</option>
                      <option value="resolved">Resolved & Verified</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Quote / Estimate
                    </label>
                    <input
                      type="text"
                      value={bugQuote}
                      onChange={e => setBugQuote(e.target.value)}
                      placeholder="e.g. $89 (1.5 hrs)"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Developer Resolution Notes & Updates (Visible to Client)
                  </label>
                  <textarea
                    rows={4}
                    value={bugAdminNotes}
                    onChange={e => setBugAdminNotes(e.target.value)}
                    placeholder="Provide diagnosis, steps taken, git commit hash, or testing instructions..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Client Description:</span>
                  <p className="text-slate-300 whitespace-pre-wrap">{selectedBug.description}</p>
                  {selectedBug.websiteUrl && (
                    <p className="text-cyan-400 font-mono mt-1">
                      URL: <a href={selectedBug.websiteUrl} target="_blank" rel="noopener noreferrer" className="underline">{selectedBug.websiteUrl}</a>
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedBug(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveBugUpdate}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                >
                  Update Ticket
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== MODAL: INQUIRY REPLY ===================== */}
        {selectedInquiry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 max-w-lg w-full space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white">Reply to Inquiry</h3>
                <button onClick={() => setSelectedInquiry(null)} className="p-1.5 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <p className="font-semibold text-white">From: {selectedInquiry.name} ({selectedInquiry.email})</p>
                  <p className="text-slate-400 mt-1 whitespace-pre-wrap">{selectedInquiry.message}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Studio Official Response (Visible to client in their portal)
                  </label>
                  <textarea
                    rows={4}
                    value={inquiryReply}
                    onChange={e => setInquiryReply(e.target.value)}
                    placeholder="Hello, thank you for reaching out to Rohit Web Studio. We would love to discuss..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveInquiryReply}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                >
                  Save & Publish Reply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
