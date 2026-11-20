export type UserRole = 'admin' | 'customer';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  company?: string;
  phone?: string;
  createdAt?: string;
}

export interface ServiceItem {
  id?: string;
  title: string;
  category: string;
  description: string;
  price: string;
  turnaround: string;
  features: string[];
  badge?: string;
  isActive: boolean;
  orderIndex?: number;
  updatedAt?: string;
}

export type BugUrgency = 'low' | 'medium' | 'high' | 'critical';

export type BugStatus = 'pending' | 'analyzing' | 'in_progress' | 'ready_for_test' | 'resolved' | 'closed';

export interface BugRequest {
  id?: string;
  title: string;
  description: string;
  websiteUrl?: string;
  environment: string; // e.g. React/Vite, Next.js, WordPress, Shopify, Node.js API, Laravel, Other
  urgency: BugUrgency;
  errorLogs?: string;
  reproductionSteps?: string;
  status: BugStatus;
  adminNotes?: string;
  resolutionSummary?: string;
  customerId: string;
  customerEmail: string;
  customerName?: string;
  quoteEstimate?: string;
  createdAt: string;
  updatedAt?: string;
}

export type InquiryStatus = 'new' | 'reviewed' | 'replied' | 'archived';

export interface CustomerInquiry {
  id?: string;
  name: string;
  email: string;
  subject?: string;
  serviceCategory?: string;
  budget?: string;
  message: string;
  status: InquiryStatus;
  adminReply?: string;
  createdAt: string;
}

export interface HeroContent {
  badgeText: string;
  headline: string;
  highlightedText: string;
  subheadline: string;
  primaryCta: string;
  secondaryCta: string;
  stats: {
    label: string;
    value: string;
    description: string;
  }[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  description: string;
  techStack: string[];
  image: string;
  liveUrl?: string;
  resultsMetric: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  rating: number;
  projectType: string;
}

export interface CMSContentState {
  hero: HeroContent;
  portfolio: PortfolioItem[];
  testimonials: TestimonialItem[];
  announcement: {
    enabled: boolean;
    text: string;
    linkText?: string;
    linkUrl?: string;
  };
}
