export interface Client {
  id: string;
  name: string;
  domain: string; // e.g., "khanacademy.queztlearn.in"
  subdomain: string; // e.g., "khanacademy"
  basePath: string; // e.g., "queztlearn"
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  theme: "light" | "dark" | "system";
  isActive: boolean;
  createdAt: Date;
  settings: ClientSettings;
}

export interface ClientSettings {
  allowSelfRegistration: boolean;
  maxUsers: number;
  features: string[];
  customBranding: boolean;
  customDomain: boolean;
  analytics: boolean;
  apiAccess: boolean;
}

export interface ClientHomepage {
  clientId: string;
  title: string;
  tagline: string;
  description: string;
  heroImage: string;
  features: HomepageFeature[];
  testimonials: Testimonial[];
  ctaText: string;
  ctaLink: string;
}

export interface HomepageFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  avatar: string;
}
