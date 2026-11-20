import React, { useState } from 'react';
import { HeroContent } from '../types';
import {
  Bug,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  Terminal,
  AlertTriangle,
  Flame,
  Layers,
  Wrench
} from 'lucide-react';

interface HeroProps {
  content: HeroContent;
  onOpenQuickBug: (initialIssueType?: string) => void;
  onScrollTo: (sectionId: string) => void;
}

const COMMON_ISSUES = [
  { label: '500 Server Crash', icon: AlertTriangle, eta: '90 Mins', tech: 'Node / PHP / Python' },
  { label: 'Broken Checkout / Stripe', icon: Zap, eta: '60 Mins', tech: 'E-Commerce / API' },
  { label: 'WordPress White Screen', icon: Flame, eta: '45 Mins', tech: 'PHP / MySQL / WP' },
  { label: 'Mobile CSS Glitch', icon: Layers, eta: '30 Mins', tech: 'Tailwind / CSS' },
  { label: 'Hydration & React Crash', icon: Wrench, eta: '60 Mins', tech: 'Next.js / React' }
];

export const Hero: React.FC<HeroProps> = ({ content, onOpenQuickBug, onScrollTo }) => {
  const [selectedIssue, setSelectedIssue] = useState<string>(COMMON_ISSUES[0].label);

  const activeIssueObj = COMMON_ISSUES.find(i => i.label === selectedIssue) || COMMON_ISSUES[0];

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-200 dark:border-slate-800/80 bg-radial from-indigo-50/50 via-slate-50 to-white dark:from-slate-900/60 dark:via-slate-950 dark:to-slate-950">
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-40 dark:opacity-20 blur-3xl overflow-hidden">
        <div className="w-[600px] h-[300px] bg-gradient-to-tr from-indigo-500 via-cyan-400 to-rose-400 rounded-full mx-auto" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Main Copy (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 text-indigo-700 dark:text-cyan-300 text-xs font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{content.badgeText}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600 dark:text-slate-400 font-normal">Available Now</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              {content.headline}{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 dark:from-indigo-400 dark:via-cyan-300 dark:to-teal-300 bg-clip-text text-transparent">
                {content.highlightedText}
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {content.subheadline}
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => onOpenQuickBug(selectedIssue)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 shadow-lg shadow-rose-600/30 hover:shadow-rose-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Bug className="w-4 h-4 text-white" />
                <span>{content.primaryCta}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onScrollTo('services')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-indigo-500 dark:text-cyan-400" />
                <span>{content.secondaryCta}</span>
              </button>
            </div>

            {/* Trust bullet features */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                No Fix, No Charge Guarantee
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                100% Non-Disclosure Guaranteed
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-500" />
                Under 2h First Response
              </span>
            </div>
          </div>

          {/* Interactive Rapid Triage Terminal Widget (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900 dark:bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl p-6 text-slate-200 backdrop-blur-md relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5 ml-2">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    rohit-studio/rapid-triage.sh
                  </span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  LIVE STATUS: READY
                </span>
              </div>

              <p className="text-xs text-slate-300 font-medium mb-3">
                Select your critical bug type for instant triage ETA:
              </p>

              {/* Bug Type Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {COMMON_ISSUES.map(issue => {
                  const Icon = issue.icon;
                  const isSelected = selectedIssue === issue.label;
                  return (
                    <button
                      key={issue.label}
                      onClick={() => setSelectedIssue(issue.label)}
                      className={`text-left p-2.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600/20 border-cyan-400/60 text-white shadow-sm shadow-cyan-500/10'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <span className="truncate">{issue.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Selection Diagnostics Preview */}
              <div className="bg-slate-950/70 rounded-xl p-3.5 border border-slate-800/80 mb-4 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Target Issue:</span>
                  <span className="text-cyan-300 font-semibold">{activeIssueObj.label}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Target Stacks:</span>
                  <span className="text-slate-300">{activeIssueObj.tech}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Target Turnaround:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {activeIssueObj.eta}
                  </span>
                </div>
              </div>

              {/* Action Button inside Terminal */}
              <button
                onClick={() => onOpenQuickBug(selectedIssue)}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/30"
              >
                <span>Launch Triage for "{selectedIssue}"</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="mt-14 pt-8 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6">
          {content.stats.map((stat, idx) => (
            <div key={idx} className="space-y-1 text-center md:text-left">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-300 dark:to-cyan-300 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {stat.label}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
