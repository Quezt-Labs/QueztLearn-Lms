import { delay } from "./index";
import { Client, ClientHomepage } from "@/lib/types/client";

// Mock client data
const mockClients: Client[] = [
  {
    id: "khan-academy",
    name: "Khan Academy",
    domain: "khanacademy.queztlearn.in",
    subdomain: "khanacademy",
    basePath: "queztlearn",
    logo: "/logos/khan-academy.png",
    primaryColor: "#14B8A6", // Teal
    secondaryColor: "#0F766E",
    theme: "light",
    isActive: true,
    createdAt: new Date("2024-01-15"),
    settings: {
      allowSelfRegistration: true,
      maxUsers: 10000,
      features: ["analytics", "custom_branding", "api_access"],
      customBranding: true,
      customDomain: true,
      analytics: true,
      apiAccess: true,
    },
  },
  {
    id: "mit",
    name: "MIT",
    domain: "mit.queztlearn.in",
    subdomain: "mit",
    basePath: "queztlearn",
    logo: "/logos/mit.png",
    primaryColor: "#DC2626", // Red
    secondaryColor: "#991B1B",
    theme: "dark",
    isActive: true,
    createdAt: new Date("2024-02-01"),
    settings: {
      allowSelfRegistration: false,
      maxUsers: 5000,
      features: ["analytics", "custom_branding"],
      customBranding: true,
      customDomain: true,
      analytics: true,
      apiAccess: false,
    },
  },
  {
    id: "stanford",
    name: "Stanford University",
    domain: "stanford.queztlearn.in",
    subdomain: "stanford",
    basePath: "queztlearn",
    logo: "/logos/stanford.png",
    primaryColor: "#7C3AED", // Purple
    secondaryColor: "#5B21B6",
    theme: "system",
    isActive: true,
    createdAt: new Date("2024-01-20"),
    settings: {
      allowSelfRegistration: true,
      maxUsers: 15000,
      features: [
        "analytics",
        "custom_branding",
        "api_access",
        "advanced_analytics",
      ],
      customBranding: true,
      customDomain: true,
      analytics: true,
      apiAccess: true,
    },
  },
];

// Mock homepage data
const mockHomepages: ClientHomepage[] = [
  {
    clientId: "khan-academy",
    title: "Khan Academy Learning Platform",
    tagline: "Free, world-class education for anyone, anywhere",
    description:
      "Join millions of learners worldwide in our mission to provide free, world-class education for anyone, anywhere.",
    heroImage: "/images/khan-hero.jpg",
    features: [
      {
        id: "1",
        title: "Personalized Learning",
        description: "Adaptive learning paths that adjust to your pace",
        icon: "brain",
      },
      {
        id: "2",
        title: "Expert Content",
        description: "High-quality educational content from experts",
        icon: "graduation-cap",
      },
      {
        id: "3",
        title: "Progress Tracking",
        description: "Track your learning journey with detailed analytics",
        icon: "chart-line",
      },
    ],
    testimonials: [
      {
        id: "1",
        name: "Sarah Johnson",
        role: "Student",
        content:
          "Khan Academy helped me master calculus when I was struggling in class.",
        avatar: "/avatars/sarah.jpg",
      },
    ],
    ctaText: "Start Learning Today",
    ctaLink: "/login",
  },
  {
    clientId: "mit",
    title: "MIT OpenCourseWare",
    tagline: "Knowledge is power. Information is liberating.",
    description:
      "Access MIT's course materials and educational resources for free.",
    heroImage: "/images/mit-hero.jpg",
    features: [
      {
        id: "1",
        title: "MIT Quality",
        description: "Access to MIT's world-renowned course materials",
        icon: "university",
      },
      {
        id: "2",
        title: "Self-Paced Learning",
        description: "Learn at your own pace with flexible scheduling",
        icon: "clock",
      },
      {
        id: "3",
        title: "Research Integration",
        description: "Connect with cutting-edge research and innovation",
        icon: "microscope",
      },
    ],
    testimonials: [
      {
        id: "1",
        name: "Dr. Alex Chen",
        role: "Researcher",
        content:
          "MIT's open courseware has been invaluable for my research work.",
        avatar: "/avatars/alex.jpg",
      },
    ],
    ctaText: "Explore Courses",
    ctaLink: "/login",
  },
  {
    clientId: "stanford",
    title: "Stanford Business School",
    tagline: "Transform your career with world-class business education",
    description:
      "Join Stanford's prestigious business education program and advance your career.",
    heroImage: "/images/stanford-hero.jpg",
    features: [
      {
        id: "1",
        title: "Executive Education",
        description: "Advanced business programs for working professionals",
        icon: "briefcase",
      },
      {
        id: "2",
        title: "Case Studies",
        description: "Real-world business cases from top companies",
        icon: "file-chart",
      },
      {
        id: "3",
        title: "Networking",
        description: "Connect with industry leaders and alumni",
        icon: "users",
      },
    ],
    testimonials: [
      {
        id: "1",
        name: "Michael Rodriguez",
        role: "Executive",
        content: "Stanford's program transformed my leadership approach.",
        avatar: "/avatars/michael.jpg",
      },
    ],
    ctaText: "Apply Now",
    ctaLink: "/login",
  },
];

export const clientApi = {
  // Get client by domain
  async getClientByDomain(
    domain: string
  ): Promise<{ data: Client | null; success: boolean }> {
    await delay(300);
    const client = mockClients.find((c) => c.domain === domain);
    return {
      data: client || null,
      success: true,
    };
  },

  // Get client by subdomain
  async getClientBySubdomain(
    subdomain: string
  ): Promise<{ data: Client | null; success: boolean }> {
    await delay(300);
    const client = mockClients.find((c) => c.subdomain === subdomain);
    return {
      data: client || null,
      success: true,
    };
  },

  // Get client homepage
  async getClientHomepage(
    clientId: string
  ): Promise<{ data: ClientHomepage | null; success: boolean }> {
    await delay(400);
    const homepage = mockHomepages.find((h) => h.clientId === clientId);
    return {
      data: homepage || null,
      success: true,
    };
  },

  // Get all clients (admin only)
  async getAllClients(): Promise<{ data: Client[]; success: boolean }> {
    await delay(500);
    return {
      data: mockClients,
      success: true,
    };
  },

  // Create new client
  async createClient(
    clientData: Omit<Client, "id" | "createdAt">
  ): Promise<{ data: Client; success: boolean }> {
    await delay(1000);
    const newClient: Client = {
      ...clientData,
      id: `client-${Date.now()}`,
      createdAt: new Date(),
    };
    mockClients.push(newClient);
    return {
      data: newClient,
      success: true,
    };
  },

  // Update client
  async updateClient(
    clientId: string,
    updates: Partial<Client>
  ): Promise<{ data: Client | null; success: boolean }> {
    await delay(600);
    const clientIndex = mockClients.findIndex((c) => c.id === clientId);
    if (clientIndex === -1) {
      return { data: null, success: false };
    }

    mockClients[clientIndex] = { ...mockClients[clientIndex], ...updates };
    return {
      data: mockClients[clientIndex],
      success: true,
    };
  },
};
