/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { testConnection, db } from './firebase';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import {
  DEFAULT_SERVICES,
  DEFAULT_HERO_CONTENT,
  DEFAULT_PORTFOLIO,
  DEFAULT_TESTIMONIALS
} from './data/defaultData';
import { ServiceItem, CMSContentState } from './types';

// Components
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { BugTriageSection } from './components/BugTriageSection';
import { ServicesSection } from './components/ServicesSection';
import { PortfolioSection } from './components/PortfolioSection';
import { WhyChooseUs } from './components/WhyChooseUs';
import { TestimonialsSection } from './components/TestimonialsSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { QuickBugReportModal } from './components/QuickBugReportModal';
import { AuthModal } from './components/AuthModal';
import { CustomerDashboard } from './components/CustomerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Bug, Sparkles, X, ChevronRight } from 'lucide-react';

function StudioApp() {
  const { currentUser, isAdmin } = useAuth();

  const [currentView, setCurrentView] = useState<'home' | 'portal' | 'admin'>('home');

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [authModalRole, setAuthModalRole] = useState<'customer' | 'admin'>('customer');

  const [isQuickBugModalOpen, setIsQuickBugModalOpen] = useState(false);
  const [quickBugInitialIssue, setQuickBugInitialIssue] = useState<string>('');

  const [selectedServiceForInquiry, setSelectedServiceForInquiry] = useState<ServiceItem | null>(null);

  // Firestore Live Services
  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);

  // CMS Content
  const [cmsContent, setCmsContent] = useState<CMSContentState>({
    hero: DEFAULT_HERO_CONTENT,
    portfolio: DEFAULT_PORTFOLIO,
    testimonials: DEFAULT_TESTIMONIALS,
    announcement: {
      enabled: true,
      text: '⚡ Need an emergency bug fix? Rohit Web Studio engineers are on call 24/7 with < 2 hour response SLA.',
      linkText: 'Report Bug',
      linkUrl: '#bug-triage'
    }
  });

  const [dismissAnnouncement, setDismissAnnouncement] = useState(false);

  // Test Firestore Connection on boot
  useEffect(() => {
    testConnection();
  }, []);

  // Sync services from Firestore
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'services'),
      (snapshot) => {
        if (!snapshot.empty) {
          const items: ServiceItem[] = [];
          snapshot.forEach((d) => items.push({ id: d.id, ...(d.data() as any) }));
          items.sort((a, b) => (a.orderIndex || 99) - (b.orderIndex || 99));
          setServices(items);
        } else {
          setServices(DEFAULT_SERVICES);
        }
      },
      () => {
        // Fallback to default services on rule error
        setServices(DEFAULT_SERVICES);
      }
    );

    return () => unsub();
  }, []);

  // Sync CMS from Firestore
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'cmsContent', 'main'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data?.content) {
            setCmsContent(data.content as CMSContentState);
          }
        }
      },
      () => {
        // Fallback to defaults
      }
    );

    return () => unsub();
  }, []);

  const handleOpenAuth = (defaultTab: 'login' | 'register' = 'login', defaultRole: 'customer' | 'admin' = 'customer') => {
    setAuthModalTab(defaultTab);
    setAuthModalRole(defaultRole);
    setIsAuthModalOpen(true);
  };

  const handleOpenQuickBug = (initialIssue: string = '') => {
    setQuickBugInitialIssue(initialIssue);
    setIsQuickBugModalOpen(true);
  };

  const handleSelectService = (service: ServiceItem) => {
    setSelectedServiceForInquiry(service);
    const contactEl = document.getElementById('contact');
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollTo = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Global Announcement Ribbon */}
      {cmsContent.announcement?.enabled && !dismissAnnouncement && (
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-700 to-blue-800 text-white text-xs px-4 py-2 border-b border-indigo-500/20 flex items-center justify-between z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-1 text-center font-medium">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
            <span className="truncate">{cmsContent.announcement.text}</span>
            <button
              onClick={() => handleOpenQuickBug('Emergency Incident')}
              className="hidden sm:inline-flex items-center gap-1 font-bold underline hover:text-cyan-300 ml-1 cursor-pointer"
            >
              <span>{cmsContent.announcement.linkText || 'Report Bug Now'}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <button
            onClick={() => setDismissAnnouncement(true)}
            aria-label="Dismiss banner"
            className="p-1 hover:bg-white/10 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        onOpenQuickBug={() => handleOpenQuickBug('Emergency Bug')}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {/* View Switcher: Home vs Customer Portal vs Admin Dashboard */}
      {currentView === 'portal' ? (
        <CustomerDashboard
          onOpenQuickBug={() => handleOpenQuickBug('Client Portal Request')}
          onBackToHome={() => setCurrentView('home')}
        />
      ) : currentView === 'admin' ? (
        <AdminDashboard
          onBackToHome={() => setCurrentView('home')}
          cmsContent={cmsContent}
          onUpdateCMS={setCmsContent}
        />
      ) : (
        /* Standard Studio Website */
        <main className="flex-1">
          {/* Hero Section */}
          <Hero
            content={cmsContent.hero}
            onOpenQuickBug={handleOpenQuickBug}
            onScrollTo={handleScrollTo}
          />

          {/* Interactive Bug Triage Estimator */}
          <BugTriageSection onOpenQuickBug={handleOpenQuickBug} />

          {/* Services & Pricing Section */}
          <ServicesSection
            services={services}
            onSelectService={handleSelectService}
            onOpenQuickBug={() => handleOpenQuickBug('Bug Fixing Service')}
          />

          {/* Portfolio & Case Studies */}
          <PortfolioSection portfolio={cmsContent.portfolio} />

          {/* Why Choose Rohit Web Studio */}
          <WhyChooseUs />

          {/* Verified Testimonials */}
          <TestimonialsSection testimonials={cmsContent.testimonials} />

          {/* Contact & Inquiries */}
          <ContactSection
            selectedService={selectedServiceForInquiry}
            onClearSelectedService={() => setSelectedServiceForInquiry(null)}
          />
        </main>
      )}

      {/* Footer */}
      {currentView === 'home' && (
        <Footer
          onOpenAuth={handleOpenAuth}
          onOpenQuickBug={() => handleOpenQuickBug('Footer Quick Report')}
          onNavigate={handleScrollTo}
          onOpenAdmin={() => {
            if (isAdmin) {
              setCurrentView('admin');
            } else {
              handleOpenAuth('login', 'admin');
            }
          }}
        />
      )}

      {/* Floating Emergency Bug Trigger Widget */}
      {currentView === 'home' && (
        <aside aria-label="Emergency Bug Desk" className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => handleOpenQuickBug('Urgent Website Down')}
            className="group flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs shadow-2xl shadow-rose-600/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-rose-400/30"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
            </span>
            <Bug className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">Emergency Bug Hotline</span>
            <span className="sm:hidden">Report Bug</span>
          </button>
        </aside>
      )}

      {/* Quick Bug Report Modal */}
      <QuickBugReportModal
        isOpen={isQuickBugModalOpen}
        onClose={() => setIsQuickBugModalOpen(false)}
        initialIssueType={quickBugInitialIssue}
        onViewPortal={() => {
          setIsQuickBugModalOpen(false);
          setCurrentView('portal');
        }}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
        initialRole={authModalRole}
        onSuccess={(role) => {
          if (role === 'admin') {
            setCurrentView('admin');
          } else {
            setCurrentView('portal');
          }
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StudioApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
