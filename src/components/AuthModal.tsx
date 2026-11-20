import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Lock,
  Mail,
  User,
  Building,
  Phone,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ArrowRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
  initialRole?: 'customer' | 'admin';
  onSuccess: (role: 'customer' | 'admin') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login',
  initialRole = 'customer',
  onSuccess
}) => {
  const { loginWithEmail, registerCustomer, loginWithGoogle, loginAsDemo, resetPassword } = useAuth();

  const [activeRole, setActiveRole] = useState<'customer' | 'admin'>(initialRole);
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>(initialTab);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOperationNotAllowed, setIsOperationNotAllowed] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setActiveRole(initialRole);
    setActiveTab(initialTab);
    setError(null);
    setIsOperationNotAllowed(false);
    setSuccessMessage(null);
  }, [initialTab, initialRole, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsOperationNotAllowed(false);
    setSuccessMessage(null);

    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }

    setIsLoading(true);

    try {
      if (activeTab === 'forgot') {
        await resetPassword(email.trim());
        setSuccessMessage('Password reset instructions have been sent to your email.');
        setIsLoading(false);
        return;
      }

      if (activeTab === 'register') {
        if (!password || password.length < 6) {
          setError('Password must be at least 6 characters.');
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setIsLoading(false);
          return;
        }
        await registerCustomer(email.trim(), password, displayName.trim(), company.trim(), phone.trim());
        onSuccess(activeRole);
        onClose();
      } else {
        // Sign In
        if (!password) {
          setError('Please enter your password.');
          setIsLoading(false);
          return;
        }
        await loginWithEmail(email.trim(), password);
        onSuccess(activeRole);
        onClose();
      }
    } catch (err: any) {
      console.warn('Auth notice:', err?.code || err?.message);
      let msg = err.message || 'Authentication failed. Please verify credentials.';

      if (err?.code === 'auth/operation-not-allowed' || msg.includes('operation-not-allowed') || msg.includes('CONFIGURATION_NOT_FOUND')) {
        setIsOperationNotAllowed(true);
        msg = 'Email/Password provider is not yet enabled in your Firebase Console.';
      } else if (msg.includes('user-not-found') || msg.includes('invalid-credential')) {
        msg = 'Invalid email or password. Please check your credentials.';
      } else if (msg.includes('email-already-in-use')) {
        msg = 'An account with this email already exists. Try logging in.';
      } else if (msg.includes('weak-password')) {
        msg = 'Password is too weak. Please use at least 6 characters.';
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsOperationNotAllowed(false);
    setIsLoading(true);
    try {
      await loginWithGoogle();
      onSuccess(activeRole);
      onClose();
    } catch (err: any) {
      console.warn('Google Auth notice:', err?.code || err?.message);
      setError(err.message || 'Google sign in was cancelled or failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: 'admin' | 'customer') => {
    loginAsDemo(role);
    onSuccess(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Top Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                activeRole === 'admin'
                  ? 'bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 border border-indigo-500/20'
                  : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
              }`}
            >
              {activeRole === 'admin' ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {activeRole === 'admin' ? 'Studio Admin Portal' : 'Customer Account'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {activeRole === 'admin' ? 'Restricted administrative access' : 'Manage bug tickets & inquiries'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Toggle */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/30">
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-200/60 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setActiveRole('customer');
                setError(null);
                setIsOperationNotAllowed(false);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeRole === 'customer'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer Portal</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveRole('admin');
                setActiveTab('login');
                setError(null);
                setIsOperationNotAllowed(false);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeRole === 'admin'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Access</span>
            </button>
          </div>
        </div>

        {/* Tab Selector (For customer: Sign In / Create Account) */}
        {activeRole === 'customer' && (
          <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-2">
            <button
              onClick={() => {
                setActiveTab('login');
                setError(null);
                setIsOperationNotAllowed(false);
              }}
              className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'border-indigo-600 text-indigo-600 dark:text-cyan-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setError(null);
                setIsOperationNotAllowed(false);
              }}
              className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'border-indigo-600 text-indigo-600 dark:text-cyan-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Register New Account
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6">
          {/* Helpful banner if operation-not-allowed */}
          {isOperationNotAllowed && (
            <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                <div>
                  <p className="font-bold">Email/Password Provider Not Yet Toggled On</p>
                  <p className="text-[11px] mt-0.5 opacity-90 leading-relaxed">
                    By default, Firebase projects only have Google OAuth enabled. You have 3 easy ways to continue right now:
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 pt-1 text-[11px]">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full py-2 px-3 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>1. Continue with Google (Instant & Enabled)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin(activeRole)}
                  className="w-full py-2 px-3 rounded-lg bg-slate-800 text-cyan-300 border border-slate-700 font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>2. Instant 1-Click Studio Demo ({activeRole === 'admin' ? 'Admin' : 'Client'})</span>
                </button>

                <a
                  href="https://console.firebase.google.com/project/gen-lang-client-0101450404/authentication/providers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center justify-center gap-1.5 hover:underline"
                >
                  <span>3. Enable Email/Password in Firebase Console</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>
            </div>
          )}

          {error && !isOperationNotAllowed && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Quick Demo Access Bar for rapid testing */}
          <div className="mb-4 p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
            <div className="text-[11px] text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Testing?</span> 1-click test access:
            </div>
            <button
              type="button"
              onClick={() => handleDemoLogin(activeRole)}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-cyan-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Test as {activeRole === 'admin' ? 'Admin' : 'Client'}</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {activeTab === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder="e.g. Michael Vance"
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Company / Organization
                    </label>
                    <div className="relative">
                      <Building className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={company}
                        onChange={e => setCompany(e.target.value)}
                        placeholder="e.g. Acme Corp"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {activeTab !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password *
                  </label>
                  {activeTab === 'login' && activeRole === 'customer' && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('forgot')}
                      className="text-[11px] text-indigo-600 dark:text-cyan-400 hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60 ${
                activeRole === 'admin'
                  ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/25'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/25'
              }`}
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>
                    {activeTab === 'forgot'
                      ? 'Send Reset Link'
                      : activeTab === 'register'
                      ? 'Create Client Account'
                      : activeRole === 'admin'
                      ? 'Access Admin Console'
                      : 'Sign In to Client Portal'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {activeTab === 'forgot' && (
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Back to Sign In
              </button>
            )}
          </form>

          {/* Social OAuth & Google Login */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-center space-y-2.5">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2.5 cursor-pointer transition-colors shadow-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google (Instant Login)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
