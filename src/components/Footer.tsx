import React from 'react';
import {
  Code2,
  Bug,
  ShieldCheck,
  CheckCircle,
  ArrowUp,
  Github,
  Twitter,
  Linkedin,
  Mail
} from 'lucide-react';

interface FooterProps {
  onOpenAuth: (defaultTab?: 'login' | 'register', defaultRole?: 'customer' | 'admin') => void;
  onOpenQuickBug: () => void;
  onNavigate: (sectionId: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAuth,
  onOpenQuickBug,
  onNavigate,
  onOpenAdmin
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Code2 className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                ROHIT<span className="text-cyan-400"> WEB STUDIO</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              Full-stack web engineering, custom digital product development, and 24/7 high-priority bug fixing. Zero-compromise reliability for mission-critical software.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                SYSTEMS OPERATIONAL • 24/7 ON-CALL DESK
              </span>
            </div>
          </div>

          {/* Studio Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Studio Services
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer text-left"
                >
                  Emergency Bug Fixing
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer text-left"
                >
                  Full-Stack Web Development
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer text-left"
                >
                  Core Web Vitals & Speed
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer text-left"
                >
                  Modern UI/UX Redesign
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer text-left"
                >
                  Monthly Retainer & Guard
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Bug Triage */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Emergency Desk
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onOpenQuickBug}
                  className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <Bug className="w-3.5 h-3.5" />
                  Report Critical Bug
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('bug-triage')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer text-left"
                >
                  Interactive Triage Calculator
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('why-us')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer text-left"
                >
                  14-Day Warranty Guarantee
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('testimonials')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer text-left"
                >
                  Client Reviews & Results
                </button>
              </li>
            </ul>
          </div>

          {/* Portals & Management */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Portals & Admin
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onOpenAuth('login', 'customer')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer text-left"
                >
                  Client Portal Sign In
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenAuth('register', 'customer')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer text-left"
                >
                  Create Client Account
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin Dashboard Login
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-cyan-400 transition-colors cursor-pointer text-left"
                >
                  Direct Inquiry Desk
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} ROHIT WEB STUDIO. All rights reserved. Built with precision and enterprise security.
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
