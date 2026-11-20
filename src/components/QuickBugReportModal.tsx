import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { addDoc, collection } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { BugUrgency, BugStatus } from '../types';
import {
  X,
  Bug,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Link,
  Layers,
  FileCode,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface QuickBugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialIssueType?: string;
  onViewPortal?: () => void;
}

export const QuickBugReportModal: React.FC<QuickBugReportModalProps> = ({
  isOpen,
  onClose,
  initialIssueType,
  onViewPortal
}) => {
  const { currentUser, userProfile } = useAuth();

  const [title, setTitle] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [environment, setEnvironment] = useState('React / Next.js / TypeScript');
  const [urgency, setUrgency] = useState<BugUrgency>('high');
  const [description, setDescription] = useState('');
  const [errorLogs, setErrorLogs] = useState('');
  const [reproductionSteps, setReproductionSteps] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialIssueType) {
      setTitle(`[Urgent Fix] ${initialIssueType}`);
      if (initialIssueType.includes('500') || initialIssueType.includes('Checkout')) {
        setUrgency('critical');
      }
    }
  }, [initialIssueType]);

  useEffect(() => {
    if (currentUser) {
      setContactEmail(currentUser.email || '');
      setContactName(userProfile?.displayName || currentUser.displayName || '');
    }
  }, [currentUser, userProfile]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailToUse = currentUser?.email || contactEmail;
    if (!emailToUse) {
      setError('Please provide a contact email address for ticket updates.');
      return;
    }

    if (!title.trim() || !description.trim()) {
      setError('Please provide both an issue title and description.');
      return;
    }

    setIsSubmitting(true);

    try {
      const bugData = {
        title: title.trim(),
        description: description.trim(),
        websiteUrl: websiteUrl.trim(),
        environment,
        urgency,
        errorLogs: errorLogs.trim(),
        reproductionSteps: reproductionSteps.trim(),
        status: 'pending' as BugStatus,
        customerId: currentUser?.uid || 'guest_' + Math.random().toString(36).substring(2, 9),
        customerEmail: emailToUse.trim(),
        customerName: contactName.trim() || emailToUse.split('@')[0],
        adminNotes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'bugRequests'), bugData);
      setSubmittedTicketId(docRef.id);
    } catch (err) {
      console.error('Error submitting bug request:', err);
      try {
        handleFirestoreError(err, OperationType.CREATE, 'bugRequests');
      } catch (e: any) {
        setError('Submission failed: ' + (e.message || 'Please check your permissions or try again.'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setWebsiteUrl('');
    setDescription('');
    setErrorLogs('');
    setReproductionSteps('');
    setSubmittedTicketId(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Emergency Bug Triage & Fix Request
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct transmission to Rohit Web Studio lead engineers
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {submittedTicketId ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Bug Triage Ticket Created!
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Your ticket has been dispatched to Rohit Web Studio. Our lead engineers are reviewing the logs and reproduction steps.
              </p>
            </div>

            {/* Ticket Badge */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md mx-auto text-left font-mono text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-500">
                <span>Ticket ID:</span>
                <span className="text-indigo-600 dark:text-cyan-400 font-semibold">{submittedTicketId}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Priority:</span>
                <span className="text-rose-500 font-bold uppercase">{urgency}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Estimated Initial Triage:</span>
                <span className="text-emerald-500 font-medium">&lt; 30 Minutes</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {currentUser && onViewPortal && (
                <button
                  onClick={() => {
                    handleReset();
                    onViewPortal();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Track in Customer Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Close & Return
              </button>
            </div>
          </div>
        ) : (
          /* Submission Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Urgency Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Severity / Urgency Level
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    { id: 'critical', label: 'Critical', sub: 'Site down / Lost $' },
                    { id: 'high', label: 'High', sub: 'Core feature broken' },
                    { id: 'medium', label: 'Medium', sub: 'Moderate bug' },
                    { id: 'low', label: 'Low', sub: 'Cosmetic / Minor' },
                  ] as const
                ).map(u => (
                  <button
                    type="button"
                    key={u.id}
                    onClick={() => setUrgency(u.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      urgency === u.id
                        ? u.id === 'critical'
                          ? 'bg-rose-500/15 border-rose-500 text-rose-600 dark:text-rose-400'
                          : u.id === 'high'
                          ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400'
                          : 'bg-indigo-500/15 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs">{u.label}</div>
                    <div className="text-[10px] opacity-75">{u.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Issue Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bug Summary / Headline *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. 500 error when submitting checkout form or blank white page"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* URL & Environment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Website / Staging URL
                </label>
                <div className="relative">
                  <Link className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={e => setWebsiteUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tech Stack / Platform
                </label>
                <select
                  value={environment}
                  onChange={e => setEnvironment(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="React / Next.js / TypeScript">React / Next.js / TypeScript</option>
                  <option value="WordPress / WooCommerce / PHP">WordPress / WooCommerce / PHP</option>
                  <option value="Shopify / Liquid">Shopify / Liquid</option>
                  <option value="Node.js / Express / REST API">Node.js / Express / REST API</option>
                  <option value="Vue / Nuxt.js">Vue / Nuxt.js</option>
                  <option value="Laravel / Python Django">Laravel / Python Django</option>
                  <option value="Tailwind / CSS / HTML">Tailwind / CSS / HTML</option>
                  <option value="Custom Cloud / Other">Custom Cloud / Other</option>
                </select>
              </div>
            </div>

            {/* Detailed Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Detailed Problem Description *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe what went wrong, what users see, and when this started occurring..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Error logs & Repro */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                  Error Logs / Console Stack (Optional)
                </label>
                <textarea
                  rows={2}
                  value={errorLogs}
                  onChange={e => setErrorLogs(e.target.value)}
                  placeholder="Paste terminal logs or browser console errors..."
                  className="w-full px-3 py-2 text-[11px] font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  Steps to Reproduce (Optional)
                </label>
                <textarea
                  rows={2}
                  value={reproductionSteps}
                  onChange={e => setReproductionSteps(e.target.value)}
                  placeholder="1. Visit cart -> 2. Click checkout -> 3. Crash occurs"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Contact Details if not signed in */}
            {!currentUser && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Where should our engineers contact you with updates?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={e => setContactName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={e => setContactEmail(e.target.value)}
                      placeholder="alex@company.com"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Footer Submit */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 shadow-md shadow-rose-600/25 flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Transmitting Ticket...</span>
                  </>
                ) : (
                  <>
                    <Bug className="w-3.5 h-3.5" />
                    <span>Submit Emergency Triage Ticket</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
