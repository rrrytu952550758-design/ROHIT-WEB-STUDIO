import React from 'react';
import {
  ShieldAlert,
  Zap,
  Lock,
  GitPullRequest,
  HeartHandshake,
  Cpu
} from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const points = [
    {
      icon: Zap,
      title: 'Rapid Forensics & Fix Deployments',
      description: 'We don’t guess or patch randomly. We isolate the root error in a test container, replicate the issue, and deploy tested solutions with zero production downtime.'
    },
    {
      icon: Lock,
      title: 'Zero Secrets Exposure & Strict NDA',
      description: 'Your server credentials, API tokens, and user records remain strictly protected. We work via scoped permissions, temporary tokens, and secure branches.'
    },
    {
      icon: GitPullRequest,
      title: 'Clean Git Commits & Full Transparency',
      description: 'Every bug resolution includes a clean pull request, detailed diff explanation, and root-cause analysis report so your in-house team knows exactly what was fixed.'
    },
    {
      icon: ShieldAlert,
      title: 'Post-Fix 14-Day Warranty',
      description: 'If the exact same issue re-emerges or causes a regression within two weeks of deployment, our engineers resolve it immediately at zero additional cost.'
    },
    {
      icon: Cpu,
      title: 'Modern Architecture Specialists',
      description: 'From React 19 and Next.js App Router to Node.js microservices, WordPress internals, and cloud databases, we understand full-stack performance deeply.'
    },
    {
      icon: HeartHandshake,
      title: 'Direct Senior Engineer Communication',
      description: 'No bureaucratic account managers. You speak directly with the engineers diagnosing, writing code, and deploying fixes to your platform.'
    }
  ];

  return (
    <section id="why-us" className="py-20 bg-slate-50/60 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Why Founders & CTOs Trust Us</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            The Studio Standard: Flawless Code & Rapid Resolution
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            We treat your production uptime and software performance as mission-critical. Here is how Rohit Web Studio operates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {points.map((point, index) => {
            const Icon = point.icon;
            return (
              <div
                key={index}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 hover:border-indigo-500/30 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800 text-indigo-600 dark:text-cyan-400 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {point.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {point.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
