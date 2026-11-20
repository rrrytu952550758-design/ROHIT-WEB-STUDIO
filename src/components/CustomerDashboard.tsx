import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { BugRequest, CustomerInquiry, BugStatus } from '../types';
import {
  LayoutDashboard,
  Bug,
  Mail,
  User,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  MessageSquare,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';

interface CustomerDashboardProps {
  onOpenQuickBug: () => void;
  onBackToHome: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  onOpenQuickBug,
  onBackToHome
}) => {
  const { currentUser, userProfile, refreshProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'bugs' | 'inquiries' | 'profile'>('bugs');
  const [bugRequests, setBugRequests] = useState<BugRequest[]>([]);
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBug, setSelectedBug] = useState<BugRequest | null>(null);

  // Profile Edit State
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [company, setCompany] = useState(userProfile?.company || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Follow-up notes state for selected bug
  const [followupNote, setFollowupNote] = useState('');
  const [updatingNote, setUpdatingNote] = useState(false);

  // Sync profile state when userProfile loads
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setCompany(userProfile.company || '');
      setPhone(userProfile.phone || '');
    }
  }, [userProfile]);

  // Load customer bugs & inquiries in real time
  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);

    // Bug requests query
    const bugsQuery = query(
      collection(db, 'bugRequests'),
      where('customerId', '==', currentUser.uid)
    );

    const unsubBugs = onSnapshot(
      bugsQuery,
      (snapshot) => {
        const items: BugRequest[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        // Sort descending by createdAt
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setBugRequests(items);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'bugRequests');
      }
    );

    // Inquiries query (by email)
    let unsubInquiries = () => {};
    if (currentUser.email) {
      const inqQuery = query(
        collection(db, 'inquiries'),
        where('email', '==', currentUser.email)
      );

      unsubInquiries = onSnapshot(
        inqQuery,
        (snapshot) => {
          const items: CustomerInquiry[] = [];
          snapshot.forEach((docSnap) => {
            items.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setInquiries(items);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'inquiries');
        }
      );
    }

    return () => {
      unsubBugs();
      unsubInquiries();
    };
  }, [currentUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        displayName,
        company,
        phone
      });
      await refreshProfile();
      setProfileMsg('Profile updated successfully.');
    } catch (err: any) {
      setProfileMsg('Failed to update profile: ' + (err.message || 'Error'));
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAddFollowup = async (bug: BugRequest) => {
    if (!bug.id || !followupNote.trim()) return;
    setUpdatingNote(true);
    try {
      const updatedDesc = `${bug.description}\n\n[Client Follow-up ${new Date().toLocaleDateString()}]: ${followupNote.trim()}`;
      await updateDoc(doc(db, 'bugRequests', bug.id), {
        description: updatedDesc,
        updatedAt: new Date().toISOString()
      });
      setFollowupNote('');
      setSelectedBug(prev => prev ? { ...prev, description: updatedDesc } : null);
    } catch (err: any) {
      console.error('Failed to update bug note:', err);
    } finally {
      setUpdatingNote(false);
    }
  };

  const getStatusBadge = (status: BugStatus) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">PENDING REVIEW</span>;
      case 'analyzing':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">ANALYZING CODE</span>;
      case 'in_progress':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-600 dark:text-cyan-400 border border-indigo-500/30">HOTFIX IN PROGRESS</span>;
      case 'ready_for_test':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">READY FOR CLIENT TEST</span>;
      case 'resolved':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">RESOLVED & VERIFIED</span>;
      case 'closed':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30">CLOSED</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 text-slate-900 dark:text-white transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={onBackToHome}
                className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-cyan-400 hover:underline cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Studio Website</span>
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Client Portal Dashboard
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Welcome back, <span className="font-semibold text-slate-700 dark:text-slate-300">{userProfile?.displayName || currentUser?.email}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenQuickBug}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 shadow-md shadow-rose-600/20 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Submit New Bug Ticket</span>
            </button>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 mt-6">
          <button
            onClick={() => { setActiveTab('bugs'); setSelectedBug(null); }}
            className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'bugs'
                ? 'border-indigo-600 text-indigo-600 dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Bug className="w-4 h-4" />
            <span>Bug Tickets ({bugRequests.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('inquiries'); setSelectedBug(null); }}
            className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'inquiries'
                ? 'border-indigo-600 text-indigo-600 dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Service Inquiries ({inquiries.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('profile'); setSelectedBug(null); }}
            className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-indigo-600 text-indigo-600 dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Account Profile</span>
          </button>
        </div>

        {/* Tab 1: Bug Requests */}
        {activeTab === 'bugs' && (
          <div className="py-6">
            {selectedBug ? (
              /* Single Bug Detail View */
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <button
                      onClick={() => setSelectedBug(null)}
                      className="text-xs text-indigo-600 dark:text-cyan-400 hover:underline mb-2 flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to all tickets
                    </button>
                    <h2 className="text-xl font-bold">{selectedBug.title}</h2>
                    <p className="text-xs text-slate-500 mt-1 font-mono">
                      Ticket ID: {selectedBug.id} • Created {new Date(selectedBug.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    {getStatusBadge(selectedBug.status)}
                  </div>
                </div>

                {/* Bug Lifecycle Tracker Bar */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Fix Progress Pipeline
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    {[
                      { step: 'pending', label: '1. Received' },
                      { step: 'analyzing', label: '2. Deep Forensic' },
                      { step: 'in_progress', label: '3. Coding Hotfix' },
                      { step: 'resolved', label: '4. Verified & Done' }
                    ].map(st => {
                      const isReached =
                        st.step === selectedBug.status ||
                        (selectedBug.status === 'resolved' && ['pending', 'analyzing', 'in_progress', 'resolved'].includes(st.step)) ||
                        (selectedBug.status === 'in_progress' && ['pending', 'analyzing', 'in_progress'].includes(st.step)) ||
                        (selectedBug.status === 'analyzing' && ['pending', 'analyzing'].includes(st.step));
                      return (
                        <div
                          key={st.step}
                          className={`p-2 rounded-lg border font-semibold ${
                            isReached
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                          }`}
                        >
                          {st.label}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Key Ticket Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 uppercase font-bold">Severity</span>
                    <p className="text-sm font-bold text-rose-500 uppercase mt-1">{selectedBug.urgency}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 uppercase font-bold">Target Tech</span>
                    <p className="text-sm font-semibold mt-1">{selectedBug.environment}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 uppercase font-bold">Target URL</span>
                    <p className="text-sm font-semibold truncate mt-1">
                      {selectedBug.websiteUrl ? (
                        <a href={selectedBug.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-cyan-400 hover:underline flex items-center gap-1">
                          {selectedBug.websiteUrl} <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        'None Provided'
                      )}
                    </p>
                  </div>
                </div>

                {/* Developer Feedback & Resolution */}
                {selectedBug.adminNotes && (
                  <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs space-y-1">
                    <span className="font-bold uppercase tracking-wider text-indigo-700 dark:text-cyan-400">
                      Studio Lead Developer Notes & Update:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap mt-1">
                      {selectedBug.adminNotes}
                    </p>
                  </div>
                )}

                {/* Original Description & Logs */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Issue Description & Context
                    </h4>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs whitespace-pre-wrap leading-relaxed">
                      {selectedBug.description}
                    </div>
                  </div>

                  {selectedBug.errorLogs && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Provided Error Logs / Console Output
                      </h4>
                      <pre className="p-4 rounded-xl bg-slate-950 text-cyan-300 border border-slate-800 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap max-h-48">
                        {selectedBug.errorLogs}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Add Follow-Up Note Form */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Add Follow-up Information for the Lead Engineer
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={followupNote}
                      onChange={e => setFollowupNote(e.target.value)}
                      placeholder="e.g. Also noticed this happens in Safari on iOS..."
                      className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                    <button
                      onClick={() => handleAddFollowup(selectedBug)}
                      disabled={updatingNote || !followupNote.trim()}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
                    >
                      {updatingNote ? 'Updating...' : 'Post Update'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Bug List View */
              <div className="space-y-4">
                {bugRequests.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-cyan-400 flex items-center justify-center mx-auto">
                      <Bug className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold">No Bug Tickets Submitted Yet</h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Need an emergency bug fix or debugging investigation? Submit a ticket to Rohit Web Studio.
                      </p>
                    </div>
                    <button
                      onClick={onOpenQuickBug}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors cursor-pointer"
                    >
                      Submit Your First Bug Ticket
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {bugRequests.map(bug => (
                      <div
                        key={bug.id}
                        onClick={() => setSelectedBug(bug)}
                        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-400">
                              {bug.id?.substring(0, 8)}...
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[10px] font-bold text-rose-500 uppercase">
                              {bug.urgency}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {bug.environment}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors truncate">
                            {bug.title}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {bug.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          {getStatusBadge(bug.status)}
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Service Inquiries */}
        {activeTab === 'inquiries' && (
          <div className="py-6 space-y-4">
            {inquiries.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
                <Mail className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold">No Service Inquiries Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Messages submitted via the contact form with your email address will appear here with live reply status.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {inquiries.map(inq => (
                  <div
                    key={inq.id}
                    className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-cyan-400">
                          {inq.serviceCategory || 'Studio Project'}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          {inq.subject || 'Project Inquiry'}
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        Status: {inq.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {inq.message}
                    </p>

                    {inq.adminReply && (
                      <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs space-y-1">
                        <span className="font-bold text-indigo-700 dark:text-cyan-400">
                          Studio Reply from Rohit Web Studio:
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                          {inq.adminReply}
                        </p>
                      </div>
                    )}

                    <div className="text-[11px] text-slate-400 pt-1">
                      Submitted: {new Date(inq.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Account Profile */}
        {activeTab === 'profile' && (
          <div className="py-6 max-w-xl">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-bold">Profile & Contact Preferences</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your credentials and contact details used for emergency ticket communication.
                </p>
              </div>

              {profileMsg && (
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-cyan-400 text-xs">
                  {profileMsg}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={currentUser?.email || ''}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-slate-500 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Managed via Firebase Auth.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Display / Full Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Emergency Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 cursor-pointer disabled:opacity-50"
                  >
                    {profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
