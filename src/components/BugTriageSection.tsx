import React, { useState } from 'react';
import {
  Bug,
  ShieldCheck,
  Zap,
  Clock,
  ArrowRight,
  Flame,
  CheckCircle,
  AlertTriangle,
  Server,
  Smartphone,
  CreditCard,
  Database
} from 'lucide-react';

interface BugTriageSectionProps {
  onOpenQuickBug: (initialIssueType?: string) => void;
}

export const BugTriageSection: React.FC<BugTriageSectionProps> = ({ onOpenQuickBug }) => {
  const [selectedIssue, setSelectedIssue] = useState('Payment Gateway / Checkout Error');
  const [urgencyLevel, setUrgencyLevel] = useState<'critical' | 'high' | 'medium'>('critical');
  const [stack, setStack] = useState('React / Node.js');

  const issuePresets = [
    { name: '500 Internal Server Crash', icon: Server, basePrice: '$89', eta: '60-90 Mins' },
    { name: 'Payment Gateway / Checkout Error', icon: CreditCard, basePrice: '$99', eta: '45-75 Mins' },
    { name: 'Database Lockup / Connection Lost', icon: Database, basePrice: '$110', eta: '60-120 Mins' },
    { name: 'Mobile Layout / Broken CSS', icon: Smartphone, basePrice: '$59', eta: '30-60 Mins' },
    { name: 'White Screen of Death / Plugin Crash', icon: Flame, basePrice: '$79', eta: '45-90 Mins' },
    { name: 'API Latency / 504 Gateway Timeout', icon: AlertTriangle, basePrice: '$89', eta: '60-90 Mins' }
  ];

  const currentPreset = issuePresets.find(p => p.name === selectedIssue) || issuePresets[0];

  return (
    <section id="bug-triage" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-radial from-rose-900/20 via-slate-900/60 to-slate-950 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>24/7 Rapid Incident Response</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Interactive Bug Triage & Cost Estimator
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Select your emergency below to calculate guaranteed turnaround time and initiate an instant triage dispatch.
          </p>
        </div>

        {/* Interactive Estimator Layout */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Controls (7 cols) */}
          <div className="lg:col-span-7 bg-slate-950/80 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6">
            {/* Step 1: Issue Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                1. Select Current Incident / Bug Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {issuePresets.map(preset => {
                  const Icon = preset.icon;
                  const isSelected = selectedIssue === preset.name;
                  return (
                    <button
                      key={preset.name}
                      onClick={() => setSelectedIssue(preset.name)}
                      className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-rose-500/15 border-rose-500/80 text-white shadow-md shadow-rose-500/10'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-rose-400' : 'text-slate-500'}`} />
                        <span>{preset.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Urgency */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                2. SLA & Urgency Preference
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'critical', label: 'Critical Incident', sub: 'Starts within 15m' },
                  { id: 'high', label: 'High Urgency', sub: 'Starts within 2h' },
                  { id: 'medium', label: 'Standard Queue', sub: 'Starts today' },
                ].map(u => (
                  <button
                    key={u.id}
                    onClick={() => setUrgencyLevel(u.id as any)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      urgencyLevel === u.id
                        ? 'bg-indigo-600/20 border-cyan-400 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{u.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{u.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Platform */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                3. Your Technology Stack
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'React / Next.js',
                  'WordPress / PHP',
                  'Node.js / Express',
                  'Shopify / Liquid',
                  'Vue / Nuxt',
                  'Python / Django',
                  'Pure HTML / CSS'
                ].map(tech => (
                  <button
                    key={tech}
                    onClick={() => setStack(tech)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                      stack === tech
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time Triage Summary (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/60 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                Target Resolution Plan
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ENGINEER ON CALL
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-400">Selected Incident:</span>
                <p className="text-base font-bold text-white mt-0.5">{selectedIssue}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-800/80">
                <div>
                  <span className="text-xs text-slate-400">Target Tech:</span>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5">{stack}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Est. Turnaround:</span>
                  <p className="text-sm font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                    {currentPreset.eta}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400">Estimated Diagnostic Fee:</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold font-mono text-white">
                    {currentPreset.basePrice}
                  </span>
                  <span className="text-xs text-slate-400">fixed first phase</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300 pt-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Code diagnosis and reproduction in isolated sandbox</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Tested pull-request or direct live deploy</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>14-day zero regression warranty guarantee</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenQuickBug(`[${urgencyLevel.toUpperCase()}] ${selectedIssue} on ${stack}`)}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              <Bug className="w-4 h-4" />
              <span>Dispatch Ticket to Lead Engineer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
