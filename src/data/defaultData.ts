import { ServiceItem, PortfolioItem, TestimonialItem, HeroContent } from '../types';

export const BOOTSTRAP_ADMIN_EMAIL = 'rrrytu952550758@gmail.com';

export const DEFAULT_HERO_CONTENT: HeroContent = {
  badgeText: '⚡ Urgent Bug Fixes & Full-Stack Web Studio',
  headline: 'Engineering High-Performance Websites &',
  highlightedText: 'Rapid Bug Fixing',
  subheadline: 'ROHIT WEB STUDIO delivers cutting-edge web applications, bespoke UI/UX design, and 24/7 emergency bug fixes. We turn complex technical blockers into seamless digital experiences.',
  primaryCta: 'Request Emergency Bug Fix',
  secondaryCta: 'Explore Studio Services',
  stats: [
    { label: 'Bug Fix Turnaround', value: '< 2 Hours', description: 'Average response time for critical issues' },
    { label: 'Projects Delivered', value: '250+', description: 'Across SaaS, E-Commerce & Web Platforms' },
    { label: 'Issue Resolution Rate', value: '99.8%', description: 'Guaranteed zero-regression fixes' },
    { label: 'Client Satisfaction', value: '4.98/5', description: 'From 180+ verified worldwide founders' },
  ]
};

export const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: 'srv-bug-fix',
    title: 'Emergency Bug Fixing & Code Debugging',
    category: 'Bug Fixing',
    description: 'Immediate deep-dive code diagnosis and hotfix deployment for broken production sites, 500 server crashes, responsive layout errors, database lockups, and API failures.',
    price: 'Starting at $79',
    turnaround: '2 - 6 Hours',
    features: [
      'Root cause forensic analysis & report',
      'Immediate staging test & zero-downtime hotfix',
      'Browser & mobile regression testing',
      'Post-fix 14-day warranty guarantee',
      'Database & security checkup'
    ],
    badge: 'Most Urgent',
    isActive: true,
    orderIndex: 1
  },
  {
    id: 'srv-fullstack-dev',
    title: 'Custom Full-Stack Web Development',
    category: 'Development',
    description: 'High-speed, scalable web applications built with React, Next.js, TypeScript, Tailwind CSS, Node.js, and modern cloud databases.',
    price: 'Starting at $1,200',
    turnaround: '1 - 3 Weeks',
    features: [
      'Tailored clean architecture & TypeScript codebase',
      'Role-based access control & secure Auth',
      'Full API integrations & webhook handlers',
      'High-converting responsive design',
      'SEO & OpenGraph optimization'
    ],
    badge: 'Popular',
    isActive: true,
    orderIndex: 2
  },
  {
    id: 'srv-perf-optimization',
    title: 'Speed, Core Web Vitals & SEO Optimization',
    category: 'Performance',
    description: 'Supercharge your site speed to score 95+ on Google PageSpeed Insights, reduce bundle sizes, optimize hydration, and skyrocket organic rankings.',
    price: 'Starting at $299',
    turnaround: '2 - 3 Days',
    features: [
      'Image & script asset optimization',
      'Lighthouse 90+ Score guarantee',
      'Server caching & CDN configuration',
      'Database query indexing',
      'Structured schema markup (JSON-LD)'
    ],
    badge: 'High ROI',
    isActive: true,
    orderIndex: 3
  },
  {
    id: 'srv-ui-ux-redesign',
    title: 'Modern UI/UX Redesign & Frontend Polish',
    category: 'Design & Frontend',
    description: 'Transform dated interfaces into sleek, world-class digital experiences with smooth micro-interactions, dark mode, and pixel-perfect mobile polish.',
    price: 'Starting at $650',
    turnaround: '4 - 7 Days',
    features: [
      'Figma-to-code precision conversion',
      'Dark/Light mode seamless architecture',
      'Fluid micro-animations with Motion',
      'Accessibility (WCAG 2.1) compliance',
      'Design system & reusable component library'
    ],
    badge: 'Design Award Quality',
    isActive: true,
    orderIndex: 4
  },
  {
    id: 'srv-api-integrations',
    title: 'Third-Party API & Payment Gateway Integrations',
    category: 'Integration',
    description: 'Flawless integrations for Stripe, PayPal, Firebase, Supabase, SendGrid, Twilio, OpenAI/Gemini, and custom REST/GraphQL endpoints.',
    price: 'Starting at $249',
    turnaround: '1 - 2 Days',
    features: [
      'End-to-end webhook validation & queueing',
      'Secure token storage & OAuth workflows',
      'Sandbox testing & production verification',
      'Error handling & automated retry logic'
    ],
    isActive: true,
    orderIndex: 5
  },
  {
    id: 'srv-monthly-maintenance',
    title: 'Monthly Dedicated Retainer & Bug Guard',
    category: 'Retainer',
    description: 'Peace of mind with 24/7 site health monitoring, monthly dependency updates, automated backups, and 10 hours of included on-demand development.',
    price: 'Starting at $450/mo',
    turnaround: 'Immediate Priority',
    features: [
      'Priority ticket response under 30 minutes',
      'Security patch monitoring & regular updates',
      'Daily cloud backups & uptime tracking',
      'Dedicated Slack/WhatsApp support channel'
    ],
    badge: 'Enterprise Peace of Mind',
    isActive: true,
    orderIndex: 6
  }
];

export const DEFAULT_PORTFOLIO: PortfolioItem[] = [
  {
    id: 'port-1',
    title: 'ApexCloud SaaS Dashboard & Billing Engine',
    category: 'Full-Stack Web App',
    description: 'Built a high-throughput SaaS management platform with multi-tenant workspace isolation, Stripe subscription billing, and real-time telemetry graphs.',
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'PostgreSQL'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    liveUrl: 'https://example.com/apexcloud',
    resultsMetric: '+320% User Signups & 99.99% Uptime'
  },
  {
    id: 'port-2',
    title: 'Luxora Designer E-Commerce & Checkout Rescue',
    category: 'Bug Fixing & Optimization',
    description: 'Resolved critical cart abandonment race conditions, reduced mobile page load from 4.8s to 0.9s, and fixed checkout payment gateway timeout errors.',
    techStack: ['Next.js', 'Shopify Storefront API', 'Tailwind', 'Stripe'],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    liveUrl: 'https://example.com/luxora',
    resultsMetric: '$84,000+ In Recovered Abandoned Carts'
  },
  {
    id: 'port-3',
    title: 'HealthPulse Telemedicine Consultation Portal',
    category: 'Custom Web Platform',
    description: 'Engineered HIPAA-compliant client appointment portal with real-time video consult integration, interactive intake forms, and automated SMS reminders.',
    techStack: ['React', 'WebRTC', 'Firebase Firestore', 'Tailwind CSS'],
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    liveUrl: 'https://example.com/healthpulse',
    resultsMetric: 'Over 12,000 Patient Sessions Conducted'
  },
  {
    id: 'port-4',
    title: 'Zenith Logistics Global Tracking Platform',
    category: 'Real-Time Web System',
    description: 'Replaced a laggy legacy dispatch dashboard with an event-driven map interface, live GPS vehicle tracking, and automated delivery status triggers.',
    techStack: ['React', 'TypeScript', 'Socket.io', 'Mapbox', 'Tailwind CSS'],
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    liveUrl: 'https://example.com/zenith',
    resultsMetric: '52% Reduction In Dispatch Dispatch Delays'
  }
];

export const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'test-1',
    name: 'Sarah Jenkins',
    role: 'CTO',
    company: 'Veloce Digital Media',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    content: 'Our main checkout failed during our Black Friday marketing push. Rohit Web Studio diagnosed the race condition and pushed a tested fix within 90 minutes. They literally saved our company quarter!',
    rating: 5,
    projectType: 'Emergency Bug Fixing'
  },
  {
    id: 'test-2',
    name: 'Marcus Sterling',
    role: 'Founder & CEO',
    company: 'FinTrack Global',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    content: 'Working with Rohit Web Studio on our fintech portal was the smoothest development engagement in my 12 years of startup building. The architecture is clean, the UI is gorgeous, and the performance is blistering.',
    rating: 5,
    projectType: 'Full-Stack SaaS Platform'
  },
  {
    id: 'test-3',
    name: 'Elena Rostova',
    role: 'Head of Product',
    company: 'Nordic Clean Tech',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    content: 'They took our Lighthouse score from 34 to 98 and completely modernized our dark mode design. Our conversion rate increased by 28% in the first two weeks.',
    rating: 5,
    projectType: 'Speed & UI Redesign'
  }
];
