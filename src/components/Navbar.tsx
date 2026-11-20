import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Code2,
  Bug,
  Sun,
  Moon,
  Menu,
  X,
  User as UserIcon,
  ShieldCheck,
  LogOut,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';

interface NavbarProps {
  onOpenAuth: (defaultTab?: 'login' | 'register', defaultRole?: 'customer' | 'admin') => void;
  onOpenQuickBug: () => void;
  currentView: 'home' | 'portal' | 'admin';
  setCurrentView: (view: 'home' | 'portal' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenQuickBug,
  currentView,
  setCurrentView
}) => {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo */}
          <div
            onClick={() => {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                  ROHIT<span className="text-indigo-600 dark:text-cyan-400"> WEB STUDIO</span>
                </span>
                <span className="hidden sm:inline-flex text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
                  Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Web Development • Bug Fixing • Cloud
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            <button
              onClick={() => handleNavClick('services')}
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors"
            >
              Services
            </button>
            <button
              onClick={() => handleNavClick('bug-triage')}
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5"
            >
              <Bug className="w-4 h-4 text-rose-500" />
              Bug Triage
            </button>
            <button
              onClick={() => handleNavClick('portfolio')}
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors"
            >
              Portfolio
            </button>
            <button
              onClick={() => handleNavClick('why-us')}
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors"
            >
              Why Us
            </button>
            <button
              onClick={() => handleNavClick('testimonials')}
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors"
            >
              Reviews
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors"
            >
              Contact
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Dark/Light Mode"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Quick Emergency Bug Button */}
            <button
              onClick={onOpenQuickBug}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              Fix My Bug
            </button>

            {/* Authenticated State vs Login */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <button
                    onClick={() => setCurrentView(currentView === 'admin' ? 'home' : 'admin')}
                    className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all ${
                      currentView === 'admin'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/30'
                        : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span className="hidden sm:inline">Admin</span> Dashboard
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentView(currentView === 'portal' ? 'home' : 'portal')}
                    className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all ${
                      currentView === 'portal'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-blue-500" />
                    <span className="hidden sm:inline">Client</span> Portal
                  </button>
                )}

                {/* User menu / Signout */}
                <div className="flex items-center pl-2 border-l border-slate-200 dark:border-slate-800">
                  <div className="text-right hidden md:block mr-2">
                    <p className="text-xs font-medium text-slate-900 dark:text-white truncate max-w-[120px]">
                      {userProfile?.displayName || currentUser.email?.split('@')[0]}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      {isAdmin ? 'ADMIN' : 'CLIENT'}
                    </p>
                  </div>
                  <button
                    onClick={() => logout()}
                    title="Sign Out"
                    className="p-2 text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login', 'customer')}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                >
                  Client Portal
                </button>
                <button
                  onClick={() => onOpenAuth('login', 'admin')}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-md shadow-indigo-600/25 transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin Login
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleNavClick('services')}
              className="text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              Services
            </button>
            <button
              onClick={() => handleNavClick('bug-triage')}
              className="text-left px-3 py-2 text-sm font-medium rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-1.5"
            >
              <Bug className="w-4 h-4" /> Bug Triage
            </button>
            <button
              onClick={() => handleNavClick('portfolio')}
              className="text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              Portfolio
            </button>
            <button
              onClick={() => handleNavClick('why-us')}
              className="text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              Why Us
            </button>
            <button
              onClick={() => handleNavClick('testimonials')}
              className="text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              Reviews
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className="text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              Contact
            </button>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenQuickBug();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl bg-rose-500 text-white shadow-md shadow-rose-500/25"
            >
              <Bug className="w-4 h-4" /> Emergency Bug Fix Ticket
            </button>

            {!currentUser && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login', 'customer');
                  }}
                  className="py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-center"
                >
                  Customer Login
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login', 'admin');
                  }}
                  className="py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white text-center"
                >
                  Admin Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
